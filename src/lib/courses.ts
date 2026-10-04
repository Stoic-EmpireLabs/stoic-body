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

export interface InteractiveCourse {
  id: string;
  title: string;
  repoSource: string;
  repoStars: string;
  category:
    | "AI Agents & MCP"
    | "Local Sovereign LLMs"
    | "Full-Stack AI Apps"
    | "Multi-Agent Systems"
    | "Mechanical & Craft";
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
  category: InteractiveCourse["category"];
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
 * Pre-loaded interactive AI & Sovereign Engineering courses based on top GitHub repos
 */
export const FOUNDER_AI_COURSES: InteractiveCourse[] = [
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
                "FastMCP inspects native Python type annotations (`subsystem: str`) and the docstring to dynamically build the JSON schema.",
            },
            xpReward: 150,
            completed: false,
          },
        ],
      },
    ],
  },
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
          {
            id: "ollama-l2",
            title: "Crafting Sovereign Modelfiles & System Anchors",
            concept:
              "An Ollama Modelfile allows you to bake system personas, temperature parameters, and stop tokens into a standalone model binary.",
            codeSnippet: `# Modelfile
FROM qwen2.5:14b
PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER stop "<|im_end|>"

SYSTEM """You are Ultron, a sovereign offline AI advisor for Stoic discipline, systems programming, and high-performance engineering. Be concise, rigorous, and direct."""`,
            codeLanguage: "bash",
            actionPrompt: "Build the image using `ollama create ultron-sovereign -f Modelfile`.",
            quiz: {
              question: "What parameter lowers hallucination when writing factual code and logic?",
              options: [
                "Setting temperature to 1.8",
                "Lowering temperature towards 0.1 - 0.3",
                "Increasing max tokens to 100,000",
              ],
              correctIndex: 1,
              explanation:
                "Lower temperature (0.1–0.3) makes token selection deterministic, drastically reducing hallucinations for technical and coding tasks.",
            },
            xpReward: 120,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "vercel-ai-sdk",
    title: "Vercel AI SDK: Streaming Generative UI & Agentic Workflows",
    repoSource: "vercel/ai",
    repoStars: "22.8k ★",
    category: "Full-Stack AI Apps",
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
  {
    id: "langgraph-multi-agent",
    title: "Cyclic Multi-Agent State Graphs & Autonomous Supervisors",
    repoSource: "langchain-ai/langgraph",
    repoStars: "21.5k ★",
    category: "Multi-Agent Systems",
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
    # Execute verification test
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
