import { describe, it } from "node:test";
import assert from "node:assert";
import bodySvgData from "../src/lib/body-svg-data.json";
import { ALL_EXERCISES, MUSCLE_GROUPS, getExercisesForMuscles, getExerciseById } from "../src/lib/exercise-catalog";

describe("Open-GYM Reverse-Engineered Integration", () => {
  it("verifies body-svg-data dimensions and base vector paths", () => {
    assert.strictEqual(bodySvgData.bodyViewW, 535);
    assert.strictEqual(bodySvgData.bodyViewH, 462);
    assert.ok(bodySvgData.bodyBaseMain.length > 0, "bodyBaseMain must have vector paths");
    assert.ok(bodySvgData.bodyBaseLite.length > 0, "bodyBaseLite must have vector paths");
  });

  it("verifies all 13 primary muscle groups are mapped with SVG paths", () => {
    const requiredMuscles = [
      "chest", "shoulders", "biceps", "triceps", "forearm",
      "abdomen", "obliques", "back", "trapezius", "glutes",
      "quads", "hamstrings", "calves"
    ];

    for (const m of requiredMuscles) {
      assert.ok(bodySvgData.muscleFills[m], `muscleFills must contain ${m}`);
      assert.ok(bodySvgData.muscleFills[m].length > 0, `${m} must have non-empty path array`);
      assert.ok(bodySvgData.muscleHits[m], `muscleHits must contain ${m}`);
    }
  });

  it("verifies full 552-exercise catalog integrity", () => {
    assert.strictEqual(ALL_EXERCISES.length, 552, "Must contain exactly 552 exercises from Open-GYM catalog");
    
    // Check barbell bench press
    const bench = getExerciseById("EIeI8Vf");
    assert.ok(bench, "Bench press must exist");
    assert.strictEqual(bench?.name, "Barbell Bench Press");
    assert.strictEqual(bench?.primary, "chest");
    assert.strictEqual(bench?.equipment, "Barbell");
    assert.ok(bench?.steps.length > 0, "Steps must be defined");
  });

  it("verifies targeted exercise filtering by muscle selection", () => {
    const chestExercises = getExercisesForMuscles(["chest"]);
    assert.ok(chestExercises.length > 10, "Chest must have numerous exercises");
    
    for (const ex of chestExercises.slice(0, 5)) {
      const match = ex.primary.toLowerCase() === "chest" || ex.secondary.some(s => s.toLowerCase() === "chest");
      assert.ok(match, `${ex.name} must target chest`);
    }

    const multiTarget = getExercisesForMuscles(["quads", "hamstrings"]);
    assert.ok(multiTarget.length > 15, "Quads + Hamstrings must return rich leg movements");
  });

  it("verifies muscle group registry matches Open-GYM spec", () => {
    assert.strictEqual(MUSCLE_GROUPS.length, 13);
    const chestGroup = MUSCLE_GROUPS.find(m => m.id === "chest");
    assert.ok(chestGroup);
    assert.strictEqual(chestGroup?.label, "Chest");
  });
});
