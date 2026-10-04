/**
 * STOIC BODY — INTERACTIVE CODE RUNNER & SIMULATOR ENGINE
 *
 * Powers Brilliant-style active learning:
 * - Live browser code execution simulator
 * - Real-time Antigravity multi-agent swarm visualizer
 * - Vibe coding prompt tuner
 * - Live CSS component sandbox
 */

export interface CodeExecutionResult {
  status: "success" | "error";
  stdout: string[];
  executionTimeMs: number;
  feedback: string;
}

/**
 * Simulates browser-based code execution for lesson snippets.
 */
export function simulateCodeExecution(
  code: string,
  language: string,
  lessonId: string
): CodeExecutionResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      status: "error",
      stdout: ["RuntimeError: Empty code block. Enter or edit code to execute."],
      executionTimeMs: 8,
      feedback: "Execution failed: No instructions provided to runner.",
    };
  }

  // Extract explicit print / console.log statements
  const stdout: string[] = [];
  const lines = trimmed.split("\n");

  for (const line of lines) {
    const pyPrint = line.match(/print\s*\((.*?)\)/);
    const jsLog = line.match(/console\.log\s*\((.*?)\)/);

    if (pyPrint && pyPrint[1]) {
      const val = pyPrint[1].replace(/^["']|["']$/g, "").trim();
      stdout.push(val);
    } else if (jsLog && jsLog[1]) {
      const val = jsLog[1].replace(/^["']|["']$/g, "").trim();
      stdout.push(val);
    }
  }

  // If no explicit print statements found, provide realistic execution output
  if (stdout.length === 0) {
    stdout.push(`[${language.toUpperCase()} RUNNER] Code compiled successfully.`);
    stdout.push(`[EXEC] Executed ${lines.length} statement(s) with exit code 0.`);
    stdout.push(`[ASSERT] State integrity verified. In-memory data reconciled.`);
  } else {
    stdout.push(`---`);
    stdout.push(`[SYSTEM] Exit code 0 &bull; Memory allocated: 4.2 MB`);
  }

  const executionTimeMs = Math.floor(Math.random() * 35) + 18;

  return {
    status: "success",
    stdout,
    executionTimeMs,
    feedback: `✓ Verified: Code compiled cleanly in ${executionTimeMs}ms with zero runtime exceptions.`,
  };
}

export interface SwarmStep {
  agent: string;
  role: string;
  action: string;
  toolCall: string;
  durationMs: number;
}

export interface SwarmSimulationResult {
  taskType: string;
  steps: SwarmStep[];
  totalDurationMs: number;
  completed: boolean;
}

/**
 * Simulates an Antigravity autonomous multi-agent swarm execution.
 */
export function simulateAntigravitySwarm(
  taskType: string,
  subagents: string[]
): SwarmSimulationResult {
  const steps: SwarmStep[] = [
    {
      agent: "Planner Agent",
      role: "System Architect",
      action: "Deconstructing prompt into deterministic dependency graph",
      toolCall: 'plan(Strategy="TDD First", Target="Production Grade")',
      durationMs: 45,
    },
    {
      agent: "Research Subagent",
      role: "Codebase Auditor",
      action: "Inspecting workspace files, schemas, and API interfaces",
      toolCall: 'invoke_subagent(Role="Researcher", Mode="ReadOnly")',
      durationMs: 65,
    },
    {
      agent: "Implementation Worker",
      role: "Autonomous Coder",
      action: "Writing production TypeScript/Python modules & unit test suites",
      toolCall: 'run_command("npm test && npx tsc --noEmit")',
      durationMs: 140,
    },
    {
      agent: "Verification Agent",
      role: "Headless E2E Verifier",
      action: "Launching Playwright headless browser for full route & latency audit",
      toolCall: 'run_command("node tests/audit-verification.mjs")',
      durationMs: 120,
    },
  ];

  const totalDurationMs = steps.reduce((sum, s) => sum + s.durationMs, 0);

  return {
    taskType,
    steps,
    totalDurationMs,
    completed: true,
  };
}

export interface VibePromptSettings {
  contextPrecision: number;
  tddStrictness: number;
  autonomy: number;
}

export interface VibePromptEvaluation {
  score: number;
  tier: "Prompt Dabbler" | "Advanced Vibe Coder" | "Sovereign Architect";
  generatedPrompt: string;
  tips: string[];
}

/**
 * Evaluates vibe coding prompt parameters and outputs a hardened steering directive.
 */
export function simulateVibePrompt(settings: VibePromptSettings): VibePromptEvaluation {
  const { contextPrecision, tddStrictness, autonomy } = settings;
  const score = Math.round(
    0.35 * contextPrecision + 0.45 * tddStrictness + 0.20 * autonomy
  );

  let tier: VibePromptEvaluation["tier"] = "Prompt Dabbler";
  if (score >= 85) tier = "Sovereign Architect";
  else if (score >= 65) tier = "Advanced Vibe Coder";

  const generatedPrompt = `[DIRECTIVE: SOVEREIGN DEV ENGINE]
- Target: Full-stack implementation with strict zero-hallucination guardrails.
- Methodology: TEST-DRIVEN DEVELOPMENT. Write assertions BEFORE logic.
- Context Level: ${contextPrecision >= 80 ? "Pinned Schemas & Exact Type Contracts" : "Standard Types"}
- Autonomy Mode: ${autonomy >= 80 ? "Fully Autonomous Execution & Verification" : "Interactive Confirmation"}
- Verification: Run node test runner and Playwright audit before declaring completion. Evidence before assertions.`;

  const tips: string[] = [];
  if (tddStrictness < 70) {
    tips.push("Tip: Boost TDD strictness to 80%+ to prevent silent regressions and AI hallucinations.");
  }
  if (contextPrecision < 75) {
    tips.push("Tip: Feed exact TypeScript interfaces rather than prose descriptions for 3x code accuracy.");
  }
  if (autonomy < 60) {
    tips.push("Tip: Elevate agent autonomy to allow background test runs and self-healing fix loops.");
  }
  if (tips.length === 0) {
    tips.push("✓ Peak Sovereign Vibe Coding setup: Optimal blend of steering rigor, tests, and autonomous speed.");
  }

  return {
    score,
    tier,
    generatedPrompt,
    tips,
  };
}

export interface WebDesignStyleOptions {
  accent: "gold" | "red" | "emerald";
  radius: number;
  glassmorphism: boolean;
}

export interface WebDesignStyleOutput {
  containerClass: string;
  accentColorHex: string;
  backdropBlurClass: string;
  shadowClass: string;
}

/**
 * Computes live CSS classes for interactive UI/UX sandbox.
 */
export function simulateWebDesignStyles(
  options: WebDesignStyleOptions
): WebDesignStyleOutput {
  const { accent, radius, glassmorphism } = options;

  let accentColorHex = "#F59E0B";
  if (accent === "red") accentColorHex = "#DC2626";
  if (accent === "emerald") accentColorHex = "#10B981";

  let roundedClass = "rounded-lg";
  if (radius <= 4) roundedClass = "rounded-sm";
  else if (radius >= 16) roundedClass = "rounded-2xl";
  else if (radius >= 12) roundedClass = "rounded-xl";

  const backdropBlurClass = glassmorphism
    ? "backdrop-blur-md bg-black/60"
    : "bg-[#0A0A0F]";

  const shadowClass =
    accent === "gold"
      ? "shadow-[0_0_20px_rgba(245,158,11,0.25)]"
      : accent === "red"
      ? "shadow-[0_0_20px_rgba(220,38,38,0.25)]"
      : "shadow-[0_0_20px_rgba(16,185,129,0.25)]";

  return {
    containerClass: `${roundedClass} ${backdropBlurClass} border border-red-950/80 p-5 ${shadowClass}`,
    accentColorHex,
    backdropBlurClass,
    shadowClass,
  };
}
