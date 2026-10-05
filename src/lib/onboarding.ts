/**
 * Stoic Sovereign — Host Onboarding & Guided Walkthrough Engine
 * Provides client intake calibration, multi-week campaign scheduling, and interactive tab-by-tab tour.
 */

import { generateMultiWeekSchedule, MultiWeekCampaignEvent } from "@/lib/scheduling";

export interface QuestionnaireAnswers {
  callsign: string;
  gender?: "male" | "female";
  primaryGoal?: "cut" | "recomp" | "bulk" | "maintain";
  startingBodyType?: "slender" | "average" | "fuller" | "athletic";
  targetPhysique?: "spartan" | "gladiator" | "titan" | "sculpted";
  userPhotoUrl?: string;
  age: number;
  height: string;
  currentWeight: number;
  targetWeight: number;
  targetWeeks: number; // e.g. 4, 8, 10, 12, 16 weeks
  targetDate?: string;
  primaryMission: string;
  fastingProtocol: "23:1 OMAD" | "16:8 Lean Gains" | "20:4 Warrior Diet" | "3 Clean Meals" | "Liquid Diet / Smoothies" | "Carnivore / Animal-Based" | string;
  proteinPreference: "Fish" | "Turkey" | "Chicken" | "Lean Beef" | "Plant Protein" | string;
  foodPreferences?: string[];
  hydrationFocus: "Lemon Chia Water" | "Fasting Electrolytes" | "EGCG Matcha" | "All Elixirs";
  trainingFocus: "Calisthenics" | "Boxing" | "Incline Walk" | "Hybrid All-Around" | string;
  trainingDaysPerWeek: number;
  stoicHabits?: string[];
  techMasteryTrack?: string;
  dailyStudyMinutes?: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  role: "founder" | "client";
  callsign: string;
  gender?: "male" | "female";
  primaryGoal?: "cut" | "recomp" | "bulk" | "maintain";
  startingBodyType?: string;
  targetPhysique?: string;
  userPhotoUrl?: string;
  age: number;
  height: string;
  currentWeight: number;
  targetWeight: number;
  targetWeeks: number;
  targetDate: string;
  targetWeeklyLossLbs: number;
  dailyCalorieDeficit: number;
  dailyProtein: number;
  dailyCalories: number;
  fastingProtocol: string;
  proteinPreference: string;
  foodPreferences?: string[];
  trainingFocus: string;
  techTrack: string;
  stoicHabits?: string[];
  totalXp: number;
  level: number;
  streakDays: number;
  createdDate: string;
  onboardingCompleted: boolean;
  tourCompleted: boolean;
}

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  tabLabel: string;
  targetSelector: string;
  route: string;
  hostDialogue: string;
  actionHint: string;
}

/**
 * Default Founder Profile (170 -> 155 lbs Recomp, 10 Weeks Target Date: Dec 15, 2026)
 */
export const FOUNDER_PROFILE: ClientProfile = {
  id: "founder",
  name: "Stoic Sovereign",
  role: "founder",
  callsign: "Stoic Centurion",
  age: 33,
  height: "5'10\"",
  currentWeight: 170.0,
  targetWeight: 155.0,
  targetWeeks: 10,
  targetDate: "2026-12-15",
  targetWeeklyLossLbs: 1.5,
  dailyCalorieDeficit: 750,
  dailyProtein: 140,
  dailyCalories: 1800,
  fastingProtocol: "23:1 OMAD",
  proteinPreference: "Fish",
  trainingFocus: "Calisthenics & Boxing",
  techTrack: "AI Spectrum & Antigravity Swarms",
  totalXp: 26450,
  level: 12,
  streakDays: 14,
  createdDate: "2026-09-20",
  onboardingCompleted: true,
  tourCompleted: true,
};

/**
 * 8-Step Interactive Tab-by-Tab Walkthrough Configuration
 * Directly highlights each real navigation tab and demonstrates its superpowers.
 */
