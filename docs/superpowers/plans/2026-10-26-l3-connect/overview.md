---
id: 2026-10-26-l3-connect
created: 2026-10-25
status: planned
repo: EverythingHertz/openmeow-site (+ EverythingHertz/openmeow for the gateway)
layers-on: 2026-10-25-onramp
---

# L3 — Connect your agent

> **Amendment pending, from [[specs/2026-10-26-focus-canvas-design]] (decision 2.2).** The tool table below needs two more tools for slide iteration: `slides.requests` (read) and `slides.submit` (write, accepted only against an open request, with OpenMeow — not the agent — writing the file). `slides.propose` and `slides.apply` are unaffected. Not yet folded into the phases.

## Context

The on-ramp calls L3 out of scope and says the site must not imply it exists. That was the right call for the on-ramp and it is now the thing to build, because the gateway it needs already exists: `openmeow/gateway` serves tools over stdio today, wraps every call in a receipt (`capability_tools.ts:31-48`), and keeps those receipts in SQLite at `~/OpenMeow Library/receipts.sqlite` (`stdio_main.ts:26`).

What is missing is not the server. It is the door: a visitor who has Claude Code or Codex on their own machine has no copy-pasteable line that connects it, and no moment where the page says *your agent is connected, here is the receipt it just wrote*.

This plan builds that, in two tracks, and is honest that only one of them is funded.

**Track L — local, ships first.** The gateway gains five read-only slide tools and a second entry point that mounts the same `McpServer` on the SDK's Streamable HTTP transport, bound to loopback, served by the on-ramp's O8 runner at `http://127.0.0.1:7777/mcp`. Local agents connect by stdio (`npx -y openmeow mcp`) or by that URL.

**Track H — a public relay, separately costed and not scheduled.** An OAuth relay that the runner dials out to, so claude.ai and ChatGPT web reach the same tools. Phase L3-7 writes down what it would take; nothing starts until L3-1 to L3-5 have a month of receipts behind them. The BYOA catalogue branch's hosted storefront, accounts and metering are not duplicated here — that spec's own note says the local track comes first.

## Why this layers on the on-ramp rather than replacing it

O8 built the runner on the embedding spec's Mode 2, where loopback-to-loopback requests are unrestricted. Everything here lives inside that mode. The public site keeps exactly the posture the spec forces on it: no probing, no "detected", no status element, and a card that ends with `npx openmeow` and "the local page finishes this for you."

**One O8 rule this plan changes, stated plainly for reviewers.** The runner is no longer "files and one probe endpoint, nothing else," and it is no longer dependency-free: it gains `/mcp`, three JSON routes, and a dependency on the gateway. That is a deliberate amendment to O8, not an oversight, and phase L3-2 is where it lands.

The bridge on 9137 is **not** reused for MCP. It binds `0.0.0.0` with no auth and CORS `*`.

## The sixty seconds

| Window | What the visitor does |
| --- | --- |
| 0–10 s | Picks a door: Claude, or ChatGPT/Codex |
| 10–25 s | Copies `npx openmeow`, pastes it in a terminal; the runner prints its tokened URL and opens the page |
| 25–40 s | Copies the client line from the **local** card into Claude Code or Codex |
| 40–60 s | Says "call openmeow.ping"; the panel flips to connected with a receipt id |

O7's timed test measures from *runner page open* to *receipt visible*. The first `npx` download is reported separately in `docs/LAUNCH_VERIFICATION.md`, because it depends on the visitor's network and is not ours to promise.

## The doors

Both cards are built by `scripts/build-chooser.mjs` from a new `world-connect.mjs` record set, reusing O4's workspace record and copy control. Each card carries a chip — **one-click** or **one-paste** — and **needs Node 24+** where that is true.

| Door | Client | Artefact | Kind | Shown in |
| --- | --- | --- | --- | --- |
| Claude | Claude Desktop | `openmeow.mcpb` from the GitHub release, sha256 beside it | one-click | Mode 1 and 2 |
| Claude | Claude Code, stdio | `claude mcp add openmeow -- cmd /c npx -y openmeow mcp` (Windows; no `cmd /c` elsewhere) | one-paste | Mode 1 and 2 |
| Claude | Claude Code, HTTP | `claude mcp add --transport http openmeow http://127.0.0.1:7777/mcp --header "Authorization: Bearer <runner secret>"` | one-paste | Mode 2 only |
| Claude | claude.ai web, mobile | connector deep link to `relay.openmeow.io` | one-click | **not shown** until Track H ships |
| ChatGPT/Codex | Codex CLI, IDE, desktop | `~/.codex/config.toml` block with `startup_timeout_sec = 60` | one-paste | Mode 1 and 2 |
| ChatGPT/Codex | Codex, HTTP | same, `url` plus `bearer_token_env_var` | one-paste | Mode 2 only |
| ChatGPT/Codex | ChatGPT web | custom MCP server, public HTTPS + OAuth 2.1 | manual | **not shown** until Track H ships |

The HTTP rows are Mode 2 only because the bearer secret exists only on the visitor's machine. The web rows say "not yet; use Desktop or Claude Code" rather than being hidden, so the page is honest about its edges.

