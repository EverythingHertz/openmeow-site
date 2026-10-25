Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 1 — The workflow graph

## Goal

Give every room a workflow map as data, derived from what already exists and extended with the three things the data lacks: shared tools, held states and human checkpoints. Nothing renders yet.

## Changes

- `world-flows.mjs` (new): exports `FLOWS` (one per room, keyed by room id), `INTERCHANGES` (shared stops keyed by a stable id, each naming the flows that pass through it), and small helpers to look up a flow's stops, its terminal, and the other flows at any interchange.
- `world-model.mjs`: each `ROOMS` entry gains a `flow` reference by id; the unused inline `flow` arrays are removed.
- `tests/world-flows.test.mjs` (new).

## Data structures

A **flow**: `{ id, room, line (name), product, capabilityId, stops[] }`. A **stop**: `{ id, label, type: start|step|lane|held|check|end, capabilityId?, interchangeId?, reason? (held), lane? (name) }`. An **interchange**: `{ id, label, flows[] }`. Grid positions for the map are *not* stored here; they belong to the renderer's layout table in phase 2, so content and geometry can change independently.

Seed content comes from `DEMOS[room].steps` (three stops each), `ROOMS[room].href` (the capability the terminal opens), and the hand-drawn flows already validated in the 2026-10-25 mocks: Subtle Lasagne with three specialist lanes and a held chart task; FundMeMeow with a held partner-letter stop; Gellphant with a human gate. Shared stops to start: Contract (Coordinate agents · Build an agent), Review (Make slides · Check an answer · Coordinate agents), Sources (Make slides · Find previous work), Receipts (Make slides · See a run).

## Routing

Architecture: `claude` / `claude-opus-4-6` for the schema and seed content; implementation: `codex` / `gpt-5.4`.

## Verification

Static: tests prove every flow has exactly one `end`; every `interchangeId` resolves and names ≥ 2 flows; every `capabilityId` exists in `CAPABILITIES`; every `held` stop has a `reason`; ids are unique. Runtime: none — `node -e` prints the eight flows as plain text for a read-through, attached to the completion note.
