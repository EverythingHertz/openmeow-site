# openmeow.io

The OpenMeow teaser site: a scroll-driven tour of the Observatory tower, served by GitHub Pages at [openmeow.io](https://openmeow.io) (see `CNAME`).

**See your agents work.** OpenMeow is open-source observability for AI agents.

## Structure

- `index.html` — the whole site. Scroll-scrubbed tower videos, copy cards, finale with email capture and GitHub link, and a static `#about` section after the tour.
- `scroll.html`, `scroll2.html`, `preview.html` — earlier prototypes, not served.
- `*.webp` cat portraits — the finale parade characters.
- `scripts/mirror-media.sh` — mirrors the tour media out of the third-party CDN bucket (see below).

## Configuration

The `OPENMEOW` object at the top of the first `<script>` in `index.html` gates every account-dependent feature. Each value is a single string; empty means the feature stays hidden or on its default.

| Key | Turns on | Example |
|---|---|---|
| `githubUrl` | The "Star on GitHub" buttons (finale + about) | `https://github.com/openmeow-ai/openmeow` once the repo is public |
| `formAction` | The email-capture forms (finale + about) | Buttondown: `https://buttondown.com/api/emails/embed-subscribe/<username>` |
| `plausibleDomain` | Plausible analytics with goals: Tour Started, Finale Reached, Email Signup, GitHub Click | `openmeow.io` |
| `cdnBase` | Where tour media loads from | `media/` after running the mirror script |

## Media risk

All tour videos and stills currently load from a Higgsfield user-content CloudFront bucket that we do not control. Run `scripts/mirror-media.sh` on a machine with open egress, review the size, then either commit `media/` or upload it to a bucket you own and point `cdnBase` at it.

## Deploying

GitHub Pages serves the default branch. Merging to it deploys.
