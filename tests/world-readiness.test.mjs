import test from 'node:test';
import assert from 'node:assert/strict';
import { CAPABILITIES, searchCapabilities } from '../world-model.mjs';
import { renderWorld } from '../scripts/build-world.mjs';

test('every tool separates implemented scope from remaining development', () => {
  for (const c of CAPABILITIES) {
    assert.ok(['working', 'pilot', 'development'].includes(c.stage), c.name);
    assert.ok(c.available && c.remaining && c.output, c.name);
  }
  assert.equal(CAPABILITIES.find(c => c.name === 'FounderOS').stage, 'development');
  assert.equal(CAPABILITIES.find(c => c.name === 'Continuity').stage, 'pilot');
});
test('readiness and room filters compose with search without losing tools', () => {
  for (const stage of ['working', 'pilot', 'development']) {
    const results = searchCapabilities('', { stage });
    assert.ok(results.length);
    assert.ok(results.every(c => c.stage === stage));
  }
  assert.ok(searchCapabilities('evidence', { room: 'gellphant' }).length);
  assert.equal(searchCapabilities('Gellphant', { room: 'operations' }).length, 0);
});
test('readiness explanations and shared layers exist without JavaScript', () => {
  const html = renderWorld();
  assert.match(html, /Working component/);
  assert.match(html, /Tested pilot/);
  assert.match(html, /In development/);
  assert.match(html, /Across every room/);
  assert.match(html, /What works today/);
  assert.match(html, /Still being developed/);
  assert.ok(!/href="https:\/\/github.com\/EverythingHertz/.test(html));
});
