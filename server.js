// Atlas Vivo — API de contas, quizzes e gamificação, mais os arquivos estáticos de public/.
// Roda de dois jeitos: "npm start" (servidor local) ou como função do Vercel (api/index.js importa este módulo;
// lá os estáticos saem direto da CDN). Banco: PostgreSQL (Supabase), configurado pelas variáveis PG*.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const QUIZZES = require('./quizzes.js');
const { createCore, QUIZ_BONUS, instName, SIM_N, SIM_MAX, SIM_SECONDS } = require('./core.js');
const { loadBank } = require('./bank.js');

const PORT = +process.env.PORT || 8765;
const SESSION_DAYS = 30;
// Esquema próprio, fora do "public": no Supabase, tabelas do public ficam expostas pela API REST do projeto.
const SCHEMA = process.env.PGSCHEMA || 'atlasvivo';
if (!/^[a-z_][a-z0-9_]*$/.test(SCHEMA)) throw new Error('PGSCHEMA inválido');
if (!process.env.PGHOST || !process.env.PGPASSWORD) throw new Error('Faltam as variáveis PG* do banco: localmente, rode com "npm start" (lê o .env); no Vercel, defina-as no painel.');
const PUB = path.join(__dirname, 'public');

// Regras de pontuação, níveis e medalhas: core.js
// Estruturas do modelo 3D, para as questões respondidas clicando no modelo (kind: 'model').
const PARTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'atlas2', 'manifest.json'), 'utf8')).parts;
const PART_NAME = new Map(PARTS.map(p => [p.id, p.pt || p.n]));
const nm = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
for (const z of QUIZZES) for (const q of z.questions) if (q.kind === 'model') {
  const qs = q.target.q.map(nm);
  q.ids = PARTS.filter(p => p.s === q.target.sys && qs.some(x => nm(p.pt).includes(x) || nm(p.n).includes(x))).map(p => p.id);
  if (!q.ids.length) throw new Error('Questão ' + q.id + ': estrutura não encontrada no modelo.');
}
// Banco oficial de vestibular (questions/official). Só entram itens com direitos liberados e comentário autoral:
// bank.js recusa tudo o que não passou pelas três etapas do pipeline, e nunca lê staging/.
const BANK_DIR = process.env.ATLAS_BANK_DIR || path.join(__dirname, 'questions', 'official');
const LOOPBACK = /^(localhost|127\.0\.0\.1|\[?::1\]?)$/;
// Só para teste local: ATLAS_PREVIEW_BANK=1 carrega as questões reais SEM direitos liberados (tools/preview). Nunca no
// Vercel, em produção ou com banco que não seja local: lá só vale o que passou pelas três etapas.
let PREVIEW = null;
if (process.env.ATLAS_PREVIEW_BANK === '1') {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' || !LOOPBACK.test(process.env.PGHOST)) throw new Error('ATLAS_PREVIEW_BANK=1 só vale em desenvolvimento, com banco local (localhost, 127.0.0.1, ::1).');
  PREVIEW = require('./tools/preview/bank-preview.js').load();
  console.log(`Banco de PRÉ-VISUALIZAÇÃO: ${PREVIEW.bank.questions.length} questões reais sem direitos liberados (só em desenvolvimento local).`);
}
const BANK = PREVIEW ? PREVIEW.bank : loadBank({ dir: BANK_DIR, publicDir: PUB, reserved: new Set(QUIZZES.flatMap(z => z.questions.map(q => q.id))) });
const { QBYID, LESSON_IDS, stats, viewQ, viewBankQ, viewQuizzes, cleanProgress, grade, pickSim, reportSim } = createCore({ quizzes: QUIZZES, bank: BANK, partName: PART_NAME });
const DEMO = BANK.questions.some(q => q.inst === 'fixture');

