Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-5 — The doors

## Goal

The first visible change. Two cards on the chooser — Claude, and ChatGPT/Codex — each carrying the right recipe for the visitor's platform and mode, and in Mode 2 an agent panel above the slide board that flips to connected when a real `initialize` lands.

This is the phase where rule 8 and rule 9 stop being prose and become tests.

## Changes

In `openmeow-site/`:

- `world-connect.mjs` (new): the door records, and the pure `recipeFor(door, client, platform, mode, {port, secretPresent})` defined in L3-3.
- `scripts/build-chooser.mjs` (edited): builds the two cards from those records, reusing O4's workspace record and copy control.
- `chooser-runner.mjs` (edited): the agent panel, and the filled-in recipe — the Mode 2 card shows the real port and says the secret is present without printing it.
- `runner/serve.mjs` (edited): `/api/agents` reads the session tables.
- `tests/connect.test.mjs` (new).

## Data structures

A **door record** carries its client rows, each with a `kind` of `one-click | one-paste | manual`, a `needsNode24` flag, and a `shownIn` of `public | local | none`. The two web rows are `none` until Track H ships; they render as a line saying "not yet; use Desktop or Claude Code" rather than vanishing, so the page's edges are visible.

An **agent row** comes from `agent_sessions` and carries client name and version, connected time, scope, call count and last receipt id. A row **exists only if the gateway recorded an `initialize` round trip.**

**Refusal counters** (401, 403) are rendered beside the rows, because "connected" and "connected but every call rejected" must not look the same. Gate vocabulary reuses the BYOA spec's `CURRENT_VERIFIED | NOT_RUN | NOT_CONFIGURED`.

Each `slides.card` call adds the card id to the session row, and the board highlights the cards that agent touched — the cheapest possible demonstration that the connection is doing something.

## Routing

Card copy, the panel's vocabulary and the two rules' tests: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`. Visual review: `claude`.

## Verification

**Static.** `recipeFor` snapshot-tested across door × client × platform × mode, so a wrong `cmd /c` on macOS is caught by a diff and not by a visitor. Two assertions carry the honesty rules:

- **Mode 1 has no status element and no filled secret.** The build test greps the generated public HTML for `connected|detected|responding` outside recipe prose and fails on a hit.
- A Mode 1 card's recipe never contains a port-and-secret pair, only the `npx openmeow` line and the paste-able client command.

**Runtime.** Playwright drives Mode 2 with a scripted MCP client, asserting the sequence rather than the end state: **no row before `initialize`**; exactly one row after; refusal counters incrementing on a bad token while no connected row appears. Then a timed cold read against the sixty-second promise, measured from runner page open to receipt visible.

Screenshots at 1440 and 390 in both colour schemes, attached to the completion note.
