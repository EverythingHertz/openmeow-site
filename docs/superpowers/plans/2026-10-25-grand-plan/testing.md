Back to [[plans/2026-10-25-grand-plan/overview]]

# Testing strategy

## What exists

Five test files, 32 tests, run with `node --test tests/*.test.mjs`. On the 2026-10-21 checkout all 32 pass (`docs/2026-10-19-room-readiness.md`). On a sparse Windows clone with `core.autocrlf=true`, 30 pass: `tests/world.test.mjs:55` fails because the generated HTML is CRLF-converted, and `:68` fails because `media/world/*.png` is not checked out. Both are environment, not product, and phase 0 makes the first one impossible.

| File | Tests | Guards | Layer | Fate in this plan |
| --- | --- | --- | --- | --- |
| `tests/tour.test.mjs` | 8 | scroll clamp `:5`; mode choice `:11`, `:17`; first and last scene `:22`; reverse back to the tower `:27`; identical damping at 60 and 120 Hz `:33`; seek clamp `:38`; no camera jump at segment boundaries `:43` | film | keep unchanged; becomes the story page's suite (phase 7) |
| `tests/world.test.mjs` | 8 | internal hrefs `:12`; nine rooms with paired assets `:25`; bad hash → arrival `:35`; search `:45` — **data**. `motionEnabled` `:40`; focus targets `:18`; `index.html` === `world.html` === `renderWorld()` plus a `film.html` link `:55` — **long page**. 18 PNG plates ≥ 900 px in the right orientation `:68` — **assets** | mixed | data tests move beside the chooser build (phase 4); `:55` becomes CRLF-proof in phase 0 and is retired in phase 9; `:68` stays while the plates are shipped |
| `tests/world-demos.test.mjs` | 9 | `DEMOS` content `:7`; 11 capability briefs and their markup `:82` — **data**. input→action→result `:19`; reversible and bounded `:32`; manual steps `:44`; replay runs once, 6.4 s `:49`; Space-key intent `:56`; resize keeps the brief `:64`; no-JS demo markup `:70` — **long page** | mixed | data tests keep; the scroll-driven ones retire in phase 9 (replay, manual steps and no-JS markup are re-asserted against the chooser's click-and-replay demos in phase 5) |
| `tests/world-motion.test.mjs` | 4 | `sceneProgress` `:6`; camera overscan `:24`; `storyBeat` `:46` (dead: the markup has no `.room-flow`, so `world.mjs:234-240` never runs); `FLOORS` `:54` | long page + map data | retire all but `FLOORS` in phase 9 |
| `tests/world-readiness.test.mjs` | 3 | readiness data `:6`, filters combine with search `:14`; no-JS markup `:23` | data | keep unchanged |

**Not unit-tested today, browser-only:** hidden deep-link recovery (`world.mjs:403-414`), orientation switching, video fallback, decoder release. The chooser's hash router (phase 4) and the story page (phase 7) add unit tests for the first three; decoder release stays a manual check.

**Tooling facts the plan depends on:** no `package.json`, `.nvmrc` or CI exist; README asks for Node 18+ and the machine runs v24.21; the `tests/*.test.mjs` glob is expanded by Node 21+, not by PowerShell — phase 0 adds a `package.json` with a `test` script and an `engines` field so `npm test` works in every shell. `scripts/build-world.mjs` writes files only when run directly. The tests need LF endings, the plates, and `index.html` identical to `world.html` until phase 9.

## What each new module must prove

- **Flows (phase 1):** every room has exactly one terminal; every interchange names at least two flows; every stop that cites a capability id resolves to `CAPABILITIES`; held stops carry a reason; ids are unique.
- **Transit renderer (phase 2):** deterministic output for a fixed input (snapshot); station count equals the number of unique stops; routes are octilinear (every segment horizontal, vertical or 45°); no two station labels overlap at the default viewBox; the selected-line overlay dims exactly the other lines.
- **Cast retirement (phase 3):** a grep of generated HTML for `\bcats?\b`, `elephant`, `orange` returns only product names and the word "catalogue"; favicon and brand image resolve to the Dot mark.
- **Chooser build (phase 4):** the page is at most two viewport heights at 1440×1000; every room is reachable by hash; unknown hashes resolve to the lobby; a hash to a hidden or absent target recovers to the lobby (the browser-only check at `world.mjs:403-414`, now a unit test); the generator is idempotent (`git diff --exit-code` after a rebuild); no-JS output still lists the eight outcomes and their products. **Vector only:** a test asserts the generated `index.html` references no `.png`, `.jpg`, `.jpeg`, `.webp` or `.gif` at all — no plate, no tower, no `cat.webp` — and that `picture` is not imported by the chooser build.
- **Dark theme (phase 4b):** every line colour ≥ 3:1 against its page background and every text token ≥ 4.5:1, in both schemes; per-scheme Transit snapshots; resolving `system` follows the media query; the toggle persists across reload; a first-frame capture shows no flash.
- **Catalogue (phase 5):** search and stage/room filters behave exactly as today (port `world.test.mjs:45` and `world-readiness.test.mjs:14`); the ten capabilities without briefs still render the generic brief; click-and-replay demos re-assert replay-once, manual steps and no-JS markup.
- **Strip (phase 6):** a run record missing any required field is refused; the rendered event count equals the record's event count; the "illustrative" tag appears only on records flagged synthetic.
- **Story page (phase 7):** all eight tour tests pass with the moved module; modes video, world and reading each render; orientation switch preserves chapter and progress (new unit test on the model's progress mapping); video failure shows posters (new test on the fallback path); the archive-cut label is present when the old film plays.
- **Drop chooser (phase 8):** a drop produces zero network requests; the tracker stays on *Capture* if no client event follows; keyboard and choose-file paths reach the same route.
- **Retirement (phase 9):** every anchor from the last `world.html` build resolves on the new page; no file references the deleted modules; unreferenced media is gone from the tree.

## Runtime verification set

For every visual phase: headless Chromium at 1440×1000, 390×844 and 844×390; `prefers-reduced-motion: reduce`; JavaScript disabled; keyboard-only traversal of the picker, map and detail actions; a screenshot in the browser pane at desktop width and one at phone width, in both colour schemes once phase 4b has landed, attached to the phase's completion note. The story page additionally needs a static server with byte-range support for its video checks (README). For phase 10: live `curl -I` on `/`, `/story.html` and `/film.html` (all 200), Lighthouse performance and accessibility ≥ 90 on `/`, and a scroll-height assertion on `/` below 2,000 px at 1440×1000.

## Where results go

Each phase's completion note records the test count before and after, the screenshots, and any test consciously retired with its reason. The site's `docs/world-preview-verification.md` convention continues.
