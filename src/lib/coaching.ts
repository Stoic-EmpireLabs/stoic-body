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
    // Military Discipline & Tactical Order
    return {
      tone: "direct_centurion",
      headline: "Centurion Tactical Order: Line Movement Only",
      content: `Soldier. Current status: Level ${context.currentLevel}, Frontline Centurion. ${context.completedTaskCount} objectives secured today, ${context.pendingTaskCount} remain in the field. Target mass is 155 lbs. Calisthenics, boxing rounds, and consulting acquisitions require physical grit, not theoretical contemplation.`,
      actionPrompt: "Mount the objective. Complete the next repetition. Dismissed.",
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
