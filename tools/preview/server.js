// Pré-visualização RESTRITA do Atlas Vivo com questões reais ainda sem direitos liberados.
// Serve o mesmo app (public/) e a mesma API de questões do servidor de produção, mas:
//   - escuta só em 127.0.0.1 e recusa qualquer Host que não seja local;
//   - lê os itens de staging/preview/preview.json (gerado por "run.py preview-export"; fora do git e do deploy);
//   - não usa banco de dados: a conta é um visitante local fictício e as respostas ficam só na memória;
//   - nada daqui é importado por server.js nem por api/index.js, e o Vercel não inclui tools/ nem staging/.
// Uso: npm run preview   →   http://127.0.0.1:8791
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');
const QUIZZES = require(path.join(ROOT, 'quizzes.js'));
const { createCore, QUIZ_BONUS } = require(path.join(ROOT, 'core.js'));
const { makeBank, problems } = require(path.join(ROOT, 'bank.js'));

if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new Error('A pré-visualização restrita não roda em produção.');
const PORT = +process.env.PREVIEW_PORT || 8791;
const HOST = '127.0.0.1';
const PUB = path.join(ROOT, 'public');
const STAGING = path.resolve(process.env.ATLAS_STAGING || path.join(ROOT, 'staging'));
const FILE = path.join(STAGING, 'preview', 'preview.json');
const LABEL = '';   // sem faixa: a pessoa está testando; só o modo demonstração (dados fictícios) mostra faixa

// ── dados ──
if (!fs.existsSync(FILE)) { console.error('Falta ' + FILE + '. Rode antes: python -I tools/ingest/run.py preview-export'); process.exit(1); }
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const valid = [], rejected = [];
for (const q of data.questions) {
  const bad = problems(q, { preview: true });   // sem publicDir: as figuras vêm de staging/media (mapa abaixo)
  const missing = [...q.stem.filter(b => b.t === 'fig').map(b => b.src), ...q.opts.filter(o => o.fig).map(o => o.fig)]
    .filter(f => !mediaFile(f));
  if (bad.length || missing.length) rejected.push({ id: q.id, why: bad.concat(missing.map(f => 'figura ausente: ' + f)) });
  else valid.push(q);
}
const BANK = makeBank(valid);

