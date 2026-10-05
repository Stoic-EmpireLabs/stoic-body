import test from "node:test";
import assert from "node:assert/strict";
import { getWorkoutBlueprint, WORKOUT_BLUEPRINTS } from "../../src/lib/workout-blueprints";
import { getNutritionNotebook } from "../../src/lib/nutrition-notebook";
import { getBiohackRemedy, BIOHACKS_REGISTRY } from "../../src/lib/biohacks";

test("Workout Blueprints — Push, Pull, and Legs workout blueprints with anatomical muscle targets", () => {
  const push = getWorkoutBlueprint("push");
  assert.ok(push, "Push blueprint should exist");
  assert.ok(push.title.includes("Push"));
  assert.ok(push.exercises.length >= 6);
  assert.ok(push.exercises[0].targetMuscleGroups.includes("Upper Chest"));

  const pull = getWorkoutBlueprint("pull");
  assert.ok(pull, "Pull blueprint should exist");
  assert.ok(pull.title.includes("Pull"));
  assert.ok(pull.exercises[0].targetMuscleGroups.includes("Latissimus Dorsi"));
});

test("Workout Blueprints — Include cardio finishers and sets x reps ranges", () => {
  const push = getWorkoutBlueprint("push");
  assert.ok(push?.cardioFinisher, "Push should have a cardio finisher");
  assert.equal(push?.cardioFinisher?.durationMin, 20);
  assert.equal(push?.exercises[0].repsRange, "5–8 reps");
});

test("Tactical Field-Notebook Nutrition — Calculate Roman numeral meals and scaled macros", () => {
  const diet = getNutritionNotebook("Aggressive Cut", 1700);
  assert.ok(diet, "Diet should exist");
  assert.equal(diet.meals.length, 7);
  assert.equal(diet.meals[0].romanNumeral, "I");
  assert.equal(diet.meals[0].name, "Breakfast");
  assert.equal(diet.macros.calories, 1700);
  assert.ok(diet.macros.protein > 140);
});

test("Stoic Biohacks Apothecary — Return the ginger infusion remedy for bloating", () => {
  const remedy = getBiohackRemedy("bloating");
  assert.ok(remedy, "Bloating remedy should exist");
  assert.ok(remedy.headline.includes("Eat Ginger"));
  assert.ok(remedy.protocol.includes("ginger"));
});

test("Stoic Biohacks Apothecary — Remedies for DOMS soreness and energy crash", () => {
  const soreness = getBiohackRemedy("soreness");
  assert.ok(soreness, "Soreness remedy should exist");
  assert.ok(soreness.protocol.toLowerCase().includes("tart cherry"));

  const crash = getBiohackRemedy("energy-crash");
  assert.ok(crash, "Energy crash remedy should exist");
  assert.ok(crash.protocol.toLowerCase().includes("salt"));
});
