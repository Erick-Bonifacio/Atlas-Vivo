// Banco de questões reais ainda SEM direitos liberados, para teste em desenvolvimento local.
// Lê staging/preview/preview.json (gerado por "python -I tools/ingest/run.py preview-export"), valida com a opção
// `preview` de bank.js e serve as figuras de staging/media. Só é carregado por server.js quando ATLAS_PREVIEW_BANK=1,
// e server.js recusa essa opção no Vercel, em produção ou com banco que não seja local.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');
const { makeBank, problems } = require(path.join(ROOT, 'bank.js'));

function load({ staging } = {}) {
  const STAGING = path.resolve(staging || process.env.ATLAS_STAGING || path.join(ROOT, 'staging'));
  const file = path.join(STAGING, 'preview', 'preview.json');
  if (!fs.existsSync(file)) throw new Error('ATLAS_PREVIEW_BANK=1 mas falta ' + file + '. Rode antes: python -I tools/ingest/run.py preview-export');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const mediaRoot = path.resolve(STAGING, 'media');
  // img/q/<id-com-hifens>/<arquivo>  →  staging/media/<media_dir>/<arquivo>  (só o que o preview-export mapeou)
  const mediaFile = rel => {
    const m = /^img\/q\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/.exec(rel || '');
    if (!m || !data.media[m[1]]) return null;
    const f = path.resolve(mediaRoot, data.media[m[1]], m[2]);
    return f.startsWith(mediaRoot + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile() ? f : null;
  };
  const valid = [], rejected = [];
  for (const q of data.questions) {
    const bad = problems(q, { preview: true });
    const missing = [...q.stem.filter(b => b.t === 'fig').map(b => b.src), ...q.opts.filter(o => o.fig).map(o => o.fig)].filter(f => !mediaFile(f));
    if (bad.length || missing.length) rejected.push({ id: q.id, why: bad.concat(missing.map(f => 'figura ausente: ' + f)) });
    else valid.push(q);
  }
  return { bank: makeBank(valid), mediaFile, mediaRoot, rejected };
}

module.exports = { load };
