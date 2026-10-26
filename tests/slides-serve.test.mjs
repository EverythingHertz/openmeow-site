import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';

const PORT = 7791;
const serve = join(dirname(fileURLToPath(import.meta.url)), '..', 'runner', 'slides', 'serve.mjs');
const data = mkdtempSync(join(tmpdir(), 'om-slides-'));
let proc, token;

function get(path, headers = {}, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: PORT, path, method, headers: { Host: `127.0.0.1:${PORT}`, ...headers } }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

before(async () => {
  proc = spawn(process.execPath, [serve, '--port', String(PORT), '--data', data, '--corpus', 'system-02=Z:\\no-such-corpus']);
  await new Promise((resolve, reject) => {
    proc.stdout.on('data', (d) => { if (String(d).includes('slide board')) resolve(); });
    proc.on('exit', (code) => reject(new Error(`server exited ${code}`)));
  });
  token = readFileSync(join(data, 'launch-token'), 'utf8').trim();
});
after(async () => {
  const exited = new Promise((r) => proc.once('exit', r));
  proc.kill();
  await exited;
  try { rmSync(data, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch { /* thumbnailer may still hold a temp file */ }
});

test('refuses a request without the launch token', async () => {
  assert.equal((await get('/api/cards')).status, 401);
  assert.equal((await get('/api/cards', { 'X-OpenMeow-Token': 'wrong' })).status, 401);
});

test('refuses a foreign Host even with the token', async () => {
  assert.equal((await get('/api/cards', { Host: 'evil.example:7791', 'X-OpenMeow-Token': token })).status, 403);
});

test('refuses a key in the URL', async () => {
  assert.equal((await get(`/api/cards?token=${token}`, { 'X-OpenMeow-Token': token })).status, 400);
  assert.equal((await get(`/api/cards?om_key=${token}`, { 'X-OpenMeow-Token': token })).status, 400);
});

test('refuses a cookie-authed POST from a foreign Origin', async () => {
  const r = await get('/api/iterations/loc-00000000000000000000', { Cookie: `om_key_${PORT}=${token}`, Origin: 'http://evil.example', 'Content-Type': 'application/json' }, 'POST', '{}');
  assert.equal(r.status, 403);
});

test('a missing corpus is HELD and the others still load', async () => {
  const r = await get('/api/cards', { 'X-OpenMeow-Token': token });
  assert.equal(r.status, 200);
  const d = JSON.parse(r.body);
  const held = d.corpora.find((c) => c.id === 'system-02');
  assert.equal(held.status, 'held');
  assert.ok(held.reason.length > 0);
  assert.ok(d.corpora.some((c) => c.status === 'ok' && c.count > 0));
  for (const c of d.cards) assert.ok(c.limitations.trim().length > 0);
  const t = d.cards.map((c) => c.built_at);
  assert.deepEqual(t, [...t].sort().reverse());
});
