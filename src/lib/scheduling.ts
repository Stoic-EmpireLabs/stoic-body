export interface ScheduledTask {
  id: string;
  title: string;
  durationMinutes: number;
  priorityTier: number; // 1: Non-negotiable anchor, 2: Core campaign, 3: Makerspace/Home, 4: Leisure
  isCompleted?: boolean;
}

export function calculateBufferMinutes(durationMinutes: number): number {
  return Math.max(15, Math.round(0.2 * durationMinutes));
}

export interface ScheduleAudit {
  availableWakingMinutes: number;
  totalCommitmentMinutes: number;
  hasOverflow: boolean;
  overflowMinutes: number;
  suggestions: string[];
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function detectScheduleOverflow(
  tasks: ScheduledTask[],
  wakeTime: string = "05:30",
  bedTime: string = "22:00"
): ScheduleAudit {
  const wakeM = parseTimeToMinutes(wakeTime);
  const bedM = parseTimeToMinutes(bedTime);
  const availableWakingMinutes = bedM >= wakeM ? bedM - wakeM : 24 * 60 - wakeM + bedM;

  let totalCommitmentMinutes = 0;
  for (const task of tasks) {
    const buffer = calculateBufferMinutes(task.durationMinutes);
    totalCommitmentMinutes += task.durationMinutes + buffer;
  }

  const overflowMinutes = Math.max(0, totalCommitmentMinutes - availableWakingMinutes);
  const hasOverflow = overflowMinutes > 0;
  const suggestions: string[] = [];

  if (hasOverflow) {
    suggestions.push(
      `Schedule exceeds bedtime by ${overflowMinutes} minutes. Activate Minimum Viable Day (MVD) to contract physical sessions to 15 minutes.`
    );
    suggestions.push(
      `Compress Tier 2 deep-work blocks by 20% to absorb transitional delays.`
    );
    suggestions.push(
      `Slide Tier 3/4 home quests into the upcoming weekend project block.`
    );
  }

  return {
    availableWakingMinutes,
    totalCommitmentMinutes,
    hasOverflow,
    overflowMinutes,
    suggestions,
  };
}

export interface MultiWeekCampaignEvent {
  id: string;
  date: string; // YYYY-MM-DD
  weekNumber: number;
  dayNumber: number;
  phase: string;
  time: string;
  durationMinutes: number;
  title: string;
  scientificCitation: string;
  category: "Physical" | "Nutrition" | "Cognitive" | "Recovery";
  tier: number;
  targetWeightForecastLbs: number;
  completed?: boolean;
}

export interface GoalMilestoneCheckpoint {
  phaseName: string;
  weekRange: string;
  targetWeightLbs: number;
  estimatedDate: string;
  focusProtocol: string;
  scientificMechanism: string;
}

/**
 * Calculates real-time countdown to target milestone date
 */
export function calculateGoalCountdown(
  targetDateStr: string,
  nowMs: number = Date.now()
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
  totalRemainingMs: number;
} {
  const targetMs = new Date(targetDateStr).getTime();
  const diff = targetMs - nowMs;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      totalRemainingMs: 0,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPassed: false,
    totalRemainingMs: diff,
  };
}

/**
 * Calculates milestone checkpoints across an 8-16 week campaign
 */
