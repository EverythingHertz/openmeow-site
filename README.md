# OpenMeow Observatory

The static site at openmeow.io is published by GitHub Pages from `main`.
`index.html` and the previously shared `scroll2.html` use the same tour.

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