Codex needs `startup_timeout_sec = 60` because the default 10 s is too short for a cold `npx`, and `codex mcp add` has no flag for it.

## The tool surface

All tools use the receipt-wrapped `call()` pattern already in `capability_tools.ts:31-48`. The slide index arrives as `deps.slides` with the board's four functions — the same optional-dependency shape as `deps.continuity` — which is the single seam between this plan and [[plans/2026-10-26-slide-board/overview]].

| Tool | Read or write | Phase |
| --- | --- | --- |
| `openmeow.ping` | read, idempotent — the one-call proof | L3-1 |
| `slides.recent` | read | L3-1 |
| `slides.search` | read | L3-1 |
| `slides.card` | read | L3-1 |
| `slides.changes` | read | L3-1 |
| `slides.propose` | creates nothing | L3-6 |
| `slides.apply` | **write**, token-gated | L3-6 |

Reads never need approval. Nothing an agent sends can create or change a slide: `slides.apply` needs an `approvalToken` minted only by the runner page's Approve button, bound to one proposal and one session, single-use, ten-minute expiry. That is the Dango lesson applied — the same gate, without a token in a URL.

## Security and honesty rules

These are the reviewer's checklist, and they are not negotiable by any later phase.

1. Both entries bind `127.0.0.1`. A test asserts `0.0.0.0` is refused.
2. `/mcp` requires `Authorization: Bearer <secret>` — 32 random bytes at `~/OpenMeow Library/runner-secret`, mode 0600, rotated by `npx openmeow --rotate-secret`, shown only on the runner page. The O8 page launch token stays separate.
3. No token in a URL, a log line or a receipt. `?token=` or `?secret=` is refused with 400.
4. `allowedHosts` exactly `127.0.0.1:7777` and `localhost:7777`; `allowedOrigins` the two `http://` forms; DNS-rebinding protection on. A foreign Host or Origin gets 403.
5. `MCP-Protocol-Version` is validated by the transport. No downgrade.
6. No write without a human-minted `approvalToken`.
7. Every call stores a receipt *before* responding. A persistence failure is reported in the payload, never swallowed.
8. **"Connected" renders only from an `agent_sessions` row written by `oninitialized`.** A TCP connection, a probe or a 401 never produces it.
9. **Mode 1 renders no status element.** A build test greps the public HTML for `connected|detected|responding` outside recipe prose and fails on a hit.
10. The HTTP entry refuses to start if the receipts database path is not under the user's home or an explicit `OPENMEOW_RECEIPTS_DB`.
11. Error text passes `redactPaths`. The `.mcpb` sets `OPENMEOW_ENGINE_MODE=disabled` so no child process spawns until the user enables it.

Rule 8 is the one that matters most, and it is the same rule the intake engine already enforces: a tracker advances on evidence, not on a timer.

## Phases

1. [[plans/2026-10-26-l3-connect/phase-l3-1]] — ping and slides over stdio; a stranger runs two commands and sees a receipt.
2. [[plans/2026-10-26-l3-connect/phase-l3-2]] — loopback Streamable HTTP, sessions, and the O8 amendment.
3. [[plans/2026-10-26-l3-connect/phase-l3-3]] — publishable packages and the paste recipes.
4. [[plans/2026-10-26-l3-connect/phase-l3-4]] — the `.mcpb` bundle, blocked on a measurement.
5. [[plans/2026-10-26-l3-connect/phase-l3-5]] — the doors on the chooser and the agent panel.
6. [[plans/2026-10-26-l3-connect/phase-l3-6]] — proposal-gated writes.
7. [[plans/2026-10-26-l3-connect/phase-l3-7]] — Track H, costed and unscheduled.

L3-1 and L3-2 are the spine. L3-3 is what makes a stranger able to run it at all. L3-4 is blocked (see below). L3-5 is the first visible change. L3-6 and L3-7 are independent of one another.

## Blocked, and not resolved by this plan

**L3-4 cannot start.** It needs `node:sqlite`, therefore Node 24, inside Claude Desktop — and Claude Desktop's bundled Node was not found at any standard install path on this machine during drift task H3. The system Node is v24.21.0, which is **not** evidence about the bundled runtime. Until the install path is located and the version measured, L3-4 ships the stdio-to-loopback bridge contingency instead.

## Cut order

Track H; L3-6; the `.mcpb`; the Mode 2 agent panel (the card prints the `receipt.get` command instead); `slides.changes`, then `slides.search`.

**Never cut:** `openmeow.ping`, the receipt, and rules 1 to 9.

## Verification

Per phase, static then runtime, as the grand plan requires. Project-level after every phase: `node --test tests/*.test.mjs` in `openmeow-site` and `npm test` in `gateway/`, `node --check` on every `.mjs`, both generators followed by `git diff --exit-code`, headless Chromium at 1440×1000, 390×844 and 844×390, reduced-motion, no-JS and keyboard passes, and screenshots in both colour schemes for every visual phase.

Details are in each phase file. The cross-plan seam — B1's `deps.slides` against the board's four read functions — is verified once, in [[plans/2026-10-26-slide-board/phase-sb-6]].
