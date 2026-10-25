Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 4b — Dark theme

**Decision:** requested by the user on 2026-10-25: the site ships in both colour schemes.

## Goal

One token system, two schemes. The operating-system preference is honoured, a three-state toggle (system · light · dark) persists, the page never paints in the wrong scheme first, and every surface the later phases add — chooser, catalogue, strip, story, drop — is legible in both. The Transit lines get a palette per theme rather than one compromise.

## Changes

- `chooser.css`: a dark token set alongside the light one — page graphite `#182328`, panel `#121B1F`, ink `#F3F4F0`, muted `#9DB8A8`, teal `#5CCFBF`, line `#243136`, from `.superdesign/init/theme.md` and the Observatory mock — declared under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`; `body` carries an explicit background in both.
- `chooser.mjs`: the toggle, its `localStorage['openmeow-theme']` persistence (same pattern as the existing motion toggle), and an exported ten-line pre-paint snippet the build inlines into `<head>` so the first frame is already the right scheme.
- `world-transit.mjs`: `PALETTES.dark` — the eight DESIGN.md hues as authored (`#79D6A3`, `#F0A36B`, `#94B6F5`, `#E3BF67`, `#B59AD9`, `#EA6A61`, sage, teal) — and `PALETTES.light`, the darkened set already used on paper; interchange rings invert (ink on paper, paper on graphite); the renderer takes the palette as an argument so the SVG can be re-rendered on toggle.

## Data structures

A **theme state**: `system | light | dark`, resolved to an **effective scheme** `light | dark` at paint time. A **palette**: `{ lines: [8 hex], station, interchangeRing, held, label, labelMuted }` keyed by scheme.

## Routing

Implementation: `codex` / `gpt-5.4`; review: `claude` with the `dataviz` contrast validator and the `resilient-diagrams` skill.

## Verification

Static: a contrast test asserts every line colour ≥ 3:1 against its page background and every text token ≥ 4.5:1, in both schemes; per-scheme snapshot tests for the Transit SVG; a unit test that resolving `system` follows the media query. Runtime: screenshots of the chooser and catalogue in both schemes at 1280 and 390 in the browser pane (the pane's `colorScheme` emulation flips the OS preference); the toggle survives a reload; a first-frame capture after reload shows no flash; the strip, story and drop phases each add their own both-scheme screenshots when they land.
