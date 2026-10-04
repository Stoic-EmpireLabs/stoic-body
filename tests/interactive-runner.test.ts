import test from "node:test";
import assert from "node:assert/strict";
import {
  simulateCodeExecution,
  simulateAntigravitySwarm,
  simulateVibePrompt,
  simulateWebDesignStyles,
} from "../src/lib/interactive-runner";

test("Interactive Runner — Code Execution Engine", () => {
  const pythonCode = `import os\nprint("Hello Antigravity")\nprint("Task complete")`;
  const result = simulateCodeExecution(pythonCode, "python", "lesson-ag-1");

  assert.equal(result.status, "success");
  assert.ok(result.stdout.length >= 2);
  assert.ok(result.stdout.some((line) => line.includes("Hello Antigravity")));
  assert.ok(result.executionTimeMs > 0);
  assert.ok(result.feedback.includes("Verified"));

  // Broken / empty code
  const emptyResult = simulateCodeExecution("", "python", "lesson-ag-1");
  assert.equal(emptyResult.status, "error");
});

test("Interactive Runner — Antigravity Multi-Agent Swarm Simulator", () => {
  const swarm = simulateAntigravitySwarm("Mass Software Production", ["planner", "coder", "verifier"]);

  assert.ok(swarm.steps.length >= 3);
  assert.equal(swarm.taskType, "Mass Software Production");
  assert.ok(swarm.totalDurationMs > 0);
  assert.ok(swarm.steps[0].toolCall.includes("invoke_subagent") || swarm.steps[0].toolCall.includes("plan"));
  assert.ok(swarm.completed);
});

test("Interactive Runner — Vibe Coding Prompt Sculptor", () => {
  const evaluation = simulateVibePrompt({
    contextPrecision: 90,
    tddStrictness: 100,
    autonomy: 80,
  });

  assert.ok(evaluation.score >= 85, "High rigor settings should yield sovereign score >= 85");
  assert.equal(evaluation.tier, "Sovereign Architect");
  assert.ok(evaluation.generatedPrompt.includes("TEST-DRIVEN"));
  assert.ok(evaluation.tips.length > 0);
});

test("Interactive Runner — Web Design CSS Sandbox Styles", () => {
  const styles = simulateWebDesignStyles({
    accent: "gold",
    radius: 12,
    glassmorphism: true,
  });

  assert.ok(styles.containerClass.includes("rounded-"));
  assert.ok(styles.accentColorHex.startsWith("#"));
  assert.ok(styles.backdropBlurClass.includes("backdrop-blur"));
});
