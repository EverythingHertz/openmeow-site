---
id: 2026-10-26-focus-canvas
created: 2026-10-26
status: design approved section by section in chat; this written spec awaits review
repo: EverythingHertz/openmeow-site
refines: 2026-10-26-slide-board (pull request 2)
builds-on: feat/slide-board-v0 at f909108 (local only, not pushed)
---

# The focus canvas — one slide, one change, your agents

## What this is

The first screen of OpenMeow. A founder opens it and sees their own slides. They pick one, type one change, and send it to their own agent — Claude Code or Codex. The agent makes the change; the new version appears beside the old one; nothing the founder owns is ever overwritten.

It is the working form of the definition the user chose on 2026-10-26: *OpenMeow is the local place where my own agents plug in and do visible, useful work, starting with my slides.* The pitch deck is the first place that work becomes visible.

It is also a refinement of the slide board plan in pull request 2, not a replacement. The slide board v0 already built most of what this needs — the corpus readers, the security locks, and an iteration store that keeps every version outside the founder's folders. This design changes what the founder sees first, closes three gaps in v0's iteration rules, and adds a rail of agents.

## Decisions in force

Each was made by the user in chat unless marked otherwise. Nothing here re-opens them.

| # | Decision | Recorded |
| --- | --- | --- |
| 1 | OpenMeow is where your own agents plug in and do visible work, starting with slides (direction B; A and C rejected) | memory note `openmeow-definition-and-slide-board`; `OPENMEOW_NOW.html` |
| 2 | Marketed as a niche, founder-focused pitch-deck system that works the way Stitch does: describe one change, see it made | this session |
| 3 | The front door: the founder sees their own corpus and iterates one slide at a time | this session |
| 4 | Iterated versions live outside every corpus | already implemented in v0, `runner/slides/iterations.mjs` |
| 5 | The left rail lists agents, like the Claude Desktop sidebar, and their work lands in the centre | this session |
| 6 | The shell is the focus canvas: one big slide, one change box, the corpus in a dock | this session; the recommended alternative (a three-pane shell) was declined, and its browsing advantage is recovered by Browse below |
| 7 | Sections 1 to 4 of this design | approved one at a time, this session |

**One assumption is not a decision yet: the palette.** The mockups use dark, quiet chrome with a single teal accent, matching the Claude Desktop window the user pointed at with "this is us". The user rejected the purple-gradient look of Stitch outright, but never explicitly approved this palette. It conflicts with `.superdesign/design-system.md`, which specifies a light paper-and-ink system. Approving this spec approves the dark chrome; rejecting it here costs nothing but a token change.

## 1. The screen

One screen with three states, switched by a control in the top bar. Breadcrumb on the left (`deck-a › Market size`), state control on the right.

**Layout.** A left rail of agents. A stage holding the slide and a narrow column beside it. A dock along the bottom holding the current deck as a filmstrip.

**Focus** is the default. One slide, large. Beside it: who made this version and with what instruction, the version tabs (`v1 v2 v3`), three suggestion chips, and the change box. The chips teach the one-change grammar from the Stitch iteration template in the OpenMeow repository (`design/stitch-prompts/12-iteration-template.md`): say one change, plainly. The change box is addressed to an agent — `to Claude Code` — which is what ties the rail to the work.

**Compare** splits the stage into two versions side by side, any two the founder picks. This is where a founder decides whether a change was worth keeping, so it gets the whole stage.

**Browse** is the dock pulled up into a full grid: search, deck filters, newest first. Clicking any slide drops back into Focus on it. Browse is how the focus canvas answers "show me everything I have" without making browsing the default. It carries a **Can iterate** filter, because only slides with an SVG source can be changed today (see *Deferred*).

**Visual rules.**

- The founder's slides stay light; the chrome stays dark. The artefact is always the brightest thing on screen.
- One accent colour, teal, used only where something is selected or ready.
- No gradients, glows or animated backgrounds. The Stitch landing page was rejected for exactly that.

