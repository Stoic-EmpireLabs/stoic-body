import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTaskPoints,
  calculateLevelProgress,
  invertTransaction,
  calculateAttributeScores,
  DifficultyTier,
} from "../src/lib/gamification";

describe("Stoic Body — 5-Tier Gamification Engine", () => {
  test("calculates base XP for all 5 difficulty tiers correctly", () => {
    // 0 days streak (1.0x), not on-time (1.0x), 0 combo
    assert.equal(calculateTaskPoints(DifficultyTier.Micro, 0, false, 0), 100);
    assert.equal(calculateTaskPoints(DifficultyTier.Routine, 0, false, 0), 300);
    assert.equal(calculateTaskPoints(DifficultyTier.Challenging, 0, false, 0), 750);
    assert.equal(calculateTaskPoints(DifficultyTier.Boss, 0, false, 0), 1500);
    assert.equal(calculateTaskPoints(DifficultyTier.Legendary, 0, false, 0), 3500);
  });

  test("applies streak multipliers accurately", () => {
    // Tier 1 (100 XP) at 14 days streak (1.25x Virtue Stance) -> 125 XP
    assert.equal(calculateTaskPoints(DifficultyTier.Micro, 14, false, 0), 125);

    // Tier 3 (750 XP) at 30 days streak (2.0x Unshakable Will) -> 1500 XP
    assert.equal(calculateTaskPoints(DifficultyTier.Challenging, 30, false, 0), 1500);
  });

  test("applies punctuality critical hit (1.2x) when on-time", () => {
    // Tier 2 (300 XP) with punctuality crit (1.2x) -> 360 XP
    assert.equal(calculateTaskPoints(DifficultyTier.Routine, 0, true, 0), 360);
  });

  test("adds flow combo bonuses for chaining tasks", () => {
    // Tier 1 (100 XP) + 2nd chain combo (+100) -> 200 XP
    assert.equal(calculateTaskPoints(DifficultyTier.Micro, 0, false, 2), 200);

    // Tier 1 (100 XP) + 3rd chain combo (+250) -> 350 XP
    assert.equal(calculateTaskPoints(DifficultyTier.Micro, 0, false, 3), 350);

    // Tier 1 (100 XP) + 4th chain combo (+500) -> 600 XP
    assert.equal(calculateTaskPoints(DifficultyTier.Micro, 0, false, 4), 600);
  });

  test("effort boost bumps tier by +1 for high-gravity sessions", () => {
    // Tier 2 (300 XP) boosted to Tier 3 (750 XP) -> difference is +450 XP
    const standard = calculateTaskPoints(DifficultyTier.Routine, 0, false, 0, false);
    const boosted = calculateTaskPoints(DifficultyTier.Routine, 0, false, 0, true);
    assert.equal(boosted - standard, 450);
  });

  test("calculates level progress and prestige title hierarchy correctly", () => {
    // 0 XP -> Level 1 Stoic Initiate
    const l1 = calculateLevelProgress(0);
    assert.equal(l1.level, 1);
    assert.equal(l1.title, "Stoic Initiate");
    assert.equal(l1.xpToNextLevel, 1000);

    // 1,000 XP -> Level 2 Stoic Initiate
    const l2 = calculateLevelProgress(1000);
    assert.equal(l2.level, 2);
    assert.equal(l2.currentLevelXp, 0);

    // Lifetime XP 26,450 -> Level 12 Frontline Centurion
    const l12 = calculateLevelProgress(26450);
    assert.equal(l12.level, 12);
    assert.equal(l12.title, "Frontline Centurion");

    // High level -> Spartan Tribune at 20+, Sovereign Imperator at 50+
    const l20 = calculateLevelProgress(61750);
    assert.equal(l20.level, 20);
    assert.equal(l20.title, "Spartan Tribune");
  });

  test("anti-exploit inversion negates points symmetrically", () => {
    assert.equal(invertTransaction(750), -750);
    assert.equal(invertTransaction(125), -125);
  });

  test("calculates dynamic 5-axis RPG attribute scores accurately from transactions", () => {
    const txs = [
      { attribute: "Strength", amount: 2500 },
      { attribute: "Endurance", amount: 1500 },
      { attribute: "Discipline", amount: 4000 },
      { attribute: "Knowledge", amount: 3000 },
      { attribute: "Recovery", amount: 1200 },
      { attribute: "Strength", amount: 500, isReversed: true }, // Should be ignored
    ];
    const scores = calculateAttributeScores(txs);
    assert.equal(scores.rawXp.strength, 2500);
    assert.equal(scores.rawXp.endurance, 1500);
    assert.equal(scores.rawXp.discipline, 4000);
    assert.equal(scores.rawXp.knowledge, 3000);
    assert.equal(scores.rawXp.recovery, 1200);

    // Scores should be between 0.4 and 1.0
    assert.ok(scores.strength >= 0.50 && scores.strength <= 1.0);
    assert.ok(scores.discipline > scores.recovery);
  });
});
