Back to [[plans/2026-10-25-onramp/overview]]

# O3 — Your file, inside the example

## Goal

Turn the drop from a novelty into the moment of value: a visitor drops their own file, the page routes it to the right line, and the worked example re-renders *about their file* — their name, their type, their size, in the input slot and the step captions. Entirely client-side. This is the single feature that converts "a directory of tools" into "this is about my work."

## Changes

- `chooser-drop.mjs` (extends grand phase 8): after classification, the routed line's example renders in **personalised** mode — the example's `input.what` is replaced by the dropped file's own description, and any step caption with a file slot takes the name. The receipts, output and evidence chip are untouched and visibly belong to the original run.
- `world-examples.mjs`: each example gains a `personalise` descriptor naming which fields accept a dropped file and what kinds fit, so substitution is data-driven rather than string surgery.
- `chooser.css`: the personalised state — the visitor's filename styled as theirs, and a persistent, unmissable line saying the example's own result is from the original run, not from their file.

## Data structures

A **dropped file**: `{ name, ext, bytes, kind: rejected|opaque|inspectable, at }` — read from the File API only; no content is read for `rejected` kinds, mirroring the intake gate. A **personalisation**: `{ inputSlot, stepSlots[], accepts[] }`. A **routing rule**: extension-and-kind → `lineId`, with an explicit fallback to the Lobby line when nothing fits, which must never read as failure.

## The honesty boundary, stated in the page

Personalising the example must not imply the work was done. The page says, in the example block and not in a tooltip: *this example's result is from the run it records; nothing has been done to your file, and nothing left your browser.* A visitor who wants it done gets O4's command.

## Routing

Architecture, the boundary wording and the gate table: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`.

## Verification

Static: unit tests for the routing rule over a table of extensions including unknown ones and the rejected set; a test that personalisation never touches `receipts`, `output`, `proves` or `doesNotProve`; a test that the boundary sentence is present whenever personalised mode is on. Runtime: Playwright asserts **zero network requests** from drop to render; dropping an `.exe` shows "not opened" and routes nowhere; dropping an unknown extension lands on the Lobby without an error state; the choose-file keyboard path produces the identical result to a drag; the tracker stays on *Capture* if no client event follows; screenshots of the personalised card in both schemes at 1280 and 390.
