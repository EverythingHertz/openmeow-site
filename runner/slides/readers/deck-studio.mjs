// Read-only reader for the Deck Studio corpus: one card per preview page in each */out/*-BUILD.json.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const CORPUS = 'deck-studio';
const TZ = { 'Pacific Daylight Time': '-07:00', 'Pacific Standard Time': '-08:00', UTC: 'Z' };

const held = (reason) => ({ corpus_id: CORPUS, status: 'held', reason, cards: [] });

async function statOrNull(p) {
  try { return await stat(p, { bigint: true }); } catch { return null; }
}

// "2026-10-25 10:24:07 Pacific Daylight Time" -> "2026-10-25T17:24:07.000Z"; null when unknown.
export function parseBuilt(text) {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})\s*(.*)$/.exec(String(text ?? '').trim());
  if (!m || !(m[3] in TZ)) return null;
  const d = new Date(`${m[1]}T${m[2]}${TZ[m[3]]}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// "06b-adherence" -> "Adherence"; "x01-set-your-own-odds" -> "Set your own odds".
export function titleFromStem(stem) {
  const words = stem.replace(/^[a-z]?\d+[a-z]?[-_]/i, '').replace(/[-_]+/g, ' ').trim() || stem;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

async function findManifests(root) {
  const found = [];
  for (const dir of await readdir(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const out = path.join(root, dir.name, 'out');
    let names;
    try { names = await readdir(out); } catch { continue; }
    for (const n of names) if (n.endsWith('-BUILD.json')) found.push(path.join(out, n));
  }
  return found.sort();
}

async function pagePngs(manifestPath) {
  const dir = path.join(path.dirname(manifestPath), 'pages');
  try { return (await readdir(dir)).filter((n) => n.endsWith('.png')).sort().map((n) => path.join(dir, n)); }
  catch { return []; }
}

export async function read(root) {
  try {
    const rootStat = await statOrNull(root);
    if (!rootStat || !rootStat.isDirectory()) return held(`root not found: ${root}`);
    const manifests = await findManifests(root);
    if (!manifests.length) return held(`manifest not found: ${path.join(root, '*', 'out', '*-BUILD.json')}`);

    const cards = [];
    const bad = [];
    let skipped = 0;
    for (const mPath of manifests) {
      let m;
      try { m = JSON.parse(await readFile(mPath, 'utf8')); } catch { bad.push(path.basename(mPath)); continue; }
      if (!m || typeof m !== 'object') { bad.push(path.basename(mPath)); continue; }
      const stem = path.basename(mPath, '.json');
      const deckId = typeof m.name === 'string' && m.name ? m.name : stem.replace(/-BUILD$/, '');
      const fromPreviews = Array.isArray(m.previews) && m.previews.length > 0;
      const thumbs = fromPreviews
        ? m.previews.map((p) => path.resolve(path.dirname(mPath), String(p)))
        : await pagePngs(mPath);
      const builtIso = parseBuilt(m.built);
      const seen = new Map();
      for (let i = 0; i < thumbs.length; i++) {
        const thumb = thumbs[i];
        const st = await statOrNull(thumb);
        if (!st || !st.isFile()) { skipped++; continue; }
        const fileStem = path.basename(thumb, path.extname(thumb));
        const n = (seen.get(fileStem) ?? 0) + 1;
        seen.set(fileStem, n);
        const builtMs = builtIso ? Date.parse(builtIso) : null;
        const limits = ['title derived from file name', 'sha256 not computed (manifest hashes the PDF only)',
          'currentness unknown', 'no SVG source in manifest', 'source_path is the page PNG, not the HTML source'];
        if (!fromPreviews) limits.push('page order from file names; manifest has no previews[]');
        if (!builtIso) limits.push('build time unparsed; built_at is file mtime');
        // Shared pages/ dirs get overwritten by later builds; flag thumbs written well after this build.
        if (builtMs !== null && Number(st.mtimeMs) > builtMs + 10 * 60 * 1000) {
          limits.push('thumb file modified after this build; image may show a later build');
        }
        cards.push({
          corpus_id: CORPUS,
          deck_id: deckId,
          deck_version: stem,
          slide_key: n > 1 ? `${fileStem}#${n}` : fileStem,
          slide_index: i + 1,
          title: titleFromStem(fileStem),
          kind: 'slide',
          source_path: thumb,
          thumb_path: thumb,
          svg_path: null,
          built_at: builtIso ?? new Date(Number(st.mtimeMs)).toISOString(),
          file_mtime_ns: Number(st.mtimeNs),
          sha256: null,
          hash_basis: null,
          current: null,
          currentness: 'unknown',
          currentness_source: 'none',
          evidence: 'real',
          limitations: limits.join('; '),
        });
      }
    }
    if (bad.length === manifests.length) return held(`manifest unparsable: ${bad.join(', ')}`);
    const notes = [];
    if (skipped) notes.push(`${skipped} skipped: thumb missing`);
    if (bad.length) notes.push(`${bad.length} manifest unparsable: ${bad.join(', ')}`);
    return { corpus_id: CORPUS, status: 'ok', reason: notes.length ? `ok; ${notes.join('; ')}` : null, cards };
  } catch (err) {
    return held(`read failed: ${err?.message ?? err}`);
  }
}