// ── Banco ──
// TLS verificado com a CA do Supabase. Feito para o pooler em modo transação (porta 6543), que aguenta muitas
// funções abertas ao mesmo tempo; nesse modo o search_path não persiste, então o esquema vai escrito em cada consulta.
if (process.env.PGSSL === 'disable' && !LOOPBACK.test(process.env.PGHOST)) throw new Error('PGSSL=disable só vale para banco local (localhost, 127.0.0.1, ::1).');
const ssl = process.env.PGSSL === 'disable' ? false : { ca: fs.readFileSync(path.join(__dirname, 'supabase-ca.crt'), 'utf8') };
const pool = new Pool({ ssl, max: process.env.VERCEL ? 2 : 5 });
pool.on('error', e => console.error('banco:', e.message));
const sql = text => text.replace(/\b(users|sessions|answers|turmas|turma_membros|simulados)\b/g, SCHEMA + '.$1'); // nome da tabela -> esquema.tabela
const run = (text, params) => pool.query(sql(text), params);
const all = (text, params) => run(text, params).then(r => r.rows);
const one = (text, params) => all(text, params).then(r => r[0] || null);
// Cria esquema e tabelas na primeira requisição de cada instância (no Vercel, a cada "cold start").
let ready = null;
const init = () => ready || (ready = initDb().catch(e => { ready = null; throw e; }));
async function initDb() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS ${SCHEMA};
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      inst TEXT NOT NULL DEFAULT '',
      pass TEXT NOT NULL,
      progress JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
      expires BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.answers (
      user_id INTEGER NOT NULL REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
      qid TEXT NOT NULL,
      sel INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      points INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, qid)
    );
    ALTER TABLE ${SCHEMA}.answers ADD COLUMN IF NOT EXISTS pick TEXT;
    ALTER TABLE ${SCHEMA}.users ADD COLUMN IF NOT EXISTS professor BOOLEAN NOT NULL DEFAULT false;
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.turmas (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      nome TEXT NOT NULL,
      codigo TEXT NOT NULL UNIQUE,
      professor_id INTEGER NOT NULL REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.turma_membros (
      turma_id INTEGER NOT NULL REFERENCES ${SCHEMA}.turmas(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL UNIQUE REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (turma_id, user_id)
    );
    -- Mini simulado: n (1 ou 2) limita a dois por conta no próprio banco, mesmo com pedidos simultâneos.
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.simulados (
      user_id INTEGER NOT NULL REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
      n SMALLINT NOT NULL CHECK (n BETWEEN 1 AND ${SIM_MAX}),
      qids JSONB NOT NULL,
      sels JSONB NOT NULL,
      started BIGINT NOT NULL,
      finished BIGINT,
      score INTEGER,
      total INTEGER,
      duration_s INTEGER,
      report JSONB,
      PRIMARY KEY (user_id, n)
    );
  `);
}

// ── Senhas e sessões ──
const hashPass = (pass, salt = crypto.randomBytes(16).toString('hex')) =>
  salt + ':' + crypto.scryptSync(pass, salt, 64).toString('hex');
function checkPass(pass, stored) {
  const [salt, hash] = stored.split(':');
  const a = Buffer.from(hash, 'hex'), b = crypto.scryptSync(pass, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const sha = t => crypto.createHash('sha256').update(t).digest('hex');
const secure = req => (req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '');
async function newSession(req, res, uid) {
  const token = crypto.randomBytes(32).toString('hex');
  await all('INSERT INTO sessions (token, user_id, expires) VALUES ($1, $2, $3)', [sha(token), uid, Date.now() + SESSION_DAYS * 864e5]);
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure(req)}`);
}
const sidOf = req => (/(?:^|;\s*)sid=([0-9a-f]{64})/.exec(req.headers.cookie || '') || [])[1];
function userOf(req) {
  const sid = sidOf(req);
  if (!sid) return null;
  return one('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.expires > $2', [sha(sid), Date.now()]);
}
const clearCookie = (req, res) => res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' + secure(req));

