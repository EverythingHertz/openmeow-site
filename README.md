# OpenMeow Observatory

The static site at openmeow.io is published by GitHub Pages from `main`.
`index.html` and `world.html` serve the room navigator and capability directory.
The original full-resolution video tour remains at `film.html` and `scroll2.html`.
Run `node scripts/build-world.mjs` to regenerate both navigator entrypoints and
`node --test tests/*.test.mjs` to verify the site.

## Responsive tour

- Phones and desktop both use the complete original video sequences. Portrait
  clips retain 1080 × 1920 resolution; landscape clips retain 1920 × 1080. The
  vault shares the original landscape video in both layouts.
- H.264 encodes preserve the source frame rate and use CRF 17 with a keyframe
  every eight frames for accurate seeking. Only the current and next video are
  retained. Native range requests replace full-file blob downloads.
- Orientation changes select matching portrait or landscape videos and preserve
  progress. The scroll renderer sleeps when idle or when the page is hidden.
- Reduced motion or unavailable JavaScript presents a readable illustrated tour.
  Unavailable videos fall back to the corresponding image world. Explicit
  browser data-saving preferences also select the lightweight image world.

The optimized assets in `media/` derive from the original Observatory artwork and
videos. They are served from the site itself. Update these in place with care;
use new filenames for future asset revisions to avoid stale browser caches.

## Verify

Run `node --test tests/tour.test.mjs` and `node --check tour.mjs` (Node 18+).
Use a static HTTP server with byte-range support for video testing.

Check phone portrait/landscape, tablet with touch input, desktop, backward chapter
navigation, reduced motion, unavailable video, and JavaScript disabled. Confirm
that phone loads use portrait videos, buttons remain reachable, the scroll
position survives rotation, and animation work stops after scrolling settles.

## Local slide board

The board v0 is a separate, authenticated loopback server and requires Node 24+
for `node:sqlite`. It is not an MCP connection or a hosted slide service.

```powershell
node runner\slides\serve.mjs --port 7777 --data C:\path\to\board-data --corpus deck-studio=C:\path\to\decks --corpus system-02=C:\path\to\package --corpus dist-cards=C:\path\to\package
```

Open the `open-board.html` file printed by the server, or paste the launch key
from the printed key file into the sign-in form. Never put the key in a URL.
Use a private data directory for each running board. Its launch credentials,
index, thumbnail cache, and iteration copies live there, not in the source
corpora. The default corpus paths are this project's local examples; override
all three when using another collection. Missing corpora are labelled `HELD`.

An occupied port fails before changing board data. `--port 0` asks the OS for
an available port, which is printed along with the launch instructions.
Iteration requests accept only an `instruction` string, up to 500 characters.
Corrupt iteration history stops the request and reports an error; it is not
silently treated as empty history.

Run the isolated board checks with:

```powershell
node --test tests\slides-serve.test.mjs tests\slides-iterations.test.mjs tests\slides-ui.test.mjs
```

The server checks use synthetic local files and OS-assigned ports. No existing
board or real slide corpus is required. Reader tests also include optional
smoke checks when the machine-local example corpora exist.

See the [integration reconciliation](docs/superpowers/specs/2026-11-02-integration-reconciliation.md)
for verified implementation boundaries, discovery reuse, and the proposed
apprenticeship protocol. Live terminal takeover is not implemented.
