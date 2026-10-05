// Product explanations grounded in the inspected capability-discovery corpus.
// Animation examples are synthetic demonstrations, not connected product sessions.
export const DEMOS = {
  lobby: {
    product: 'The OpenMeow tool navigator',
    headline: 'Find the tool for the job.',
    summary: 'Start with an outcome: coordinate agents, create an editable deck, challenge a claim or plan the next funding move.',
    features: [
      { name: 'Browse by purpose', text: 'Eight rooms organize the work you want to do.' },
      { name: 'Compare capabilities', text: 'See what each tool takes in and produces.' },
      { name: 'Check readiness', text: 'Read the setup and development status before adopting.' },
    ],
    benefit: 'Spend less time decoding project names and more time choosing a useful workflow.',
    steps: [
      { label: 'Your goal', caption: 'Example: turn a source package into an editable presentation.' },
      { label: 'Find a match', caption: 'Follow the creation route to /dontgaslightme.' },
      { label: 'Know the next step', caption: 'Read the feature brief, expected output and current setup status.' },
    ],
  },
  operations: {
    product: 'FundMeMeow + Founder Ops',
    headline: 'Know what to pursue. Know what is blocked.',
    summary: 'FundMeMeow turns supplied funding opportunities into an actionable shortlist. Founder Ops prepares decision packets and source-linked weekly briefs.',
    features: [
      { name: 'Triage opportunities', text: 'Track intent, deadlines, preparation and reasons to defer.' },
      { name: 'Expose blockers', text: 'Keep missing prerequisites beside the opportunity.' },
      { name: 'Prepare decisions', text: 'Capture options, assumptions, next actions and review points.' },
    ],
    benefit: 'Focus preparation on the next feasible opportunity and keep the reason for each decision.',
    steps: [
      { label: 'Bring opportunities', caption: 'Three supplied opportunities have different deadlines and preparation requirements.' },
      { label: 'Check the blockers', caption: 'The soonest deadline is blocked by a missing partner letter; the seed opportunity is ready to prepare.' },
      { label: 'Choose the action', caption: 'Prioritize the seed application. Keep the blocked opportunity visible and request its missing letter.' },
    ],
  },
  'mission-control': {
    product: 'Subtle Lasagne',
    headline: 'One brief. Clear jobs for every agent.',
    summary: 'Design a workflow around a saved brief, bounded specialist assignments and inspectable returns. Keep dependencies and human checkpoints visible.',
    features: [
      { name: 'Define the work', text: 'Give each specialist a task, context and expected return.' },
      { name: 'Coordinate dependencies', text: 'Distinguish ready work from tasks waiting on an input.' },
      { name: 'Review the returns', text: 'Bring artifacts back to a shared checkpoint before continuing.' },
    ],
    benefit: 'Reduce repeated briefing and make ownership, dependencies and review easier to follow.',
    steps: [
      { label: 'Save the brief', caption: 'Example brief: build a sourced presentation with an editable chart.' },
      { label: 'Route the tasks', caption: 'Assign research and layout to specialists. Hold the chart task until its source data arrives.' },
      { label: 'Review the returns', caption: 'Collect the source notes and layout draft at a review checkpoint. The blocked task stays visible.' },
    ],
  },
  workshop: {
    product: 'Agent Mint + reusable skills',
    headline: 'Make delegation explicit before agents start.',
    summary: 'Agent Mint compiles task briefs into delegation packets with defined inputs, write boundaries, authority and return requirements.',
    features: [
      { name: 'Define the contract', text: 'Specify the role, source files, allowed writes and verifier.' },
      { name: 'Reuse the method', text: 'Attach skills for browser work, visual review or artifact creation.' },
      { name: 'Prepare the handoff', text: 'Lint packets and compile briefs for a chosen agent runtime.' },
    ],
    benefit: 'Give a worker a clear job and give its reviewer a concrete result to check.',
    steps: [
      { label: 'Define the job', caption: 'The reviewer can read the draft and sources, and write only a review report.' },
      { label: 'Fit the pieces', caption: 'Attach the review method and expected return. Keep release authority outside the worker contract.' },
      { label: 'Compile the packet', caption: 'Return a reusable delegation packet for the chosen runtime. Agent Mint prepares it; the runtime runs it.' },
    ],
  },
  creation: {
    product: '/dontgaslightme',
    headline: 'Editable slides. Evidence you can trace.',
    summary: 'Build presentations from source packages, keep text, charts and diagrams separate, and bind revisions to a specific deck version.',
    features: [
      { name: 'Keep elements editable', text: 'Work with slide structure, text, charts and diagram layers.' },
      { name: 'Link claims to sources', text: 'Carry evidence references alongside the artifact.' },
      { name: 'Verify the revision', text: 'Record version-bound edits with render and reopen receipts.' },
    ],
    benefit: 'Revise the deck without rebuilding a flattened image, and inspect the evidence behind a change.',
    steps: [
      { label: 'Bring the sources', caption: 'A source note, chart data and a layout brief become separate slide elements.' },
      { label: 'Assemble editable layers', caption: 'Text, chart and diagram layers move into the layout while retaining their structure.' },
      { label: 'Inspect the revision', caption: 'The example slide keeps its source reference and version receipt. Live provider and user-deck qualification remain in progress.' },
    ],
  },
  gellphant: {
    product: 'Gellphant',
    headline: 'Challenge the claim. Check the actual work.',
    summary: 'An anti-sycophancy review layer for claims, plans and agent output. Ask for evidence, surface uncertainty and inspect signs of apparent compliance.',
    features: [
      { name: 'Challenge agreement', text: 'Ask what would disprove the recommendation.' },
      { name: 'Inspect fake fixes', text: 'Review placeholders, swallowed errors and weakened assertions.' },
      { name: 'Make gaps visible', text: 'Separate evidence, assumptions and work still to verify.' },
    ],
    benefit: 'Get a specific challenge and a verification next step before relying on a confident answer.',
    steps: [
      { label: 'Read the claim', caption: 'An agent says: “All edge cases are handled. Ready to ship.”' },
      { label: 'Compare the evidence', caption: 'The example contains an always-true assertion and a happy-path result, with no failure-case receipt.' },
      { label: 'Hold the conclusion', caption: 'Gellphant asks for a meaningful failure-case check. A passing happy path does not support the broader claim.' },
    ],
  },
  research: {
    product: 'HISS + Portable Handoffs',
    headline: 'Find the source. Resume with the context.',
    summary: 'Route knowledge searches through retrieval strategies with visible traces. Preserve decisions, artifacts and open questions for the next session.',
    features: [
      { name: 'Trace the retrieval', text: 'See the strategy and references behind a retrieved result.' },
      { name: 'Keep source links', text: 'Connect notes and conclusions to the material used.' },
      { name: 'Carry the state forward', text: 'Package the current task, artifacts, authority and next step.' },
    ],
    benefit: 'Avoid rebuilding the story from chat fragments when another agent or session takes over.',
    steps: [
      { label: 'Ask a question', caption: 'Example: why was the chart revision paused?' },
      { label: 'Follow the references', caption: 'A retrieval trace points to the source note and the decision record.' },
      { label: 'Resume the work', caption: 'The handoff contains the draft, the missing input and the next authorized action.' },
    ],
  },
  observatory: {
    product: 'OpenMeow + Agent Run Ledger',
    headline: 'See the run. Find the result. Spot the gap.',
    summary: 'Follow agent events, task traces, costs and exceptions. Agent Run Ledger helps locate prior work, the machine that ran it and its saved outputs.',
    features: [
      { name: 'Follow activity', text: 'Connect task events and returns to the work they belong to.' },
      { name: 'Inspect cost and exceptions', text: 'See accounting records and work that needs attention.' },
      { name: 'Locate the output', text: 'Find the recorded result path and supporting receipt.' },
    ],
    benefit: 'Answer what ran, where the output is and which completion claims still need a receipt.',
    steps: [
      { label: 'Follow the events', caption: 'A research run and a render run report completion.' },
      { label: 'Check the receipts', caption: 'The research run has a saved output; the render run has no reopen receipt.' },
      { label: 'Find what needs attention', caption: 'Open the recorded output and follow up on the missing render evidence. This is illustrative telemetry.' },
    ],
  },
};

