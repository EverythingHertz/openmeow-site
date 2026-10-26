Back to [[plans/2026-10-26-slide-board/overview]]

# SB-4 — Depth

## Goal

Get from a contact-sheet thumbnail to the actual artefact in two keystrokes, and see what changed between two versions of a deck without leaving the board.

Most of this is a port rather than a design. `board.html` already does modes, inspector, reader, present, keyboard and URL state well; this phase moves that work to the new board and keeps its behaviour.

## Changes

- Zoom levels, inspector, Reader and Present in `slides.mjs`, ported from `board.html:549-567`.
- The versions clip-path slider, ported from `board.html:108-115, :531-542`.
- A JavaScript port of the `SequenceMatcher` word diff in `package.py:107-116`.
- Keyboard map from `board.html:572-584`, plus `/` for search and `1`–`3` for zoom.
- URL state `?mode=&slide=&open=&zoom=&q=&sort=&theme=` in `slides-model.mjs`.

## Data structures

**Three zoom levels, each naming its own source file and size**, because the whole point of the board is knowing what you are looking at:

| Key | Level | Source |
| --- | --- | --- |
| `1` | grid thumb | contact-sheet crop `{sheet, col, row, tile [640,360], gutter 10}`, or the catalogue thumbnail |
| `2` | inspector preview | 1600 or 2400 px PNG |
| `3` | full | 4K PNG, or **live SVG in a sandboxed iframe** from `/corpus/jp-dist/svg/...` |

Measured weights, which is why zoom 3 is on demand and never requested by the grid: 4K is 3.3 MB, preview 0.95 MB, a deck-a page 2.7 MB, a contact sheet 3.4 MB.

**The diff is labelled for what it is: "word diff of extracted text."** It compares the text we extracted, not the rendered slides, and a reader who does not know that would over-trust it. Layout changes do not appear in it.

The versions slider shows `predecessor_id` chains only, and each chain carries its `basis` — `manifest-pair`, `slug-match` or `build-order` — so a pairing can be distrusted on sight if its basis is weak.

## Routing

The zoom contract, the diff's label and the keyboard map: `claude` / `claude-opus-4-6`. The ports: `codex` / `gpt-5.4`. Visual review: `claude`.

## Verification

**Static.** The diff port is tested against `difflib` on a fixture pair — same input, same output, asserted rather than eyeballed. URL state round-trips: `?mode=present&slide=<id>` parses, renders and re-serialises to the same string.

**Runtime.** A recorded keyboard-only traversal: grid → inspector → full → reader → present → back, no mouse. Then the slider across a real version pair, confirming the diff label is visible at the same time as the diff.

One assertion that is easy to forget and expensive to miss: at zoom 3, the **size is printed before the file is fetched**, so nobody downloads 3.3 MB by accident on a metered connection.