## 2. How one change flows

The same five steps today and once agents can connect. Only steps 3 and 4 change.

| Step | Today (v0) | Once the agent connection exists (L3) |
| --- | --- | --- |
| 1 | You type one change. Up to 500 characters, SVG slides only. | Same, addressed to the agent selected in the rail. |
| 2 | OpenMeow writes the request. The first time, it copies the source in as `v1.svg`. One open request per slide. | Unchanged. |
| 3 | You copy the generated prompt into Claude Code or Codex. | The agent calls `slides.requests` and sees the request waiting. |
| 4 | The agent reads the base version and writes the next one into the folder directly. | The agent calls `slides.submit` with the request id and the new SVG. **OpenMeow writes the file** and stores a receipt. |
| 5 | OpenMeow sees the new file, closes the request, and Focus shows it. | Same, and the agent appears in the rail. |

**The two records.** Written to `%LOCALAPPDATA%\openmeow\slides\iterations\<card_id>\`.

The request, when you press Send:

```json
{ "request": 3, "card_id": "loc-9f1c…", "instruction": "one number, bigger",
  "base": "v2", "target": "v3", "to": "Claude Code", "status": "waiting for agent" }
```

The version, beside its SVG when the change lands:

```json
{ "version": 3, "parent": "v2", "instruction": "one number, bigger",
  "author": "Claude Code", "created_at": "2026-10-26T10:42:07Z" }
