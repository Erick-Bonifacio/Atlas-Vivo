// Contrato da interface (index.html): a folha de questão mostra só o que o aluno precisa e o fluxo original
// (sistema → aula → quiz → progresso) continua inteiro. Lê o template como texto: não abre navegador.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const sheet = (() => { const a = html.indexOf('<article class="qs"'); return html.slice(a, html.indexOf('</article>', a)); })();
const bindings = s => [...s.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map(m => m[1]);

test('a folha de questão não tem metadados técnicos nem administrativos', () => {
  const proibidos = [/booklet|caderno/i, /\bpage\b|página/i, /\bdiff|dificuldade/i, /\bpts\b|\.points|vale\b/i, /third|terceiros/i, /authorship|autoria|revisad/i,
    /proveni|origem|licen|direitos|rights|status|stage|valid/i, /\.id\b|\bqid\b/i, /fixture|teste/i];
  for (const b of bindings(sheet)) for (const re of proibidos) assert.ok(!re.test(b), `binding "${b}" casa ${re}`);
  const texto = sheet.replace(/\{\{[^}]*\}\}/g, '').replace(/<[^>]+>/g, ' ');
  for (const re of proibidos.slice(0, 7)) assert.ok(!re.test(texto), `texto fixo da folha casa ${re}`);
});

test('a folha tem exatamente o que foi pedido: prova e ano, enunciado, alternativas, confirmar, gabarito e link da prova', () => {
  for (const parte of ['Q.label', 'Q.blocks', 'alts', 'Q.confirm', 'fb.', 'Q.srcUrl', 'Q.hasText']) assert.ok(sheet.includes('{{ ' + parte) || sheet.includes(parte), parte);
  assert.match(sheet, /Q.srcLabel/);
  assert.match(html, /'Ver prova original'/);
  assert.match(sheet, /type="radio"/, 'alternativas são rádios nativos: setas e foco de teclado');
});

test('nenhum selo antigo de questão oficial nem texto técnico sobrou na interface', () => {
  for (const re of [/Questão oficial ·/, /Origem:/, /Material de terceiros/, /Resolução escrita para o Atlas Vivo/, /sem revisão humana independente/, /\[FIXTURE/, /TESTE 20/]) assert.ok(!re.test(html), String(re));
});

test('o aprofundamento do cardiovascular faz parte da aula: sem botão "Aprofundar" e com 6 + 8 seções', () => {
  assert.ok(!/goDeep|Aprofundar:/.test(html));
  const secs = html.match(/const SECS=\[([^\]]*)\]/)[1].split(',').filter(Boolean);
  assert.equal(secs.length, 6);
  global.window = { AV_LESSON_DEEP: undefined };
  require('../public/lessons/cardiovascular.js');
  assert.equal(global.window.AV_LESSON_DEEP.cardiovascular.secs.length, 8);
  delete global.window;
});

test('a trilha original continua: nav, quizzes, 3D e gamificação intactos', () => {
  for (const trecho of ['Trilha de estudo', 'Quizzes', 'Questões</button>', 'atlas-3d-v2', 'Concluir aula e ir para a síntese', 'Nível {{ acct.level }}', 'Medalhas', 'Ranking', 'Quiz completo: +20']) assert.ok(html.includes(trecho), trecho);
});

test('Questões segue sistema → tema → questões, sem barra de filtros', () => {
  for (const trecho of ['PV.l1', 'PV.l2', 'PV.l3', 'PV.systems', 'PV.topics']) assert.ok(html.includes(trecho), trecho);
  assert.ok(!/B\.groups|Filtros do banco/.test(html));
});

test('estado vazio honesto: nunca inventa contagem', () => {
  assert.match(html, /Ainda não há questões de vestibular disponíveis/);
  assert.match(html, /Ainda sem questões liberadas/);
});

test('sons de acerto e erro, pontos no selo e turmas: contrato da interface', () => {
  assert.match(html, /const sfx=kind=>/);
  assert.match(html, /sfx\(ok&&d\.levelUp\?'nivel':ok\?'ok':'erro'\)/, 'answer() toca o som conforme o resultado');
  assert.match(html, /q2\.kind!=='open'/, 'discursiva não toca som');
  assert.match(html, /class="av-badge \{\{ gain\.cls \}\}"/, 'o selo anima ao ganhar pontos');
  assert.match(html, /aria-live="polite">\{\{ gain\.sr \}\}/, 'ganho anunciado para leitor de tela');
  assert.ok(!/\{\{[^}]*(pts|points)[^}]*\}\}/.test(sheet), 'o card da questão continua sem pontos');
  for (const t of ['Sou professor(a)', 'Código da turma', 'Minhas turmas', 'Minha turma', 'rkTabs.show']) assert.ok(html.includes(t), t);
});

test('o 3D não mostra as estruturas do pênis', () => {
  const js = fs.readFileSync(path.join(__dirname, '..', 'public', 'atlas3d-v2.js'), 'utf8');
  for (const id of ['FMA18247', 'FMA19618', 'FMA19617nsn']) assert.ok(js.includes(id), id);
  assert.match(js, /man\.parts=man\.parts\.filter\(p=>!NO_SHOW\.has\(p\.id\)\)/);
  assert.match(js, /localClippingEnabled=true/);
});

test('volume dos sons: controle em Minha conta, guardado no navegador, 0 desliga', () => {
  assert.match(html, /let AC=null,OUT=null,VOL=15;/);
  assert.match(html, /if\(VOL<=0\)return;/);
  assert.match(html, /mv\.gain\.value=VOL\/100/, 'o volume escala o ganho dos sons');
  assert.match(html, /'lessonId','vol3']\.concat\(PROG\)/, 'volume entra na persistência local');
  assert.match(html, /aria-label="Volume dos sons de acerto e erro"/);
  for (const t of ['Ouvir acerto', 'Ouvir erro']) assert.ok(html.includes(t), t);
});

test('linguagem visual: títulos em fonte própria, sem rótulos em caixa alta, setas decorativas nem metadado com ponto médio', () => {
  assert.match(html, /@font-face\{font-family:'Bricolage Grotesque'/);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', 'fonts', 'bricolage-grotesque.woff2')));
  assert.match(html, /h1,h2,h3,h4,\.av-d\{font-family:'Bricolage Grotesque'/);
  const corpo = html.slice(html.indexOf('<main'), html.indexOf('</footer>'));
  // caixa alta só no código da turma, que o aluno digita em maiúsculas
  const caixaAlta = corpo.split('\n').filter(l => /text-transform:uppercase/.test(l) && !/Código da turma/.test(l));
  assert.equal(caixaAlta.length, 0, caixaAlta.map(l => l.slice(0, 80)).join('\n'));
  assert.ok(!/·/.test(html), 'metadado com ponto médio');
  assert.ok(!/>\s*[←→]\s|\s[←→]\s*<\/(button|a)>/.test(html), 'seta decorativa no texto de botão');
  // monoespaçada só em dado: definição da fonte, porcentagem, contagem, posição, código da turma, letra da alternativa
  const mono = html.split('\n').filter(l => /IBM Plex Mono/.test(l) && !/@font-face|font-family: 'IBM/.test(l));
  assert.ok(mono.length <= 8, mono.length + ' usos de monoespaçada');
  const pilulas = (html.match(/<button[^>]*border-radius:999px[^>]*>/g) || []).filter(t => /min-height:4[4-9]px/.test(t));
  assert.equal(pilulas.length, 0, 'botão grande em pílula');
});
