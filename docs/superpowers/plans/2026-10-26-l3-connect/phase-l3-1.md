Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-1 — Ping and slides over stdio

## Goal

A stranger runs two commands and sees a receipt. That is the whole phase: the gateway answers `openmeow.ping` over the transport it already speaks, and four read-only slide tools return real cards from the index, each call leaving a receipt that `receipt.get` can retrieve with a matching digest.

No HTTP, no packaging, no page. Those are L3-2, L3-3 and L3-5. This phase proves the tools exist and are honest.

## Changes

In `EverythingHertz/openmeow`, `gateway/`:

- `src/slides_index.ts` (new): the `deps.slides` contract — `recent(n)`, `search(q)`, `card(id)`, `stream(since)` — and nothing else. It is an interface with a null implementation here; the real index arrives from the board plan and is injected, never imported.
- `src/slides_tools.ts` (new): the five tools, each built with the receipt-wrapped `call()` pattern from `capability_tools.ts:31-48` (`buildLocalReceipt`, `ReceiptStore.put`, `redactPaths`). Text payloads pass through `boundedView` (`response_view.ts`), which caps at 40,000 characters and returns `truncated` with a cursor — under claude.ai's 150k limit and Claude Code's 50,000-character spill threshold.
- `src/server.ts` (edited): `deps.slides` added; `GATEWAY_TOOLS` at line 17 gains the five names.
- `src/stdio_main.ts` (edited): wires the index when present, and runs without it when absent.
- `src/receipt_store.ts` (edited): gains `list({since, limit})`.
- `test/slides_tools.test.ts` (new).

## Data structures

A **Card** is `{id, title, corpus, kind, updatedAt|null, sha256|null}`.

`updatedAt` is **null for the Review desk catalogue, because that catalogue has no mtime** — and the tool says so in its payload rather than substituting a plausible date. This is the smallest instance of the plan's rule about evidence: an absent field is reported absent.

A **receipt** is `LOCAL_DETERMINISTIC`, unchanged in shape. The receipt schema is strict (`receipt.ts:157-188`), so nothing about sessions goes into it here; that lands in L3-2 in separate tables.

`slides.card` returns `source {sha256, bytes, mtime|null}`, `text` capped at 20,000 characters, and either one image block (WebP ≤ 60 KB) or a `resource_link` to the runner's preview route. It never returns a 4K render.

## Routing

Architecture, the tool contract and the honesty rules: `claude` / `claude-opus-4-6`. Implementation: `codex` / `gpt-5.4`.

## Verification

**Static.** `npm test` green in `gateway/`, with the exact-order assertion at `test/server.test.ts:48` updated to include the five new names — that assertion is `assert.deepEqual(listed.tools.map((x) => x.name), [...GATEWAY_TOOLS])`, so an advertised tool is always a served tool and the order is pinned. New tests for: the 40,000-character cap (a long card truncates and reports a cursor); a null `updatedAt` surviving to the payload with its explanation; and **a receipt written for a `slides.card` that failed** — a failed call is still a call, and the absence of that receipt would be the dishonest case.

**Runtime.** `node scripts/call_gateway.mjs openmeow.ping`, then `receipt.get` on the returned id, and confirm the digests match. Then the same for one `slides.recent` against a fixture index. Record both receipt ids in the phase's completion note.
