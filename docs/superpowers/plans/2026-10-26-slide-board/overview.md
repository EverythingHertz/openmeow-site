---
id: 2026-10-26-slide-board
created: 2026-10-25
status: planned
repo: EverythingHertz/openmeow-site
layers-on: 2026-10-25-onramp
---

# The progressive slide board

> **Amended 2026-10-26 by [[specs/2026-10-26-focus-canvas-design]].** The first screen is now the focus canvas — one slide, one change box, the corpus in a dock — and this plan's grid becomes its Browse state. Phases SB-3 to SB-5 (the catalogue, background workers and live updates) are deferred. Where the two disagree, the spec wins.

## Context

Every slide this project has ever made is scattered across Deck Studio builds, a handoff tree, a `dist` repo, a 25.5 MB Review desk catalogue, and two Codex lineage folders. There is no surface that shows them together, and the one viewer that exists (`board.html`) reads a single corpus.

This plan builds that surface inside the O8 runner: an index over every corpus, a board that fills in as workers finish, and a status strip that says exactly what is still coming. It is also the demonstration the on-ramp needs — real counts climbing in the first two seconds, with nothing synthetic and nothing labelled illustrative.

## Two measured facts that shape the whole design

**Node 24.21 ships `node:sqlite` with FTS5 compiled in** (SQLite 3.53.4; `CREATE VIRTUAL TABLE … USING fts5` verified in memory on 2026-10-25). So the index lives inside the dependency-free runner with **no install step**. This is why the board can exist at all without asking a visitor to install anything.

**The Review desk refuses cross-origin requests by design** (`RD\server.py:693-699` `origin_ok`; `:705` sends `X-Frame-Options: SAMEORIGIN`). So its catalogue is read from `catalog.json` **on disk, always**, and labelled as the replay it is. We do not proxy around another lane's security posture, and we do not pretend a disk read is a live query.

## Identity, and why it is split

```
card_id    = 'loc-' + sha256(corpus|deck_id|deck_version|slide_key)[:20]
content_id = 'sha-' + sha256[:20]
```

`card_id` is stable **before any file is hashed**, so a card can exist the moment a manifest is read. `content_id` arrives when the hash is known and equals the native ids in `cards.json` and the catalogue, so cross-referencing with the desk is free rather than a join we maintain.

Every card carries `lineage`, `hash_basis` in `{manifest, computed, null}`, `evidence` in `{real, recorded}`, and `currentness {source, value}` taken **only** from an owner manifest (`inventory.json current`, `BUILD.json`, lookbook `archived`) or else `unknown`.

Three things are deliberately **not** folded into identity:

- **Appearance** (`occurrences`) — the same bytes in two corpora is one card with two sightings, not two cards.
- **Explicit feedback** (`status_marks`, `prior_feedback`) — someone's judgement about a slide is not a property of the slide.
- **Agent-derived fields** — they live in their own table and are **never promoted** into `real` or `recorded`.

`file_mtime` is a sort hint and nothing more.

## Tiers of depth

Budgets measured on this machine, 2026-10-25.

| Tier | Inputs | Worker | Measured | Label |
| --- | --- | --- | --- | --- |
| **0 manifest** | Deck Studio `*-BUILD.json` (25, 11, 10 pp); `system-02/manifest.json` + `inventory.json` (184 items with sha256, mtime, bytes); `cards.json` (21) | in-process readers, one per corpus, parallel | 6 JSON reads + ~90 `stat` calls **< 30 ms**; first paint target **< 300 ms** | `real · manifest-hashed`, or `real · hash pending` |
| **1 catalogue** | `RD\catalog.json`, 25.5 MB | one `worker_threads` Worker | Python parsed it in **0.13 s**; 1,113 rows under `02_Pitch_Decks`; 807 have a thumbnail; **no mtime at all** | `recorded · replay of catalogue 2026-10-24T19:13:24Z · not re-checked` |
| **1b Codex lineages** | two Codex output folders | readers written once the Codex evidence packet names their manifests | **unknown** until that packet arrives | `recorded · Codex lane · read-only` |
| **2 filesystem** | every card with a `source_path` | bounded pools: NTFS 4, OneDrive 1, Python 1 | 2a `stat` (1,113 OneDrive stats in **0.26 s**); 2b sha256 (~95 MB, under 1 s); 2c text; 2d splitting (154 decks, **10–25 min**, runs last); 2e OneDrive guard; 2f cache thumbs | `real · computed <time>`; cloud-only: `offline · not hydrated` |
| **3 agent** | cards + a job queue | **the visitor's own** Claude Code or Codex over MCP | whatever it takes; nothing waits on it | `agent-derived`, never real or recorded |

