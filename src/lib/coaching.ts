export interface AuthenticatedQuote {
  id: string;
  author: "Marcus Aurelius" | "Seneca" | "Epictetus" | "Musonius Rufus";
  work: string;
  citation: string; // Book, Chapter, Section
  text: string;
  category: "discipline" | "action" | "adversity" | "focus" | "temperance";
}

export const AUTHENTICATED_STOIC_QUOTES: AuthenticatedQuote[] = [
  {
    id: "quote-1",
    author: "Marcus Aurelius",
    work: "Meditations",
    citation: "Book V, Section 1",
    text: "At dawn, when you have trouble getting out of bed, tell yourself: 'I have to go to work—as a human being. What do I have to complain of, if I'm going to do what I was born for?'",
    category: "discipline",
  },
  {
    id: "quote-2",
    author: "Marcus Aurelius",
    work: "Meditations",
    citation: "Book VIII, Section 32",
    text: "You have to assemble your life yourself—action by action. And be satisfied if each one achieves its goal, as far as it can. No one can stop that.",
    category: "action",
  },
  {
    id: "quote-3",
    author: "Seneca",
    work: "Letters from a Stoic",
    citation: "Letter XIII: On Groundless Fears",
    text: "We suffer more often in imagination than in reality. What I advise you to do is, not to be unhappy before the crisis comes.",
    category: "adversity",
  },
  {
    id: "quote-4",
    author: "Seneca",
    work: "On the Shortness of Life",
    citation: "Chapter I, Section 3",
    text: "It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous estimate has been given to us for the highest achievements.",
    category: "focus",
  },
  {
    id: "quote-5",
    author: "Epictetus",
    work: "Discourses",
    citation: "Book I, Chapter 24",
    text: "Difficulties show what men are. Therefore, when a difficulty falls upon you, remember that God, like a trainer of wrestlers, has matched you with a rough young man. For what purpose? That you may become an Olympic conqueror.",
    category: "adversity",
  },
  {
    id: "quote-6",
    author: "Epictetus",
    work: "Enchiridion (Handbook)",
    citation: "Section 51",
    text: "How long are you going to wait before you demand the best for yourself, and in no instance bypass the discriminations of reason? You are no longer a boy, but a full-grown man.",
    category: "discipline",
  },
  {
    id: "quote-7",
    author: "Musonius Rufus",
    work: "Lectures and Sayings",
    citation: "Lecture VI: On Training",
    text: "Since a human being happens to be neither soul alone nor body alone, but a composite of these two things, someone in training must pay attention to both.",
    category: "temperance",
  },
  {
    id: "quote-8",
    author: "Marcus Aurelius",
    work: "Meditations",
    citation: "Book IV, Section 24",
    text: "'If you would know peace, do little,' says Democritus. Would it not be better to do what is necessary, in the spirit of a social being, and in the manner that reason directs?",
    category: "focus",
  },
];

export function getRandomQuote(): AuthenticatedQuote {
  const index = Math.floor(Math.random() * AUTHENTICATED_STOIC_QUOTES.length);
  return AUTHENTICATED_STOIC_QUOTES[index];
}

export type CoachingTone = "grill_me" | "direct_centurion" | "philosophical_stoic";

export interface CoachingContext {
  founderName: string;
  currentLevel: number;
  streakDays: number;
  pendingTaskCount: number;
  completedTaskCount: number;
  weightLbs: number;
  targetWeightLbs: number;
  isFatigued: boolean;
  dietType: string;
}

export interface CoachingDialogue {
  tone: CoachingTone;
  headline: string;
  content: string;
  actionPrompt: string;
  quote: AuthenticatedQuote;
}