// img/q/<id-com-hifens>/<arquivo>  →  staging/media/<media_dir>/<arquivo>  (só o que o preview-export mapeou)
function mediaFile(rel) {
  const m = /^img\/q\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/.exec(rel || '');
  if (!m || !data.media[m[1]]) return null;
  const f = path.resolve(STAGING, 'media', data.media[m[1]], m[2]);
  return f.startsWith(path.resolve(STAGING, 'media') + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile() ? f : null;
}

const PARTS = JSON.parse(fs.readFileSync(path.join(PUB, 'atlas2', 'manifest.json'), 'utf8')).parts;
const PART_NAME = new Map(PARTS.map(p => [p.id, p.pt || p.n]));
const nm = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
for (const z of QUIZZES) for (const q of z.questions) if (q.kind === 'model') {
  const qs = q.target.q.map(nm);
  q.ids = PARTS.filter(p => p.s === q.target.sys && qs.some(x => nm(p.pt).includes(x) || nm(p.n).includes(x))).map(p => p.id);
}
const { QBYID, stats, viewBankQ, viewQuizzes, cleanProgress, grade } = createCore({ quizzes: QUIZZES, bank: BANK, partName: PART_NAME });

// ── visitante local fictício, tudo em memória ──
const USER = { id: 1, name: 'Visitante local', email: 'visitante@local.invalid', inst: '', created_at: '2000-01-01T00:00:00Z', progress: {} };
const answers = new Map();
const rows = () => [...answers.values()];
const publicUser = () => ({ id: USER.id, name: USER.name, email: USER.email, inst: USER.inst, professor: false, createdAt: USER.created_at });

class Bad extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }
const routes = {
  'GET /api/env': () => [200, { mode: 'preview', label: LABEL }],
  'GET /api/me': () => [200, { user: publicUser(), stats: stats(USER, rows()), progress: USER.progress, turma: null }],
  'POST /api/logout': () => [200, { ok: true }],
  'POST /api/turma/entrar': () => { throw new Bad('Indisponível na pré-visualização: sem banco de dados.'); },
  'POST /api/turma/sair': () => [200, { ok: true }],
  'GET /api/turmas': () => { throw new Bad('Indisponível na pré-visualização.', 403); },
  'POST /api/turmas': () => { throw new Bad('Indisponível na pré-visualização.', 403); },
  'POST /api/login': () => { throw new Bad('Indisponível na pré-visualização: você já é o visitante local.'); },
  'POST /api/register': () => { throw new Bad('Indisponível na pré-visualização: você já é o visitante local.'); },
  'PUT /api/progress': (b) => { USER.progress = cleanProgress(b.progress); return [200, { stats: stats(USER, rows()) }]; },
  'GET /api/quizzes': () => [200, { quizzes: viewQuizzes(rows()) }],
  'GET /api/ranking': () => { const s = stats(USER, rows()); const me = { pos: 1, name: USER.name, points: s.points, level: s.level, me: true }; const geral = { top: [me], me, total: 1 }; return [200, { ...geral, geral, turma: null }]; },
  'GET /api/bank/catalog': () => [200, { systems: BANK.catalog(), available: BANK.questions.length }],
  'GET /api/bank': (b, sp) => {
    const mine = new Map(rows().filter(r => BANK.byId.has(r.qid)).map(r => [r.qid, r]));
    const f = {};
    for (const k of ['system', 'inst', 'year', 'diff', 'kind', 'topic', 'page', 'limit']) if (sp.get(k)) f[k] = sp.get(k);
    if (sp.get('q')) f.text = sp.get('q').slice(0, 80);
    const r = BANK.query(f);
    return [200, { total: r.total, page: r.page, pages: r.pages, limit: r.limit, facets: BANK.facets(f), available: BANK.questions.length,
      questions: r.items.map(q => viewBankQ(q, mine.get(q.id))) }];
  },
  'POST /api/answer': (b) => {
    const hit = QBYID.get(b.qid);
    if (!hit) throw new Bad('Questão não encontrada.', 404);
    const { q, z } = hit;
    let g;
    try { g = grade(q, b); } catch (e) { throw new Bad(e.message, e.status || 400); }
    if (answers.has(q.id)) throw new Bad('Você já respondeu a esta questão.', 409);
    const before = stats(USER, rows());
    answers.set(q.id, { qid: q.id, sel: g.sel, pick: g.pick, correct: g.correct, points: g.points });
    const after = stats(USER, rows());
    const common = { awarded: g.points, levelUp: after.level > before.level,
      newBadges: after.badges.filter((x, i) => x.earned && !before.badges[i].earned).map(x => x.name), stats: after };
    if (hit.bank) return [200, { ...common, bonus: 0, question: viewBankQ(q, { sel: g.sel, correct: g.correct, points: g.points }) }];
    const quiz = viewQuizzes(rows()).find(x => x.id === z.id);
    return [200, { ...common, quiz, bonus: quiz.answered === quiz.total ? QUIZ_BONUS : 0 }];
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 16384) { reject(new Bad('Requisição muito grande.', 413)); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new Bad('JSON inválido.')); } });
    req.on('error', reject);
  });
}
const send = (res, status, body, type = 'application/json; charset=utf-8') => { res.writeHead(status, { 'Content-Type': type }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.wasm': 'application/octet-stream' };
function serve(req, res, rel) {
  // questões: figuras vêm de staging/media; o resto, de public/. Nada fora dessas duas raízes.
  let file = /^img\/q\//.test(rel) ? mediaFile(rel) : path.join(PUB, rel || 'index.html');
  const ok = file && !rel.includes('\0') && (file.startsWith(PUB + path.sep) || file.startsWith(path.join(STAGING, 'media') + path.sep))
    && (req.method === 'GET' || req.method === 'HEAD') && fs.existsSync(file) && fs.statSync(file).isFile();
  if (!ok) return send(res, 404, 'Não encontrado', 'text/plain; charset=utf-8');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Content-Length': fs.statSync(file).size });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

const LOCAL_HOST = /^(127\.0\.0\.1|localhost)(:\d+)?$/;
const server = http.createServer(async (req, res) => {
  // sem CORS; nada de indexação; nunca em cache
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  if (!LOCAL_HOST.test(req.headers.host || '')) return send(res, 421, 'Host não permitido.', 'text/plain; charset=utf-8');
  const origin = req.headers.origin;
  if (origin && req.method !== 'GET' && req.method !== 'HEAD' && new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'Origem não permitida.' });
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    const handler = routes[req.method + ' ' + url.pathname];
    try {
      if (!handler) throw new Bad('Rota não encontrada.', 404);
      if (req.method !== 'GET' && !/^application\/json/.test(req.headers['content-type'] || '')) throw new Bad('Envie application/json.', 415);
      const body = req.method === 'GET' ? {} : await readBody(req);
      const [status, out] = handler(body, url.searchParams);
      return send(res, status, out);
    } catch (e) {
      if (!(e instanceof Bad)) console.error(e);
      return send(res, e instanceof Bad ? e.status : 500, { error: e instanceof Bad ? e.message : 'Erro no servidor.' });
    }
  }
  let rel; try { rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'; } catch (e) { rel = '\0'; }
  serve(req, res, rel);
});
server.listen(PORT, HOST, () => {
  console.log(`Pré-visualização restrita em http://${HOST}:${PORT}  (${BANK.questions.length} questões reais sem direitos liberados; só memória, sem banco)`);
  if (rejected.length) console.log(`  ${rejected.length} itens recusados:`, rejected.slice(0, 5).map(r => r.id + ' → ' + r.why[0]).join(' | '));
});
