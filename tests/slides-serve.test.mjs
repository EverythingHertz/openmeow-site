import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';
import { createServer } from 'node:net';
import { once } from 'node:events';

let port;
const serve = join(dirname(fileURLToPath(import.meta.url)), '..', 'runner', 'slides', 'serve.mjs');
const data = mkdtempSync(join(tmpdir(), 'om-slides-'));
const fixture = join(data, 'corpus');
let proc, token;

function get(path, headers = {}, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path, method, headers: { Host: `127.0.0.1:${port}`, ...headers } }, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

async function start(args) {
  const child = spawn(process.execPath, [serve, ...args]);
  let output = '';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`server startup timed out: ${output}`));
    }, 10000);
    child.stderr.on('data', (d) => { output += d; });
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited ${code}: ${output}`));
    });
    child.stdout.on('data', (d) => {
      output += d;
      const m = /OpenMeow slide board: http:\/\/127\.0\.0\.1:(\d+)\//.exec(output);
      if (m) { clearTimeout(timer); resolve(); }
    });
  });
  return { child, port: Number(/OpenMeow slide board: http:\/\/127\.0\.0\.1:(\d+)\//.exec(output)[1]) };
}

before(async () => {
  const dist = join(fixture, 'dist');
  mkdirSync(join(dist, 'desk-handoff'), { recursive: true });
  writeFileSync(join(dist, 'preview.png'), Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'));
  writeFileSync(join(dist, 'source.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  writeFileSync(join(dist, 'desk-handoff', 'cards.json'), JSON.stringify({
    generated_at: '2026-10-25T07:35:58Z',
    assets: [{ id: 'one', title: 'Fixture slide', path: join(dist, 'preview.png'),
      aliases: ['01-cover'], family: 'Deck candidates', svg_source: 'source.svg' }],
  }));
  const started = await start(['--port', '0', '--data', join(data, 'board'),
    '--corpus', `deck-studio=${join(data, 'absent')}`,
    '--corpus', `system-02=${join(data, 'absent')}`, '--corpus', `dist-cards=${fixture}`]);
  proc = started.child;
  port = started.port;
  token = readFileSync(join(data, 'board', 'launch-token'), 'utf8').trim();
});
after(async () => {
  if (proc && proc.exitCode === null) {
    const exited = once(proc, 'exit');
    proc.kill();
    await exited;
  }
  rmSync(data, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
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
  const r = await get('/api/iterations/loc-00000000000000000000', { Cookie: `om_key_${port}=${token}`, Origin: 'http://evil.example', 'Content-Type': 'application/json' }, 'POST', '{}');
  assert.equal(r.status, 403);
});

test('sign-in sets a cookie for the actual assigned port', async () => {
  const res = await get('/session', { Origin: 'null', 'Content-Type': 'application/x-www-form-urlencoded' },
    'POST', new URLSearchParams({ key: token }).toString());
  assert.equal(res.status, 200);
  const cookie = res.headers['set-cookie'][0];
  assert.ok(cookie.startsWith(`om_key_${port}=`));
  assert.match(cookie, /HttpOnly; SameSite=Strict; Path=\//);
  assert.equal((await get('/api/cards', { Cookie: cookie.split(';')[0] })).status, 200);
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

test('a port collision exits without changing board data', async (t) => {
  const occupied = createServer();
  occupied.listen(0, '127.0.0.1');
  await once(occupied, 'listening');
  t.after(() => new Promise((resolve, reject) => occupied.close((err) => err ? reject(err) : resolve())));
  const target = join(data, 'collision');
  mkdirSync(target);
  writeFileSync(join(target, 'launch-token'), 'existing token');
  const child = spawn(process.execPath, [serve, '--port', String(occupied.address().port), '--data', target]);
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d; });
  const timer = setTimeout(() => child.kill(), 10000);
  const [code] = await once(child, 'exit');
  clearTimeout(timer);
  assert.notEqual(code, 0, stderr);
  assert.match(stderr, /EADDRINUSE/);
  assert.equal(readFileSync(join(target, 'launch-token'), 'utf8'), 'existing token');
  assert.equal(existsSync(join(target, 'index.sqlite')), false);
  assert.equal(existsSync(join(target, 'open-board.html')), false);
});

test('iteration payloads are validated before creating files', async () => {
  const cards = JSON.parse((await get('/api/cards', { 'X-OpenMeow-Token': token })).body).cards;
  assert.equal(cards.length, 1);
  const path = `/api/iterations/${cards[0].id}`;
  const headers = { 'X-OpenMeow-Token': token, 'Content-Type': 'application/json' };
  for (const body of [null, [], {}, { instruction: {} }, { instruction: 123 },
    { instruction: 'x'.repeat(501) }, { instruction: 'change', extra: true }]) {
    const res = await get(path, headers, 'POST', JSON.stringify(body));
    assert.equal(res.status, 400, JSON.stringify(body));
  }
  assert.equal(existsSync(join(data, 'board', 'iterations')), false);
  assert.equal((await get(path, headers, 'POST', JSON.stringify({ instruction: 'Make the title larger' }))).status, 201);
  assert.equal((await get(path, headers, 'POST', JSON.stringify({ instruction: 'Another change' }))).status, 409);
  const folder = join(data, 'board', 'iterations', cards[0].id);
  writeFileSync(join(folder, 'request-1.json'), '{broken');
  for (const method of ['GET', 'POST']) {
    const res = await get(path, headers, method, method === 'POST' ? JSON.stringify({ instruction: 'Another change' }) : undefined);
    assert.equal(res.status, 500);
    assert.match(JSON.parse(res.body).error, /Check the board terminal/);
  }
  assert.equal(readFileSync(join(folder, 'request-1.json'), 'utf8'), '{broken');
  assert.equal(existsSync(join(folder, 'request-2.json')), false);
});