export function calculateMilestoneProgression(
  startWeight: number = 170,
  targetWeight: number = 155,
  totalWeeks: number = 12,
  startDateStr: string = new Date().toISOString().split("T")[0]
): GoalMilestoneCheckpoint[] {
  const totalLoss = startWeight - targetWeight;
  const p1Loss = Math.round(totalLoss * 0.35 * 10) / 10;
  const p2Loss = Math.round(totalLoss * 0.70 * 10) / 10;

  const startDate = new Date(startDateStr);
  const p1Date = new Date(startDate.getTime() + Math.round(totalWeeks * 0.33) * 7 * 86400000);
  const p2Date = new Date(startDate.getTime() + Math.round(totalWeeks * 0.66) * 7 * 86400000);
  const finalDate = new Date(startDate.getTime() + totalWeeks * 7 * 86400000);

  return [
    {
      phaseName: "Phase 1: Glycogen Depletion & Habituation",
      weekRange: `Weeks 1 - ${Math.round(totalWeeks * 0.33)}`,
      targetWeightLbs: Math.round((startWeight - p1Loss) * 10) / 10,
      estimatedDate: p1Date.toISOString().split("T")[0],
      focusProtocol: "23:1 OMAD + Mineral Electrolyte Shield + Zone 2 Walk",
      scientificMechanism:
        "Lyle McDonald (2018): Rapid intramuscular glycogen clearance and reversal of low-insulin natriuresis without lean tissue breakdown.",
    },
    {
      phaseName: "Phase 2: Peak Ketosis & Hypertrophic Density",
      weekRange: `Weeks ${Math.round(totalWeeks * 0.33) + 1} - ${Math.round(totalWeeks * 0.66)}`,
      targetWeightLbs: Math.round((startWeight - p2Loss) * 10) / 10,
      estimatedDate: p2Date.toISOString().split("T")[0],
      focusProtocol: "Calisthenics Progressive Overload + 6-Rnd Boxing Intervals + Lemon Chia Elixir",
      scientificMechanism:
        "Schoenfeld et al. (2017) & Tremblay EPOC: 10-20 weekly direct sets near failure (1-3 RIR) + high post-exercise oxygen consumption elevating resting metabolism for 14 hours.",
    },
    {
      phaseName: "Phase 3: The Visible Abs Sovereign Peak",
      weekRange: `Weeks ${Math.round(totalWeeks * 0.66) + 1} - ${totalWeeks}`,
      targetWeightLbs: targetWeight,
      estimatedDate: finalDate.toISOString().split("T")[0],
      focusProtocol: "Target 140g Whole Protein (Fish/Turkey/Chicken) + Precision Refeed + Sleep Apigenin",
      scientificMechanism:
        "Morton et al. (2018): Peak muscle retention at 1.6-2.2g protein/kg during a 500 kcal deficit, revealing serratus and rectus abdominis vascularity.",
    },
  ];
}

/**
 * Generates a full multi-week (8-16 weeks) scheduled calendar campaign
 */
