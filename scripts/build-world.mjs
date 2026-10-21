import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ROOMS, CAPABILITIES } from "../world-model.mjs";
import { FLOORS } from "../world-motion.mjs";
import { DEMOS, CAPABILITY_BRIEFS } from "../world-demos.mjs";
import { renderDemo } from "./world-demo-markup.mjs";
import { STATUS, ROOM_STATE } from "../world-readiness.mjs";
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
const navNames = { lobby: 'Find your tool', operations: 'Operations', 'mission-control': 'Mission Control', workshop: 'Workshop', creation: 'Creation Studio', gellphant: 'Gellphant Review', research: 'Research', observatory: 'Observatory' };
const navLabels = {arrival:'Welcome', lobby:'Find tools', operations:'Operations', 'mission-control':'Coordinate', workshop:'Build', creation:'Create', gellphant:'Challenge', research:'Research', observatory:'Observe'};
const symbols = {arrival:'<path d="m4 11 8-7 8 7v9H4Z"/><path d="M9 20v-7h6v7"/>',lobby:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',operations:'<rect x="4" y="6" width="16" height="15" rx="3"/><path d="M8 6V3h8v3M4 12h16M10 12v3h4v-3"/>','mission-control':'<circle cx="12" cy="12" r="3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="12" cy="21" r="2"/><path d="m6 6 4 4m8-4-4 4m-2 5v4"/>',workshop:'<path d="m12 3 9 5-9 5-9-5Zm-9 5v10l9 5 9-5V8M12 13v10"/>',creation:'<path d="M4 4h16v16H4Z M4 15l5-5 5 5 3-3 3 3"/><circle cx="15" cy="8" r="1"/>',gellphant:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z M12 7v6m0 3v1"/>',research:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-45 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(45 12 12)"/>',observatory:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'};
const roomIcon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[id]}</svg>`;
const featureBrief = id => {
  const c = CAPABILITIES.find(item => item.id === id);
  const b = CAPABILITY_BRIEFS[id] ?? {input: c.description, output: c.output, features: [], benefit: c.output};
  return b ? `<details class="cap-details"><summary>Features &amp; readiness <span aria-hidden="true">+</span></summary><div class="brief-content"><dl><dt>You bring</dt><dd>${e(b.input)}</dd><dt>You get</dt><dd>${e(b.output)}</dd></dl><ul>${b.features.map(f=>`<li><strong>${e(f.name)}</strong><span>${e(f.text)}</span></li>`).join('')}</ul><div class="brief-benefit"><strong>Why it helps</strong><p>${e(b.benefit)}</p></div><div class="brief-setup"><strong>Current setup</strong><p><strong>What works today</strong> ${e(c.available)}</p><p><strong>Still being developed</strong> ${e(c.remaining)}</p></div></div></details>` : '';
};
export function renderWorld() {
  const [arrival, ...rooms] = ROOMS;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>OpenMeow — Tools for work you can inspect</title>
<meta name="description" content="Explore a world of agents, skills and workflows. Create with /dontgaslightme, question with Gellphant, coordinate with Subtle Lasagne.">
<link rel="canonical" href="https://openmeow.io/"><meta name="theme-color" content="#f3f4f0">
<link rel="icon" href="cat.webp" type="image/webp">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="world.css">
<link rel="stylesheet" href="world-scroll.css">
<link rel="stylesheet" href="world-demos.css">
<link rel="stylesheet" href="world-studio.css">
</head>
<body>
<a class="skip" href="#main">Skip to the world</a>
<header class="site-header">
<a class="brand" href="#arrival" aria-label="OpenMeow home"><img src="cat.webp" width="44" height="44" alt=""><span>Open<span class="brand-meow">Meow</span><span class="brand-dot">.</span></span></a>
<span class="preview-label" id="journey-location">Explore tools & readiness</span>
<div class="header-actions"><a href="#directory" aria-label="Find a capability"><span class="find-long">Find a capability</span><span class="find-short" aria-hidden="true">Find tools</span> <span aria-hidden="true">↗</span></a><button id="motion-toggle" type="button" hidden aria-pressed="false">Pause motion</button></div>
</header>
<div class="journey-progress" aria-hidden="true"><span></span></div>
<nav class="room-nav" aria-label="Rooms in the OpenMeow world">
<span class="nav-heading">Your workspace</span>
<button class="building-toggle" id="building-toggle" type="button" aria-haspopup="dialog" aria-label="Open building map" aria-controls="building-map" hidden><span class="floor-icon" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><span><span class="map-long">Building map</span><span class="map-short">Map</span> <span id="floor-readout">↗</span></span></button>
${ROOMS.map((r, i) => `${({arrival:'Explore',operations:'Make things happen',gellphant:'Check the work'})[r.id] ? `<span class="nav-group">${({arrival:'Explore',operations:'Make things happen',gellphant:'Check the work'})[r.id]}</span>` : ''}<a href="#${r.id}" data-room="${r.id}"${i === 0 ? ' aria-current="location"' : ""}><span class="room-symbol">${roomIcon(r.id)}</span><span>${e(navLabels[r.id])}</span><span class="nav-arrow" aria-hidden="true">↗</span></a>`).join("")}
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
<div class="arrival-copy"><p class="eyebrow"><span class="status-dot"></span> Agents · Skills · Workflows</p><h1 id="arrival-title">Put your agents<br>to useful work.</h1><p class="intro">Make something. Move it forward. Check the work. Find the agents and tools for your next step.</p><a class="primary-link" href="#lobby">Explore the tools <span aria-hidden="true">↓</span></a><p class="readiness-intro">Working components · Tested pilots · In development</p><div class="arrival-routes"><a href="#mission-control">Subtle Lasagne ↗</a><a href="#creation">/dontgaslightme ↗</a><a href="#gellphant">Gellphant ↗</a><a href="#operations">FundMeMeow ↗</a></div></div>
<div class="arrival-footer"><span>A studio for useful work</span><span class="scroll-invitation"><i aria-hidden="true"></i> Scroll to enter the world ↓</span></div>
</section>
${rooms
  .map(
    (
      r,
      i,
    ) => `<section id="${r.id}" class="room scene-section ${r.id === "observatory" ? "night" : ""}" aria-labelledby="${r.id}-title" tabindex="-1"><div class="room-stage">
