// Verificação de ponta a ponta da API: sobe o servidor em um esquema de teste do mesmo banco
// (atlasvivo_test, criado e apagado aqui; os dados reais ficam no esquema atlasvivo) e percorre
// cadastro, login, quiz, pontuação, ranking, edição e exclusão de conta. Rode: npm test
'use strict';
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs'), path = require('node:path');
const { Client } = require('pg');
const QUIZZES = require('./quizzes.js');

const PORT = 18765, BASE = 'http://localhost:' + PORT;
const SCHEMA = 'atlasvivo_test';
let srv;
async function dropSchema() {
  const c = new Client({ ssl: { ca: fs.readFileSync(path.join(__dirname, 'supabase-ca.crt'), 'utf8') } });
  await c.connect();
  await c.query('DROP SCHEMA IF EXISTS ' + SCHEMA + ' CASCADE');
  await c.end();
}

function client() {
  let cookie = '';
  return async (method, url, body) => {
    const r = await fetch(BASE + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), cookie }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0];
    return { status: r.status, body: r.headers.get('content-type')?.includes('json') ? await r.json() : await r.text() };
  };
}

async function main() {
  await dropSchema();
  srv = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: { ...process.env, PORT, PGSCHEMA: SCHEMA }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((ok, no) => { srv.stdout.once('data', ok); srv.once('exit', () => no(new Error('servidor não subiu'))); });
  const ana = client(), bia = client(), anon = client();
  let r;

  // gabarito íntegro
  for (const z of QUIZZES) for (const q of z.questions) {
    if (q.kind === 'model') { assert.ok(q.stem && q.ansText && q.view.sys.includes(q.target.sys), q.id + ': questão de modelo completa'); continue; }
    assert.equal(q.why.length, q.opts.length, q.id + ': um comentário por alternativa');
    assert.ok(q.ans >= 0 && q.ans < q.opts.length, q.id + ': gabarito dentro das alternativas');
    assert.match(q.why[q.ans], /^Correta/, q.id + ': comentário do gabarito');
  }
  assert.equal(new Set(QUIZZES.flatMap(z => z.questions.map(q => q.id))).size, QUIZZES.reduce((n, z) => n + z.questions.length, 0), 'ids únicos');

  // estáticos: site sim, código do servidor e banco não
  for (const p of ['/', '/lessons.js', '/img/coracao.svg', '/img/r-corpo.jpg']) assert.equal((await anon('GET', p)).status, 200, p);
  for (const p of ['/server.js', '/quizzes.js', '/.env', '/supabase-ca.crt', '/node_modules/pg/package.json', '/../server.js', '/vendor/../server.js', '/package.json'])
    assert.equal((await anon('GET', p)).status, 404, p);

  // anônimo
  assert.equal((await anon('GET', '/api/me')).body.user, null);
  r = await anon('GET', '/api/quizzes');
  assert.equal(r.body.quizzes.length, QUIZZES.length);
  assert.ok(r.body.quizzes.every(z => z.questions.every(q => !('key' in q) && !('ans' in q))), 'gabarito não vaza');
  assert.equal((await anon('POST', '/api/answer', { qid: 'q1', sel: 2 })).status, 401);
  assert.equal((await anon('GET', '/api/ranking')).status, 401);

  // cadastro
  assert.equal((await ana('POST', '/api/register', { name: 'A', email: 'ana@x.com', password: '12345678' })).status, 400);
  assert.equal((await ana('POST', '/api/register', { name: 'Ana', email: 'nope', password: '12345678' })).status, 400);
  assert.equal((await ana('POST', '/api/register', { name: 'Ana', email: 'ana@x.com', password: 'curta' })).status, 400);
  r = await ana('POST', '/api/register', { name: 'Ana Lima', email: 'Ana@X.com', inst: 'CAE 2026', password: 'senha-da-ana' });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.email, 'ana@x.com');
  assert.equal(r.body.user.pass, undefined);
  assert.equal(r.body.stats.points, 0);
  assert.equal((await bia('POST', '/api/register', { name: 'Bia', email: 'ana@x.com', password: 'outra-senha' })).status, 409);
  assert.equal((await bia('POST', '/api/register', { name: 'Bia Souza', email: 'bia@x.com', password: 'senha-da-bia' })).status, 201);

  // login
  assert.equal((await anon('POST', '/api/login', { email: 'ana@x.com', password: 'errada' })).status, 401);
  const ana2 = client();
  assert.equal((await ana2('POST', '/api/login', { email: 'ana@x.com', password: 'senha-da-ana' })).status, 200);
  assert.equal((await ana2('GET', '/api/me')).body.user.name, 'Ana Lima');

  // quiz: acerto, erro, segunda tentativa barrada
  assert.equal((await ana('POST', '/api/answer', { qid: 'nada', sel: 0 })).status, 404);
  assert.equal((await ana('POST', '/api/answer', { qid: 'q1', sel: 9 })).status, 400);
  r = await ana('POST', '/api/answer', { qid: 'q1', sel: 2 });
  assert.equal(r.status, 200);
  assert.equal(r.body.awarded, 10);
  assert.equal(r.body.stats.points, 10);
  assert.deepEqual(r.body.newBadges, ['Primeiro passo']);
  const q1 = r.body.quiz.questions.find(q => q.id === 'q1');
  assert.equal(q1.correct, true);
  assert.equal(q1.key.ans, 2);
  assert.ok(!r.body.quiz.questions.find(q => q.id === 'q2').key, 'só a respondida traz gabarito');
  assert.equal((await ana('POST', '/api/answer', { qid: 'q1', sel: 0 })).status, 409);
  r = await ana('POST', '/api/answer', { qid: 'q2', sel: 0 });
  assert.equal(r.body.awarded, 0);
  assert.equal(r.body.quiz.questions.find(q => q.id === 'q2').key.ans, 1);
  assert.equal(r.body.stats.points, 10);

  // quiz completo com 100%: bônus, medalha e nível
  for (const [qid, sel] of [['org1', 1], ['org2', 2]]) await ana('POST', '/api/answer', { qid, sel });
  r = await ana('POST', '/api/answer', { qid: 'org3', sel: 0 });
  assert.equal(r.body.bonus, 20);
  assert.equal(r.body.quiz.earned, 10 + 10 + 15 + 20);
  assert.equal(r.body.stats.points, 10 + 55);
  assert.ok(r.body.newBadges.includes('Na mosca'));
  assert.equal(r.body.stats.level, 1);

  // progresso da aula: salvo na conta, saneado, vale pontos
  r = await ana('PUT', '/api/progress', { progress: { sec: 5, visited: [0, 1, 99, 'x'], lessonDone: true, saved: ['q1', 'falsa'], lixo: 1, last: 'nada', ls: { digestorio: { s: 2, v: [0, 1, 2, 77], d: false }, falsa: { d: true }, cardiovascular: { d: true } } } });
  assert.equal(r.body.stats.points, 65 + 30);
  assert.equal(r.body.stats.lessonsDone, 1);
  assert.ok(r.body.stats.badges.find(b => b.name === 'Leitura em dia').earned);
  r = await ana2('GET', '/api/me');
  assert.deepEqual(r.body.progress, { sec: 5, visited: [0, 1], step: 0, fc: 0, fcRes: {}, saved: ['q1'], lessonDone: true, ls: { digestorio: { s: 2, v: [0, 1, 2], d: false } }, last: null });
  // aula genérica concluída: +30; nível sobe a cada 150
  r = await ana('PUT', '/api/progress', { progress: { lessonDone: true, last: 'digestorio', ls: { digestorio: { s: 4, v: [0, 1, 2, 3], d: true } } } });
  assert.equal(r.body.stats.points, 65 + 60);
  assert.equal(r.body.stats.lessonsDone, 2);
  assert.equal(r.body.stats.level, 1);
  await ana('POST', '/api/answer', { qid: 'dig1', sel: 3 });
  await ana('POST', '/api/answer', { qid: 'dig2', sel: 1 });
  r = await ana('POST', '/api/answer', { qid: 'dig3', sel: 0 });
  assert.equal(r.body.stats.points, 125 + 35);
  assert.equal(r.body.bonus, 0, 'o quiz agora tem uma questão no modelo');
  assert.equal(r.body.stats.level, 2);
  assert.equal(r.body.levelUp, true);

  // questão respondida no modelo 3D: vale o id da estrutura clicada
  const part = pt => require('./atlas2/manifest.json').parts.find(p => p.pt === pt).id;
  r = (await ana('GET', '/api/quizzes')).body.quizzes.find(z => z.id === 'digestorio').questions.find(q => q.id === 'dig4');
  assert.equal(r.kind, 'model');
  assert.deepEqual(r.view, { sys: ['digestorio'] });
  assert.ok(!r.key && !('target' in r) && !('ids' in r), 'alvo não vaza');
  assert.equal((await ana('POST', '/api/answer', { qid: 'dig4', sel: 0 })).status, 400);
  assert.equal((await ana('POST', '/api/answer', { qid: 'dig4', part: 'FMA-nada' })).status, 400);
  r = await bia('POST', '/api/answer', { qid: 'dig4', part: part('Estômago') });
  assert.equal(r.body.awarded, 0);
  const m = r.body.quiz.questions.find(q => q.id === 'dig4');
  assert.equal(m.correct, false);
  assert.equal(m.pickName, 'Estômago');
  assert.deepEqual(m.key.names, ['Fígado']);
  assert.deepEqual(m.key.parts, [part('Fígado')]);
  r = await ana('POST', '/api/answer', { qid: 'dig4', part: part('Fígado') });
  assert.equal(r.body.awarded, 10);
  assert.equal(r.body.bonus, 20);
  assert.equal(r.body.stats.points, 160 + 10 + 20);
  assert.equal((await ana('POST', '/api/answer', { qid: 'dig4', part: part('Fígado') })).status, 409);

  // ranking
  r = await bia('GET', '/api/ranking');
  assert.deepEqual(r.body.top.map(x => [x.pos, x.name, x.points, x.me]), [[1, 'Ana Lima', 190, false], [2, 'Bia Souza', 0, true]]);
  assert.equal(r.body.me.pos, 2);
  assert.equal(r.body.top[0].email, undefined);

  // edição de conta
  r = await ana('PUT', '/api/me', { name: 'Ana L.', email: 'ana@x.com', inst: 'Turma B' });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.inst, 'Turma B');
  assert.equal((await ana('PUT', '/api/me', { name: 'Ana L.', email: 'bia@x.com', currentPassword: 'senha-da-ana' })).status, 409);
  assert.equal((await ana('PUT', '/api/me', { name: 'Ana L.', email: 'ana@x.com', password: 'nova-senha-1' })).status, 403);
  assert.equal((await ana('PUT', '/api/me', { name: 'Ana L.', email: 'ana@x.com', password: 'nova-senha-1', currentPassword: 'senha-da-ana' })).status, 200);
  assert.equal((await ana2('GET', '/api/me')).body.user, null, 'troca de senha derruba as outras sessões');
  assert.equal((await ana('GET', '/api/me')).body.user.name, 'Ana L.');
  assert.equal((await client()('POST', '/api/login', { email: 'ana@x.com', password: 'senha-da-ana' })).status, 401);
  assert.equal((await client()('POST', '/api/login', { email: 'ana@x.com', password: 'nova-senha-1' })).status, 200);

  // logout
  assert.equal((await bia('POST', '/api/logout', {})).status, 200);
  assert.equal((await bia('GET', '/api/me')).body.user, null);

  // exclusão de conta
  assert.equal((await ana('DELETE', '/api/me', { password: 'errada' })).status, 403);
  assert.equal((await ana('DELETE', '/api/me', { password: 'nova-senha-1' })).status, 200);
  assert.equal((await ana('GET', '/api/me')).body.user, null);
  assert.equal((await client()('POST', '/api/login', { email: 'ana@x.com', password: 'nova-senha-1' })).status, 401);
  assert.equal((await ana('POST', '/api/register', { name: 'Ana de novo', email: 'ana@x.com', password: 'senha-da-ana' })).body.stats.points, 0, 'respostas antigas foram apagadas');

  // limite de tentativas de login
  let last;
  for (let i = 0; i < 9; i++) last = await anon('POST', '/api/login', { email: 'bia@x.com', password: 'chute' + i });
  assert.equal(last.status, 429);

  // requisição sem JSON
  assert.equal((await fetch(BASE + '/api/login', { method: 'POST', body: 'email=a' })).status, 415);
  console.log('ok — todas as verificações passaram');
}

main().then(() => 0, e => { console.error(e); return 1; }).then(async code => {
  if (srv && srv.exitCode === null) { srv.kill(); await new Promise(ok => srv.once('exit', ok)); }
  await dropSchema().catch(e => console.error('limpeza do esquema de teste:', e.message));
  process.exit(code);
});
