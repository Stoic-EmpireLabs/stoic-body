import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateBufferMinutes,
  detectScheduleOverflow,
  ScheduledTask,
} from "../src/lib/scheduling";

describe("Stoic Body — Scheduling & Buffer Engine", () => {
  test("calculates transition buffer with formula max(15m, 0.20 * duration)", () => {
    // 15-min task -> max(15, 3) = 15
    assert.equal(calculateBufferMinutes(15), 15);

    // 45-min task -> max(15, 9) = 15
    assert.equal(calculateBufferMinutes(45), 15);

    // 60-min task -> max(15, 12) = 15
    assert.equal(calculateBufferMinutes(60), 15);

    // 90-min task -> max(15, 18) = 18
    assert.equal(calculateBufferMinutes(90), 18);

    // 120-min task -> max(15, 24) = 24
    assert.equal(calculateBufferMinutes(120), 24);
  });

  test("detects schedule overflow when total duration + buffers exceed available waking day", () => {
    // Founder waking day: 05:30 to 22:00 = 16.5 hours = 990 minutes
    const tasks: ScheduledTask[] = [
      { id: "1", title: "Morning Anchor", durationMinutes: 90, priorityTier: 1 }, // 90 + 18 = 108
      { id: "2", title: "Client Acquisition", durationMinutes: 240, priorityTier: 2 }, // 240 + 48 = 288
      { id: "3", title: "DBA Dissertation", durationMinutes: 180, priorityTier: 2 }, // 180 + 36 = 216
      { id: "4", title: "Ultron LLM Config", durationMinutes: 120, priorityTier: 3 }, // 120 + 24 = 144
      { id: "5", title: "Mustang Oil Change", durationMinutes: 180, priorityTier: 3 }, // 180 + 36 = 216
    ];
    // Total scheduled = 108 + 288 + 216 + 144 + 216 = 972 minutes (fits within 990 min)
    const safeCheck = detectScheduleOverflow(tasks, "05:30", "22:00");
    assert.equal(safeCheck.hasOverflow, false);
    assert.equal(safeCheck.totalCommitmentMinutes, 972);

    // Adding an extra 60-min task (60 + 15 = 75 min) pushes to 1047 min (> 990 min)
    const overloadedTasks = [
      ...tasks,
      { id: "6", title: "Bed Frame Build", durationMinutes: 60, priorityTier: 3 },
    ];
    const overflowCheck = detectScheduleOverflow(overloadedTasks, "05:30", "22:00");
    assert.equal(overflowCheck.hasOverflow, true);
    assert.equal(overflowCheck.overflowMinutes, 57);
    assert.equal(overflowCheck.suggestions.length > 0, true);
  });
});
