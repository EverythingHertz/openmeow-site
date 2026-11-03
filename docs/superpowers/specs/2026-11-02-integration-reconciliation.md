# Integration reconciliation and execution contract

This note reconciles the pasted planning thread with the selected
`openmeow-site` checkout. It supplements the
[L3 connection plan](../plans/2026-10-26-l3-connect/overview.md) and
[slide-board plan](../plans/2026-10-26-slide-board/overview.md).
Those plans describe a destination, not the current implementation.

## What is verified

Read-only inspection on 2026-11-02, starting at commit `f909108` on
`feat/slide-board-v0`. The checkout was clean.

| Claim | Evidence inspected | Finding |
| --- | --- | --- |
| There is no slide board yet | `slides.html`, `slides.mjs`, `runner/slides/serve.mjs` | Contradicted. A local v0 exists with three manifest readers and manual iteration prompts. |
| L3 and the progressive board need fresh plans | Existing L3 and SB overview/phase files | Contradicted. Reconcile and extend these rather than create competing plans. |
| The site can connect an agent today | Current runner routes and `agent: { connected: false }` | Not implemented in this checkout. There is no MCP route or session receipt. Do not label manual prompt copying as a connection. |
| The board streams deeper results | Runner reads all three corpora before listening and returns one `/api/cards` response | Not implemented. No SSE, catalogue worker, FTS, or job cancellation exists here. |
| Gateway slide limits survived zod 4 | Giant-scout relay follow-up, described below | Reported, not independently reproduced here. The gateway is a different repository. |
| Unknown tool fields are rejected | Same relay follow-up | Reported regression. Gateway-owner work, not a change to this site's unrelated schemas. |
| Giant-scout is still only an idea | Its current README and saved stranger-run report | Contradicted. A multi-source script and saved report exist. Do not build another discovery engine in this repo. |
| The stranger check passed | Saved report and relay follow-up | Report exists and labels its verdicts provisional. Elapsed time and 28 errors are reported by the follow-up, not independently measured here. |
| The old apprentice prompt is a safe takeover protocol | Pasted request/cancel/arm sequence | No. Cancelling one timer and starting another does not fence an already-running writer or establish ownership of an external action. |
| The local slide checks pass | `node --test tests\slides-readers.test.mjs tests\slides-serve.test.mjs` | Initial run: nine reader checks passed; all five server checks failed in setup. Port 7791 was already owned by another Node process. That process was left alone. |

The external local documents inspected read-only were:

- `C:\Work\01_EyeBiome\work\giant-scout-relay-2026-10-29\04_ADDENDUM.md`
- `C:\Work\01_EyeBiome\work\giant-scout-relay-2026-10-29\05_FOLLOWUP_2026-11-02.md`
- `C:\Work\05_Tooling\giant-scout\README.md`
- `C:\Work\05_Tooling\giant-scout\runs\2026-11-02-stranger-check\REPORT.md`
- The saved run's `RUN-LOG.jsonl`, bounded inspection only.

These machine-local paths are evidence pointers, not dependencies of the site.
No transcripts, private deck content, credentials, or cached discovery payloads
belong in this repository.

Unknown: current gateway branch, live peer-session identity, schedule ownership,
Dango's authoritative server/configuration, and the per-request causes of the
reported 28 scout errors. None can be inferred from a historical session title.

## Component ownership

| Responsibility | Home | Boundary |
| --- | --- | --- |
| Public catalogue and local slide UI | This repository | Public pages never claim to inspect local files or detect a connected agent. |
| Local board reader/index/iteration store | `runner/slides/` here | Read source corpora; write only to explicitly selected board data. |
| MCP transport, tools, receipts, strict tool validation | OpenMeow gateway repository | Reuse existing contracts. No second MCP implementation in this site. |
| External discovery, ranking, cached evidence | Existing giant-scout tooling | Consume reviewed reports later. Do not run probes as a harmless read; its README says `probe` rewrites channel state. |
| Peer messaging, schedules, lane ownership | Future coordinator, home undecided | No live automation until an owner selects its repository and approved adapters. |

Every implementation slice needs its repository, authorized writer, test command,
and rollback action recorded before starting. This site is the only selected
write workspace. No peer was contacted and no live schedule was changed.

## Discovery contract

Reuse giant-scout's stages and explicit script-only limitations. A discovery
request names a topic, needs, constraints, allowed source set, licence policy,
and budgets. It can seek solutions or resource collections, including fonts,
templates, datasets, and tool catalogues.

An accepted report must include:

- Internal alternatives with evidence-backed maturity, not keyword hits treated
  as proof that an integration works.
- External candidates with source URLs, retrieval time, source revision when
  available, candidate kind, licence evidence, fit, and limitations.
- Source failures, rate limits, unsearched channels, and unknown licence status.
- A decision per need and its unresolved dependencies. Popularity cannot
  override a failed privacy, licence, runtime, or capability gate.
- Verification level per claim. Fetching a README is not running a quickstart.
  Running a quickstart is not a successful integration.

