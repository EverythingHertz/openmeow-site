import {
  ROOMS,
  roomFromHash,
  motionEnabled,
  searchCapabilities,
} from "./world-model.mjs";

const sections = ROOMS.map((room) => document.getElementById(room.id));
const navLinks = [...document.querySelectorAll("[data-room]")];
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
    : "Toggle gentle camera movement";
}
function render() {
  frame = 0;
  const readingLine = innerHeight * 0.42;
  let nearest = sections[0],
    distance = Infinity;
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const d =
      rect.top <= readingLine && rect.bottom > readingLine
        ? 0
        : Math.abs(rect.top - readingLine);
    if (d < distance) {
      nearest = section;
      distance = d;
    }
    // Only transform visible imagery, only in response to a scroll/resize event.
    const image = section.querySelector(".scene-art img");
    if (image && section.id !== "arrival") {
      const p = Math.max(
        0,
        Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)),
      );
      image.style.setProperty(
        "--camera",
        enabled() && rect.bottom > 0 && rect.top < innerHeight
          ? String(1 + 0.025 * p)
          : "1",
      );
    }
  }
  if (current !== nearest.id) {
    current = nearest.id;
    for (const link of navLinks) {
      if (link.dataset.room === current)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    const active = navLinks.find((link) => link.dataset.room === current);
    const nav = active?.parentElement;
    if (nav && nav.scrollWidth > nav.clientWidth) {
      const left =
        active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
      nav.scrollTo({ left, behavior: enabled() ? "smooth" : "instant" });
    }
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
  wake();
});
addEventListener("scroll", wake, { passive: true });
addEventListener("resize", wake, { passive: true });
addEventListener("pageshow", wake);
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
  history.pushState(null, "", link.hash);
  target.scrollIntoView({
    behavior: enabled() ? "smooth" : "instant",
    block: "start",
  });
  if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
});
function onHash() {
  const id = location.hash.slice(1);
  const target =
    document.getElementById(id) ||
    document.getElementById(roomFromHash(location.hash));
  target?.scrollIntoView({ behavior: "instant", block: "start" });
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
search.addEventListener("input", () => {
  const matches = new Set(
    searchCapabilities(search.value).map((item) => item.id),
  );
  for (const article of articles)
    article.hidden = !matches.has(article.dataset.capability);
  document.getElementById("search-status").textContent =
    matches.size + " " + (matches.size === 1 ? "capability" : "capabilities");
  document.getElementById("search-empty").hidden = matches.size !== 0;
});
updateButton();
wake();
