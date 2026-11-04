// Regras do Atlas Vivo que não dependem de banco nem de HTTP: pontuação, níveis, medalhas, saneamento do
// progresso e a forma como cada questão é mostrada ao navegador. Extraído do server.js sem mudar o
// comportamento, para poder ser testado sozinho (tests/*.test.js).
'use strict';

// ── Regras de pontuação ──
const PTS = { 'Básica': 10, 'Intermediária': 15, 'Avançada': 20 };
const QUIZ_BONUS = 20;   // ao responder todas as questões de um quiz
const LESSON_PTS = 30;   // a cada aula concluída
const LEVEL_STEP = 150;
const TITLES = ['Calouro', 'Curioso', 'Explorador', 'Monitor', 'Anatomista', 'Fisiologista', 'Especialista', 'Mestre do Atlas'];
const MAX_LESSON_SECTIONS = 20;   // seções por aula aceitas no progresso salvo (as aulas aprofundadas passam de 10)
const OPEN_SELF = ['errei', 'parcial', 'acertei'];   // autoavaliação de questão discursiva (não vale ponto)
const OFFICIAL_PER_QUIZ = 10;   // até tantas questões reais de vestibular no fim de cada quiz de aula (só existe o que foi publicado para o sistema)
const INST_NAMES = { enem: 'ENEM', fuvest: 'FUVEST', unicamp: 'UNICAMP', unesp: 'UNESP' };

