Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 9 — Retire the long page

## Goal

Once the chooser and catalogue have reached parity, remove the long scroll and the code that only served it, keeping every deep link alive.

## Changes

- `scripts/build-world.mjs`: stop emitting `world.html`; keep and export the helpers the chooser build imports. `world.mjs` and `world-scroll.css` are deleted; `world-motion.mjs` keeps `FLOORS` (the story page's rail) and loses the scroll functions and the dead `storyBeat`. Also deleted, as nothing links or references them: `app.js` (gold canvas, cat eyes), `scroll.html` (downloads whole videos as blobs from a CDN), and the unreferenced `media/desktop-*.mp4`, `media/landscape-*.webp` and `media/portrait-*.webp`. `preview.html`, `scroll2.html` and `film.html` stay as history.
- `tests/world.test.mjs` and `tests/world-motion.test.mjs`: retire the long-page assertions (pinning, scroll progress, camera pose, hidden deep-link recovery) and move the surviving data assertions beside the chooser's tests; each retired test is listed with its reason in the completion note.
- `chooser.mjs`: a redirect map so every old anchor — `#<room>`, `#tools-<room>`, `#cap-N`, `#directory` — resolves on the new page.

`preview.html`, `scroll.html`, `scroll2.html` and `film.html` remain as history and are not linked from navigation.

## Data structures

A **redirect map**: old hash → new hash, generated at build time from `ROOMS` and `CAPABILITIES`.

## Routing

Implementation: `codex` / `gpt-5.4`; the retire list: `claude` review.

## Verification

Static: the full suite passes with the retired tests removed and the chooser tests present; `node --check` on every remaining `.mjs`; no file references `world.mjs` or `world-scroll.css`. Runtime: crawl every anchor from the last `world.html` build against the new `index.html` and assert each resolves; headless Chromium at 1440×1000, 390×844 and 844×390; no-JS and keyboard passes; screenshots.
