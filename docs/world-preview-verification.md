# Modern world preview verification — 2026-10-04

Scope: `world.html`, its model, generated markup, stylesheet, navigation and selected modern artwork. This is a local preview, not a deployed replacement or a claim that the listed tools are integrated runtimes.

## Art and content

- 18 PNG plates: arrival plus eight rooms, with separate landscape and portrait compositions.
- Landscape 1672 × 941; portrait 941 × 1672. Total selected art: 36,604,208 bytes.
- `world-art-manifest.json` records relative paths, dimensions and SHA-256 hashes. Full generation prompts and selected masters are retained in the task's `outputs/premium-world-modern` directory.
- 23 searchable capability briefs. Gellphant and /dontgaslightme remain separate prominent destinations. Organization-specific names do not appear in public preview content.
- Images were visually inspected for the dominant task, key props, modern materials and character continuity. Generated views are concept art, not exact views of shared editable 3D geometry.

## Automated verification

Run from the repository root:

```powershell
node --test tests/*.test.mjs
git diff --check
```

The suite contains 16 tests: eight existing tour tests and eight modern-world tests. Coverage includes hash handling, motion preferences, capability search, keyboard-focus targets, usable internal destinations, generated/static HTML parity, required content and all eighteen image dimensions/orientations. A separate manifest check recomputes the selected file hashes.

## Browser evidence

Validated using the Codex in-app Chromium browser:

- Desktop at the normal panel size (approximately 1265 × 711), phone portrait 390 × 844, narrow phone 320 × 740, short landscape 844 × 390. No horizontal document overflow observed.
- Phone portrait uses the independently composed portrait; short landscape uses the landscape source. Rotation preserves the current room.
- Gellphant search returns one result; an unknown term returns the empty state; clearing search restores 23 results. A room action reveals its brief even when an earlier filter hid it.
- Keyboard skip activates and focuses main content. Capability actions focus their target brief. Back navigation and explicit room addresses work.
- Reduced-motion emulation disables camera transforms and the motion toggle. The pause control also stops camera movement.
- With JavaScript disabled, all nine scene sections and capability content remain readable; enhancement controls are hidden.
- A deliberately blocked mobile arrival image displays the readable fallback. The block and all test emulation were cleared afterward.
- Reloading during a smooth room jump initially restored the wrong scroll position. Manual scroll restoration for explicit addresses resolved the reproduced failure; reloading an interrupted Gellphant jump lands at Gellphant.

Screenshots are retained in the task's `outputs/premium-world-modern/verification` directory. The desktop arrival and desktop/mobile Gellphant views form the visual review record. This is browser-emulation evidence; physical-device GPU profiling and full assistive-technology certification have not been performed.

## Review findings and disposition

An independent reviewer found no critical issues and two important issues: public source buttons led to GitHub URLs that returned 404 without authentication, and the skip target did not receive keyboard focus. Both were corrected. Main actions now lead to focusable capability briefs; public installation availability is stated explicitly. Maintainer source evidence is retained in `source-access-audit.json` without asserting why the URLs returned 404. A minor mobile error-overlay issue was also fixed and tested by blocking the image.

Three isolated Superdesign layout views were imported for arrival desktop and Gellphant desktop/mobile. Their recorded identifiers are in `.superdesign/resume.json`. The local preview is the functional navigation deliverable.

## Remaining production work

New character films await the user's credit-budget choice; no paid video generation has been submitted. The preview uses gentle scroll-driven movement of still images. Video motion, anatomical stability, loop quality and final performance require review of actual film outputs. Public install/run destinations and deployment are also pending. The original tour, original films and production entry point are unchanged.
