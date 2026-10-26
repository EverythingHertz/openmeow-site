#!/usr/bin/env node
// OpenMeow slide board v0: loopback-only server over the Tier-0 slide corpora.
// node runner/slides/serve.mjs [--port 7777] [--data <dir>] [--corpus <id>=<root>]...
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, createReadStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { openIndex, rebuild, recent, corpora, card } from './index.mjs';
import { state, createRequest, promptFor, iterDir } from './iterations.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const JP = 'C:\\Users\\jhert\\Documents\\Codex\\2026-10-24\\eyebiome-john-package';
const CORPORA = [
  { id: 'deck-studio', label: 'Deck Studio', reader: 'deck-studio.mjs', root: 'C:\\Work\\01_EyeBiome\\deck-studio-2026-10-25' },
  { id: 'system-02', label: 'JP system-02', reader: 'system-02.mjs', root: JP },
  { id: 'dist-cards', label: 'Desk handoff cards', reader: 'dist-cards.mjs', root: JP },
];

function args(argv) {
  const out = { port: 7777, data: join(process.env.LOCALAPPDATA || join(process.env.HOME || '.', '.local'), 'openmeow', 'slides'), corpus: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--port') out.port = Number(argv[++i]);
    else if (a === '--data') out.data = argv[++i];
    else if (a === '--corpus') { const [k, ...v] = argv[++i].split('='); out.corpus[k] = v.join('='); }
  }
  return out;
}

const opt = args(process.argv.slice(2));
const PORT = opt.port;
const HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);
const ORIGINS = new Set([...HOSTS].map((h) => `http://${h}`));
const DATA = opt.data;
const THUMBS = join(DATA, 'cache', 'thumbs');
mkdirSync(THUMBS, { recursive: true });

// Launch token: lives in memory and in a user-only file. It never goes into a URL.
const TOKEN = randomBytes(32).toString('base64url');
const COOKIE = `om_key_${PORT}`; // browsers share cookies across ports, so each board gets its own name
const tokenFile = join(DATA, 'launch-token');
writeFileSync(tokenFile, TOKEN + '\n', { mode: 0o600 });
const launcher = join(DATA, 'open-board.html');
writeFileSync(launcher, `<!doctype html><meta charset="utf-8"><title>Open OpenMeow board</title>
<form method="post" action="http://127.0.0.1:${PORT}/session"><input type="hidden" name="key" value="${TOKEN}"></form>
<script>document.forms[0].submit()</script>`, { mode: 0o600 });

// Read every corpus; a missing one is held, the others still load.
const db = openIndex(join(DATA, 'index.sqlite'));
async function readAll() {
  const results = [];
  for (const c of CORPORA) {
    const root = opt.corpus[c.id] || c.root;
    try {
      const mod = await import(pathToFileURL(join(here, 'readers', c.reader)).href);
      const r = await mod.read(root);
      results.push({ corpus_id: c.id, root, status: r.status, reason: r.reason, cards: r.status === 'ok' ? r.cards : [] });
    } catch (e) {
      results.push({ corpus_id: c.id, root, status: 'held', reason: `reader failed: ${e.message}`, cards: [] });
    }
  }
  rebuild(db, results);
}
await readAll();

const thumbFor = (c) => join(THUMBS, createHash('sha256').update(`${c.thumb_path}|${c.file_mtime_ns}`).digest('hex').slice(0, 24) + '.jpg');
function makeThumbs() {
  if (process.platform !== 'win32') return;
  const jobs = recent(db).map((c) => ({ src: c.thumb_path, dst: thumbFor(c) })).filter((j) => !existsSync(j.dst));
  if (!jobs.length) return;
  const list = join(DATA, 'cache', 'thumb-jobs.json');
  writeFileSync(list, JSON.stringify(jobs));
  const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(here, 'thumbs.ps1'), '-List', list], { stdio: ['ignore', 'pipe', 'pipe'] });
  ps.stdout.on('data', (d) => process.stdout.write(`[thumbs] ${d}`));
}
makeThumbs();

const STATIC = {
  '/': ['slides.html', 'text/html; charset=utf-8'],
  '/slides.html': ['slides.html', 'text/html; charset=utf-8'],
  '/slides.css': ['slides.css', 'text/css; charset=utf-8'],
  '/slides.mjs': ['slides.mjs', 'text/javascript; charset=utf-8'],
};
const LABELS = Object.fromEntries(CORPORA.map((c) => [c.id, c.label]));
const HEADERS = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};

function send(res, code, body, type = 'text/plain; charset=utf-8', extra = {}) {
  res.writeHead(code, { ...HEADERS, 'Content-Type': type, ...extra });
  res.end(body);
}
const json = (res, code, obj) => send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8');

function sameToken(given) {
  if (typeof given !== 'string') return false;
  const a = Buffer.from(given), b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}
