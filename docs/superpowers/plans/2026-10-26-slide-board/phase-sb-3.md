Back to [[plans/2026-10-26-slide-board/overview]]

# SB-3 — The shotgun

## Goal

Every corpus × level job fires at once, and the board fills in without ever moving under the reader's hands. This is the phase the on-ramp's demonstration depends on: real counts climbing in the first two seconds, with the strip saying exactly what is still coming.

## Changes

- The catalogue Worker (`worker_threads`, `JSON.parse` on 25.5 MB).
- Tier 2a `stat`, 2b sha256, 2c text extraction.
- The three bounded pools: NTFS 4, OneDrive 1, Python 1.
- Dedup, `occurrences`, FTS population.
- The tray and the status strip in `slides.mjs`; merge rules in `slides-model.mjs`.

## Data structures

**The merge rule**, which is the whole phase in three lines:

- `card_added` sorting **below** the viewport → inserted silently.
- `card_added` that would land **above the fold** → goes to the **tray** ("31 new since you opened · show"); the grid does not move.
- `card_updated` → patched in place; **no re-sort**.

Re-sorting happens only on a tray click or a scroll to top.

**The status strip** has one row per `worker_runs` row:

```
hash      · deck-studio      · running · 12/35   · 410 ms
catalogue · review-desk      · done    · 1,113 rows · 0.4 s · replay of 2026-10-24T19:13Z
split     · catalogue pptx   · queued  · 0/154   · needs soffice (found)
agents    · 0 connected
```

Bar width is `done/total` from the **last progress event**. A `total: null` renders as a count with no bar — never a bar at an invented width.

**Dedup:** the same `card_id` updates in place. The same rendition sha256 across corpora is **one card plus an `occurrences` row**, with a chip reading "also in: Review desk catalogue" — the 21 `dist` SVGs are `copy2` copies of system-02 (`package.py:200-202`), so this is the common case, not an edge one.

## Routing

The merge rules, the strip's vocabulary and the honesty gates: `claude` / `claude-opus-4-6`. Workers, pools and dedup: `codex` / `gpt-5.4`.

## Verification

**Static, and these two tests are the point of the phase.**

1. A scripted event sequence fed into `slides-model.mjs` asserts that **nothing above the fold moves until the tray is clicked** — inserts below, updates in place, tray count rising, and a single reflow at the click and not before.
2. **"The bar never moves without a progress event."** Drive the model with `worker_started` and then nothing; assert the bar width is unchanged. Drive it with a progress event; assert it moves exactly to `done/total`. This is the test that stops an indeterminate spinner creeping back in.

**Runtime.** A recorded SSE transcript with timings, attached to the completion note, showing Tier 0 resolved before the first `recent` response and the catalogue arriving after. The transcript is the evidence; a screenshot of a filled board is not, because it cannot show the order things happened in.
