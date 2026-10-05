// Scroll choreography shared by the page and its behavioral tests.
const clamp = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
export const FLOORS = [
  {
    code: "G",
    name: "Ground",
    title: "Find your direction",
    rooms: ["lobby", "operations"],
    y: 81,
  },
  {
    code: "01",
    name: "Level 01",
    title: "Bring the team together",
    rooms: ["mission-control", "workshop"],
    y: 66,
  },
  {
    code: "02",
    name: "Level 02",
    title: "Make something useful",
    rooms: ["creation"],
    y: 51,
  },
  {
    code: "03",
    name: "Level 03",
    title: "Ask the harder question",
    rooms: ["gellphant"],
    y: 37,
  },
  {
    code: "04",
    name: "Level 04",
    title: "Keep the thread",
    rooms: ["research"],
    y: 24,
  },
  {
    code: "R",
    name: "Rooftop",
    title: "See the whole picture",
    rooms: ["observatory"],
    y: 9,
  },
];
export function sceneProgress({
  top,
  height,
  viewport,
  topInset = 0,
  pinnedHeight = 0,
}) {
  const distance = pinnedHeight
    ? height - pinnedHeight
    : height + viewport - topInset;
  return clamp(
    (pinnedHeight ? topInset - top : viewport - top) / Math.max(1, distance),
  );
}
export function cameraPose(progress, { compact = false, enabled = true } = {}) {
  if (!enabled) return { scale: 1, x: 0, y: 0 };
  const p = clamp(progress),
    eased = p * p * (3 - 2 * p);
  const scale = 1.015 + (compact ? 0.029 : 0.059) * eased;
  // Translation stays within the pixels supplied by the scale's overscan.
  const margin = (scale - 1) * 50;
  return {
    scale,
    x: margin * 0.42 * (eased * 2 - 1),
    y: margin * 0.5 * (1 - eased * 2),
  };
}
export const storyBeat = (progress) =>
  Math.min(2, Math.floor(clamp(progress) * 3));
