Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 5 — The catalogue under the chooser

## Goal

Keep every capability, brief and readiness note reachable from the homepage without bringing the long scroll back: a compact, searchable catalogue below the fold of the chooser, and `#tools-<room>` deep links that still resolve.

## Changes

- `scripts/build-chooser.mjs`: append the directory section (status guide, search, stage and room filters, the 30 cards with briefs) using the card markup already built in `build-world.mjs` — exported, not duplicated. Cards for the selected line are promoted to the top when a flow is chosen.
- `chooser.mjs`: port `searchCapabilities` wiring and the empty-state message; no new search logic.
- `chooser.css`: a dense card grid; no pinned stages, no per-room scroll travel.

## Data structures

Unchanged: `CAPABILITIES`, `READINESS`, `STATUS`, `CAPABILITY_BRIEFS`. A card's `room` links it to its flow for the promotion rule.

## Routing

Implementation: `codex` / `gpt-5.4`; review: `claude`.

## Verification

Static: the existing search and filter assertions from `tests/world.test.mjs` pass against the chooser build; the ten capabilities without briefs render the generic brief; every `#tools-<room>` and `#cap-N` anchor present today exists in the new page. Runtime: filter by stage and room in the browser pane; empty search shows the message; no-JS shows all 30 cards; page height with the catalogue expanded stays under 6,000 px at 1440×1000 (today's directory alone is 8,966 px).
