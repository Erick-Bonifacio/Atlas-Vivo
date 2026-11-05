// Regras do core.js: pontuação, níveis, medalhas, saneamento do progresso e correção das respostas.
// Garante que a extração do server.js não mudou o comportamento dos quizzes da trilha.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const QUIZZES = require('../quizzes.js');
const { loadBank } = require('../bank.js');
const { createCore, PTS, QUIZ_BONUS, LESSON_PTS, LEVEL_STEP, TITLES, MAX_LESSON_SECTIONS } = require('../core.js');

const bank = loadBank({ dir: path.join(__dirname, 'fixtures', 'bank'), publicDir: path.join(__dirname, '..', 'public') });
const parts = new Map([['p1', 'Fígado'], ['p2', 'Estômago']]);
for (const z of QUIZZES) for (const q of z.questions) if (q.kind === 'model') q.ids = q.ids || ['p1'];
const core = createCore({ quizzes: QUIZZES, bank, partName: parts });
const row = (qid, sel, correct, points) => ({ qid, sel, pick: null, correct, points });
const user = progress => ({ progress });

test('constantes de pontuação preservadas (e Avançada para questões oficiais)', () => {
  assert.deepEqual(PTS, { 'Básica': 10, 'Intermediária': 15, 'Avançada': 20 });
  assert.deepEqual([QUIZ_BONUS, LESSON_PTS, LEVEL_STEP, TITLES.length], [20, 30, 150, 8]);
});

test('sem respostas: zero pontos, nível 1, nenhuma medalha', () => {
  const s = core.stats(user({}), []);
  assert.equal(s.points, 0);
  assert.equal(s.level, 1);
  assert.equal(s.title, 'Calouro');
  assert.ok(s.badges.every(b => !b.earned));
  assert.equal(s.quizzesTotal, QUIZZES.length);
});

test('cenário do E2E: quiz de organização completo = 10+10+15 + bônus 20', () => {
  const rows = [row('org1', 1, 1, 10), row('org2', 2, 1, 10), row('org3', 0, 1, 15)];
  const s = core.stats(user({}), rows);
  assert.equal(s.points, 55);
  assert.equal(s.quizzesDone, 1);
  assert.ok(s.badges.find(b => b.name === 'Na mosca').earned);
  assert.ok(s.badges.find(b => b.name === 'Primeiro passo').earned);
});

test('quiz incompleto não ganha bônus', () => {
  assert.equal(core.stats(user({}), [row('org1', 1, 1, 10), row('org2', 0, 0, 0)]).points, 10);
});

test('aula concluída vale 30; cardiovascular usa lessonDone; nível sobe a cada 150', () => {
  assert.equal(core.stats(user({ lessonDone: true }), []).points, 30);
  assert.equal(core.stats(user({ ls: { digestorio: { d: true } } }), []).points, 30);
  assert.equal(core.stats(user({ ls: { cardiovascular: { d: true } } }), []).points, 0, 'o aprofundamento do cardiovascular não pontua: só lessonDone');
  const rows = [row('org1', 1, 1, 10)];
  const s = core.stats(user({ lessonDone: true, ls: Object.fromEntries(['digestorio', 'respiratorio', 'urinario', 'nervoso', 'endocrino'].map(id => [id, { d: true }])) }), rows);
  assert.equal(s.points, 10 + 6 * 30);
  assert.equal(s.level, 2);
  assert.equal(s.floor, 150);
  assert.equal(s.next, 300);
});

test('questões oficiais: valem pontos e contam como respondidas, sem bônus de quiz', () => {
  const rows = [row('fixture:2099:regular:mc5', 2, 1, 10), row('fixture:2099:regular:mc4', 1, 0, 0)];
  const s = core.stats(user({}), rows);
  assert.equal(s.points, 10);
  assert.equal(s.answered, 2);
  assert.equal(s.correct, 1);
  assert.equal(s.bankAnswered, 2);
  assert.equal(s.quizzesDone, 0);
});

test('ranking: respostas de ids desconhecidos não somam pontos', () => {
  assert.equal(core.stats(user({}), [row('lixo', 0, 1, 999)]).points, 0);
});

test('saneamento do progresso: aceita só valores conhecidos e dentro das faixas', () => {
  const c = core.cleanProgress({ sec: 5, visited: [0, 1, 99, 'x'], lessonDone: true, saved: ['org1', 'falsa', 'fixture:2099:regular:mc5'], lixo: 1, last: 'nada',
    ls: { digestorio: { s: 2, v: [0, 1, 2, 77], d: false }, falsa: { d: true }, cardiovascular: { d: true } } });
  assert.deepEqual(c, { sec: 5, visited: [0, 1], step: 0, fc: 0, fcRes: {}, saved: ['org1', 'fixture:2099:regular:mc5'], lessonDone: true,
    ls: { digestorio: { s: 2, v: [0, 1, 2], d: false }, cardiovascular: { s: 0, v: [], d: true } }, last: null });
  assert.deepEqual(core.cleanProgress(null).visited, []);
});

