// Public-facing capability summary. Private discovery evidence stays outside this bundle.
export const ROOMS = [
  {
    id: "arrival",
    name: "The whole world",
    floor: "Welcome",
    verb: "A place for every part of the work.",
    body: "Discover agents, skills and workflows. Move from a first idea to something you can make, question and build on.",
    alt: "A contemporary miniature headquarters with five inhabited floors and a glazed rooftop observatory.",
    landscape: "media/world/arrival-landscape.png",
    portrait: "media/world/arrival-portrait.png",
  },
  {
    id: "lobby",
    name: "Lobby & concierge",
    floor: "Ground · 01",
    verb: "Start with what you want to do.",
    body: "A useful brief opens the right door. Find a capability by outcome, then explore the tools and workflows behind it.",
    alt: "An orange cat concierge matches a visitor's brief to a capability and hands over a starter folder.",
    flow: ["Your goal", "A fitting capability", "A place to begin"],
    anchor: "Find a capability",
    href: "#directory",
    landscape: "media/world/lobby-landscape.png",
    portrait: "media/world/lobby-portrait.png",
  },
  {
    id: "operations",
    name: "Operations & funding",
    floor: "Ground · 02",
    verb: "Give the next decision a little clarity.",
    body: "Compare opportunities, surface prerequisites and choose the next action. A home for FundMeMeow and the everyday decision routines of Founder Ops.",
    alt: "Two orange cats compare opportunity cards with a checklist and place a selected option into a calendar.",
    flow: ["Opportunities", "Requirements & blockers", "Next action"],
    anchor: "Explore the workflows",
    href: "#directory",
    tag: "Workflow components · packaging in progress",
    landscape: "media/world/operations-landscape.png",
    portrait: "media/world/operations-portrait.png",
  },
  {
    id: "mission-control",
    name: "Mission control",
    floor: "Level 01 · 03",
    verb: "Many specialists. One shared brief.",
    body: "Subtle Lasagne brings workflow design and bounded specialist work together. Plan assignments, inspect checkpoints and keep human decisions in the loop.",
    alt: "Three orange cats route a brief into specialist tasks, with an amber paused task and a review checkpoint.",
    flow: ["Saved brief", "Bounded assignments", "Reviewed returns"],
    anchor: "Explore Subtle Lasagne",
    href: "https://github.com/EverythingHertz/Subtle-Lasagne",
    tag: "Source project · integration in progress",
    landscape: "media/world/mission-control-landscape.png",
    portrait: "media/world/mission-control-portrait.png",
  },
  {
    id: "workshop",
    name: "Agent & plugin workshop",
    floor: "Level 01 · 04",
    verb: "Build a team that fits the task.",
    body: "Prepare role briefs, reuse proven skills and inspect how the pieces connect. Agent Mint turns delegation into explicit inputs, boundaries and return contracts.",
    alt: "Orange cats compare a role brief and skill cards while fitting a matching connector into a capability kit.",
    flow: ["Role & inputs", "Skills & connectors", "Inspectable package"],
    anchor: "Explore Agent Mint",
    href: "https://github.com/EverythingHertz/agent-mint",
    tag: "Tooling & skills · setup required",
    landscape: "media/world/workshop-landscape.png",
    portrait: "media/world/workshop-portrait.png",
  },
  {
    id: "creation",
    name: "Creation studios",
    floor: "Level 02 · 05",
    verb: "Make it. Keep it editable.",
    body: "/dontgaslightme is the home for presentations with editable structure, linked evidence and deliberate revisions. Nearby: graphics, 3D and visual production workflows.",
    alt: "Orange cats assemble separate presentation layers and connect the resulting slide to source cards.",
    flow: ["Sources & layers", "Deliberate edits", "Traceable artifact"],
    anchor: "Explore /dontgaslightme",
    href: "https://github.com/EverythingHertz/DONTGASLIGHTME",
    tag: "Source project · provider setup required",
    landscape: "media/world/creation-landscape.png",
    portrait: "media/world/creation-portrait.png",
  },
  {
    id: "gellphant",
    name: "Gellphant review chamber",
    floor: "Level 03 · 06",
    verb: "A good idea can handle a hard question.",
    body: "Meet Gellphant, the anti-sycophant elephant. Challenge confident claims, compare them with the evidence and make uncertainty visible before moving forward.",
    alt: "Gellphant points to source evidence while an orange cat presents a more ambitious chart on a tablet.",
    flow: ["Claim", "Evidence & challenge", "Clearer judgment"],
    anchor: "Meet Gellphant",
    href: "https://github.com/EverythingHertz/gellphant",
    tag: "Review tools & prompts · human judgment matters",
    landscape: "media/world/gellphant-landscape.png",
    portrait: "media/world/gellphant-portrait.png",
  },
  {
    id: "research",
    name: "Research & memory",
    floor: "Level 04 · 07",
    verb: "Find the source. Keep the thread.",
    body: "Connect questions to references and useful notes. HISS retrieval and portable handoffs help carry context from one session to the next.",
    alt: "Orange cats follow linked source cards and retrieve the matching handoff folder from a contemporary archive.",
    flow: ["Question", "Linked sources", "Resumable context"],
    anchor: "Explore HISS",
    href: "https://github.com/EverythingHertz/openmeow/tree/main/agents_cat/hiss",
    tag: "Retrieval & handoff tools · setup required",
    landscape: "media/world/research-landscape.png",
    portrait: "media/world/research-portrait.png",
  },
  {
    id: "observatory",
    name: "The observatory",
    floor: "Roof · 08",
    verb: "See what actually happened.",
    body: "Follow runs, inspect exceptions and account for the work. OpenMeow and Agent Run Ledger give receipts, costs and prior activity a place to be seen.",
    alt: "Orange cats inspect an agent run timeline, an amber exception and a corresponding receipt in a glass rooftop observatory.",
    flow: ["Run events", "Costs & exceptions", "Inspectable record"],
    anchor: "Explore OpenMeow",
    href: "https://github.com/EverythingHertz/openmeow",
    tag: "Observability components · connection required",
    landscape: "media/world/observatory-landscape.png",
    portrait: "media/world/observatory-portrait.png",
  },
];
export const CAPABILITIES = [
  {
    id: "cap-1",
    name: "FundMeMeow",
    room: "operations",
    description:
      "Prioritize supplied funding opportunities by deadlines, requirements and blockers.",
    type: "Workflow",
    status: "Packaging in progress",
    href: null,
  },
  {
    id: "cap-2",
    name: "Founder Ops",
    room: "operations",
    description:
      "Decision memos, weekly briefs, meeting preparation and follow-up routines.",
    type: "Workflow",
    status: "Packaging in progress",
    href: null,
  },
  {
    id: "cap-3",
    name: "FounderOS",
    room: "observatory",
    description:
      "Watch, gate and remember: an umbrella for observation, review and session memory.",
    type: "Architecture",
    status: "Integration concept",
    href: null,
  },
  {
    id: "cap-4",
    name: "Subtle Lasagne",
    room: "mission-control",
    description:
      "Design workflows and coordinate bounded specialist assignments and returns.",
    type: "Platform",
    status: "Source project",
    href: "https://github.com/EverythingHertz/Subtle-Lasagne",
  },
  {
    id: "cap-5",
    name: "agentctl",
    room: "mission-control",
    description:
      "Inspect repository contracts and find dependency-ready mission tasks.",
    type: "CLI",
    status: "Component",
    href: "https://github.com/EverythingHertz/SubtleLasagne.ai",
  },
  {
    id: "cap-6",
    name: "Sovereign Task Loop",
    room: "mission-control",
    description:
      "Preserve tasks, checkpoints, human decisions and result artifacts.",
    type: "Runtime component",
    status: "Packaging in progress",
    href: null,
  },
  {
    id: "cap-7",
    name: "Voice Orchestrator",
    room: "mission-control",
    description: "Supervise worker events, policy, cancellation and recovery.",
    type: "Runtime component",
    status: "Source project",
    href: "https://github.com/EverythingHertz/voice-orchestrator",
  },
  {
    id: "cap-8",
    name: "Agent Mint",
    room: "workshop",
    description:
      "Prepare delegation contracts with inputs, authority and return requirements.",
    type: "Skill & CLI",
    status: "Source project",
    href: "https://github.com/EverythingHertz/agent-mint",
  },
  {
    id: "cap-9",
    name: "Skills library",
    room: "workshop",
    description:
      "Reusable methods for browser work, visual review and artifact production.",
    type: "Skills",
    status: "Source library",
    href: "https://github.com/EverythingHertz/skills-library",
  },
  {
    id: "cap-10",
    name: "/dontgaslightme",
    room: "creation",
    description:
      "Create editable decks with evidence, version-bound edits and receipts.",
    type: "Product",
    status: "Source project",
    href: "https://github.com/EverythingHertz/DONTGASLIGHTME",
  },
  {
    id: "cap-11",
    name: "EditMeow",
    room: "creation",
    description:
      "Explore conversion from fixed graphics into editable elements.",
    type: "Integration",
    status: "Upstream-based project",
    href: "https://github.com/EverythingHertz/EditMeow",
  },
  {
    id: "cap-12",
    name: "BlenderFleet",
    room: "creation",
    description: "Build and measure 3D artifacts from sourced specifications.",
    type: "3D workflow",
    status: "Source project",
    href: "https://github.com/EverythingHertz/blenderfleet",
  },
  {
    id: "cap-13",
    name: "Visual Workflows",
    room: "creation",
    description:
      "Review visual references and compose real text over generated imagery.",
    type: "Workbench",
    status: "Source project",
    href: "https://github.com/EverythingHertz/visual-workflows",
  },
  {
    id: "cap-14",
    name: "Ambient Loops",
    room: "creation",
    description: "Produce atmospheric visuals, parallax and generative audio.",
    type: "Media workflow",
    status: "Source project",
    href: "https://github.com/EverythingHertz/ambient-loops",
  },
  {
    id: "cap-15",
    name: "Gellphant",
    room: "gellphant",
    description:
      "Challenge unsupported claims, apparent compliance and weak verification.",
    type: "Review agent",
    status: "Tools & prompts",
    href: "https://github.com/EverythingHertz/gellphant",
  },
  {
    id: "cap-16",
    name: "Take a Second Look",
    room: "gellphant",
    description:
      "Review plans for omissions, failure paths and verification gaps.",
    type: "Review skill",
    status: "Packaging in progress",
    href: null,
  },
  {
    id: "cap-17",
    name: "Proof Mode",
    room: "gellphant",
    description:
      "Collect browser and interaction evidence before calling work done.",
    type: "Verification skill",
    status: "Source project",
    href: "https://github.com/EverythingHertz/proof-mode",
  },
  {
    id: "cap-18",
    name: "Evidence-to-release studio",
    room: "gellphant",
    description:
      "Connect evidence, visual review, approval and released artifact versions.",
    type: "Workflow",
    status: "Local plugin",
    href: null,
  },
  {
    id: "cap-19",
    name: "HISS",
    room: "research",
    description:
      "Retrieve knowledge through interchangeable strategies with visible traces.",
    type: "Retrieval layer",
    status: "Component",
    href: "https://github.com/EverythingHertz/openmeow",
  },
  {
    id: "cap-20",
    name: "Portable Handoffs",
    room: "research",
    description:
      "Resume work across agents and sessions with explicit artifacts and authority.",
    type: "Skill",
    status: "Packaging in progress",
    href: null,
  },
  {
    id: "cap-21",
    name: "SL Drift",
    room: "research",
    description:
      "Check transferred artifacts and configuration for unexpected changes.",
    type: "Verification toolkit",
    status: "Packaging in progress",
    href: null,
  },
  {
    id: "cap-22",
    name: "OpenMeow",
    room: "observatory",
    description:
      "Explore agent events, task traces, costs and structured receipts.",
    type: "Observability",
    status: "Source project",
    href: "https://github.com/EverythingHertz/openmeow",
  },
  {
    id: "cap-23",
    name: "Agent Run Ledger",
    room: "observatory",
    description:
      "Find what ran, on which machine, and where the result was saved.",
    type: "Plugin",
    status: "Local plugin",
    href: null,
  },
];
export function roomFromHash(hash) {
  let id;
  try {
    id = decodeURIComponent(String(hash).replace(/^#/, ""));
  } catch {
    return "arrival";
  }
  return ROOMS.some((room) => room.id === id) ? id : "arrival";
}
export function motionEnabled({ reduced = false, paused = false } = {}) {
  return !reduced && !paused;
}
export function searchCapabilities(query = "") {
  const terms = String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
  return CAPABILITIES.filter((item) =>
    terms.every((term) =>
      (item.name + " " + item.description + " " + item.type)
        .toLowerCase()
        .includes(term),
    ),
  );
}