export const APP_TOUR_STEPS: TourStep[] = [
  {
    id: "tour-tab-today",
    stepNumber: 1,
    title: "1. Today Command Deck & Live Goal Countdown",
    subtitle: "Real-time fasting clock, live target countdown & daily anchors",
    tabLabel: "Today",
    targetSelector: "#tour-tab-today",
    route: "/",
    hostDialogue:
      "This is your daily command deck. At the very top sits your live real-time countdown to your target goal date. Below that is the circular metabolic ring tracking your Glycogen Depletion, Ketosis, and Autophagy phases, accompanied by your gamified daily anchors with audio anvil chimes.",
    actionHint: "Notice the ticking goal countdown and circular fasting ring.",
  },
  {
    id: "tour-tab-calendar",
    stepNumber: 2,
    title: "2. 24-Hour Multi-Week Periodized Calendar",
    subtitle: "Full 8-12 week scheduled training, fasting & coding campaign",
    tabLabel: "Calendar",
    targetSelector: "#tour-tab-calendar",
    route: "/calendar",
    hostDialogue:
      "Your intake doesn't just log one week — it schedules out an entire 8 to 12-week periodized campaign. Here you view your 24-hour visual time blocks, scheduled calisthenics sessions, boxing interval rounds, and tech mastery blocks backed by peer-reviewed sports science citations.",
    actionHint: "Click through days and weeks to inspect your periodized campaign.",
  },
  {
    id: "tour-tab-goals",
    stepNumber: 3,
    title: "3. Strategic Goals & Milestone Progression Hub",
    subtitle: "Phase 1, 2, and 3 weight checkpoints & live countdown ticker",
    tabLabel: "Goals & Weekly",
    targetSelector: "#tour-tab-goals",
    route: "/goals",
    hostDialogue:
      "A goal without an exact deadline is merely a wish. In the Goals Hub, track your progress through Phase 1 (Glycogen Depletion to 165 lbs), Phase 2 (Ketosis to 160 lbs), and Phase 3 (The 155-lb Shred with visible abs), with live weekly achievement increments.",
    actionHint: "Review your milestone target dates and weekly point bounties.",
  },
  {
    id: "tour-tab-training",
    stepNumber: 4,
    title: "4. Boxing & Calisthenics Arena",
    subtitle: "Dumbbell-free hypertrophy, video guides & round timer with real bells",
    tabLabel: "Boxing & Calisthenics",
    targetSelector: "#tour-tab-training",
    route: "/training",
    hostDialogue:
      "Forge elite combat conditioning without gym machines. This tab provides step-by-step calisthenics progressions (strict pull-ups, ring dips, core burnouts) and an interactive 3-minute boxing round interval timer complete with authentic ring bells.",
    actionHint: "Launch the round timer to hear the combat bell and start interval work.",
  },
  {
    id: "tour-tab-nutrition",
    stepNumber: 5,
    title: "5. 23:1 OMAD Nutrition Studio & Exact Portions",
    subtitle: "Wild Fish, Lean Turkey & Chicken formulas + Lemon Chia Water",
    tabLabel: "23:1 OMAD",
    targetSelector: "#tour-tab-nutrition",
    route: "/nutrition",
    hostDialogue:
      "Zero guesswork. The Nutrition Studio gives you 3 empirical whole-food formulas (Wild Fish, Lean Turkey, or Chicken Breast) with exact gram and cup scale weights, paired with jasmine rice, greens, and your 24oz Lemon Chia Seed Hydration Elixir. Hit 'Log Entire Feast' in 1 click!",
    actionHint: "Toggle between Fish, Turkey, and Chicken scale formulas.",
  },
  {
    id: "tour-tab-progress",
    stepNumber: 6,
    title: "6. 170→155 Recomp Data Analytics & Body Fat Scanner",
    subtitle: "7-day rolling moving average & US Navy body composition formulas",
    tabLabel: "170→155 Recomp",
    targetSelector: "#tour-tab-progress",
    route: "/progress",
    hostDialogue:
      "Water weight fluctuates daily — discipline does not. This module filters day-to-day noise using a 7-day rolling moving average, computes your body fat percentage using the US Navy tape method, and models your exact fat loss velocity.",
    actionHint: "Enter your morning weigh-in to update the rolling trendline.",
  },
  {
    id: "tour-tab-learning",
    stepNumber: 7,
    title: "7. Interactive AI Spectrum & Coding Studio",
    subtitle: "Brilliant-style interactive quizzes, sandboxes & curated GitHub catalog",
    tabLabel: "How-To Videos",
    targetSelector: "#tour-tab-learning",
    route: "/learning",
    hostDialogue:
      "Master the highest-leverage intellectual domain of our era: AI, Machine Learning, LLMs, RAG, and Autonomous Agent Swarms. Test real code in browser sandboxes, complete interactive quizzes with instant feedback, and explore pre-configured top GitHub open-source repositories.",
    actionHint: "Try the active sandbox and run Python/TypeScript code right in your browser.",
  },
  {
    id: "tour-tab-settings",
    stepNumber: 8,
    title: "8. AI Agents & Sovereign API Keys Studio",
    subtitle: "Connect Gemini, Claude, OpenAI & Ollama with live latency benchmarks",
    tabLabel: "⚙️ Settings",
    targetSelector: "#tour-tab-settings",
    route: "/settings",
    hostDialogue:
      "This is a 2026 Sovereign OS. In Settings, manage your private API keys for Google Gemini 2.5, Anthropic Claude 3.7, and local Ollama/Ultron models. Test real-time ping latency, adjust reasoning depth, and inspect autonomous background subagent workers.",
    actionHint: "Click 'Complete Tour' to claim your +250 XP bonus!",
  },
];

