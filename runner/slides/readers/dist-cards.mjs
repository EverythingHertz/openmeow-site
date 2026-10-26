// Read-only reader for JP dist/desk-handoff/cards.json: one card per asset.
// svg_source is relative to JP/dist/ (verified per asset by checking the file exists).
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const CORPUS = 'dist-cards';
const CARDS = ['dist', 'desk-handoff', 'cards.json'];

const held = (reason) => ({ corpus_id: CORPUS, status: 'held', reason, cards: [] });

async function statOrNull(p) {
  try { const s = await stat(p, { bigint: true }); return s.isFile() ? s : null; } catch { return null; }
}

// Try each base in order; return the first existing file.
async function resolveFile(rel, bases) {
  if (typeof rel !== 'string' || !rel) return null;
  const tries = path.isAbsolute(rel) ? [rel] : bases.map((b) => path.resolve(b, rel));
  for (const p of tries) { const s = await statOrNull(p); if (s) return { p, s }; }
  return null;
}

const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unfiled';

function kindOf(a) {
  const k = String(a.aliases?.[0] ?? a.id ?? '');
  const fam = String(a.family ?? '');
  if (/^appendix-/i.test(k) || /appendix/i.test(fam)) return 'appendix';
  if (/^paper-/i.test(k)) return 'paper';
  if (/deck/i.test(fam)) return 'slide';
  return 'asset';
}

function titleFromStem(stem) {
  const words = stem.replace(/^[a-z]?\d+[a-z]?[-_]/i, '').replace(/[-_]+/g, ' ').trim() || stem;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function read(root) {
  try {
    const rootStat = await stat(root).catch(() => null);
    if (!rootStat || !rootStat.isDirectory()) return held(`root not found: ${root}`);
    const cPath = path.join(root, ...CARDS);
    let doc;
    try { doc = JSON.parse(await readFile(cPath, 'utf8')); }
    catch (err) { return held(err?.code === 'ENOENT' ? `manifest not found: ${cPath}` : `manifest unparsable: ${cPath}`); }
    if (!Array.isArray(doc?.assets)) return held(`manifest has no assets[]: ${cPath}`);

    const distDir = path.join(root, 'dist');
    const cardsDir = path.dirname(cPath);
    const genMs = Date.parse(doc.generated_at ?? '');
    const builtIso = Number.isNaN(genMs) ? null : new Date(genMs).toISOString();
    const deckVersion = String(doc.generated_at ?? 'cards');
    const counters = new Map();
    const cards = [];
    let skipped = 0;
    let svgMissing = 0;

    for (const a of doc.assets) {
      if (!a || typeof a !== 'object') { skipped++; continue; }
      const thumb = await resolveFile(a.path, [distDir, cardsDir]);
      if (!thumb) { skipped++; continue; }
      const svg = a.svg_source ? await resolveFile(a.svg_source, [distDir]) : null;
      if (a.svg_source && !svg) svgMissing++;

      const deckId = slug(a.family ?? 'unfiled');
      const idx = (counters.get(deckId) ?? 0) + 1;
      counters.set(deckId, idx);
      const stem = path.basename(thumb.p, path.extname(thumb.p));
      const slideKey = String(a.aliases?.[0] ?? a.id ?? stem);
      const hasTitle = typeof a.title === 'string' && a.title.trim();
      const hasSha = typeof a.sha256 === 'string' && a.sha256;

      const limits = [];
      if (!hasTitle) limits.push('title derived from file name');
      limits.push(hasSha ? 'sha256 is the cards.json value for the PNG, not recomputed' : 'sha256 not computed');
      limits.push('currentness unknown (cards.json has no current flag)');
      limits.push('slide_index is order within family in cards.json, not deck page order');
      if (a.svg_source && !svg) limits.push(`svg_source not found under dist/: ${a.svg_source}`);
      if (!a.svg_source) limits.push('no svg_source');
      if (!builtIso) limits.push('generated_at unparsed; built_at is file mtime');

      cards.push({
        corpus_id: CORPUS,
        deck_id: deckId,
        deck_version: deckVersion,
        slide_key: slideKey,
        slide_index: idx,
        title: hasTitle ? a.title.trim() : titleFromStem(stem),
        kind: kindOf(a),
        source_path: svg ? svg.p : thumb.p,
        thumb_path: thumb.p,
        svg_path: svg ? svg.p : null,
        built_at: builtIso ?? new Date(Number(thumb.s.mtimeMs)).toISOString(),
        file_mtime_ns: Number(thumb.s.mtimeNs),
        sha256: hasSha ? a.sha256 : null,
        hash_basis: hasSha ? 'manifest' : null,
        current: null,
        currentness: 'unknown',
        currentness_source: 'none',
        evidence: 'real',
        limitations: limits.join('; '),
      });
    }
    const notes = [];
    if (skipped) notes.push(`${skipped} skipped: thumb missing`);
    if (svgMissing) notes.push(`${svgMissing} svg_source unresolved`);
    return { corpus_id: CORPUS, status: 'ok', reason: notes.length ? `ok; ${notes.join('; ')}` : null, cards };
  } catch (err) {
    return held(`read failed: ${err?.message ?? err}`);
  }
}
