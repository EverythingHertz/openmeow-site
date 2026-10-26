Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-4 — The `.mcpb` bundle

## Goal

One double-click connects Claude Desktop. This is the only genuinely one-click door in the plan, and it is the door most visitors will use.

**This phase is blocked.** The blocker is a measurement, not a design question, and it is stated before the work because starting without it would produce a bundle that fails on an unknown fraction of machines.

## The blocker

The gateway needs `node:sqlite`, therefore **Node 24**. Claude Desktop runs the bundle on its own bundled Node, not the system one.

During drift task H3 on 2026-10-25, **no `node.exe` was found** under `AppData\Local\AnthropicClaude`, `AppData\Local\Programs`, or either `Program Files` tree. The install is not at any standard path on this machine. The system Node is v24.21.0 and that is **not evidence** about the bundled runtime.

Until the install path is located and the version measured by running that binary with `--version`:

**L3-4 SHALL NOT rely on `node:sqlite` inside Desktop.** The contingency below is the default design, not the fallback.

## Changes

- `gateway/mcpb/manifest.json` (new): `manifest_version "0.3"`; `server.type "node"`; `args ["${__dirname}/dist/src/stdio_main.js"]`; `user_config.library` a directory with default `${HOME}/OpenMeow Library`.
- `gateway/scripts/pack_mcpb.mjs` (new): packs with `@anthropic-ai/mcpb`.
- The release artefact `openmeow.mcpb`, with its sha256 published beside it.

**Contingency design, which ships unless the measurement clears Node 24.** The `.mcpb` becomes a ~60-line stdio-to-loopback bridge over `node:http` that forwards to the runner's `/mcp`. It needs no SQLite of its own, so it runs on any Node the Desktop ships. Its card then says plainly that the runner must be running, which is a real cost: the one-click door becomes one-click-plus-a-terminal, and the chip changes from **one-click** to **one-click (runner required)**.

## Data structures

`${__dirname}` in `args` rather than an absolute path, so the bundle is relocatable.

`OPENMEOW_ENGINE_MODE=disabled` is set by the manifest, so **no child process spawns** until the user turns the engine on. A bundle that quietly starts a subprocess on install is the kind of thing that should never ship, and the environment variable is how the gateway already expresses that.

The bundle contains **no `.sqlite` file and no secret**. The library path is user config; the database is created on first use in the user's own directory.

## Routing

The manifest, the contingency decision and the honesty of the chip: `claude` / `claude-opus-4-6`. Packing script and the install runs: `codex` / `gpt-5.4`.

## Verification

**Static.** `mcpb validate` passes. A test asserts the packed bundle contains no `.sqlite` and no file matching the secret's name — not a grep of the manifest, a listing of the actual archive.

**Runtime, in this order, and the first step gates the rest.**

1. **Locate Claude Desktop's Node and run it with `--version`.** Record the path and the version verbatim. Read-only.
2. If it is Node 24 or newer: install the bundle, ping from a Desktop chat, confirm the receipt is visible on the runner page.
3. If it is older, or still unlocatable: build the bridge contingency instead, install it, ping from a Desktop chat with the runner up, and confirm the card's chip and copy say the runner is required.

Either way the phase's completion note records the measured version and which design shipped. "Assumed 24" is not an acceptable entry.
