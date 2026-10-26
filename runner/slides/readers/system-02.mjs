// Read-only reader for JP system-02: slide ids from outputs/system-02/manifest.json,
// sha256/mtime/current from the deck-creative-study handoff inventory.
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const CORPUS = 'system-02';
const MANIFEST = ['outputs', 'system-02', 'manifest.json'];
const INVENTORY = ['outputs', 'HANDOFF_2026-10-25_0225_PDT_deck-creative-study-to-hub', 'data', 'inventory.json'];

const held = (reason) => ({ corpus_id: CORPUS, status: 'held', reason, cards: [] });
const key = (p) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p));

async function statOrNull(p) {
  try { const s = await stat(p, { bigint: true }); return s.isFile() ? s : null; } catch { return null; }
}

function titleFromStem(stem) {
  const words = stem.replace(/^[a-z]?\d+[a-z]?[-_]/i, '').replace(/[-_]+/g, ' ').trim() || stem;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

async function loadInventory(root) {
  try {
    const inv = JSON.parse(await readFile(path.join(root, ...INVENTORY), 'utf8'));
    if (!Array.isArray(inv?.items)) return { map: null, note: 'inventory has no items[]' };
    const map = new Map();
    for (const it of inv.items) if (it && typeof it.path === 'string') map.set(key(it.path), it);
    return { map, note: null };
  } catch (err) {
    return { map: null, note: err?.code === 'ENOENT' ? 'inventory not found' : 'inventory unparsable' };
  }
}

export async function read(root) {
  try {
    const rootStat = await stat(root).catch(() => null);
    if (!rootStat || !rootStat.isDirectory()) return held(`root not found: ${root}`);
    const mPath = path.join(root, ...MANIFEST);
    let m;
    try { m = JSON.parse(await readFile(mPath, 'utf8')); }
    catch (err) { return held(err?.code === 'ENOENT' ? `manifest not found: ${mPath}` : `manifest unparsable: ${mPath}`); }
    if (!Array.isArray(m?.slides)) return held(`manifest has no slides[]: ${mPath}`);

    const dir = path.dirname(mPath);
    const inv = await loadInventory(root);
    const deckVersion = String(m.version ?? m.build_id ?? 'system-02/manifest');
    const cards = [];
    let skipped = 0;

    for (let i = 0; i < m.slides.length; i++) {
      const id = String(m.slides[i]);
      const svg = path.join(dir, `${id}.svg`);
      const png = path.join(dir, `${id}.png`);
      const preview = path.join(dir, `${id}-preview.png`);
      const [svgSt, pngSt, prevSt] = await Promise.all([statOrNull(svg), statOrNull(png), statOrNull(preview)]);
      const pngs = [[preview, prevSt], [png, pngSt]].filter(([, s]) => s).sort((a, b) => Number(a[1].size - b[1].size));
      if (!pngs.length) { skipped++; continue; }
      const [thumb, thumbSt] = pngs[0];

      const thumbEntry = inv.map?.get(key(thumb)) ?? null;
      const svgEntry = svgSt ? inv.map?.get(key(svg)) ?? null : null;
      const curEntry = thumbEntry ?? svgEntry;
      const current = typeof curEntry?.current === 'boolean' ? curEntry.current : null;

      const limits = ['title derived from file name', 'sha256 is the inventory value for the thumb file, not recomputed'];
      if (inv.note) limits.push(`${inv.note}; sha256 null; currentness unknown`);
      else if (!thumbEntry) limits.push('thumb not in inventory; sha256 null');
      if (thumbEntry?.mtime) {
        const invMs = Date.parse(thumbEntry.mtime);
        if (!Number.isNaN(invMs) && Math.abs(Number(thumbSt.mtimeMs) - invMs) > 2000) {
          limits.push('thumb mtime differs from inventory; inventory sha256 may be stale');
        }
      }
      if (current === null) limits.push('currentness unknown');
      else limits.push('currentness is the inventory flag as of its generation time, not a live check');
      if (!svgSt) limits.push('no SVG on disk');
      limits.push('built_at is file mtime; manifest has no build time');

      cards.push({
        corpus_id: CORPUS,
        deck_id: 'system-02',
        deck_version: deckVersion,
        slide_key: id,
        slide_index: i + 1,
        title: titleFromStem(id),
        kind: 'slide',
        source_path: svgSt ? svg : pngSt ? png : thumb,
        thumb_path: thumb,
        svg_path: svgSt ? svg : null,
        built_at: new Date(Number(thumbSt.mtimeMs)).toISOString(),
        file_mtime_ns: Number(thumbSt.mtimeNs),
        sha256: typeof thumbEntry?.sha256 === 'string' ? thumbEntry.sha256 : null,
        hash_basis: typeof thumbEntry?.sha256 === 'string' ? 'manifest' : null,
        current,
        currentness: current === true ? 'current' : current === false ? 'superseded' : 'unknown',
        currentness_source: current === null ? 'none' : 'inventory.current',
        evidence: 'real',
        limitations: limits.join('; '),
      });
    }
    const notes = [];
    if (skipped) notes.push(`${skipped} skipped: thumb missing`);
    if (inv.note) notes.push(inv.note);
    return { corpus_id: CORPUS, status: 'ok', reason: notes.length ? `ok; ${notes.join('; ')}` : null, cards };
  } catch (err) {
    return held(`read failed: ${err?.message ?? err}`);
  }
}
