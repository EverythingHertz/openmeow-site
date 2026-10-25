Back to [[plans/2026-10-25-onramp/overview]]

# O5 — The craft pass

## Goal

Make it beautiful on purpose rather than by accident: one type system, one motion language, the Dot as a working state indicator, both colour schemes, and a deterministic gate that proves the SVG is sound instead of asserting it.

## Changes

- `chooser.css`: the type scale and rhythm fixed against the design system (Space Grotesk, paper `#F3F4F0`, ink `#172B2A`, teal `#167C72`, graphite `#182328`); one motion language — the route draws once on selection, the train runs once, everything else is a state change under 200 ms; every animation behind `prefers-reduced-motion`.
- `world-transit.mjs`: the Dot becomes the train and the selection marker, carrying the mascot's state vocabulary (idle, working, thinking, needs-input) from `EverythingHertz/agent-pet-mascot`, so motion means something rather than decorating.
- `tests/svg-gates.test.mjs` (new): the generated map and strip are checked by the in-house gates from `EverythingHertz/visual-communication-agents` — Gate 1 bounding-box IoU ≤ 0.02 for label collision, Gate 2 WCAG contrast **plus** Machado deuteranopia simulation at ≥ 4.5:1, Gate 3 viewBox and aspect integrity, Gate 5 XML and glyph soundness.

## Data structures

A **motion token set**: `{ drawMs, trainMs, stateMs, easing }`, one source for CSS and for the renderer, so reduced-motion is one switch. A **mark state**: the Dot's state enum, used identically by the train, the strip cursor and any workspace health indicator.

## The borrow that changes this phase

The grand plan specified a label-collision test and a contrast test as new work. Both already exist in our own organisation as deterministic gates, and Gate 2 adds colour-vision-deficiency simulation that neither plan had. The first task of this phase is to read `gellphant_gates.py` and decide: import the package, or port the two gates we need. Port is likely cheaper for a dependency-free site repo; the decision and its reason are recorded in the phase's completion note.

## Routing

Design judgment: `claude` / `claude-opus-4-6` with `frontend-design` and `impeccable`. The gate integration: `codex` / `gpt-5.4`.

## Verification

Static: the four gates run in CI over the map in both schemes and at three viewBox sizes, and fail the build on violation; a test that every animation duration comes from the token set and none is hard-coded. Runtime: both schemes at 1440 and 390 screenshotted and reviewed; reduced-motion produces a still map with no loss of information; a `council:review` blind pass on the arrival screen with the verdict recorded; the Dot's state changes are legible without colour alone.
