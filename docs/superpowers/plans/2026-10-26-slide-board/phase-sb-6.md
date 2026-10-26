Back to [[plans/2026-10-26-slide-board/overview]]

# SB-6 — Agents

## Goal

The visitor's own agent reads the board and adds to it, without any of its output being mistaken for evidence. This is also the phase that verifies the seam between this plan and [[plans/2026-10-26-l3-connect/overview]].

## Changes

- `agent_fields` reads and writes; the job queue.
- The `◆ agent` chip, and an "agent-derived only" filter.
- "Ask the agent" search, whose hits arrive as `card_updated` with a `match_reason`.
- The four reads confirmed against B1's `deps.slides` contract.

## Data structures

**`agent_fields (card_id, field, value, agent_id, model, at)` is a separate table and is never joined into the card's identity.** An agent's claim about a slide is attributed to that agent, that model and that moment.

Labels: `agent-derived`, **never `real` or `recorded`**. There is no path by which an agent-derived field is promoted. That is enforced by the schema's separation rather than by a convention someone has to remember.

**The file title stays the title.** An agent may suggest a better one; it appears as an agent field, not as the card's name.

"Ask the agent" hits are listed **apart from FTS hits**, with their `match_reason` visible, because a lexical match and a model's opinion are different kinds of answer and a merged list would hide that.

**The seam.** The four read functions this plan exposes — `recent(n)`, `search(q)`, `card(id)`, `stream(since)` — are exactly what [[plans/2026-10-26-l3-connect/phase-l3-1]] injects as `deps.slides`. They map 1:1. This phase is where that is asserted, once, rather than assumed by both plans.

## Routing

The separation rule, the labels and the seam's contract test: `claude` / `claude-opus-4-6`. Queue and chips: `codex` / `gpt-5.4`.

## Verification

**Static.** A contract test runs the gateway's `deps.slides` consumer against this plan's four functions and asserts the shapes match — the test lives here and imports both, so a change on either side breaks it.

Then the separation test: an `agent_fields` row for a card **does not change** that card's `evidence`, `hash_basis` or `currentness`, asserted field by field before and after.

**Runtime, and the decisive case is the empty one.** A **zero-agent run** renders no chip anywhere and the strip reads `0 agents connected`. A board that implies an agent contributed when none did is the exact failure this phase exists to prevent, and it is the state most visitors will see.

Then with one agent connected: ask it to look at a deck, confirm the chip appears on the cards it touched, confirm hovering reveals field, agent and time, and confirm the "agent-derived only" filter shows precisely those cards and no others.
