export interface LearningStep {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface Prerequisite {
  name: string;
  verified: boolean;
}

export interface VerifiedResource {
  title: string;
  url: string;
  type: "manual" | "video_tutorial" | "documentation" | "checklist";
}

export interface LearningPathway {
  id: string;
  title: string;
  category: "mechanical" | "home_fabrication" | "fatherhood_movement" | "systems_ai" | "business_dba";
  description: string;
  prerequisites: Prerequisite[];
  steps: LearningStep[];
  verifiedResources: VerifiedResource[];
  reviewIntervalLevel: number; // 1, 2, 3, 4 (spaced repetition)
  lastReviewedDate?: string;
}

export const FOUNDER_LEARNING_PATHWAYS: LearningPathway[] = [
  {
    id: "mustang_oil_change",
    title: "2015 Ford Mustang V6 3.7L DIY Oil & Filter Change",
    category: "mechanical",
    description: "Full mechanical execution: 6.0 quarts Motorcraft 5W-20 Synthetic Blend, Motorcraft FL-500S oil filter, 15mm drain plug torque specs, and disposal protocol.",
    prerequisites: [
      { name: "Drive-on ramps or 3-ton hydraulic floor jack + jack stands", verified: true },
      { name: "Motorcraft FL-500S oil filter & 6 quarts 5W-20", verified: true },
      { name: "15mm socket/wrench, oil drain catch pan, funnel, nitrile gloves", verified: true },
    ],
    steps: [
      { id: "step-1", title: "Warm engine to 150°F and position vehicle on secure ramps with wheel chocks", estimatedMinutes: 15, completed: true },
      { id: "step-2", title: "Remove oil fill cap and position drain pan under the 15mm rear-facing oil pan bolt", estimatedMinutes: 10, completed: true },
      { id: "step-3", title: "Loosen 15mm drain plug, drain hot oil completely into pan (10 minutes)", estimatedMinutes: 15, completed: false },
      { id: "step-4", title: "Spin off old FL-500S filter, clean housing surface, and prep new filter O-ring with fresh oil", estimatedMinutes: 10, completed: false },
      { id: "step-5", title: "Hand-tighten new FL-500S filter (3/4 turn past gasket contact), reinstall 15mm plug to 19 lb-ft", estimatedMinutes: 10, completed: false },
      { id: "step-6", title: "Fill with exactly 6.0 quarts of 5W-20, idle engine 2 minutes, verify dipstick reading", estimatedMinutes: 15, completed: false },
    ],
    verifiedResources: [
      { title: "Ford Official 2015 Mustang 3.7L V6 Maintenance Manual Specs", url: "https://www.ford.com/support/manuals", type: "manual" },
      { title: "S550 Mustang 3.7L Oil Change Video Step-by-Step", url: "https://www.youtube.com/watch?v=s550-mustang-3-7-oil", type: "video_tutorial" },
    ],
    reviewIntervalLevel: 2,
    lastReviewedDate: "2026-10-01",
  },
  {
    id: "cheer_flyer_progression",
    title: "Father & Daughter Cheerleading Flyer Stunting Progression",
    category: "fatherhood_movement",
    description: "Safe, progressive partner stunting mechanics: building core stiffness in the flyer, locked hand grips, thigh stand, elevator lift, and cradle catch technique.",
    prerequisites: [
      { name: "Gym mat / soft grass surface", verified: true },
      { name: "Cheer flyer sneakers (flat flexible sole) and spotter awareness", verified: true },
    ],
    steps: [
      { id: "flyer-1", title: "Ground hollow-body drill: Teaching locked knees, tight core, and upright head position", estimatedMinutes: 15, completed: true },
      { id: "flyer-2", title: "Base hand grip biomechanics: Palm shelf grip under heel and arch support", estimatedMinutes: 15, completed: true },
      { id: "flyer-3", title: "Thigh Stand execution: Flyer steps to pockets, base locks thighs, flyer balances without hand support", estimatedMinutes: 20, completed: false },
      { id: "flyer-4", title: "Elevator Lift prep: Dip, drive from base legs, flyer stands tall at base chest level", estimatedMinutes: 25, completed: false },
      { id: "flyer-5", title: "Controlled Dismount & Cradle Catch: Absorbing catch high at chest level with locked elbows", estimatedMinutes: 20, completed: false },
    ],
    verifiedResources: [
      { title: "USA Cheer Stunt Progressions & Safety Standards", url: "https://www.usacheer.org/safety", type: "manual" },
    ],
    reviewIntervalLevel: 1,
    lastReviewedDate: "2026-10-02",
  },
  {
    id: "heavy_duty_tv_mount",
    title: "Heavy Duty Dual-Stud TV Wall Mounting",
    category: "home_fabrication",
    description: "Zero-sag mounting: Stud-center calibration, heavy-duty lag bolts, articulating arm leveling, and cable concealment.",
    prerequisites: [
      { name: "Magnetic + electronic stud finder with deep scan mode", verified: true },
      { name: "Power drill, 7/32\" wood pilot bit, socket ratchet, bubble level", verified: true },
      { name: "Heavy duty dual-arm VESA articulating bracket + 4x 3\" lag bolts", verified: true },
    ],
    steps: [
      { id: "tv-1", title: "Scan wall and locate true center of two wood studs at 16\" spacing", estimatedMinutes: 20, completed: true },
      { id: "tv-2", title: "Mark eye-level height (42\" from floor to TV center) and align wall bracket using magnetic level", estimatedMinutes: 15, completed: true },
      { id: "tv-3", title: "Pre-drill 4 pilot holes with 7/32\" bit 3 inches deep into center studs", estimatedMinutes: 15, completed: false },
      { id: "tv-4", title: "Ratchet lag bolts with washers firmly into studs; perform 100 lb downward pull load test", estimatedMinutes: 15, completed: false },
      { id: "tv-5", title: "Attach VESA bracket to TV back, hang on wall plate, tighten safety lock screws", estimatedMinutes: 15, completed: false },
    ],
    verifiedResources: [
      { title: "VESA Mounting Standard & Stud Anchoring Safety Guidelines", url: "https://vesa.org/standards", type: "documentation" },
    ],
    reviewIntervalLevel: 1,
  },
  {
    id: "bed_frame_build",
    title: "King Solid Wood Bed Frame Structural Completion",
    category: "home_fabrication",
    description: "Finishing the bed frame: Precision corner joining, center rail beam leveling, structural slat fastening, and squeak elimination.",
    prerequisites: [
      { name: "Hex drive bits, wood screws, rubber mallet, felt padding", verified: true },
    ],
    steps: [
      { id: "bed-1", title: "Square side rails to headboard and footboard at exact 90-degree angles", estimatedMinutes: 20, completed: true },
      { id: "bed-2", title: "Install heavy steel corner tension brackets and torque hex fasteners", estimatedMinutes: 20, completed: true },
      { id: "bed-3", title: "Mount heavy-duty center support beam with adjustable leveling feet", estimatedMinutes: 25, completed: false },
      { id: "bed-4", title: "Distribute solid pine support slats (max 3\" gap) and fasten with structural screws", estimatedMinutes: 30, completed: false },
    ],
    verifiedResources: [
      { title: "Timber Bed Frame Joinery & Anti-Squeak Protocol", url: "https://woodworkingarchive.org/bed-joinery", type: "manual" },
    ],
    reviewIntervalLevel: 1,
  },
  {
    id: "ultron_private_llm",
    title: "Ultron Self-Hosted Private LLM & Antigravity Skill Indexing",
    category: "systems_ai",
    description: "Deploying high-speed private local models with Ollama/vLLM, GPU offloading, local vector embeddings, and Antigravity custom skill bindings.",
    prerequisites: [
      { name: "NVIDIA RTX GPU with CUDA 12+ acceleration or Apple Silicon", verified: true },
      { name: "Ollama / vLLM runtime installed and exposed on localhost:11434", verified: true },
    ],
    steps: [
      { id: "llm-1", title: "Pull Qwen 2.5 14B / DeepSeek quantized weights into local Ollama runtime", estimatedMinutes: 20, completed: true },
      { id: "llm-2", title: "Verify GPU VRAM offload (100% layers in VRAM) and measure tokens/sec throughput", estimatedMinutes: 15, completed: true },
      { id: "llm-3", title: "Mount local embeddings pipeline for private DBA doctoral notes and business documents", estimatedMinutes: 30, completed: false },
      { id: "llm-4", title: "Bind Ultron local endpoint into Antigravity workspace sidecar configuration", estimatedMinutes: 20, completed: false },
    ],
    verifiedResources: [
      { title: "Ollama Official Documentation & Modelfile Spec", url: "https://ollama.ai/docs", type: "documentation" },
    ],
    reviewIntervalLevel: 2,
  },
  {
    id: "consulting_acquisition",
    title: "Stoic Business Consulting Firm — Client Acquisition & Sales",
    category: "business_dba",
    description: "Systematizing AI automation consulting sales: Fiverr Pro gig packages, local SMB in-person executive pitches, and high-margin retainers.",
    prerequisites: [
      { name: "Portfolio case studies live on Vercel (CaptionBot, AiVisor, DocsBot)", verified: true },
      { name: "Value pricing framework ($3,500 - $10,000 corporate AI transformation)", verified: true },
    ],
    steps: [
      { id: "biz-1", title: "Publish 3 high-converting Fiverr gigs focused on Autonomous AI Workflow Systems", estimatedMinutes: 45, completed: true },
      { id: "biz-2", title: "Draft 1-page executive one-pager showcasing measurable ROI for local town businesses", estimatedMinutes: 30, completed: true },
      { id: "biz-3", title: "Conduct 5 in-person visits to commercial business owners in town with live iPad demo", estimatedMinutes: 90, completed: false },
      { id: "biz-4", title: "Close first $5,000 monthly automation retainer with weekly milestone deliverables", estimatedMinutes: 60, completed: false },
    ],
    verifiedResources: [
      { title: "Fiverr Pro Seller Excellence & Retainer Playbook", url: "https://www.fiverr.com/pro", type: "manual" },
    ],
    reviewIntervalLevel: 1,
  },
];

export function calculatePathwayProgress(pathway: LearningPathway): {
  completedSteps: number;
  totalSteps: number;
  percentage: number;
} {
  const total = pathway.steps.length;
  if (total === 0) return { completedSteps: 0, totalSteps: 0, percentage: 0 };
  const completed = pathway.steps.filter((s) => s.completed).length;
  return {
    completedSteps: completed,
    totalSteps: total,
    percentage: Math.round((completed / total) * 100),
  };
}

export function calculateNextReviewDate(baseDate: Date, intervalLevel: number): Date {
  const result = new Date(baseDate);
  // SM-2 Lite interval ladder: Level 1 = 1 day, Level 2 = 3 days, Level 3 = 7 days, Level 4 = 14 days
  const daysToAdd = intervalLevel === 1 ? 1 : intervalLevel === 2 ? 3 : intervalLevel === 3 ? 7 : 14;
  result.setUTCDate(result.getUTCDate() + daysToAdd);
  return result;
}
