// Banco oficial: portão de publicação, paginação, filtros, vazamento de gabarito e isolamento de staging.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadBank, makeBank, problems, query, facets, catalog, isStaging, SYSTEM_TOPICS, MAX_LIMIT } = require('../bank.js');
const { createCore } = require('../core.js');

const FIXTURE = path.join(__dirname, 'fixtures', 'bank');
const PUB = path.join(__dirname, '..', 'public');
const load = (extra = {}) => loadBank({ dir: FIXTURE, publicDir: PUB, ...extra });
const first = () => JSON.parse(JSON.stringify(load().byId.get('fixture:2099:regular:mc5')));
const withTmpBank = (items, fn) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bank-'));
  fs.writeFileSync(path.join(dir, 'x.json'), JSON.stringify({ questions: items }));
  try { return fn(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
};

test('carrega a fixture: 6 itens, ordenados por ano decrescente', () => {
  const b = load();
  assert.equal(b.questions.length, 6);
  assert.deepEqual(b.questions.map(q => q.year), [2099, 2098, 2097, 2096, 2095, 2094]);
});

test('o comentário é opcional; se existir, precisa ser autoral e ter autoria', () => {
  const q = first(); delete q.expl;
  assert.deepEqual(problems(q), [], 'sem comentário pode ser servido');
  const sem = load().byId.get('fixture:2099:regular:tab1');
  assert.equal(sem.expl, undefined);
  const bad = first(); bad.science = {};
  assert.ok(problems(bad).some(p => /autoria/.test(p)), 'comentário sem autoria registrada é recusado');
});

test('item de pré-visualização não passa no carregador de produção, e vice-versa', () => {
  const q = first(); q.status = 'preview'; q.rights = { status: 'needs_authorization' };
  assert.ok(problems(q).length >= 2, 'produção recusa');
  assert.deepEqual(problems(q, { preview: true }), [], 'a pré-visualização aceita');
  const pub = first();
  assert.ok(problems(pub, { preview: true }).some(p => /preview/.test(p)), 'item publicado não vale como pré-visualização');
  assert.throws(() => withTmpBank([q], dir => loadBank({ dir, publicDir: PUB })), /Banco inválido/);
});

test('catálogo: todos os sistemas e temas, com a contagem real', () => {
  const c = load().catalog();
  assert.deepEqual(c.map(x => x.id), SYSTEM_TOPICS.map(x => x.id));
  const dig = c.find(x => x.id === 'digestorio');
  assert.equal(dig.total, 3);
  assert.deepEqual(dig.topics.map(t => [t.name, t.count]), [['Digestão mecânica e química', 1], ['Absorção no intestino delgado', 1], ['Fígado e pâncreas', 1]]);
  assert.equal(c.find(x => x.id === 'nervoso').total, 0);
  assert.ok(c.find(x => x.id === 'nervoso').topics.every(t => t.count === 0), 'tema vazio aparece com 0, sem inventar questões');
  assert.equal(catalog([]).reduce((n, s) => n + s.total, 0), 0);
});

test('os temas de Provas espelham os do classificador (taxonomy.json)', () => {
  const tax = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools', 'ingest', 'taxonomy.json'), 'utf8')).systems;
  assert.deepEqual(SYSTEM_TOPICS.map(s => s.id).sort(), Object.keys(tax).sort());
  for (const s of SYSTEM_TOPICS) assert.deepEqual(s.topics, Object.keys(tax[s.id].topics), s.id);
});

test('forSystem: só múltipla escolha do sistema, em ordem determinística e limitada', () => {
  const b = load();
  assert.deepEqual(b.forSystem('digestorio', 5).map(q => q.id), ['fixture:2099:regular:mc5', 'fixture:2099:regular:tab1']);
  assert.equal(b.forSystem('digestorio', 1).length, 1);
  assert.deepEqual(b.forSystem('nervoso', 5), []);
  assert.deepEqual(makeBank([]).catalog().map(x => x.total).filter(Boolean), []);
});

test('o portão recusa item sem direitos liberados por responsável', () => {
  for (const mut of [q => { q.rights.status = 'needs_authorization'; }, q => { q.rights.decided_by = null; }, q => { q.rights.basis = ''; }, q => { delete q.rights; }]) {
    const q = first(); mut(q);
    assert.ok(problems(q, { publicDir: PUB }).some(p => /direitos/.test(p)), 'deveria recusar');
    assert.throws(() => withTmpBank([q], dir => loadBank({ dir, publicDir: PUB })), /Banco inválido/);
  }
});

test('o portão recusa: não publicado, comentário não autoral, sem proveniência, sistema desconhecido', () => {
  const cases = [
    [q => { q.status = 'approved'; }, /published/],
    [q => { q.expl.autoral = false; }, /comentário autoral/],
    [q => { q.science = {}; }, /autoria/],
    [q => { q.appearances = []; }, /proveniência/],
    [q => { q.appearances[0].pdf_url = 'http://x'; }, /proveniência/],
    [q => { q.system = 'astrologia'; }, /sistema/],
    [q => { q.id = 'Enem 2023 1'; }, /id inválido/],
    [q => { q.type = 'ORIGINAL_PRACTICE'; }, /VERIFIED_OFFICIAL/],
  ];
  for (const [mut, re] of cases) { const q = first(); mut(q); assert.ok(problems(q).some(p => re.test(p)), String(re)); }
});

test('número de alternativas é o do item (4 ou 5), não fixo', () => {
  const b = load();
  assert.equal(b.byId.get('fixture:2099:regular:mc5').opts.length, 5);
  assert.equal(b.byId.get('fixture:2099:regular:mc4').opts.length, 4);
  const q = first(); q.opts = q.opts.slice(0, 3); q.ans = 2; q.expl.why = q.expl.why.slice(0, 3);
  assert.deepEqual(problems(q), [], '3 alternativas também é um formato válido');
  q.ans = 3;
  assert.ok(problems(q).some(p => /gabarito fora/.test(p)));
});

test('comentário: um por alternativa e só o gabarito começa com "Correta"', () => {
  let q = first(); q.expl.why.pop();
  assert.ok(problems(q).some(p => /um comentário por alternativa/.test(p)));
  q = first(); q.expl.why[0] = 'Correta. Engano.';
  assert.ok(problems(q).some(p => /só o gabarito/.test(p)));
  q = first(); q.expl.why[2] = 'Está certa.';
  assert.ok(problems(q).some(p => /começar com "Correta"/.test(p)));
});

test('figuras exigem texto alternativo e arquivo existente em public/img/q', () => {
  let q = first(); q.stem.push({ t: 'fig', src: 'img/q/nao-existe/f.png', alt: 'x' });
  assert.ok(problems(q, { publicDir: PUB }).some(p => /figura inexistente/.test(p)));
  q = first(); q.stem.push({ t: 'fig', src: 'img/logo.png', alt: 'x' });
  assert.ok(problems(q, { publicDir: PUB }).some(p => /figura inexistente/.test(p)), 'só img/q/ vale');
  q = first(); q.stem.push({ t: 'fig', src: 'img/q/../logo.png', alt: 'x' });
  assert.ok(problems(q, { publicDir: PUB }).some(p => /figura inexistente/.test(p)), 'sem ..');
  q = first(); q.stem.push({ t: 'fig', src: 'img/q/x.png', alt: '' });
  assert.ok(problems(q).some(p => /sem texto alternativo/.test(p)));
  q = first(); q.opts[0] = { fig: 'img/q/x.png' };
  assert.ok(problems(q).some(p => /alternativa vazia/.test(p)));
});

test('ids repetidos ou colidindo com quizzes quebram a carga', () => {
  const q = first();
  assert.throws(() => withTmpBank([q, q], dir => loadBank({ dir, publicDir: PUB })), /id repetido/);
  assert.throws(() => load({ reserved: new Set([q.id]) }), /id repetido/);
});

test('discursiva: sem alternativas, resposta esperada texto ou null', () => {
  const q = JSON.parse(JSON.stringify(load().byId.get('fixture:2099:regular:open1')));
  assert.deepEqual(problems(q), []);
  q.expected = null;
  assert.deepEqual(problems(q), [], 'sem resposta oficial publicada é aceito');
  q.opts = [{ text: 'x' }];
  assert.ok(problems(q).some(p => /discursiva/.test(p)));
});

test('staging nunca é servido: pasta de staging é recusada e itens de staging não passam no portão', () => {
  assert.ok(isStaging('D:/proj/staging/items'));
  assert.ok(isStaging(path.join('x', 'staging')));
  assert.ok(!isStaging('D:/proj/questions/official'));
  assert.throws(() => loadBank({ dir: path.join(os.tmpdir(), 'staging', 'items'), publicDir: PUB }), /staging/);
  const stagingLike = { ...first(), stage: 'pending_science', status: 'extracted', rights: { status: 'needs_authorization' } };
  delete stagingLike.science;
  assert.ok(problems(stagingLike).length >= 3);
});

test('paginação: limite entre 1 e MAX_LIMIT, página dentro do intervalo', () => {
  const qs = Array.from({ length: 23 }, (_, i) => ({ id: 'a:2000:r:' + i, year: 2000 + (i % 5), system: 'x', inst: 'enem', diff: 'Básica', kind: 'mc', topic: 't', stem: [{ text: 'enunciado ' + i }], opts: [] }));
  let r = query(qs, { limit: 10, page: 1 });
  assert.deepEqual([r.total, r.pages, r.items.length], [23, 3, 10]);
  r = query(qs, { limit: 10, page: 3 }); assert.equal(r.items.length, 3);
  r = query(qs, { limit: 10, page: 99 }); assert.equal(r.page, 3, 'página além do fim vira a última');
  r = query(qs, { limit: 10000 }); assert.equal(r.limit, MAX_LIMIT);
  r = query(qs, { limit: -4 }); assert.equal(r.limit, 1);
  r = query(qs, { limit: 'abc', page: 'x' }); assert.deepEqual([r.limit, r.page], [10, 1]);
  r = query([], {}); assert.deepEqual([r.total, r.pages, r.page], [0, 1, 1]);
});

test('filtros e facetas: contagem de cada faceta ignora o próprio filtro', () => {
  const b = load();
  assert.equal(b.query({ system: 'digestorio' }).total, 3);
  assert.equal(b.query({ system: 'digestorio', kind: 'open' }).total, 1);
  assert.equal(b.query({ year: '2098' }).items[0].id, 'fixture:2099:regular:mc4');
  assert.equal(b.query({ diff: 'Avançada' }).total, 1);
  assert.equal(b.query({ text: 'bile' }).total, 1);
  assert.equal(b.query({ text: 'ABSORÇÃO nutrientes' }).total, 1, 'busca sem acento nem caixa');
  assert.equal(b.query({ system: 'nao-existe' }).total, 0);
  const f = b.facets({ system: 'digestorio' });
  assert.deepEqual(f.system.map(x => x.value).sort(), ['cardiovascular', 'digestorio', 'respiratorio'], 'faceta de sistema ignora o filtro de sistema');
  assert.deepEqual(f.kind.map(x => [x.value, x.count]), [['mc', 2], ['open', 1]]);
  assert.deepEqual(f.year.map(x => x.value), [2099, 2097, 2096], 'anos em ordem decrescente');
});

// ── Vazamento: nada que revele a resposta antes do envio ──
const { viewBankQ, viewQuizzes } = createCore({ quizzes: require('../quizzes.js'), bank: load() });
const LEAK_KEYS = ['ans', 'expl', 'why', 'expected', 'perm', 'key', 'basis', 'rights', 'science', 'steps', 'explanation_by'];
const walk = (v, fn, p = '') => { if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { fn(k, p + '.' + k); walk(x, fn, p + '.' + k); } };

test('vista pré-resposta: sem chaves reveladoras (varredura recursiva) e sem texto do comentário', () => {
  for (const q of load().questions) {
    const v = viewBankQ(q);
    walk(v, (k, p) => assert.ok(!LEAK_KEYS.includes(k), `chave proibida ${p}`));
    const s = JSON.stringify(v);
    if (q.expl) {
      assert.ok(!s.includes(q.expl.text), 'comentário vazou');
      for (const w of q.expl.why) if (w) assert.ok(!s.includes(w), 'comentário de alternativa vazou');
    }
    if (q.expected) assert.ok(!s.includes(q.expected.text), 'resposta esperada vazou');
    assert.equal(v.key, undefined);
    assert.equal(v.sel, undefined);
  }
});

test('vista do aluno é enxuta: só prova e ano, enunciado, alternativas e o link da prova', () => {
  const real = { ...JSON.parse(JSON.stringify(first())), inst: 'enem', year: 2023 };
  const v = viewBankQ(real);
  assert.deepEqual(Object.keys(v).sort(), ['bank', 'id', 'kind', 'label', 'opts', 'srcUrl', 'stem', 'system', 'topic']);
  assert.equal(v.label, 'ENEM 2023');
  assert.equal(v.srcUrl, 'https://example.org/fixture.pdf');
  for (const nome of ['booklet', 'page', 'pdfUrl', 'src', 'diff', 'pts', 'thirdParty', 'type', 'phase', 'edition', 'lessons'])
    assert.ok(!(nome in v), 'metadado técnico no card: ' + nome);
  assert.equal(v.opts.length, 5);
});

test('item fictício (fixture) nunca se passa por prova real: rótulo próprio e sem link', () => {
  const v = viewBankQ(load().byId.get('fixture:2099:regular:mc5'));
  assert.equal(v.label, 'Questão fictícia');
  assert.equal(v.srcUrl, null);
  assert.doesNotMatch(JSON.stringify({ ...v, id: undefined }), /FIXTURE|TESTE/i, 'só o id interno carrega o prefixo');
});

test('vista pós-resposta: gabarito; comentário só se verificado por pessoa', () => {
  const b = load();
  const v = viewBankQ(b.byId.get('fixture:2099:regular:mc5'), { sel: 0, correct: 0, points: 0 });   // explanation_human: true
  assert.equal(v.key.ans, 2);
  assert.match(v.key.text, /superfície de absorção/);
  assert.deepEqual(Object.keys(v.key).sort(), ['ans', 'expected', 'text']);
  const naoVerificado = viewBankQ(b.byId.get('fixture:2099:regular:mc4'), { sel: 1, correct: 0, points: 0 });   // explanation_human: false
  assert.equal(naoVerificado.key.ans, 0);
  assert.equal(naoVerificado.key.text, null, 'comentário sem revisão humana não vai para o aluno');
  const semComentario = viewBankQ(b.byId.get('fixture:2099:regular:tab1'), { sel: 1, correct: 1, points: 15 });
  assert.equal(semComentario.key.text, null);
  const o = viewBankQ(b.byId.get('fixture:2099:regular:open1'), { sel: 1, correct: 0, points: 0 });
  assert.equal(o.key.ans, null);
  assert.match(o.key.expected, /emulsifica/);
});

test('quiz da aula recebe até 10 questões reais do sistema, sem gabarito, fora de total e bônus', () => {
  const zs = viewQuizzes([]);
  const dig = zs.find(z => z.id === 'digestorio'), org = zs.find(z => z.id === 'organizacao');
  assert.deepEqual(dig.official.map(q => q.id), ['fixture:2099:regular:mc5', 'fixture:2099:regular:tab1']);
  assert.deepEqual(org.official, []);
  assert.ok(dig.official.every(q => q.key === undefined));
  const sem = viewQuizzes([]).find(z => z.id === 'digestorio');
  assert.equal(sem.total, require('../quizzes.js').find(z => z.id === 'digestorio').questions.length, 'total conta só as autorais');
  const depois = viewQuizzes([{ qid: 'fixture:2099:regular:mc5', sel: 2, correct: 1, points: 10 }]).find(z => z.id === 'digestorio');
  assert.equal(depois.official[0].key.ans, 2);
  assert.equal(depois.answered, 0, 'responder uma oficial não conta como quiz respondido');
  assert.equal(depois.earned, 0, 'nem entra nos pontos do quiz (pontuam pelas regras do banco)');
});
