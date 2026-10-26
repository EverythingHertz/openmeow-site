// OpenMeow slide board v0: grid newest first, one-change iteration with every version kept.
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const when = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

let cards = [];
let selected = null;
let pollTimer = null;
let shownPair = null;

async function api(path, init) {
  const res = await fetch(path, { credentials: 'same-origin', ...init });
  if (res.status === 401) { location.reload(); throw new Error('signed out'); }
  return res;
}

function renderStrip(data) {
  const strip = $('strip');
  strip.replaceChildren();
  const total = el('span', 'pill total');
  total.append(el('b', null, String(data.total)), ' slides');
  strip.append(total);
  for (const c of data.corpora) {
    if (c.status === 'ok') {
      const p = el('span', 'pill');
      p.append(`${c.label} `, el('b', null, String(c.count)));
      strip.append(p);
    } else {
      strip.append(el('span', 'pill held', `${c.label}: HELD · ${c.reason}`));
    }
  }
  strip.append(el('span', 'pill', data.agent.connected ? 'Agent: connected' : 'Agent: not connected'));
}

function renderGrid() {
  const grid = $('grid');
  const frag = document.createDocumentFragment();
  cards.forEach((c, i) => {
    const b = el('button', 'card');
    b.type = 'button';
    b.dataset.id = c.id;
    const img = el('img');
    img.src = `/thumb/${c.id}`;
    img.alt = c.title;
    img.decoding = 'async';
    if (i >= 24) img.loading = 'lazy';
    const body = el('div', 'body');
    const t = el('p', 't', c.title);
    if (c.has_svg) t.append(el('span', 'tag svg', 'SVG'));
    body.append(t, el('p', 'm', `${c.corpus_label} · ${c.deck}${c.index ? ' #' + c.index : ''}`), el('p', 'm', when(c.built_at)));
    b.append(img, body);
    b.addEventListener('click', () => open(c));
    frag.append(b);
  });
  grid.replaceChildren(frag);
}

function open(c) {
  selected = c;
  shownPair = null;
  document.querySelectorAll('.card.sel').forEach((n) => n.classList.remove('sel'));
  document.querySelector(`.card[data-id="${c.id}"]`)?.classList.add('sel');
  $('p-title').textContent = c.title;
  $('p-meta').textContent = `${c.corpus_label} · ${c.deck} ${c.version}${c.index ? ' · slide ' + c.index : ''} · ${when(c.built_at)} · ${c.currentness}`;
  $('p-img').src = `/thumb/${c.id}`;
  $('p-img').alt = c.title;
  $('p-limits').textContent = `Evidence: ${c.evidence}. Limits: ${c.limitations}`;
  $('iterate').disabled = !c.has_svg;
  $('iter-note').className = 'note';
  $('iter-note').textContent = c.has_svg ? '' : 'No SVG source for this slide, so it cannot be iterated yet.';
  $('instruction').value = '';
  $('pending').hidden = true;
  $('versions').hidden = true;
  $('panel').hidden = false;
  refresh();
}

function close() {
  $('panel').hidden = true;
  clearTimeout(pollTimer);
  selected = null;
  document.querySelectorAll('.card.sel').forEach((n) => n.classList.remove('sel'));
}

async function refresh() {
  clearTimeout(pollTimer);
  if (!selected) return;
  const id = selected.id;
  const s = await (await api(`/api/iterations/${id}`)).json();
  if (!selected || selected.id !== id) return;
  $('pending').hidden = !s.pending;
  if (s.pending) $('prompt').textContent = s.prompt;
  renderVersions(s.versions);
  if (s.pending) pollTimer = setTimeout(refresh, 2000);
}

function renderVersions(versions) {
  const box = $('versions');
  if (versions.length < 2) { box.hidden = true; return; }
  box.hidden = false;
  const latest = versions.at(-1).version;
  const pick = shownPair && versions.some((v) => v.version === shownPair) ? shownPair : latest;
  const chips = $('chips');
  chips.replaceChildren();
  for (const v of versions) {
    const chip = el('button', 'chip' + (v.version === pick ? ' on' : ''), `v${v.version}`);
    chip.type = 'button';
    chip.title = v.instruction || 'source copy';
    if (v.version > 1) chip.addEventListener('click', () => { shownPair = v.version; renderVersions(versions); });
    chips.append(chip);
  }
  const child = versions.find((v) => v.version === pick);
  const parentN = Number(String(child.parent || '').replace(/^v/, '')) || pick - 1;
  const parent = versions.find((v) => v.version === parentN);
  const bust = Date.now();
  $('c-old').src = `/iter/${selected.id}/v${parent.version}.svg?v=${bust}`;
  $('c-old').alt = `Version ${parent.version}`;
  $('c-new').src = `/iter/${selected.id}/v${child.version}.svg?v=${bust}`;
  $('c-new').alt = `Version ${child.version}`;
  const oldCap = $('c-old-cap');
  oldCap.replaceChildren(el('b', null, `v${parent.version}`), parent.version === 1 ? ' · source copy' : ` · ${parent.author || ''}`);
  const newCap = $('c-new-cap');
  newCap.replaceChildren(el('b', null, `v${child.version}`), ` · parent v${parent.version}${child.author ? ' · ' + child.author : ''}`,
    el('span', 'instr', `“${child.instruction || ''}”`));
}

$('iter-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selected) return;
  const note = $('iter-note');
  const res = await api(`/api/iterations/${selected.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instruction: $('instruction').value }),
  });
  const body = await res.json();
  if (!res.ok) { note.className = 'note err'; note.textContent = body.error; return; }
  note.className = 'note';
  note.textContent = `Request ${body.request.request} saved: ${body.request.base} → ${body.request.target}.`;
  $('instruction').value = '';
  refresh();
});
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('prompt').textContent);
    $('copy').textContent = 'Copied';
  } catch {
    $('copy').textContent = 'Copy failed: select the text above';
  }
  setTimeout(() => { $('copy').textContent = 'Copy the iterate prompt'; }, 2000);
});
$('p-close').addEventListener('click', close);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

const data = await (await api('/api/cards')).json();
cards = data.cards;
renderStrip(data);
renderGrid();
