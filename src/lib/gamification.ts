export enum DifficultyTier {
  Micro = 1,
  Routine = 2,
  Challenging = 3,
  Boss = 4,
  Legendary = 5,
}

export const BASE_TIER_POINTS: Record<DifficultyTier, number> = {
  [DifficultyTier.Micro]: 100,
  [DifficultyTier.Routine]: 300,
  [DifficultyTier.Challenging]: 750,
  [DifficultyTier.Boss]: 1500,
  [DifficultyTier.Legendary]: 3500,
};

export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.25;
  if (streakDays >= 7) return 1.25;
  if (streakDays >= 3) return 1.1;
  return 1.0;
}

export function getComboBonus(comboCount: number): number {
  if (comboCount >= 4) return 500;
  if (comboCount === 3) return 250;
  if (comboCount === 2) return 100;
  return 0;
}

export function calculateTaskPoints(
  tier: DifficultyTier,
  streakDays: number = 0,
  isOnTime: boolean = false,
  comboCount: number = 0,
  effortBoost: boolean = false
): number {
  let effectiveTier = tier;
  if (effortBoost && effectiveTier < DifficultyTier.Legendary) {
    effectiveTier = (effectiveTier + 1) as DifficultyTier;
  }

  const base = BASE_TIER_POINTS[effectiveTier] ?? 100;
  const streakMult = getStreakMultiplier(streakDays);
  const critMult = isOnTime ? 1.2 : 1.0;
  const combo = getComboBonus(comboCount);

  return Math.round(base * streakMult * critMult) + combo;
}

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
}

export function getPrestigeTitle(level: number): string {
  if (level >= 100) return "Stoic Sage";
  if (level >= 50) return "Sovereign Imperator";
  if (level >= 35) return "Praetorian Commander";
  if (level >= 20) return "Spartan Tribune";
  if (level >= 10) return "Frontline Centurion";
  if (level >= 5) return "Disciplined Legionnaire";
  return "Stoic Initiate";
}

export function getCostForLevel(level: number): number {
  return 1000 + (level - 1) * 250;
}

export function calculateLevelProgress(totalXp: number): LevelInfo {
  let remainingXp = Math.max(0, totalXp);
  let level = 1;

  while (true) {
    const cost = getCostForLevel(level);
    if (remainingXp >= cost) {
      remainingXp -= cost;
      level++;
    } else {
      break;
    }
  }

  const xpToNext = getCostForLevel(level);
  const progressPercent = Math.min(100, Math.round((remainingXp / xpToNext) * 100));

  return {
    level,
    title: getPrestigeTitle(level),
    totalXp,
    currentLevelXp: remainingXp,
    xpToNextLevel: xpToNext,
    progressPercent,
  };
}

export function invertTransaction(earnedXp: number): number {
  return -1 * Math.abs(earnedXp);
}