// quizzes: lista de quizzes da trilha. bank: banco oficial (bank.js) ou null. partName: Map id -> nome da estrutura 3D.
function createCore({ quizzes, bank = null, partName = new Map() }) {
  const LESSON_IDS = quizzes.map(z => z.id);
  const QBYID = new Map();
  for (const z of quizzes) for (const q of z.questions) QBYID.set(q.id, { q, z });
  if (bank) for (const q of bank.questions) {
    if (QBYID.has(q.id)) throw new Error('Id de questão repetido entre quiz e banco: ' + q.id);
    QBYID.set(q.id, { q, z: null, bank: true });
  }
  const ptsOf = q => (q.type === 'VERIFIED_OFFICIAL' ? PTS[q.diff || 'Intermediária'] : PTS[q.diff]);
  const isBank = id => !!(QBYID.get(id) || {}).bank;

  function stats(u, rows) {
    const by = new Map(rows.map(r => [r.qid, r]));
    let points = 0, answered = 0, correct = 0, quizzesDone = 0, perfect = 0, bankAnswered = 0, bankCorrect = 0;
    for (const z of quizzes) {
      const a = z.questions.map(q => by.get(q.id)).filter(Boolean);
      for (const r of a) { points += r.points; answered++; correct += r.correct; }
      if (a.length === z.questions.length) {
        quizzesDone++; points += QUIZ_BONUS;
        if (a.every(r => r.correct)) perfect++;
      }
    }
    // Questões oficiais valem pontos e contam como respondidas, mas não entram em quiz nem no bônus.
    for (const r of rows) if (isBank(r.qid)) { points += r.points; answered++; correct += r.correct; bankAnswered++; bankCorrect += r.correct; }
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
      ['Atlas completo', 'Completar todos os quizzes', quizzesDone === quizzes.length],
    ].map(([name, desc, earned]) => ({ name, desc, earned }));
    return {
      points, level, title: TITLES[level - 1],
      floor: (level - 1) * LEVEL_STEP, next: level < TITLES.length ? level * LEVEL_STEP : null,
      answered, correct, quizzesDone, quizzesTotal: quizzes.length, lessonsDone, lessonsTotal: LESSON_IDS.length, badges,
      bankAnswered, bankCorrect,
    };
  }

  // Questão da trilha como o navegador a vê: o gabarito só aparece depois de respondida.
  function viewQ(q, a) {
    const model = q.kind === 'model';
    const o = { id: q.id, kind: model ? 'model' : 'mc', topic: q.topic, diff: q.diff, stem: q.stem, opts: q.opts || [], view: q.view || null, pts: PTS[q.diff], sec: q.sec ?? null, pulm: !!q.pulm };
    if (a) Object.assign(o, { sel: a.sel, pick: a.pick || null, pickName: partName.get(a.pick) || '', correct: !!a.correct, points: a.points,
      key: model ? { ansText: q.ansText, parts: q.ids, names: [...new Set(q.ids.map(i => partName.get(i)))], steps: [], why: [] }
        : { ans: q.ans, ansText: q.ansText, steps: q.steps || [], why: q.why } });
    return o;
  }

  // Questão oficial como o aluno a vê: prova e ano, enunciado, alternativas e o link da prova original.
  // Lista branca de campos. Caderno, página, dificuldade, direitos e autoria ficam só no servidor; o gabarito
  // sai depois da resposta, e o comentário só se uma pessoa o verificou. `a` = resposta já registrada.
  function viewBankQ(q, a) {
    const fict = q.inst === 'fixture';
    const o = {
      id: q.id, kind: q.kind, label: fict ? 'Questão fictícia' : (q.inst_name || INST_NAMES[q.inst] || q.inst.toUpperCase()) + ' - ' + q.year,
      system: q.system, topic: q.topic,
      stem: q.stem, opts: (q.opts || []).map(x => (x.fig ? { fig: x.fig, alt: x.alt } : { text: x.text })),
      srcUrl: fict || q.source ? null : q.appearances[0].pdf_url, bank: true,   // questão que veio de lista de terceiros não leva link: a fonte fica nos créditos
    };
    if (a) {
      const ex = q.science && q.science.explanation_human === true ? q.expl : null;
      Object.assign(o, { sel: a.sel, correct: !!a.correct, points: a.points,
        key: { ans: q.kind === 'mc' ? q.ans : null, text: ex ? ex.text : null,
          expected: q.kind === 'open' ? ((q.expected && q.expected.text) || null) : null } });
    }
    return o;
  }

  // `official`: questões reais do sistema da aula, depois das autorais. Não entram em total, max, bônus nem medalhas
  // do quiz: pontuam pelas regras do banco (stats), então o progresso antigo não muda.
  function viewQuizzes(rows) {
    const by = new Map(rows.map(r => [r.qid, r]));
    return quizzes.map(z => {
      const questions = z.questions.map(q => viewQ(q, by.get(q.id)));
      const done = questions.filter(q => q.key);
      const complete = done.length === questions.length;
      return {
        id: z.id, title: z.title, total: questions.length, answered: done.length,
        correct: done.filter(q => q.correct).length,
        earned: done.reduce((n, q) => n + q.points, 0) + (complete ? QUIZ_BONUS : 0),
        max: questions.reduce((n, q) => n + q.pts, 0) + QUIZ_BONUS, bonus: QUIZ_BONUS, questions,
        official: bank && bank.forSystem ? bank.forSystem(z.id, OFFICIAL_PER_QUIZ).map(q => viewBankQ(q, by.get(q.id))) : [],
      };
    });
  }

  // Progresso aceito do navegador: só valores conhecidos e dentro de faixas.
  function cleanProgress(p) {
    p = p || {};
    const int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : 0);
    const ints = (v, max) => (Array.isArray(v) ? [...new Set(v.filter(x => Number.isInteger(x) && x >= 0 && x <= max))] : []);
    const ls = {};   // cardiovascular guarda aqui só o aprofundamento; a pontuação da aula dele vem de lessonDone
    if (p.ls && typeof p.ls === 'object') for (const id of LESSON_IDS) {
      const x = p.ls[id];
      if (x && typeof x === 'object') ls[id] = { s: int(x.s, MAX_LESSON_SECTIONS - 1), v: ints(x.v, MAX_LESSON_SECTIONS - 1), d: x.d === true };
    }
    const fcRes = {};
    if (p.fcRes && typeof p.fcRes === 'object') for (const k of ['0', '1', '2', '3']) if (p.fcRes[k] === 'got' || p.fcRes[k] === 'again') fcRes[k] = p.fcRes[k];
    return {
      sec: int(p.sec, 5), visited: ints(p.visited, 5), step: int(p.step, 10), fc: int(p.fc, 4), fcRes,
      saved: Array.isArray(p.saved) ? [...new Set(p.saved.filter(x => QBYID.has(x)))] : [],
      lessonDone: p.lessonDone === true, ls,
      last: LESSON_IDS.includes(p.last) ? p.last : null,
    };
  }

  // Valida a resposta enviada e calcula o resultado. Devolve { sel, pick, correct, points } ou lança Error com .status.
  function grade(q, body) {
    const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });
    if (q.kind === 'model') {
      if (typeof body.part !== 'string' || !partName.has(body.part)) throw bad('Clique em uma estrutura do modelo para responder.');
      const correct = q.ids.includes(body.part) ? 1 : 0;
      return { sel: -1, pick: body.part, correct, points: correct ? PTS[q.diff] : 0 };
    }
    if (q.kind === 'open') {
      if (!Number.isInteger(body.self) || body.self < 0 || body.self >= OPEN_SELF.length) throw bad('Faça a autoavaliação da sua resposta.');
      return { sel: body.self, pick: null, correct: 0, points: 0 };
    }
    if (!Number.isInteger(body.sel) || body.sel < 0 || body.sel >= q.opts.length) throw bad('Alternativa inválida.');
    const correct = body.sel === q.ans ? 1 : 0;
    return { sel: body.sel, pick: null, correct, points: correct ? ptsOf(q) : 0 };
  }

  return { QBYID, LESSON_IDS, stats, viewQ, viewBankQ, viewQuizzes, cleanProgress, grade, ptsOf, isBank };
}

module.exports = { createCore, PTS, QUIZ_BONUS, LESSON_PTS, LEVEL_STEP, TITLES, MAX_LESSON_SECTIONS, OPEN_SELF, OFFICIAL_PER_QUIZ, INST_NAMES };
