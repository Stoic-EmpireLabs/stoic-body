export interface InteractiveQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface InteractiveLesson {
  id: string;
  title: string;
  concept: string;
  codeSnippet: string;
  codeLanguage: "typescript" | "python" | "bash" | "json";
  actionPrompt: string;
  quiz: InteractiveQuiz;
  xpReward: number;
  completed: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: InteractiveLesson[];
}

export type CourseCategory =
  | "AI Architecture Spectrum"
  | "Vibe Coding & AI Dev"
  | "Web & UI/UX Design"
  | "Google Antigravity Mastery"
  | "Autonomous Automation"
  | "Full-Stack Frontend & Backend"
  | "AI Agents & MCP"
  | "Local Sovereign LLMs"
  | "Mechanical & Craft";

export interface InteractiveCourse {
  id: string;
  title: string;
  repoSource: string;
  repoStars: string;
  category: CourseCategory;
  level: "Beginner" | "Intermediate" | "Advanced" | "Sovereign Architect";
  description: string;
  estimatedHours: number;
  xpReward: number;
  modules: CourseModule[];
}

export interface CourseMastery {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  totalXpEarned: number;
}

export interface QuizEvaluationResult {
  isCorrect: boolean;
  feedback: string;
  xpEarned: number;
}

export interface DailyLearningTarget {
  completedToday: number;
  dailyTarget: number;
  remainingLessons: number;
  isTargetMet: boolean;
  streakDays: number;
}

export interface CreateCourseInput {
  title: string;
  repoSource: string;
  repoStars: string;
  category: CourseCategory;
  level: InteractiveCourse["level"];
  description: string;
  estimatedHours: number;
  xpReward: number;
  lessons: {
    title: string;
    concept: string;
    codeSnippet: string;
    codeLanguage: "typescript" | "python" | "bash" | "json";
    actionPrompt: string;
    quizQuestion: string;
    quizOptions: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

/**
 * Calculates overall course mastery metrics
 */
export function calculateCourseMastery(course: InteractiveCourse): CourseMastery {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const total = allLessons.length;
  if (total === 0) return { totalLessons: 0, completedLessons: 0, percentage: 0, totalXpEarned: 0 };

  const completed = allLessons.filter((l) => l.completed).length;
  const xpEarned = allLessons.filter((l) => l.completed).reduce((acc, l) => acc + l.xpReward, 0);

  return {
    totalLessons: total,
    completedLessons: completed,
    percentage: Math.round((completed / total) * 100),
    totalXpEarned: xpEarned,
  };
}

/**
 * Brilliant-style interactive quiz evaluator with instant feedback
 */
export function evaluateQuizAnswer(
  quiz: InteractiveQuiz,
  selectedIndex: number,
  xpReward: number
): QuizEvaluationResult {
  const isCorrect = selectedIndex === quiz.correctIndex;

  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: `✓ Correct! ${quiz.explanation}`,
      xpEarned: xpReward,
    };
  }

  return {
    isCorrect: false,
    feedback: `✕ Not quite. ${quiz.explanation}`,
    xpEarned: 0,
  };
}

/**
 * Calculates daily bite-sized learning target (e.g. 3 lessons/day)
 */
export function calculateDailyLearningTarget(
  completedToday: number,
  dailyTarget: number = 3,
  streakDays: number = 14
): DailyLearningTarget {
  const remaining = Math.max(0, dailyTarget - completedToday);
  return {
    completedToday,
    dailyTarget,
    remainingLessons: remaining,
    isTargetMet: remaining === 0,
    streakDays,
  };
}

/**
 * Creates and formats a new custom course created by the user
 */
export function createCustomCourse(input: CreateCourseInput): InteractiveCourse {
  const courseId = `course-custom-${Date.now()}`;
  return {
    id: courseId,
    title: input.title,
    repoSource: input.repoSource,
    repoStars: input.repoStars || "1k ★",
    category: input.category,
    level: input.level,
    description: input.description,
    estimatedHours: input.estimatedHours,
    xpReward: input.xpReward,
    modules: [
      {
        id: `mod-${Date.now()}`,
        title: "Curated Masterclass Curriculum",
        lessons: input.lessons.map((l, idx) => ({
          id: `lesson-${Date.now()}-${idx}`,
          title: l.title,
          concept: l.concept,
          codeSnippet: l.codeSnippet,
          codeLanguage: l.codeLanguage,
          actionPrompt: l.actionPrompt,
          quiz: {
            question: l.quizQuestion,
            options: l.quizOptions,
            correctIndex: l.correctIndex,
            explanation: l.explanation,
          },
          xpReward: Math.round(input.xpReward / Math.max(1, input.lessons.length)),
          completed: false,
        })),
      },
    ],
  };
}

/**
 * Pre-loaded interactive AI, Vibe Coding, Web Design, Automation, and Antigravity courses
 */