**The honesty rule on every tier:** progress moves only on a completion message from a worker. No indeterminate spinner. Running is a ring, finished a filled disc, failed an amber ring reading `HELD · <error>` — the Transit vocabulary from `phase-02-transit-renderer.md`.

## The index

`%LOCALAPPDATA%\openmeow\slides\index.sqlite`, with `cache\thumbs\` beside it. **Nothing is ever written inside any corpus.** Corpus roots come from `corpora.json` or `--corpus name=path`; the CLI prints this machine's example when the file is missing.

WAL, `busy_timeout 5000` (as `agent_ledger\db.py:22-25`). Tables: `corpora`, `cards`, `renditions`, `occurrences`, `feedback`, `versions`, `agent_fields`, `cards_fts`, `sources_watermark`, `worker_runs`. `limitations` on `cards` is `NOT NULL` — a card that cannot say what is unknown about it does not get stored.

`worker_runs` maps **1:1 onto the grand plan's phase-06 run record**, so the strip and the Observatory show the same thing.

Refresh compares `(st_size, st_mtime_ns)` per watermark row (`indexer.py:219`); `fs.watch` on the manifests turns a change into a `source_changed` event and a re-read. **Nothing re-indexes on a clock.**

Version chains are all mechanical, never inferred: `manifest-pair` by slug, `build-order` by build time, `slug-match` inside the catalogue's `_Old_Versions` families. A same source hash with a different render hash is a **re-render, not a version**.

## The shotgun

At start the runner fires every corpus × level job at once. Tier 0 resolves before the page's first `recent` request; everything else arrives over SSE. Each job owns an `AbortController`; the slow ones are cancellable from the strip.

Client merge is keyed by `card_id`. A `card_added` that sorts below the viewport inserts silently; one that would land **above the fold goes to a tray** ("31 new since you opened · show") and **the grid does not move**. `card_updated` patches in place. Re-sort happens only on tray click or scroll to top.

This is the part that is easy to get wrong and obvious when it is wrong: a board that reflows while someone is reading it is worse than a board that is slow.

## Scope

**In:** the index, the routes, the board, the workers, the agent chips.

**Out, and these are hard boundaries.** The board does not edit, delete, upload, rename or move anything; does not write into a corpus; does not hydrate OneDrive; and persists nothing but view preferences. Do not touch: the Review desk SQLite, anything under the handoff `outputs` tree, the `dist` git repo, the Codex lineage folders, or ports 8892, 8893 and 8899.

## Phases

1. [[plans/2026-10-26-slide-board/phase-sb-1]] — three corpora in a terminal.
2. [[plans/2026-10-26-slide-board/phase-sb-2]] — routes, SSE and the shell.
3. [[plans/2026-10-26-slide-board/phase-sb-3]] — the shotgun.
4. [[plans/2026-10-26-slide-board/phase-sb-4]] — depth: zoom, reader, present, diff.
5. [[plans/2026-10-26-slide-board/phase-sb-5]] — the slow workers.
6. [[plans/2026-10-26-slide-board/phase-sb-6]] — agents, and the seam with [[plans/2026-10-26-l3-connect/overview]].
7. [[plans/2026-10-26-slide-board/phase-sb-7]] — craft and the release gate.

## Cut order

PPTX-to-PDF conversion (keep PDF splitting and pptx text); the versions slider and diff (keep predecessor links); Reader mode; Tier 2f cache thumbs; "ask the agent"; density presets; and **last**, the catalogue tier itself — the three manifest corpora alone still make the sixty-second show, and the strip says the catalogue is not indexed rather than hiding it.

## Verification

Per phase, static then runtime. Fixtures are synthetic and in the three real shapes: **no private content enters the repository.** Details in each phase file.