/**
 * Calibrate Client Intake from Questionnaire Answers
 */
export function calibrateClientProfile(
  answers: QuestionnaireAnswers,
  profileId?: string
): {
  profile: ClientProfile;
  initialTasks: any[];
  initialGoals: any[];
  multiWeekSchedule: MultiWeekCampaignEvent[];
} {
  const targetWeeks = answers.targetWeeks || 10;
  const targetLossTotal = answers.currentWeight - answers.targetWeight;
  const targetWeeklyLossLbs =
    targetWeeks > 0 ? Math.round((targetLossTotal / targetWeeks) * 10) / 10 : 1.5;

  // Scientific Deficit Calculation (Mifflin-St Jeor)
  const isFemale = answers.gender === "female";
  const weightKg = (answers.currentWeight || 170) / 2.20462;
  const heightCm = 178; // approx 5'10"
  const age = answers.age || 30;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (isFemale ? -161 : 5);
  const tdee = Math.round(bmr * 1.45); // Moderate active training baseline

  let dailyCalorieDeficit = Math.round((targetWeeklyLossLbs * 3500) / 7);
  let calorieTarget = Math.max(1500, tdee - dailyCalorieDeficit);

  if (answers.primaryGoal === "bulk") {
    dailyCalorieDeficit = -350; // Surplus
    calorieTarget = tdee + 350;
  } else if (answers.primaryGoal === "maintain") {
    dailyCalorieDeficit = 0;
    calorieTarget = tdee;
  } else if (answers.primaryGoal === "recomp") {
    dailyCalorieDeficit = 350;
    calorieTarget = tdee - 350;
  }

  // Target Date calculation
  const now = new Date();
  const targetDateObj = new Date(now.getTime() + targetWeeks * 7 * 86400000);
  const targetDateStr = answers.targetDate || targetDateObj.toISOString().split("T")[0];

  // Protein calculation: ~0.90g to 1.0g per lb of target weight
  const proteinTarget = Math.max(
    130,
    Math.round(Math.min(answers.targetWeight, answers.currentWeight) * 0.95)
  );

  const profile: ClientProfile = {
    id: profileId || `client-${Date.now()}`,
    name: answers.callsign || "Sovereign Initiate",
    role: "client",
    callsign: answers.callsign || "Sovereign Initiate",
    gender: answers.gender || "male",
    primaryGoal: answers.primaryGoal || "recomp",
    startingBodyType: answers.startingBodyType || "athletic",
    targetPhysique: answers.targetPhysique || "spartan",
    userPhotoUrl: answers.userPhotoUrl || "",
    age: answers.age || 30,
    height: answers.height || "5'10\"",
    currentWeight: answers.currentWeight || 170,
    targetWeight: answers.targetWeight || 155,
    targetWeeks,
    targetDate: targetDateStr,
    targetWeeklyLossLbs,
    dailyCalorieDeficit,
    dailyProtein: proteinTarget || 140,
    dailyCalories: calorieTarget || 1800,
    fastingProtocol: answers.fastingProtocol || "23:1 OMAD",
    proteinPreference: answers.proteinPreference || "Chicken",
    foodPreferences: answers.foodPreferences || ["Chicken", "Greens", "Chia Seeds"],
    trainingFocus: answers.trainingFocus || "Calisthenics & Boxing",
    techTrack: answers.techMasteryTrack || "AI Spectrum & Antigravity Swarms",
    stoicHabits: answers.stoicHabits || ["05:30 Wake", "Lemon Chia Water", "Evening Reflection"],
    totalXp: 500, // Welcome XP Bounty
    level: 1,
    streakDays: 1,
    createdDate: new Date().toISOString().split("T")[0],
    onboardingCompleted: true,
    tourCompleted: false,
  };

  // Generate full multi-week scheduled campaign
  const multiWeekSchedule = generateMultiWeekSchedule(
    profile.createdDate,
    targetWeeks,
    {
      startWeight: profile.currentWeight,
      targetWeight: profile.targetWeight,
      trainingFocus: profile.trainingFocus,
      techTrack: profile.techTrack,
      proteinPreference: profile.proteinPreference,
    }
  );

  // Seed tailored daily tasks based on answers
  const initialTasks = [
    {
      id: `task-hydration-${Date.now()}`,
      title: `Morning 24oz Hydration: ${
        answers.hydrationFocus === "Lemon Chia Water"
          ? "Lemon Water with Soaked Chia Seeds"
          : "Fasting Mineral Electrolytes"
      }`,
      durationMinutes: 10,
      tier: 1,
      completed: false,
      time: "06:00",
      attribute: "Recovery",
    },
    {
      id: `task-training-${Date.now()}`,
      title: `${answers.trainingFocus} Focus Session (High Intensity / Zero Excuses)`,
      durationMinutes: 45,
      tier: 3,
      completed: false,
      time: "06:30",
      attribute: "Physical",
    },
    {
      id: `task-stoic-${Date.now()}`,
      title: "Stoic High-Focus Deep Work & Daily Intentions Review",
      durationMinutes: 45,
      tier: 2,
      completed: false,
      time: "11:30",
      attribute: "Intellect",
    },
    {
      id: `task-meal-${Date.now()}`,
      title: `${answers.fastingProtocol} Feast: ${answers.proteinPreference} Blueprint + Jasmine Rice & Greens`,
      durationMinutes: 60,
      tier: 2,
      completed: false,
      time: "17:30",
      attribute: "Recovery",
    },
  ];

  // Seed tailored weekly goals
  const initialGoals = [
    {
      id: `wg-recomp-${Date.now()}`,
      title: `Adhere to ${answers.fastingProtocol} & Hit ${proteinTarget}g Daily Protein (6/7 Days)`,
      targetCount: 6,
      currentCount: 1,
      category: "Recovery",
      xpReward: 1500,
    },
    {
      id: `wg-train-${Date.now()}`,
      title: `Complete ${answers.trainingDaysPerWeek || 5} ${answers.trainingFocus} Workouts`,
      targetCount: answers.trainingDaysPerWeek || 5,
      currentCount: 0,
      category: "Physical",
      xpReward: 2000,
    },
    {
      id: `wg-habits-${Date.now()}`,
      title: "Execute Morning Anchor & Evening Stoic Journal (6/7 Days)",
      targetCount: 6,
      currentCount: 1,
      category: "Dominion",
      xpReward: 1800,
    },
  ];

  return { profile, initialTasks, initialGoals, multiWeekSchedule };
}