export function generateMultiWeekSchedule(
  startDateStr: string = new Date().toISOString().split("T")[0],
  totalWeeks: number = 12,
  preferences: {
    startWeight?: number;
    targetWeight?: number;
    trainingFocus?: string;
    techTrack?: string;
    proteinPreference?: string;
  } = {}
): MultiWeekCampaignEvent[] {
  const startWeight = preferences.startWeight || 170;
  const targetWeight = preferences.targetWeight || 155;
  const trainingFocus = preferences.trainingFocus || "Calisthenics & Boxing";
  const techTrack = preferences.techTrack || "AI Spectrum";
  const proteinPref = preferences.proteinPreference || "Fish";

  const totalDays = totalWeeks * 7;
  const startDate = new Date(startDateStr);
  const events: MultiWeekCampaignEvent[] = [];

  const weightStep = totalDays > 1 ? (startWeight - targetWeight) / (totalDays - 1) : 0;

  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate.getTime() + day * 86400000);
    const dateStr = currentDate.toISOString().split("T")[0];
    const weekNum = Math.floor(day / 7) + 1;
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday

    const currentForecastWeight = Math.round((startWeight - weightStep * day) * 10) / 10;

    let phase = "Phase 1: Glycogen Depletion & Adaptation";
    if (weekNum > Math.round(totalWeeks * 0.66)) {
      phase = "Phase 3: The Visible Abs Sovereign Peak";
    } else if (weekNum > Math.round(totalWeeks * 0.33)) {
      phase = "Phase 2: Ketosis & Hypertrophic Density";
    }

    // Schedule 3-4 structured research-backed events per day
    // Morning Hydration & Autophagy Check
    events.push({
      id: `mwc-hydro-${dateStr}`,
      date: dateStr,
      weekNumber: weekNum,
      dayNumber: day + 1,
      phase,
      time: "05:30",
      durationMinutes: 15,
      title: "Cellular Hydration: 24oz Filtered Water + Fasting Electrolyte Shield",
      scientificCitation: "Huberman Lab (2022): Sodium-potassium cellular pump charging upon waking",
      category: "Recovery",
      tier: 1,
      targetWeightForecastLbs: currentForecastWeight,
      completed: day === 0,
    });

    // Physical Training (Varies by day of week)
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      // Mon/Wed/Fri: Calisthenics Strength
      events.push({
        id: `mwc-train-${dateStr}`,
        date: dateStr,
        weekNumber: weekNum,
        dayNumber: day + 1,
        phase,
        time: "06:00",
        durationMinutes: 45,
        title: `Calisthenics Hypertrophic Overload (Week ${weekNum}): Pull-ups, Dips & Core`,
        scientificCitation: "Schoenfeld (2017): 4-6 RIR mechanical tension stimulus",
        category: "Physical",
        tier: 3,
        targetWeightForecastLbs: currentForecastWeight,
        completed: day === 0,
      });
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      // Tue/Thu: Boxing Intervals
      events.push({
        id: `mwc-box-${dateStr}`,
        date: dateStr,
        weekNumber: weekNum,
        dayNumber: day + 1,
        phase,
        time: "06:00",
        durationMinutes: 45,
        title: `Boxing High-Gravity Intervals: 6 x 3-Minute Rounds (1m Rest)`,
        scientificCitation: "Tremblay EPOC: +14% post-exercise resting metabolic rate elevation",
        category: "Physical",
        tier: 3,
        targetWeightForecastLbs: currentForecastWeight,
        completed: false,
      });
    } else if (dayOfWeek === 6) {
      // Sat: Zone 2 Incline Walk
      events.push({
        id: `mwc-z2-${dateStr}`,
        date: dateStr,
        weekNumber: weekNum,
        dayNumber: day + 1,
        phase,
        time: "08:00",
        durationMinutes: 30,
        title: "12% Incline Treadmill Walk (Zone 2 Aerobic Fat Oxidation)",
        scientificCitation: "San-Millán & Brooks (2020): Maximal mitochondrial lipid clearance",
        category: "Physical",
        tier: 2,
        targetWeightForecastLbs: currentForecastWeight,
        completed: false,
      });
    } else {
      // Sun: Deload & Active Rest
      events.push({
        id: `mwc-rest-${dateStr}`,
        date: dateStr,
        weekNumber: weekNum,
        dayNumber: day + 1,
        phase,
        time: "09:00",
        durationMinutes: 20,
        title: "Sovereign Deload Walk & Central Nervous System Recovery",
        scientificCitation: "Proactive fatigue management prevents systemic overreaching",
        category: "Recovery",
        tier: 1,
        targetWeightForecastLbs: currentForecastWeight,
        completed: false,
      });
    }

    // Midday Technical Mastery & Cognitive Deep Work
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      events.push({
        id: `mwc-tech-${dateStr}`,
        date: dateStr,
        weekNumber: weekNum,
        dayNumber: day + 1,
        phase,
        time: "11:30",
        durationMinutes: 45,
        title: `${techTrack} Deep Session: Active Sandbox Coding & Swarm Orchestration`,
        scientificCitation: "Newport (2016): Uninterrupted 45-min high-gravity focus block",
        category: "Cognitive",
        tier: 2,
        targetWeightForecastLbs: currentForecastWeight,
        completed: false,
      });
    }

    // Evening 23:1 OMAD Single Feeding Window
    events.push({
      id: `mwc-omad-${dateStr}`,
      date: dateStr,
      weekNumber: weekNum,
      dayNumber: day + 1,
      phase,
      time: "17:30",
      durationMinutes: 60,
      title: `23:1 OMAD Feast: ${proteinPref} Blueprint + Jasmine Rice, Greens & Lemon Chia Water`,
      scientificCitation: "Phillips et al. (2016): 140g protein bolus optimization & 1,800 kcal deficit",
      category: "Nutrition",
      tier: 2,
      targetWeightForecastLbs: currentForecastWeight,
      completed: false,
    });
  }

  return events;
}
