import test from "node:test";
import assert from "node:assert/strict";
import * as motion from "../world-motion.mjs";
import { ROOMS } from "../world-model.mjs";

test("a room journey clamps overscroll and reverses without losing its place", () => {
  assert.equal(typeof motion.sceneProgress, "function");
  const at = (top) =>
    motion.sceneProgress({
      top,
      height: 1000,
      viewport: 800,
      topInset: 100,
      pinnedHeight: 600,
    });
  assert.equal(at(200), 0);
  assert.equal(at(100), 0);
  assert.equal(at(-100), 0.5);
  assert.equal(at(-300), 1);
  assert.equal(at(-900), 1);
  assert.equal(at(-100), 0.5);
});

test("camera motion stays inside image overscan and stops completely when paused", () => {
  assert.equal(typeof motion.cameraPose, "function");
  for (const compact of [true, false])
    for (const p of [-1, 0, 0.2, 0.5, 0.9, 1, 2]) {
      const pose = motion.cameraPose(p, { compact, enabled: true });
      const margin = (pose.scale - 1) * 50;
      assert.ok(
        Math.abs(pose.x) <= margin && Math.abs(pose.y) <= margin,
        "No exposed image edge",
      );
      assert.ok(
        pose.scale <= (compact ? 1.045 : 1.075),
        "Keep the key props in frame",
      );
      assert.deepEqual(motion.cameraPose(p, { compact, enabled: false }), {
        scale: 1,
        x: 0,
        y: 0,
      });
    }
});

test("the three story beats advance and reverse at stable boundaries", () => {
  assert.equal(typeof motion.storyBeat, "function");
  assert.deepEqual(
    [0, 0.32, 0.34, 0.65, 0.67, 1].map(motion.storyBeat),
    [0, 0, 1, 1, 2, 2],
  );
});

test("building stops include each room exactly once, with related rooms sharing a floor", () => {
  assert.ok(Array.isArray(motion.FLOORS));
  const ids = motion.FLOORS.flatMap((f) => f.rooms);
  assert.deepEqual(
    [...ids].sort(),
    ROOMS.slice(1)
      .map((r) => r.id)
      .sort(),
  );
  assert.equal(new Set(ids).size, 8);
  assert.equal(motion.FLOORS.length, 6);
  assert.deepEqual(motion.FLOORS[1].rooms, ["mission-control", "workshop"]);
});
