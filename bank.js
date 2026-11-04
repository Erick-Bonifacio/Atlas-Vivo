// Banco de questões oficiais de vestibular (VERIFIED_OFFICIAL). Só servidor: o gabarito e o comentário
// só saem depois da resposta. Carrega apenas itens publicados em questions/official/ e RECUSA qualquer
// item que não tenha passado pelas três etapas (integridade, ciência, direitos): quem chama não consegue
// servir material de staging, mesmo apontando para outra pasta.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const SYSTEMS = ['organizacao', 'digestorio', 'respiratorio', 'cardiovascular', 'urinario', 'nervoso', 'endocrino',
  'esqueletico', 'muscular', 'tegumentar', 'linfatico', 'reprodutor', 'sensorial'];
const DIFFS = ['Básica', 'Intermediária', 'Avançada'];
const ID_RE = /^[a-z]+:\d{4}:[a-z0-9-]+:[A-Za-z0-9._-]+$/;
const FACETS = ['system', 'inst', 'year', 'diff', 'kind', 'topic'];
const MAX_LIMIT = 50;
// Sistemas e temas da aba Provas, na ordem do menu do atlas. Espelho dos tópicos de tools/ingest/taxonomy.json
// (o classificador só atribui estes temas); tests/bank.test.js confere que os dois não divergem.
const SYSTEM_TOPICS = [
  ['digestorio', 'Digestório', ['Digestão mecânica e química', 'Absorção no intestino delgado', 'Fígado e pâncreas']],
  ['respiratorio', 'Respiratório', ['Vias respiratórias', 'Hematose nos alvéolos', 'Controle da ventilação']],
  ['cardiovascular', 'Cardiovascular', ['Câmaras e valvas do coração', 'Artérias, veias e capilares', 'Circulação pulmonar e sistêmica']],
  ['urinario', 'Urinário', ['Rins e néfrons', 'Filtração e reabsorção', 'Equilíbrio hídrico e iônico']],
  ['nervoso', 'Nervoso', ['Neurônio e impulso nervoso', 'Sistema nervoso central e periférico', 'Reflexos']],
  ['endocrino', 'Endócrino', ['Hipotálamo e hipófise', 'Tireoide e metabolismo', 'Insulina e glicemia']],
  ['esqueletico', 'Esquelético', ['Tipos de ossos', 'Articulações', 'Medula óssea vermelha']],
  ['muscular', 'Muscular', ['Tipos de tecido muscular', 'Contração e energia', 'Músculo e osso no movimento']],
  ['tegumentar', 'Tegumentar', ['Epiderme e derme', 'Termorregulação', 'Barreira contra microrganismos']],
  ['linfatico', 'Linfático e imunidade', ['Anatomia linfática: vasos, linfonodos, baço e timo', 'Imunidade inata e adaptativa', 'Vacinas e memória imunológica']],
  ['reprodutor', 'Reprodutor', ['Anatomia feminina', 'Anatomia masculina', 'Ciclo menstrual e regulação hormonal']],
  ['sensorial', 'Sentidos', ['Visão', 'Audição e equilíbrio', 'Olfato, paladar e tato']],
].map(([id, name, topics]) => ({ id, name, topics }));

const isStaging = dir => /(^|[\\/])staging([\\/]|$)/i.test(path.resolve(dir));