/**
 * Context-aware Host Tips based on current page and hour of day
 */
export function getHostContextDirective(
  pathname: string,
  profile: ClientProfile,
  hourOfDay: number = new Date().getHours()
): { title: string; message: string; suggestedAction: string; actionRoute: string } {
  // Morning Fasting Directive (5am - 12pm)
  if (hourOfDay >= 5 && hourOfDay < 12) {
    return {
      title: "Morning Fasting & Deep Autophagy Phase",
      message: `Greetings ${profile.callsign}. You are currently in the peak fat-oxidation zone. Ensure you take your 24oz water with mineral electrolytes to prevent salt-wasting and sustain mental clarity.`,
      suggestedAction: "Log Hydration & View Fasting Clock",
      actionRoute: "/",
    };
  }

  // Midday Hunger Wave / Study Phase (12pm - 5pm)
  if (hourOfDay >= 12 && hourOfDay < 17) {
    return {
      title: "Midday Satiety & High-Cognition Study",
      message: `If ghrelin peaks, prepare your 24oz Lemon Chia Seed Elixir. The soluble mucilage gel physically coats the stomach while you execute your 45-minute ${profile.techTrack} session.`,
      suggestedAction: "Open Interactive Learning Studio",
      actionRoute: "/learning",
    };
  }

  // Evening Feeding Window (5pm - 7pm)
  if (hourOfDay >= 17 && hourOfDay < 19) {
    return {
      title: "Sovereign Re-feed Window Open",
      message: `Your ${profile.fastingProtocol} window is primed. Plate your ${profile.proteinPreference} blueprint with 2.5 cups of rice and steamed greens for your ${profile.dailyProtein}g protein target.`,
      suggestedAction: "View Scale Portions & Log Feast",
      actionRoute: "/nutrition",
    };
  }

  // Night Recovery & Sleep Phase (7pm - 11pm)
  return {
    title: "Evening Decompression & SWS Sleep Protocol",
    message: `Digestive phase complete. Sip warm chamomile tea with magnesium glycinate to bind GABA-A receptors and stimulate overnight growth hormone release.`,
    suggestedAction: "Review Tomorrow's Schedule in Calendar",
    actionRoute: "/calendar",
  };
}
