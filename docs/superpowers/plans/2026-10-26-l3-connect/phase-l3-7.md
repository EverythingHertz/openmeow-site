Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-7 — Track H, the public relay

## Goal

Reach claude.ai and ChatGPT web, which cannot see loopback and never will.

**This phase is costed, not scheduled.** It is written now so the cost is visible while the local track is being built, and so the two web rows on the chooser have something concrete to point at. Nothing starts until L3-1 to L3-5 have a month of receipts behind them.

## Changes

`relay.openmeow.io`, which does not exist yet:

- Streamable HTTP plus **OAuth 2.1** — PKCE with S256, dynamic client registration, client ID metadata documents, protected-resource metadata, and the claude.ai callback.
- The runner dials **out** over one WebSocket and pairs by an eight-character device code shown on the runner page. One account to one runner.
- `npx openmeow --unpair` locally, and a revoke on the relay page.
- The SDK's `mcpAuthRouter`, which needs Express — the first real dependency the project would take on for this.

## Data structures

A **pairing** binds one account to one runner, established by a device code the human reads off their own screen and types into the relay. The runner is never addressable from the internet; it holds an outbound socket. That is the whole security argument for this shape, and it is why the relay cannot be "just a reverse proxy to 7777".

A **revocation** must work from either end — the runner's CLI and the relay's page — because the failure mode worth designing for is a visitor who no longer has the machine.

## What it costs

Stated so the decision is informed, not to argue for it:

- A domain and TLS.
- A process holding long-lived sockets, which is a different operational posture from a static site on Pages.
- An OAuth server with token storage and rotation.
- Rate limiting.
- A privacy policy, because this one carries user data off the visitor's machine.
- The qualification list in `APPROVED-ARCHITECTURE.md:144`.

## Routing

The decision to fund it, and the pairing design: the user, with `claude` / `claude-opus-4-6` writing the proposal. Implementation, if funded: to be decided then.

## Verification

Not applicable until funded. When it is, the gates are: a pairing cannot be established without the device code being read off the runner's own output; revocation from either end drops the socket within one request; and no relay route reaches a runner that has not dialled out.

## If it never ships

This is the honest case, and it is not a failure.

The `.mcpb`, Claude Code and Codex between them cover **everyone who runs an agent on their own machine**. The two web rows stay "not yet; use Desktop or Claude Code", which is a true sentence that costs nothing to maintain.

Track H buys reach to people who use Claude or ChatGPT only in a browser. That is a real audience and a real cost, and the point of writing this phase before it is scheduled is that the choice stays the user's rather than becoming inevitable by accumulation.
