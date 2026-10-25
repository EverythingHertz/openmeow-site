Back to [[plans/2026-10-25-onramp/overview]]

# O1 — The sixty-second spine

## Goal

Make the first screen do four things at once: say what this is in one sentence, show the system map as the hero, offer exactly two one-click doors, and point at the one line that has a real example. No scrolling required to understand the offer.

## Changes

- `scripts/build-chooser.mjs`: the above-the-fold region becomes a fixed composition — a single sentence (not a tagline stack), the server-rendered system map at full width, and a two-door strip. The line index moves below the map on narrow screens and beside it on wide ones. The directory and catalogue stay below the fold, untouched from grand phase 5.
- `chooser.css`: the spine's grid, sized so the map and both doors fit in one viewport at 1440×1000 and at 390×844 without scrolling; the map takes the remaining height rather than a fixed aspect.
- `chooser.mjs`: the two doors' behaviour — **Try an example** selects the line whose example has the strongest evidence and scrolls nothing; **Drop a file** focuses the drop region (built in O3; until then it is hidden, not a dead control).

## Data structures

A **door**: `{ id, label, hint, action, enabled }` — the drop door is disabled by capability detection, never rendered broken. A **spine state**: which line is selected, which door was used, whether an example is showing. The sentence and door labels live in the build data beside `ROOMS`, not in markup, so they can be tested.

## Routing

Architecture and the sentence: `claude` / `claude-opus-4-6` with `frontend-design`. Implementation: `codex` / `gpt-5.4`.

## Verification

Static: a test asserts the spine renders with exactly one sentence element, one map, two doors, and no third call to action; the disabled drop door is absent from the DOM rather than present-and-dead; no-JS still shows the sentence, a static map and the eight lines as links. Runtime: at 1440×1000 and 390×844, the sentence, map and both doors are all within the first viewport with no scroll (measured, not eyeballed); the Dot is visible on the example-bearing line; a screenshot of each width in both schemes; keyboard focus reaches both doors before any catalogue content.