// Limite de tentativas de login: 8 falhas por IP+e-mail a cada 10 min.
// ponytail: em memória; no Vercel vale por instância da função e zera a cada cold start. Troque por tabela se precisar de limite firme.
const clientIp = req => (process.env.VERCEL && (req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress;
const fails = new Map();
function throttled(key) {
  const f = fails.get(key);
  if (f && Date.now() - f.t > 6e5) fails.delete(key);
  return (fails.get(key) || { n: 0 }).n >= 8;
}
function failed(key) {
  const f = fails.get(key) || { n: 0, t: Date.now() };
  f.n++; fails.set(key, f);
}

// ── Validação ──
class Bad extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }
const str = v => (typeof v === 'string' ? v.trim() : '');
function vName(v) { const s = str(v); if (s.length < 2 || s.length > 80) throw new Bad('Informe seu nome (2 a 80 caracteres).'); return s; }
function vEmail(v) { const s = str(v).toLowerCase(); if (s.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Bad('Informe um e-mail válido.'); return s; }
function vInst(v) { const s = str(v); if (s.length > 80) throw new Bad('Instituição ou turma: até 80 caracteres.'); return s; }
function vPass(v) { if (typeof v !== 'string' || v.length < 8 || v.length > 200) throw new Bad('A senha precisa ter pelo menos 8 caracteres.'); return v; }
const EMAIL_TAKEN = 'Já existe uma conta com este e-mail.';
// 23505 = violação de UNIQUE: dois cadastros simultâneos com o mesmo e-mail
const dupEmail = e => { throw e.code === '23505' ? new Bad(EMAIL_TAKEN, 409) : e; };

// ── Gamificação (funções puras sobre as respostas já lidas do banco) ──
const answersOf = uid => all('SELECT qid, sel, pick, correct, points FROM answers WHERE user_id = $1', [uid]);
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, inst: u.inst, professor: !!u.professor, createdAt: u.created_at });
// Turma do aluno (pedido pendente ou aprovada), com o nome do professor.
const turmaOf = uid => one(`SELECT t.id, t.nome, m.status, p.name AS professor FROM turma_membros m JOIN turmas t ON t.id = m.turma_id JOIN users p ON p.id = t.professor_id WHERE m.user_id = $1`, [uid]);
const session = async u => ({ user: publicUser(u), stats: stats(u, await answersOf(u.id)), progress: u.progress || {}, turma: await turmaOf(u.id) });

// ── Turmas ──
// Código de 6 caracteres sem 0/O/1/I, para ditar em voz alta ou copiar sem erro.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from(crypto.randomBytes(6), b => CODE_CHARS[b % CODE_CHARS.length]).join('');
const vCodigo = v => { const s = str(v).toUpperCase().replace(/[\s-]/g, ''); if (!/^[A-Z0-9]{6}$/.test(s)) throw new Bad('O código da turma tem 6 letras e números.'); return s; };
const vTurma = v => { const s = str(v); if (s.length < 2 || s.length > 60) throw new Bad('Dê um nome à turma (2 a 60 caracteres).'); return s; };
// Pede entrada em uma turma pelo código. Falha com Bad se não existir ou se a pessoa já tiver turma.
async function pedirEntrada(u, codigo) {
  const t = await one('SELECT id, nome FROM turmas WHERE codigo = $1', [codigo]);
  if (!t) throw new Bad('Não existe turma com esse código.', 404);
  if (u.professor) throw new Bad('Contas de professor criam turmas; não entram em uma.', 403);
  if (await one('SELECT 1 FROM turma_membros WHERE user_id = $1', [u.id])) throw new Bad('Você já está em uma turma ou com pedido pendente. Saia dela antes de entrar em outra.', 409);
  await run('INSERT INTO turma_membros (turma_id, user_id) VALUES ($1, $2)', [t.id, u.id]);
  return t;
}
async function minhaTurma(u, turmaId) {
  const t = await one('SELECT id, nome, codigo, professor_id FROM turmas WHERE id = $1', [turmaId]);
  if (!t || t.professor_id !== u.id || !u.professor) throw new Bad('Turma não encontrada.', 404);
  return t;
}
// Pontos e nível de cada usuário, pela mesma regra do ranking geral.
async function pontosDe(ids) {
  if (!ids.length) return new Map();
  const [users, answers] = await Promise.all([all('SELECT id, name, progress FROM users WHERE id = ANY($1)', [ids]), all('SELECT user_id, qid, correct, points FROM answers WHERE user_id = ANY($1)', [ids])]);
  const by = new Map();
  for (const a of answers) (by.get(a.user_id) || by.set(a.user_id, []).get(a.user_id)).push(a);
  return new Map(users.map(x => { const st = stats(x, by.get(x.id) || []); return [x.id, { id: x.id, name: x.name, points: st.points, level: st.level }]; }));
}
const posicoes = (rows, meId) => rows.sort((a, b) => b.points - a.points || a.id - b.id).map((x, i) => ({ pos: i + 1, name: x.name, points: x.points, level: x.level, me: x.id === meId }));

