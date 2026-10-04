export function calculateMacroCalories(
  protein_g: number,
  carbs_g: number,
  fat_g: number
): number {
  return protein_g * 4 + carbs_g * 4 + fat_g * 9;
}

export interface AdherenceEvaluation {
  status: "optimal" | "surplus" | "deficit";
  message: string;
  isNeutral: boolean;
}

export function calculateAdherenceStatus(
  proteinActual: number,
  proteinTarget: number,
  calorieActual: number,
  calorieTarget: number
): AdherenceEvaluation {
  const calorieDiffPercent = (calorieActual - calorieTarget) / calorieTarget;

  if (Math.abs(calorieDiffPercent) <= 0.1) {
    return {
      status: "optimal",
      message: "Nutritional intake is aligned with body recomposition goals.",
      isNeutral: true,
    };
  }

  if (calorieDiffPercent > 0.1) {
    return {
      status: "surplus",
      message: "Energy surplus logged. Factually recorded without penalty; next meal resumes standard deficit.",
      isNeutral: true,
    };
  }

  return {
    status: "deficit",
    message: "Deeper deficit logged. Ensure water and electrolytes remain prioritized.",
    isNeutral: true,
  };
}

export function calculateRolling7DayAverage(weights: number[]): number {
  if (weights.length === 0) return 0;
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return sum / weights.length;
}

export function recommendDeload(recentRPEs: number[]): boolean {
  if (recentRPEs.length === 0) return false;
  const avg = recentRPEs.reduce((acc, r) => acc + r, 0) / recentRPEs.length;
  return avg >= 9.0;
}
