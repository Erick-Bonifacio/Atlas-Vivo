// Pré-visualização restrita (tools/preview/server.js): só loopback, sem CORS, sem banco, sem vazamento, e nada disso
// chega ao servidor de produção nem ao deploy. Usa itens da fixture convertidos para status "preview".
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const PORT = 20000 + Math.floor(Math.random() * 20000);
let child, tmp;

const call = (method, url, { host = '127.0.0.1:' + PORT, headers = {}, body } = {}) => new Promise((resolve, reject) => {
  const req = http.request({ host: '127.0.0.1', port: PORT, path: url, method, headers: { Host: host, ...headers } }, res => {
    let data = ''; res.on('data', c => { data += c; }); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});
const json = r => JSON.parse(r.body);
const JSON_H = { 'Content-Type': 'application/json' };

test.before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-preview-'));
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'bank', 'fixture-2099-regular.json'), 'utf8')).questions;
  const questions = fx.map(q => { const c = JSON.parse(JSON.stringify(q)); c.status = 'preview'; c.rights = { status: 'needs_authorization' }; delete c.expl; c.science = {}; c.inst = 'enem'; c.id = c.id.replace('fixture:', 'enem:'); return c; });
  fs.mkdirSync(path.join(tmp, 'preview'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'media'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'secret.txt'), 'segredo');
  fs.writeFileSync(path.join(tmp, 'preview', 'preview.json'), JSON.stringify({ questions, media: {}, meta: {} }));
  child = spawn(process.execPath, [path.join(ROOT, 'tools', 'preview', 'server.js')], { env: { ...process.env, ATLAS_STAGING: tmp, PREVIEW_PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((ok, fail) => { child.stdout.on('data', d => /Pré-visualização restrita/.test(String(d)) && ok()); child.on('exit', c => fail(new Error('servidor saiu: ' + c))); setTimeout(() => fail(new Error('timeout')), 8000); });
});
test.after(() => { if (child) child.kill(); if (tmp) fs.rmSync(tmp, { recursive: true, force: true }); });

test('escuta só em 127.0.0.1 e recusa Host que não seja local (DNS rebinding)', async () => {
  assert.equal((await call('GET', '/api/env')).status, 200);
  assert.equal((await call('GET', '/api/env', { host: 'evil.example' })).status, 421);
  assert.equal((await call('GET', '/api/env', { host: 'evil.example:' + PORT })).status, 421);
  assert.equal((await call('GET', '/api/env', { host: 'localhost:' + PORT })).status, 200);
});

test('sem CORS, sem indexação, sem cache; origem de outro site não escreve', async () => {
  const r = await call('GET', '/api/bank/catalog');
  assert.equal(r.headers['access-control-allow-origin'], undefined);
  assert.match(r.headers['x-robots-tag'], /noindex/);
  assert.equal(r.headers['cache-control'], 'no-store');
  const bad = await call('POST', '/api/answer', { headers: { ...JSON_H, Origin: 'https://evil.example' }, body: { qid: 'enem:2099:regular:mc5', sel: 2 } });
  assert.equal(bad.status, 403);
});

test('modo "preview" sem faixa; a lista não vaza gabarito nem comentário', async () => {
  assert.deepEqual(json(await call('GET', '/api/env')), { mode: 'preview', label: '' }, 'sem faixa na prévia');
  const r = json(await call('GET', '/api/bank'));
  assert.equal(r.total, 6);
  assert.ok(!/"(ans|expl|key|rights|science|appearances)"/.test(JSON.stringify(r)));
  assert.ok(r.questions.every(q => /^ENEM - 20/.test(q.label)), 'rótulo de prova real: ENEM - ano');
});

test('visitante local responde só em memória; a segunda tentativa vale zero', async () => {
  const id = 'enem:2099:regular:mc5';
  let r = json(await call('POST', '/api/answer', { headers: JSON_H, body: { qid: id, sel: 2 } }));
  assert.equal(r.awarded, 10);
  assert.equal(r.question.key.ans, 2);
  assert.equal(r.question.key.text, null, 'sem revisão humana, sem comentário');
  assert.equal((await call('POST', '/api/answer', { headers: JSON_H, body: { qid: id, sel: 0 } })).status, 409);
  assert.equal((await call('POST', '/api/login', { headers: JSON_H, body: { email: 'x@y.z', password: 'senha-qualquer' } })).status, 400);
});

test('arquivos: só public/ e a mídia mapeada; nada fora disso', async () => {
  assert.equal((await call('GET', '/index.html')).status, 200);
  for (const p of ['/img/q/../../secret.txt', '/img/q/x/..%2F..%2Fsecret.txt', '/%2e%2e/secret.txt', '/staging/preview/preview.json', '/../package.json', '/preview/preview.json', '/img/q/enem-2099-regular-mc5/f00.png']) {
    const r = await call('GET', p);
    assert.equal(r.status, 404, p);
    assert.ok(!r.body.includes('segredo'));
  }
});

test('não sobe em produção', async () => {
  const out = await new Promise(ok => { const c = spawn(process.execPath, [path.join(ROOT, 'tools', 'preview', 'server.js')], { env: { ...process.env, VERCEL: '1', ATLAS_STAGING: tmp, PREVIEW_PORT: String(PORT + 1) }, stdio: ['ignore', 'ignore', 'pipe'] }); let e = ''; c.stderr.on('data', d => { e += d; }); c.on('exit', code => ok({ code, e })); });
  assert.notEqual(out.code, 0);
  assert.match(out.e, /não roda em produção/);
});

test('o servidor de produção e o deploy não conhecem a pré-visualização nem staging', () => {
  for (const f of ['core.js', path.join('api', 'index.js')]) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/preview|staging\/preview|ATLAS_STAGING/i.test(src.replace(/\/\/.*$/gm, '')), f + ' referencia a pré-visualização');
  }
  // server.js só toca na pré-visualização atrás de ATLAS_PREVIEW_BANK=1, depois da recusa em produção e com banco não local
  const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
  assert.match(srv, /ATLAS_PREVIEW_BANK === '1'\) \{\s*if \(process\.env\.VERCEL \|\| process\.env\.NODE_ENV === 'production' \|\| !LOOPBACK\.test\(process\.env\.PGHOST\)\) throw/);
  assert.equal((srv.match(/require\('\.\/tools\/preview\/bank-preview\.js'\)/g) || []).length, 1, 'um único require, dentro do if protegido');
  const bank = fs.readFileSync(path.join(ROOT, 'bank.js'), 'utf8');
  assert.ok(!/loadBank\([^)]*preview/.test(bank), 'loadBank não aceita preview');
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const inc = vercel.functions['api/index.js'].includeFiles;
  assert.ok(!/tools|staging|preview/.test(inc), 'o deploy não inclui tools/ nem staging/');
  assert.equal(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8').split(/\r?\n/).includes('staging/'), true, 'staging/ fora do git');
  const pub = path.join(ROOT, 'public', 'img', 'q');
  const off = path.join(ROOT, 'questions', 'official');
  const liberados = new Set(fs.readdirSync(off).filter(f => f.endsWith('.json'))
    .flatMap(f => JSON.parse(fs.readFileSync(path.join(off, f), 'utf8')).questions.map(q => q.id.replace(/:/g, '-'))));
  const extras = (fs.existsSync(pub) ? fs.readdirSync(pub).filter(n => n !== '.gitkeep') : []).filter(n => !liberados.has(n));
  assert.deepEqual(extras, [], 'public/img/q só tem pasta de item publicado e liberado');
});

test('ATLAS_PREVIEW_BANK=1 é recusado no Vercel, em produção e com banco que não é local', async () => {
  const base = { ...process.env, PGHOST: '127.0.0.1', PGPASSWORD: 'x', PGSSL: 'disable', ATLAS_PREVIEW_BANK: '1', ATLAS_STAGING: tmp, PORT: String(PORT + 2) };
  for (const extra of [{ VERCEL: '1' }, { NODE_ENV: 'production' }, { PGHOST: 'db.exemplo.com', PGSSL: '' }]) {
    const out = await new Promise(ok => { const c = spawn(process.execPath, [path.join(ROOT, 'server.js')], { env: { ...base, ...extra }, stdio: ['ignore', 'ignore', 'pipe'] }); let e = ''; c.stderr.on('data', d => { e += d; }); c.on('exit', code => ok({ code, e })); });
    assert.notEqual(out.code, 0, JSON.stringify(extra));
    assert.match(out.e, /ATLAS_PREVIEW_BANK=1 só vale em desenvolvimento/, JSON.stringify(extra));
  }
});
