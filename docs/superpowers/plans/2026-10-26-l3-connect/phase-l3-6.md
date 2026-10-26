Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-6 — Proposal-gated writes

## Goal

An agent may propose a deck. Only a human may create one. This phase adds the two write tools and the gate between them, and it is the first time anything an agent sends can change state.

Everything before this phase is read-only, and that is why it could ship without this gate. This one cannot.

## Changes

In `gateway/`:

- `slides.propose` and `slides.apply` in `src/slides_tools.ts`.
- Scope widening to `editor`, enforced at call time.

In `openmeow-site/`:

- `/api/proposals` on `runner/serve.mjs`.
- The approval token mint, and the panel's **Approve** button in `chooser-runner.mjs`.

## Data structures

An **approval token** is minted **only** by the runner page's Approve button. It is bound to one proposal and one session, is single-use, and expires in ten minutes.

This is the Dango lesson applied: the same human-in-the-loop gate, without a token in a URL. Rule 3 still holds — the token never appears in a query string, a log line or a receipt.

**`slides.propose`** takes `{title, outline[] ≤ 40, corpus}` and returns `{proposalId, receipt}`. It **creates nothing**. A proposal is a record of an intention, and an agent that only ever calls propose can do no damage.

**`slides.apply`** takes `{proposalId, approvalToken}` and returns `{deckId, receipt}`, delegating to `subtle.create_deck` when the engine is present.

**LEASE** is the user widening one session to `editor` for a fixed time on the runner page, followed by `notifications/tools/list_changed`. Enforcement is at **call time**, as in `enforcePersonaScope` (`mcp_tool_dispatcher.ts:595-625`), returning a structured error — not at list time, because a client may hold a stale tool list and a filtered list is a convenience, never a control.

Per the Codex delta: the handshake is a shape. Enforcement is what is verified, and it is verified here before anything relies on it.

## Routing

The gate's design, the token's binding and the refusal cases: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`.

## Verification

**Static.** Three refusals, each producing a receipt, because a refused write is an event worth recording:

1. `apply` with **no** token → fails.
2. `apply` with an **already-used** token → fails.
3. `apply` with **another session's** token → fails.

Then the positive path: a click on Approve mints a token, `apply` succeeds, and the receipt records which session and which proposal.

One regression assertion, and it is the one most likely to break: **reads are unaffected.** A `reader`-scope session can still ping, list, search and fetch cards after this phase, and no write tool appears in its `tools/list`.

**Runtime.** With an agent connected at `reader`, ask it to create a deck; confirm it cannot, and that the refusal is legible on the panel rather than silent. Widen the lease on the page, confirm `tools/list_changed` arrives, approve one proposal, and confirm exactly one deck is created and one token is spent.
