import test from "node:test";
import assert from "node:assert/strict";
import {
  FOUNDER_LEARNING_PATHWAYS,
  calculateNextReviewDate,
  calculatePathwayProgress,
  LearningPathway,
} from "../src/lib/learning";

test("Stoic Body — Deconstructed Learning Curricula & Pathways", () => {
  assert.ok(FOUNDER_LEARNING_PATHWAYS.length >= 6);

  const mustangPathway = FOUNDER_LEARNING_PATHWAYS.find((p) => p.id === "mustang_oil_change");
  assert.ok(mustangPathway, "Mustang oil change pathway must exist");
  assert.equal(mustangPathway?.steps.length, 6);
  assert.ok(mustangPathway?.prerequisites.length >= 3);
  assert.ok(mustangPathway?.verifiedResources.length >= 1);

  // Check cheerleader flyer pathway
  const flyerPathway = FOUNDER_LEARNING_PATHWAYS.find((p) => p.id === "cheer_flyer_progression");
  assert.ok(flyerPathway, "Cheer flyer progression pathway must exist");
  assert.ok(flyerPathway?.steps.some((s) => s.title.toLowerCase().includes("elevator") || s.title.toLowerCase().includes("thigh")));

  // Check progress calculation
  const dummyPathway: LearningPathway = {
    ...mustangPathway!,
    steps: [
      { id: "s1", title: "Step 1", completed: true, estimatedMinutes: 20 },
      { id: "s2", title: "Step 2", completed: true, estimatedMinutes: 20 },
      { id: "s3", title: "Step 3", completed: false, estimatedMinutes: 20 },
      { id: "s4", title: "Step 4", completed: false, estimatedMinutes: 20 },
    ],
  };

  const progress = calculatePathwayProgress(dummyPathway);
  assert.equal(progress.completedSteps, 2);
  assert.equal(progress.totalSteps, 4);
  assert.equal(progress.percentage, 50);
});

test("Stoic Body — Spaced Review Interval Scheduling (SM-2 Lite)", () => {
  const baseDate = new Date("2026-10-04T12:00:00Z");

  // Interval 1: 1 day later
  const review1 = calculateNextReviewDate(baseDate, 1);
  assert.equal(review1.toISOString().split("T")[0], "2026-10-05");

  // Interval 2: 3 days later
  const review2 = calculateNextReviewDate(baseDate, 2);
  assert.equal(review2.toISOString().split("T")[0], "2026-10-07");

  // Interval 3: 7 days later
  const review3 = calculateNextReviewDate(baseDate, 3);
  assert.equal(review3.toISOString().split("T")[0], "2026-10-11");
});
