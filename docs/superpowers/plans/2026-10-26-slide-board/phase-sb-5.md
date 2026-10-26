Back to [[plans/2026-10-26-slide-board/overview]]

# SB-5 — The slow workers

## Goal

Split 154 PPTX decks into page cards, cache thumbnails for the 306 catalogue rows that have none, and keep OneDrive's cloud-only files cloud-only. This is the slow tail — 10 to 25 minutes — and it runs last, cancellably, with the strip saying so the whole time.

## Changes

- `runner/slides/py/split.py`, invoked as `python -I runner/slides/py/split.py <path>`: PDF pages via PyMuPDF; PPTX converted with `soffice.com` then split.
- Tier 2f: 480 px cache thumbs.
- Tier 2e: the OneDrive guard.
- Cancellation wired from the strip to each job's `AbortController`.

The `-I` flag is not optional. These scripts run against paths under corpora we do not control, and isolated mode stops a planted module in a corpus directory being imported.

## Data structures

**Availability** carries what the filesystem actually permits:

- `offline · not hydrated` for a cloud-only file. One `attrib /S` parse marks the `O` entries; measured on 2026-10-25: 2,832 files in the OneDrive pitch-deck tree, 4 offline, 690 sparse placeholders.
- **Nothing is ever hydrated.** Reading a cloud-only file would pull it down over the user's connection and change their disk, which is not a read.
- `stat` is safe and is used freely — it never hydrates, and 1,113 OneDrive stats took 0.26 s.

**Dependency facts, measured, so a missing tool is a label and not a crash:** `fitz` (PyMuPDF 1.28), `pptx` (python-pptx 1.0.2) and `PIL` all import; `soffice.com` is at `C:\Program Files\LibreOffice\program\`.

When something is missing the card says `HELD · python not found` and the corpus keeps working. A tool that is absent is a limitation on a card, never an exception in a log.

## Routing

The availability vocabulary and the no-hydration rule: `claude` / `claude-opus-4-6`. Workers and conversion: `codex` / `gpt-5.4`.

## Verification

**Static.** Two negative fixtures, both of which must produce a label rather than a failure:

1. Python absent from `PATH` → the row reads `HELD · python not found`, the other corpora are unaffected.
2. A **cloud-only fixture** → skipped, labelled `offline · not hydrated`, and a test asserts **no read of its contents was attempted** — the assertion is on the absence of the read, not on the card's text.

PPTX conversion unavailable → the 154 decks stay deck-level cards with their pptx text indexed, which is the designed degradation and is asserted as such.

**Runtime.** One real split end to end, with its wall time recorded. Then a cancellation mid-run: the strip's row moves to cancelled, the pool drains, and no partial card is left in the index claiming to be complete.
