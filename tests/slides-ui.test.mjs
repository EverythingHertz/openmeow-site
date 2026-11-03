import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const source = await readFile(new URL('../slides.mjs', import.meta.url), 'utf8');

class Element {
  constructor(tag = 'div') {
    this.tag = tag;
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.textContent = '';
    this.value = '';
    this.hidden = false;
    this.classList = { add() {}, remove() {} };
  }
  append(...children) {
    for (const child of children) {
      if (child?.tag === 'fragment') this.children.push(...child.children);
      else this.children.push(child);
    }
  }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  addEventListener(type, handler) { this.listeners[type] = handler; }
}

const card = { id: 'loc-' + 'a'.repeat(20), title: 'Fixture slide', has_svg: true,
  corpus_label: 'Fixture', deck: 'deck', version: 'v1', built_at: '2026-10-25T00:00:00Z',
  currentness: 'unknown', evidence: 'real', limitations: 'Fixture only' };
const reply = (status, body) => ({
  status, ok: status >= 200 && status < 300,
  headers: { get: () => 'application/json' },
  json: async () => body,
});
const board = () => reply(200, {
  cards: [card], total: 1, corpora: [{ label: 'Fixture', status: 'ok', count: 1 }],
  agent: { connected: false },
});

async function load(fetch) {
  const nodes = new Map();
  const node = (id) => {
    if (!nodes.has(id)) nodes.set(id, new Element());
    return nodes.get(id);
  };
  const script = new Script(`(async () => { ${source}\n })()`);
  await script.runInNewContext({
    document: {
      getElementById: node, createElement: (tag) => new Element(tag),
      createDocumentFragment: () => new Element('fragment'),
      querySelectorAll: () => [], querySelector: () => null, addEventListener() {},
    },
    fetch, clearTimeout() {},
    setTimeout() { throw new Error('Unexpected background poll'); },
  });
  return node;
}

test('board load failure replaces loading state with an explicit error', async () => {
  const node = await load(async () => reply(500, { error: 'Index unavailable' }));
  assert.equal(node('strip').children[0].textContent, 'Board unavailable: Index unavailable');
});

test('iteration history failure is visible and hides stale pending/version details', async () => {
  const node = await load(async (path) => path === '/api/cards' ? board() : reply(500, { error: 'History unavailable' }));
  node('grid').children[0].listeners.click();
  await new Promise(setImmediate);
  assert.equal(node('iter-note').textContent, 'History unavailable');
  assert.equal(node('iter-note').className, 'note err');
  assert.equal(node('pending').hidden, true);
  assert.equal(node('versions').hidden, true);
});

test('submission failure preserves the instruction and displays the server error', async () => {
  const node = await load(async (path, init) => {
    if (path === '/api/cards') return board();
    return init?.method === 'POST' ? reply(500, { error: 'History unavailable' })
      : reply(200, { versions: [], pending: null });
  });
  node('grid').children[0].listeners.click();
  await new Promise(setImmediate);
  node('instruction').value = 'Change the title';
  await node('iter-form').listeners.submit({ preventDefault() {} });
  assert.equal(node('iter-note').textContent, 'History unavailable');
  assert.equal(node('iter-note').className, 'note err');
  assert.equal(node('instruction').value, 'Change the title');
});
