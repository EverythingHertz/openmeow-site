Back to [[plans/2026-10-25-onramp/overview]]

# O4 — One command per workspace

## Goal

End every visit with something runnable: one copy-paste line that starts the workspace on the visitor's own folder, with its prerequisites stated plainly and verified on a machine that has never run it.

**The command worth copying is `npx openmeow`**, which starts the local runner (phase O8) — the same site served from loopback, where it can actually see and embed the workspaces. The per-workspace commands below remain, for someone who wants only one tool. This phase builds the manifest both modes read; O8 builds the runner. See [the embedding spec](../../specs/2026-10-25-embedding-local-workspaces.md) for why the split exists.

## Changes

- `world-workspaces.mjs` (new): the launch manifest the chooser reads — one record per workspace, from the workspace map's five (Library, Review, Studio, Dispatch, Observatory) plus the standalone tools that already launch cleanly (the Lookbook, the studio board).
- `scripts/build-chooser.mjs`: the detail card gains a launch block — the command in a copy control, the prerequisites line, the "what this does not do" line, and the workspace's readiness chip from existing data.
- `docs/LAUNCH_VERIFICATION.md` (new): for each command, the machine state it was verified on, the date, what happened, and what was not tested.

## Data structures

A **workspace record**: `{ id, name, room, lineId, kind: server|static|cli, command, prereqs[], port?, opensAt?, dataDir?, readiness, verifiedOn?, notDone[] }`. `verifiedOn` is absent until a real verification exists, and the card renders an unverified command differently — never as if it were tested.

**Honesty rule:** a command with no `verifiedOn` says so on the card. The studio board's is the easy one (clone, open `index.html`, no build, no server). The Lookbook's needs Python 3.11+ and a bootstrap. ReviewCore's is a `.cmd` shim whose PATH assumption already failed once in this project's own session — exactly the class of thing this phase exists to catch.

## Routing

Implementation: `codex` / `gpt-5.4`. The prerequisite and limitation wording: `claude`.

## Verification

Static: every record's `command` is a single line; every `server` record has a port; a test that no card renders `verifiedOn` content for a record lacking it. Runtime — the real work of this phase: each command is run from a clean shell with no inherited PATH or environment, and the result recorded in `LAUNCH_VERIFICATION.md` with what failed; the copy control puts exactly the command on the clipboard, nothing more; the card reads correctly in both schemes at 390 px.
