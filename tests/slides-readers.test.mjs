import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { read as readDeckStudio } from '../runner/slides/readers/deck-studio.mjs';
import { read as readSystem02 } from '../runner/slides/readers/system-02.mjs';
import { read as readDistCards } from '../runner/slides/readers/dist-cards.mjs';

const REAL_DECK_STUDIO = 'C:/Work/01_EyeBiome/deck-studio-2026-10-25';
const REAL_JP = 'C:/Users/jhert/Documents/Codex/2026-10-24/eyebiome-john-package';
const FIELDS = ['corpus_id', 'deck_id', 'deck_version', 'slide_key', 'slide_index', 'title', 'kind',
  'source_path', 'thumb_path', 'svg_path', 'built_at', 'file_mtime_ns', 'sha256', 'hash_basis',
  'current', 'currentness', 'currentness_source', 'evidence', 'limitations'];

const tmp = (name) => mkdtempSync(path.join(os.tmpdir(), `slides-${name}-`));
const put = (p, body = 'x') => { mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, body); return p; };
const missing = () => path.join(os.tmpdir(), `slides-missing-${process.pid}-${Date.now()}`);

function assertCardShape(card) {
  for (const f of FIELDS) assert.ok(f in card, `card missing ${f}`);
  assert.equal(card.evidence, 'real');
  assert.ok(Number.isInteger(card.slide_index) && card.slide_index >= 1);
  assert.equal(typeof card.file_mtime_ns, 'number');
  assert.ok(!Number.isNaN(Date.parse(card.built_at)));
  assert.ok(typeof card.limitations === 'string' && card.limitations.length > 0);
  assert.ok(existsSync(card.thumb_path), `thumb missing: ${card.thumb_path}`);
  assert.ok(card.svg_path === null || existsSync(card.svg_path));
  assert.ok(['current', 'superseded', 'unknown'].includes(card.currentness));
  assert.ok(['slide', 'appendix', 'paper', 'asset'].includes(card.kind));
}

function assertHeld(r, corpus) {
  assert.equal(r.corpus_id, corpus);
  assert.equal(r.status, 'held');
  assert.ok(typeof r.reason === 'string' && r.reason.length > 0);
  assert.deepEqual(r.cards, []);
}

// ---------- deck-studio ----------
test('deck-studio: reads previews from */out/*-BUILD.json and skips missing thumbs', async (t) => {
  const root = tmp('ds');
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const out = path.join(root, '03_deck-a', 'out');
  const p1 = put(path.join(out, 'pages', '01-cover.png'));
  const p2 = put(path.join(out, 'pages', '06b-adherence.png'));
  put(path.join(out, 'deck-a-BUILD.json'), JSON.stringify({
    name: 'deck-a', built: '2026-10-25 10:24:07 Pacific Daylight Time', pdf_sha256: 'abc',
    previews: [p1, p2, path.join(out, 'pages', '99-gone.png')],
  }));
  put(path.join(root, '04_deck-b', 'out', 'broken-BUILD.json'), '{not json');
  const r = await readDeckStudio(root);
  assert.equal(r.status, 'ok');
  assert.match(r.reason, /1 skipped: thumb missing/);
  assert.match(r.reason, /1 manifest unparsable/);
  assert.equal(r.cards.length, 2);
  r.cards.forEach(assertCardShape);
  const [a, b] = r.cards;
  assert.equal(a.deck_id, 'deck-a');
  assert.equal(a.deck_version, 'deck-a-BUILD');
  assert.equal(a.title, 'Cover');
  assert.equal(b.title, 'Adherence');
  assert.equal(b.slide_index, 2);
  assert.equal(a.built_at, '2026-10-25T17:24:07.000Z');
  assert.equal(a.sha256, null);
  assert.equal(a.currentness, 'unknown');
});

test('deck-studio: missing root and no manifests are held', async (t) => {
  assertHeld(await readDeckStudio(missing()), 'deck-studio');
  const empty = tmp('ds-empty');
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  assertHeld(await readDeckStudio(empty), 'deck-studio');
});

