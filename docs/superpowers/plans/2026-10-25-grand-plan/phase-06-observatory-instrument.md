Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 6 — The Observatory instrument and the first real run

## Goal

Give the Observatory room its native view — the strip chart — and feed it one real, verifiable run so the site shows committed state rather than an illustration.

## Changes

- `world-strip.mjs` (new): `renderStrip(run)` — a pure function from a run record to SVG: stages as a stepped trace, gates as dashed verticals with a diamond, held segments in amber, the result band, mono receipt tags; a corner tag that reads `ILLUSTRATIVE` only when `run.synthetic` is true.
- `data/runs/2026-10-25-deck-handoff.json` (new): the first record — the deck creative study handoff: events (brief sent, package sealed, manifest verified 193/193, ledgered, reply), timestamps with timezone, receipt counts and hashes. Metadata only; no content from the package.
- `tests/world-strip.test.mjs` (new), plus a small schema check for run records.

## Data structures

A **run record**: `{ id, title, source: {kind, ref}, started, ended, synthetic: boolean, events: [{ at, stage, label, receipt?: {sha256, bytes}, gate?: boolean, held?: {reason} }], result: {label, receiptCount} }`. Records are read-only inputs; the site never computes a run.

## Routing

Architecture and the record's wording: `claude` / `claude-opus-4-6` with the `figure-claim-contract` skill (say only what the receipts support); implementation: `codex` / `gpt-5.4`.

## Verification

Static: a record missing `events`, `result` or any timestamp is refused by the schema test; rendered event count equals the record's; the illustrative tag appears exactly when `synthetic` is true. Runtime: the Observatory card on the chooser shows the real run; its hashes match the hub ledger at `C:\Work\00_Portfolio\handoffs\HANDOFF_2026-10-25_0225_PDT_openmeow-hub-weave\LEDGER.md`; screenshot in the browser pane at 1280 and 390.
