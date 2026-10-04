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

const PORT = +process.env.PORT || 8765;
const SESSION_DAYS = 30;
// Esquema próprio, fora do "public": no Supabase, tabelas do public ficam expostas pela API REST do projeto.
const SCHEMA = process.env.PGSCHEMA || 'atlasvivo';
if (!/^[a-z_][a-z0-9_]*$/.test(SCHEMA)) throw new Error('PGSCHEMA inválido');
if (!process.env.PGHOST || !process.env.PGPASSWORD) throw new Error('Faltam as variáveis PG* do banco: localmente, rode com "npm start" (lê o .env); no Vercel, defina-as no painel.');
const PUB = path.join(__dirname, 'public');

// ── Regras de pontuação ──
const PTS = { 'Básica': 10, 'Intermediária': 15 };
const QUIZ_BONUS = 20;   // ao responder todas as questões de um quiz
const LESSON_PTS = 30;   // a cada aula concluída
const LEVEL_STEP = 150;
// Há uma aula por quiz, com o mesmo id. A do cardiovascular tem progresso próprio (lessonDone).
const LESSON_IDS = QUIZZES.map(z => z.id);
const TITLES = ['Calouro', 'Curioso', 'Explorador', 'Monitor', 'Anatomista', 'Fisiologista', 'Especialista', 'Mestre do Atlas'];
// Estruturas do modelo 3D, para as questões respondidas clicando no modelo (kind: 'model').
const PARTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'atlas2', 'manifest.json'), 'utf8')).parts;
const PART_NAME = new Map(PARTS.map(p => [p.id, p.pt || p.n]));
const nm = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
for (const z of QUIZZES) for (const q of z.questions) if (q.kind === 'model') {
  const qs = q.target.q.map(nm);
  q.ids = PARTS.filter(p => p.s === q.target.sys && qs.some(x => nm(p.pt).includes(x) || nm(p.n).includes(x))).map(p => p.id);
  if (!q.ids.length) throw new Error('Questão ' + q.id + ': estrutura não encontrada no modelo.');
}
const QBYID = new Map();
for (const z of QUIZZES) for (const q of z.questions) QBYID.set(q.id, { q, z });

// ── Banco ──
// TLS verificado com a CA do Supabase. Feito para o pooler em modo transação (porta 6543), que aguenta muitas
// funções abertas ao mesmo tempo; nesse modo o search_path não persiste, então o esquema vai escrito em cada consulta.
const pool = new Pool({ ssl: { ca: fs.readFileSync(path.join(__dirname, 'supabase-ca.crt'), 'utf8') }, max: process.env.VERCEL ? 2 : 5 });
pool.on('error', e => console.error('banco:', e.message));
const sql = text => text.replace(/\b(users|sessions|answers)\b/g, SCHEMA + '.$1'); // nome da tabela -> esquema.tabela
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
function stats(u, rows) {
  const by = new Map(rows.map(r => [r.qid, r]));
  let points = 0, answered = 0, correct = 0, quizzesDone = 0, perfect = 0;
  for (const z of QUIZZES) {
    const a = z.questions.map(q => by.get(q.id)).filter(Boolean);
    for (const r of a) { points += r.points; answered++; correct += r.correct; }
    if (a.length === z.questions.length) {
      quizzesDone++; points += QUIZ_BONUS;
      if (a.every(r => r.correct)) perfect++;
    }
  }
  const p = u.progress || {}, ls = p.ls || {};
  const lessonsDone = LESSON_IDS.filter(id => (id === 'cardiovascular' ? p.lessonDone === true : (ls[id] || {}).d === true)).length;
  points += lessonsDone * LESSON_PTS;
  const level = Math.min(TITLES.length, Math.floor(points / LEVEL_STEP) + 1);
  const badges = [
    ['Primeiro passo', 'Responder à primeira questão', answered >= 1],
    ['Leitura em dia', 'Concluir a primeira aula', lessonsDone >= 1],
    ['Trilha lida', 'Concluir todas as aulas', lessonsDone === LESSON_IDS.length],
    ['Na mosca', 'Acertar todas as questões de um quiz', perfect >= 1],
    ['Maratonista', 'Completar 5 quizzes', quizzesDone >= 5],
    ['Atlas completo', 'Completar todos os quizzes', quizzesDone === QUIZZES.length],
  ].map(([name, desc, earned]) => ({ name, desc, earned }));
  return {
    points, level, title: TITLES[level - 1],
    floor: (level - 1) * LEVEL_STEP, next: level < TITLES.length ? level * LEVEL_STEP : null,
    answered, correct, quizzesDone, quizzesTotal: QUIZZES.length, lessonsDone, lessonsTotal: LESSON_IDS.length, badges,
  };
}
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, inst: u.inst, createdAt: u.created_at });
const session = async u => ({ user: publicUser(u), stats: stats(u, await answersOf(u.id)), progress: u.progress || {} });

