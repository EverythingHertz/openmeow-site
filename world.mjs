import {
  ROOMS,
  roomFromHash,
  motionEnabled,
  searchCapabilities,
} from "./world-model.mjs";
import {
  FLOORS,
  sceneProgress,
  cameraPose,
  storyBeat,
} from "./world-motion.mjs";

const sections = ROOMS.map((room) => document.getElementById(room.id));
const navLinks = [...document.querySelectorAll("[data-room]")];
const scenes = sections.map((section) => ({
  section,
  stage: section.querySelector(".room-stage"),
  art: section.querySelector(".scene-art"),
  image: section.querySelector(".scene-art img"),
  beats: [...section.querySelectorAll(".room-flow li")],
}));
const map = document.getElementById("building-map");
const mapToggle = document.getElementById("building-toggle");
const floorIcons = [...document.querySelectorAll(".floor-icon i")];
let topInset = 90;
let navNeedsCenter = true;
// Explicit room addresses own their scroll position, including interrupted jumps.
if (location.hash) history.scrollRestoration = "manual";
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const button = document.getElementById("motion-toggle");
let paused = false,
  frame = 0,
  current = "arrival";
try {
  paused = sessionStorage.getItem("openmeow-world-paused") === "true";
} catch {
  /* Preferences remain usable when storage is unavailable. */
}
const enabled = () => motionEnabled({ reduced: motionQuery.matches, paused });
function updateButton() {
  button.hidden = false;
  button.disabled = motionQuery.matches;
  button.textContent = motionQuery.matches
    ? "Motion reduced"
    : paused
      ? "Resume motion"
      : "Pause motion";
  button.setAttribute("aria-pressed", String(paused));
  button.title = motionQuery.matches
    ? "Your device requests reduced motion"
    : "Toggle scroll-driven camera movement";
  document.documentElement.dataset.motion = enabled() ? "on" : "off";
}
function refreshLayout({ preserve = false } = {}) {
  navNeedsCenter = true;
  const directory = document.getElementById("directory");
  const scene = scenes.find((s) => s.section.id === current);
  const anchor =
    directory.getBoundingClientRect().top < innerHeight * 0.42
      ? directory
      : (scene.stage ?? scene.section);
  const before = anchor.getBoundingClientRect().top;
  let changed = false;
  topInset =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header"),
    ) + 12;
  // Pin only a complete stage that fits. Tall text and short displays stay native.
  for (const scene of scenes)
    if (scene.stage) {
      scene.section.style.setProperty(
        "--stage-height",
        scene.stage.offsetHeight + "px",
      );
      const pin =
        innerWidth > 900 &&
        !motionQuery.matches &&
        scene.stage.offsetHeight <= innerHeight - topInset + 1;
      changed ||= scene.section.classList.contains("is-pinned") !== pin;
      scene.section.classList.toggle("is-pinned", pin);
    }
  if (preserve && changed && scrollY > 0)
    scrollBy({
      top: anchor.getBoundingClientRect().top - before,
      behavior: "instant",
    });
  wake();
}
function showFloor(floor) {
  map.style.setProperty("--floor-y", floor.y);
  for (const stop of map.querySelectorAll("[data-floor]"))
    stop.classList.toggle("is-current", stop.dataset.floor === floor.code);
}
function render() {
  frame = 0;
  const readingLine = innerHeight * 0.42;
  let nearest = sections[0],
    distance = Infinity;
  // Collect geometry before style writes; no perpetual animation loop.
  const measured = scenes.map((scene) => ({
    ...scene,
    rect: scene.section.getBoundingClientRect(),
    artRect: scene.art.getBoundingClientRect(),
    stageHeight: scene.stage?.offsetHeight ?? 0,
  }));
  let activeProgress = 0;
  for (const {
    section,
    rect,
    artRect,
    image,
    beats,
    stageHeight,
  } of measured) {
    const pinned = section.classList.contains("is-pinned");
    const p = sceneProgress({
      top: pinned ? rect.top : artRect.top,
      height: pinned ? rect.height : artRect.height,
      viewport: innerHeight,
      topInset,
      pinnedHeight: pinned ? stageHeight : 0,
    });
    const d =
      rect.top <= readingLine && rect.bottom > readingLine
        ? 0
        : Math.abs(rect.top - readingLine);
    if (d < distance) {
      nearest = section;
      distance = d;
      activeProgress = p;
    }
    if (image) {
      const pose = cameraPose(p, {
        compact: innerWidth <= 900,
        enabled: enabled() && rect.bottom > 0 && rect.top < innerHeight,
      });
      image.style.setProperty("--camera", pose.scale);
      image.style.setProperty("--camera-x", pose.x + "%");
      image.style.setProperty("--camera-y", pose.y + "%");
    }
    for (const [i, beat] of beats.entries()) {
      beat.classList.toggle("is-current", i === storyBeat(p));
      beat.style.setProperty(
        "--beat-fill",
        Math.max(0, Math.min(1, p * 3 - i)),
      );
    }
  }
  const index = sections.indexOf(nearest);
  document.documentElement.style.setProperty(
    "--journey",
    index ? Math.min(1, (index - 1 + activeProgress) / 8) : 0,
  );
  if (current !== nearest.id || navNeedsCenter) {
    navNeedsCenter = false;
    current = nearest.id;
    for (const link of navLinks) {
      if (link.dataset.room === current)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    const active = navLinks.find((link) => link.dataset.room === current);
    const nav = active?.parentElement;
    if (nav && nav.scrollWidth > nav.clientWidth) {
      const reserved = innerWidth <= 900 ? mapToggle.offsetWidth : 0;
      const left =
        active.offsetLeft -
        (nav.clientWidth + reserved - active.offsetWidth) / 2;
      nav.scrollTo({ left, behavior: enabled() ? "smooth" : "instant" });
    }
    const floor = FLOORS.find((f) => f.rooms.includes(current));
    document.getElementById("journey-location").textContent = floor
      ? floor.name + " · " + ROOMS[index].name
      : "A world in the making";
    document.getElementById("floor-readout").textContent = floor?.code ?? "↗";
    floorIcons.forEach((icon, i) =>
      icon.classList.toggle("is-current", FLOORS[i] === floor),
    );
    if (floor) showFloor(floor);
  }
}
function wake() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(render);
}
button.addEventListener("click", () => {
  paused = !paused;
  try {
    sessionStorage.setItem("openmeow-world-paused", String(paused));
  } catch {}
  updateButton();
  wake();
});
motionQuery.addEventListener("change", () => {
  updateButton();
  refreshLayout({ preserve: true });
});
addEventListener("scroll", wake, { passive: true });
let previousWidth = innerWidth;
addEventListener(
  "resize",
  () => {
    const changed = Math.abs(innerWidth - previousWidth) > 80;
    previousWidth = innerWidth;
    refreshLayout({ preserve: true });
    if (changed && current !== "arrival")
      document
        .getElementById(current)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    wake();
  },
  { passive: true },
);
// A reload during a smooth jump can restore an intermediate scroll offset.
// Resolve the explicit address again after the browser's initial layout.
addEventListener("pageshow", (event) => {
  if (location.hash && !event.persisted) onHash();
  else wake();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  } else wake();
});
// Keep native hash history and keyboard semantics; enhance only motion and focus.
document.addEventListener("click", (event) => {
  const link = event.target.closest?.('a[href^="#"]');
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  if (map.open && map.contains(link)) map.close();
  revealCapability(target);
  history.pushState(null, "", link.hash);
  history.scrollRestoration = "manual";
  target.scrollIntoView({
    behavior: enabled() ? "smooth" : "instant",
    block: "start",
  });
  if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
});
function onHash() {
  if (map.open) map.close();
  const id = location.hash.slice(1);
  const target =
    document.getElementById(id) ||
    document.getElementById(roomFromHash(location.hash));
  revealCapability(target);
  target?.scrollIntoView({ behavior: "instant", block: "start" });
  if (target?.hasAttribute("tabindex")) target.focus({ preventScroll: true });
  wake();
}
addEventListener("hashchange", onHash);
for (const image of document.querySelectorAll(".scene-art img")) {
  const failed = () => image.closest(".scene-art").classList.add("media-error");
  image.addEventListener("error", failed);
  if (image.complete && !image.naturalWidth) failed();
  image.addEventListener("load", () =>
    image.closest(".scene-art").classList.remove("media-error"),
  );
}
const search = document.getElementById("capability-search");
const articles = [...document.querySelectorAll("[data-capability]")];
document.querySelector(".search-control").hidden = false;
function filterCapabilities() {
  const matches = new Set(
    searchCapabilities(search.value).map((item) => item.id),
  );
  for (const article of articles)
    article.hidden = !matches.has(article.dataset.capability);
  document.getElementById("search-status").textContent =
    matches.size + " " + (matches.size === 1 ? "capability" : "capabilities");
  document.getElementById("search-empty").hidden = matches.size !== 0;
}
function revealCapability(target) {
  if (target?.dataset.capability && target.hidden) {
    search.value = "";
    filterCapabilities();
  }
}
search.addEventListener("input", filterCapabilities);
mapToggle.hidden = false;
mapToggle.addEventListener("click", () => {
  const image = map.querySelector("img");
  if (!image.getAttribute("src")) image.src = image.dataset.src;
  showFloor(FLOORS.find((f) => f.rooms.includes(current)) ?? FLOORS[0]);
  map.showModal();
  document.body.classList.add("map-open");
});
document
  .getElementById("map-close")
  .addEventListener("click", () => map.close());
map.addEventListener("close", () => document.body.classList.remove("map-open"));
for (const stop of map.querySelectorAll("[data-floor]")) {
  const highlight = () =>
    showFloor(FLOORS.find((f) => f.code === stop.dataset.floor));
  stop.addEventListener("pointerenter", highlight);
  stop.addEventListener("focusin", highlight);
}
document.documentElement.dataset.worldEnhanced = "true";
updateButton();
refreshLayout();
document.fonts?.ready.then(refreshLayout);
if (location.hash) onHash();
else wake();
