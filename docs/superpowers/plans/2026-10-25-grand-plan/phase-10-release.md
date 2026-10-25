Back to [[plans/2026-10-25-grand-plan/overview]]

# Phase 10 — Release

## Goal

Ship the chooser, the story page and the catalogue to openmeow.io through GitHub Pages with a reviewable staging step and a one-command rollback.

## Changes

- A staging branch (`site/chooser-2026-10`) carrying phases 0–9, served locally with a byte-range-capable static server for the video checks, reviewed in the browser pane, then merged to `main` (Pages deploys from `main`; `CNAME` unchanged).
- `og.jpg`: re-rendered from the chooser (the current share image shows the cat); `README.md`: the verification section updated for the two pages.
- A release note in `docs/` recording test counts, screenshots, the retired tests, and the rollback commit.

## Data structures

None.

## Routing

Review and release judgment: `claude` / `claude-opus-4-6`; mechanical steps: `codex` / `gpt-5.4`. Pushing and merging are the user's actions.

## Verification

Static: the full suite green on the staging branch; builds idempotent. Runtime, live after deploy: `curl -I` returns 200 for `/`, `/story.html` and `/film.html`; Lighthouse performance and accessibility ≥ 90 on `/`; scroll height of `/` under 2,000 px at 1440×1000; the Observatory card's run record hashes match the hub ledger; share preview shows the new `og.jpg`. Rollback: `git revert` of the merge commit, documented in the release note and rehearsed once on the staging branch before merging.
