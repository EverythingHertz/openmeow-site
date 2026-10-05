import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ROOMS, CAPABILITIES } from "../world-model.mjs";
import { FLOORS } from "../world-motion.mjs";
import { DEMOS, CAPABILITY_BRIEFS } from "../world-demos.mjs";
import { renderDemo } from "./world-demo-markup.mjs";
const e = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const picture = (r, hero = false) =>
  `<picture><source media="(max-width: 700px) and (orientation: portrait)" srcset="${r.portrait}" width="941" height="1672"><img src="${r.landscape}" width="1672" height="941" alt="${e(r.alt)}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
const external = (href) =>
  href.startsWith("https:") ? ' target="_blank" rel="noopener noreferrer"' : "";
const sceneArt = (r, cls = '') => `<div class="scene-art ${cls}">${picture(r)}<div class="window-frame" aria-hidden="true"></div><div class="scene-label" aria-hidden="true">${e(r.name)} <span>${e(r.floor.split(' · ')[0])}</span></div></div>`;
const navNames = { lobby: 'Find your tool', operations: 'FundMeMeow & Ops', 'mission-control': 'Subtle Lasagne', workshop: 'Agent Mint & skills', creation: '/dontgaslightme', gellphant: 'Gellphant', research: 'Research & memory', observatory: 'Agent observatory' };
const featureBrief = id => {
  const b = CAPABILITY_BRIEFS[id];
  return b ? `<details class="cap-details"><summary>Features, output &amp; setup <span aria-hidden="true">+</span></summary><div class="brief-content"><dl><dt>You bring</dt><dd>${e(b.input)}</dd><dt>You get</dt><dd>${e(b.output)}</dd></dl><ul>${b.features.map(f=>`<li><strong>${e(f.name)}</strong><span>${e(f.text)}</span></li>`).join('')}</ul><div class="brief-benefit"><strong>Why it helps</strong><p>${e(b.benefit)}</p></div><p class="brief-setup"><strong>Current setup</strong> ${e(b.setup)}</p></div></details>` : '';
};
export function renderWorld() {
  const [arrival, ...rooms] = ROOMS;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>OpenMeow — Tools for work you can inspect</title>
<meta name="description" content="Explore a world of agents, skills and workflows. Create with /dontgaslightme, question with Gellphant, coordinate with Subtle Lasagne.">
<meta name="robots" content="noindex"><meta name="theme-color" content="#f3f4f0">
<link rel="icon" href="cat.webp" type="image/webp">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="world.css">
<link rel="stylesheet" href="world-scroll.css">
<link rel="stylesheet" href="world-demos.css">
</head>
<body>
<a class="skip" href="#main">Skip to the world</a>
<header class="site-header">
<a class="brand" href="#arrival" aria-label="OpenMeow home"><img src="cat.webp" width="44" height="44" alt=""><span>Open<span class="brand-meow">Meow</span><span class="brand-dot">.</span></span></a>
<span class="preview-label" id="journey-location">A world in the making</span>
<div class="header-actions"><a href="#directory" aria-label="Find a capability"><span class="find-long">Find a capability</span><span class="find-short" aria-hidden="true">Find tools</span> <span aria-hidden="true">↗</span></a><button id="motion-toggle" type="button" hidden aria-pressed="false">Pause motion</button></div>
</header>
<div class="journey-progress" aria-hidden="true"><span></span></div>
<nav class="room-nav" aria-label="Rooms in the OpenMeow world">
<span class="nav-heading">The building</span>
<button class="building-toggle" id="building-toggle" type="button" aria-haspopup="dialog" aria-label="Open building map" aria-controls="building-map" hidden><span class="floor-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span><span class="map-long">Building map</span><span class="map-short">Map</span> <span id="floor-readout">↗</span></span></button>
${ROOMS.map((r, i) => `<a href="#${r.id}" data-room="${r.id}"${i === 0 ? ' aria-current="location"' : ""}><span class="nav-number">${i === 0 ? "◇" : String(i).padStart(2, "0")}</span><span>${e(i === 0 ? "Welcome" : navNames[r.id])}</span></a>`).join("")}
</nav>
<dialog id="building-map" aria-labelledby="map-title">
<div class="map-header"><div><p class="eyebrow">One connected world</p><h2 id="map-title">Choose a floor.</h2></div><button id="map-close" type="button" aria-label="Close building map" autofocus>Close <span aria-hidden="true">×</span></button></div>
<div class="map-body"><div class="map-elevation"><div class="map-building"><img data-src="${arrival.landscape}" width="1672" height="941" alt="The OpenMeow building, with its six levels from ground to rooftop."><div class="map-floor-light" aria-hidden="true"></div></div><p class="map-caption">Eight rooms. Take your own route.</p></div><div class="map-stops">${[
    ...FLOORS,
  ]
    .reverse()
    .map(
      (f) =>
        `<div class="map-stop" data-floor="${f.code}"><span class="stop-code">${f.code}</span><div><p>${e(f.title)}</p>${f.rooms.map((id) => `<a href="#${id}">${e(ROOMS.find((r) => r.id === id).name)} <span aria-hidden="true">↗</span></a>`).join("")}</div></div>`,
    )
    .join("")}</div></div>
</dialog>
<main id="main" tabindex="-1">
<section id="arrival" class="arrival scene-section" aria-labelledby="arrival-title" tabindex="-1">
<div class="arrival-art scene-art">${picture(arrival, true)}</div>
<div class="arrival-copy"><p class="eyebrow"><span class="status-dot"></span> Agents · Skills · Workflows</p><h1 id="arrival-title">Put your agents<br>to useful work.</h1><p class="intro">Coordinate a team. Create editable slides. Challenge confident answers. Find the next funding move. Explore the tools and see how they work.</p><a class="primary-link" href="#lobby">Explore the tools <span aria-hidden="true">↓</span></a><div class="arrival-routes"><a href="#mission-control">Subtle Lasagne ↗</a><a href="#creation">/dontgaslightme ↗</a><a href="#gellphant">Gellphant ↗</a><a href="#operations">FundMeMeow ↗</a></div></div>
<div class="arrival-footer"><span>08 rooms · One connected world</span><span class="scroll-invitation"><i aria-hidden="true"></i> Scroll to enter the world ↓</span></div>
</section>
${rooms
  .map(
    (
      r,
      i,
    ) => `<section id="${r.id}" class="room scene-section ${r.id === "observatory" ? "night" : ""}" aria-labelledby="${r.id}-title" tabindex="-1"><div class="room-stage">
