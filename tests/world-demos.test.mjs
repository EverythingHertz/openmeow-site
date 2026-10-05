import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS, CAPABILITY_BRIEFS, demoFrame, stepProgress, playbackProgress, isScrollKey, resizeDestination } from '../world-demos.mjs';
import { ROOMS } from '../world-model.mjs';
import { renderWorld } from '../scripts/build-world.mjs';

test('every room explains a named capability, concrete features and a practical benefit', () => {
  for (const room of ROOMS.slice(1)) {
    const demo = DEMOS[room.id];
    assert.ok(demo.product && demo.benefit && demo.features.length >= 3, room.id);
    assert.equal(demo.steps.length, 3, room.id);
    assert.ok(demo.steps.every(s => s.label && s.caption), room.id);
  }
  assert.match(DEMOS.creation.product, /dontgaslightme/);
  assert.match(DEMOS.gellphant.product, /Gellphant/);
  assert.notEqual(DEMOS.creation.headline, DEMOS.gellphant.headline);
});

test('scroll shows the input before processing and the result after processing', () => {
  const input = demoFrame(0), action = demoFrame(.5), result = demoFrame(1);
  assert.equal(input.step, 0);
  assert.equal(input.route, 0);
  assert.equal(input.resolve, 0);
  assert.equal(action.step, 1);
  assert.ok(action.route > .8);
  assert.equal(action.resolve, 0);
  assert.equal(result.step, 2);
  assert.equal(result.route, 1);
  assert.equal(result.resolve, 1);
});

test('choreography is reversible, bounded and safe for malformed progress', () => {
  for (const p of [-10, NaN, Infinity, 0, .25, .5, .75, 1, 20]) {
    const frame = demoFrame(p);
    for (const key of ['progress', 'route', 'resolve'])
      assert.ok(Number.isFinite(frame[key]) && frame[key] >= 0 && frame[key] <= 1);
    assert.ok(frame.step >= 0 && frame.step <= 2);
  }
  assert.deepEqual(demoFrame(.3), demoFrame(.3));
  assert.deepEqual(demoFrame(-1), demoFrame(0));
  assert.deepEqual(demoFrame(10), demoFrame(1));
});

test('manual steps settle on readable input, action and result states', () => {
  for (let step = 0; step < 3; step++)
    assert.equal(demoFrame(stepProgress(step)).step, step);
});

test('a replay starts at the input and completes once without looping', () => {
  assert.deepEqual(playbackProgress(100, 100), { progress: 0, playing: true });
  const middle = playbackProgress(3300, 100);
  assert.ok(middle.progress > 0 && middle.progress < 1 && middle.playing);
  assert.deepEqual(playbackProgress(10000, 100), { progress: 1, playing: false });
});

test('Space on a control preserves a selected step while page scrolling can release it', () => {
  assert.equal(isScrollKey(' ', { interactive: true }), false);
  assert.equal(isScrollKey(' ', { interactive: false }), true);
  assert.equal(isScrollKey('PageDown', { interactive: true }), true);
  assert.equal(isScrollKey('ArrowDown', { editable: true }), false);
  assert.equal(isScrollKey('Tab'), false);
});

test('resizing a capability brief preserves the brief instead of the last tower room', () => {
  assert.equal(resizeDestination({ inDirectory: true, hash: '#cap-1', current: 'observatory' }), 'cap-1');
  assert.equal(resizeDestination({ inDirectory: true, hash: '#directory', current: 'observatory' }), 'directory');
  assert.equal(resizeDestination({ inDirectory: false, hash: '#cap-1', current: 'gellphant' }), 'gellphant');
});

test('no-JavaScript markup exposes all explanations and a complete example outcome', () => {
  const html = renderWorld();
  for (const [id, demo] of Object.entries(DEMOS)) {
    assert.ok(html.includes(demo.benefit), id);
    assert.ok(html.includes(`id="${id}-demo"`), id);
    assert.ok(html.includes(`id="${id}-demo-caption"`), id);
  }
  assert.match(html, /Illustrative example/);
  assert.match(html, /What you can do/);
  assert.match(html, /Why it helps/);
});

test('primary capability deep links offer input, output, value and readiness without JavaScript', () => {
  const html = renderWorld();
  for (const id of ['cap-1','cap-2','cap-3','cap-4','cap-8','cap-10','cap-15','cap-19','cap-20','cap-22','cap-23']) {
    const brief = CAPABILITY_BRIEFS[id];
    assert.ok(brief.input && brief.output && brief.benefit && brief.setup, id);
    const article = html.slice(html.indexOf(`id="${id}" tabindex`)).split('</article>')[0];
    assert.match(article, /<details class="cap-details">/);
    assert.match(article, /You bring/);
    assert.match(article, /You get/);
    assert.match(article, /Current setup/);
  }
  assert.match(CAPABILITY_BRIEFS['cap-15'].setup, /experimental/);
  assert.match(CAPABILITY_BRIEFS['cap-10'].setup, /remain unfinished/);
});