const brief = (room, input, output, setup) => ({
  input, output, setup, features: DEMOS[room].features, benefit: DEMOS[room].benefit,
});
export const CAPABILITY_BRIEFS = {
  'cap-1': { ...brief('operations', 'A supplied list of funding opportunities, deadlines and preparation requirements.', 'Triaged opportunity states, visible prerequisites, deferral reasons and a preparation shortlist.', 'Workflow components exist. Generic packaging and multi-user setup remain in progress.'), features: DEMOS.operations.features.slice(0, 2) },
  'cap-2': {
    input: 'Existing tasks, memory records and a decision to evaluate.',
    output: 'A source-linked weekly brief or a decision packet with options, assumptions and review criteria.',
    features: [
      { name: 'Weekly brief', text: 'Collect open tasks, recorded solutions and corrections from local files.' },
      { name: 'Decision packet', text: 'Prepare generator, verifier and reviser prompts for a bounded decision.' },
      { name: 'Action policy', text: 'Classify proposed actions as autonomous, approval-required or blocked.' },
    ],
    benefit: 'Make the next review easier to prepare and keep the assumptions behind a decision visible.',
    setup: 'Workflow scripts and templates. The decision harness prepares prompts; it does not call a model itself.',
  },
  'cap-3': {
    input: 'Agent activity, work to review and session context.',
    output: 'A shared architecture connecting observation, review and memory.',
    features: [
      { name: 'Watch', text: 'Observe agent activity and recorded outputs.' },
      { name: 'Gate', text: 'Bring work to an explicit review checkpoint.' },
      { name: 'Remember', text: 'Keep searchable context for later sessions.' },
    ],
    benefit: 'Connect the questions of what happened, whether it is supported and what to remember.',
    setup: 'Historical architecture and recovery materials. Current end-to-end integration is a concept, not a verified deployment.',
  },
  'cap-4': brief('mission-control', 'A saved project brief and the context each specialist needs.', 'Bounded assignments, dependency states, specialist returns and human checkpoints.', 'Source project. Host, runtime and provider integration depend on the chosen workflow.'),
  'cap-8': brief('workshop', 'Role descriptions, source inputs, permitted writes and expected returns.', 'Linted delegation packets and compiled briefs for a chosen runtime.', 'Skill and CLI source. It prepares contracts; it does not launch the worker team.'),
  'cap-10': brief('creation', 'Source packages, a presentation brief and the deck version to revise.', 'Structured deck proposals or version-bound edits with evidence and mutation receipts.', 'Authority and mutation components exist. Live providers and user-deck product acceptance remain unfinished.'),
  'cap-15': brief('gellphant', 'A claim, plan or agent output and the evidence offered in support.', 'Specific challenges, visible evidence gaps and verification questions.', 'Review prompts and experimental detector tools. Detector effectiveness needs further evaluation; human judgment remains necessary.'),
  'cap-19': {
    ...brief('research', 'A knowledge question and configured retrieval sources.', 'Retrieved references with strategy and event traces.', 'Retrieval component. Corpus quality and each live connector need separate evaluation.'),
    features: DEMOS.research.features.slice(0,2),
    benefit: 'Inspect where a retrieved result came from instead of accepting an unexplained answer.',
  },
  'cap-20': {
    ...brief('research', 'Current task state, saved artifacts, decisions and unresolved questions.', 'A re-entry packet with context, authority boundaries and the next action.', 'Reusable handoff methods. Packaging and source-specific adapters are in progress.'),
    features: [{name:'Save the state',text:'Record what is complete, pending and blocked.'},{name:'Locate the artifacts',text:'Carry exact output references instead of chat-only summaries.'},{name:'Define the re-entry',text:'Give the next agent its authorized scope and next action.'}],
  },
  'cap-22': brief('observatory', 'Agent events, task traces and recorded accounting data.', 'Inspectable activity, costs, exceptions and result records.', 'Observability source project. The tour demonstrates the model; it is not connected to your live agents.'),
  'cap-23': {
    ...brief('observatory', 'Recorded Codex and Claude Code plugin runs.', 'A recent-run summary with machine, request, result and output references.', 'Local plugin. Results depend on the runs recorded on the connected machine.'),
    features: [{name:'Find the run',text:'Look up recent recorded agent work.'},{name:'Identify the machine',text:'See where and through which CLI the work happened.'},{name:'Locate saved outputs',text:'Follow the recorded artifact references.'}],
    benefit: 'Recover the result of a prior agent session without guessing which chat or machine holds it.',
  },
};

const clamp = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const ramp = (value, start, end) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
export function demoFrame(value) {
  const progress = clamp(value);
  return {
    progress,
    step: progress < .3 ? 0 : progress < .7 ? 1 : 2,
    route: ramp(progress, .12, .54),
    resolve: ramp(progress, .58, .88),
  };
}
export const stepProgress = step => [0, .55, 1][Math.max(0, Math.min(2, step))] ?? 0;
export function playbackProgress(now, start, duration = 6400) {
  const progress = clamp((now - start) / Math.max(1, duration));
  return { progress, playing: progress < 1 };
}
export function isScrollKey(key, { editable = false, interactive = false } = {}) {
  return !editable && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(key) && !(key === ' ' && interactive);
}
export function resizeDestination({ inDirectory, hash, current }) {
  if (inDirectory) return /^#cap-\d+$/.test(hash) ? hash.slice(1) : 'directory';
  return current;
}