```

The `to` field is new; everything else matches v0 today.

### Decision 2.1 — A version counts only if one of your requests asked for it

v0 currently lists every `vN.svg` in a slide's folder as a version (`iterations.mjs`, line 21), whether or not anyone requested it. An agent, a script or a stray copy can therefore add a version the founder never asked for, and the board presents it as theirs. Under this rule, a file with no matching request appears separately as *unrequested*, can be opened, and never enters the version chain or the rail.

### Decision 2.2 — Once agents connect, OpenMeow writes the files, not the agent

One writer per folder. The agent hands back the new SVG through `slides.submit`; OpenMeow checks that the request exists, is still open and has not been filled, then writes the file and a receipt. The request id does the job the L3 plan gave its approval token: minted by the founder's click, bound to one slide and one target, usable once. Agents never need write access to the founder's machine.

**This requires an amendment to the L3 plan.** Its tool table lists `openmeow.ping`, four `slides.*` reads, and `slides.propose` / `slides.apply` for deck creation. It needs two more tools, `slides.requests` (read) and `slides.submit` (write, gated by an open request). The existing `propose` / `apply` pair is unaffected; it creates whole decks through the engine, a different job.

### Decision 2.3 — OpenMeow can queue a change; it cannot make an agent act

The agent calls OpenMeow over MCP, never the reverse. So pressing Send never implies work has begun. The slide reads *waiting for Claude Code* with no spinner until the agent actually picks the request up, and the founder still tells their agent "do my OpenMeow requests" once per session.

## 3. Honest states and failures

Every state the change box and the rail can be in, with the words on screen. Where v0 already has the right words, they are kept.

| State | On screen | True | Not knowable |
| --- | --- | --- | --- |
| Slide can't be changed | "This slide is a PDF page. OpenMeow can show it, not change it yet." Plus a link to the slides in the deck that can. | Only SVG sources can be iterated. | — |
| Waiting | "Waiting for Claude Code · sent 4 min ago." Today, a Copy prompt button. Once connected: "Seen by Claude Code at 10:41." | A request exists; once connected, an agent has read it. | Whether the agent is doing anything. |
| One already open | "One change at a time — v3 is still waiting." With a Withdraw button. | v0's existing rule. | — |
| Withdrawn | Version tabs show `v3` struck through. "Your next change becomes v4." | The request is closed and its number spent. | — |
| Result arrived | Checked automatically, each named plainly when it fails: "v3 is identical to v2 — the agent changed nothing." / "v3 isn't a readable SVG." Otherwise "v3 looks fine" and a Compare button. | The file opens, and it differs from its parent. | Whether it is exactly one change. That is the founder's call in Compare. |
| Unrequested file | "1 file here no request asked for: v4.svg." Openable, never in the chain. | Decision 2.1. | — |
| Folder moved | "deck-a is HELD — root not found: <path>." Its slides are hidden; already-changed slides remain. | v0's existing words. Versions survive because every `v1` is a copy. | — |
| No agent yet | "No agent has changed a slide yet. Type one change, press Send, then paste the prompt into Claude Code or Codex." | Nothing has happened; the next action is named. The slides themselves are still on screen. | — |

### Decision 3.1 — An unanswered request can be withdrawn, and withdrawing spends its number

v0 has no way out today: an open request blocks every new change to that slide, and there is no cancel or withdraw route. Withdrawing writes a new file, `withdrawn-N.json`, so the record stays append-only. The next change takes the next number, leaving a visible gap rather than a silent reuse, and a reply that arrives after withdrawal is treated as unrequested under decision 2.1.

### Decision 3.2 — Check what a machine can, and name what it can't

Readable SVG and different from its parent are checked automatically. "Exactly one change" is stated as the founder's judgement, with Compare one click away. No score or confidence figure stands in for it.

### Decision 3.3 — Seen is not working

The rail and the waiting state report only what OpenMeow observes: a request is open, an agent read it at a given time, an agent delivered a version. The rail's headings are **Has your request** and **Earlier**. Never "Working", "thinking" or a progress bar. (The first mockup used "Working"; this decision corrects it.)

## 4. What v0 keeps, cuts, changes and adds

Subtraction first. Every item names the file it lives in, on `feat/slide-board-v0` at `f909108`.

**Cut or demote.** Little is deleted.

- The newest-first grid stops being the first screen and becomes Browse (`slides.mjs`, `renderGrid`).
- The pop-out side panel stops being the place you work; iteration moves to the Focus stage (`slides.html`, `aside.panel`).
- Counting every file as a version ends (decision 2.1; `iterations.mjs`, line 21).
- The placeholder example "See your agents work." becomes a deck example such as "one number, bigger" (`slides.html`).

**Keep exactly.**

- The three readers and their HELD handling: a missing folder is held and the rest still load (`runner/slides/readers/*.mjs`; 9 tests — 6 on synthetic fixtures, and 3 smoke tests against the real corpora that skip themselves when a corpus folder is absent).
- The server's locks: launch token, Host allowlist, no key in a URL, Origin check on POST (`runner/slides/serve.mjs`; 5 tests).
- Where versions live: outside every corpus, `v1` a copy, nothing overwritten, one open request per slide, 500-character cap (`runner/slides/iterations.mjs`).
- "Agent: not connected" and the copy-prompt path, which stay as the fallback after agents can connect (`slides.html`, `#pending`).

**Change.**

- The version rule (decision 2.1) in `state()`.
- A withdraw route (decision 3.1) in `iterations.mjs` and `serve.mjs`.
- Requests record the agent they are addressed to (`to`), in `createRequest`.
- The two result checks (decision 3.2).

**Add.**

- Tests for the iteration loop. It has none today, and it is the file every decision above touches.
- Focus, Compare and Browse, reusing the existing grid and version chips (`slides.html`, `slides.mjs`, `slides.css`).
- The agent rail, built from evidence: who delivered versions (`author` in each `vN.json`) and who has an open request (`to`). No probing.

### Order of work

1. **Pin the loop.** Tests for `iterations.mjs` as it behaves today. Nothing changes yet.
2. **Fix the rules.** Version rule, withdraw, addressed requests, result checks — each lands with its test.
3. **Swap the screen.** Focus becomes the default; the grid becomes Browse; the panel becomes the stage.
4. **Add the rail.**

### Deferred on purpose

- **Changing PNG, PDF and PPTX slides.** SVG-only stays this round. The Can iterate filter makes the limit honest instead of solving it.
- **The live agent connection.** Already planned in the L3 plan in pull request 2, plus the amendment in decision 2.2. This design works without it and is ready for it.
- **The 25 MB catalogue, background workers and live updates** (slide board phases SB-3 to SB-5). Focus is useful on the three manifest corpora alone.
- **The wider "cut what's dead" list** — the cat cast, colony framing, the long world page. A separate item on the status page, not this screen.

## Acceptance

Done means each check below passes and was run, not described. The 14 existing v0 tests stay green throughout. Three of them are smoke tests against the real corpora that skip when a folder is missing, so a run report must state how many ran and how many skipped — a skip is not a pass.

**Step 1 — the loop, as it is today.**

- The first request copies the source to `v1.svg` with its `source_path`, and never overwrites an existing `v1.svg`.
- An empty instruction is refused with "Type one change first."; over 500 characters is refused; a slide with no SVG source is refused.
- A second request while one is open is refused with "Request N is still waiting for vM."
- When the target file appears, the request closes and the next request targets the following number.
- A malformed card id is refused.

**Step 2 — the new rules.**

- A `vK.svg` with no matching request is listed as unrequested and absent from the version chain.
- Withdrawing writes `withdrawn-N.json` without editing any existing file, frees the slide, and the next request skips the withdrawn number.
- A file arriving for a withdrawn request is listed as unrequested.
- Every new request records `to`.
- A result byte-identical to its parent is flagged; a result that does not parse as SVG is flagged.

**Step 3 — the screen.**

- Focus is the state at load.
- Compare shows exactly the two versions chosen.
- Browse lists every indexed slide, and Can iterate shows exactly those with an SVG source.
- Each state in section 3 renders its exact words, asserted as strings.
- No spinner or progress element exists in the waiting state, asserted by a test that searches the rendered page.
- Screenshots at 1440 and 390 pixels wide.

**Step 4 — the rail.**

- An agent appears only if it authored a delivered version or has an open request addressed to it.
- With no agents, the empty-state words render.
- The word "Working" does not appear in the rail, asserted by a test.

## Risks outside this design

1. **v0 exists on one disk.** `feat/slide-board-v0` has never been pushed: two commits, about 1,350 lines of code and tests, only in `C:\Work\openmeow-site`.
2. **v0 is stacked on pull request 2.** Its branch includes pull request 2's commits. Opened as a pull request before pull request 2 merges, it would carry all of those documents with it. Merge pull request 2 first, or base v0's pull request on pull request 2's branch.
3. **The palette assumption** in *Decisions in force* conflicts with `.superdesign/design-system.md` until one of them changes.

## Ownership

The code this design changes was written by the session "OpenMeow slide board v0 build", which owns `runner/slides/*`, `slides.html`, `slides.mjs` and `slides.css` on `feat/slide-board-v0`. This spec reaches that lane as a written request. It is not an instruction to edit that branch from anywhere else.

The L3 amendment in decision 2.2 belongs to pull request 2 and its owner.

## Provenance

Every claim about v0 was read from `feat/slide-board-v0` at `f909108` in `C:\Work\openmeow-site` on 2026-10-26: the version rule and request handling in `runner/slides/iterations.mjs`; the routes and error words in `runner/slides/serve.mjs`; the HELD handling in the three readers; the screen in `slides.html` and `slides.mjs`; and the test names in `tests/slides-readers.test.mjs` and `tests/slides-serve.test.mjs`. No search found any cancel or withdraw route.

The approved mockups are local, not in this repository: `C:\Work\01_EyeBiome\.superpowers\brainstorm\1094-1793012612\content\`, files `03-screen.html` (section 1), `04-flow.html` (section 2), `05-states.html` (section 3) and `06-keep-cut.html` (section 4).
