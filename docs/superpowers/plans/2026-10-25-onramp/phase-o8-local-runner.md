Back to [[plans/2026-10-25-onramp/overview]]

# O8 — The local runner

Governed by [the embedding spec](../../specs/2026-10-25-embedding-local-workspaces.md), which measured what the browser permits. Read it first; this phase implements its Mode 2.

## Goal

One command — `npx openmeow` — serves the already-built site from `http://127.0.0.1:7777`, where loopback-to-loopback requests are unrestricted. The same page that is a catalogue on openmeow.io becomes a working console: it sees which workspaces are responding, embeds them in a pane, and deep-links into them. Seamless because it is the same page, not a second product.

## Changes

- `runner/serve.mjs` (new): a dependency-free Node static server over the build output. Binds `127.0.0.1` only; mints a launch token and prints the URL containing it; validates the `Host` header against `127.0.0.1:7777` and `localhost:7777` to defeat DNS rebinding; checks `Origin` on anything that mutates; refuses path traversal and symlinks outside the build root. It serves files and answers one probe endpoint — nothing else.
- `chooser-runner.mjs` (new): the Mode 2 behaviour, loaded only when the page detects it is on loopback. Probes the manifest's ports in parallel with opaque `no-cors` fetches, renders a *responding* state beside each line, opens a workspace in a pane, and falls back to a tab when framing is refused.
- `world-workspaces.mjs` (from O4): each record gains `framesOk` (unknown until measured) and `probePath`, so the runner knows what to request and what to expect.

## Data structures

A **mode**: `public | local`, decided once at startup from `location.hostname`, never guessed from a probe. A **probe result**: `{ id, responding: boolean, ms, at }` — deliberately not called *healthy*; a port answering proves only that something answered. A **frame verdict**: `ok | refused | unknown`, measured by attempting the embed and asserting rendered content, never by the iframe's `load` event, which fired on a blocked embed during the spec's measurements.

## The two rules this phase must not break

**Mode 1 shows no live state.** The public site cannot know what is running on a stranger's machine, and must not appear to. Probing, status dots and "detected" language exist only in Mode 2.

**A refused frame is visible, not empty.** A workspace that forbids framing opens in a tab with a line saying so. An empty pane that looks broken is worse than an honest tab.

## Routing

Architecture and the security rules: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`.

## Verification

Static: unit tests for mode detection from hostname, for `Host` and `Origin` validation (a request with a foreign `Host` is refused), for path traversal and symlink escape, and for token absence. A test asserts Mode 1 renders no probe and no status element.

Runtime, and this is the phase's real work: start the runner, confirm the printed URL carries a token and that the server refuses a request without it; measure a full roster probe and record the elapsed time; **for each of the six workspaces, measure whether it permits framing and record the verdict in the spec's open list** — asserting on rendered content, never on a `load` event; confirm a refused workspace opens in a tab with the explanation visible; and re-run the spec's Chrome matrix against the runner to confirm the local-to-local row still holds on the version of the day. Screenshots at 1440 and 390 in both schemes.
