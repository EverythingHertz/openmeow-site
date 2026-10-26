Back to [[plans/2026-10-25-onramp/overview]]

# O7 — The sixty-second test

## Goal

Prove the promise rather than assert it: a first-time reader, timed, reaches a copied command inside sixty seconds and can say afterwards what the site does, what it does not do, and what they would do next. This phase gates release.

## Changes

- `docs/ONRAMP_TEST.md` (new): the protocol and the results — who read it, on what width, what they did in order, where they hesitated, what they got wrong, the elapsed time to each of the four beats.
- Fixes arising, applied to the phases they belong to rather than patched here; this phase changes wording and ordering only, never structure.
- `docs/superpowers/plans/2026-10-25-onramp/overview.md`: the promise table updated to what was actually measured, including any beat that missed.

## Data structures

A **read record**: `{ reader, width, scheme, beats: [{beat, atSeconds, what}], misreadings[], questionsAsked[], finalSummaryInTheirWords }`. A **misreading** is the valuable field — anything the reader concluded that is not true, especially about what the site did to their file.

## Protocol

Run the `cold-reader` skill first against the built page — it exists for exactly this question and costs nothing. Then one human read, timed, on a 1440 width and again on a phone, with no explanation offered before or during. The reader is asked three questions afterwards and their answers recorded verbatim, not paraphrased.

**Stop conditions, decided in advance.** Ship if: all four beats land inside sixty seconds at 1440, the reader's summary names at least one real capability correctly, and there are no misreadings about the drop boundary. Do not ship if: the reader believes their file was uploaded or processed, or cannot say what the site does not do. Everything else is a fix, not a block.

## Routing

The cold read and the analysis: `claude` / `claude-opus-4-6` with `cold-reader`. The human read is the user's.

## Verification

Static: none — this phase is a measurement. Runtime: the automated timed path (Playwright: land, click **Try an example**, read the card, copy the command) runs in CI with a sixty-second budget and fails the build if it regresses; the no-network assertion from O3 runs beside it; the cold read and the human read are both recorded in `ONRAMP_TEST.md` with dates, widths and verbatim answers.
