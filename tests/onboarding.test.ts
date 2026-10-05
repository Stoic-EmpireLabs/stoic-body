import test from "node:test";
import assert from "node:assert/strict";
import {
  FOUNDER_PROFILE,
  APP_TOUR_STEPS,
  calibrateClientProfile,
  getHostContextDirective,
  QuestionnaireAnswers,
} from "../src/lib/onboarding";

test("Onboarding — Founder Profile Baseline Integrity", () => {
  assert.equal(FOUNDER_PROFILE.id, "founder");
  assert.equal(FOUNDER_PROFILE.currentWeight, 170);
  assert.equal(FOUNDER_PROFILE.targetWeight, 155);
  assert.equal(FOUNDER_PROFILE.targetWeeks, 10);
  assert.equal(FOUNDER_PROFILE.targetDate, "2026-12-15");
  assert.equal(FOUNDER_PROFILE.dailyProtein, 140);
  assert.equal(FOUNDER_PROFILE.dailyCalories, 1800);
  assert.equal(FOUNDER_PROFILE.fastingProtocol, "23:1 OMAD");
  assert.equal(FOUNDER_PROFILE.onboardingCompleted, true);
  assert.equal(FOUNDER_PROFILE.tourCompleted, true);
});

test("Onboarding — 8-Step App Tour Steps Integrity Across Real Tabs", () => {
  assert.equal(APP_TOUR_STEPS.length, 8);

  for (let i = 0; i < APP_TOUR_STEPS.length; i++) {
    assert.equal(APP_TOUR_STEPS[i].stepNumber, i + 1);
    assert.ok(APP_TOUR_STEPS[i].title.length > 0);
    assert.ok(APP_TOUR_STEPS[i].hostDialogue.length > 20);
    assert.ok(APP_TOUR_STEPS[i].targetSelector.startsWith("#tour-tab-"));
  }

  const ids = APP_TOUR_STEPS.map((s) => s.id);
  assert.ok(ids.includes("tour-tab-today"));
  assert.ok(ids.includes("tour-tab-calendar"));
  assert.ok(ids.includes("tour-tab-goals"));
  assert.ok(ids.includes("tour-tab-training"));
  assert.ok(ids.includes("tour-tab-nutrition"));
  assert.ok(ids.includes("tour-tab-progress"));
  assert.ok(ids.includes("tour-tab-learning"));
  assert.ok(ids.includes("tour-tab-settings"));
});

test("Onboarding — Client Profile Calibration & Multi-Week Schedule Generation", () => {
  const sampleAnswers: QuestionnaireAnswers = {
    callsign: "Vanguard Titan",
    age: 28,
    height: "6'0\"",
    currentWeight: 185,
    targetWeight: 165,
    targetWeeks: 12,
    primaryMission: "Peak athletic endurance and AI mastery",
    fastingProtocol: "23:1 OMAD",
    proteinPreference: "Turkey",
    hydrationFocus: "Lemon Chia Water",
    trainingFocus: "Boxing",
    trainingDaysPerWeek: 5,
    techMasteryTrack: "Antigravity Swarms",
    dailyStudyMinutes: 60,
  };

  const { profile, initialTasks, initialGoals, multiWeekSchedule } = calibrateClientProfile(
    sampleAnswers,
    "test-client-1"
  );

  assert.equal(profile.id, "test-client-1");
  assert.equal(profile.callsign, "Vanguard Titan");
  assert.equal(profile.targetWeeks, 12);
  assert.ok(profile.targetDate.length > 0);
  assert.ok(profile.targetWeeklyLossLbs > 1.0);
  assert.ok(profile.dailyCalorieDeficit > 500);

  // Validate multi-week schedule generated across 12 weeks
  assert.ok(multiWeekSchedule.length > 250);
  assert.equal(multiWeekSchedule[0].weekNumber, 1);
  assert.equal(multiWeekSchedule[multiWeekSchedule.length - 1].weekNumber, 12);

  // Validate tasks and goals
  assert.equal(initialTasks.length, 4);
  assert.equal(initialGoals.length, 3);
});

test("Onboarding — Context-Aware Host Directives by Hour of Day", () => {
  const morningDir = getHostContextDirective("/", FOUNDER_PROFILE, 8);
  assert.ok(morningDir.title.includes("Morning Fasting"));

  const middayDir = getHostContextDirective("/", FOUNDER_PROFILE, 14);
  assert.ok(middayDir.title.includes("Midday Satiety"));

  const eveningDir = getHostContextDirective("/", FOUNDER_PROFILE, 18);
  assert.ok(eveningDir.title.includes("Re-feed Window Open"));

  const nightDir = getHostContextDirective("/", FOUNDER_PROFILE, 21);
  assert.ok(nightDir.title.includes("Evening Decompression"));
});