// ---------- system-02 ----------
test('system-02: picks the smallest PNG and fills sha256/current from inventory', async (t) => {
  const root = tmp('s2');
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, 'outputs', 'system-02');
  put(path.join(dir, 'manifest.json'), JSON.stringify({ slides: ['01-cover', '02-moving-surface', '03-gone'] }));
  const svg = put(path.join(dir, '01-cover.svg'), '<svg/>');
  put(path.join(dir, '01-cover.png'), 'x'.repeat(500));
  const prev = put(path.join(dir, '01-cover-preview.png'), 'x'.repeat(50));
  put(path.join(dir, '02-moving-surface.png'), 'x'.repeat(10));
  put(path.join(root, 'outputs', 'HANDOFF_2026-10-25_0225_PDT_deck-creative-study-to-hub', 'data', 'inventory.json'),
    JSON.stringify({ generated: 'x', count: 1, items: [
      { path: prev, bytes: 50, sha256: 'f'.repeat(64), mtime: new Date().toISOString(), role: 'render', current: true },
    ] }));
  const r = await readSystem02(root);
  assert.equal(r.status, 'ok');
  assert.match(r.reason, /1 skipped: thumb missing/);
  assert.equal(r.cards.length, 2);
  r.cards.forEach(assertCardShape);
  const [a, b] = r.cards;
  assert.equal(a.thumb_path, prev);
  assert.equal(a.svg_path, svg);
  assert.equal(a.title, 'Cover');
  assert.equal(a.sha256, 'f'.repeat(64));
  assert.equal(a.hash_basis, 'manifest');
  assert.equal(a.current, true);
  assert.equal(a.currentness, 'current');
  assert.equal(a.currentness_source, 'inventory.current');
  assert.equal(b.svg_path, null);
  assert.equal(b.sha256, null);
  assert.equal(b.currentness, 'unknown');
  assert.equal(b.title, 'Moving surface');
});

test('system-02: missing root, missing manifest and bad manifest are held', async (t) => {
  assertHeld(await readSystem02(missing()), 'system-02');
  const root = tmp('s2-bad');
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assertHeld(await readSystem02(root), 'system-02');
  put(path.join(root, 'outputs', 'system-02', 'manifest.json'), '{oops');
  const r = await readSystem02(root);
  assertHeld(r, 'system-02');
  assert.match(r.reason, /unparsable/);
});

// ---------- dist-cards ----------
test('dist-cards: resolves svg_source against dist/ and maps family to kind', async (t) => {
  const root = tmp('dc');
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dist = path.join(root, 'dist');
  const img = (n) => put(path.join(dist, 'desk-handoff', 'images', `${n}.png`));
  const svg = put(path.join(dist, 'svg', '01-cover.svg'), '<svg/>');
  put(path.join(dist, 'desk-handoff', 'cards.json'), JSON.stringify({
    generated_at: '2026-10-25T07:35:58.790039+00:00', package: 'p', proposal: 'q',
    assets: [
      { id: 'a1', title: 'Treatment first', path: img('01-cover'), sha256: 'a'.repeat(64), family: 'Deck candidates · system 02', aliases: ['01-cover'], svg_source: 'svg/01-cover.svg' },
      { id: 'a2', title: 'Requirements', path: img('appendix-1'), sha256: 'b'.repeat(64), family: 'Technical appendix · system 02', aliases: ['appendix-1'], svg_source: 'svg/appendix-1.svg' },
      { id: 'a3', title: 'Gone', path: path.join(dist, 'nope.png'), family: 'Deck candidates · system 02', aliases: ['x'] },
      { id: 'a4', title: '', path: img('paper-A-gov'), family: 'Company pages · system 02', aliases: ['paper-A-gov'] },
    ],
  }));
  const r = await readDistCards(root);
  assert.equal(r.status, 'ok');
  assert.match(r.reason, /1 skipped: thumb missing/);
  assert.match(r.reason, /1 svg_source unresolved/);
  assert.equal(r.cards.length, 3);
  r.cards.forEach(assertCardShape);
  const [a, b, c] = r.cards;
  assert.equal(a.svg_path, svg);
  assert.equal(a.kind, 'slide');
  assert.equal(a.title, 'Treatment first');
  assert.equal(a.sha256, 'a'.repeat(64));
  assert.equal(a.hash_basis, 'manifest');
  assert.equal(a.built_at, '2026-10-25T07:35:58.790Z');
  assert.equal(a.deck_id, 'deck-candidates-system-02');
  assert.equal(b.kind, 'appendix');
  assert.equal(b.svg_path, null);
  assert.match(b.limitations, /svg_source not found/);
  assert.equal(c.kind, 'paper');
  assert.equal(c.title, 'Paper A gov');
  assert.equal(c.sha256, null);
});

test('dist-cards: missing root and missing cards.json are held', async (t) => {
  assertHeld(await readDistCards(missing()), 'dist-cards');
  const root = tmp('dc-empty');
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assertHeld(await readDistCards(root), 'dist-cards');
});

// ---------- smoke tests against the real corpora ----------
for (const [name, fn, root] of [
  ['deck-studio', readDeckStudio, REAL_DECK_STUDIO],
  ['system-02', readSystem02, REAL_JP],
  ['dist-cards', readDistCards, REAL_JP],
]) {
  test(`${name}: smoke against real corpus`, { skip: !existsSync(root) && `real root absent: ${root}` }, async () => {
    const r = await fn(root);
    assert.equal(r.status, 'ok', r.reason ?? '');
    assert.ok(r.cards.length >= 1);
    r.cards.forEach(assertCardShape);
  });
}
