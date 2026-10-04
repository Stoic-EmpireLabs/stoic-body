import test from "node:test";
import assert from "node:assert/strict";
import {
  generateSyncPayload,
  validateSyncPayload,
  reconcileSnapshots,
  detectScheduleConflicts,
  filterMinimumViableDay,
  calculateBufferMinutes,
} from "../src/lib/sync";

test("Phase 4 Core — Schedule Conflict & Dynamic Buffer Engine", () => {
  const tasks = [
    { id: "1", title: "Morning Routine", time: "05:30", durationMinutes: 60 },
    { id: "2", title: "Business Consulting", time: "06:15", durationMinutes: 90 }, // Conflicts with 1!
    { id: "3", title: "DBA Research", time: "08:00", durationMinutes: 60 },
  ];

  const conflicts = detectScheduleConflicts(tasks);
  assert.equal(conflicts.length, 1, "Must detect exactly 1 overlap");
  assert.equal(conflicts[0].taskA.id, "1");
  assert.equal(conflicts[0].taskB.id, "2");

  // Non-conflicting test
  const cleanTasks = [
    { id: "1", title: "Morning Routine", time: "05:30", durationMinutes: 45 },
    { id: "2", title: "Business Consulting", time: "07:00", durationMinutes: 90 },
  ];
  const cleanConflicts = detectScheduleConflicts(cleanTasks);
  assert.equal(cleanConflicts.length, 0, "No conflicts should be reported for spaced tasks");
});

test("Phase 4 Core — Minimum Viable Day (MVD) Crisis Mode Filter", () => {
  const allTasks = [
    { id: "1", title: "Hydrate: 24oz Water", tier: 1, isAnchor: true },
    { id: "2", title: "Deep Strategy Consulting", tier: 4, isAnchor: false },
    { id: "3", title: "Calisthenics & Boxing", tier: 3, isAnchor: true },
    { id: "4", title: "Mustang Car Maintenance", tier: 3, isAnchor: false },
    { id: "5", title: "23:1 OMAD Fasting Protocol", tier: 1, isAnchor: true },
  ];

  const mvdTasks = filterMinimumViableDay(allTasks);
  assert.equal(mvdTasks.length, 3, "MVD must filter down to only core anchors");
  assert.ok(mvdTasks.every((t) => t.isAnchor || t.tier === 1), "All retained tasks must be anchors or Tier 1");
});

test("Phase 4 Core — Sync Payload Generation & Hash Verification", () => {
  const mockState = {
    totalXp: 28500,
    streakDays: 14,
    userProfile: { name: "Stoic", targetWeight: 155 },
    tasks: [{ id: "t-1", title: "Pushups", completed: true }],
  };

  const payload = generateSyncPayload(mockState as any, "device-mac-pro-01");
  assert.ok(payload.syncId.startsWith("sync-"));
  assert.equal(payload.deviceId, "device-mac-pro-01");
  assert.equal(payload.totalXp, 28500);
  assert.ok(payload.dataHash.length > 8, "Payload must generate deterministic hash");

  const validation = validateSyncPayload(payload);
  assert.equal(validation.valid, true, "Generated payload must validate cleanly");
});

test("Phase 4 Core — Snapshot Reconciliation (Last-Write-Wins with Monotonic XP)", () => {
  const local = {
    updatedAt: "2026-10-04T12:00:00Z",
    totalXp: 26000,
    tasks: [{ id: "t1", completed: false }],
  };

  const remote = {
    updatedAt: "2026-10-04T12:30:00Z",
    totalXp: 27500,
    tasks: [{ id: "t1", completed: true }],
  };

  const reconciled = reconcileSnapshots(local as any, remote as any);
  assert.equal(reconciled.totalXp, 27500, "Should take maximum monotonic XP");
  assert.equal(reconciled.tasks[0].completed, true, "Remote is newer, task should be completed");
});
