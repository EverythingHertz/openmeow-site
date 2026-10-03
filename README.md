# OpenMeow Observatory

The static site at openmeow.io is published by GitHub Pages from `main`.
`index.html` and the previously shared `scroll2.html` use the same tour.

## Responsive tour

- Narrow screens, touch devices and data-saving connections use a scroll-driven
  image world: native scrolling, layered crossfades and camera movement. The eight
  portrait images total 548,302 bytes. No video element is created in this mode.
- Desktop uses 1280 × 720 H.264 clips with a keyframe every six frames. Only the
  current and next video are retained. Native range requests replace full-file
  blob downloads. The seven clips total 23,113,935 bytes (previously 76,949,780).
- Orientation changes select matching portrait or landscape images and preserve
  progress. The scroll renderer sleeps when idle or when the page is hidden.
- Reduced motion or unavailable JavaScript presents a readable illustrated tour.
  Unavailable videos fall back to the corresponding image world.

The optimized assets in `media/` derive from the original Observatory artwork and
videos. They are served from the site itself. Update these in place with care;
use new filenames for future asset revisions to avoid stale browser caches.

## Verify

Run `node --test tests/tour.test.mjs` and `node --check tour.mjs` (Node 18+).
Use a static HTTP server with byte-range support for video testing.

Check phone portrait/landscape, tablet with touch input, desktop, backward chapter
navigation, reduced motion, unavailable video, and JavaScript disabled. Confirm
that phone loads make no `.mp4` requests, buttons remain reachable, the scroll
position survives rotation, and animation work stops after scrolling settles.
