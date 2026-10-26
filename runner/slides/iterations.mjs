// Stitch-style iteration store: one folder per card, one change per version, nothing overwritten.
// <data>/iterations/<card_id>/v1.svg (source copy), vN.svg + vN.json (parent, instruction), request-K.json
import { mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, constants } from 'node:fs';
import { join } from 'node:path';

const MAX_INSTRUCTION = 500;

export function iterDir(dataDir, cardId) {
  if (!/^loc-[0-9a-f]{20}$/.test(cardId)) throw new Error('bad card id');
  return join(dataDir, 'iterations', cardId);
}

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

export function state(dataDir, cardId) {
  const dir = iterDir(dataDir, cardId);
  if (!existsSync(dir)) return { dir, versions: [], requests: [], pending: null };
  const files = readdirSync(dir);
  const versions = files
    .map((f) => /^v(\d+)\.svg$/.exec(f))
    .filter(Boolean)
    .map((m) => {
      const n = Number(m[1]);
      const meta = readJson(join(dir, `v${n}.json`)) || {};
      return { version: n, file: `v${n}.svg`, parent: meta.parent ?? null, instruction: meta.instruction ?? null,
        author: meta.author ?? null, created_at: meta.created_at ?? null };
    })
    .sort((a, b) => a.version - b.version);
  const requests = files
    .map((f) => /^request-(\d+)\.json$/.exec(f))
    .filter(Boolean)
    .map((m) => readJson(join(dir, m[0])))
    .filter(Boolean)
    .sort((a, b) => a.request - b.request);
  const have = new Set(versions.map((v) => `v${v.version}`));
  const pending = requests.find((r) => !have.has(r.target)) || null;
  return { dir, versions, requests, pending };
}

export function promptFor(card, req, dir) {
  const n = Number(req.target.slice(1));
  const meta = JSON.stringify({ version: n, parent: req.base, instruction: req.instruction, author: '<your agent name>', created_at: '<ISO time>' });
  return [
    `OpenMeow iterate request ${req.request} for slide "${card.title}" (${card.card_id}).`,
    `Folder: ${dir}`,
    `1. Read ${req.base}.svg in that folder. Do not modify it.`,
    `2. Apply exactly this one change and nothing else: ${req.instruction}`,
    `3. Save the result as ${req.target}.svg in the same folder.`,
    `4. Write ${req.target}.json next to it: ${meta}`,
    'Never overwrite an existing file in the folder.',
  ].join('\n');
}

export function createRequest(dataDir, card, instruction) {
  const text = String(instruction || '').trim();
  if (!text) return { error: 'Type one change first.', status: 400 };
  if (text.length > MAX_INSTRUCTION) return { error: `Keep the change under ${MAX_INSTRUCTION} characters.`, status: 400 };
  if (!card.svg_path || !existsSync(card.svg_path)) return { error: 'This slide has no SVG source, so it cannot be iterated yet.', status: 409 };
  const dir = iterDir(dataDir, card.card_id);
  mkdirSync(dir, { recursive: true });
  if (!existsSync(join(dir, 'v1.svg'))) {
    copyFileSync(card.svg_path, join(dir, 'v1.svg'), constants.COPYFILE_EXCL);
    writeFileSync(join(dir, 'v1.json'), JSON.stringify({ version: 1, parent: null, instruction: null,
      author: 'source copy', source_path: card.svg_path, created_at: new Date().toISOString() }, null, 2), { flag: 'wx' });
  }
  const s = state(dataDir, card.card_id);
  if (s.pending) return { error: `Request ${s.pending.request} is still waiting for ${s.pending.target}.`, status: 409 };
  const latest = s.versions.at(-1).version;
  const req = { request: s.requests.length + 1, card_id: card.card_id, instruction: text,
    base: `v${latest}`, target: `v${latest + 1}`, status: 'waiting for agent', created_at: new Date().toISOString() };
  writeFileSync(join(dir, `request-${req.request}.json`), JSON.stringify(req, null, 2), { flag: 'wx' });
  return { request: req, prompt: promptFor(card, req, dir) };
}
