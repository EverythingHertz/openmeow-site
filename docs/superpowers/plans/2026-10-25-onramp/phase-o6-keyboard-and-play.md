Back to [[plans/2026-10-25-onramp/overview]]

# O6 — Keyboard and play

## Goal

Make the map a thing you want to touch. Navigation that rewards a second visit, an interchange that explains itself on hover, and a keyboard path that is faster than the mouse — without a single control that exists only to be cute.

## Changes

- `chooser.mjs`: number keys `1`–`8` select a line, `0` clears, arrows step along the selected route stop by stop with the card following, `?` opens a key sheet, `Escape` returns to the spine. Hovering or focusing an interchange lights every line through it and names the others in the card's stop list — the one interaction that teaches what an interchange *is* without a legend.
- `world-transit.mjs`: the train runs the selected route once and settles at the terminal; stepping with arrows moves it stop to stop. Stop-level selection becomes part of the hash (`#mission-control/review`), so a single stop is linkable.
- `chooser.css`: focus styling that is visible on both schemes and never removed; the key sheet; the hover-lit interchange state.

## Data structures

A **key map**: `{ key, action, label }`, one table driving behaviour and the `?` sheet so they cannot drift apart. A **stop selection**: `{ lineId, stopId? }`, which is what the hash now carries and what the card renders.

## The line this phase does not cross

Play means the map is pleasant to operate — not that it hides information behind interaction. Every fact reachable by hover or key is also present in the rendered card; nothing is discoverable only by playing. Reduced motion keeps every behaviour and drops only the movement.

## Routing

Interaction design: `claude` / `claude-opus-4-6` with `impeccable`. Implementation: `codex` / `gpt-5.4`.

## Verification

Static: a test that every entry in the key map has a handler and appears in the sheet, and that no handler exists outside the map; a test that stop-level hashes round-trip. Runtime: the full path — land, select, step to a stop, copy the command — completed with the keyboard alone and recorded; focus is visible at every step in both schemes; hovering an interchange lights exactly the lines through it; with reduced motion on, every key still works and nothing animates; a screen-reader pass over the map's accessible names.
