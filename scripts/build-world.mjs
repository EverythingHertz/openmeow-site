import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ROOMS, CAPABILITIES } from "../world-model.mjs";
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
export function renderWorld() {
  const [arrival, ...rooms] = ROOMS;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>OpenMeow — A world of capable company</title>
<meta name="description" content="Explore a world of agents, skills and workflows. Create with /dontgaslightme, question with Gellphant, coordinate with Subtle Lasagne.">
<meta name="robots" content="noindex"><meta name="theme-color" content="#f3f4f0">
<link rel="icon" href="cat.webp" type="image/webp">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="world.css">
</head>
<body>
<a class="skip" href="#main">Skip to the world</a>
<header class="site-header">
<a class="brand" href="#arrival" aria-label="OpenMeow home"><img src="cat.webp" width="44" height="44" alt=""><span>Open<span class="brand-meow">Meow</span><span class="brand-dot">.</span></span></a>
<span class="preview-label">A world in the making</span>
<div class="header-actions"><a href="#directory">Find a capability <span aria-hidden="true">↗</span></a><button id="motion-toggle" type="button" hidden aria-pressed="false">Pause motion</button></div>
</header>
<nav class="room-nav" aria-label="Rooms in the OpenMeow world">
<span class="nav-heading">The building</span>
${ROOMS.map((r, i) => `<a href="#${r.id}" data-room="${r.id}"${i === 0 ? ' aria-current="location"' : ""}><span class="nav-number">${i === 0 ? "◇" : String(i).padStart(2, "0")}</span><span>${e(i === 0 ? "Welcome" : r.name)}</span></a>`).join("")}
</nav>
<main id="main">
<section id="arrival" class="arrival scene-section" aria-labelledby="arrival-title" tabindex="-1">
<div class="arrival-art scene-art">${picture(arrival, true)}</div>
<div class="arrival-copy"><p class="eyebrow"><span class="status-dot"></span> Agents. Skills. Possibilities.</p><h1 id="arrival-title">Big ideas.<br>Capable company.</h1><p class="intro">A world of tools that help you make, coordinate, question and move forward. Come meet the residents.</p><a class="primary-link" href="#lobby">Step inside <span aria-hidden="true">↓</span></a></div>
<div class="arrival-footer"><span>08 rooms · One connected world</span><span>Explore at your own pace ↓</span></div>
</section>
${rooms
  .map(
    (
      r,
      i,
    ) => `<section id="${r.id}" class="room scene-section ${r.id === "observatory" ? "night" : ""}" aria-labelledby="${r.id}-title" tabindex="-1">
<div class="room-heading"><p class="eyebrow">${e(r.floor)}</p><span>${e(r.name)}</span><span class="room-count">${String(i + 1).padStart(2, "0")} / 08</span></div>
<div class="room-body"><div class="room-copy"><h2 id="${r.id}-title">${e(r.verb)}</h2><p>${e(r.body)}</p><a class="text-link" href="${r.href}"${external(r.href)}>${e(r.anchor)} <span aria-hidden="true">↗</span></a>${r.tag ? `<p class="availability">${e(r.tag)}</p>` : ""}</div>
<div class="room-visual"><div class="scene-art">${picture(r)}</div><ol class="room-flow" aria-label="From input to outcome">${r.flow.map((s, j) => `<li><span>${String(j + 1).padStart(2, "0")}</span>${e(s)}</li>`).join("")}</ol></div></div>
<a class="next-room" href="#${rooms[i + 1]?.id ?? "directory"}">${rooms[i + 1] ? "Next · " + e(rooms[i + 1].name) : "Explore the capability index"} <span aria-hidden="true">↓</span></a>
</section>`,
  )
  .join("")}
<section id="directory" class="directory" aria-labelledby="directory-title" tabindex="-1">
<div class="directory-intro"><p class="eyebrow">Choose your own route</p><h2 id="directory-title">What are you<br>working on?</h2><p>Products, reusable components and emerging workflows. Explore a source project or visit its room to see where it fits.</p></div>
<div class="search-control" hidden><label for="capability-search">Search capabilities</label><input id="capability-search" type="search" placeholder="Try presentations, funding or review…" autocomplete="off"><p id="search-status" role="status">${CAPABILITIES.length} capabilities</p></div>
<div class="capability-list">
${CAPABILITIES.map((c) => `<article class="capability" data-capability="${c.id}"><div><p class="cap-type">${e(c.type)}</p><h3>${e(c.name)}</h3></div><p class="cap-description">${e(c.description)}</p><div class="cap-action"><span class="cap-status">${e(c.status)}</span><a href="${c.href ?? "#" + c.room}"${external(c.href ?? "")} aria-label="${c.href ? "View " + e(c.name) + " source project" : "Visit " + e(c.name) + " room"}">${c.href ? "View source" : "Visit room"} ↗</a></div></article>`).join("")}
<p id="search-empty" hidden>No matching capabilities. Try a broader word such as “review” or “workflow”.</p>
</div>
</section>
<footer class="site-footer"><a class="brand" href="#arrival">Open<span class="brand-meow">Meow</span>.</a><p>Independent tools. Shared curiosity.</p><p class="preview-note">World preview · Illustrative scenes. New character films are in production planning.</p><div><a href="index.html">Original film tour</a><a href="https://github.com/EverythingHertz/openmeow" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="#arrival">Back to the top ↑</a></div></footer>
</main>
<script type="module" src="world.mjs"></script>
</body></html>`;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  await writeFile(new URL("../world.html", import.meta.url), renderWorld());