// ── Mini simulado ──
const SIM_GRACE_MS = 15000;   // atraso de rede tolerado depois do fim do tempo
const simExpired = r => Date.now() > Number(r.started) + SIM_SECONDS * 1000 + SIM_GRACE_MS;
// Simulado em andamento como o navegador o vê: questões sem gabarito, marcações salvas e o tempo restante.
const viewSim = r => ({ n: r.n, sels: r.sels, seconds: SIM_SECONDS,
  left: Math.max(0, Math.round((Number(r.started) + SIM_SECONDS * 1000 - Date.now()) / 1000)),
  questions: r.qids.map(id => viewBankQ(QBYID.get(id).q)) });
const viewSimDone = r => ({ n: r.n, score: r.score, total: r.total, duration: r.duration_s, finishedAt: Number(r.finished), report: r.report });
// Corrige e fecha a tentativa. O WHERE finished IS NULL impede corrigir duas vezes.
async function finishSim(r) {
  const rep = reportSim(r.qids, r.sels);
  const now = Date.now(), dur = Math.min(SIM_SECONDS, Math.round((now - Number(r.started)) / 1000));
  const done = await one('UPDATE simulados SET finished = $1, score = $2, total = $3, duration_s = $4, report = $5, sels = $6 WHERE user_id = $7 AND n = $8 AND finished IS NULL RETURNING *',
    [now, rep.score, rep.total, dur, JSON.stringify(rep), JSON.stringify(r.sels), r.user_id, r.n]);
  return done || one('SELECT * FROM simulados WHERE user_id = $1 AND n = $2', [r.user_id, r.n]);
}
const simsOf = uid => all('SELECT * FROM simulados WHERE user_id = $1 ORDER BY n', [uid]);
// Tentativa aberta; se o tempo acabou, entrega com o que estava marcado.
async function openSim(uid) {
  const r = (await simsOf(uid)).find(x => x.finished === null);
  if (r && simExpired(r)) { await finishSim(r); return null; }
  return r || null;
}
// Marcações enviadas: uma por questão, null ou índice de alternativa existente.
function vSels(r, sels) {
  if (!Array.isArray(sels) || sels.length !== r.qids.length) throw new Bad('Respostas do simulado inválidas.');
  return sels.map((v, i) => {
    if (v === null) return null;
    if (!Number.isInteger(v) || v < 0 || v >= QBYID.get(r.qids[i]).q.opts.length) throw new Bad('Alternativa inválida no simulado.');
    return v;
  });
}