export function generateCoachingDialogue(
  context: CoachingContext,
  tone: CoachingTone
): CoachingDialogue {
  const quote = getRandomQuote();

  if (tone === "grill_me") {
    // Socratic Interrogation & High-Accountability
    const weightGap = (context.weightLbs - context.targetWeightLbs).toFixed(1);
    return {
      tone: "grill_me",
      headline: "Socratic Grill: Zero Rationalizations Allowed",
      content: `You sit at Level ${context.currentLevel} with a ${context.streakDays}-day streak, yet you have ${context.pendingTaskCount} pending tasks standing between your declared standards and your actions. You weigh ${context.weightLbs} lbs and claim 155 lbs with visible abs is your baseline—that is a ${weightGap} lb delta. Are you adhering strictly to your ${context.dietType} fast and hydration protocol, or are you bargaining with discomfort?`,
      actionPrompt: "Execute your highest friction pending block right now. Report back with zero excuses.",
      quote,
    };
  }

  if (tone === "direct_centurion") {
    // Marine Corps Discipline & Tactical Order
    return {
      tone: "direct_centurion",
      headline: "Marine Centurion Tactical Order: Line Movement Only",
      content: `Marine. Current status: Level ${context.currentLevel}, Frontline Leatherneck. ${context.completedTaskCount} objectives secured today, ${context.pendingTaskCount} remain in the field. Target mass is 155 lbs. Calisthenics, 6 rounds of striking, and sovereign tech execution require raw Marine grit—improvise, adapt, and overcome. Zero excuses.`,
      actionPrompt: "Semper Fi. Mount the objective. Complete the next repetition. Dismissed.",
      quote,
    };
  }

  // philosophical_stoic
  return {
    tone: "philosophical_stoic",
    headline: "The Citadel of Reason: Morning & Evening Reflection",
    content: `Reflect, ${context.founderName}, upon the dichotomy of control. You cannot command external outcomes, client responses, or market fluctuations. But your fast, your push-ups, your focus on doctoral research, and your presence with your daughter are entirely within your sovereign citadel. Maintain your ${context.streakDays}-day rhythm.`,
    actionPrompt: "Accept what lies beyond your control; command what lies within.",
    quote,
  };
}

export interface StoicInquiryOption {
  id: string;
  category: "Fasting & Discipline" | "Fatigue & Training" | "Focus & Overwhelm" | "Mindset & Adversity";
  label: string;
  dilemma: string;
}

export const PRESET_INQUIRIES: StoicInquiryOption[] = [
  {
    id: "fasting-temptation",
    category: "Fasting & Discipline",
    label: "Tempted to Break 23:1 OMAD Fast Early",
    dilemma: "I feel intense hunger pangs at hour 19. My mind is bargaining to eat snacks before 05:30 PM.",
  },
  {
    id: "workout-friction",
    category: "Fatigue & Training",
    label: "Hesitation Before Heavy Leg Day / Boxing",
    dilemma: "I feel low physical drive and friction before initiating heavy barbell squats and 6 rounds of striking.",
  },
  {
    id: "doctoral-overwhelm",
    category: "Focus & Overwhelm",
    label: "Overwhelmed by Doctoral Dissertation & Client Deliverables",
    dilemma: "Too many open cognitive loops between DBA research, client deliverables, and software builds.",
  },
  {
    id: "scale-weight-frustration",
    category: "Mindset & Adversity",
    label: "Frustrated by Scale Weight Fluctuation",
    dilemma: "Scale weight ticked up 0.5 lbs despite strict calorie deficit. Starting to question progress.",
  },
  {
    id: "doubt-and-impostor",
    category: "Mindset & Adversity",
    label: "Combatting Impostor Syndrome & High-Gravity Friction",
    dilemma: "Feeling self-doubt about executing multiple elite ambitions simultaneously.",
  },
];

export interface OracleGuidance {
  tone: CoachingTone;
  dilemma: string;
  verdictTitle: string;
  withinControl: string[];
  outsideControl: string[];
  quote: AuthenticatedQuote;
  tacticalActionDirective: string;
  inversionExercise: string;
}

