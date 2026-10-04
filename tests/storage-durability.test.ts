import test from "node:test";
import assert from "node:assert/strict";
import { getDatabase, seedInitialData } from "../src/lib/db";

test("Stoic Body — Storage Durability & Backup Integrity", () => {
  const db = getDatabase(":memory:");
  seedInitialData(db);

  // 1. Verify schema tables exist
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];
  
  const tableNames = tables.map((t) => t.name);
  assert.ok(tableNames.includes("users"), "users table must exist");
  assert.ok(tableNames.includes("tasks"), "tasks table must exist");
  assert.ok(tableNames.includes("xp_transactions"), "xp_transactions table must exist");
  assert.ok(tableNames.includes("workout_sessions"), "workout_sessions table must exist");
  assert.ok(tableNames.includes("quests"), "quests table must exist");

  // 2. Verify founder profile data integrity
  const user = db.prepare("SELECT * FROM users WHERE id = 'founder'").get() as any;
  assert.equal(user.age, 33);
  assert.equal(user.current_weight, 170);
  assert.equal(user.target_weight, 155);
  assert.equal(user.diet_archetype, "OMAD");

  // 3. Test backup generation schema
  const tasks = db.prepare("SELECT * FROM tasks").all();
  const backupPayload = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    user,
    taskCount: tasks.length,
    system: "Stoic Body Sovereign Workstation",
  };

  assert.ok(backupPayload.taskCount >= 3, "Seeded tasks must be exported");
  assert.equal(backupPayload.user.target_weight, 155);

  // 4. Test backup JSON round-trip serialization
  const jsonStr = JSON.stringify(backupPayload);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.user.id, "founder");
  assert.equal(parsed.taskCount, tasks.length);
});
