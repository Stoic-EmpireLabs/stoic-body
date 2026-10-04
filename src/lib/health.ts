export interface MealLogItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodiumMg?: number;
  loggedAt?: string;
}

export interface DailyMacroTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  proteinMet: (target: number) => boolean;
}

export interface RecompForecast {
  totalLbsToLose: number;
  weeksRequired: number;
  estimatedCompletionDate: string;
  uncertaintyRangeWeeks: { min: number; max: number };
}

export interface BoxingCombo {
  id: string;
  callout: string;
  comboSequence: string[];
  description: string;
}

/**
 * Calculates sum of daily macros from meal logs
 */
export function calculateDailyMacros(meals: MealLogItem[]): DailyMacroTotals {
  const totals = meals.reduce(
    (acc, m) => ({
      totalCalories: acc.totalCalories + (Number(m.calories) || 0),
      totalProtein: acc.totalProtein + (Number(m.protein) || 0),
      totalCarbs: acc.totalCarbs + (Number(m.carbs) || 0),
      totalFat: acc.totalFat + (Number(m.fat) || 0),
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  return {
    ...totals,
    proteinMet: (target: number) => totals.totalProtein >= target,
  };
}

/**
 * US Navy Formula for Body Fat Percentage (Men)
 * %BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
 */
export function calculateBodyFatNavy(
  waistInches: number,
  neckInches: number,
  heightInches: number
): number {
  if (waistInches <= neckInches || heightInches <= 0) return 15.0;

  const diff = Math.max(1, waistInches - neckInches);
  const bf =
    86.01 * Math.log10(diff) - 70.041 * Math.log10(heightInches) + 36.76;

  return Math.round(Math.max(3, Math.min(50, bf)) * 10) / 10;
}

/**
 * Estimates body recomposition timeline for fat loss
 * Based on standard 3,500 kcal / lb fat tissue calculation with uncertainty bounds
 */
export function projectRecompositionTimeline(
  currentWeight: number,
  targetWeight: number,
  dailyDeficit: number = 500
): RecompForecast {
  const totalLbsToLose = Math.max(0, currentWeight - targetWeight);
  const safeDeficit = Math.max(250, dailyDeficit);
  const lbsPerWeek = (safeDeficit * 7) / 3500;
  const weeksRequired = Math.round(totalLbsToLose / (lbsPerWeek || 1));

  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + weeksRequired * 7);
  const estimatedCompletionDate = targetDateObj.toISOString().split("T")[0];

  return {
    totalLbsToLose,
    weeksRequired,
    estimatedCompletionDate,
    uncertaintyRangeWeeks: {
      min: Math.max(1, Math.round(weeksRequired * 0.8)),
      max: Math.round(weeksRequired * 1.25),
    },
  };
}

/**
 * Calculates 7-day rolling moving average of bodyweight
 * Filters out daily water, glycogen, and sodium weight fluctuations
 */
export function calculateMovingAverageWeight(records: { weight: number }[]): number {
  if (!records || records.length === 0) return 0;
  const recent = records.slice(-7);
  const sum = recent.reduce((acc, r) => acc + (Number(r.weight) || 0), 0);
  return Math.round((sum / recent.length) * 10) / 10;
}

/**
 * Curated boxing combinations for 3m/1m rounds and shadowboxing
 */
const BOXING_COMBOS: BoxingCombo[] = [
  {
    id: "combo-1",
    callout: "1-2 (Jab - Cross)",
    comboSequence: ["Jab (Lead Hand)", "Straight Cross (Rear Hand)"],
    description: "Fundamental long-range range finder and power anchor.",
  },
  {
    id: "combo-2",
    callout: "1-2-3 (Jab - Cross - Lead Hook)",
    comboSequence: ["Jab", "Cross", "Lead Hook to Jaw"],
    description: "Weight transfer from back foot through lead hip pivot.",
  },
  {
    id: "combo-3",
    callout: "1-1-2 (Double Jab - Cross)",
    comboSequence: ["Step Jab", "Blinding Jab", "Straight Right"],
    description: "Advances distance and breaks defender rhythm.",
  },
  {
    id: "combo-4",
    callout: "1-2-Slip-2 (Jab - Cross - Slip Right - Cross)",
    comboSequence: ["Jab", "Cross", "Slip Outside Lead", "Rear Cross Counter"],
    description: "Defensive evasion immediately converted to power counter.",
  },
  {
    id: "combo-5",
    callout: "3-2-3 (Lead Hook - Cross - Lead Hook)",
    comboSequence: ["Lead Hook", "Straight Cross", "Lead Body Hook"],
    description: "Inside pocket combination punishing high guard.",
  },
];

export function generateBoxingCombos(count: number = 4): BoxingCombo[] {
  return BOXING_COMBOS.slice(0, count);
}
