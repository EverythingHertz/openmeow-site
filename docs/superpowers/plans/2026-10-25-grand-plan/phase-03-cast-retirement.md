Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 3 — Cast retirement in the data layer

## Goal

Remove the cat cast from every string the builds consume and introduce the brand mark, before the first visible page ships — so the chooser launches with no cat in a favicon, a label or an alt text. Scenes are not touched here: the eighteen plates and the film stay with the long page and the story page.

**Consequence to track.** With the chooser decided vector-only (phase 4) and the long page retired (phase 9), the eighteen `media/world/*.png` plates end up referenced by nothing. They are a real asset — the complete modern eighteen-image set from 2026-10-04, recorded with dimensions and SHA-256s in `docs/world-art-manifest.json` — and the 9-shot video list was quoted against them. They are not deleted by this plan. Phase 9 lists them as retained-but-unreferenced, and what becomes of them (a second story chapter, a gallery, or archive) is the user's call, not a side effect of cast retirement.

## Changes

- `world-model.mjs`: rewrite the nine `alt` strings to describe the work and the objects, never a character ("An orange cat concierge matches a visitor's brief…" becomes "A brief matched to one capability, with a starter folder handed over"); "Lobby & concierge" becomes "Lobby"; the unrendered "anti-sycophant elephant" phrase goes; "five inhabited floors" becomes "six levels". Product names stay — Gellphant is a product, not a character.
- `assets/mark/dot.svg` (new): the `dot-flat-pro` mark from `EverythingHertz/agent-pet-mascot`, copied in with a one-line provenance comment; a 32 px and 180 px PNG export beside it for favicon and share surfaces.
- `scripts/build-world.mjs`: favicon and brand image reference the mark instead of `cat.webp`; the footer line about character films is removed; `cat.webp` stays on disk for the story page's archive cut.

## Data structures

No new shapes. A writing rule for `alt`, recorded in `world-model.mjs` as a comment: *input → action → result, in one sentence, no actors*.

## Routing

Copy and alt text: `claude` / `claude-opus-4-6`; the asset copy and build change: `codex` / `gpt-5.4`.

## Verification

Static: a test greps the generated HTML and asserts no match for `\bcats?\b`, `elephant`, `orange` outside product names and the word "catalogue"; existing count assertions in `tests/world.test.mjs` still pass; favicon and brand paths resolve to files in the repo. Runtime: rebuild `world.html`, open it in the browser pane, confirm the tab icon and header mark are the Dot and the page otherwise unchanged; screenshot the header at 1280 and 390.
