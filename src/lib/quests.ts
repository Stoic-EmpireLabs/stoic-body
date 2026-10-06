export type QuestCategory =
  | "Makerspace & Mechanical"
  | "Home Infrastructure & Fabrication"
  | "AI Systems & Sovereign Tech"
  | "Combat Conditioning & Athletics"
  | "Fatherhood & Tribe";

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  difficulty: "Initiate" | "Routine" | "Challenging" | "Boss" | "Legendary";
  tier: number;
  xpReward: number;
  attributeTarget: "Strength" | "Endurance" | "Discipline" | "Knowledge" | "Recovery";
  estimatedTime: string;
  description: string;
  steps: string[];
}

export const PRELOADED_QUESTS: Quest[] = [
  // 1. Makerspace & Mechanical
  {
    id: "q-mustang",
    title: "2015 Ford Mustang V6 3.7L DIY Oil & Filter Change",
    category: "Makerspace & Mechanical",
    difficulty: "Legendary",
    tier: 5,
    xpReward: 3500,
    attributeTarget: "Knowledge",
    estimatedTime: "45 mins",
    description:
      "Master automotive self-reliance: Save money, build vehicle knowledge, and change your own motor oil using verified Ford factory specifications.",
    steps: [
      "Acquire 6.0 Quarts 5W-20 Full Synthetic Oil & Motorcraft FL-500S Filter",
      "Warm engine 3 minutes, chock rear wheels, drive onto ramps or set jack stands",
      "Loosen 15mm oil pan drain bolt into pan; inspect magnetic drain plug for metal shavings",
      "Spin off old filter; lube fresh rubber gasket with new oil; hand-tighten FL-500S snug",
      "Torque drain plug to 19 lb-ft, pour 6.0 qts 5W-20, check dipstick level, reset dash oil meter",
    ],
  },
  {
    id: "q-brakes",
    title: "Front Brake Pads & Rotor Thickness Inspection",
    category: "Makerspace & Mechanical",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Knowledge",
    estimatedTime: "60 mins",
    description:
      "Execute front disc brake service: check pad friction material (>4mm), measure rotor runout, and inspect caliper slide pins.",
    steps: [
      "Loosen lug nuts, safely jack front axle onto rated 3-ton jack stands",
      "Remove wheel, inspect brake pad lining thickness using digital caliper gauge",
      "Inspect rotor face for deep grooving, heat discoloration, or structural lip",
      "Check caliper slide pin boots for dry rot and verify smooth sliding motion",
      "Re-mount wheels, torque lug nuts in star pattern to 100 lb-ft specification",
    ],
  },
  {
    id: "q-sparkplugs",
    title: "Spark Plug & Ignition Coil Renewal (0.051\" Gap)",
    category: "Makerspace & Mechanical",
    difficulty: "Challenging",
    tier: 3,
    xpReward: 750,
    attributeTarget: "Knowledge",
    estimatedTime: "40 mins",
    description:
      "Restore crisp throttle response and clean combustion by verifying spark plug electrode gaps and seating fresh iridium plugs.",
    steps: [
      "Disconnect negative battery terminal and unclip upper intake manifold hoses",
      "Unplug coil-on-plug (COP) electrical connectors and unbolt 8mm retainer bolts",
      "Use 5/8\" magnetic spark plug socket to remove old plugs; inspect electrode color",
      "Verify new Iridium plug gap at exactly 0.051 inch using wire feeler gauge",
      "Thread plugs by hand to prevent cross-threading, torque to 11 lb-ft, apply dielectric grease",
    ],
  },

  // 2. Home Infrastructure & Fabrication
  {
    id: "q-tv",
    title: "Precision TV Wall-Mount Installation with Stud Alignment",
    category: "Home Infrastructure & Fabrication",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Strength",
    estimatedTime: "45 mins",
    description:
      "Mount flat screen TV securely to wall studs with heavy-duty lag bolts, ensuring perfect horizontal bubble level.",
    steps: [
      "Locate center of wood wall studs using magnetic/ultrasonic stud finder and verify center",
      "Align heavy metal wall bracket using precision torpedo bubble level and scribe pilot hole marks",
      "Pre-drill 3/16 inch pilot holes deep into center of studs",
      "Drive heavy-duty lag bolts with ratchet socket firmly into studs without stripping",
      "Hang TV onto bracket arms, tighten safety retention bolts, and route cables cleanly",
    ],
  },
  {
    id: "q-heavybag",
    title: "Heavy Bag Ceiling Joist Spring Anchor Mount",
    category: "Home Infrastructure & Fabrication",
    difficulty: "Challenging",
    tier: 3,
    xpReward: 750,
    attributeTarget: "Strength",
    estimatedTime: "30 mins",
    description:
      "Install vibration-damped heavy bag ceiling mount across two ceiling joists to withstand repeated 100-lb kinetic impacts.",
    steps: [
      "Inspect garage ceiling drywall to identify orientation of main roof trusses",
      "Cut 2x6 structural header plank spanning minimum two 16\" on-center joists",
      "Fasten header plank with four 3.5\" structural timber screws per joist",
      "Mount heavy steel eye-bolt and industrial shock-absorbing coil spring",
      "Hang 100-lb heavy bag, check height so center of bag aligns with solar plexus",
    ],
  },
  {
    id: "q-pullup",
    title: "Garage Calisthenics Wall-Mounted Pull-Up Rig",
    category: "Home Infrastructure & Fabrication",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Strength",
    estimatedTime: "60 mins",
    description:
      "Fabricate solid steel wall-mount pull-up and muscle-up station with 36\" wall clearance.",
    steps: [
      "Locate masonry or 3 structural wall studs with minimum 48\" horizontal span",
      "Mount horizontal 2x8 stringer board to anchor points with 1/2\" lag shields",
      "Bolt triangular steel support brackets to stringer with lock washers",
      "Secure 1.25\" outer-diameter powder-coated steel crossbar with safety pins",
      "Perform static hang and dynamic kipping test to verify zero deflection or creak",
    ],
  },

  // 3. AI Systems & Sovereign Tech
  {
    id: "q-ultron",
    title: "Ultron Self-Hosted Private LLM & Knowledge Pipeline",
    category: "AI Systems & Sovereign Tech",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Knowledge",
    estimatedTime: "90 mins",
    description:
      "Deploy private self-hosted LLM runtime with local knowledge indexing, private weights, and agent tool execution.",
    steps: [
      "Verify GPU VRAM allocations and model quantizations (Ollama / vLLM / Qwen 2.5 14B)",
      "Index Antigravity workspace skills, personal notes, and doctoral research papers",
      "Expose OpenAI-compatible endpoint with token rate limiting and CORS protection",
      "Run offline test queries verifying zero telemetry or unconsented external leaks",
    ],
  },
  {
    id: "q-antigravity",
    title: "Antigravity Autonomous Agent Workspace Verification",
    category: "AI Systems & Sovereign Tech",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Knowledge",
    estimatedTime: "45 mins",
    description:
      "Set up Antigravity multi-agent workspace pipelines with automated testing, Playwright verification, and Vercel production CI.",
    steps: [
      "Verify GitHub CLI authentication and SSH key binding for stoic-empirelabs",
      "Configure Vercel CLI credentials and production deployment pipeline",
      "Validate Playwright headless browser test suite runs 100% offline",
      "Run subagent orchestration dry-run to verify parallel tool invocation",
    ],
  },
  {
    id: "q-vector",
    title: "Offline Local Vector Database for Doctoral DBA Notes",
    category: "AI Systems & Sovereign Tech",
    difficulty: "Challenging",
    tier: 3,
    xpReward: 750,
    attributeTarget: "Knowledge",
    estimatedTime: "60 mins",
    description:
      "Chunk, embed, and store doctoral research PDFs into a private local SQLite vector database for zero-latency semantic recall.",
    steps: [
      "Parse doctoral PDF literature reviews and dissertation proposals into 500-token chunks",
      "Generate embeddings using local BGE-small or nomic-embed-text via Ollama",
      "Persist embeddings into SQLite table with cosine similarity query indices",
      "Run semantic similarity benchmark comparing top-3 document retrieval hits",
    ],
  },

  // 4. Combat Conditioning & Athletics
  {
    id: "q-calisthenics-100",
    title: "100 Strict Consecutive Push-Up & Hollow Body Burnout",
    category: "Combat Conditioning & Athletics",
    difficulty: "Challenging",
    tier: 3,
    xpReward: 750,
    attributeTarget: "Strength",
    estimatedTime: "20 mins",
    description:
      "Execute strict calisthenics volume: chest touching floor, elbows tucked 45°, full scapular protraction at the top of every rep.",
    steps: [
      "Execute Set 1: 30 strict military push-ups with 2-second hollow-body plank finish",
      "60-second recovery with deep nasal breathing and shoulder circles",
      "Execute Set 2: 25 diamond push-ups targeting inner chest and tricep heads",
      "Execute Set 3: 25 wide-grip push-ups with 1-second pause at bottom stretch",
      "Execute Set 4: 20 push-ups burnout to mechanical failure + 30s hollow rock hold",
    ],
  },
  {
    id: "q-boxing-gauntlet",
    title: "6-Round Championship Heavy Bag & Shadowboxing Gauntlet",
    category: "Combat Conditioning & Athletics",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Endurance",
    estimatedTime: "25 mins",
    description:
      "Complete 6 full 3-minute championship rounds with 1-minute active rests, maintaining chin tucked and non-stop punch volume.",
    steps: [
      "Round 1: Long-range probe — 1-2 (Jab-Cross) with footwork pivots and circle-outs",
      "Round 2: Mid-range pressure — 1-2-3 (Jab-Cross-Lead Hook) with level changes",
      "Round 3: Infighting body attack — Double body hook, slip left, rear uppercut",
      "Round 4: High velocity sprint — 30-second shoe-shine flurries on heavy bag",
      "Round 5: Defensive slip counters — Slip outside cross, counter lead hook to liver",
      "Round 6: Championship blowout — Maximum punch volume, zero retreat, full heart",
    ],
  },
  {
    id: "q-recomp-milestone",
    title: "The 170 -> 155 lbs Recomp Single-Digit Body Fat Milestone",
    category: "Combat Conditioning & Athletics",
    difficulty: "Legendary",
    tier: 5,
    xpReward: 3500,
    attributeTarget: "Discipline",
    estimatedTime: "10 Weeks",
    description:
      "Achieve the Spartan Sovereign physique: Drop from 170 lbs to 155 lbs, oxidise 10.9 lbs of pure fat mass, and reveal chisel-cut abdominal definition.",
    steps: [
      "Maintain 14 consecutive days of 23:1 OMAD fasting adherence (140g protein)",
      "Complete 20 Incline Treadmill Walks (12% incline, 3.0 MPH, 20 mins)",
      "Reduce waist circumference from 33.5\" to 31.0\" on tape telemetry",
      "Log rolling 7-day scale weight trend confirming -1.0 to -1.5 lbs/week velocity",
      "Capture final milestone check-in photo in the Realistic Goal Physique Studio",
    ],
  },

  // 5. Fatherhood & Tribe
  {
    id: "q-cheer-stunting",
    title: "Partner Flyer Stunt Progression: Elevator Extension & Cradle Catch",
    category: "Fatherhood & Tribe",
    difficulty: "Boss",
    tier: 4,
    xpReward: 1500,
    attributeTarget: "Strength",
    estimatedTime: "30 mins",
    description:
      "Master father-daughter cheer stunting biomechanics: locked flyer core, base palm shelf, explosive leg drive, and soft cradle absorption.",
    steps: [
      "Review safety protocols, soft landing mat positioning, and designated spotter cues",
      "Flyer executes ground hollow-body drill with locked knees and pointed toes",
      "Base establishes secure palm-shelf grip under arches with elbows pinned to torso",
      "Execute 5 clean thigh-stand mounts verifying balanced center of gravity",
      "Execute elevator extension to chest height, lock out, and absorb smooth cradle catch",
    ],
  },
  {
    id: "q-youth-boxing",
    title: "Youth Boxing Fundamentals: Stance, 1-2 Combo & Head Movement",
    category: "Fatherhood & Tribe",
    difficulty: "Challenging",
    tier: 3,
    xpReward: 750,
    attributeTarget: "Discipline",
    estimatedTime: "30 mins",
    description:
      "Teach the next generation the noble art of self-defense: balance, stance discipline, straight punches, and defensive respect.",
    steps: [
      "Tape a balance line on the floor to drill 45° athletic boxing stance",
      "Teach hands-up guard: lead hand at eyebrow level, rear hand glued to chin",
      "Drill step-and-jab mechanics: moving lead foot and snapping jab synchronously",
      "Introduce rear cross hip rotation: turning the rear heel like squishing a bug",
      "Practice 3 rounds of light focus-mitt catching with positive praise and encouragement",
    ],
  },
  {
    id: "q-wilderness",
    title: "Weekend Wilderness Navigation & Campfire Mastery",
    category: "Fatherhood & Tribe",
    difficulty: "Challenging",
    tier: 3,
    xpReward: 750,
    attributeTarget: "Recovery",
    estimatedTime: "120 mins",
    description:
      "Build outdoor self-reliance: Navigate with physical topographic map, forage kindling, and strike a flint campfire without matches.",
    steps: [
      "Orient topographic map to magnetic North using baseplate compass",
      "Identify 3 major terrain features (ridge, saddle, wash) on physical map",
      "Gather tinder (dry birch bark / dryer lint), kindling (pencil-thin twigs), and fuel logs",
      "Strike ferrocerium rod with steel striker to ignite tinder bundle in fire pit",
      "Build sustainable teepee fire structure and enjoy unplugged digital-detox silence",
    ],
  },
];

export function getQuestsByCategory(category?: QuestCategory | "All"): Quest[] {
  if (!category || category === "All") return PRELOADED_QUESTS;
  return PRELOADED_QUESTS.filter((q) => q.category === category);
}