function cookieToken(req) {
  const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`).exec(req.headers.cookie || '');
  return m ? m[1] : null;
}

function readBody(req, limit = 16384) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const SIGNIN = readFileSync(join(here, 'signin.html'), 'utf8');
const SIGNIN_CSP = { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'" };
const signin = (res, code, msg = '') => send(res, code, SIGNIN.replace('<!--msg-->', msg), 'text/html; charset=utf-8', SIGNIN_CSP);

function serveFile(res, path, type, cache = 'private, max-age=600') {
  let st;
  try { st = statSync(path); } catch { return send(res, 404, 'Not found'); }
  res.writeHead(200, { ...HEADERS, 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': cache, 'Content-Security-Policy': 'sandbox' });
  createReadStream(path).pipe(res);
}

function publicCard(c) {
  return { id: c.card_id, corpus: c.corpus_id, corpus_label: LABELS[c.corpus_id], deck: c.deck_id, version: c.deck_version,
    index: c.slide_index, title: c.title, kind: c.kind, built_at: c.built_at, has_svg: !!c.svg_path,
    currentness: c.currentness, evidence: c.evidence, limitations: c.limitations };
}

const server = createServer(async (req, res) => {
  try {
    if (!HOSTS.has(req.headers.host || '')) return send(res, 403, 'Refused: foreign Host.');
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if ([...url.searchParams.keys()].some((k) => /token|key|secret/i.test(k))) return send(res, 400, 'Refused: keys never go in a URL.');
    const origin = req.headers.origin;

    if (url.pathname === '/session' && req.method === 'POST') {
      if (origin && origin !== 'null' && !ORIGINS.has(origin)) return send(res, 403, 'Refused: foreign Origin.');
      const key = new URLSearchParams(await readBody(req, 4096)).get('key');
      if (!sameToken(key)) return signin(res, 401, '<p class="err">That key did not match. Copy it again from the file.</p>');
      // A same-site refresh, not a 303, so the Strict cookie rides along even after a file:// launcher post.
      return send(res, 200, '<!doctype html><meta http-equiv="refresh" content="0;url=/"><a href="/">Open board</a>',
        'text/html; charset=utf-8', { 'Set-Cookie': `${COOKIE}=${TOKEN}; HttpOnly; SameSite=Strict; Path=/` });
    }

    const headerToken = req.headers['x-openmeow-token'];
    const authed = sameToken(headerToken) || sameToken(cookieToken(req));
    if (!authed) {
      if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) return signin(res, 401);
      return json(res, 401, { error: 'Refused: launch token missing or wrong.' });
    }
    // State changes from a browser must come from the board itself.
    if (req.method !== 'GET' && req.method !== 'HEAD' && !sameToken(headerToken) && !ORIGINS.has(origin)) return send(res, 403, 'Refused: foreign Origin.');

    if (req.method === 'GET' && STATIC[url.pathname]) {
      const [file, type] = STATIC[url.pathname];
      return send(res, 200, readFileSync(join(repo, file)), type);
    }
    if (req.method === 'GET' && url.pathname === '/api/cards') {
      const cards = recent(db).map(publicCard);
      const cs = corpora(db).map((c) => ({ id: c.corpus_id, label: LABELS[c.corpus_id], status: c.status, reason: c.reason, count: c.card_count }));
      return json(res, 200, { cards, corpora: cs, total: cards.length, agent: { connected: false } });
    }
    let m;
    if (req.method === 'GET' && (m = /^\/thumb\/(loc-[0-9a-f]{20})$/.exec(url.pathname))) {
      const c = card(db, m[1]);
      if (!c) return send(res, 404, 'Not found');
      const t = thumbFor(c);
      return existsSync(t) ? serveFile(res, t, 'image/jpeg') : serveFile(res, c.thumb_path, 'image/png');
    }
    if (req.method === 'GET' && (m = /^\/iter\/(loc-[0-9a-f]{20})\/(v\d+\.svg)$/.exec(url.pathname))) {
      return serveFile(res, join(iterDir(DATA, m[1]), m[2]), 'image/svg+xml', 'no-store');
    }
    if ((m = /^\/api\/iterations\/(loc-[0-9a-f]{20})$/.exec(url.pathname))) {
      const c = card(db, m[1]);
      if (!c) return json(res, 404, { error: 'No such slide.' });
      if (req.method === 'GET') {
        const s = state(DATA, c.card_id);
        return json(res, 200, { card_id: c.card_id, versions: s.versions, requests: s.requests,
          pending: s.pending, prompt: s.pending ? promptFor(c, s.pending, s.dir) : null });
      }
      if (req.method === 'POST') {
        let body;
        try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { error: 'Send JSON.' }); }
        const r = createRequest(DATA, c, body.instruction);
        return r.error ? json(res, r.status, { error: r.error }) : json(res, 201, r);
      }
    }
    return send(res, 404, 'Not found');
  } catch (e) {
    return send(res, 500, 'Server error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const cs = corpora(db);
  console.log(`OpenMeow slide board: http://127.0.0.1:${PORT}/`);
  console.log(`Sign in: open ${launcher}  (or paste the key from ${tokenFile})`);
  for (const c of cs) console.log(`  ${c.corpus_id}: ${c.status === 'ok' ? `${c.card_count} slides` : `HELD · ${c.reason}`}`);
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { server.close(); db.close(); process.exit(0); });
