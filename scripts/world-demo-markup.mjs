import { DEMOS } from '../world-demos.mjs';

const e = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const chip = (text, cls = '') => `<span class="demo-chip ${cls}">${text}</span>`;
const card = (cls, label, title, content = '') => `<div class="work-card ${cls}"><span class="work-label">${label}</span><strong>${title}</strong>${content}</div>`;
const wire = (paths, cls = '') => `<svg class="work-wires ${cls}" viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden="true">${paths.map(d => `<path d="${d}" pathLength="1"/>`).join('')}</svg>`;

const scenes = {
  lobby: () => `${wire(['M155 120H230V44H340','M230 120H340','M230 120V198H340'])}
    ${card('goal-card','Your goal','An editable deck','<p>Sources + chart data</p>')}
    <div class="route-options"><div>Coordinate agents <span>Subtle Lasagne</span></div><div class="matched-route">Create a presentation <span>/dontgaslightme</span></div><div>Challenge a claim <span>Gellphant</span></div></div>
    <div class="demo-outcome">${chip('Matched to your goal','good')}<strong>/dontgaslightme</strong><span>Editable slides · source links · revision receipts</span></div>`,

  operations: () => `<div class="funding-list">
    <div class="funding-row funding-ready"><span class="rank">02</span><div><strong>Seed programme</strong><small>Due in 18 days · Intent</small></div>${chip('Ready to prepare','good')}</div>
    <div class="funding-row funding-blocked"><span class="rank">01</span><div><strong>Partner programme</strong><small>Due in 7 days · Considering</small></div>${chip('Letter missing','warn')}</div>
    <div class="funding-row funding-deferred"><span class="rank">03</span><div><strong>Expansion programme</strong><small>Due in 42 days · Deferred</small></div>${chip('Revisit next cycle')}</div>
    </div><div class="funding-check">${chip('Preparation check','good')}<span>Seed prerequisites complete</span><span class="blocker-note">Partner letter still needed</span></div>
    <div class="demo-outcome">${chip('Next action','good')}<strong>Prepare the seed application</strong><span>Request the partner letter in parallel.</span></div>`,

  'mission-control': () => `${wire(['M152 117H230V47H345','M230 117H345','M230 117V191H345'])}
    ${card('brief-card','Shared brief','A sourced deck','<p>Editable chart required</p>')}
    <div class="specialists"><div class="specialist researcher"><span>Research specialist</span><strong>Gather source notes</strong>${chip('Bounded assignment','good')}</div><div class="specialist designer"><span>Layout specialist</span><strong>Draft the slide structure</strong>${chip('Bounded assignment','good')}</div><div class="specialist blocked"><span>Chart specialist</span><strong>Waiting for source data</strong>${chip('Blocked','warn')}</div></div>
    <div class="return-packet">${chip('Human checkpoint','good')}<strong>2 returns ready for review</strong><span>Source notes + layout draft</span></div>`,

  workshop: () => `<div class="contract-parts">${card('part-role','01 · Role','Review specialist','<p>Read: draft + sources</p>')}${card('part-skill','02 · Method','Evidence review skill','<p>Compare claims and support</p>')}${card('part-return','03 · Return','Review report','<p>Write: review.md only</p>')}</div>
    <div class="contract-kit"><span class="work-label">Delegation packet</span><strong>Role + inputs + boundaries + return</strong><div class="kit-slots"><i></i><i></i><i></i></div>${chip('Release authority stays with the owner','warn')}</div>
    <div class="demo-outcome">${chip('Ready to hand off','good')}<strong>Compiled brief for your runtime</strong><span>Agent Mint prepares the contract; your runtime runs the worker.</span></div>`,

  creation: () => `<div class="slide-stage"><div class="slide-paper"><span class="slide-page">01 / 05</span></div><div class="slide-layer layer-text"><span class="layer-label">Editable text</span><strong>A clearer next step</strong><span class="slide-subtitle">A source-led proposal</span></div><div class="slide-layer layer-chart"><span class="layer-label">Editable chart</span><div class="chart-bars"><i></i><i></i><i></i><i></i></div></div><div class="slide-layer layer-diagram"><span class="layer-label">Editable diagram</span><div class="diagram-nodes"><i>Source</i><b>→</b><i>Action</i><b>→</b><i>Result</i></div></div></div>
    <div class="slide-receipt"><span class="work-label">Revision receipt</span><strong>Version 02 → 03</strong><p>Source note linked<br>Render recorded<br>Reopen recorded</p>${chip('Illustrative receipt','good')}</div>`,

  gellphant: () => `${card('claim-card','Agent claim','“Ready to ship.”','<p>All edge cases handled.</p><div class="claim-confidence">Confident conclusion <span>✓</span></div>')}
    ${card('evidence-card','Actual evidence','Happy path only','<code>assert True</code><p>Failure-case receipt: missing</p>')}
    <div class="review-line"><span></span><i>Compare</i><span></span></div>
    <div class="gellphant-stamp">HOLD THE CLAIM</div><div class="review-result"><strong>Test the failure case.</strong><span>Replace the always-true assertion. Keep the broader claim unverified.</span></div>`,

  research: () => `${wire(['M154 120H250V55H345','M250 120V150H345'])}
    ${card('question-card','Question','Why was it paused?','<p>Chart revision</p>')}
    <div class="source-stack">${card('source-note','Retrieved reference','Source note','<p>Chart data not yet supplied</p>')}${card('decision-note','Decision record','Keep the draft on hold','<p>Pending the missing input</p>')}</div>
    <div class="handoff-folder"><span class="folder-tab">Portable handoff</span><strong>Resume from the current state</strong><div><span>Draft + sources</span><span>Open question</span><span>Next authorized action</span></div></div>`,

  observatory: () => `<div class="run-events"><div class="event-track"><i></i><i></i><i></i><i></i></div><div class="run-row"><span class="run-dot"></span><div><strong>Research run</strong><small>Completed · output recorded</small></div>${chip('Receipt found','good')}</div><div class="run-row exception"><span class="run-dot"></span><div><strong>Render run</strong><small>Reported complete · reopen evidence absent</small></div>${chip('Check required','warn')}</div></div>
    <div class="run-receipt"><span class="work-label">Recorded output</span><strong>source-notes.md</strong><span>Worker · machine · result path</span><p>Cost record attached to the run</p></div><div class="demo-outcome">${chip('Attention needed','warn')}<strong>Find the missing reopen receipt</strong><span>A completion event is only part of the record.</span></div>`,
};