export const FOUNDER_AI_COURSES: InteractiveCourse[] = [
  // 0. THE AI HIERARCHY SPECTRUM (EXACT INFOGRAPHIC ROADMAP)
  {
    id: "ai-spectrum-hierarchy",
    title: "AI Hierarchy Spectrum: From Machine Learning to Agentic AI",
    repoSource: "GenAI.works/ai-hierarchy-curriculum",
    repoStars: "Infographic Roadmap ★",
    category: "AI Architecture Spectrum",
    level: "Sovereign Architect",
    description:
      "Master the complete hierarchical spectrum of modern AI: AI (The Umbrella) ➔ Machine Learning ➔ Deep Learning ➔ Generative AI ➔ LLMs ➔ RAG ➔ Agentic AI, plus Multimodal, Fine-tuning, and Safety.",
    estimatedHours: 4,
    xpReward: 3500,
    modules: [
      {
        id: "ai-mod-spectrum",
        title: "Module 1: The 7 Pillars of Modern Artificial Intelligence",
        lessons: [
          // 1. Artificial Intelligence (AI)
          {
            id: "ai-l1-umbrella",
            title: "1. Artificial Intelligence (AI) — The Broad Umbrella",
            concept:
              "KEY IDEA: Related, NOT interchangeable. Think of them as a hierarchy that keeps building up. AI is the broad umbrella: systems that can think, reason, and act intelligently. Real-world examples include robotics, expert systems, game AI (Deep Blue, chess engines), and search algorithms.",
            codeSnippet: `// Classical Symbolic AI: Rule-Based Expert System
interface ClinicalState { fever: boolean; cough: boolean; daysIll: number; }

function evaluatePatientRule(state: ClinicalState): string {
  // Explicit logic written by human experts, not learned from data
  if (state.fever && state.cough && state.daysIll > 3) {
    return "Recommendation: Order chest X-ray and viral PCR panel.";
  }
  return "Recommendation: Conservative hydration & observation.";
}

console.log(evaluatePatientRule({ fever: true, cough: true, daysIll: 5 }));`,
            codeLanguage: "typescript",
            actionPrompt: "Modify the expert rule threshold and observe deterministic symbolic inference.",
            quiz: {
              question: "Why are classical expert systems considered AI, but NOT Machine Learning?",
              options: [
                "Because they are coded with hardcoded rules and heuristics rather than learning patterns from data",
                "Because they require quantum computing chips",
                "Because expert systems can only process images and video"
              ],
              correctIndex: 0,
              explanation: "AI is the broad umbrella. Classical expert systems use explicit hand-crafted rules to reason and act, whereas Machine Learning algorithms derive their own rules from training data.",
            },
            xpReward: 150,
            completed: false,
          },
          // 2. Machine Learning (ML)
          {
            id: "ai-l2-ml",
            title: "2. Machine Learning (ML) — Learning Patterns from Data",
            concept:
              "A subset of AI that learns patterns from data instead of relying on explicit hardcoded rules. The machine optimizes weights and decision boundaries from historical observations. Real-world examples: Spam detection, Recommender systems (Netflix, Spotify), Fraud detection, Predictive analytics.",
            codeSnippet: `# Machine Learning: Logistic Regression Decision Boundary
def predict_fraud_risk(transaction_amount: float, foreign_ip: bool, time_delta_s: float) -> str:
    # Learned statistical weights: w1*amount + w2*ip + w3*(1/time)
    risk_score = (transaction_amount * 0.002) + (3.5 if foreign_ip else 0.0) + (50.0 / max(1.0, time_delta_s))
    threshold = 6.0
    return "FLAGGED: High Fraud Probability" if risk_score >= threshold else "APPROVED: Normal Behavior"

print(predict_fraud_risk(transaction_amount=2450.0, foreign_ip=True, time_delta_s=2.0))`,
            codeLanguage: "python",
            actionPrompt: "Adjust the transaction parameters to observe statistical classification.",
            quiz: {
              question: "What is the defining distinction between traditional software and Machine Learning?",
              options: [
                "Traditional software learns from data; ML requires human hand-written rules",
                "Traditional software follows explicit programmer-written rules; ML learns patterns and weights from data",
                "Traditional software only runs in the cloud; ML only runs locally"
              ],
              correctIndex: 1,
              explanation: "In classical programming: Rules + Data = Answers. In Machine Learning: Data + Answers = Rules (weights/models).",
            },
            xpReward: 150,
            completed: false,
          },
          // 3. Deep Learning (DL)
          {
            id: "ai-l3-dl",
            title: "3. Deep Learning (DL) — Multi-Layer Neural Networks",
            concept:
              "A subset of ML using artificial neural networks with many stacked hidden layers. Instead of humans manually handcrafting features (like edges or histograms), deep networks automatically learn hierarchical feature representations. Real-world examples: Image recognition, Speech recognition, Self-driving cars (Tesla FSD), Language translation.",
            codeSnippet: `# Deep Learning: Multi-Layer Neural Representation Forward Pass
def relu(x: float) -> float: return max(0.0, x)

def neural_layer(inputs: list[float], weights: list[list[float]], biases: list[float]) -> list[float]:
    # Each layer transforms raw inputs into higher-level abstract features
    return [relu(sum(i * w for i, w in zip(inputs, neuron_w)) + b) 
            for neuron_w, b in zip(weights, biases)]

# Layer 1 extracts edges; Layer 2 extracts textures; Layer 3 extracts object classes
hidden_1 = neural_layer([0.5, 0.8, -0.2], [[0.4, 0.3, 0.1], [-0.2, 0.7, 0.5]], [0.1, -0.1])
print(f"Hierarchical Feature Activations: {hidden_1}")`,
            codeLanguage: "python",
            actionPrompt: "Execute the forward-pass matrix multiplication across artificial neural layers.",
            quiz: {
              question: "What primary breakthrough allowed Deep Learning to surpass classical Machine Learning?",
              options: [
                "It eliminated the need for manual feature engineering by learning hierarchical representations across deep layers",
                "It stopped using floating point math",
                "It only works on relational SQL databases"
              ],
              correctIndex: 0,
              explanation: "Classical ML required human engineers to painstakingly design features. Deep Learning neural networks automatically discover abstract, high-level features directly from raw data.",
            },
            xpReward: 150,
            completed: false,
          },
          // 4. Generative AI (GenAI)
          {
            id: "ai-l4-genai",
            title: "4. Generative AI (GenAI) — Content Creation Machines",
            concept:
              "A subset of DL that creates entirely new, original content rather than just classifying or predicting existing labels. Generates novel text, photorealistic images, studio audio, synthetic video, and executable code. Real-world examples: ChatGPT, Midjourney, DALL-E, Claude, Stable Diffusion, Suno (audio), Runway (video).",
            codeSnippet: `# Generative AI: Probabilistic Token Sampling from Latent Distribution
import random

def sample_generative_token(token_probabilities: dict[str, float], temperature: float = 0.7) -> str:
    # Temperature scales entropy: lower = deterministic, higher = creative
    tokens = list(token_probabilities.keys())
    logits = [p ** (1.0 / max(0.01, temperature)) for p in token_probabilities.values()]
    total = sum(logits)
    probs = [l / total for l in logits]
    return random.choices(tokens, weights=probs, k=1)[0]

distribution = {"sovereign": 0.55, "autonomous": 0.30, "disciplined": 0.15}
sampled = sample_generative_token(distribution, temperature=0.5)
print(f"Synthesized Generative Token: '{sampled}'")`,
            codeLanguage: "python",
            actionPrompt: "Adjust temperature to control creative entropy versus deterministic output.",
            quiz: {
              question: "How does Generative AI fundamentally differ from discriminative Machine Learning models?",
              options: [
                "Generative AI creates new synthetic content (text, image, video); discriminative models classify or predict labels",
                "Generative AI cannot run on GPUs",
                "Generative AI only produces black and white pictures"
              ],
              correctIndex: 0,
              explanation: "Discriminative models model P(Label|Input) to categorize or score. Generative models model P(Data) or P(Content|Prompt) to synthesize brand new, high-dimensional media.",
            },
            xpReward: 150,
            completed: false,
          },
          // 5. Large Language Models (LLMs)
          {
            id: "ai-l5-llms",
            title: "5. Large Language Models (LLMs) — The Semantic Reasoning Engine",
            concept:
              "A specialized type of GenAI focused on understanding, reasoning over, and generating natural language and code. Built on self-attention transformers with billions of parameters and vast context windows. Real-world examples: GPT-4/5, Claude 3/3.7, Gemini 1.5/2.5, Llama 3, Mistral, Qwen.",
            codeSnippet: `// LLM In-Context Semantic Reasoning Interface
interface LLMCompletionRequest {
  model: "gemini-2.5-flash" | "claude-3-7-sonnet" | "llama-3.3-70b";
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}

function buildReasoningPayload(req: LLMCompletionRequest) {
  return {
    ...req,
    contextWindow: "1,000,000 tokens",
    semanticRole: "Executive Technical Advisory",
    format: "Structured JSON schema with step-by-step thinking",
  };
}

console.log(buildReasoningPayload({
  model: "gemini-2.5-flash",
  systemPrompt: "You are Antigravity, the user's sovereign AI development platform.",
  userPrompt: "Synthesize full-stack architecture for zero-latency local caching.",
  temperature: 0.2,
}));`,
            codeLanguage: "typescript",
            actionPrompt: "Construct an LLM completion payload with low temperature for deterministic reasoning.",
            quiz: {
              question: "What is an LLM's core pre-training task that gives rise to emergent reasoning?",
              options: [
                "Next-token prediction across massive corpora of text and code",
                "Manually playing chess against human grandmasters",
                "Memorizing relational database tables"
              ],
              correctIndex: 0,
              explanation: "By predicting the next token over trillions of tokens, models build internal world models, semantic abstractions, and reasoning capabilities.",
            },
            xpReward: 150,
            completed: false,
          },
          // 6. Retrieval-Augmented Generation (RAG)
          {
            id: "ai-l6-rag",
            title: "6. Retrieval-Augmented Generation (RAG) — Grounded Knowledge",
            concept:
              "Combines GenAI / LLMs with external non-parametric knowledge bases. Instead of relying solely on the static training weights of the model (which have knowledge cutoffs and hallucinations), RAG retrieves authoritative document chunks via semantic vector embeddings and injects them directly into the context window. Real-world examples: Enterprise chatbots, Company copilot, Document Q&A, Legal & medical knowledge bases.",
            codeSnippet: `# RAG: Semantic Vector Search & Context Injection
import math

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    return dot / (norm_a * norm_b)

kb_chunks = [
    {"id": "c1", "text": "Ford Mustang 3.7L V6 requires FL-500S filter torqued to 19 lb-ft.", "embedding": [0.92, 0.11]},
    {"id": "c2", "text": "23:1 OMAD targets a 1-hour feeding window with 140g protein.", "embedding": [0.12, 0.88]},
]

query_vec = [0.90, 0.15] # Query: 'Mustang oil filter torque specs'
scored = sorted(kb_chunks, key=lambda c: cosine_similarity(c["embedding"], query_vec), reverse=True)
top_chunk = scored[0]["text"]
augmented_prompt = f"Grounded Context: {top_chunk}\\nQuestion: What torque spec?\\nAnswer with zero hallucination:"
print(augmented_prompt)`,
            codeLanguage: "python",
            actionPrompt: "Calculate cosine similarity and observe grounded context prepended to prompt.",
            quiz: {
              question: "Why is RAG preferred over fine-tuning for proprietary or rapidly changing enterprise knowledge?",
              options: [
                "Because RAG provides verifiable citations, real-time updates without retraining, and eliminates hallucinations",
                "Because fine-tuning is illegal",
                "Because RAG doesn't require electricity"
              ],
              correctIndex: 0,
              explanation: "RAG retrieves the exact up-to-date document chunks at query time, guaranteeing verifiable citations and instant knowledge updates without costly multi-day retraining.",
            },
            xpReward: 150,
            completed: false,
          },
          // 7. Agentic AI (Autonomous Agents)
          {
            id: "ai-l7-agentic",
            title: "7. Agentic AI — Autonomous Goal-Directed Systems",
            concept:
              "The frontier of modern AI: Systems that reason, plan, use tools, call external APIs, inspect outcomes, and take iterative actions toward high-level goals without human hand-holding. They run autonomous loops (ReAct: Reason ➔ Act ➔ Observe) and orchestrate subagent teams. Real-world examples: Antigravity Swarms, OpenAI Agents, Claude Computer Use, AutoGPT, LangGraph state agents, Manus AI.",
            codeSnippet: `// Agentic AI: Autonomous ReAct Tool Execution Loop
interface AgentStep {
  thought: string;
  tool: string;
  arguments: Record<string, any>;
  observation?: string;
}

async function runAutonomousAgentLoop(goal: string): Promise<string> {
  console.log(\`[AGENT GOAL]: \${goal}\`);
  const step1: AgentStep = {
    thought: "Need to verify all 12 routes return 200 before deploying.",
    tool: "run_command",
    arguments: { CommandLine: "node tests/audit-verification.mjs" }
  };
  console.log(\`[THOUGHT]: \${step1.thought}\`);
  console.log(\`[TOOL CALL]: \${step1.tool}(\${JSON.stringify(step1.arguments)})\`);
  
  step1.observation = "12/12 routes 100% passed in 794ms.";
  console.log(\`[OBSERVATION]: \${step1.observation}\`);
  
  return "Autonomous Goal Achieved: Production Verified & Ready.";
}

runAutonomousAgentLoop("Deploy Stoic Body Sovereign Learning Engine").then(console.log);`,
            codeLanguage: "typescript",
            actionPrompt: "Simulate an autonomous agent executing tools, observing feedback, and completing goals.",
            quiz: {
              question: "What core capability fundamentally elevates an LLM into an Agentic AI system?",
              options: [
                "The ability to autonomously plan, execute tools/commands, observe outcomes, and self-heal in a loop toward a goal",
                "Having a larger font size in the chat UI",
                "Only generating rhyming poetry"
              ],
              correctIndex: 0,
              explanation: "An LLM is a text generator. Agentic AI gives the LLM agency: planning, tool use (terminal, browser, APIs), reflection, and autonomous multi-step execution.",
            },
            xpReward: 200,
            completed: false,
          },
          // 8. Key Modern Concepts
          {
            id: "ai-l8-modern-concepts",
            title: "8. Modern AI Architecture Matrix (Multimodal, Fine-Tuning, Safety)",
            concept:
              "Beyond the core 7 pillars, modern production AI relies on 5 critical capabilities: (1) Multimodal AI (seamlessly understanding audio, video, image, and code simultaneously), (2) Fine-Tuning (adapting model weights for specialized domain style), (3) Prompt Engineering (sculpting system directives for maximum deterministic rigor), (4) AI Safety (guardrails, evaluation benchmarks, and alignment), (5) Subagent Swarms.",
            codeSnippet: `// Modern Sovereign AI Architecture Matrix
const SOVEREIGN_AI_STACK = {
  multimodal: ["Gemini 2.5 Flash Native Audio/Video", "Claude Vision"],
  promptEngineering: ["TDD-First Guardrails", "Strict JSON Schema Output"],
  safety: ["Deterministic Test Verification", "Evidence-Before-Assertion Policy"],
  agenticOrchestration: ["invoke_subagent", "Background Daemons", "schedule cron"],
  deployment: ["Vercel Edge / Serverless", "Local Sovereign Quantized GGUF"]
};

console.log("Sovereign AI Architecture Stack initialized:", Object.keys(SOVEREIGN_AI_STACK));`,
            codeLanguage: "typescript",
            actionPrompt: "Review the full sovereign modern AI toolkit and verify each architectural tier.",
            quiz: {
              question: "Which approach is most appropriate when you need an AI model to adopt a highly specialized jargon and tone across millions of interactions with zero extra prompt tokens?",
              options: [
                "Fine-tuning model weights on domain-specific corpora",
                "Reinstalling Windows OS",
                "Deleting the vector database"
              ],
              correctIndex: 0,
              explanation: "Fine-tuning internalizes vocabulary, style, and tone directly into model weights, saving prompt tokens and latency across repeated invocations.",
            },
            xpReward: 150,
            completed: false,
          },
        ],
      },
    ],
  },

  // 1. GOOGLE ANTIGRAVITY MASTERY
  {
    id: "antigravity-mastery-engine",
    title: "Google Antigravity Mastery: Mass Software Production Engine",
    repoSource: "google-deepmind/antigravity",
    repoStars: "Sovereign ★",
    category: "Google Antigravity Mastery",
    level: "Sovereign Architect",
    description:
      "Get maximum ROI from your Antigravity subscription: Multi-subagent swarm orchestration, background daemons, MCP tooling, browser automation, and shipping production software in minutes.",
    estimatedHours: 5,
    xpReward: 2500,
    modules: [
      {
        id: "agy-mod-1",
        title: "Module 1: Subagent Swarms & Autonomous Daemons",
        lessons: [
          {
            id: "agy-l1",
            title: "Subagent Swarm Orchestration (invoke_subagent)",
            concept:
              "Instead of overloading a single conversation context with research, test runs, and multi-file edits, Antigravity lets you invoke parallel subagents. Each subagent has its own independent context window and reports back structured results without cluttering your primary workspace memory.",
            codeSnippet: `// Example invoke_subagent call in Antigravity
{
  "Subagents": [
    {
      "Role": "Security & Dependency Auditor",
      "TypeName": "research",
      "Prompt": "Audit all npm dependencies in package.json for CVE vulnerabilities and outdated packages. Return JSON report."
    },
    {
      "Role": "Playwright E2E Tester",
      "TypeName": "self",
      "Prompt": "Launch headless browser, verify all 12 routes return 200, take screenshots, report violations."
    }
  ]
}`,
            codeLanguage: "json",
            actionPrompt: "Delegate parallel research and audits to subagents rather than serial execution.",
            quiz: {
              question: "What is the primary advantage of delegating tasks to subagents via invoke_subagent?",
              options: [
                "It deletes all git branches",
                "It isolates heavy token generation and tool calls into parallel contexts, keeping the main architect clean and high-speed",
                "It slows down execution by 50%",
              ],
              correctIndex: 1,
              explanation:
                "Subagents prevent token window bloat and execute independent tasks concurrently, giving you a full software team in parallel.",
            },
            xpReward: 200,
            completed: true,
          },
          {
            id: "agy-l2",
            title: "Autonomous 24/7 Daemons & Background Cron Tasks",
            concept:
              "For watchers, dev servers, or recurring health checks, launch them with `IsDaemon: true` or use the `schedule` tool. Antigravity notifies you reactively when background tasks complete without wasteful polling loops.",
            codeSnippet: `# Running persistent server as daemon
run_command(
  CommandLine="npm run dev",
  Cwd="C:\\Users\\stoic\\AntigravityWorkspace\\projects\\stoic-body",
  IsDaemon=true,
  WaitMsBeforeAsync=500
)

# Scheduling recurring health audits via cron
schedule(
  CronExpression="0 */4 * * *",
  Prompt="Run full test suite and verify production health"
)`,
            codeLanguage: "bash",
            actionPrompt: "Set IsDaemon: true when starting dev servers or background scrapers.",
            quiz: {
              question: "How should you wait for a background process to finish in Antigravity?",
              options: [
                "Poll the status command in an infinite while loop",
                "Simply call no more tools or continue other work; the reactive wakeup system automatically resumes when the task notifies you",
                "Close the IDE completely",
              ],
              correctIndex: 1,
              explanation:
                "Antigravity's reactive wakeup system automatically resumes your agent turn when a background task or subagent finishes.",
            },
            xpReward: 200,
            completed: false,
          },
        ],
      },
    ],
  },

  // 2. VIBE CODING & RAPID PROTOTYPING
  {
    id: "vibe-coding-agentic-dev",
    title: "Vibe Coding: Agentic Rapid Prototyping & Flow-State Development",
    repoSource: "karpathy/vibe-coding",
    repoStars: "38.9k ★",
    category: "Vibe Coding & AI Dev",
    level: "Intermediate",
    description:
      "Master the new paradigm of software creation: guiding autonomous AI models through natural language, spec-driven development, rapid iteration, and shipping at 10x speed.",
    estimatedHours: 3,
    xpReward: 1200,
    modules: [
      {
        id: "vc-mod-1",
        title: "Module 1: The Vibe Coding Architecture",
        lessons: [
          {
            id: "vc-l1",
            title: "The Lead Architect Mindset: Steering vs Typing",
            concept:
              "In vibe coding, you are the Lead Systems Architect and Chief Code Reviewer. You do not type individual lines of syntax. Instead, you declare the desired end-state, strict architectural constraints (e.g. 'local-first SQLite, Black/Red/Gold theme, zero external trackers'), and let the agent write, test, and debug.",
            codeSnippet: `### THE PERFECT VIBE CODING PROMPT PATTERN:
1. ROLE & IDENTITY: "Act as an elite Next.js full-stack engineer."
2. GOAL: "Build an interactive 23:1 OMAD fasting clock with real-time biological stages."
3. CONSTRAINTS: "Obsidian black theme (#000000), Tailwind CSS, local-first localStorage persistence."
4. VERIFICATION: "Write unit tests in tests/ before modifying page.tsx. Confirm all tests pass."`,
            codeLanguage: "bash",
            actionPrompt: "Always include constraints and verification criteria in your vibe coding prompts.",
            quiz: {
              question: "What is the number one cause of vibe coding hallucinations or broken builds?",
              options: [
                "Using modern AI models",
                "Underspecified constraints and lacking automated verification criteria",
                "Having too many tests",
              ],
              correctIndex: 1,
              explanation:
                "When you give an agent a vague goal without architectural boundaries or verification tests, it makes arbitrary assumptions that drift from your vision.",
            },
            xpReward: 150,
            completed: false,
          },
          {
            id: "vc-l2",
            title: "TDD as the Vibe Coding Guardrail (Self-Healing Code)",
            concept:
              "The secret to building massive apps without breaking existing features is Test-Driven Development (TDD). When you ask the agent to write a test suite first, the agent uses the test runner as an objective feedback loop to self-diagnose and fix its own bugs before you even look at the code.",
            codeSnippet: `// tests/feature.test.ts
import test from "node:test";
import assert from "node:assert/strict";

test("Vibe Coding Guardrail — validates meal macro math", () => {
  const result = calculateDailyMacros([{ calories: 500, protein: 40, carbs: 10, fat: 20 }]);
  assert.equal(result.totalCalories, 500);
  assert.equal(result.totalProtein, 40);
});`,
            codeLanguage: "typescript",
            actionPrompt: "Tell the agent: 'Write tests first, run them, and show green output before finishing.'",
            quiz: {
              question: "Why does writing automated unit tests make vibe coding 5x faster instead of slower?",
              options: [
                "It gives the AI agent an autonomous verification loop so it can self-heal errors without asking you",
                "It deletes slow dependencies",
                "It replaces the database",
              ],
              correctIndex: 0,
              explanation:
                "With automated tests, the agent immediately knows if a change broke something, fixing it in seconds before presenting the solution to you.",
            },
            xpReward: 180,
            completed: false,
          },
        ],
      },
    ],
  },

  // 3. MODERN WEB & UI/UX DESIGN
  {
    id: "modern-web-ui-ux-design",
    title: "Modern Web Design, UI/UX & High-CTR Media Systems",
    repoSource: "shadcn/ui",
    repoStars: "82.1k ★",
    category: "Web & UI/UX Design",
    level: "Advanced",
    description:
      "Elite visual aesthetics: Obsidian dark luxury, brutalist typography, glassmorphism, micro-interactions, responsive grid layouts, and high-converting YouTube media systems.",
    estimatedHours: 4,
    xpReward: 1500,
    modules: [
      {
        id: "ui-mod-1",
        title: "Module 1: Obsidian Luxury & High-Contrast Typography",
        lessons: [
          {
            id: "ui-l1",
            title: "Dark Luxury Architecture: Black, Red & Gold Color Theory",
            concept:
              "Amateur dark mode uses generic medium gray backgrounds (`#1F2937`) with low-contrast text. Elite dark luxury uses true Obsidian Black (`#000000`, `#0A0A0F`), subtle Imperial Red border luminescence (`border-red-950/80`), and high-value Gold/Amber accents (`#F59E0B`), paired with crisp white text (`text-white`, `font-bold`).",
            codeSnippet: `/* Tailwind Dark Luxury Card Stack */
<div className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
  <div className="flex justify-between items-center mb-3">
    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
      Sovereign Telemetry
    </span>
    <span className="px-2 py-0.5 rounded bg-red-950/80 text-amber-300 font-mono text-xs border border-amber-500/40">
      ACTIVE
    </span>
  </div>
  <p className="text-sm font-bold text-white">Crisp, readable white typography.</p>
</div>`,
            codeLanguage: "typescript",
            actionPrompt: "Avoid low-contrast gray text on dark cards; use text-white or text-slate-100.",
            quiz: {
              question: "What creates visual depth and elegance in dark-themed enterprise UI?",
              options: [
                "Using bright white backgrounds everywhere",
                "Deep obsidian surfaces paired with subtle colored border luminescence and high-contrast typography",
                "Using Comic Sans font",
              ],
              correctIndex: 1,
              explanation:
                "Layering obsidian surfaces with colored border luminescence (e.g. red-950) creates a 3D physical card aesthetic without visual glare.",
            },
            xpReward: 150,
            completed: false,
          },
          {
            id: "ui-l2",
            title: "Generative UI: Radial SVG Rings & Micro-Interactions",
            concept:
              "Static progress bars feel cheap. Generative UI leverages SVG `strokeDasharray` math to render interactive circular countdown rings and visual gauges with CSS transitions and Web Audio tactile cues.",
            codeSnippet: `// SVG Radial Countdown Formula:
// dasharray = (percent, 100) on a 36x36 viewBox with r=15.9155
<svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
  <path className="text-neutral-900" strokeWidth="3" stroke="currentColor" fill="none"
    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
  <path className="text-amber-500 transition-all duration-500"
    strokeDasharray="\${percent}, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none"
    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
</svg>`,
            codeLanguage: "typescript",
            actionPrompt: "Use radius 15.9155 so the perimeter is exactly 2 * pi * 15.9155 = 100 units.",
            quiz: {
              question: "Why is a radius of 15.9155 used in SVG circular progress rings?",
              options: [
                "Because 2 * π * 15.9155 equals exactly 100, allowing direct percentage binding to strokeDasharray",
                "It makes the SVG download 5x smaller",
                "It disables browser caching",
              ],
              correctIndex: 0,
              explanation:
                "The circumference equals exactly 100, so a 75% progress value directly maps to `75, 100` without complex trigonometric conversions.",
            },
            xpReward: 180,
            completed: false,
          },
        ],
      },
    ],
  },

  // 4. AUTONOMOUS AUTOMATION & PIPELINES
  {
    id: "autonomous-automation-pipelines",
    title: "Autonomous Automation: Headless Scraping & Webhook Pipelines",
    repoSource: "microsoft/playwright",
    repoStars: "78.3k ★",
    category: "Autonomous Automation",
    level: "Advanced",
    description:
      "End-to-end automation pipelines: Replacing expensive third-party scrapers with native Playwright Chromium, resilient webhook queues, and autonomous scheduling.",
    estimatedHours: 4,
    xpReward: 1600,
    modules: [
      {
        id: "auto-mod-1",
        title: "Module 1: Headless Browser Scraping & E2E Verification",
        lessons: [
          {
            id: "auto-l1",
            title: "Playwright Headless Shell: Zero-Dependency Extraction",
            concept:
              "Third-party scraping APIs charge high fees and leak data. Playwright runs headless Chromium directly on your hardware, navigating JavaScript SPAs, waiting for network idle, taking audit screenshots, and extracting DOM data with zero recurring cost.",
            codeSnippet: `import { chromium } from "playwright";

async function scrapeSovereignData(targetUrl: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  
  const telemetry = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".metric-card")).map(el => el.textContent?.trim());
  });
  
  await browser.close();
  return telemetry;
}`,
            codeLanguage: "typescript",
            actionPrompt: "Run Playwright headless locally to bypass anti-bot headers and paywalls.",
            quiz: {
              question: "Why is Playwright superior to a raw fetch() or axios request for scraping modern websites?",
              options: [
                "Playwright executes clientside JavaScript, renders the full DOM, and waits for dynamic React/Next.js hydration",
                "Playwright uses 90% less electricity",
                "Playwright only works with static HTML files",
              ],
              correctIndex: 0,
              explanation:
                "Modern SPAs render blank HTML on raw HTTP fetch; Playwright runs the full Chromium JavaScript runtime so dynamic elements appear.",
            },
            xpReward: 150,
            completed: false,
          },
        ],
      },
    ],
  },

  // 5. FULL-STACK ENGINEERING: FRONTEND & BACKEND
  {
    id: "full-stack-nextjs-fastapi",
    title: "Full-Stack Engineering: Next.js 15, React 19 & High-Performance Backends",
    repoSource: "vercel/next.js",
    repoStars: "130k ★",
    category: "Full-Stack Frontend & Backend",
    level: "Sovereign Architect",
    description:
      "Full-stack mastery: React 19 Server Components, Next.js 15 App Router streaming, Python FastAPI microservices, and local-first SQLite persistence.",
    estimatedHours: 5,
    xpReward: 2000,
    modules: [
      {
        id: "fs-mod-1",
        title: "Module 1: Next.js 15 App Router & Server Actions",
        lessons: [
          {
            id: "fs-l1",
            title: "Server Components vs Client Components Composition",
            concept:
              "Next.js App Router renders Server Components by default with 0 bytes added to the client JavaScript bundle. Keep data fetching and static markup in Server Components, and push `'use client'` leaves down to interactive buttons and forms for maximum performance.",
            codeSnippet: `// app/page.tsx (Server Component - 0kB client JS)
import { getSovereignTasks } from "@/lib/db";
import InteractiveTaskToggle from "@/components/InteractiveTaskToggle";

export default async function Page() {
  const tasks = await getSovereignTasks();
  return (
    <div className="space-y-4">
      {tasks.map(t => (
        <InteractiveTaskToggle key={t.id} task={t} />
      ))}
    </div>
  );
}`,
            codeLanguage: "typescript",
            actionPrompt: "Push 'use client' to the smallest leaf components to minimize bundle size.",
            quiz: {
              question: "Where should database queries be executed in Next.js 15 App Router?",
              options: [
                "Inside a client useEffect hook with an exposed API key",
                "Directly inside Server Components on the server with zero client exposure",
                "In the browser local storage only",
              ],
              correctIndex: 1,
              explanation:
                "Server Components run securely on the server, allowing direct database queries with zero client bundle overhead and zero secret leakage.",
            },
            xpReward: 180,
            completed: false,
          },
        ],
      },
    ],
  },

  // 6. MODEL CONTEXT PROTOCOL (MCP)
  {
    id: "mcp-server-architecture",
    title: "Model Context Protocol (MCP) Server Architecture & Tooling",
    repoSource: "modelcontextprotocol/servers",
    repoStars: "55.4k ★",
    category: "AI Agents & MCP",
    level: "Sovereign Architect",
    description:
      "Standardize how your local AI agents access databases, local file systems, and external APIs using the open-standard JSON-RPC 2.0 protocol.",
    estimatedHours: 4,
    xpReward: 1200,
    modules: [
      {
        id: "mcp-mod-1",
        title: "Module 1: The MCP Protocol & Transport Mechanics",
        lessons: [
          {
            id: "mcp-l1",
            title: "Standardized Tool Discovery via JSON-RPC",
            concept:
              "Before MCP, every AI model required proprietary function-calling wrappers. MCP standardizes client-server handshakes over stdio or SSE. The client issues 'tools/list', and the server returns JSON schemas for available tools with zero vendor lock-in.",
            codeSnippet: `// Example MCP tools/list response
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "query_sqlite_vault",
        "description": "Executes read-only SQL on the sovereign local database",
        "inputSchema": {
          "type": "object",
          "properties": { "query": { "type": "string" } },
          "required": ["query"]
        }
      }
    ]
  }
}`,
            codeLanguage: "json",
            actionPrompt:
              "Inspect how tools are declared as pure JSON Schemas without model-specific prompts.",
            quiz: {
              question: "What communication protocol does Model Context Protocol (MCP) use under the hood?",
              options: [
                "SOAP XML over UDP",
                "JSON-RPC 2.0 over standard I/O (stdio) or Server-Sent Events (SSE)",
                "Protobuf over WebRTC only",
              ],
              correctIndex: 1,
              explanation:
                "MCP relies on lightweight JSON-RPC 2.0 messages over standard I/O (stdio) for local tools, or SSE for remote network servers.",
            },
            xpReward: 100,
            completed: true,
          },
          {
            id: "mcp-l2",
            title: "Building a Python FastMCP Tool with File & Process Access",
            concept:
              "FastMCP allows you to define production-ready MCP servers with standard Python type annotations. The server automatically validates arguments using Pydantic and returns structured content to Claude or local LLMs.",
            codeSnippet: `# server.py - FastMCP Server
from mcp.server.fastmcp import FastMCP
import os

mcp = FastMCP("StoicSystemTool")

@mcp.tool()
def read_system_metric(subsystem: str) -> str:
    """Reads telemetry metrics for a local hardware subsystem."""
    if subsystem == "gpu":
        return "NVIDIA RTX: 42°C | VRAM: 11.2 / 16.0 GB"
    return f"Subsystem {subsystem} nominal."

if __name__ == "__main__":
    mcp.run()`,
            codeLanguage: "python",
            actionPrompt: "Copy and run `fastmcp dev server.py` in your terminal to test tool exposure.",
            quiz: {
              question: "How does FastMCP derive the tool parameter schemas for the LLM?",
              options: [
                "You must manually write 100 lines of OpenAPI yaml",
                "Directly from Python standard type hints and function docstrings",
                "By querying an external cloud server",
              ],
              correctIndex: 1,
              explanation:
                "FastMCP inspects native Python type annotations and docstrings to dynamically build the JSON schema.",
            },
            xpReward: 150,
            completed: false,
          },
        ],
      },
    ],
  },

  // 7. LOCAL SOVEREIGN LLMS
  {
    id: "ollama-local-inference",
    title: "Local Sovereign LLMs: GGUF Quantization & Zero-Cloud Inference",
    repoSource: "ollama/ollama",
    repoStars: "124k ★",
    category: "Local Sovereign LLMs",
    level: "Advanced",
    description:
      "Host local, un-censorable, zero-cloud intelligence on your machine. Master GGUF 4-bit (Q4_K_M) quantization, VRAM layer offloading, and sub-second token streaming.",
    estimatedHours: 3,
    xpReward: 1000,
    modules: [
      {
        id: "ollama-mod-1",
        title: "Module 1: Quantization Physics & VRAM Mathematics",
        lessons: [
          {
            id: "ollama-l1",
            title: "GGUF Quantization: The VRAM Equation",
            concept:
              "A 14B parameter model in FP16 precision requires ~28 GB of VRAM. With Q4_K_M (4-bit quantization with k-quants), memory footprint drops to ~9 GB with negligible perplexity degradation, enabling 100% layer offloading onto consumer RTX GPUs.",
            codeSnippet: `# VRAM Calculation Formula:
# Memory (GB) = (Parameters in Billions * Bits per Weight / 8) * 1.25 (KV Cache Overhead)

# Example: 14B Model @ 4-bit:
# (14 * 4 / 8) * 1.25 = 7.0 * 1.25 = ~8.75 GB VRAM Required!

# Run directly via Ollama:
ollama run qwen2.5:14b-instruct-q4_K_M`,
            codeLanguage: "bash",
            actionPrompt: "Verify available VRAM with `nvidia-smi` before loading your 14B quantized model.",
            quiz: {
              question: "Why does 4-bit quantization (Q4_K_M) enable 10x faster generation on consumer GPUs?",
              options: [
                "It compresses weights so all layers fit into high-speed GPU VRAM rather than spilling into slow system RAM",
                "It deletes half the layers of the model",
                "It reduces screen resolution",
              ],
              correctIndex: 0,
              explanation:
                "VRAM memory bandwidth is ~500-1000 GB/s, whereas system PCIe RAM bandwidth is only ~30-60 GB/s. Keeping 100% of layers in VRAM prevents the PCIe bottleneck.",
            },
            xpReward: 100,
            completed: false,
          },
        ],
      },
    ],
  },

  // 8. VERCEL AI SDK
  {
    id: "vercel-ai-sdk",
    title: "Vercel AI SDK: Streaming Generative UI & Agentic Workflows",
    repoSource: "vercel/ai",
    repoStars: "22.8k ★",
    category: "Full-Stack Frontend & Backend",
    level: "Intermediate",
    description:
      "Build real-time full-stack AI applications with React 19, Server-Sent Events (SSE), tool calling, and dynamic component hydration in Next.js App Router.",
    estimatedHours: 3,
    xpReward: 900,
    modules: [
      {
        id: "ai-mod-1",
        title: "Module 1: Streaming Tokens & Generative UI",
        lessons: [
          {
            id: "ai-l1",
            title: "Streaming Server Actions with streamText",
            concept:
              "Traditional REST endpoints wait for the full LLM completion before responding. The Vercel AI SDK streams chunks token-by-token over Server-Sent Events, achieving Time-To-First-Token (TTFT) under 200ms.",
            codeSnippet: `// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are an elite code reviewer.',
    messages,
  });
  return result.toDataStreamResponse();
}`,
            codeLanguage: "typescript",
            actionPrompt: "Integrate `useChat()` on the client to automatically handle streaming state.",
            quiz: {
              question: "What is the primary user experience advantage of streaming responses via toDataStreamResponse()?",
              options: [
                "It reduces server electricity usage to zero",
                "It delivers instant Time-To-First-Token (TTFT) feedback, eliminating perception of lag",
                "It encrypts the database",
              ],
              correctIndex: 1,
              explanation:
                "Users see tokens appearing in real-time within 200ms, making the application feel instantaneous rather than frozen.",
            },
            xpReward: 100,
            completed: false,
          },
        ],
      },
    ],
  },

  // 9. MULTI-AGENT STATE GRAPHS
  {
    id: "langgraph-multi-agent",
    title: "Cyclic Multi-Agent State Graphs & Autonomous Supervisors",
    repoSource: "langchain-ai/langgraph",
    repoStars: "21.5k ★",
    category: "AI Agents & MCP",
    level: "Sovereign Architect",
    description:
      "Transition from fragile linear chains to resilient cyclical state graphs. Implement supervisor agents, human-in-the-loop review gates, and persistent state checkpoints.",
    estimatedHours: 4,
    xpReward: 1500,
    modules: [
      {
        id: "lg-mod-1",
        title: "Module 1: State Graphs vs Linear DAGs",
        lessons: [
          {
            id: "lg-l1",
            title: "Cyclic Execution & State Reducers",
            concept:
              "Real-world coding agents cannot be linear: they must write code, run tests, fail, inspect errors, and cycle back to edit. LangGraph models this as a state graph with nodes (agents) and conditional edges (decision branches).",
            codeSnippet: `from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
import operator

class AgentState(TypedDict):
    code: str
    test_passed: bool
    iterations: Annotated[int, operator.add]

def test_runner(state: AgentState):
    passed = run_pytest(state["code"])
    return {"test_passed": passed, "iterations": 1}

def router(state: AgentState):
    if state["test_passed"] or state["iterations"] >= 3:
        return END
    return "coder_agent"`,
            codeLanguage: "python",
            actionPrompt: "Study how `router` directs flow back to `coder_agent` if tests fail.",
            quiz: {
              question: "Why is a cyclic graph superior to a linear chain for autonomous AI coders?",
              options: [
                "Because cyclic graphs allow agents to self-correct and iterate until tests pass",
                "Linear chains can only handle 10 words",
                "Cyclic graphs do not require any Python code",
              ],
              correctIndex: 0,
              explanation:
                "Autonomous problem-solving requires feedback loops: coding &rarr; test execution &rarr; reflection &rarr; re-coding until verification succeeds.",
            },
            xpReward: 120,
            completed: false,
          },
        ],
      },
    ],
  },

  // 10. MECHANICAL & FABRICATION ENGINEERING
  {
    id: "mechanical-s550-engineering",
    title: "S550 Mechanical & Home Fabrication Engineering",
    repoSource: "Stoic-EmpireLabs/stoic-body",
    repoStars: "Founder ★",
    category: "Mechanical & Craft",
    level: "Intermediate",
    description:
      "Applied physical engineering: 2015 Mustang V6 maintenance, torque-rated stud anchoring, and precision structural timber joinery.",
    estimatedHours: 2,
    xpReward: 800,
    modules: [
      {
        id: "mech-mod-1",
        title: "Module 1: Automotive Fluid Dynamics & Fastener Physics",
        lessons: [
          {
            id: "mech-l1",
            title: "The 19 lb-ft Torque Spec & FL-500S Gasket Seal",
            concept:
              "Oil pan threads are soft aluminum. Over-torquing strips the oil pan requiring a $600 replacement. Under-torquing leaks oil onto hot exhaust. Applying exactly 19 lb-ft with a calibrated torque wrench and lubing the O-ring guarantees lifetime seal integrity.",
            codeSnippet: `# 2015 Ford Mustang 3.7L V6 Maintenance Checklist:
# - Oil: Exactly 6.0 Quarts Motorcraft 5W-20 Synthetic Blend
# - Filter: Motorcraft FL-500S (Hand-tighten 3/4 turn past gasket contact)
# - Drain Bolt: 15mm Hex Head (Torque Spec: 19 lb-ft / 26 Nm)`,
            codeLanguage: "bash",
            actionPrompt: "Hand-thread the drain plug 4 full turns before applying the socket wrench.",
            quiz: {
              question: "Why must fresh engine oil be smeared on the new filter rubber O-ring before installation?",
              options: [
                "To prevent the rubber gasket from bunching, friction-tearing, and sticking during torquing",
                "To change the oil filter color",
                "To clean the engine hood",
              ],
              correctIndex: 0,
              explanation:
                "Lubricating the gasket ensures a smooth, non-binding seal against the engine block without tearing the rubber.",
            },
            xpReward: 100,
            completed: false,
          },
        ],
      },
    ],
  },
];
