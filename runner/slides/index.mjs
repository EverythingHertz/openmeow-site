// Slide index: one node:sqlite file, rebuilt from the corpus readers on every start.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS corpora;
CREATE TABLE IF NOT EXISTS cards (
  card_id TEXT PRIMARY KEY,
  corpus_id TEXT NOT NULL,
  deck_id TEXT NOT NULL,
  deck_version TEXT NOT NULL,
  slide_key TEXT NOT NULL,
  slide_index INTEGER,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  source_path TEXT,
  thumb_path TEXT NOT NULL,
  svg_path TEXT,
  built_at TEXT NOT NULL,
  file_mtime_ns TEXT,
  sha256 TEXT,
  hash_basis TEXT CHECK (hash_basis IN ('manifest') OR hash_basis IS NULL),
  current INTEGER,
  currentness TEXT NOT NULL CHECK (currentness IN ('current','superseded','unknown')),
  currentness_source TEXT NOT NULL,
  evidence TEXT NOT NULL CHECK (evidence IN ('real','recorded')),
  limitations TEXT NOT NULL CHECK (length(trim(limitations)) > 0),
  indexed_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cards_recent ON cards (built_at DESC, slide_index ASC);
CREATE TABLE IF NOT EXISTS corpora (
  corpus_id TEXT PRIMARY KEY,
  root TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok','held')),
  reason TEXT,
  card_count INTEGER NOT NULL,
  read_at TEXT NOT NULL
);`;

export function cardId(c) {
  const h = createHash('sha256').update([c.corpus_id, c.deck_id, c.deck_version, c.slide_key].join('|')).digest('hex');
  return 'loc-' + h.slice(0, 20);
}

export function openIndex(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
  return db;
}

// results: [{ corpus_id, root, status, reason, cards }]
export function rebuild(db, results) {
  const now = new Date().toISOString();
  const insCard = db.prepare(`INSERT OR REPLACE INTO cards VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insCorpus = db.prepare('INSERT INTO corpora VALUES (?,?,?,?,?,?)');
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM cards; DELETE FROM corpora;');
    for (const r of results) {
      let n = 0;
      for (const c of r.cards) {
        insCard.run(cardId(c), c.corpus_id, c.deck_id, c.deck_version, c.slide_key, c.slide_index ?? null,
          c.title, c.kind, c.source_path ?? null, c.thumb_path, c.svg_path ?? null, c.built_at,
          c.file_mtime_ns == null ? null : String(c.file_mtime_ns), c.sha256 ?? null, c.hash_basis ?? null,
          c.current == null ? null : (c.current ? 1 : 0), c.currentness, c.currentness_source,
          c.evidence, c.limitations, now);
        n++;
      }
      insCorpus.run(r.corpus_id, r.root, r.status, r.reason ?? null, n, now);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export function recent(db, limit = 500) {
  return db.prepare(`SELECT * FROM cards ORDER BY built_at DESC, deck_id, slide_index ASC LIMIT ?`).all(limit);
}

export function corpora(db) {
  return db.prepare('SELECT * FROM corpora ORDER BY corpus_id').all();
}

export function card(db, id) {
  return db.prepare('SELECT * FROM cards WHERE card_id = ?').get(id);
}
