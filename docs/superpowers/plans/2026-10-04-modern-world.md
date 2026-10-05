# Modern OpenMeow world implementation
Date: 2026-10-04
Goal: Build the approved modern miniature world as a complete responsive, reviewable preview.
Architecture: Separate static world.html with ordinary document scrolling, portrait/landscape picture sources, progressively enhanced navigation and restrained camera motion.
Tech stack: semantic HTML, CSS, browser ES modules, Node test runner, native image generation.
Spec: ../specs/2026-10-04-room-scene-content-brief.md

## Global constraints
Use the approved orange Norwegian Forest cat cast and contemporary office benchmark. Eight rooms plus arrival, 18 plates. Keep Gellphant and /dontgaslightme distinct. Generalizable public content; no private entity names. Keep current published tour and its full-quality motion intact. No publishing, unverified runtime claims or invented live data. Preview camera motion must not be described as completed character films.

## Review focus
Mobile portrait and short landscape layouts; keyboard room navigation; direct hashes/back navigation; reduced-motion and pause behavior; blank/error images; source-link honesty; accidental load of all large plates; no changes to index or existing film files.

## Task 1: Complete the artwork
Files: media/world/*, docs/world-art-manifest.json, outputs/premium-world-modern/*
Interface: one landscape and portrait image for arrival and each of eight room IDs.
Generate content-specific landscapes from the approved benchmark, inspect, then recompose portraits. Preserve full PNG masters and prompt/provenance. Verify 18 real nonzero images and aspect ratios. Save a motion shot brief for each room.

## Task 2: Build the responsive world
Files: world.html, world.css, world.mjs, world-model.mjs, tests/world.test.mjs
Interface: room IDs from manifest match section IDs and navigation hashes.
Write behavior tests and observe failures, then implement. Native scrolling is always available. Each room exposes its purpose, actual project/source links and readiness. Semantic links and all copy work without JavaScript. Mobile art/copy are separate to avoid obscuring the action. Motion controls are progressive enhancement; no automated animation for reduced-motion preference.

## Task 3: Review and package
Run the full Node test suite. Open desktop/mobile review surfaces and exercise room navigation and motion controls. Verify original tour files unchanged. Import a reviewable design into Superdesign using only selected public artwork. Obtain one independent code review; resolve important findings. Save verification and generation inventory. Leave new films and publication explicitly pending if absent; do not substitute compressed or fabricated video.

