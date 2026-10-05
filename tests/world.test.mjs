import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ROOMS,
  roomFromHash,
  motionEnabled,
  searchCapabilities,
} from "../world-model.mjs";
import { renderWorld } from "../scripts/build-world.mjs";

test("preview actions have usable destinations without private repository access", () => {
  for (const room of ROOMS)
    if (room.href) assert.ok(room.href.startsWith("#"), room.id);
  for (const item of searchCapabilities(""))
    assert.equal(item.href, null, item.name);
});
test("skip navigation and every capability link target are keyboard focusable", () => {
  const html = renderWorld();
  assert.match(html, /<main id="main" tabindex="-1">/);
  for (const item of searchCapabilities(""))
    assert.ok(html.includes('id="' + item.id + '" tabindex="-1"'), item.id);
});

test("every destination has distinct portrait and landscape assets and a stable address", () => {
  assert.equal(ROOMS.length, 9);
  assert.equal(new Set(ROOMS.map((r) => r.id)).size, 9);
  for (const r of ROOMS) {
    assert.match(r.landscape, /landscape/);
    assert.match(r.portrait, /portrait/);
    assert.notEqual(r.portrait, r.landscape);
    assert.equal(roomFromHash("#" + r.id), r.id);
  }
});
test("malformed, encoded and unknown deep links safely return arrival", () => {
  for (const hash of ["", "#%ZZ", "#missing", "#%3Cscript%3E"])
    assert.equal(roomFromHash(hash), "arrival");
  assert.equal(roomFromHash("#mission-control"), "mission-control");
});
test("mobile retains motion; user pause and reduced motion each disable it", () => {
  assert.equal(motionEnabled({ reduced: false, paused: false }), true);
  assert.equal(motionEnabled({ reduced: false, paused: true }), false);
  assert.equal(motionEnabled({ reduced: true, paused: false }), false);
});
test("capability search finds cross-room anchors by product and purpose", () => {
  assert.ok(
    searchCapabilities("GELLPHANT").some((c) => c.room === "gellphant"),
  );
  assert.ok(
    searchCapabilities("/dontgaslightme").some((c) => c.room === "creation"),
  );
  assert.ok(searchCapabilities("funding").some((c) => c.room === "operations"));
  assert.equal(searchCapabilities("unknown-example-zz").length, 0);
});
test("the shipped static page stays in sync and exposes every room without JavaScript", async () => {
  const html = await readFile(
    new URL("../world.html", import.meta.url),
    "utf8",
  );
  assert.equal(html, renderWorld());
  for (const room of ROOMS) assert.ok(html.includes('id="' + room.id + '"'));
  assert.ok(html.includes("/dontgaslightme"));
  assert.ok(!/EyeBiome|Ronda Lab|MANESHouse/.test(html));
});
test("all 18 selected plates exist, retain useful resolution and match their orientation", async () => {
  for (const room of ROOMS)
    for (const format of ["landscape", "portrait"]) {
      const png = await readFile(
        new URL("../" + room[format], import.meta.url),
      );
      assert.equal(png.subarray(1, 4).toString(), "PNG");
      const width = png.readUInt32BE(16),
        height = png.readUInt32BE(20);
      assert.ok(
        Math.min(width, height) >= 900,
        room.id + " should preserve image detail",
      );
      assert.equal(
        width > height,
        format === "landscape",
        room.id + " orientation mismatch",
      );
    }
});
