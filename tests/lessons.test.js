// Aulas: esquema do conteúdo, blocos conhecidos, figuras do registro, referências e profundidade mínima.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const QUIZZES = require('../quizzes.js');
const { MAX_LESSON_SECTIONS } = require('../core.js');

const PUB = path.join(__dirname, '..', 'public');
const IDS = QUIZZES.map(z => z.id);
const window = {};
const ctx = vm.createContext({ window, console });
for (const id of IDS) vm.runInContext(fs.readFileSync(path.join(PUB, 'lessons', id + '.js'), 'utf8'), ctx, { filename: id + '.js' });
vm.runInContext(fs.readFileSync(path.join(PUB, 'lessons.js'), 'utf8'), ctx, { filename: 'lessons.js' });
const L = window.AV_LESSONS, IMG = window.AV_IMG;
const BLOCKS = ['p', 'fig', 'cols', 'warn', 'recall', 'note', 'table', 'steps', 'ul', 'def'];
const SYSTEMS = ['digestorio', 'respiratorio', 'cardiovascular', 'urinario', 'nervoso', 'endocrino', 'esqueletico', 'muscular', 'tegumentar', 'linfatico', 'reprodutor'];
const str = s => typeof s === 'string' && s.trim().length > 0;
const words = lesson => JSON.stringify([lesson.secs, lesson.sint]).split(/[\s,"\[\]{}]+/).filter(w => /\p{L}/u.test(w)).length;

test('há uma aula para cada quiz da trilha, cada uma aprofundada', () => {
  for (const id of IDS) assert.ok(L[id], 'aula ' + id);
  for (const id of IDS) assert.ok(window.AV_LESSON_DEEP[id], 'conteúdo aprofundado de ' + id);
});

test('seções cabem no limite de progresso salvo no servidor e têm estrutura completa', () => {
  for (const id of IDS) {
    const D = L[id];
    assert.ok(D.secs.length >= 6 && D.secs.length < MAX_LESSON_SECTIONS, `${id}: ${D.secs.length} seções`);
    assert.ok(D.dur >= 40, id + ': duração');
    assert.ok(str(D.lead) && str(D.title), id + ': título e abertura');
    assert.ok(D.goals.length >= 4 && D.goals.every(str), id + ': objetivos');
    D.secs.forEach((s, i) => {
      assert.ok(str(s.t) && str(s.h) && str(s.ch), `${id}#${i}: título, chamada e capítulo`);
      assert.ok(s.m && (Array.isArray(s.m.sys) || s.m.micro), `${id}#${i}: vista do modelo 3D`);
      assert.ok((s.m.sys || []).every(x => SYSTEMS.includes(x)), `${id}#${i}: sistemas do modelo`);
      assert.ok(s.b.length >= 2, `${id}#${i}: blocos`);
    });
  }
});

test('todo bloco é de um tipo conhecido e bem formado', () => {
  for (const id of IDS) for (const [i, s] of L[id].secs.entries()) for (const b of s.b) {
    const where = `${id}#${i}`;
    const kinds = BLOCKS.filter(k => k in b);
    assert.equal(kinds.length, 1, `${where}: bloco com tipo único ${JSON.stringify(Object.keys(b))}`);
    const k = kinds[0];
    if (k === 'p') assert.ok(str(b.p), where);
    if (k === 'fig') assert.ok(IMG[b.fig] && str(b.cap), `${where}: figura ${b.fig} no registro com legenda`);
    if (k === 'cols') assert.ok(b.cols.length >= 2 && b.cols.every(c => str(c[0]) && str(c[1])), where);
    if (k === 'warn' || k === 'note' || k === 'recall') assert.ok(str(b[k][0]) && str(b[k][1]), `${where}: ${k}`);
    if (k === 'table') {
      const t = b.table;
      assert.ok(str(t.cap) && t.head.length >= 2 && t.rows.length >= 2, `${where}: tabela`);
      for (const r of t.rows) assert.equal(r.length, t.head.length, `${where}: tabela "${t.cap}" linha com ${r.length} colunas`);
      assert.ok(t.rows.flat().every(c => typeof c === 'string'), where);
    }
    if (k === 'steps') assert.ok(str(b.steps.t) && b.steps.items.length >= 3 && b.steps.items.every(str), `${where}: passos`);
    if (k === 'ul') assert.ok(b.ul.length >= 2 && b.ul.every(str), where);
    if (k === 'def') assert.ok(b.def.length >= 2 && b.def.every(d => str(d[0]) && str(d[1])), where);
  }
});

test('síntese, flashcards, temas de vestibular e referências', () => {
  for (const id of IDS) {
    const D = L[id];
    assert.ok(str(D.sint.text) && D.sint.conf.length >= 3 && D.sint.conf.every(c => str(c[0]) && str(c[1])), id + ': síntese');
    assert.ok(D.sint.cards.length >= 6 && D.sint.cards.every(c => str(c[0]) && str(c[1])), id + ': flashcards');
    assert.ok(D.enem.length >= 4 && D.enem.every(str), id + ': temas de vestibular');
    assert.ok(D.refs.length >= 2, id + ': referências');
    for (const r of D.refs) assert.ok(str(r[0]) && /^https:\/\//.test(r[1]) && str(r[2]), `${id}: referência ${r[0]}`);
    assert.ok(D.refs.some(r => /openstax|oregonstate/.test(r[1])), id + ': referência de livro aberto');
  }
});

test('referências a OpenStax declaram a licença real (NC-SA) e que o texto é próprio', () => {
  for (const id of IDS) for (const r of L[id].refs.filter(x => /openstax/.test(x[1]))) {
    assert.match(r[2], /CC BY-NC-SA 4\.0/);
    assert.match(r[2], /texto próprio/);
  }
});

test('nenhum texto com marcadores esquecidos, caracteres quebrados ou espaços duplicados', () => {
  for (const id of IDS) {
    const t = JSON.stringify([L[id].secs, L[id].sint, L[id].lead, L[id].goals, L[id].enem]);
    assert.ok(!/TODO|FIXME|undefined|�|lorem ipsum/.test(t), id);
    assert.ok(!/ {2,}/.test(t.replace(/\n/g, ' ')), id + ': espaços duplicados');
  }
});

test('profundidade: cada aula tem conteúdo substancial e ao menos uma tabela e um passo a passo', () => {
  const sizes = {};
  for (const id of IDS) {
    const D = L[id], all = D.secs.flatMap(s => s.b);
    sizes[id] = words(D);
    assert.ok(sizes[id] >= 1400, `${id}: só ${sizes[id]} palavras`);
    assert.ok(all.some(b => b.table), id + ': tem tabela');
    assert.ok(all.some(b => b.steps), id + ': tem passo a passo');
    assert.ok(all.some(b => b.warn), id + ': tem erro comum');
  }
  console.log('palavras por aula:', JSON.stringify(sizes));
});

test('termos que viram link para o modelo apontam para sistemas existentes', () => {
  for (const t of window.AV_TERMS) assert.ok(SYSTEMS.includes(t[1]) || t[1] === 'cardiovascular', 'termo ' + t[0] + ' → ' + t[1]);
});

test('o registro de imagens tem legenda e crédito/licença para todas as figuras usadas', () => {
  const used = new Set(IDS.flatMap(id => L[id].secs.flatMap(s => s.b.filter(b => b.fig).map(b => b.fig))));
  for (const k of used) {
    assert.ok(str(IMG[k].alt) && str(IMG[k].credit), k);
    assert.ok(fs.existsSync(path.join(PUB, IMG[k].src)), 'arquivo ' + IMG[k].src);
  }
});
