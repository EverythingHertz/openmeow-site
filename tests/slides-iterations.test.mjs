import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequest, state, iterDir } from '../runner/slides/iterations.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'om-iterations-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const svg = join(dir, 'source.svg');
  writeFileSync(svg, '<svg/>');
  return { dir, card: { card_id: 'loc-' + 'a'.repeat(20), svg_path: svg, title: 'Fixture' } };
}

test('iteration instruction requires a string, without coercion or writes', (t) => {
  const { dir, card } = fixture(t);
  for (const value of [undefined, null, false, 1, {}, [], ['change'], '', ' ', 'x'.repeat(501)]) {
    assert.equal(createRequest(dir, card, value).status, 400, JSON.stringify(value));
  }
  assert.equal(existsSync(iterDir(dir, card.card_id)), false);
  assert.equal(createRequest(dir, card, 'x'.repeat(500)).request.instruction.length, 500);
});

test('iteration preserves the source and refuses a second pending change', (t) => {
  const { dir, card } = fixture(t);
  const first = createRequest(dir, card, '  Change title  ');
  assert.equal(first.request.base, 'v1');
  assert.equal(first.request.target, 'v2');
  assert.equal(first.request.instruction, 'Change title');
  assert.equal(createRequest(dir, card, 'Another change').status, 409);
  assert.equal(readFileSync(card.svg_path, 'utf8'), '<svg/>');
  assert.equal(state(dir, card.card_id).pending.request, 1);
});

test('corrupt request data cannot silently disappear and permit another write', (t) => {
  const { dir, card } = fixture(t);
  createRequest(dir, card, 'Change title');
  const file = join(iterDir(dir, card.card_id), 'request-1.json');
  for (const corrupt of ['{broken', 'null', '{}', '[]']) {
    writeFileSync(file, corrupt);
    assert.throws(() => state(dir, card.card_id), /iteration state/i);
    assert.throws(() => createRequest(dir, card, 'Another change'), /iteration state/i);
    assert.equal(readFileSync(file, 'utf8'), corrupt);
    assert.equal(existsSync(join(iterDir(dir, card.card_id), 'request-2.json')), false);
  }
});

test('corrupt version metadata is an error, but absent optional metadata stays readable', (t) => {
  const { dir, card } = fixture(t);
  createRequest(dir, card, 'Change title');
  const folder = iterDir(dir, card.card_id);
  writeFileSync(join(folder, 'v2.svg'), '<svg/>');
  assert.equal(state(dir, card.card_id).pending, null);
  assert.equal(state(dir, card.card_id).versions.at(-1).author, null);
  writeFileSync(join(folder, 'v2.json'), '{broken');
  assert.throws(() => state(dir, card.card_id), /iteration state/i);
});
