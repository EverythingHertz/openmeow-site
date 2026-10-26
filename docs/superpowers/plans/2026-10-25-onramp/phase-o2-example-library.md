Back to [[plans/2026-10-25-onramp/overview]]

# O2 — The example library

## Goal

Give every line one worked example — real input, real steps, real output, and an honest label saying how much of it is evidence. Replace the word "illustrative" wherever a receipt exists, and keep it, loudly, wherever one does not.

## Changes

- `world-examples.mjs` (new): `EXAMPLES`, one per line, each with its evidence level and its receipts; a helper to pick the strongest example for O1's door.
- `data/examples/` (new): one file per example, with the real ones carrying hashes and timestamps. The deck handoff lands here as the first real record, reusing the run record from grand phase 6 rather than restating it.
- `scripts/build-chooser.mjs`: the detail card gains an example block — input, the three-or-more steps as they actually ran, the output, the receipts, and the evidence chip.

## Data structures

An **example**: `{ lineId, title, evidence: real|recorded|illustrative, input {what, bytes?, sha256?}, steps[{label, detail, at?, receipt?}], output {what, where?, sha256?}, proves[], doesNotProve[], source }`. The `proves` and `doesNotProve` arrays are required on every example, including illustrative ones — an example that cannot say what it fails to establish does not ship.

**Evidence levels, defined once:** *real* — it happened, receipts on file, hashes resolvable; *recorded* — it happened and was captured, but without receipts that a reader can re-verify; *illustrative* — constructed to show the shape of the work, nothing happened.

**Day-one inventory.** One *real*: the 2026-10-25 deck handoff (sent 02:25, sealed 02:25:13, 193/193 hashes verified 02:45, ledgered, replied) on the *See a run* line. The other seven start *illustrative*, carried over from `DEMOS[room].steps` which already describe them well, and are promoted as real ones arrive — the workspace map's S1 will produce candidates for *Find previous work* and *Review a visual*.

## Routing

The record shape and the honesty wording: `claude` / `claude-opus-4-6` with `figure-claim-contract`. Implementation: `codex` / `gpt-5.4`.

## Verification

Static: schema test — every example has both `proves` and `doesNotProve` non-empty; an example marked *real* must have at least one resolvable `sha256` and a timestamp with timezone, or the test fails; no example may use the word "illustrative" in prose while claiming a higher evidence level. Runtime: the deck-handoff example's hashes are checked against the hub ledger at `C:\Work\00_Portfolio\handoffs\HANDOFF_2026-10-25_0225_PDT_openmeow-hub-weave\LEDGER.md`; the evidence chip is legible in both schemes at 390 px; a `figure-claim-contract` pass over all eight examples reports no unsupported claim.
