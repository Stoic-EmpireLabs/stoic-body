import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateBufferMinutes,
  detectScheduleOverflow,
  calculateGoalCountdown,
  calculateMilestoneProgression,
  generateMultiWeekSchedule,
  ScheduledTask,
} from "../src/lib/scheduling";

describe("Stoic Body — Scheduling & Buffer Engine", () => {
  test("calculates transition buffer with formula max(15m, 0.20 * duration)", () => {
    assert.equal(calculateBufferMinutes(15), 15);
    assert.equal(calculateBufferMinutes(45), 15);
    assert.equal(calculateBufferMinutes(60), 15);
    assert.equal(calculateBufferMinutes(90), 18);
    assert.equal(calculateBufferMinutes(120), 24);
  });

  test("detects schedule overflow when total duration + buffers exceed available waking day", () => {
    const tasks: ScheduledTask[] = [
      { id: "1", title: "Morning Anchor", durationMinutes: 90, priorityTier: 1 },
      { id: "2", title: "Client Acquisition", durationMinutes: 240, priorityTier: 2 },
      { id: "3", title: "DBA Dissertation", durationMinutes: 180, priorityTier: 2 },
      { id: "4", title: "Ultron LLM Config", durationMinutes: 120, priorityTier: 3 },
      { id: "5", title: "Mustang Oil Change", durationMinutes: 180, priorityTier: 3 },
    ];
    const safeCheck = detectScheduleOverflow(tasks, "05:30", "22:00");
    assert.equal(safeCheck.hasOverflow, false);
    assert.equal(safeCheck.totalCommitmentMinutes, 972);

    const overloadedTasks = [
      ...tasks,
      { id: "6", title: "Bed Frame Build", durationMinutes: 60, priorityTier: 3 },
    ];
    const overflowCheck = detectScheduleOverflow(overloadedTasks, "05:30", "22:00");
    assert.equal(overflowCheck.hasOverflow, true);
    assert.equal(overflowCheck.overflowMinutes, 57);
  });

  test("calculates goal countdown accurately with days, hours, minutes", () => {
    const fakeNow = new Date("2026-10-04T12:00:00Z").getTime();
    const targetDate = "2026-12-15T12:00:00Z"; // 72 days ahead

    const countdown = calculateGoalCountdown(targetDate, fakeNow);
    assert.equal(countdown.isPassed, false);
    assert.equal(countdown.days, 72);
    assert.equal(countdown.hours, 0);
    assert.equal(countdown.minutes, 0);
  });

  test("calculates milestone checkpoints across 12-week campaign", () => {
    const milestones = calculateMilestoneProgression(170, 155, 12, "2026-10-04");
    assert.equal(milestones.length, 3);
    assert.ok(milestones[0].phaseName.includes("Phase 1"));
    assert.ok(milestones[0].targetWeightLbs < 170);
    assert.ok(milestones[1].targetWeightLbs < milestones[0].targetWeightLbs);
    assert.equal(milestones[2].targetWeightLbs, 155);
    assert.ok(milestones[0].scientificMechanism.length > 20);
  });

  test("generates multi-week periodized campaign across 12 weeks (84 days)", () => {
    const schedule = generateMultiWeekSchedule("2026-10-04", 12, {
      startWeight: 170,
      targetWeight: 155,
      trainingFocus: "Calisthenics & Boxing",
      techTrack: "AI Spectrum",
      proteinPreference: "Fish",
    });

    // 84 days with multiple events per day (> 250 scheduled events)
    assert.ok(schedule.length > 250);

    // Verify first and last day
    assert.equal(schedule[0].date, "2026-10-04");
    assert.equal(schedule[0].weekNumber, 1);
    assert.equal(schedule[schedule.length - 1].weekNumber, 12);

    // Verify presence of citations and weight forecast
    assert.ok(schedule[0].scientificCitation.length > 10);
    assert.equal(schedule[0].targetWeightForecastLbs, 170);
    assert.equal(schedule[schedule.length - 1].targetWeightForecastLbs, 155);

    // Verify 23:1 OMAD events exist
    assert.ok(schedule.some((e) => e.title.includes("23:1 OMAD Feast")));
    // Verify Calisthenics events exist
    assert.ok(schedule.some((e) => e.title.includes("Calisthenics Hypertrophic Overload")));
    // Verify Boxing events exist
    assert.ok(schedule.some((e) => e.title.includes("Boxing High-Gravity Intervals")));
  });
});
