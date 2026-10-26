Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 8 — The drop chooser

**Decision:** approved by the user on 2026-10-25 as a committed phase — the third way to choose, alongside the line index and the building map.

## Goal

An artifact-first way to choose: drop a file on the page, watch the tracker walk Capture → Inspect → Classify → Route, land on the right line. Strictly client-side — name, type and size only, nothing leaves the browser — and honest about progress: the tracker advances only on real events, never on a timer, the rule the Electron portal in `EverythingHertz/openmeow` PR #47 already enforces.

## Changes

- `chooser-drop.mjs` (new): drag-and-drop and a choose-file button; a local extension table mirroring the engine's gate (`REJECTED` never opened, `NO_INSPECT` stored-but-not-read, everything else inspected by name only); a mapping from file kind to the flow it suggests; the tracker and its live region.
- `chooser.css`: the portal region and its reduced-motion still state.
- `assets/portal-swirl.png`: copied from PR #47's `portal/assets/` with a provenance note, used with the same non-rotating deformation loop.

## Data structures

A **drop**: `{ name, ext, bytes, kind: rejected|opaque|inspectable, suggestedFlowId, stages: [capture, inspect, classify, route] with timestamps }`. No persistence; nothing is uploaded or stored.

## Routing

Architecture: `claude` / `claude-opus-4-6` (the no-timer tracker and the privacy boundary); implementation: `codex` / `gpt-5.4`.

## Verification

Static: unit tests for the extension table and the kind-to-flow mapping; a test that the tracker's state machine has no transition without an event. Runtime: Playwright asserts zero network requests during a drop; dropping a `.exe` shows "not opened" and routes nowhere; keyboard choose-file reaches the same route as a drag; reduced motion shows the still ring; screenshots at 1280 and 390.
