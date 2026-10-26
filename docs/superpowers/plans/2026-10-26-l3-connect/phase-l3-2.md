Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-2 — Loopback Streamable HTTP

## Goal

The same `McpServer` from L3-1, mounted on the SDK's Streamable HTTP transport, bound to loopback, served by the O8 runner at `http://127.0.0.1:7777/mcp`. A local agent connects by URL instead of by spawning a process, and the runner can finally tell the difference between *something answered* and *an agent initialized*.

This phase is also where the on-ramp's O8 rule is formally amended, because this is the change that breaks it.

## Changes

In `gateway/`:

- `src/http_main.ts` (new): the second entry point. Same server instance, different transport.
- `src/agent_sessions.ts` (new): the two session tables, written from the transport's `oninitialized` callback.
- `src/server.ts` (edited): the literal `transport: 'stdio'` at line 116 becomes a dep, so `capabilities.list` reports the transport it is actually running on. `tool_surface_digest` at line 121 is unchanged; `scope` and `sessionId` are added beside it.
- `test/http_transport.test.ts` (new): **listens on port 0, never 7777.** A test that binds the real port flakes against a running runner and, worse, passes for the wrong reason.

In `openmeow-site/`:

- `runner/serve.mjs` (edited): mounts `/mcp` and the three JSON routes `/api/agents`, `/api/receipts`, `/api/proposals`.

## Data structures

Two new tables in the database the gateway already has, because the receipt schema is strict and session binding does not belong inside a receipt:

```
agent_sessions (session_id, client_name, client_version, protocol_version,
                transport, scope, initialized_at, last_seen)
agent_calls    (receipt_id, session_id, client_name, tool, at)
```

Receipt bytes and `receipt.get` are untouched.

The **session id is minted by the transport** (`randomUUID`), never taken from the client's self-chosen name. That is finding F19 from the BYOA work carried over, and it is the difference between a session identifier and a label a client can forge.

**Scope** starts at `reader` for every new session: `openmeow.ping`, the `slides.*` reads, `receipt.get`, `capabilities.list`. `tools/list` is filtered server-side so an advertised tool is always a served tool. No write tool is listed before L3-6.

## The O8 amendment, stated for reviewers

O8 specified a runner that serves "files and one probe endpoint — nothing else," dependency-free. After this phase it serves `/mcp` and three JSON routes, and it depends on the gateway.

This is deliberate. The alternative — a second process beside the runner — would need its own port, its own token and its own trust boundary, and would put two things on the visitor's machine where one will do. The amendment is recorded here and in the on-ramp overview's phase list so a reader of O8 alone is not misled.

What does **not** change: loopback-only binding, the launch token on the page, the Host allowlist, the Origin check on mutation, and the refusal to serve outside the build root.

## Routing

Architecture, the transport guards and the session model: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`.

## Verification

**Static.** Five refusals, each its own test: no `Authorization` header → **401**; a foreign `Host` → **403**; a foreign `Origin` → **403**; `?token=` or `?secret=` in the query → **400**; a bind attempt on `0.0.0.0` → refused. Then the positive case: a well-formed `initialize` writes exactly one `agent_sessions` row, and a second `initialize` from the same client writes a second row with a different session id.

**Runtime.** `claude mcp add --transport http openmeow http://127.0.0.1:7777/mcp --header "Authorization: Bearer <secret>"`, then `claude mcp list` shows **Connected**, then a ping whose receipt is retrievable by id. The same against Codex with `bearer_token_env_var = "OPENMEOW_RUNNER_SECRET"`, confirmed with `codex mcp list`.

The negative runtime check matters as much: with a deliberately wrong bearer token, `claude mcp list` must **not** show Connected, and the runner page must show a refusal counter rather than a connected row.
