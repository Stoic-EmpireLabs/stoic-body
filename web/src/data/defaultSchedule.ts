import type { ScheduledEvent, MealEntry, NutritionTargets } from '../types';

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateEventsForDate(dateStr: string): ScheduledEvent[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const isToday = dateStr === getLocalDateString();
  const events: ScheduledEvent[] = [];

  // 05:30 Morning Cellular Hydration & Electrolytes
  events.push({
    id: `sched-hydro-${dateStr}`,
    date: dateStr,
    time: '05:30',
    durationMinutes: 15,
    title: 'Cellular Hydration: 24oz Filtered Water + Mineral Electrolyte Shield',
    category: 'recovery',
    tier: 1,
    citation: 'Huberman Lab: Sodium-potassium cellular pump charging upon waking',
    completed: isToday,
  });

  // 06:00 Physical Workout (Varies by split)
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    // Mon/Wed/Fri: Full Body / Combat Conditioning
    events.push({
      id: `sched-workout-${dateStr}`,
      date: dateStr,
      time: '06:00',
      durationMinutes: 50,
      title: 'USMC Combat Conditioning: Heavy Barbell Push, Pull-ups & Core Tension',
      category: 'workout',
      tier: 3,
      citation: 'Schoenfeld (2017): 10-20 weekly direct sets near failure for maximal hypertrophic density',
      completed: isToday,
    });
  } else if (dayOfWeek === 2 || dayOfWeek === 4) {
    // Tue/Thu: Boxing & Conditioning Intervals
    events.push({
      id: `sched-workout-${dateStr}`,
      date: dateStr,
      time: '06:00',
      durationMinutes: 45,
      title: 'High-Gravity Boxing Intervals: 6 x 3-Min Heavy Bag Rounds (1m Rest)',
      category: 'workout',
      tier: 3,
      citation: 'Tremblay EPOC: +14% post-exercise resting metabolic rate elevation for 14 hours',
      completed: false,
    });
  } else if (dayOfWeek === 6) {
    // Sat: Zone 2 Ruck / Incline Walk
    events.push({
      id: `sched-workout-${dateStr}`,
      date: dateStr,
      time: '07:30',
      durationMinutes: 45,
      title: 'Tactical Ruck / 12% Incline Treadmill Walk (Zone 2 Aerobic Engine)',
      category: 'workout',
      tier: 2,
      citation: 'San-Millán & Brooks (2020): Maximal mitochondrial lipid oxidation rate',
      completed: false,
    });
  } else {
    // Sun: Active Rest & Recovery
    events.push({
      id: `sched-workout-${dateStr}`,
      date: dateStr,
      time: '08:00',
      durationMinutes: 30,
      title: 'Sovereign CNS Deload Walk & Full Body Mobility Reset',
      category: 'recovery',
      tier: 1,
      citation: 'Proactive fatigue management prevents systemic overtraining and joint inflammation',
      completed: false,
    });
  }

  // 11:30 Deep Focus Work & Mission Execution (Mon-Fri)
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    events.push({
      id: `sched-task-${dateStr}`,
      date: dateStr,
      time: '11:30',
      durationMinutes: 60,
      title: 'Tactical Deep Work: Uninterrupted Cognitive Execution Block',
      category: 'task',
      tier: 2,
      citation: 'Newport (2016): High-gravity concentration block with zero notifications',
      completed: false,
    });
  }

  // 17:30 Evening 23:1 OMAD Single Feeding Window
  events.push({
    id: `sched-meal-${dateStr}`,
    date: dateStr,
    time: '17:30',
    durationMinutes: 60,
    title: '23:1 OMAD Feeding Window: Wild Salmon, Jasmine Rice, Greens & Lemon Chia',
    category: 'meal',
    tier: 2,
    citation: 'Morton et al. (2018): 140g protein bolus optimization & systemic autophagy surge',
    completed: false,
    calories: 1450,
  });

  // 21:30 Magnesium & Sleep Protocol
  events.push({
    id: `sched-sleep-${dateStr}`,
    date: dateStr,
    time: '21:30',
    durationMinutes: 20,
    title: 'Sleep Architecture Protocol: Magnesium Glycinate, Zero Blue Light & Cold Room',
    category: 'recovery',
    tier: 1,
    citation: 'Walker (2017): Stage 4 slow-wave sleep growth hormone surge for tissue repair',
    completed: false,
  });

  return events;
}