// ── Rotas da API ──
const routes = {
  async 'POST /api/register'(req, res, b) {
    const name = vName(b.name), email = vEmail(b.email), inst = vInst(b.inst), pass = vPass(b.password);
    const professor = b.professor === true;
    const codigo = !professor && str(b.codigoTurma) ? vCodigo(b.codigoTurma) : null;
    if (codigo && !(await one('SELECT 1 FROM turmas WHERE codigo = $1', [codigo]))) throw new Bad('Não existe turma com esse código. Confira com o seu professor ou deixe em branco.', 404);
    const u = await one('INSERT INTO users (name, email, inst, pass, professor) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, email, inst, hashPass(pass), professor]).catch(dupEmail);
    if (codigo) await pedirEntrada(u, codigo);
    await newSession(req, res, u.id);
    return [201, await session(u)];
  },
  async 'POST /api/login'(req, res, b) {
    const email = str(b.email).toLowerCase(), key = clientIp(req) + '|' + email;
    if (throttled(key)) throw new Bad('Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429);
    const u = await one('SELECT * FROM users WHERE email = $1', [email]);
    if (!u || typeof b.password !== 'string' || !checkPass(b.password, u.pass)) { failed(key); throw new Bad('E-mail ou senha incorretos.', 401); }
    fails.delete(key);
    await all('DELETE FROM sessions WHERE expires < $1', [Date.now()]); // faxina das sessões vencidas
    await newSession(req, res, u.id);
    return [200, await session(u)];
  },
  async 'POST /api/logout'(req, res) {
    const sid = sidOf(req);
    if (sid) await all('DELETE FROM sessions WHERE token = $1', [sha(sid)]);
    clearCookie(req, res);
    return [200, { ok: true }];
  },
  async 'GET /api/me'(req, res, b, u) { return [200, u ? await session(u) : { user: null }]; },
  async 'PUT /api/me'(req, res, b, u) {
    const name = vName(b.name), email = vEmail(b.email), inst = vInst(b.inst);
    const newPass = b.password ? vPass(b.password) : null;
    if ((email !== u.email || newPass) && (typeof b.currentPassword !== 'string' || !checkPass(b.currentPassword, u.pass)))
      throw new Bad('Para mudar e-mail ou senha, informe a senha atual correta.', 403);
    const professor = b.professor === undefined ? !!u.professor : b.professor === true;
    if (professor && !u.professor && (await turmaOf(u.id))) throw new Bad('Saia da sua turma antes de virar professor.', 409);
    if (!professor && u.professor && (await one('SELECT 1 FROM turmas WHERE professor_id = $1', [u.id]))) throw new Bad('Você ainda tem turmas. Exclua-as antes de deixar de ser professor.', 409);
    const nu = await one('UPDATE users SET name = $1, email = $2, inst = $3, pass = $4, professor = $5 WHERE id = $6 RETURNING *', [name, email, inst, newPass ? hashPass(newPass) : u.pass, professor, u.id]).catch(dupEmail);
    if (newPass) { // troca de senha encerra as outras sessões
      await all('DELETE FROM sessions WHERE user_id = $1', [u.id]);
      await newSession(req, res, u.id);
    }
    return [200, await session(nu)];
  },
  async 'DELETE /api/me'(req, res, b, u) {
    if (typeof b.password !== 'string' || !checkPass(b.password, u.pass)) throw new Bad('Senha incorreta.', 403);
    await all('DELETE FROM users WHERE id = $1', [u.id]); // respostas e sessões saem por ON DELETE CASCADE
    clearCookie(req, res);
    return [200, { ok: true }];
  },
  async 'PUT /api/progress'(req, res, b, u) {
    const clean = cleanProgress(b.progress);
    await all('UPDATE users SET progress = $1 WHERE id = $2', [JSON.stringify(clean), u.id]);
    u.progress = clean;
    return [200, { stats: stats(u, await answersOf(u.id)) }];
  },
  async 'GET /api/quizzes'(req, res, b, u) { return [200, { quizzes: viewQuizzes(u ? await answersOf(u.id) : []) }]; },
  async 'POST /api/answer'(req, res, b, u) {
    const hit = QBYID.get(b.qid);
    if (!hit) throw new Bad('Questão não encontrada.', 404);
    const { q, z } = hit;
    let g;
    try { g = grade(q, b); } catch (e) { throw new Bad(e.message, e.status || 400); }
    // Só a primeira tentativa vale: a chave primária (user_id, qid) barra a segunda.
    const ins = await run('INSERT INTO answers (user_id, qid, sel, pick, correct, points) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING', [u.id, q.id, g.sel, g.pick, g.correct, g.points]);
    if (!ins.rowCount) throw new Bad('Você já respondeu a esta questão.', 409);
    const rows = await answersOf(u.id);
    const before = stats(u, rows.filter(r => r.qid !== q.id)), after = stats(u, rows);
    const common = { awarded: g.points, levelUp: after.level > before.level,
      newBadges: after.badges.filter((x, i) => x.earned && !before.badges[i].earned).map(x => x.name), stats: after };
    if (hit.bank) return [200, { ...common, bonus: 0, question: viewBankQ(q, { sel: g.sel, correct: g.correct, points: g.points }) }];
    const quiz = viewQuizzes(rows).find(x => x.id === z.id);
    return [200, { ...common, quiz, bonus: quiz.answered === quiz.total ? QUIZ_BONUS : 0 }];
  },
  // Banco oficial: lista paginada com filtros e contagens por faceta. Sem gabarito nem comentário antes da resposta.
  async 'GET /api/bank'(req, res, b, u, query) {
    const rows = u ? await answersOf(u.id) : [];
    const mine = new Map(rows.filter(r => BANK.byId.has(r.qid)).map(r => [r.qid, r]));
    const f = {};
    for (const k of ['system', 'inst', 'year', 'diff', 'kind', 'topic', 'page', 'limit']) if (query.get(k)) f[k] = query.get(k);
    if (query.get('q')) f.text = query.get('q').slice(0, 80);
    const st = query.get('status');
    if (u && st === 'pending') f.excludeIds = new Set(mine.keys());
    if (u && st === 'answered') f.ids = new Set(mine.keys());
    if (u && st === 'wrong') f.ids = new Set([...mine].filter(([id, r]) => !r.correct && BANK.byId.get(id).kind !== 'open').map(([id]) => id));
    const r = BANK.query(f);
    const facets = BANK.facets(f);
    facets.inst = facets.inst.map(x => ({ ...x, name: instName(BANK.questions.find(q => q.inst === x.value)) }));
    return [200, { total: r.total, page: r.page, pages: r.pages, limit: r.limit, facets, available: BANK.questions.length,
      questions: r.items.map(q => viewBankQ(q, mine.get(q.id))) }];
  },
  // ── Mini simulado ── (não grava em answers: não pontua nem marca a questão como respondida)
  async 'GET /api/simulados'(req, res, b, u) {
    const open = await openSim(u.id);
    const done = (await simsOf(u.id)).filter(x => x.finished !== null);
    return [200, { max: SIM_MAX, questions: SIM_N, seconds: SIM_SECONDS, available: BANK.questions.some(q => q.kind === 'mc'),
      used: done.length + (open ? 1 : 0), active: open ? viewSim(open) : null, history: done.map(viewSimDone) }];
  },
  async 'POST /api/simulados'(req, res, b, u) {
    if (await openSim(u.id)) throw new Bad('Você já tem um simulado em andamento.', 409);
    const used = (await simsOf(u.id)).length;
    if (used >= SIM_MAX) throw new Bad(`Você já fez os ${SIM_MAX} simulados disponíveis.`, 403);
    const qids = pickSim();
    if (!qids.length) throw new Bad('Ainda não há questões de vestibular para montar um simulado.', 404);
    const r = await one('INSERT INTO simulados (user_id, n, qids, sels, started) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING *',
      [u.id, used + 1, JSON.stringify(qids), JSON.stringify(qids.map(() => null)), Date.now()]);
    if (!r) throw new Bad('Outro simulado acabou de começar nesta conta. Recarregue a página.', 409);
    return [201, { active: viewSim(r) }];
  },
  // Guarda as marcações durante a prova (para retomar depois de recarregar a página).
  async 'PUT /api/simulados/atual'(req, res, b, u) {
    const r = await openSim(u.id);
    if (!r) throw new Bad('O tempo do simulado acabou ou ele já foi entregue.', 409);
    await run('UPDATE simulados SET sels = $1 WHERE user_id = $2 AND n = $3 AND finished IS NULL', [JSON.stringify(vSels(r, b.sels)), u.id, r.n]);
    return [200, { ok: true }];
  },
  async 'POST /api/simulados/atual/entregar'(req, res, b, u) {
    const r = (await simsOf(u.id)).find(x => x.finished === null);
    if (!r) throw new Bad('Não há simulado em andamento.', 409);
    if (b.sels !== undefined && !simExpired(r)) r.sels = vSels(r, b.sels);   // depois do tempo, valem as últimas marcações salvas
    return [200, { result: viewSimDone(await finishSim(r)) }];
  },
  // Sistemas e temas da aba Provas, com a contagem real de questões publicadas.
  async 'GET /api/bank/catalog'() { return [200, { systems: BANK.catalog(), available: BANK.questions.length }]; },
  // Modo da instância: "demo" quando o banco carregado tem itens fictícios (fixture); a interface mostra a faixa.
  async 'GET /api/env'() { return [200, DEMO ? { mode: 'demo', label: 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' } : { mode: 'live' }]; },
  // Ranking geral e, para quem tem turma aprovada, o da turma. Pendentes não aparecem em nenhum ranking de turma.
  async 'GET /api/ranking'(req, res, b, u) {
    // ponytail: lê todas as contas e respostas e soma em memória a cada pedido; suficiente para turmas.
    // Com milhares de contas, guarde o total em uma coluna atualizada em /api/answer.
    const [users, answers] = await Promise.all([all('SELECT id, name, progress FROM users'), all('SELECT user_id, qid, correct, points FROM answers')]);
    const by = new Map();
    for (const a of answers) (by.get(a.user_id) || by.set(a.user_id, []).get(a.user_id)).push(a);
    const rows = users.map(x => { const s = stats(x, by.get(x.id) || []); return { id: x.id, name: x.name, points: s.points, level: s.level }; });
    const pack = list => { const r = posicoes(list, u.id); return { top: r.slice(0, 10), me: r.find(x => x.me) || null, total: r.length }; };
    const geral = pack(rows);
    const t = await turmaOf(u.id);
    let turma = null;
    if (t && t.status === 'aprovado') {
      const ids = new Set((await all(`SELECT user_id FROM turma_membros WHERE turma_id = $1 AND status = 'aprovado'`, [t.id])).map(r => r.user_id));
      turma = { nome: t.nome, ...pack(rows.filter(x => ids.has(x.id))) };
    }
    // o formato antigo (top/me/total) continua, apontando para o geral
    return [200, { ...geral, geral, turma }];
  },
  // ── Turmas ──
  async 'POST /api/turma/entrar'(req, res, b, u) {
    const t = await pedirEntrada(u, vCodigo(b.codigo));
    return [200, { ok: true, turma: { nome: t.nome, status: 'pendente' } }];
  },
  async 'POST /api/turma/sair'(req, res, b, u) {
    await run('DELETE FROM turma_membros WHERE user_id = $1', [u.id]);
    return [200, { ok: true }];
  },
  async 'POST /api/turmas'(req, res, b, u) {
    if (!u.professor) throw new Bad('Só contas de professor criam turmas.', 403);
    const nome = vTurma(b.nome);
    for (let i = 0; i < 8; i++) {
      const t = await one('INSERT INTO turmas (nome, codigo, professor_id) VALUES ($1, $2, $3) ON CONFLICT (codigo) DO NOTHING RETURNING id, nome, codigo', [nome, newCode(), u.id]);
      if (t) return [201, { turma: t }];
    }
    throw new Bad('Não foi possível gerar um código agora. Tente de novo.', 503);
  },
  async 'GET /api/turmas'(req, res, b, u) {
    if (!u.professor) throw new Bad('Só contas de professor veem turmas.', 403);
    const ts = await all('SELECT id, nome, codigo FROM turmas WHERE professor_id = $1 ORDER BY id', [u.id]);
    const ms = ts.length ? await all('SELECT turma_id, user_id, status FROM turma_membros WHERE turma_id = ANY($1) ORDER BY created_at', [ts.map(t => t.id)]) : [];
    const pts = await pontosDe(ms.map(m => m.user_id));
    return [200, { turmas: ts.map(t => {
      const mine = ms.filter(m => m.turma_id === t.id).map(m => ({ userId: m.user_id, status: m.status, ...(pts.get(m.user_id) || { name: '?', points: 0, level: 1 }) }));
      const aprovados = mine.filter(m => m.status === 'aprovado').sort((a, c) => c.points - a.points || a.userId - c.userId);
      return { id: t.id, nome: t.nome, codigo: t.codigo, pendentes: mine.filter(m => m.status === 'pendente').map(m => ({ userId: m.userId, name: m.name })),
        ranking: aprovados.map((m, i) => ({ pos: i + 1, userId: m.userId, name: m.name, points: m.points, level: m.level })) };
    }) }];
  },
  async 'POST /api/turmas/membro'(req, res, b, u) {
    if (!u.professor) throw new Bad('Só contas de professor gerenciam turmas.', 403);
    const t = await minhaTurma(u, Number.isInteger(b.turmaId) ? b.turmaId : -1);
    const uid = Number.isInteger(b.userId) ? b.userId : -1;
    if (!['aprovar', 'recusar', 'remover'].includes(b.acao)) throw new Bad('Ação inválida.');
    const m = await one('SELECT status FROM turma_membros WHERE turma_id = $1 AND user_id = $2', [t.id, uid]);
    if (!m) throw new Bad('Aluno não encontrado nesta turma.', 404);
    if (b.acao === 'aprovar') await run(`UPDATE turma_membros SET status = 'aprovado' WHERE turma_id = $1 AND user_id = $2`, [t.id, uid]);
    else await run('DELETE FROM turma_membros WHERE turma_id = $1 AND user_id = $2', [t.id, uid]);
    return [200, { ok: true }];
  },
  async 'POST /api/turmas/excluir'(req, res, b, u) {
    if (!u.professor) throw new Bad('Só contas de professor gerenciam turmas.', 403);
    const t = await minhaTurma(u, Number.isInteger(b.turmaId) ? b.turmaId : -1);
    await run('DELETE FROM turmas WHERE id = $1', [t.id]);
    return [200, { ok: true }];
  },
};
const PUBLIC = new Set(['POST /api/register', 'POST /api/login', 'POST /api/logout', 'GET /api/me', 'GET /api/quizzes', 'GET /api/bank', 'GET /api/bank/catalog', 'GET /api/env']);

function readBody(req) {
  if (req.body !== undefined) return Promise.resolve(req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : {});
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 16384) { reject(new Bad('Requisição muito grande.', 413)); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { const o = JSON.parse(Buffer.concat(chunks).toString('utf8')); resolve(o && typeof o === 'object' ? o : {}); }
      catch (e) { reject(new Bad('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
async function api(req, res, pathname, url) {
  const key = req.method + ' ' + pathname, handler = routes[key];
  try {
    if (!handler) throw new Bad('Rota não encontrada.', 404);
    // Corpo só como JSON: formulários de outros sites não conseguem enviar esse tipo sem CORS.
    if (req.method !== 'GET' && !/^application\/json/.test(req.headers['content-type'] || '')) throw new Bad('Envie application/json.', 415);
    const body = req.method === 'GET' ? {} : await readBody(req);
    await init();
    const u = await userOf(req);
    if (!u && !PUBLIC.has(key)) throw new Bad('Entre na sua conta para continuar.', 401);
    const [status, out] = await handler(req, res, body, u, url.searchParams);
    json(res, status, out);
  } catch (e) {
    if (!(e instanceof Bad)) console.error(e);
    json(res, e instanceof Bad ? e.status : 500, { error: e instanceof Bad ? e.message : 'Erro no servidor. Tente de novo em instantes.' });
  }
}

// ── Arquivos estáticos: só o que está em public/ (uso local; no Vercel a CDN serve esses arquivos) ──
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.wasm': 'application/octet-stream', '.mp3': 'audio/mpeg' };
function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'; } catch (e) { rel = '\0'; }
  if (rel === 'presentation') rel = 'presentation.html';   // igual ao rewrite do vercel.json
  const pf = PREVIEW && /^img\/q\//.test(rel) ? PREVIEW.mediaFile(rel) : null;   // figuras do banco de pré-visualização (staging/media)
  const file = pf || path.join(PUB, rel);
  const ok = !rel.includes('\0') && (pf || file.startsWith(PUB + path.sep)) && (req.method === 'GET' || req.method === 'HEAD') && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!ok) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Content-Length': fs.statSync(file).size,
    'Cache-Control': /^(fonts|atlas2|img|sfx)\//.test(rel) ? 'public, max-age=86400' : 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  const url = new URL(req.url, 'http://x');
  // no Vercel, /api/<rota> é reescrito para a função com a rota em ?__p= (ver vercel.json)
  const pathname = url.searchParams.has('__p') ? '/api/' + url.searchParams.get('__p') : url.pathname;
  if (pathname.startsWith('/api/')) return api(req, res, pathname, url);
  serveStatic(req, res, pathname);
}
module.exports = handler;

if (require.main === module) {
  init().then(() => {
    http.createServer(handler).listen(PORT, () => console.log(`Atlas Vivo em http://localhost:${PORT} (banco: ${process.env.PGHOST}:${process.env.PGPORT || 5432}, esquema ${SCHEMA})`));
  }, e => { console.error('Não foi possível conectar ao banco:', e.message); process.exit(1); });
}
