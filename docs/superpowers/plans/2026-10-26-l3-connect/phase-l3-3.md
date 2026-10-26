Back to [[plans/2026-10-26-l3-connect/overview]]

# L3-3 — Publishable packages and stdio recipes

## Goal

Make the paste lines real. Until something is installable by name, every recipe on the chooser is a promise about a package that does not exist. This phase creates the two packages, the `openmeow` binary, and the per-platform recipes — and it carries one prerequisite that will break a stranger's first run if it is skipped.

## Changes

Two npm names, both confirmed unregistered on 2026-10-25 (`npm view` returned 404 for each):

- **`@openmeow/gateway`** from `openmeow/gateway/`.
- **`openmeow`** from `openmeow-site/`, with `bin {openmeow: runner/cli.mjs}`, depending on the gateway.

Files:

- `gateway/package.json` (edited): the name, and the optional-dependency move described below.
- `openmeow-site/package.json` (edited): `bin`, and the gateway dependency.
- `runner/cli.mjs` (new): subcommand `mcp` (stdio server), default behaviour `serve` (the O8 runner), and `--rotate-secret`.
- `gateway/SYSTEM-QUICKSTART.md` (edited): the per-client recipes replace the single TOML block at lines 83-92.
- `docs/LAUNCH_VERIFICATION.md` (edited): one row per recipe, with OS, Node version and first-run time.

## The prerequisite, with corrected line numbers

`playwright` and `axe-core` are in `gateway/package.json`'s **`dependencies`**.

> **Corrected 2026-10-26.** This phase first said that, left there, "a stranger's `npx openmeow` downloads Chromium." That was wrong, and so is the fix it implied. Lane G found it during task H6 (`EverythingHertz/openmeow#56`), and the hub re-checked two of the three findings:
>
> 1. **No Chromium download.** `playwright` 1.64.1 declares no install script (`npm view playwright@1.64.1 scripts` returns nothing). It never downloaded a browser on install. *Re-checked.*
> 2. **Moving them changes nothing on its own.** npm installs `optionalDependencies` by default, so `npx` still fetches both. *Standard npm behaviour; not re-run.*
> 3. **Real optionality needs a code change.** `gateway/src/browser_audit.ts` imports `playwright` and `axe-core` statically on lines 1–2, and `gateway/src/server.ts` imports from it on line 2. So the server cannot load without both. Lane G reports `ERR_MODULE_NOT_FOUND 'playwright'` under `npm ci --omit=optional`. The fix is a lazy `import()` inside `browser_audit.ts`. *Import chain re-checked; the runtime error is Lane G's.*
>
> So the move below is still worth doing, but only alongside the lazy import. The goal is a gateway that loads and serves its tools when the browser-audit packages are absent — not a smaller download.

They move to `optionalDependencies`, **and** `browser_audit.ts` imports them lazily. The exact locations, **verified against `main` on 2026-10-25**:

| Package | Line | Block |
| --- | --- | --- |
| `axe-core` | **31** | `dependencies`, which opens at line 29 |
| `playwright` | **32** | `dependencies` |
| `playwright-core` | **38** | `devDependencies` — **do not move** |

Two traps, both already paid for once:

- **`playwright-core` at line 38 is a different package** from `playwright` at line 32. A find-and-replace on "playwright" catches both and breaks the build.
- An earlier draft of this work cited "lines 40-45". Those lines are the close of `devDependencies`, the `engines` block and the file's final brace. The citation was wrong; these numbers replace it.

No `optionalDependencies` block exists yet. One must be created.

## Data structures

A **recipe** is the output of a pure function, so it can be snapshot-tested rather than hand-maintained in prose:

```
recipeFor(door, client, platform, mode, {port, secretPresent}) -> string
```

It lives in `world-connect.mjs` (L3-5 builds the cards from it, this phase defines it). Platform awareness is not cosmetic: Claude Code on Windows needs `cmd /c npx`, and elsewhere must not have it.

## Routing

The package boundary, the names and the recipe function's contract: `claude` / `claude-opus-4-6`. Implementation and the clean-shell runs: `codex` / `gpt-5.4`.

## Verification

**Static.** `npm pack --dry-run` in `gateway/` lists **no Playwright files**, and — because a devDependency is never packed and that check alone would pass on a no-op — two manifest-level assertions beside it: `dependencies` contains neither `axe-core` nor `playwright`, and `optionalDependencies` contains both at their current versions. `devDependencies.playwright-core` is unchanged. And the check that proves the point: with `npm ci --omit=optional`, `node -e "import('./dist/src/server.js')"` loads without `ERR_MODULE_NOT_FOUND`, and only a browser-audit call reports the packages missing.

**Runtime.** O4's clean-shell procedure, once per recipe row, recorded in `docs/LAUNCH_VERIFICATION.md` with OS, Node version and first-run time. Windows rows use `cmd /c npx`.

One check before anything else, because a name clash here is silent: `~/.claude.json` already has an `openmeow` stdio server scoped to `C:/Users/jhert/Desktop/05_Tooling/openmeow`. Run `claude mcp get openmeow` **first** and reconcile before adding.

**Nothing is published.** `npm view openmeow` and `npm view @openmeow/gateway` must still return 404 at the end of this phase. Publishing is the user's decision and is not part of it.
