Back to [[plans/2026-10-26-slide-board/overview]]

# SB-7 — Craft and the release gate

## Goal

Make the board feel like the rest of the site, and prove it keeps the sixty-second promise on a cold read. This is the phase that decides whether the board ships, so its gates are pass-or-stop rather than advisory.

## Changes

No new capability. An `impeccable` pass over `slides.css` and `slides.mjs`: type scale, spacing, the Dot as the agent-state indicator, both colour schemes from the phase-4b tokens, reduced-motion behaviour, the no-JS shell, and focus order.

## Data structures

None new. One rule is worth restating because this phase is where it is easiest to break: **vector chrome, raster only for the artefacts themselves.** The board's own furniture is drawn; the thumbnails are photographs of real files. The grand plan's vector-only decision governs the chooser, not the slides — a board whose job is showing raster artefacts cannot be vector-only, and that distinction belongs in writing so a later reviewer does not "fix" it.

## Routing

The craft pass and the gate judgements: `claude` / `claude-opus-4-6`, with `impeccable`. Any fixes it finds: `codex` / `gpt-5.4`.

## Verification

**Static.** Contrast across both schemes: every text token at or above 4.5:1, every state ring at or above 3:1 against its background. Per-scheme snapshots. A reduced-motion run in which the tray and the strip still convey the same information without animation — if the only cue that something finished is a transition, reduced motion loses it.

The no-JS shell renders the launch command and says nothing is live.

**Runtime, the release gate.** Headless Chromium at 1440×1000, 390×844 and 844×390, both schemes. Keyboard-only traversal of grid, strip, tray, inspector and filters. Then the cold-read test:

> From a cold index and a closed browser: start the runner, open the board, and reach a first screen of real cards with the strip explaining what is still coming — **inside sixty seconds**, with the first decoded card image inside 300 ms of the page load.

Record the measured time. **If it misses, the board does not ship and the cut order in [[plans/2026-10-26-slide-board/overview]] applies** — starting with PPTX conversion and ending, if necessary, with the catalogue tier itself. The three manifest corpora alone still make the show.

Screenshots at both widths in both schemes, attached to the completion note with the measured timings beside them, not in place of them.
