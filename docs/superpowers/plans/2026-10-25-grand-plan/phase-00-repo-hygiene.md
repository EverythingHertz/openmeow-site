Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 0 — Repo hygiene

## Goal

Make the repository safe to work on from a Windows checkout and put the plan where contributors find it, without changing anything a visitor sees.

## Changes

- `.gitattributes`: `*.html`, `*.mjs`, `*.css`, `*.json`, `*.md` as `text eol=lf`; media as `binary`. (The repo currently has only a one-line `.gitattributes`.)
- `tests/world.test.mjs:55`: the strict equality test between `index.html`, `world.html` and `renderWorld()` compares after normalising line endings, so it passes on `core.autocrlf=true` checkouts and still fails on real drift.
- `package.json` (new): a `test` script running `node --test tests/*.test.mjs` and an `engines` field (`node >= 20`), so `npm test` works from PowerShell as well as a shell that expands the glob. No dependencies.

This plan's documents are committed in the same change.

## Data structures

None.

## Routing

Scaffolding: `codex` / `gpt-5.4`. Review: `claude`.

## Verification

Static: `node --test tests/*.test.mjs` passes on a fresh Windows clone with `autocrlf=true` and on Linux; `git ls-files --eol` shows `i/lf` for text files. Runtime: none — no visible change; confirm `index.html` byte-identical before and after on the Pages build.