export function resolveStoicOracleGuidance(
  dilemma: string,
  tone: CoachingTone,
  context?: Partial<CoachingContext>
): OracleGuidance {
  const d = dilemma.toLowerCase();
  let quote = AUTHENTICATED_STOIC_QUOTES[0];
  let verdictTitle = "The Sovereign Citadel Response";
  let withinControl = [
    "Your immediate physical response in the next 120 seconds",
    "Whether you reach for cold mineral water or surrender to craving",
    "Your internal mental narrative and emotional detachment",
  ];
  let outsideControl = [
    "Immediate visceral sensations of hunger or transient fatigue",
    "Past moments of hesitation or missed targets",
    "External timelines and speed of biological adaptation",
  ];
  let tacticalActionDirective = "Down 24oz cold electrolyte water. Execute 25 push-ups to flood dopamine.";
  let inversionExercise = "Premeditate the regret of breaking discipline: 30 seconds of pleasure followed by 24 hours of self-betrayal.";

  if (d.includes("fast") || d.includes("hungry") || d.includes("food") || d.includes("eat")) {
    quote = AUTHENTICATED_STOIC_QUOTES.find((q) => q.category === "temperance") || AUTHENTICATED_STOIC_QUOTES[6];
    verdictTitle =
      tone === "grill_me"
        ? "Socratic Interrogation: Physical Hunger vs Mental Weakness"
        : tone === "direct_centurion"
        ? "Centurion Order: Fasting Discipline & Lipid Oxidation"
        : "Citadel of Temperance: The Autophagy Protocol";
    withinControl = [
      "Whether your hand touches food before 05:30 PM",
      "Hydrating with 24oz cold mineral water and lemon pinch",
      "Reframing hunger pangs as ghrelin-induced fat oxidation",
    ];
    outsideControl = [
      "Natural stomach growls as digestive tract clears glycogen",
      "Food aromas or environmental eating cues from others",
    ];
    tacticalActionDirective = "Brew 1 cup green tea with lemon or ingest 500mg pink Himalayan salt in cold water immediately.";
    inversionExercise = "Ask yourself: Has any Spartan warrior ever perished from delaying dinner by two hours?";
  } else if (
    d.includes("workout") ||
    d.includes("squat") ||
    d.includes("boxing") ||
    d.includes("train") ||
    d.includes("lazy") ||
    d.includes("tired")
  ) {
    quote = AUTHENTICATED_STOIC_QUOTES.find((q) => q.author === "Epictetus") || AUTHENTICATED_STOIC_QUOTES[4];
    verdictTitle =
      tone === "grill_me"
        ? "Socratic Confrontation: Zero Negotiations with Comfort"
        : tone === "direct_centurion"
        ? "Centurion Combat Drill: Step into the Line"
        : "The Olympic Conqueror: Physical Hardening";
    withinControl = [
      "Putting on your training shoes and stepping up to the bar",
      "Executing the first repetition with strict tempo",
      "Starting the boxing round timer and touching gloves",
    ];
    outsideControl = [
      "Feeling 100% enthusiastic beforehand (motivation is irrelevant)",
      "Daily friction or residual work stress",
    ];
    tacticalActionDirective = "Start 3m round timer now. Throw 50 straight jabs without stopping.";
    inversionExercise = "Visualize yourself 1 hour from now: Conquered workout (+750 XP) vs skipped session shame.";
  } else if (
    d.includes("overwhelm") ||
    d.includes("dba") ||
    d.includes("doctoral") ||
    d.includes("client") ||
    d.includes("work")
  ) {
    quote = AUTHENTICATED_STOIC_QUOTES.find((q) => q.category === "focus") || AUTHENTICATED_STOIC_QUOTES[3];
    verdictTitle =
      tone === "grill_me"
        ? "Socratic Probe: Action by Action Assembly"
        : tone === "direct_centurion"
        ? "Centurion Tactical Command: Single Objective Focus"
        : "Marcus Aurelius: The Assembly of Life";
    withinControl = [
      "The single 25-minute deep work block in front of you",
      "Closing browser tabs and muting notifications",
      "Writing one coherent paragraph of literature review",
    ];
    outsideControl = [
      "The entire 80,000-word doctoral dissertation all at once",
      "How fast clients respond to consulting proposals",
    ];
    tacticalActionDirective = "Set timer for 25 minutes. Write 1 single page without editing.";
    inversionExercise = "Assemble your life action by action. No human accomplishes a monumental feat in a single leap.";
  } else if (
    d.includes("scale") ||
    d.includes("weight") ||
    d.includes("slow") ||
    d.includes("plateau")
  ) {
    quote = AUTHENTICATED_STOIC_QUOTES.find((q) => q.author === "Seneca") || AUTHENTICATED_STOIC_QUOTES[2];
    verdictTitle =
      tone === "grill_me"
        ? "Socratic Reality Check: Water Noise vs True Tissue Oxidation"
        : tone === "direct_centurion"
        ? "Centurion Telemetry: Trust the Caloric Mathematics"
        : "Seneca on Groundless Anxiety";
    withinControl = [
      "Your 500–750 kcal daily deficit and 140g protein intake",
      "Measuring 7-day moving averages instead of daily scale fluctuations",
      "Continuing calisthenics overload to prevent muscle catabolism",
    ];
    outsideControl = [
      "Daily sodium water retention and digestive mass in transit",
      "Day-to-day glycogen hydration levels",
    ];
    tacticalActionDirective = "Log tape waist measurement (31.0\" target) and review your 7-day rolling curve.";
    inversionExercise = "We suffer more often in imagination than reality. Fat cannot resist thermodynamics.";
  }

  return {
    tone,
    dilemma,
    verdictTitle,
    withinControl,
    outsideControl,
    quote,
    tacticalActionDirective,
    inversionExercise,
  };
}

