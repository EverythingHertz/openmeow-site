Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 7 — The story page

## Goal

Move the film tour to its own page, deliberately long, under the chooser's header, so scrolling is the medium where it belongs and never the front door. Record the media decision the user still owns.

## Changes

- `story.html` (new): built from `film.html` — same track, stage, cards, chapter rail and finale — with the chooser's header, a "Back to the map" link, and a visible **archive cut** label whenever the current film (the 2026-07 brass suite, with cast) plays. `film.html` and `scroll2.html` stay untouched as history.
- `tour.mjs`: import paths and the header hook only; `chooseMode`, preload and decoder policy, portrait/landscape switching and progress preservation are kept exactly as they are.
- `docs/MEDIA_POLICY.md` (new): the three-way rule — chooser is vector; story plays the archive cut until replaced; replacement means the 9-shot list in `docs/world-motion-shot-list.json` (5 s, 16:9 and 9:16, no amber, no cast) at the quoted 45 credits per shot (405 desktop, 810 both orientations) — and the explicit statement that no generation happens inside this plan.

## Data structures

Unchanged: `COPY`, `SEGMENTS`, `BOUNDS`, `STOPS` in `tour-model.mjs`. One new flag on the page, `data-cut="archive|current"`, drives the label.

What `story.html` must keep for `tour.mjs` to run unmodified: the element ids it reads without null checks (`track`, `stage`, `world`, `intro`, `finale`, `rail`, `cards`, `previous`, `next`, `begin`, `hint`, `chapter`, `progress-fill`, two `.ptrack`); the `.tour` gating and the static `#fallback` block; the 1450svh track from `tour.css:11`; the hard-coded stop counts (`tour.mjs:13`, `:58`, `:114`, the "/ 10" at `:180`); the `?v=film2` cache-buster on both the script tag and the model import; media names `film-{portrait|landscape}-v2-{0..6}.mp4` and `poster-*-v2-{0..7}.webp` (there is no portrait clip 5; the vault reuses landscape). The finale's twelve-cat parade (root `b-*`/`c-*.webp`) is part of the archive cut and leaves with it.

## Routing

Implementation: `codex` / `gpt-5.4`; media policy wording: `claude`.

## Verification

Static: `tests/tour.test.mjs` passes against the moved module; `node --check tour.mjs`. Runtime: video, world and reading modes each render (force each via DevTools: data-saver, reduced motion); rotate at 50% progress and confirm the chapter and progress survive; the archive label is visible in the first viewport; the "Back to the map" link returns to the selected line's hash; screenshots at 1280 and 390.
