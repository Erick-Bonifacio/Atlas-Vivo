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
// Este teste cria e APAGA o esquema atlasvivo_test: só roda em banco local de desenvolvimento (loopback).
// Contra Supabase ou qualquer outro host ele se recusa a começar, mesmo que o .env aponte para lá.
if (!/^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(process.env.PGHOST || '')) {
  console.error('npm test só roda em banco local (PGHOST=localhost, 127.0.0.1 ou ::1). Copie .env.test.example para .env.test e use "npm run test:e2e".');
  process.exit(2);
}
process.env.PGSSL = 'disable';
const FIXTURE_BANK = path.join(__dirname, 'tests', 'fixtures', 'bank');
let srv;
async function dropSchema() {
  const c = new Client({ ssl: false });
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
  srv = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: { ...process.env, PORT, PGSCHEMA: SCHEMA, ATLAS_BANK_DIR: FIXTURE_BANK }, stdio: ['ignore', 'pipe', 'inherit'] });
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
  for (const p of ['/server.js', '/quizzes.js', '/.env', '/supabase-ca.crt', '/node_modules/pg/package.json', '/vercel.json', '/api/index.js', '/..%2Fserver.js', '/%2e%2e/quizzes.js', '/../server.js', '/vendor/../server.js', '/package.json'])
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
  assert.deepEqual(r.body.progress, { sec: 5, visited: [0, 1], step: 0, fc: 0, fcRes: {}, saved: ['q1'], lessonDone: true, ls: { digestorio: { s: 2, v: [0, 1, 2], d: false }, cardiovascular: { s: 0, v: [], d: true } }, last: null });
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
  const part = pt => require('./public/atlas2/manifest.json').parts.find(p => p.pt === pt).id;
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

  // banco oficial (itens de FIXTURE, só para o teste): lista pública sem gabarito, filtros, paginação, resposta
  const caio = client();
  assert.equal((await caio('POST', '/api/register', { name: 'Caio Dias', email: 'caio@x.com', password: 'senha-do-caio' })).status, 201);
  r = await anon('GET', '/api/bank');
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.total, r.body.available, r.body.questions.length], [6, 6, 6]);
  for (const k of ['ans', 'expl', 'why', 'expected', 'key', 'perm', 'basis', 'rights', 'science', 'appearances', 'src']) assert.ok(!(new RegExp('"' + k + '"')).test(JSON.stringify(r.body)), 'vazou ' + k);
  for (const t of ['Comentário de demonstração', 'Resolução de demonstração', 'emulsifica', 'fixture.pdf']) assert.ok(!JSON.stringify(r.body).includes(t), 'vazou: ' + t);
  assert.deepEqual(r.body.questions.map(q => q.label), Array(6).fill('Questão fictícia'), 'fixture nunca se passa por prova real');
  r = await anon('GET', '/api/bank?system=digestorio&limit=1&page=2');
  assert.deepEqual([r.body.total, r.body.page, r.body.pages, r.body.questions.length], [3, 2, 3, 1]);
  assert.deepEqual((await anon('GET', '/api/bank?system=digestorio&topic=' + encodeURIComponent('Fígado e pâncreas'))).body.questions.map(q => q.id), ['fixture:2099:regular:open1']);
  assert.equal((await anon('GET', '/api/bank?limit=999')).body.limit, 50);
  assert.equal((await anon('GET', '/api/bank?q=bile')).body.total, 1);
  assert.deepEqual((await anon('GET', '/api/bank?year=2098')).body.facets.year.map(x => x.value), [2099, 2098, 2097, 2096, 2095, 2094]);
  // catálogo e modo (públicos, só nomes e contagens)
  r = await anon('GET', '/api/bank/catalog');
  assert.equal(r.status, 200);
  assert.equal(r.body.systems.length, 12);
  assert.deepEqual([r.body.available, r.body.systems.find(x => x.id === 'digestorio').total, r.body.systems.find(x => x.id === 'nervoso').total], [6, 3, 0]);
  assert.ok(!/"(ans|expl|key)"/.test(JSON.stringify(r.body)));
  assert.deepEqual((await anon('GET', '/api/env')).body, { mode: 'demo', label: 'DEMONSTRAÇÃO — DADOS FICTÍCIOS' });
  assert.equal((await anon('POST', '/api/answer', { qid: 'fixture:2099:regular:mc5', sel: 2 })).status, 401);
  // quiz da aula: as questões de vestibular vêm junto, sem gabarito, e ficam fora de total e bônus
  r = await caio('GET', '/api/quizzes');
  let dz = r.body.quizzes.find(z => z.id === 'digestorio');
  assert.deepEqual(dz.official.map(q => q.id), ['fixture:2099:regular:mc5', 'fixture:2099:regular:tab1']);
  assert.ok(dz.official.every(q => !q.key));
  assert.deepEqual(r.body.quizzes.find(z => z.id === 'organizacao').official, []);
  const authored = dz.total;
  // 5 alternativas: a quinta é válida; 4 alternativas: a quinta não
  assert.equal((await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:mc4', sel: 4 })).status, 400);
  assert.equal((await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:mc5', sel: 5 })).status, 400);
  r = await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:mc5', sel: 2 });
  assert.equal(r.status, 200);
  assert.equal(r.body.awarded, 10);
  assert.equal(r.body.quiz, undefined, 'questão oficial não pertence a quiz');
  assert.equal(r.body.bonus, 0);
  assert.equal(r.body.question.key.ans, 2);
  assert.match(r.body.question.key.text, /superfície de absorção/, 'comentário revisado por pessoa aparece');
  assert.deepEqual([r.body.stats.points, r.body.stats.bankAnswered, r.body.stats.answered], [10, 1, 1]);
  assert.ok(r.body.newBadges.includes('Primeiro passo'));
  assert.equal((await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:mc5', sel: 0 })).status, 409, 'só a primeira tentativa vale');
  r = await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:mc4', sel: 1 });
  assert.deepEqual([r.body.awarded, r.body.question.correct, r.body.question.key.ans, r.body.question.key.text], [0, false, 0, null], 'comentário sem revisão humana não vai ao aluno');
  // responder pelo quiz da aula: vale pelas regras do banco e não mexe no quiz
  r = await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:tab1', sel: 0 });
  assert.deepEqual([r.status, r.body.awarded, r.body.bonus, r.body.quiz], [200, 0, 0, undefined]);
  assert.equal(r.body.question.key.text, null, 'item sem comentário');
  dz = (await caio('GET', '/api/quizzes')).body.quizzes.find(z => z.id === 'digestorio');
  assert.deepEqual([dz.total, dz.answered, dz.earned], [authored, 0, 0], 'o quiz da aula segue como antes');
  assert.deepEqual(dz.official.map(q => !!q.key), [true, true]);
  // discursiva: autoavaliação, sem pontos
  assert.equal((await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:open1', self: 7 })).status, 400);
  r = await caio('POST', '/api/answer', { qid: 'fixture:2099:regular:open1', self: 2 });
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.awarded, r.body.stats.points], [0, 10]);
  assert.match(r.body.question.key.expected, /emulsifica/);
  // a lista do usuário mostra o gabarito só do que ele respondeu; o filtro de status usa as respostas
  r = await caio('GET', '/api/bank?status=answered');
  assert.ok(r.body.questions.every(q => q.key), 'respondidas trazem o gabarito');
  assert.equal((await anon('GET', '/api/bank')).body.questions.filter(q => q.key).length, 0);
  assert.equal((await caio('GET', '/api/bank?status=pending')).body.total, 2);
  assert.equal((await caio('GET', '/api/bank?status=answered')).body.total, 4);
  assert.deepEqual((await caio('GET', '/api/bank?status=wrong')).body.questions.map(q => q.id).sort(), ['fixture:2099:regular:mc4', 'fixture:2099:regular:tab1']);
  r = await caio('PUT', '/api/progress', { progress: { saved: ['fixture:2099:regular:mc5', 'nao-existe'] } });
  assert.equal((await caio('GET', '/api/me')).body.progress.saved.join(), 'fixture:2099:regular:mc5');
  r = await caio('GET', '/api/ranking');
  assert.equal(r.body.me.points, 10, 'pontos do banco entram no ranking');
  assert.equal(r.body.turma, null, 'sem turma, só o ranking geral');
  assert.deepEqual([r.body.geral.me.pos, r.body.geral.total], [r.body.me.pos, r.body.total]);

  // turmas: professor cria, aluno entra pelo código, professor aprova; ranking da turma só com aprovados
  const prof = client(), prof2 = client(), alu1 = client(), alu2 = client();
  r = await prof('POST', '/api/register', { name: 'Profa Lia', email: 'lia@x.com', password: 'senha-da-lia', professor: true });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.professor, true);
  assert.equal((await caio('POST', '/api/turmas', { nome: 'Turma X' })).status, 403, 'aluno não cria turma');
  assert.equal((await prof('POST', '/api/turmas', { nome: 'x' })).status, 400, 'nome curto');
  r = await prof('POST', '/api/turmas', { nome: 'Biologia 3A' });
  assert.equal(r.status, 201);
  const cod = r.body.turma.codigo, tid = r.body.turma.id;
  assert.match(cod, /^[A-HJ-NP-Z2-9]{6}$/, 'código sem 0/O/1/I');
  assert.equal((await prof2('POST', '/api/register', { name: 'Prof Bia', email: 'pbia@x.com', password: 'senha-da-bia1', professor: true })).status, 201);
  assert.equal((await caio('POST', '/api/turma/entrar', { codigo: 'ZZZZZZ' })).status, 404, 'código que não existe');
  assert.equal((await caio('POST', '/api/turma/entrar', { codigo: 'abc' })).status, 400, 'código malformado');
  assert.equal((await prof2('POST', '/api/turma/entrar', { codigo: cod })).status, 403, 'professor não entra em turma');
  assert.equal((await alu1('POST', '/api/register', { name: 'Davi', email: 'davi@x.com', password: 'senha-do-davi', codigoTurma: 'ZZZZZZ' })).status, 404, 'cadastro com código inválido avisa e não cria a conta');
  r = await alu1('POST', '/api/register', { name: 'Davi', email: 'davi@x.com', password: 'senha-do-davi', codigoTurma: cod.toLowerCase() });
  assert.deepEqual([r.status, r.body.turma.nome, r.body.turma.status, r.body.turma.professor], [201, 'Biologia 3A', 'pendente', 'Profa Lia']);
  assert.equal((await alu1('POST', '/api/turma/entrar', { codigo: cod })).status, 409, 'já tem pedido');
  await alu1('POST', '/api/answer', { qid: 'org1', sel: 0 });
  assert.equal((await alu1('GET', '/api/ranking')).body.turma, null, 'pendente não vê ranking de turma');
  r = await prof('GET', '/api/turmas');
  assert.deepEqual([r.body.turmas.length, r.body.turmas[0].pendentes.map(p => p.name), r.body.turmas[0].ranking.length], [1, ['Davi'], 0]);
  const daviId = r.body.turmas[0].pendentes[0].userId;
  assert.equal((await caio('GET', '/api/turmas')).status, 403);
  assert.equal((await prof2('POST', '/api/turmas/membro', { turmaId: tid, userId: daviId, acao: 'aprovar' })).status, 404, 'professor de outra turma não aprova');
  assert.equal((await prof('POST', '/api/turmas/membro', { turmaId: tid, userId: daviId, acao: 'dancar' })).status, 400);
  assert.equal((await prof('POST', '/api/turmas/membro', { turmaId: tid, userId: daviId, acao: 'aprovar' })).status, 200);
  r = await alu1('GET', '/api/ranking');
  assert.deepEqual([r.body.turma.nome, r.body.turma.total, r.body.turma.me.pos, r.body.geral.total > r.body.turma.total], ['Biologia 3A', 1, 1, true], 'aprovado vê turma e geral');
  // segundo aluno: recusado não entra; aprovado aparece com a própria posição
  assert.equal((await alu2('POST', '/api/register', { name: 'Eva', email: 'eva@x.com', password: 'senha-da-eva1', codigoTurma: cod })).status, 201);
  const evaId = (await prof('GET', '/api/turmas')).body.turmas[0].pendentes[0].userId;
  assert.equal((await prof('POST', '/api/turmas/membro', { turmaId: tid, userId: evaId, acao: 'recusar' })).status, 200);
  assert.equal((await alu2('GET', '/api/me')).body.turma, null, 'recusada sai da turma');
  assert.equal((await alu2('POST', '/api/turma/entrar', { codigo: cod })).status, 200);
  await prof('POST', '/api/turmas/membro', { turmaId: tid, userId: evaId, acao: 'aprovar' });
  r = await prof('GET', '/api/turmas');
  assert.deepEqual(r.body.turmas[0].ranking.map(x => x.name).sort(), ['Davi', 'Eva']);
  assert.equal((await caio('GET', '/api/ranking')).body.turma, null, 'quem não é da turma não a vê');
  assert.equal((await prof('POST', '/api/turmas/membro', { turmaId: tid, userId: evaId, acao: 'remover' })).status, 200);
  assert.equal((await alu2('POST', '/api/turma/sair', {})).status, 200);
  assert.equal((await prof2('POST', '/api/turmas/excluir', { turmaId: tid })).status, 404, 'só o dono exclui');
  assert.equal((await prof('PUT', '/api/me', { name: 'Profa Lia', email: 'lia@x.com', professor: false })).status, 409, 'professor com turma não deixa de ser professor');
  // excluir a conta do professor apaga a turma e libera os alunos
  assert.equal((await prof('DELETE', '/api/me', { password: 'senha-da-lia' })).status, 200);
  assert.equal((await alu1('GET', '/api/me')).body.turma, null);
  assert.equal((await alu1('GET', '/api/ranking')).body.turma, null);

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
