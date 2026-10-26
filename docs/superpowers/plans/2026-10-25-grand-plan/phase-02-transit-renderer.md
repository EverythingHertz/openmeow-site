Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 2 — The Transit renderer

## Goal

A pure function from the workflow graph to an SVG string: the system map, in the Beck idiom, usable at build time (server-rendered into the page) and at runtime (re-rendered on selection). No DOM, no timers.

## Changes

- `world-transit.mjs` (new): `renderSystemMap(flows, layout, options)` returning SVG markup; `renderRoute(flow, layout)` for the selected-line overlay; a `LAYOUT` table giving each stop a grid cell and each route its bends.
- `tests/world-transit.test.mjs` (new).
- `docs/superpowers/plans/2026-10-25-grand-plan/fixtures/transit.html` (new): a static fixture page that renders the map for visual review.

## Data structures

A **layout**: `{ grid: {cols, rows, cellW, cellH, padX, padY}, stops: { stopId: {x, y, labelSide} }, routes: { flowId: [[x,y], …] } }`. Visual vocabulary, fixed: lines 9 px round-capped in the eight DESIGN.md hues (teal, gold, sky, plum, ember, alert, sage, signal) darkened for paper; regular stations as small rings in the line colour; interchanges as white rings with an ink stroke; terminals as filled discs with a white core; held stops as amber rings with a mono `HELD · reason` label. Labels anchor by `labelSide` so none collide at the default viewBox.

## Routing

Architecture and the first layout: `claude` / `claude-opus-4-6`; tests and fixture: `codex` / `gpt-5.4`.

## Verification

Static: snapshot test on a fixed graph; octilinearity test over every route segment; a label-collision test using measured text widths; the selected-route overlay dims every other line and no station of the selected line. Runtime: open the fixture in the browser pane at 1280 and 390 wide; screenshot both; check that interchanges read as interchanges without the legend.