<div class="room-heading"><span class="room-symbol">${roomIcon(r.id)}</span><span>${e(r.name)}</span></div>
<div class="room-body"><div class="room-copy"><p class="product-name">${e(DEMOS[r.id].product)}</p><h2 id="${r.id}-title">${e(DEMOS[r.id].headline)}</h2><p class="product-summary">${e(DEMOS[r.id].summary)}</p><a class="room-tool-link" href="#tools-${r.id}">Explore tools ↗</a><div class="room-features"><p class="feature-label">What you can do</p><ul>${DEMOS[r.id].features.map(f=>`<li><details><summary>${e(f.name)}</summary><p>${e(f.text)}</p></details></li>`).join('')}</ul></div><div class="room-benefit"><span>Why it helps</span><p>${e(DEMOS[r.id].benefit)}</p></div><a class="text-link" href="${r.href}"${external(r.href)}>${e(r.anchor)} <span aria-hidden="true">↗</span></a><details class="room-readiness"><summary>What works today <span aria-hidden="true">+</span></summary><p><strong>What works today</strong>${e(ROOM_STATE[r.id][0])}</p><p><strong>Still being developed</strong>${e(ROOM_STATE[r.id][1])}</p></details></div>
<div class="room-visual">${sceneArt(r, 'compact-room-art')}${renderDemo(r.id, sceneArt(r, 'demo-room-context'))}</div></div>
<div class="room-exit"><span class="room-scroll-note" aria-hidden="true">Scroll to see the work unfold <span>↓</span></span>
<a class="next-room" href="#${rooms[i + 1]?.id ?? "directory"}">${rooms[i + 1] ? "Next · " + e(rooms[i + 1].name) : "Explore the capability index"} <span aria-hidden="true">↓</span></a>
</div></div></section>`,
  )
  .join("")}
<section class="shared-layers" aria-labelledby="shared-title"><p class="eyebrow">Across every room</p><h2 id="shared-title">Keep the context.<br>Keep the evidence.</h2><p>These layers connect the work, wherever you start.</p><div class="shared-grid"><a href="#cap-24"><strong>Continuity</strong><span>Find past operations and check for changed context.</span></a><a href="#cap-15"><strong>Gellphant evidence</strong><span>Compare what an agent claims with what was recorded.</span></a><a href="#cap-23"><strong>Run Ledger</strong><span>Find the run, its machine and its saved outputs.</span></a><a href="#cap-20"><strong>Portable Handoffs</strong><span>Carry files and next steps into another session.</span></a></div></section>
<section id="directory" class="directory" aria-labelledby="directory-title" tabindex="-1">
<div class="directory-intro"><p class="eyebrow">Choose your own route</p><h2 id="directory-title">What are you<br>working on?</h2><p>Choose by outcome, then check the implementation status. Working components require their own setup; this website does not launch them. Public installation links are not available yet.</p></div>
<div class="status-guide">${Object.entries(STATUS).map(([key,s])=>`<div><span class="cap-status" data-stage="${key}">${e(s.label)}</span><p>${e(s.meaning)}</p></div>`).join('')}</div><p class="catalog-date">Readiness reviewed October 19, 2026. Recorded tests describe a specific scope; they are not a guarantee of production readiness.</p><div class="search-control" hidden><label for="capability-search">Search capabilities</label><input id="capability-search" type="search" placeholder="Try presentations, funding or review…" autocomplete="off"><div class="catalog-filters"><label>Status<select id="status-filter"><option value="">All stages</option>${Object.entries(STATUS).map(([key,s])=>`<option value="${key}">${e(s.label)}</option>`).join('')}</select></label><label>Room<select id="room-filter"><option value="">All rooms</option>${rooms.map(r=>`<option value="${r.id}">${e(navNames[r.id])}</option>`).join('')}</select></label></div><p id="search-status" role="status">${CAPABILITIES.length} capabilities</p></div>
<div class="capability-list">
${rooms.filter(r => CAPABILITIES.some(c=>c.room===r.id)).map(r=>`<section class="room-catalog" id="tools-${r.id}" aria-labelledby="tools-${r.id}-title"><h3 id="tools-${r.id}-title">${e(navNames[r.id])}</h3>${CAPABILITIES.filter(c=>c.room===r.id).map(c=>`<article id="${c.id}" tabindex="-1" class="capability" data-capability="${c.id}"><div><p class="cap-type">${e(c.type)}</p><h4>${e(c.name)}</h4></div><div class="cap-description"><p>${e(c.description)}</p><p class="tool-output"><strong>You get</strong> ${e(c.output)}</p></div><div class="cap-action"><span class="cap-status" data-stage="${c.stage}">${e(c.status)}</span><a href="#${c.room}">Visit room ↗</a></div>${featureBrief(c.id)}</article>`).join('')}</section>`).join('')}

<p id="search-empty" hidden>No matching capabilities. Try a broader word such as “review” or “workflow”.</p>
</div>
</section>
<footer class="site-footer"><a class="brand" href="#arrival">Open<span class="brand-meow">Meow</span>.</a><p>Useful tools. Work you can inspect.</p><p class="preview-note">Demonstrations use synthetic examples and are not connected product sessions. Character films for the new rooms are in production planning.</p><div><a href="film.html">Original film tour</a><a href="#directory">Capability index ↗</a><a href="#arrival">Back to the top ↑</a></div></footer>
</main>
<script type="module" src="world.mjs"></script>
</body></html>`;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = renderWorld();
  await Promise.all(['world.html', 'index.html'].map(name =>
    writeFile(new URL('../' + name, import.meta.url), html)));
}
