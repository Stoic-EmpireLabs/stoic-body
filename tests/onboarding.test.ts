import test from "node:test";
import assert from "node:assert/strict";
import {
  FOUNDER_PROFILE,
  APP_TOUR_STEPS,
  calibrateClientProfile,
  getHostContextDirective,
  QuestionnaireAnswers,
} from "../src/lib/onboarding.ts";

test("Onboarding — Founder Profile Baseline Integrity", () => {
  assert.equal(FOUNDER_PROFILE.id, "founder");
  assert.equal(FOUNDER_PROFILE.currentWeight, 170);
  assert.equal(FOUNDER_PROFILE.targetWeight, 155);
  assert.equal(FOUNDER_PROFILE.dailyProtein, 140);
  assert.equal(FOUNDER_PROFILE.dailyCalories, 1800);
  assert.equal(FOUNDER_PROFILE.fastingProtocol, "23:1 OMAD");
  assert.equal(FOUNDER_PROFILE.onboardingCompleted, true);
  assert.equal(FOUNDER_PROFILE.tourCompleted, true);
});

test("Onboarding — 6-Step App Tour Steps Integrity", () => {
  assert.equal(APP_TOUR_STEPS.length, 6);

  // Validate step sequence
  for (let i = 0; i < APP_TOUR_STEPS.length; i++) {
    assert.equal(APP_TOUR_STEPS[i].stepNumber, i + 1);
    assert.ok(APP_TOUR_STEPS[i].title.length > 0);
    assert.ok(APP_TOUR_STEPS[i].hostDialogue.length > 20);
    assert.ok(APP_TOUR_STEPS[i].targetSelector.startsWith("#"));
  }

  // Check specific keys exist
  const ids = APP_TOUR_STEPS.map((s) => s.id);
  assert.ok(ids.includes("tour-header"));
  assert.ok(ids.includes("tour-fasting"));
  assert.ok(ids.includes("tour-anchors"));
  assert.ok(ids.includes("tour-nutrition"));
  assert.ok(ids.includes("tour-learning"));
  assert.ok(ids.includes("tour-calendar"));
});

test("Onboarding — Client Profile Calibration from Questionnaire", () => {
  const sampleAnswers: QuestionnaireAnswers = {
    callsign: "Vanguard Titan",
    age: 28,
    height: "6'0\"",
    currentWeight: 185,
    targetWeight: 165,
    primaryMission: "Peak athletic endurance and AI mastery",
    fastingProtocol: "23:1 OMAD",
    proteinPreference: "Turkey",
    hydrationFocus: "Lemon Chia Water",
    trainingFocus: "Boxing",
    trainingDaysPerWeek: 5,
    techMasteryTrack: "Antigravity Swarms",
    dailyStudyMinutes: 60,
  };

  const { profile, initialTasks, initialGoals } = calibrateClientProfile(sampleAnswers, "test-client-1");

  assert.equal(profile.id, "test-client-1");
  assert.equal(profile.callsign, "Vanguard Titan");
  assert.equal(profile.role, "client");
  assert.equal(profile.currentWeight, 185);
  assert.equal(profile.targetWeight, 165);
  assert.equal(profile.totalXp, 500); // Welcome bounty
  assert.equal(profile.level, 1);
  assert.equal(profile.onboardingCompleted, true);
  assert.equal(profile.tourCompleted, false);

  // Protein formula: ~0.95 * 165 = ~157g
  assert.ok(profile.dailyProtein >= 140);
  assert.equal(profile.dailyCalories, 1800);

  // Validate seeded tasks
  assert.equal(initialTasks.length, 4);
  assert.ok(initialTasks.some((t) => t.title.includes("Lemon Water with Soaked Chia Seeds")));
  assert.ok(initialTasks.some((t) => t.title.includes("Boxing Focus Session")));
  assert.ok(initialTasks.some((t) => t.title.includes("Antigravity Swarms")));
  assert.ok(initialTasks.some((t) => t.title.includes("Turkey Blueprint")));

  // Validate seeded goals
  assert.equal(initialGoals.length, 3);
  assert.ok(initialGoals.some((g) => g.title.includes("Boxing Workouts")));
  assert.ok(initialGoals.some((g) => g.title.includes("Antigravity Swarms")));
});

test("Onboarding — Context-Aware Host Directives by Hour of Day", () => {
  // Morning Fasting Directive (8am)
  const morningDir = getHostContextDirective("/", FOUNDER_PROFILE, 8);
  assert.ok(morningDir.title.includes("Morning Fasting"));
  assert.ok(morningDir.message.includes("peak fat-oxidation"));

  // Midday Study Directive (14pm)
  const middayDir = getHostContextDirective("/", FOUNDER_PROFILE, 14);
  assert.ok(middayDir.title.includes("Midday Satiety"));
  assert.ok(middayDir.message.includes("Lemon Chia Seed"));

  // Evening Feeding Window (18pm)
  const eveningDir = getHostContextDirective("/", FOUNDER_PROFILE, 18);
  assert.ok(eveningDir.title.includes("Re-feed Window Open"));
  assert.ok(eveningDir.message.includes("Fish blueprint"));

  // Night Sleep Directive (21pm)
  const nightDir = getHostContextDirective("/", FOUNDER_PROFILE, 21);
  assert.ok(nightDir.title.includes("Evening Decompression"));
  assert.ok(nightDir.message.includes("chamomile tea"));
});
