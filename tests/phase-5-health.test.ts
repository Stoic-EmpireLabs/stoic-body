import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDailyMacros,
  calculateBodyFatNavy,
  projectRecompositionTimeline,
  calculateMovingAverageWeight,
  generateBoxingCombos,
} from "../src/lib/health";

test("Phase 5 Health — Daily Macro & Caloric Balance", () => {
  const meals = [
    { id: "m1", name: "Ribeye Steak & Eggs", calories: 1100, protein: 95, carbs: 2, fat: 78 },
    { id: "m2", name: "Greek Yogurt & Whey Shake", calories: 450, protein: 55, carbs: 12, fat: 8 },
  ];

  const totals = calculateDailyMacros(meals);
  assert.equal(totals.totalCalories, 1550);
  assert.equal(totals.totalProtein, 150);
  assert.equal(totals.totalCarbs, 14);
  assert.equal(totals.totalFat, 86);
  assert.equal(totals.proteinMet(140), true, "Should meet or exceed 140g protein target");
});

test("Phase 5 Health — US Navy Body Fat Percentage Formula", () => {
  // Male: 5'10" (70 inches), waist 34 inches, neck 15.5 inches
  const heightInches = 70;
  const waistInches = 34;
  const neckInches = 15.5;

  const bf = calculateBodyFatNavy(waistInches, neckInches, heightInches);
  assert.ok(bf >= 14 && bf <= 18, `Body fat must be realistic (~16%), got ${bf}%`);

  // Target waist 31 inches, neck 15.5 inches (leaner state)
  const bfLean = calculateBodyFatNavy(31, 15.5, 70);
  assert.ok(bfLean < bf, "Leaner waist must yield lower body fat percentage");
  assert.ok(bfLean >= 9 && bfLean <= 13, `Leaner state should be ~11%, got ${bfLean}%`);
});

test("Phase 5 Health — 170 -> 155 lbs Recomp Timeline Forecast", () => {
  const currentWeight = 170;
  const targetWeight = 155;
  const dailyDeficit = 500; // ~1 lb fat loss per week (3,500 kcal / 7 days)

  const forecast = projectRecompositionTimeline(currentWeight, targetWeight, dailyDeficit);
  assert.equal(forecast.totalLbsToLose, 15);
  assert.equal(forecast.weeksRequired, 15);
  assert.ok(forecast.estimatedCompletionDate > new Date().toISOString().split("T")[0]);
  assert.ok(forecast.uncertaintyRangeWeeks.min <= 15);
  assert.ok(forecast.uncertaintyRangeWeeks.max >= 15);
});

test("Phase 5 Health — 7-Day Moving Average Weight Filter", () => {
  const weights = [
    { date: "2026-09-28", weight: 171.2 },
    { date: "2026-09-29", weight: 170.8 },
    { date: "2026-09-30", weight: 172.0 }, // water weight spike
    { date: "2026-10-01", weight: 170.4 },
    { date: "2026-10-02", weight: 170.1 },
    { date: "2026-10-03", weight: 169.8 },
    { date: "2026-10-04", weight: 169.5 },
  ];

  const avg = calculateMovingAverageWeight(weights);
  assert.ok(avg >= 170.2 && avg <= 170.8, `Moving average should smooth spike, got ${avg}`);
});

test("Phase 5 Health — Boxing Combination Generator & Pacing", () => {
  const combos = generateBoxingCombos(4);
  assert.equal(combos.length, 4);
  assert.ok(combos[0].comboSequence.length > 0);
  assert.ok(typeof combos[0].callout === "string");
});