Gate automated shortlist consumption on schema validation and a run identifier.
Keep provider responses as untrusted data, never agent instructions. Do not
replay credentials, execute candidate code, install dependencies, or send
private asset content during ranking.

Next scout-owner task: reconcile the follow-up's error count with available
per-call evidence. If that evidence was not persisted, record the gap and add
structured failure records in the scout repository before another network run.
Do not turn an aggregate counter into invented incident causes.

### External ideas to reuse, without adding dependencies

Primary-source research was bounded to these five areas. None was installed,
benchmarked, or adopted as a runtime dependency. This is a design comparison,
not proof that a package fits our production workflow.

| Reference | Useful mechanism | Decision and limitation |
| --- | --- | --- |
| [Temporal workflow identity](https://docs.temporal.io/workflow-execution/workflowid-runid) and [activities](https://docs.temporal.io/activity-execution) | Stable workflow identity, persisted progress, explicit retries | Borrow identity and checkpoint discipline. A workflow ID is not a fence on an unrelated process or external API. Activity effects still need idempotency. Do not deploy a workflow service for the current board. |
| [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) | Thread-scoped checkpoints separate from shared long-term data | Borrow the distinction between an execution checkpoint and shared knowledge. In-memory checkpoints disappear on restart. Checkpointing alone does not establish lane ownership. |
| [Official MCP registry](https://github.com/modelcontextprotocol/registry) | Metadata describing servers whose packages live elsewhere | Reuse existing scout registry adapters and retain provenance. A registry listing is not a capability test, trusted code, or a connection receipt. |
| [GitHub REST search](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28) | Structured query/pagination with explicit incomplete-result signalling | Retain `incomplete_results` and access limitations. An empty successful search is not proof of absence. Respect response rate-limit headers rather than treating one configured cap as universal. |
| [Forgejo repository search handler](https://codeberg.org/forgejo/forgejo/src/branch/forgejo/routers/api/v1/repo/repo.go) | Search on non-GitHub forges with explicit query validation | Keep forge adapters separate and instance-specific. A handler's behaviour or licence does not establish the entire deployment's rate limits or project licence. |

No licence approval is implied by this table. Before copying code, inspect the
exact revision and relevant file/package licences, including asset licences.
Durable-execution claims found only in third-party documentation mirrors were
excluded from this specification.

## Apprenticeship contract

Apprenticeship is a stateful coordination protocol, not a long prompt with a
timer. Learning remains useful without any permission to take over.

### Required records

- Session binding: stable incumbent/apprentice IDs, workspace, permitted reads,
  allowed message endpoint, operator authorization, and expiry.
- Lane: exact resource/action, owner, schedule cadence, next due time,
  checkpoint, idempotency key strategy, and mutation risk.
- Evidence: observation time, input revision, prediction, actual result,
  discrepancy, and whether the comparison was deterministic.
- Transfer: lane ID, expected incumbent, fencing generation, release receipt,
  checkpoint, operator approval, successor acceptance, and first-run receipt.

Do not store raw private transcripts in shared audit records. Record references
and only the evidence needed to reproduce a decision.

### Lifecycle

1. `recon`: inspect only authorized files and APIs. Inventory recurring work,
   manual overrides, pending side effects, and recovery rules.
2. `shadow`: compute in an isolated data directory with no external side effects.
   Label results as predictions and keep the incumbent as sole writer.
3. `qualifying`: compare against completed incumbent runs at matching input
   revisions. A mismatch needs an explanation, not a retry until it disappears.
4. `awaiting-approval`: operator and incumbent approve one named lane. No
   mutation permission is implied by passing the exam or by time elapsed.
5. `draining`: incumbent stops issuing new work and accounts for in-flight work.
   Cancelled schedules are insufficient if work is already running.
6. `released`: the authoritative coordinator advances a fencing generation
   conditionally on the expected owner and records the last committed checkpoint.
7. `active`: successor accepts that generation and schedules from the checkpoint.
   Each side effect must reject an old generation or use a downstream-supported
   idempotency mechanism.
8. `held`: unknown ownership, missing evidence, unsupported fencing, expired
   approval, scheduler failure, or peer loss stops promotion and notifies the
   operator. It does not grant takeover rights.

Only a coordinator shared by all actual writers can enforce these transitions.
A local JSON flag, peer acknowledgement, or lease timeout alone cannot fence a
stale process. If a target cannot enforce fencing, keep live transfer manual
with explicit downtime and verification. Do not promise gap-free, exactly-once
effects across independent cron systems.

### Qualification and scheduling

The operator supplies a bounded observation window, polling/request budgets,
lane-specific discrepancy tolerances, and required representative cases.
Elapsed time never counts as readiness. Calculations compare units, rounding,
input freshness, and deterministic outputs. Research tasks compare evidence and
coverage rather than demanding identical prose.

Automated qualification must exercise peer silence, stale ownership,
delayed/duplicate ticks, a crash between release and acceptance, in-flight
side effects, revoked approval, and restart from a checkpoint. Real services
stay out of these tests.

Start with read-only lanes. A supervised live rehearsal follows only after
the adapter proves supported messaging, scheduling, cancellation, ownership
checks, and fencing. Do not automate typing into another terminal.

Rollback is another ownership transfer, not re-enabling the old cron. Stop the
successor, drain/reconcile its work, advance the fence, restore the checkpoint,
and require the incumbent to accept the new generation.

## OpenMeow connection and board contract

Keep the existing L3 local-first split. A public page can present Claude and
Codex setup choices but must distinguish desktop/CLI from hosted web clients.
Do not publish `npx` recipes as working until packaging is verified. Public
relay/OAuth work stays separate from a loopback connection.

The local connection sequence is consent, authenticated transport, initialized
session, a tool call, and a persisted receipt. Only the initialized session
establishes connection state; the receipt proves a specific tool call. Neither
a listening port nor a copied prompt proves either.

The current board is Tier 0 only. Its next slices are:

1. Deterministic local fixtures and reliable startup/error tests.
2. Explicit partial-result counts and an empty/error state, before streaming.
3. Bounded recent-first queries, followed by stable incremental merge keyed by
   card identity. New results above the fold wait in a tray.
4. Bounded workers with completion-driven progress and cancellation. Do not
   fire all corpus-by-depth combinations without resource limits.
5. Gateway adapter and receipts, then provider UI. Do not generate “connected”
   state in the static site or infer it from iteration-file creation.

First-paint and discovery budgets require measurements against a named fixture,
machine, cache state, and corpus size. Existing plan measurements are historical
evidence, not new performance results. Keep the 300 ms Tier-0 target as a target
until measured again.

Iteration requests must validate payload shape before writing anything.
Corrupt state must stop request creation explicitly, never appear as an empty
history that permits a duplicate request. Source files remain unchanged.

## Execution and release gates

Implement a small local reliability slice first. It should make tests independent
of real corpora and occupied fixed ports, reserve a listener before touching data,
report startup errors, validate iteration requests, and preserve corrupt state.
Document the exact local command in the README.

Then update the existing L3/SB phase files based on gateway-owner evidence.
Select the coordinator repository before implementing live apprenticeship.
Scouting improvements belong with its owner, not inside this static site.

For each slice, run its focused tests and syntax checks, then the existing
site suite if shared behavior changes. For UI work, verify desktop and phone
rendering, keyboard use, initial/empty/failed states, and no fabricated status.

Release remains blocked on the unselected coordinator home, gateway ownership
and packaging evidence, an authorized live-trial lane, and measured UI budgets.
The reliability slice is not completion of the full multi-repository system.

Operator decision after the reliability slice: coordinator implementation is
deferred and no incumbent peer is authorized. A supervised live trial is
conditionally approved after prerequisites pass. No present messaging,
scheduling, or takeover action is authorized by that conditional approval.

## Reliability verification record

The regression tests first reproduced instruction coercion, swallowed corrupt
history, and data mutation during a failed port bind. The fixes cover those
cases and surface history errors in the browser rather than leaving rejected
promises unhandled.

Server tests now bind an OS-assigned port and override all three corpus paths
with synthetic fixtures. They verify the actual-port cookie, authenticated
reads, foreign Host/Origin rejection, URL-key rejection, invalid payloads,
pending-request conflicts, corrupt-state errors, and occupied-port startup
without credential/index changes.

The original occupied service on port 7791 was not stopped or reconfigured.
No live apprenticeship or gateway connection was attempted.

Final checks on Node 24.21.0:

- All 24 focused slide checks passed, including three DOM-level error-feedback
  checks. These are not visual browser tests.
- Syntax checks passed for the server, iteration store, and browser module.
- Full suite: 55 passed, one failed. The remaining failure is the existing
  byte-for-byte generated-page check in `tests/world.test.mjs`. The checkout's
  `world.html` has CRLF while the renderer emits LF. Read-only comparison
  confirmed that `HEAD:world.html` matches the renderer and the working file
  matches after CRLF normalization. No generated-page files were changed.
- `git diff --check` passed.

## Safe-pause resume instructions

The completed reliability slice is saved on branch `feat/slide-board-v0`.
Publication is limited to this repository and this feature branch; it does
not merge into `main`, deploy the site, or enable live automation.

On return:

1. Check the current branch, HEAD, working tree, and remote before editing.
   Do not overwrite newer work using the earlier local snapshot.
2. Read this specification and the current-execution notes in the L3/SB
   overviews. The remaining architecture is planned, not implemented.
3. Run the focused slide command in the README. All 24 checks passed again
   immediately before the pause. The known full-suite line-ending failure
   remains documented above.
4. Resolve gateway ownership and receipt/packaging evidence for the next
   provider-integration slice. Coordinator work remains explicitly deferred.

No session-owned background shell is left running. No real peer was
contacted and no schedule was changed. The user's separate board service
was left untouched. Local recovery copies of the changed files, plan, and
reference research remain in the Copilot session's `files/shutdown-checkpoint`
folder; that local folder is not part of the GitHub publication.
