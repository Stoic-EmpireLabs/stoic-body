import test from "node:test";
import assert from "node:assert/strict";
import { PRELOADED_QUESTS, getQuestsByCategory, QuestCategory } from "../src/lib/quests";

test("Quests — Preloaded Catalog Integrity", () => {
  assert.ok(PRELOADED_QUESTS.length >= 12, "Must have comprehensive catalog of quests");

  for (const quest of PRELOADED_QUESTS) {
    assert.ok(quest.id.startsWith("q-"), `Quest ID must start with q-, got ${quest.id}`);
    assert.ok(quest.title.length > 5, "Quest title must be substantive");
    assert.ok(quest.description.length > 15, "Quest description must be informative");
    assert.ok(quest.steps.length >= 3, "Quest must have at least 3 executable steps");
    assert.ok(quest.tier >= 1 && quest.tier <= 5, "Quest tier must be between 1 and 5");
    assert.ok(quest.xpReward >= 100, "Quest XP reward must be at least 100");
    assert.ok(
      ["Strength", "Endurance", "Discipline", "Knowledge", "Recovery"].includes(quest.attributeTarget),
      `Valid attribute target required: got ${quest.attributeTarget}`
    );
  }
});

test("Quests — Category Filtering", () => {
  const allQuests = getQuestsByCategory("All");
  assert.equal(allQuests.length, PRELOADED_QUESTS.length);

  const makerspace = getQuestsByCategory("Makerspace & Mechanical");
  assert.ok(makerspace.length >= 3);
  assert.ok(makerspace.some((q) => q.id === "q-mustang"));

  const combat = getQuestsByCategory("Combat Conditioning & Athletics");
  assert.ok(combat.length >= 3);
  assert.ok(combat.some((q) => q.id === "q-boxing-gauntlet"));

  const fatherhood = getQuestsByCategory("Fatherhood & Tribe");
  assert.ok(fatherhood.length >= 3);
  assert.ok(fatherhood.some((q) => q.id === "q-cheer-stunting"));
});
