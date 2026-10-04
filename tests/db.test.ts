import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getDatabase, seedInitialData } from "../src/lib/db";

describe("Stoic Body — Local SQLite Storage Engine (node:sqlite)", () => {
  test("initializes schema and tables in memory without error", () => {
    const db = getDatabase(":memory:");
    assert.ok(db, "Database instance should exist");

    // Verify tables exist
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    assert.ok(tableNames.includes("users"), "users table must exist");
    assert.ok(tableNames.includes("tasks"), "tasks table must exist");
    assert.ok(tableNames.includes("workout_sessions"), "workout_sessions table must exist");
    assert.ok(tableNames.includes("quests"), "quests table must exist");
    assert.ok(tableNames.includes("xp_transactions"), "xp_transactions table must exist");
  });

  test("seeds founder profile and morning anchor tasks correctly", () => {
    const db = getDatabase(":memory:");
    seedInitialData(db);

    const user = db.prepare("SELECT * FROM users WHERE id = 'founder'").get() as any;
    assert.equal(user.age, 33);
    assert.equal(user.current_weight, 170);
    assert.equal(user.target_weight, 155);
    assert.equal(user.diet_archetype, "OMAD");

    const tasks = db.prepare("SELECT * FROM tasks").all() as any[];
    assert.ok(tasks.length >= 3, "Should have morning anchor tasks seeded");

    const quests = db.prepare("SELECT * FROM quests").all() as any[];
    assert.ok(quests.some((q) => q.title.includes("Mustang")), "Mustang Quest should be seeded");
  });
});
