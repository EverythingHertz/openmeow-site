---
id: 2026-10-25-onramp
created: 2026-10-25
status: active
repo: EverythingHertz/openmeow-site
layers-on: 2026-10-25-grand-plan
---

# The on-ramp — value in sixty seconds

## Context

The grand plan fixes the site's *structure*: a one-screen chooser instead of forty screens, a story page, a workflow map per room, workspaces under their rooms. Structure is necessary and not sufficient. A visitor who lands on a well-organised directory of thirty capabilities still has to decide what to care about, and every demonstration on the site today is synthetic and says so.

This plan fixes *arrival*. It makes the first sixty seconds produce something real — a thing that actually happened, the visitor's own material in the page, and one command that works. It is a layer over the grand plan, not a replacement: it depends on phases 1–4 and extends 8.

## The promise

**Sixty seconds, four beats, no decisions required.**

| Second | What the visitor does | What they get |
| --- | --- | --- |
| 0–5 | lands | one sentence, the system map, and the Dot blinking on a line that has a real example |
| 5–20 | clicks one of two doors: **Drop a file** or **Try an example** | a line selected and its route lit |
| 20–45 | reads the card | what you bring · what you get · a worked example with real receipts |
| 45–60 | copies one line | a command that starts that workspace on their own folder |

Nothing on that path requires choosing between thirty tools, reading a tagline, or creating an account.

## Three honest levels of "plug in your stuff"

The site must be exact about which level it is offering, because the difference is trust.

- **L1 — in the browser, now.** Drop a file. Name, type and size are read client-side; nothing is uploaded, nothing leaves the page. The visitor's filename appears inside the worked example, so the example becomes *about their thing*. Zero install, instant.
- **L2 — one command.** Copy-paste starts that workspace locally against a folder they choose. Install is required and is stated plainly, with what it needs and what it will not do.
- **L3 — connected.** Bring-your-own-agent through the gateway. **Out of scope here.** The site must not imply it exists.

## Scope

**In:** the above-the-fold spine; a worked-example record type and the eight examples; client-side drop routing with the visitor's file reflected in the example; a verified one-command launch per workspace; the craft pass (type, motion, the Dot, both schemes); keyboard and play; a timed cold-read test.

**Out:** anything that uploads a file or runs a model in the browser; account creation; L3; new video; changes to product claims or readiness; the workspaces' own internals (those are the workspace map's S1–S5).

## Constraints and alternatives considered

- **The hero.** *The map is the hero* (chosen): the thing you navigate is the thing you look at, and it is already being built in grand phase 2. Rejected: a rendered scene (needs art we are retiring), a video (needs a budget decision), a wall of logos (nothing to show).
- **The first move.** *Two doors, both one click* (chosen). Rejected: a single "get started" (decides nothing for the visitor), a search box (demands they know a word), a tour (the story page is the tour, and it is not the front door).
- **Examples.** *One worked example per line, labelled by evidence level* (chosen): real-with-receipts, recorded-from-real, or illustrative. Rejected: eight real ones on day one (we have one), and eight illustrative ones (that is today's problem).
- **Honesty under pressure.** Every example and command carries what it does **not** establish. A page that over-promises on arrival is worse than a page that under-promises, because the whole product is "tools for work you can inspect."

## Principles

As in the grand plan, there is no `brain/` in this environment; the governing rules are the project's own. Two bind this plan particularly:

- The intake engine's rule from PR #47 (`M0_PORT_NOTES.md`): a tracker never advances on a timer, and a provider's success status does not prove a usable result. Here: the drop tracker moves only on real client events, and an example says what it proves.
- The room-scene brief (2026-10-04): every product entry point is reachable without the tour; reduced motion gets an equivalent path; nothing essential is baked into pixels.

Plus the user's standing instruction for this plan: *brainless to follow, immediate value, plug in your stuff, solid examples, beautiful, easy, fun.*

## Applicable skills

`frontend-design` and `impeccable` (the craft and polish passes), `dataviz` (the example's evidence chips and the strip), `resilient-diagrams` (map legibility), `cold-reader` (the sixty-second test — it exists precisely for "what does a stranger take away"), `figure-claim-contract` (an example must claim only what its receipts support), `playwright-best-practices` (the timed and no-network tests), `council:review` (a blind read of the arrival screen).

## Phases

1. [[plans/2026-10-25-onramp/phase-o1-sixty-second-spine]] — above the fold: one sentence, the map, two doors.
2. [[plans/2026-10-25-onramp/phase-o2-example-library]] — the worked-example record and the eight examples, evidence-labelled.
3. [[plans/2026-10-25-onramp/phase-o3-your-file-in-the-example]] — drop → classify → route → the example rendered about *their* file.
4. [[plans/2026-10-25-onramp/phase-o4-one-command]] — a verified copy-paste launch per workspace.
5. [[plans/2026-10-25-onramp/phase-o5-craft-pass]] — type, motion, the Dot, both schemes, gated by Gellphant 1/2/3/5.
6. [[plans/2026-10-25-onramp/phase-o6-keyboard-and-play]] — number keys, interchanges, the running train, the toy quality.
7. [[plans/2026-10-25-onramp/phase-o7-sixty-second-test]] — a timed cold read against the promise table.

O1 needs grand phases 1–4. O2 and O4 are independent of each other and can run in parallel. O3 extends grand phase 8 and needs O2. O5 and O6 need O1. O7 is last and gates release.

## Verification

Beyond the grand plan's project-level set: a **timed path test** (a first-time reader reaches a copied command inside sixty seconds), a **no-network assertion** on the drop path (zero requests), an **evidence audit** (every example's claims trace to a receipt, run with `figure-claim-contract`), and the **Gellphant gates** on every generated SVG. The release gate is O7, not a phase count.