// Lista de problemas do item; vazia = pode ser servido. `preview` é só para tools/preview (127.0.0.1): aceita
// status "preview" sem decisão de direitos; o carregador de produção (loadBank) nunca passa essa opção, e um
// item de pré-visualização não passa nele por causa do status.
function problems(q, { publicDir, preview = false } = {}) {
  const p = [];
  const need = (ok, msg) => { if (!ok) p.push(msg); };
  need(typeof q.id === 'string' && q.id.length <= 64 && ID_RE.test(q.id), 'id inválido');
  need(q.type === 'VERIFIED_OFFICIAL', 'type deve ser VERIFIED_OFFICIAL');
  need(q.status === (preview ? 'preview' : 'published'), 'status deve ser ' + (preview ? 'preview' : 'published'));
  if (!preview) need(q.rights && q.rights.status === 'cleared' && q.rights.decided_by && q.rights.basis, 'direitos não liberados por responsável');
  need(q.kind === 'mc' || q.kind === 'open', 'kind inválido');
  need(SYSTEMS.includes(q.system), 'sistema desconhecido');
  need(q.diff === null || DIFFS.includes(q.diff), 'dificuldade inválida');
  need(Array.isArray(q.stem) && q.stem.length > 0, 'enunciado vazio');
  need(Array.isArray(q.appearances) && q.appearances.length > 0 && q.appearances.every(a =>
    /^https:\/\//.test(a.pdf_url || '') && Number.isInteger(a.number) && Number.isInteger(a.page)), 'proveniência incompleta');
  // Comentário é opcional; se existir, precisa ser autoral e ter a autoria registrada.
  const ex = q.expl;
  if (ex !== undefined && ex !== null) {
    need(ex.autoral === true && typeof ex.text === 'string' && ex.text.trim(), 'comentário autoral ausente');
    need(q.science && q.science.explanation_by, 'autoria do comentário não registrada');
  }
  const files = [];
  for (const b of q.stem || []) {
    need(['p', 'source', 'fig', 'table'].includes(b.t), 'bloco desconhecido: ' + b.t);
    if (b.t === 'p' || b.t === 'source') need(typeof b.text === 'string' && b.text.trim(), 'bloco de texto vazio');
    if (b.t === 'fig') { need(b.alt && b.alt.trim(), 'figura sem texto alternativo'); files.push(b.src); }
    if (b.t === 'table') need(Array.isArray(b.rows) && b.rows.length, 'tabela vazia');
  }
  if (q.kind === 'mc') {
    need(Array.isArray(q.opts) && q.opts.length >= 2 && q.opts.length <= 10, 'número de alternativas fora de 2 a 10');
    need(Number.isInteger(q.ans) && q.ans >= 0 && q.ans < (q.opts || []).length, 'gabarito fora das alternativas');
    for (const o of q.opts || []) {
      need(o.text || (o.fig && o.alt), 'alternativa vazia ou figura sem alt');
      if (o.fig) files.push(o.fig);
    }
    if (ex) {
      const why = ex.why;
      need(Array.isArray(why) && why.length === (q.opts || []).length, 'um comentário por alternativa');
      if (Array.isArray(why) && why[q.ans] !== undefined) need(/^Correta/.test(why[q.ans]), 'comentário do gabarito deve começar com "Correta"');
      if (Array.isArray(why)) need(why.every((w, i) => i === q.ans || !/^Correta/.test(w)), 'só o gabarito pode começar com "Correta"');
    }
  } else {
    need(q.opts === undefined || (Array.isArray(q.opts) && q.opts.length === 0), 'questão discursiva não tem alternativas');
    need(q.expected === null || (q.expected && typeof q.expected.text === 'string'), 'resposta esperada deve ser texto ou null');
  }
  if (publicDir) for (const f of files) {
    need(typeof f === 'string' && f.startsWith('img/q/') && !f.includes('..') && fs.existsSync(path.join(publicDir, f)), 'figura inexistente: ' + f);
  }
  return p;
}

function loadBank({ dir, publicDir, reserved = new Set() } = {}) {
  if (!dir) throw new Error('loadBank: informe a pasta do banco');
  if (isStaging(dir)) throw new Error('O banco publicado não pode vir de staging/.');
  const questions = [];
  const seen = new Set(reserved);
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const q of data.questions || []) {
      const bad = problems(q, { publicDir });
      if (seen.has(q.id)) bad.push('id repetido');
      if (bad.length) throw new Error(`Banco inválido (${f}, ${q.id}): ${bad.join('; ')}`);
      seen.add(q.id);
      questions.push(q);
    }
  }
  return makeBank(questions);
}

function makeBank(questions) {
  questions.sort((a, b) => b.year - a.year || (a.id < b.id ? -1 : 1));
  const byId = new Map(questions.map(q => [q.id, q]));
  return { questions, byId, query: filters => query(questions, filters), facets: filters => facets(questions, filters),
    catalog: () => catalog(questions), forSystem: (id, n) => questions.filter(q => q.system === id && q.kind === 'mc').slice(0, n) };
}

// Sistemas e temas com a contagem real de questões publicadas. Tema sem questão aparece com 0.
function catalog(questions) {
  return SYSTEM_TOPICS.map(s => {
    const mine = questions.filter(q => q.system === s.id);
    const extra = [...new Set(mine.map(q => q.topic).filter(t => t && !s.topics.includes(t)))];
    return { id: s.id, name: s.name, total: mine.length,
      topics: s.topics.concat(extra).map(t => ({ name: t, count: mine.filter(q => q.topic === t).length })) };
  });
}

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

function matches(q, f, skip) {
  for (const k of FACETS) {
    if (k === skip || f[k] === undefined || f[k] === '') continue;
    if (String(q[k]) !== String(f[k])) return false;
  }
  if (f.ids && !f.ids.has(q.id)) return false;
  if (f.excludeIds && f.excludeIds.has(q.id)) return false;
  if (f.text) {
    const hay = norm(q.stem.map(b => b.text || '').join(' ') + ' ' + q.topic + ' ' + q.opts.map(o => o.text || '').join(' '));
    if (!norm(f.text).split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false;
  }
  return true;
}

// Lista paginada. `limit` fica entre 1 e MAX_LIMIT; `page` começa em 1.
function query(questions, f = {}) {
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(f.limit, 10) || 10));
  const all = questions.filter(q => matches(q, f));
  const pages = Math.max(1, Math.ceil(all.length / limit));
  const page = Math.min(pages, Math.max(1, Number.parseInt(f.page, 10) || 1));
  return { total: all.length, page, pages, limit, items: all.slice((page - 1) * limit, page * limit) };
}

// Contagens por faceta, desconsiderando o próprio filtro da faceta (padrão de busca facetada).
function facets(questions, f = {}) {
  const out = {};
  for (const k of FACETS) {
    const c = new Map();
    for (const q of questions) if (matches(q, f, k)) c.set(q[k], (c.get(q[k]) || 0) + 1);
    out[k] = [...c].filter(([v]) => v !== null && v !== undefined).sort((a, b) => k === 'year' ? b[0] - a[0] : String(a[0]).localeCompare(String(b[0]), 'pt'))
      .map(([value, count]) => ({ value, count }));
  }
  return out;
}

module.exports = { loadBank, makeBank, problems, query, facets, catalog, isStaging, SYSTEMS, SYSTEM_TOPICS, DIFFS, FACETS, MAX_LIMIT };
