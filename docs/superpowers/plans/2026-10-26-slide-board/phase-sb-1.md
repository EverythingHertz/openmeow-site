Back to [[plans/2026-10-26-slide-board/overview]]

# SB-1 — Three corpora in a terminal

## Goal

`node runner/slides/cli.mjs recent --n 20` prints twenty real cards from three corpora, on a cold index, in under 300 milliseconds including SQLite creation.

No routes, no page, no catalogue. If this phase works, everything after it is presentation; if it does not, nothing after it can be fast.

## Changes

- `runner/slides/readers/deck-studio.mjs`, `system-02.mjs`, `dist-cards.mjs` (new): one reader per Tier 0 corpus. Each reads an owner manifest and emits cards; none of them hashes a file.
- `runner/slides/index.mjs` (new): the schema, `upsert`, `recent` and `search`.
- `runner/slides/cli.mjs` (new): `recent`, with `--corpus name=path` repeatable.

## Data structures

The schema from the overview, created on first run. `limitations` is `NOT NULL`, which is the schema enforcing the plan's central rule rather than trusting a reader to remember it.

`card_id` is computed from `corpus|deck_id|deck_version|slide_key` before any file is touched, so a reader that cannot hash still produces stable ids. `hash_basis` is `manifest` where the owner manifest carries a sha256, and `null` where it does not — **never `computed`** in this phase, because nothing is computed yet.

Deck Studio pages are the honest edge case: only `pdf_sha256` is in the manifest, so page cards get `real · hash pending`, not a borrowed deck-level hash.

**The contact sheet geometry**, which is a real assumption and therefore a test rather than a comment:

```
w == 10 + 5*650    &&    h == 10 + ceil(pages/5)*370
```

If a sheet does not satisfy that, the reader falls back to individual page PNGs **and labels the fallback**. A silently wrong crop is worse than a slower path.

## Routing

The card record and the schema: `claude` / `claude-opus-4-6`. Readers and the CLI: `codex` / `gpt-5.4`.

## Verification

**Static.** `node --test tests/slides-*.test.mjs` against **synthetic fixtures in the three real shapes** — no private content in the repository. The decisive test is the negative one: the schema **refuses a card without `limitations`**, so a future reader cannot quietly omit it.

The geometry assertion above runs against a fixture sheet and against a deliberately wrong one, confirming the fallback fires and is labelled.

**Runtime.** `Measure-Command { node runner/slides/cli.mjs recent --n 20 }` on a **cold** index — delete `index.sqlite` first, or the number means nothing. It must print 20 rows with corpus, time, title and hash basis, and the wall time is recorded in the completion note against the 300 ms target.

Record the number even if it misses. A missed target with a real measurement is useful; a met target with a warm index is not.
