Back to [[plans/2026-10-26-slide-board/overview]]

# SB-2 — Routes, SSE and the shell

## Goal

The index becomes reachable from a page. Five reads, one SSE stream, one guarded file route, and a `slides.html` shell that paints Tier 0 cards in under 300 milliseconds on loopback.

## Changes

- `runner/serve.mjs` (edited): the routes below.
- `scripts/build-slides.mjs` (new) producing `slides.html`; `slides.mjs`, `slides.css`.
- `slides-model.mjs` (new): pure merge, sort, paging and URL state, so all of it is unit-testable without a browser.

## Data structures

All reads are **GET and behind the O8 launch token and Host allowlist.** One mutation exists in the whole surface.

| Route | Returns |
| --- | --- |
| `/api/slides/recent?n=24&cursor=` | `{cards, asof, sort {key, dir, reason}, tiers}` |
| `/api/slides/search?q=` | `{hits [{card_id, rank, snippet}], engine: "fts5", agent_hits []}` |
| `/api/slides/card/:id` | card, renditions, occurrences, feedback, versions, agent_fields — **each tagged with the `run_id` that wrote it** |
| `/api/slides/status` | corpora, worker_runs, agents, counts, `replay {catalogue "2026-10-24T19:13:24Z"}` |
| `/api/slides/stream?since=<seq>` | SSE, monotonic `seq` |
| `/corpus/:corpus_id/<relpath>` | files **inside a registered root only** |
| `POST /api/slides/workers/:run_id/cancel` | the one mutation; Origin-checked |

The `sort.reason` field is not decoration. It is how the board explains itself: *"newest file first; undated catalogue rows after dated ones"* travels with the data, so the UI cannot describe a sort it is not performing.

**SSE events:** `card_added {seq, at, card}`, `card_updated {seq, at, card_id, fields, run_id}`, `worker_started {run_id, worker, corpus_id, total|null, at}`, `worker_progress {run_id, done, total, at}` — **per completed batch, never per interval** — `worker_done`, `worker_failed {run_id, error, at}`, `source_changed`, `agent_connected|agent_disconnected`, and a `: ping` comment heartbeat.

The file route ports Range support and the `Content-Security-Policy: sandbox` header from `RD\server.py:800-820`. Live SVG is served from `dist\svg` so that `../fonts/` resolves; the handoff `outputs\fonts` directory does not exist, which is why the source matters.

**These four reads — `recent`, `search`, `card`, `stream` — are exactly the `deps.slides` functions that [[plans/2026-10-26-l3-connect/phase-l3-1]] injects into the gateway.** One contract, two consumers.

## Routing

Route contracts, the event vocabulary and the `sort.reason` discipline: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`.

## Verification

**Static.** Four guard tests: a request without the launch token is refused; a foreign `Host` is refused; a foreign `Origin` on the cancel route is refused; and a `relpath` that escapes its registered root is refused — tested with `..`, with an absolute path, and with a symlink pointing outside.

**Runtime.** Playwright with `performance.mark`: **first decoded card image under 300 ms** on loopback. Screenshots at 1440 and 390 in both colour schemes.

One check that belongs here and nowhere else: with the index empty, the shell must render and say so. An empty board that looks broken is the failure this phase is most likely to ship.
