import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateMacroCalories,
  calculateAdherenceStatus,
  calculateRolling7DayAverage,
  recommendDeload,
  SOVEREIGN_MEAL_BLUEPRINTS,
  HEALTHY_DRINK_RECIPES,
  getMealBlueprintByProtein,
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

  test("verifies all 3 Sovereign Meal Blueprints (Fish, Turkey, Chicken) hit ~140g protein and ~1,800 kcal", () => {
    assert.equal(SOVEREIGN_MEAL_BLUEPRINTS.length, 3);

    const fishBp = getMealBlueprintByProtein("Fish");
    const turkeyBp = getMealBlueprintByProtein("Turkey");
    const chickenBp = getMealBlueprintByProtein("Chicken");

    // Fish Blueprint
    assert.equal(fishBp.proteinSource, "Fish");
    assert.ok(fishBp.macros.protein >= 138 && fishBp.macros.protein <= 145, `Fish protein ${fishBp.macros.protein}g`);
    assert.ok(fishBp.macros.calories >= 1750 && fishBp.macros.calories <= 1850, `Fish kcal ${fishBp.macros.calories}`);
    assert.ok(fishBp.ingredients.some((i) => i.item.includes("Salmon") || i.item.includes("Cod")));
    assert.ok(fishBp.ingredients.some((i) => i.item.includes("Rice")));
    assert.ok(fishBp.ingredients.some((i) => i.item.includes("Broccoli")));

    // Turkey Blueprint
    assert.equal(turkeyBp.proteinSource, "Turkey");
    assert.ok(turkeyBp.macros.protein >= 138 && turkeyBp.macros.protein <= 145, `Turkey protein ${turkeyBp.macros.protein}g`);
    assert.ok(turkeyBp.macros.calories >= 1750 && turkeyBp.macros.calories <= 1850, `Turkey kcal ${turkeyBp.macros.calories}`);
    assert.ok(turkeyBp.ingredients.some((i) => i.item.includes("Turkey")));
    assert.ok(turkeyBp.ingredients.some((i) => i.item.includes("Rice")));
    assert.ok(turkeyBp.ingredients.some((i) => i.item.includes("Peppers") || i.item.includes("Spinach")));

    // Chicken Blueprint
    assert.equal(chickenBp.proteinSource, "Chicken");
    assert.ok(chickenBp.macros.protein >= 138 && chickenBp.macros.protein <= 145, `Chicken protein ${chickenBp.macros.protein}g`);
    assert.ok(chickenBp.macros.calories >= 1750 && chickenBp.macros.calories <= 1850, `Chicken kcal ${chickenBp.macros.calories}`);
    assert.ok(chickenBp.ingredients.some((i) => i.item.includes("Chicken")));
    assert.ok(chickenBp.ingredients.some((i) => i.item.includes("Rice")));
    assert.ok(chickenBp.ingredients.some((i) => i.item.includes("Broccoli")));
  });

  test("verifies Healthy Drinks Lab recipes including Lemon Chia Seed Elixir", () => {
    assert.ok(HEALTHY_DRINK_RECIPES.length >= 5);

    // Lemon Chia Seed Elixir
    const lemonChia = HEALTHY_DRINK_RECIPES.find((d) => d.id === "drink-lemon-chia");
    assert.ok(lemonChia, "Lemon Chia drink must exist");
    assert.ok(lemonChia.hydrationOz >= 24);
    assert.ok(lemonChia.ingredients.some((i) => i.item.includes("Chia Seeds")));
    assert.ok(lemonChia.ingredients.some((i) => i.item.includes("Lemon")));
    assert.ok(lemonChia.scientificBenefits.some((b) => b.includes("Mucilage")));

    // Fasting Mineral Electrolyte Shield
    const electrolytes = HEALTHY_DRINK_RECIPES.find((d) => d.id === "drink-electrolytes");
    assert.ok(electrolytes, "Electrolytes drink must exist");
    assert.equal(electrolytes.calories, 0, "Fasting electrolytes must be 0 calories");
    assert.equal(electrolytes.fastingSafe, true);
    assert.ok(electrolytes.ingredients.some((i) => i.item.includes("Sodium") || i.item.includes("Salt")));
    assert.ok(electrolytes.ingredients.some((i) => i.item.includes("Potassium")));
    assert.ok(electrolytes.ingredients.some((i) => i.item.includes("Magnesium")));

    // Matcha EGCG
    const matcha = HEALTHY_DRINK_RECIPES.find((d) => d.id === "drink-matcha-egcg");
    assert.ok(matcha, "Matcha drink must exist");

    // ACV Digestive Primer
    const acv = HEALTHY_DRINK_RECIPES.find((d) => d.id === "drink-acv-digestive");
    assert.ok(acv, "ACV drink must exist");

    // Evening Chamomile
    const chamomile = HEALTHY_DRINK_RECIPES.find((d) => d.id === "drink-chamomile-sleep");
    assert.ok(chamomile, "Chamomile drink must exist");
  });
});