// Questão como o navegador a vê: o gabarito só aparece depois de respondida.
function viewQ(q, a) {
  const model = q.kind === 'model';
  const o = { id: q.id, kind: model ? 'model' : 'mc', topic: q.topic, diff: q.diff, stem: q.stem, opts: q.opts || [], view: q.view || null, pts: PTS[q.diff], sec: q.sec ?? null, pulm: !!q.pulm };
  if (a) Object.assign(o, { sel: a.sel, pick: a.pick || null, pickName: PART_NAME.get(a.pick) || '', correct: !!a.correct, points: a.points,
    key: model ? { ansText: q.ansText, parts: q.ids, names: [...new Set(q.ids.map(i => PART_NAME.get(i)))], steps: [], why: [] }
      : { ans: q.ans, ansText: q.ansText, steps: q.steps || [], why: q.why } });
  return o;
}
function viewQuizzes(rows) {
  const by = new Map(rows.map(r => [r.qid, r]));
  return QUIZZES.map(z => {
    const questions = z.questions.map(q => viewQ(q, by.get(q.id)));
    const done = questions.filter(q => q.key);
    const complete = done.length === questions.length;
    return {
      id: z.id, title: z.title, total: questions.length, answered: done.length,
      correct: done.filter(q => q.correct).length,
      earned: done.reduce((n, q) => n + q.points, 0) + (complete ? QUIZ_BONUS : 0),
      max: questions.reduce((n, q) => n + q.pts, 0) + QUIZ_BONUS, bonus: QUIZ_BONUS, questions,
    };
  });
}

