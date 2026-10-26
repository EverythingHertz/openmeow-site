# Embedding the localhost workspaces — what the browser allows

Spec, 2026-10-25. Measured, not assumed. Governs on-ramp phase O4 and workspace-map stage S3.

## The question

The workspaces are local servers: the Review desk on 8892, the screening room on 8799, the Lookbook on 8768, the studio board on 8899, ReviewCore's surfaces, the portal bridge on 9137. `openmeow.io` is a static HTTPS site on GitHub Pages. How does the site surface a tool that only exists on the visitor's own machine?

## What the browser actually does

Measured in Chrome **152.0.7977.167** on 2026-10-25, with a live Python server on 8781 and the real `https://openmeow.io` origin. Not from documentation.

| Parent page | Target | `fetch()` | `<iframe>` | Top-level navigation |
| --- | --- | --- | --- | --- |
| `https://openmeow.io` | `http://127.0.0.1:8781` | **blocked in 1 ms**, `TypeError: Failed to fetch`, both `cors` and `no-cors` | **blank** — a `load` event fires but nothing renders | **works** — an anchor click lands on the page and it renders |
| `http://localhost:8781` | `http://127.0.0.1:8781` (cross-origin, same scheme, both local) | **ok**, `type=opaque`, 4 ms | **renders fully** | works |
| `http://localhost:8781` | itself | ok, 200, 1 ms | — | — |

Three things follow, and they are not opinions.

1. **A public HTTPS page cannot talk to localhost.** The 1 ms failure is the giveaway: nothing reached the network. This is Chrome's Local Network Access (shipped in Chrome 142, October 2025, formerly Private Network Access), which gates any request from a public site to loopback, a private IP or `.local` behind a user permission prompt. The enterprise opt-out policy is reported to be removed in Chrome 156.
2. **An iframe's `load` event is not proof of anything.** It fired on the blocked embed. Only a screenshot settled it. Any future test of this must assert on rendered content, never on the event.
3. **A page served from localhost has none of these limits.** Cross-origin loopback-to-loopback both fetches and frames normally.

## The architecture this forces

**One build, three modes.** The same output of `scripts/build-chooser.mjs` runs in all three; a capability check at startup picks the mode. Nothing is written twice.

### Mode 1 — Public (`https://openmeow.io`)

The catalogue. Shows every workspace, its map, its worked example, its readiness and its launch command. It **links** to a local tool (navigation works) and must do nothing else: no probing, no embedding, no "detecting your setup". It cannot know whether anything is running and must never pretend to. A link to a tool that is not running lands on a connection error, so the public site labels local links as local and says what starts them.

This mode is also where the drop chooser (O3) lives, and that remains entirely client-side — the File API needs no network at all, so LNA does not touch it.

### Mode 2 — Local runner (`npx openmeow`, serving `http://127.0.0.1:7777`)

The same site, served from loopback, where every restriction lifts. This is the answer to "seamlessly embed the localhost tools": it is seamless because it is the *same page*, served from the right place.

It can: probe which workspaces are up (an opaque `no-cors` fetch per port, ~4 ms each, run in parallel — a whole roster resolves in well under a second); show live up/down beside each line; embed a running workspace in a pane; deep-link into it; and read any workspace that offers a JSON API with permissive CORS.

### Mode 3 — Portal (the Electron app on `feat/intake-portal-on-main-20261015`)

No browser restrictions at all. Already has the drop surface, the bridge client on 9137, and a file-only CSP with network confined to the main process. It is the richest mode and the one that can also watch folders and register a protocol handler. The runner is the browser-shaped subset of it.

## What the runner must get right

**Framing consent.** A workspace that sends `X-Frame-Options: DENY` or a restrictive `frame-ancestors` cannot be embedded, and a proxy that strips those headers is a security hole, not a fix. The rule: a workspace **opts in** by allowing `frame-ancestors http://127.0.0.1:7777 http://localhost:7777`; the runner detects a refusal and degrades to opening it in a tab, visibly, rather than showing an empty pane. Which workspaces currently refuse is unmeasured and is the first task of implementation.

**Its own security.** A local server that a web page can reach is the shape of several real vulnerabilities — MCP Inspector (CVE-2025-49596, CVSS 9.4), Vitest UI (CVE-2025-24964, 9.6), Vite (CVE-2025-24010), and Zoom's 2019 localhost server. The runner therefore binds 127.0.0.1 only, requires a launch token in the URL it prints, validates the `Host` header against an allowlist to defeat DNS rebinding, checks `Origin` on anything that mutates, refuses path traversal and symlinks outside its root, and serves no file it was not told to serve. LNA now blocks a hostile public page from reaching it, which helps — but rebinding routes around LNA, so the Host check is not optional.

**Honesty about state.** A probe proves a port answered, nothing more. The runner says *responding*, never *healthy*, and never infers that a workspace did any work. This is the same rule the intake engine already enforces: a tracker advances on evidence, not on a timer.

