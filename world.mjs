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
import { DEMOS, demoFrame, stepProgress, playbackProgress, isScrollKey, resizeDestination } from "./world-demos.mjs";

const sections = ROOMS.map((room) => document.getElementById(room.id));
const navLinks = [...document.querySelectorAll("[data-room]")];
const scenes = sections.map((section) => ({
  section,
  stage: section.querySelector(".room-stage"),
  art: section.querySelector(".scene-art"),
  image: section.querySelector(".scene-art img"),
  beats: [...section.querySelectorAll(".room-flow li")],
  copy: section.querySelector('.room-copy'),
  track: section.querySelector('[data-demo-track]'),
  demoPin: section.querySelector('.demo-pin'),
  demo: section.querySelector('[data-demo]'),
  controls: section.querySelector('.demo-controls'),
  caption: section.querySelector('.demo-caption'),
  stepButtons: [...section.querySelectorAll('[data-demo-step]')],
  play: section.querySelector('[data-demo-play]'),
  announcement: section.querySelector('.demo-announcement'),
  demoState: { manual: null, manualY: 0, start: null, progress: 1, step: null },
}));
const map = document.getElementById("building-map");
const mapToggle = document.getElementById("building-toggle");
const floorIcons = [...document.querySelectorAll(".floor-icon i")];
let topInset = 90;
let navNeedsCenter = true;
let directoryInView = false;
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
    : "Pause or resume scroll demonstrations and camera movement";
  document.documentElement.dataset.motion = enabled() ? "on" : "off";
  scenes.filter(s => s.play).forEach(s => {
    s.play.disabled = !enabled();
    s.play.title = enabled() ? 'Replay this example once' : 'Use the steps to inspect this example without motion';
  });
}
function refreshLayout({ preserve = false } = {}) {
  navNeedsCenter = true;
  const directory = document.getElementById("directory");
  const scene = scenes.find((s) => s.section.id === current);
  const visibleAnchor = scene.track?.classList.contains('is-pinned') && scene.demoPin.getBoundingClientRect().top <= topInset + 2
    ? scene.demoPin : (scene.stage ?? scene.section);
  const anchor =
    directory.getBoundingClientRect().top < innerHeight * 0.42
      ? directory
      : visibleAnchor;
  const before = anchor.getBoundingClientRect().top;
  topInset =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header"),
    ) + 12;
  document.querySelector('.room-nav').style.setProperty('--map-width', mapToggle.offsetWidth + 'px');
  // Measure the natural content first. On compact screens only the short demo
  // pins, after the room copy and portrait art have been read.
  const oldModes = scenes.map(s => [s.section.className, s.track?.className].join('|'));
  for (const scene of scenes) {
    scene.section.classList.remove('is-pinned');
    scene.track?.classList.remove('is-pinned');
    scene.copy?.classList.remove('copy-pinned');
  }
  for (const scene of scenes)
    if (scene.stage) {
      scene.section.style.setProperty(
        "--stage-height",
        scene.stage.offsetHeight + "px",
      );
      const pin =
        innerWidth > 1100 &&
        !motionQuery.matches &&
        scene.stage.offsetHeight <= innerHeight - topInset + 1;
      scene.section.classList.toggle("is-pinned", pin);
      if (!pin && !motionQuery.matches && scene.demoPin.offsetHeight < innerHeight - topInset) {
        scene.track.style.setProperty('--demo-height', scene.demoPin.offsetHeight + 'px');
        scene.track.classList.add('is-pinned');
      }
      if (!pin && innerWidth > 900 && scene.copy.offsetHeight < innerHeight - topInset)
        scene.copy.classList.add('copy-pinned');
    }
  const changed = scenes.some((s, i) => [s.section.className, s.track?.className].join('|') !== oldModes[i]);
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
function paintDemo(scene, progress, { announce = false } = {}) {
  const state = demoFrame(progress);
  scene.demoState.progress = state.progress;
  scene.demo.style.setProperty('--route', state.route.toFixed(4));
  scene.demo.style.setProperty('--resolve', state.resolve.toFixed(4));
  scene.demo.style.setProperty('--demo-progress', state.progress.toFixed(4));
  if (scene.demoState.step !== state.step) {
    scene.demoState.step = state.step;
    scene.demo.dataset.step = state.step;
    scene.stepButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.step)));
    scene.caption.textContent = DEMOS[scene.section.id].steps[state.step].caption;
  }
  if (announce) scene.announcement.textContent = scene.caption.textContent;
}
function endReplay(scene, keepPosition = true) {
  if (scene.demoState.start === null) return;
  scene.demoState.start = null;
  if (keepPosition) {
    scene.demoState.manual = scene.demoState.progress;
    scene.demoState.manualY = scrollY;
  }
  scene.play.innerHTML = '<span aria-hidden="true">▷</span> Replay';
  scene.play.setAttribute('aria-label', 'Replay ' + DEMOS[scene.section.id].product + ' example');
}
function render(now = performance.now()) {
  frame = 0;
  const readingLine = innerHeight * 0.42;
  directoryInView = document.getElementById('directory').getBoundingClientRect().top <= readingLine;
  let nearest = sections[0],
    distance = Infinity;
  // Collect geometry before style writes; no perpetual animation loop.
  const measured = scenes.map((scene) => ({
    ...scene,
    rect: scene.section.getBoundingClientRect(),
    artRect: (scene.section.querySelector(innerWidth > 900 ? '.demo-room-context' : '.compact-room-art') ?? scene.art).getBoundingClientRect(),
    stageHeight: scene.stage?.offsetHeight ?? 0,
    trackRect: scene.track?.getBoundingClientRect(),
    demoRect: scene.demoPin?.getBoundingClientRect(),
  }));
  let activeProgress = 0;
  let playing = false;
  for (const scene of measured) {
    const {
    section,
    rect,
    artRect,
    image,
    beats,
    stageHeight,
    trackRect,
    demoRect,
  } = scene;
    const pinned = section.classList.contains("is-pinned");
    const p = sceneProgress({
      top: pinned ? rect.top : artRect.top,
      height: pinned ? rect.height : artRect.height,
      viewport: innerHeight,
      topInset,
      pinnedHeight: pinned ? stageHeight : 0,
    });
    let demoP = scene.demo ? sceneProgress({
      top: trackRect.top,
      height: trackRect.height,
      viewport: innerHeight,
      topInset,
      pinnedHeight: scene.track.classList.contains('is-pinned') ? demoRect.height : 0,
    }) : p;
    if (pinned) demoP = p;
    if (scene.demo) {
      const s = scene.demoState;
      const visible = demoRect.bottom > topInset && demoRect.top < innerHeight;
      if (s.start !== null) {
        if (!enabled() || !visible) endReplay(scene);
        else {
          const playback = playbackProgress(now, s.start);
          s.manual = playback.progress;
          s.manualY = scrollY;
          paintDemo(scene, playback.progress);
          if (playback.playing) playing = true;
          else { endReplay(scene); scene.announcement.textContent = scene.caption.textContent; }
        }
      }
      if (s.start === null) {
        if (s.manual !== null) paintDemo(scene, s.manual);
        else if (motionQuery.matches) paintDemo(scene, 1);
        else if (!paused && visible) paintDemo(scene, demoP);
      }
    }
    const d =
      rect.top <= readingLine && rect.bottom > readingLine
        ? 0
        : Math.abs(rect.top - readingLine);
    if (d < distance) {
      nearest = section;
      distance = d;
      activeProgress = demoP;
    }
    if (image) {
      const pose = cameraPose(p, {
        compact: innerWidth <= 900,
        enabled: enabled() && rect.bottom > 0 && rect.top < innerHeight,
      });
      for (const image of section.querySelectorAll('.scene-art img')) {
        image.style.setProperty("--camera", pose.scale);
        image.style.setProperty("--camera-x", pose.x + "%");
        image.style.setProperty("--camera-y", pose.y + "%");
      }
    }
    for (const [i, beat] of beats.entries()) {
      beat.classList.toggle("is-current", i === storyBeat(p));
      beat.style.setProperty(
        "--beat-fill",
        Math.max(0, Math.min(1, p * 3 - i)),
      );
    }
  }
  if (playing) wake();
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
// Native focus and scroll anchoring can move the page after a step selection.
// Only intentional scrolling hands a manually selected example back to the tour.
const releaseManualSteps = () => {
  if (!enabled()) return;
  for (const scene of scenes) if (scene.demoState.start === null) scene.demoState.manual = null;
  wake();
};
addEventListener('wheel', releaseManualSteps, { passive: true });
addEventListener('touchmove', releaseManualSteps, { passive: true });
addEventListener('keydown', event => {
  if (isScrollKey(event.key, {
    editable: Boolean(event.target.closest?.('input,textarea,[contenteditable=true]')),
    interactive: Boolean(event.target.closest?.('button,a,summary')),
  })) releaseManualSteps();
});
addEventListener('pointerdown', event => {
  if (event.clientX >= document.documentElement.clientWidth) releaseManualSteps();
});
let previousWidth = innerWidth;
addEventListener(
  "resize",
  () => {
    const destination = resizeDestination({ inDirectory: directoryInView, hash: location.hash, current });
    const changed = Math.abs(innerWidth - previousWidth) > 80;
    previousWidth = innerWidth;
    refreshLayout({ preserve: true });
    if (changed && destination !== "arrival")
      document
        .getElementById(destination)
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
    scenes.filter(s => s.demo).forEach(s => endReplay(s));
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
  if (target?.dataset.capability) {
    const details = target.querySelector('.cap-details');
    if (details) details.open = true;
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
for (const scene of scenes.filter(s => s.demo)) {
  scene.controls.hidden = false;
  for (const b of scene.stepButtons) b.addEventListener('click', () => {
    endReplay(scene, false);
    scene.demoState.manual = stepProgress(Number(b.dataset.demoStep));
    scene.demoState.manualY = scrollY;
    paintDemo(scene, scene.demoState.manual, { announce: true });
    const rect = scene.demoPin.getBoundingClientRect();
    if (rect.height <= innerHeight - topInset && (rect.top < topInset - 1 || rect.bottom > innerHeight + 1))
      scene.track.scrollIntoView({ block: 'start', behavior: enabled() ? 'smooth' : 'instant' });
  });
  scene.play.addEventListener('click', () => {
    if (scene.demoState.start !== null) { endReplay(scene); return; }
    if (!enabled()) return;
    scene.demoState.start = performance.now();
    scene.demoState.manual = 0;
    scene.demoState.manualY = scrollY;
    paintDemo(scene, 0);
    scene.play.innerHTML = '<span aria-hidden="true">□</span> Stop';
    scene.play.setAttribute('aria-label', 'Stop ' + DEMOS[scene.section.id].product + ' example');
    wake();
  });
}
updateButton();
refreshLayout();
document.fonts?.ready.then(refreshLayout);
if (location.hash) onHash();
else wake();