// ── Rotas da API ──
const routes = {
  async 'POST /api/register'(req, res, b) {
    const name = vName(b.name), email = vEmail(b.email), inst = vInst(b.inst), pass = vPass(b.password);
    const u = await one('INSERT INTO users (name, email, inst, pass) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, inst, hashPass(pass)]).catch(dupEmail);
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
    const nu = await one('UPDATE users SET name = $1, email = $2, inst = $3, pass = $4 WHERE id = $5 RETURNING *', [name, email, inst, newPass ? hashPass(newPass) : u.pass, u.id]).catch(dupEmail);
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
    const p = b.progress || {}, int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : 0);
    const ints = (v, max) => (Array.isArray(v) ? [...new Set(v.filter(x => Number.isInteger(x) && x >= 0 && x <= max))] : []);
    const ls = {};
    if (p.ls && typeof p.ls === 'object') for (const id of LESSON_IDS) {
      const x = p.ls[id];
      if (id !== 'cardiovascular' && x && typeof x === 'object') ls[id] = { s: int(x.s, 9), v: ints(x.v, 9), d: x.d === true };
    }
    const fcRes = {};
    if (p.fcRes && typeof p.fcRes === 'object') for (const k of ['0', '1', '2', '3']) if (p.fcRes[k] === 'got' || p.fcRes[k] === 'again') fcRes[k] = p.fcRes[k];
    const clean = {
      sec: int(p.sec, 5), visited: ints(p.visited, 5), step: int(p.step, 10), fc: int(p.fc, 4), fcRes,
      saved: Array.isArray(p.saved) ? [...new Set(p.saved.filter(x => QBYID.has(x)))] : [],
      lessonDone: p.lessonDone === true, ls,
      last: LESSON_IDS.includes(p.last) ? p.last : null,
    };
    await all('UPDATE users SET progress = $1 WHERE id = $2', [JSON.stringify(clean), u.id]);
    u.progress = clean;
    return [200, { stats: stats(u, await answersOf(u.id)) }];
  },
  async 'GET /api/quizzes'(req, res, b, u) { return [200, { quizzes: viewQuizzes(u ? await answersOf(u.id) : []) }]; },
  async 'POST /api/answer'(req, res, b, u) {
    const hit = QBYID.get(b.qid);
    if (!hit) throw new Bad('Questão não encontrada.', 404);
    const { q, z } = hit;
    const model = q.kind === 'model';
    if (model) { if (typeof b.part !== 'string' || !PART_NAME.has(b.part)) throw new Bad('Clique em uma estrutura do modelo para responder.'); }
    else if (!Number.isInteger(b.sel) || b.sel < 0 || b.sel >= q.opts.length) throw new Bad('Alternativa inválida.');
    const correct = (model ? q.ids.includes(b.part) : b.sel === q.ans) ? 1 : 0, points = correct ? PTS[q.diff] : 0;
    // Só a primeira tentativa vale: a chave primária (user_id, qid) barra a segunda.
    const ins = await run('INSERT INTO answers (user_id, qid, sel, pick, correct, points) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING', [u.id, q.id, model ? -1 : b.sel, model ? b.part : null, correct, points]);
    if (!ins.rowCount) throw new Bad('Você já respondeu a esta questão.', 409);
    const rows = await answersOf(u.id);
    const before = stats(u, rows.filter(r => r.qid !== q.id)), after = stats(u, rows);
    const quiz = viewQuizzes(rows).find(x => x.id === z.id);
    return [200, {
      quiz, awarded: points, bonus: quiz.answered === quiz.total ? QUIZ_BONUS : 0,
      levelUp: after.level > before.level,
      newBadges: after.badges.filter((x, i) => x.earned && !before.badges[i].earned).map(x => x.name),
      stats: after,
    }];
  },
  async 'GET /api/ranking'(req, res, b, u) {
    // ponytail: lê todas as contas e respostas e soma em memória a cada pedido; suficiente para turmas.
    // Com milhares de contas, guarde o total em uma coluna atualizada em /api/answer.
    const [users, answers] = await Promise.all([all('SELECT id, name, progress FROM users'), all('SELECT user_id, qid, correct, points FROM answers')]);
    const by = new Map();
    for (const a of answers) (by.get(a.user_id) || by.set(a.user_id, []).get(a.user_id)).push(a);
    const rows = users.map(x => { const s = stats(x, by.get(x.id) || []); return { id: x.id, name: x.name, points: s.points, level: s.level }; })
      .sort((a, b2) => b2.points - a.points || a.id - b2.id)
      .map((x, i) => ({ pos: i + 1, name: x.name, points: x.points, level: x.level, me: x.id === u.id }));
    return [200, { top: rows.slice(0, 10), me: rows.find(x => x.me), total: rows.length }];
  },
};
const PUBLIC = new Set(['POST /api/register', 'POST /api/login', 'POST /api/logout', 'GET /api/me', 'GET /api/quizzes']);

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
async function api(req, res, pathname) {
  const key = req.method + ' ' + pathname, handler = routes[key];
  try {
    if (!handler) throw new Bad('Rota não encontrada.', 404);
    // Corpo só como JSON: formulários de outros sites não conseguem enviar esse tipo sem CORS.
    if (req.method !== 'GET' && !/^application\/json/.test(req.headers['content-type'] || '')) throw new Bad('Envie application/json.', 415);
    const body = req.method === 'GET' ? {} : await readBody(req);
    await init();
    const u = await userOf(req);
    if (!u && !PUBLIC.has(key)) throw new Bad('Entre na sua conta para continuar.', 401);
    const [status, out] = await handler(req, res, body, u);
    json(res, status, out);
  } catch (e) {
    if (!(e instanceof Bad)) console.error(e);
    json(res, e instanceof Bad ? e.status : 500, { error: e instanceof Bad ? e.message : 'Erro no servidor. Tente de novo em instantes.' });
  }
}

// ── Arquivos estáticos: só o que está em public/ (uso local; no Vercel a CDN serve esses arquivos) ──
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.wasm': 'application/octet-stream' };
function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'; } catch (e) { rel = '\0'; }
  const file = path.join(PUB, rel);
  const ok = !rel.includes('\0') && file.startsWith(PUB + path.sep) && (req.method === 'GET' || req.method === 'HEAD') && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!ok) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Content-Length': fs.statSync(file).size,
    'Cache-Control': /^(fonts|atlas2|img)\//.test(rel) ? 'public, max-age=86400' : 'no-cache',
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
  if (pathname.startsWith('/api/')) return api(req, res, pathname);
  serveStatic(req, res, pathname);
}
module.exports = handler;

if (require.main === module) {
  init().then(() => {
    http.createServer(handler).listen(PORT, () => console.log(`Atlas Vivo em http://localhost:${PORT} (banco: ${process.env.PGHOST}:${process.env.PGPORT || 5432}, esquema ${SCHEMA})`));
  }, e => { console.error('Não foi possível conectar ao banco:', e.message); process.exit(1); });
}