export function renderDemo(id, roomArt = '') {
  const d = DEMOS[id];
  return `<div class="demo-track" data-demo-track><div class="demo-pin">${roomArt}
    <div class="demo-topline"><span><i aria-hidden="true"></i> ${id === 'lobby' ? 'Tool navigator' : e(d.product.split(' + ')[0])}</span><span>Illustrative example</span></div>
    <div class="demo-surface demo-${id}" id="${id}-demo" data-demo="${id}" data-step="2" aria-hidden="true">${scenes[id]()}</div>
    <div class="demo-controls" hidden><div class="demo-steps" role="group" aria-label="${e(d.product)} example steps">${d.steps.map((s,i)=>`<button type="button" data-demo-step="${i}" aria-pressed="${i===2}" aria-controls="${id}-demo ${id}-demo-caption"><span>${String(i+1).padStart(2,'0')}</span>${e(s.label)}</button>`).join('')}</div><button class="demo-play" type="button" data-demo-play aria-label="Play ${e(d.product)} example"><span aria-hidden="true">▷</span> Play</button></div>
    <p class="demo-caption" id="${id}-demo-caption">${e(d.steps[2].caption)}</p>
    <span class="demo-announcement sr-only" role="status" aria-live="polite"></span>
  </div></div>`;
}
