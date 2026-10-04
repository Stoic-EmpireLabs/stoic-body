import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateMacroCalories,
  calculateAdherenceStatus,
  calculateRolling7DayAverage,
  recommendDeload,
} from "../src/lib/nutrition";

describe("Stoic Body — Nutrition & Body Composition Engine", () => {
  test("calculates macro calories with 4-4-9 formula accurately", () => {
    // 140g Protein (560 kcal), 150g Carbs (600 kcal), 60g Fat (540 kcal) = 1700 kcal
    assert.equal(calculateMacroCalories(140, 150, 60), 1700);
  });

  test("provides adherence-neutral coaching status without guilt or shame", () => {
    // Exact target: 140g protein, 1800 kcal
    const onTarget = calculateAdherenceStatus(142, 140, 1820, 1800);
    assert.equal(onTarget.status, "optimal");
    assert.equal(onTarget.message.includes("shame"), false);

    // High calorie day: still adherence-neutral, provides factual feedback
    const overCal = calculateAdherenceStatus(130, 140, 2200, 1800);
    assert.equal(overCal.status, "surplus");
    assert.equal(overCal.isNeutral, true);
  });

  test("computes 7-day rolling weight average filtering water weight noise", () => {
    // Daily weights with water fluctuations: [171.2, 170.8, 171.5, 170.2, 169.8, 170.4, 169.5]
    const weights = [171.2, 170.8, 171.5, 170.2, 169.8, 170.4, 169.5];
    const avg = calculateRolling7DayAverage(weights);
    // Sum = 1193.4 / 7 = 170.49
    assert.equal(Math.round(avg * 10) / 10, 170.5);
  });

  test("detects fatigue buildup and recommends proactive deload", () => {
    // Normal RPE: [7, 8, 8] -> no deload
    assert.equal(recommendDeload([7, 8, 8]), false);

    // Overreaching RPE: [9, 10, 9.5] -> deload recommended
    assert.equal(recommendDeload([9, 10, 9.5]), true);
  });
});
