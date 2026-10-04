/**
 * Stoic Sovereign — Host Onboarding & Guided Walkthrough Engine
 * Provides client intake calibration, profile management, and interactive app tour configuration.
 */

export interface QuestionnaireAnswers {
  callsign: string;
  age: number;
  height: string;
  currentWeight: number;
  targetWeight: number;
  primaryMission: string;
  fastingProtocol: "23:1 OMAD" | "16:8 Lean Gains" | "20:4 Warrior Diet" | "3 Clean Meals";
  proteinPreference: "Fish" | "Turkey" | "Chicken";
  hydrationFocus: "Lemon Chia Water" | "Fasting Electrolytes" | "EGCG Matcha" | "All Elixirs";
  trainingFocus: "Calisthenics" | "Boxing" | "Incline Walk" | "Hybrid All-Around";
  trainingDaysPerWeek: number;
  techMasteryTrack: "AI Spectrum" | "Antigravity Swarms" | "Vibe Coding" | "Full-Stack Web";
  dailyStudyMinutes: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  role: "founder" | "client";
  callsign: string;
  age: number;
  height: string;
  currentWeight: number;
  targetWeight: number;
  dailyProtein: number;
  dailyCalories: number;
  fastingProtocol: string;
  proteinPreference: string;
  trainingFocus: string;
  techTrack: string;
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
  targetSelector: string;
  route: string;
  hostDialogue: string;
  actionHint: string;
}

/**
 * Default Founder Profile
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
 * 6-Step App Walkthrough Configuration
 */
export const APP_TOUR_STEPS: TourStep[] = [
  {
    id: "tour-header",
    stepNumber: 1,
    title: "1. The Sovereign Header & Status Command",
    subtitle: "Your level, streak shield, and mental clarity toggle",
    targetSelector: "#tour-target-header",
    route: "/",
    hostDialogue:
      "Welcome to your sovereign command center. Here at the top, you monitor your current Prestige Level, active Streak Shield (protecting you from accidental streak breaks), and the Calm Mode toggle for deep, distraction-free execution.",
    actionHint: "Notice your Level badge and Streak Shield at the top of the screen.",
  },
  {
    id: "tour-fasting",
    stepNumber: 2,
    title: "2. Fasting & Autophagy Countdown",
    subtitle: "Real-time metabolic phase tracker & hydration logger",
    targetSelector: "#tour-target-fasting",
    route: "/",
    hostDialogue:
      "This circular ring tracks your metabolic state in real time: Glycogen Depletion (0-12h), Ketosis & Lipolysis (12-16h), and Deep Autophagy (16-23h). Log your hydration and mineral electrolytes with a single tap to crush midday fatigue.",
    actionHint: "Your 23:1 fasting window opens at 05:30 PM for your 1-hour feast.",
  },
  {
    id: "tour-anchors",
    stepNumber: 3,
    title: "3. Daily Sovereign Anchors & Live XP",
    subtitle: "Turn discipline into a tangible role-playing progression",
    targetSelector: "#tour-target-anchors",
    route: "/",
    hostDialogue:
      "Your day is governed by high-leverage Sovereign Anchors across Strength, Intellect, and Recovery. Check them off as you complete them to earn XP, level up your character, and hear the victorious strike of the anvil chime.",
    actionHint: "Tap any anchor checkbox to test XP gain and audio feedback.",
  },
  {
    id: "tour-nutrition",
    stepNumber: 4,
    title: "4. Nutrition Studio & Exact Meal Blueprints",
    subtitle: "Fish, Turkey, or Chicken with exact gram & cup scale portions",
    targetSelector: "#tour-target-nutrition-link",
    route: "/nutrition",
    hostDialogue:
      "Never guess what or how much to eat again. The Nutrition Studio gives you 3 empirical whole-food formulas (Wild Fish, Lean Turkey, or Chicken Breast) paired with jasmine rice, greens, and your 24oz Lemon Chia Seed Hydration Elixir. Hit 'Log Entire Feast' in 1 click!",
    actionHint: "Visit /nutrition to view exact weights and cooking steps.",
  },
  {
    id: "tour-learning",
    stepNumber: 5,
    title: "5. Interactive AI & Coding Learning Studio",
    subtitle: "Brilliant-style interactive quizzes, sandboxes & top GitHub repos",
    targetSelector: "#tour-target-learning-link",
    route: "/learning",
    hostDialogue:
      "Master the highest-leverage skill of this era: AI, Machine Learning, LLMs, RAG, and Agentic Swarms. Practice with hands-on code sandboxes and explore pre-configured top GitHub open-source repositories ready to clone.",
    actionHint: "Visit /learning to test code execution and earn daily knowledge XP.",
  },
  {
    id: "tour-calendar",
    stepNumber: 6,
    title: "6. Boxing Arena, Calendar & Time Dominance",
    subtitle: "24-hour visual time blocking and round interval timers",
    targetSelector: "#tour-target-calendar-link",
    route: "/calendar",
    hostDialogue:
      "Master your time with 24-hour visual blocking for calisthenics, consulting, and doctoral research. In the Training tab, launch the interactive boxing timer with real ring bells. You are now equipped. Go conquer your day.",
    actionHint: "Click 'Complete Tour' to claim your +250 XP bonus!",
  },
];

/**
 * Calibrate Client Intake from Questionnaire Answers
 */
export function calibrateClientProfile(
  answers: QuestionnaireAnswers,
  profileId?: string
): { profile: ClientProfile; initialTasks: any[]; initialGoals: any[] } {
  // Protein calculation: ~0.85g to 1.0g per lb of bodyweight or target weight
  const proteinTarget = Math.round(
    Math.min(answers.targetWeight, answers.currentWeight) * 0.95
  );

  // Calorie calculation: Deficit formula for fat loss
  // BMR estimate ~ 10 * weight in kg + 6.25 * height - 5 * age
  // Standardized sovereign deficit: ~1,750 - 1,900 kcal
  const calorieTarget = answers.currentWeight > answers.targetWeight ? 1800 : 2100;

  const profile: ClientProfile = {
    id: profileId || `client-${Date.now()}`,
    name: answers.callsign || "Sovereign Initiate",
    role: "client",
    callsign: answers.callsign || "Sovereign Initiate",
    age: answers.age || 30,
    height: answers.height || "5'10\"",
    currentWeight: answers.currentWeight || 170,
    targetWeight: answers.targetWeight || 155,
    dailyProtein: proteinTarget || 140,
    dailyCalories: calorieTarget || 1800,
    fastingProtocol: answers.fastingProtocol || "23:1 OMAD",
    proteinPreference: answers.proteinPreference || "Chicken",
    trainingFocus: answers.trainingFocus || "Calisthenics",
    techTrack: answers.techMasteryTrack || "AI Spectrum",
    totalXp: 500, // Welcome XP Bounty
    level: 1,
    streakDays: 1,
    createdDate: new Date().toISOString().split("T")[0],
    onboardingCompleted: true,
    tourCompleted: false,
  };

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
      id: `task-tech-${Date.now()}`,
      title: `${answers.techMasteryTrack} Mastery & Interactive Sandbox Practice`,
      durationMinutes: answers.dailyStudyMinutes || 45,
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
      id: `wg-tech-${Date.now()}`,
      title: `Complete 5 Interactive Lessons in ${answers.techMasteryTrack}`,
      targetCount: 5,
      currentCount: 0,
      category: "Intellect",
      xpReward: 1800,
    },
  ];

  return { profile, initialTasks, initialGoals };
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