test('aulas aprofundadas: até 20 seções por aula; acima disso é descartado', () => {
  const max = MAX_LESSON_SECTIONS - 1;
  const c = core.cleanProgress({ ls: { digestorio: { s: max, v: [0, max, max + 1], d: true } } });
  assert.deepEqual(c.ls.digestorio, { s: max, v: [0, max], d: true });
  assert.equal(core.cleanProgress({ ls: { digestorio: { s: max + 1 } } }).ls.digestorio.s, 0);
});

test('correção de questão de múltipla escolha da trilha e do banco', () => {
  const q1 = core.QBYID.get('q1').q;
  assert.deepEqual(core.grade(q1, { sel: q1.ans }), { sel: q1.ans, pick: null, correct: 1, points: 10 });
  assert.equal(core.grade(q1, { sel: (q1.ans + 1) % q1.opts.length }).points, 0);
  assert.throws(() => core.grade(q1, { sel: 9 }), /Alternativa inválida/);
  assert.throws(() => core.grade(q1, { sel: '1' }), /Alternativa inválida/);
  const f5 = core.QBYID.get('fixture:2099:regular:mc5').q, f4 = core.QBYID.get('fixture:2099:regular:mc4').q;
  assert.equal(core.grade(f5, { sel: 2 }).points, 10, 'Básica');
  assert.equal(core.grade(f4, { sel: 0 }).points, 20, 'Avançada');
  assert.throws(() => core.grade(f4, { sel: 4 }), /Alternativa inválida/, 'o item de 4 alternativas não aceita a 5ª');
  assert.equal(core.grade(f5, { sel: 4 }).correct, 0, 'o item de 5 aceita');
});

test('questão discursiva: autoavaliação, nunca pontua', () => {
  const o = core.QBYID.get('fixture:2099:regular:open1').q;
  for (const self of [0, 1, 2]) assert.deepEqual(core.grade(o, { self }), { sel: self, pick: null, correct: 0, points: 0 });
  assert.throws(() => core.grade(o, { self: 3 }), /autoavaliação/);
  assert.throws(() => core.grade(o, { sel: 0 }), /autoavaliação/);
});

test('questão de modelo 3D exige estrutura válida do atlas', () => {
  const m = QUIZZES.flatMap(z => z.questions).find(q => q.kind === 'model');
  assert.throws(() => core.grade(m, { part: 'nao-existe' }), /estrutura/);
  assert.deepEqual(core.grade(m, { part: 'p1' }).pick, 'p1');
});

test('ids de banco colidindo com a trilha são recusados', () => {
  const fake = { questions: [{ ...bank.questions[0], id: 'org1' }] };
  assert.throws(() => createCore({ quizzes: QUIZZES, bank: fake }), /repetido/);
});

test('viewQ da trilha continua sem gabarito antes de responder', () => {
  const v = core.viewQ(core.QBYID.get('q1').q);
  assert.equal(v.key, undefined);
  assert.equal(v.ans, undefined);
  assert.equal(core.viewQ(core.QBYID.get('q1').q, row('q1', 2, 1, 10)).key.ans, 2);
});

test('simulado: sorteio em rodízio entre sistemas, só múltipla escolha, sem repetir', () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ids = core.pickSim(rnd);
  const qs = ids.map(id => core.QBYID.get(id).q);
  assert.equal(ids.length, bank.questions.filter(q => q.kind === 'mc').length, 'fixture tem menos de 10: usa todas');
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(qs.every(q => q.kind === 'mc'));
  const nSys = new Set(qs.map(q => q.system)).size;
  assert.equal(new Set(qs.slice(0, nSys).map(q => q.system)).size, nSys, 'uma de cada sistema antes de repetir sistema');
});

test('simulado: relatório agrupa erros e brancos por tema; tudo certo sugere sistemas de fora', () => {
  const ids = bank.questions.filter(q => q.kind === 'mc').map(q => q.id);
  const ans = ids.map(id => core.QBYID.get(id).q.ans);
  const all = core.reportSim(ids, ans);
  assert.deepEqual([all.score, all.total, all.recs.length], [ids.length, ids.length, 0]);
  const one = core.reportSim(ids.slice(0, 1), ans.slice(0, 1));
  const q0 = core.QBYID.get(ids[0]).q;
  assert.ok(one.next.length > 0 && !one.next.includes(q0.system), 'sugere só sistemas fora do simulado');
  const r = core.reportSim(ids, ans.map((a, i) => (i === 0 ? null : i === 1 ? a + 1 : a)));
  assert.equal(r.score, ids.length - 2);
  assert.deepEqual([r.items[0].answered, r.items[0].correct, r.items[1].answered], [false, false, true]);
  assert.equal(r.recs.reduce((n, x) => n + x.n, 0), 2);
  assert.deepEqual(r.next, [], 'com erro, recomenda estudo em vez de desafio');
  assert.ok(!JSON.stringify(r).includes('"ans"'), 'sem gabarito no relatório');
  assert.equal(core.reportSim(['nao-existe', ids[0]], [0, ans[0]]).total, 1, 'questão retirada do banco não quebra o relatório');
});