<div class="room-heading"><p class="eyebrow">${e(r.floor)}</p><span>${e(r.name)}</span><span class="room-count">${String(i + 1).padStart(2, "0")} / 08</span></div>
<div class="room-body"><div class="room-copy"><p class="product-name">${e(DEMOS[r.id].product)}</p><h2 id="${r.id}-title">${e(DEMOS[r.id].headline)}</h2><p class="product-summary">${e(DEMOS[r.id].summary)}</p><div class="room-features"><p class="feature-label">What you can do</p><ul>${DEMOS[r.id].features.map(f=>`<li><strong>${e(f.name)}</strong><span>${e(f.text)}</span></li>`).join('')}</ul></div><div class="room-benefit"><span>Why it helps</span><p>${e(DEMOS[r.id].benefit)}</p></div><a class="text-link" href="${r.href}"${external(r.href)}>${e(r.anchor)} <span aria-hidden="true">↗</span></a>${r.tag ? `<p class="availability">${e(r.tag)}</p>` : ""}</div>
<div class="room-visual">${sceneArt(r, 'compact-room-art')}${renderDemo(r.id, sceneArt(r, 'demo-room-context'))}</div></div>
<div class="room-exit"><span class="room-scroll-note" aria-hidden="true">Scroll to see the work unfold <span>↓</span></span>
<a class="next-room" href="#${rooms[i + 1]?.id ?? "directory"}">${rooms[i + 1] ? "Next · " + e(rooms[i + 1].name) : "Explore the capability index"} <span aria-hidden="true">↓</span></a>
</div></div></section>`,
  )
  .join("")}
<section id="directory" class="directory" aria-labelledby="directory-title" tabindex="-1">
<div class="directory-intro"><p class="eyebrow">Choose your own route</p><h2 id="directory-title">What are you<br>working on?</h2><p>Read what each tool does, what you bring, what you get and why it helps. These source projects and local tools are being prepared for broader adoption; public installation links are not available yet.</p></div>
<div class="search-control" hidden><label for="capability-search">Search capabilities</label><input id="capability-search" type="search" placeholder="Try presentations, funding or review…" autocomplete="off"><p id="search-status" role="status">${CAPABILITIES.length} capabilities</p></div>
<div class="capability-list">
${CAPABILITIES.map((c) => `<article id="${c.id}" tabindex="-1" class="capability" data-capability="${c.id}"><div><p class="cap-type">${e(c.type)}</p><h3>${e(c.name)}</h3></div><p class="cap-description">${e(c.description)}</p><div class="cap-action"><span class="cap-status">${e(c.status)}</span><a href="${c.href ?? "#" + c.room}"${external(c.href ?? "")} aria-label="${c.href ? "View " + e(c.name) + " source project" : "Visit " + e(c.name) + " room"}">${c.href ? "View source" : "Visit room"} ↗</a></div>${featureBrief(c.id)}</article>`).join("")}
<p id="search-empty" hidden>No matching capabilities. Try a broader word such as “review” or “workflow”.</p>
</div>
</section>
<footer class="site-footer"><a class="brand" href="#arrival">Open<span class="brand-meow">Meow</span>.</a><p>Useful tools. Work you can inspect.</p><p class="preview-note">World preview · Demonstrations use synthetic examples and are not connected product sessions. Character films are in production planning.</p><div><a href="index.html">Original film tour</a><a href="#directory">Capability index ↗</a><a href="#arrival">Back to the top ↑</a></div></footer>
</main>
<script type="module" src="world.mjs"></script>
</body></html>`;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  await writeFile(new URL("../world.html", import.meta.url), renderWorld());