## Rejected alternatives, and why

- **The Plex pattern** — wildcard DNS (`*.plex.direct`) plus a real certificate so the local server speaks HTTPS. Solves mixed content elegantly, and it is genuinely how Plex reaches local servers from a browser. It does **not** solve this problem: LNA gates on the destination being a local address, not on the scheme, so an HTTPS page reaching an HTTPS loopback server is still gated. It also needs a CA relationship and breaks under router DNS-rebind protection. Wrong tool here.
- **Asking the visitor to grant the LNA permission prompt.** Possible, but it asks a stranger to give a public website access to their local network before they have any reason to trust it, and a denial is sticky — Chrome will not re-prompt. A bad trade for a first visit.
- **A tunnel (ngrok, Tailscale).** Exposes local tools to a public name. Solves the technical problem by discarding the local-only property that makes these tools safe.
- **Rewriting the workspaces as hosted services.** That is a different product, and it contradicts the user's standing constraint that local media stays local.

## What this changes in the plans

- **On-ramp O4 ("one command per workspace")** gains its real shape: the one command is `npx openmeow`, and what it starts is Mode 2. The per-workspace commands remain, but the runner is the thing worth copying.
- **On-ramp O1** must not render a probe or a status dot in Mode 1. Live state is a Mode 2 feature; showing it on the public site would be a lie.
- **Workspace map S3** ("launch manifest → chooser hook") is now specified: the manifest is read by both modes; only Mode 2 probes it.
- **A new phase is needed** for the runner itself — it is not a small addition to O4.

## Open and unmeasured

Whether Firefox and Safari behave as Chrome does here — only Chrome was measured — and whether the portal should host the runner's UI or embed it.

## Frame verdicts, measured 2026-10-25 (drift task H3)

Method for every `ok` row: serve a page on loopback, insert an `<iframe>` pointing at the workspace, wait, and **assert on rendered content via a screenshot**. The spec's own rule applies — a `load` event fired on a blocked embed during the original measurements and is never evidence. No workspace this session does not own was started; a workspace that was not running is `unknown`, not `refused`.

| Workspace | Port | Verdict | Method | Date |
| --- | --- | --- | --- | --- |
| Studio board | 8899 | **ok** | iframed from `http://localhost:8781`; rendered content confirmed by screenshot — sidebar, Deck/Pages/Appendix counts, slide 01 and its caption all visible | 2026-10-25 |
| Review desk | 8892 | unknown · not running | another lane's; down since its `watch_queue.py` launcher hit `PermissionError WinError 5` on the queue-watcher status replace. Not started | 2026-10-25 |
| Review desk (second listener) | 8893 | unknown · not running | same store, same lane. Not started | 2026-10-25 |
| Lookbook | 8768 | unknown · not running | another lane's. Not started | 2026-10-25 |
| Screening room | 8799 | unknown · not running | Codex lane. Not started | 2026-10-25 |
| Portal bridge | 9137 | unknown · not running | PR #47 is unmerged; no bridge process exists | 2026-10-25 |

**Why 8899 frames, and what it implies for the rest.** It returns neither `X-Frame-Options` nor a `Content-Security-Policy`, so nothing forbids an ancestor. It is `SimpleHTTP/0.6 Python/3.11.15` serving static files — a stock Python static server sends no framing headers at all. The Review desk, the screening room and the Lookbook all run their own Python servers with explicit origin checks, so their verdicts cannot be inferred from this one and remain genuinely unknown until each is running and testable by its owner.

**Claude Desktop's bundled Node: unknown.** Required by phase L3-4, which needs `node:sqlite` and therefore Node 24. No `node.exe` was found under `AppData\Local\AnthropicClaude`, `AppData\Local\Programs` or either `Program Files` tree; the install is not at any standard path on this machine. The system Node is v24.21.0, which is **not** evidence about the bundled runtime. This must be measured on a machine where the install can be located before L3-4 relies on it.

## Port collision: the proposed rule

The runner binds `127.0.0.1:7777`, and that port is not incidental — it is written into the MCP recipes a visitor pastes into Claude Code and Codex, and into the bearer secret's scope. A runner that silently migrates to another port breaks every pasted recipe and splits state across two instances.

Proposed, for implementation in O8:

1. Probe 7777 before binding.
2. If free, bind and print the URL with its launch token.
3. If occupied, request a runner identity endpoint on it. If the occupant answers as a runner for this library, **do not start a second one**: print "already running" with that URL and exit 0.
4. If the occupant is a stranger, **exit non-zero**, name the port and the owning PID, and say that `--port` is available for a deliberate override. Do not migrate automatically.
5. A deliberate `--port` prints a warning that pasted MCP recipes naming 7777 will not reach this instance, and prints the corrected recipe line.

The principle matches the rest of this spec: fail visibly rather than succeed in a way the visitor cannot see.