export function generateDefaultSchedule(daysAhead: number = 30): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  const now = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dateStr = getLocalDateString(d);
    events.push(...generateEventsForDate(dateStr));
  }

  return events;
}

export const defaultMealsToday: MealEntry[] = [
  {
    id: 'meal-1',
    date: getLocalDateString(),
    name: 'Wild Alaskan Salmon + Steamed Jasmine Rice & Broccoli',
    calories: 750,
    protein: 55,
    carbs: 65,
    fat: 22,
    sodiumMg: 620,
    loggedAt: '17:30',
  },
  {
    id: 'meal-2',
    date: getLocalDateString(),
    name: 'Lean Grass-Fed Beef Patty + Roasted Sweet Potato & Sea Salt',
    calories: 620,
    protein: 52,
    carbs: 45,
    fat: 24,
    sodiumMg: 740,
    loggedAt: '18:15',
  },
  {
    id: 'meal-3',
    date: getLocalDateString(),
    name: 'Organic Greek Yogurt + Whey Isolate & Chia Seed Pudding',
    calories: 380,
    protein: 45,
    carbs: 26,
    fat: 8,
    sodiumMg: 140,
    loggedAt: '18:45',
  },
  {
    id: 'meal-4',
    date: getLocalDateString(),
    name: 'Cellular Electrolyte Shield (Himalayan Pink Salt + Potassium Water)',
    calories: 10,
    protein: 0,
    carbs: 1,
    fat: 0,
    sodiumMg: 1200,
    loggedAt: '05:30',
  },
];

export const defaultNutritionTargets: NutritionTargets = {
  calories: 2200,
  protein: 180,
  carbs: 180,
  fat: 65,
  waterMl: 3500,
  fastingHours: 23,
  fastingProtocol: 'omad',
  fastStartTime: '19:00',
};

export const founderPresets: Omit<MealEntry, 'id' | 'date'>[] = [
  {
    name: 'Wild Salmon & Steamed Jasmine Rice (140g P Refeed)',
    calories: 680,
    protein: 54,
    carbs: 62,
    fat: 22,
    sodiumMg: 580,
    loggedAt: '17:30',
  },
  {
    name: 'USMC Combat Ration: 93/7 Lean Beef & Sweet Potato',
    calories: 740,
    protein: 64,
    carbs: 58,
    fat: 24,
    sodiumMg: 820,
    loggedAt: '18:00',
  },
  {
    name: 'Egg White Scramble, Avocado & Whole Grain Sourdough',
    calories: 460,
    protein: 42,
    carbs: 32,
    fat: 16,
    sodiumMg: 490,
    loggedAt: '12:00',
  },
  {
    name: 'Greek Yogurt, Blueberries & Grass-Fed Whey Bolus',
    calories: 360,
    protein: 48,
    carbs: 24,
    fat: 6,
    sodiumMg: 130,
    loggedAt: '18:30',
  },
  {
    name: 'Cellular Fasting Shield (Water, Electrolytes & Lemon)',
    calories: 10,
    protein: 0,
    carbs: 1,
    fat: 0,
    sodiumMg: 1200,
    loggedAt: '06:00',
  },
];

export const clinicalDietMatrix = [
  {
    name: '23:1 OMAD (One Meal A Day)',
    timing: '23h Fast / 1h Feeding Window',
    primary: 'Autophagy, sharp mental acuity, effortless caloric deficit, elevated growth hormone.',
    badge: 'bg-amber-950/40 text-[#D9A184] border-[#D9A184]/40',
    status: 'High Adherence',
  },
  {
    name: '16:8 Lean Gains Protocol',
    timing: '16h Fast / 8h Feeding Window',
    primary: 'Bridges daily fasting with 2-3 structured protein boluses for maximum MPS frequency.',
    badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    status: 'Optimal Hypertrophy',
  },
  {
    name: 'High-Protein Mediterranean Split',
    timing: 'Ad Libitum Whole Foods',
    primary: 'Cardiovascular longevity, extra virgin olive oil, wild fish, leafy brassicas, low inflammation.',
    badge: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
    status: 'Longevity Gold Standard',
  },
  {
    name: 'Targeted Ketogenic Protocol',
    timing: '< 30g Net Carbs',
    primary: 'Beta-hydroxybutyrate mitochondrial efficiency, steady blood glucose, zero cravings.',
    badge: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
    status: 'Neurological Clarity',
  },
];
