/**
 * STOIC BODY — CURATED GITHUB REPO PLUGINS & ACTIVE COURSE CATALOG
 *
 * Lightweight, zero-bloat repository integrations giving sovereign developers
 * 1-click access to top free GitHub courses, codebases, frameworks, and tools.
 */

export type GitHubPluginCategory =
  | "Google Antigravity & AI"
  | "Vibe Coding & Prompting"
  | "Web Design & UI/UX"
  | "Autonomous Automation"
  | "Full-Stack & Backend"
  | "YouTube & Video Automation"
  | "Local LLMs & MCP";

export interface GitHubRepoPlugin {
  id: string;
  title: string;
  repo: string;
  url: string;
  stars: string;
  category: GitHubPluginCategory;
  description: string;
  recommendedPath: string;
  tags: string[];
  xpReward: number;
  isCustom?: boolean;
}

export const CURATED_GITHUB_PLUGINS: GitHubRepoPlugin[] = [
  // 1. GOOGLE ANTIGRAVITY & GEMINI
  {
    id: "repo_gemini_cookbook",
    title: "Google Gemini API Cookbook",
    repo: "google-gemini/cookbook",
    url: "https://github.com/google-gemini/cookbook",
    stars: "11.2k ★",
    category: "Google Antigravity & AI",
    description: "Official guides, code snippets, and notebooks for Gemini 2.5 Flash, function calling, audio/video streaming, and context caching.",
    recommendedPath: "quickstarts/gemini-2.5-flash.ipynb & examples/function_calling.ipynb",
    tags: ["gemini", "antigravity", "cookbook", "python", "multimodal"],
    xpReward: 150,
  },
  {
    id: "repo_google_genai",
    title: "Google Cloud Generative AI Samples",
    repo: "GoogleCloudPlatform/generative-ai",
    url: "https://github.com/GoogleCloudPlatform/generative-ai",
    stars: "9.8k ★",
    category: "Google Antigravity & AI",
    description: "Production architectural blueprints for multimodal Gemini reasoning, Vertex AI, RAG pipelines, and agent workteams.",
    recommendedPath: "gemini/use-cases & agents/production-orchestration",
    tags: ["google", "production", "enterprise", "rag", "agents"],
    xpReward: 150,
  },
  {
    id: "repo_gemini_sdk_js",
    title: "Google GenAI TypeScript / JavaScript SDK",
    repo: "googleapis/google-genai-js",
    url: "https://github.com/googleapis/google-genai-js",
    stars: "1.4k ★",
    category: "Google Antigravity & AI",
    description: "Official modern `@google/genai` TypeScript library for Next.js, Node.js, and browser-based AI generation.",
    recommendedPath: "samples/text-generation.ts & samples/streaming.ts",
    tags: ["typescript", "sdk", "nextjs", "streaming"],
    xpReward: 120,
  },

  // 2. VIBE CODING & PROMPT ENGINEERING
  {
    id: "repo_prompt_eng_guide",
    title: "DAIR.AI Prompt Engineering Guide",
    repo: "dair-ai/Prompt-Engineering-Guide",
    url: "https://github.com/dair-ai/Prompt-Engineering-Guide",
    stars: "57.8k ★",
    category: "Vibe Coding & Prompting",
    description: "The gold standard curriculum for prompt engineering, chain-of-thought, zero-shot/few-shot vibe coding, and autonomous agents.",
    recommendedPath: "guides/introduction-to-prompting & advanced-techniques",
    tags: ["vibe-coding", "prompt-engineering", "curriculum", "agentic"],
    xpReward: 200,
  },
  {
    id: "repo_brex_prompt_eng",
    title: "Brex Enterprise Prompt Engineering",
    repo: "brexhq/prompt-engineering",
    url: "https://github.com/brexhq/prompt-engineering",
    stars: "4.5k ★",
    category: "Vibe Coding & Prompting",
    description: "Battle-tested production patterns for structured outputs, guardrails, and deterministic AI parsing in commercial applications.",
    recommendedPath: "README.md & examples/structured_outputs",
    tags: ["production", "guardrails", "vibe-coding", "commercial"],
    xpReward: 140,
  },
  {
    id: "repo_karpathy_nanogpt",
    title: "Andrej Karpathy — nanoGPT",
    repo: "karpathy/nanoGPT",
    url: "https://github.com/karpathy/nanoGPT",
    stars: "36.2k ★",
    category: "Vibe Coding & Prompting",
    description: "The simplest, fastest repository for training/finetuning medium-sized GPTs in clean, hacker-friendly Python.",
    recommendedPath: "train.py & model.py (study the self-attention block)",
    tags: ["karpathy", "transformers", "llm-from-scratch", "python"],
    xpReward: 250,
  },

  // 3. WEB DESIGN & UI/UX
  {
    id: "repo_shadcn_ui",
    title: "shadcn/ui Design System",
    repo: "shadcn-ui/ui",
    url: "https://github.com/shadcn-ui/ui",
    stars: "76.4k ★",
    category: "Web Design & UI/UX",
    description: "Beautifully designed components that you can copy and paste into your apps. Accessible, customizable, and open-source.",
    recommendedPath: "apps/www/content/docs/components (Card, Button, Dialog)",
    tags: ["ui-ux", "tailwind", "radix", "dark-mode", "design-system"],
    xpReward: 180,
  },
  {
    id: "repo_tailwind_css",
    title: "Tailwind CSS Core & Best Practices",
    repo: "tailwindlabs/tailwindcss",
    url: "https://github.com/tailwindlabs/tailwindcss",
    stars: "84.3k ★",
    category: "Web Design & UI/UX",
    description: "A utility-first CSS framework for rapid UI development with responsive flexbox, grids, and dark luxury palettes.",
    recommendedPath: "docs/grid-template-columns & docs/dark-mode",
    tags: ["css", "styling", "responsive", "frontend-speed"],
    xpReward: 150,
  },
  {
    id: "repo_magicui",
    title: "Magic UI — Modern Landing Page Components",
    repo: "magicuidesign/magicui",
    url: "https://github.com/magicuidesign/magicui",
    stars: "14.1k ★",
    category: "Web Design & UI/UX",
    description: "20+ animated, high-CTR interactive components built with React, Tailwind CSS, and Framer Motion for viral web apps.",
    recommendedPath: "registry/components/animated-beam & border-beam",
    tags: ["landing-page", "micro-interactions", "motion", "high-ctr"],
    xpReward: 175,
  },
  {
    id: "repo_lucide",
    title: "Lucide Sovereign Icons",
    repo: "lucide-icons/lucide",
    url: "https://github.com/lucide-icons/lucide",
    stars: "17.9k ★",
    category: "Web Design & UI/UX",
    description: "Crisp, lightweight SVG icons crafted with strict geometric consistency for modern web and mobile dashboards.",
    recommendedPath: "packages/lucide-react",
    tags: ["icons", "svg", "design", "minimalist"],
    xpReward: 100,
  },

  // 4. AUTONOMOUS AUTOMATION & SCRAPING
  {
    id: "repo_playwright",
    title: "Microsoft Playwright Automation",
    repo: "microsoft/playwright",
    url: "https://github.com/microsoft/playwright",
    stars: "69.1k ★",
    category: "Autonomous Automation",
    description: "Reliable end-to-end testing, headless browser scraping, network interception, and automated verification across Chromium, Firefox, and WebKit.",
    recommendedPath: "docs/src/locators.md & tests/page/page-screenshot.spec.ts",
    tags: ["playwright", "scraping", "e2e", "browser-automation"],
    xpReward: 200,
  },
  {
    id: "repo_browser_use",
    title: "Browser Use — Autonomous Web Agents",
    repo: "browser-use/browser-use",
    url: "https://github.com/browser-use/browser-use",
    stars: "34.5k ★",
    category: "Autonomous Automation",
    description: "Make websites accessible for AI agents. Open-source library to let AI control your browser and automate clicks, forms, and workflows.",
    recommendedPath: "examples/search_google.py & examples/custom_agent.py",
    tags: ["agentic", "browser", "automation", "python"],
    xpReward: 220,
  },
  {
    id: "repo_crewai",
    title: "CrewAI Multi-Agent Automation Framework",
    repo: "crewAIInc/crewAI",
    url: "https://github.com/crewAIInc/crewAI",
    stars: "26.3k ★",
    category: "Autonomous Automation",
    description: "Cutting-edge framework for orchestrating role-playing autonomous AI agents that collaborate to solve complex multi-step tasks.",
    recommendedPath: "src/crewai/crew.py & examples/TripPlanner",
    tags: ["crewai", "multi-agent", "orchestration", "automation"],
    xpReward: 200,
  },
  {
    id: "repo_n8n",
    title: "n8n Workflow Automation Platform",
    repo: "n8n-io/n8n",
    url: "https://github.com/n8n-io/n8n",
    stars: "58.2k ★",
    category: "Autonomous Automation",
    description: "Fair-code licensed workflow automation tool with 400+ nodes, webhooks, and AI agent nodes for sovereign data pipelines.",
    recommendedPath: "packages/nodes-base & packages/cli",
    tags: ["webhooks", "integrations", "pipelines", "self-hosted"],
    xpReward: 180,
  },

  // 5. FULL-STACK FRONTEND & BACKEND
  {
    id: "repo_nextjs",
    title: "Next.js by Vercel",
    repo: "vercel/next.js",
    url: "https://github.com/vercel/next.js",
    stars: "128.5k ★",
    category: "Full-Stack & Backend",
    description: "The React framework for the web. Enables App Router, React Server Components, streaming SSR, and serverless API endpoints.",
    recommendedPath: "examples/app-dir-i18n-routing & packages/next/src/server",
    tags: ["react", "nextjs", "server-components", "full-stack"],
    xpReward: 250,
  },
  {
    id: "repo_fastapi",
    title: "FastAPI High-Speed Python Microservices",
    repo: "fastapi/fastapi",
    url: "https://github.com/fastapi/fastapi",
    stars: "81.9k ★",
    category: "Full-Stack & Backend",
    description: "Modern, high-performance web framework for building APIs with Python 3.8+ based on standard Python type hints and Pydantic v2.",
    recommendedPath: "docs/en/docs/tutorial/first-steps.md & background-tasks.md",
    tags: ["python", "fastapi", "rest-api", "microservices", "asyncio"],
    xpReward: 220,
  },
  {
    id: "repo_supabase",
    title: "Supabase Sovereign Backend",
    repo: "supabase/supabase",
    url: "https://github.com/supabase/supabase",
    stars: "76.8k ★",
    category: "Full-Stack & Backend",
    description: "The open source Firebase alternative with Postgres database, Authentication, instant APIs, Edge Functions, and Realtime subscriptions.",
    recommendedPath: "examples/todo-list/nextjs & packages/database",
    tags: ["postgres", "auth", "realtime", "backend-as-a-service"],
    xpReward: 200,
  },

  // 6. YOUTUBE & MASS MEDIA PRODUCTION
  {
    id: "repo_remotion",
    title: "Remotion — Programmatic Video in React",
    repo: "remotion-dev/remotion",
    url: "https://github.com/remotion-dev/remotion",
    stars: "22.7k ★",
    category: "YouTube & Video Automation",
    description: "Create real MP4 videos programmatically using standard React components, Tailwind, and CSS transitions for mass YouTube Shorts production.",
    recommendedPath: "packages/example & packages/renderer",
    tags: ["youtube", "video-automation", "react", "programmatic-video"],
    xpReward: 240,
  },
  {
    id: "repo_ytdlp",
    title: "yt-dlp Video & Audio Pipeline",
    repo: "yt-dlp/yt-dlp",
    url: "https://github.com/yt-dlp/yt-dlp",
    stars: "105.3k ★",
    category: "YouTube & Video Automation",
    description: "Feature-rich command-line audio/video downloader and streaming media analyzer with support for thousands of sites.",
    recommendedPath: "README.md#usage-and-options (study postprocessing flags)",
    tags: ["youtube", "cli", "audio", "video", "transcoding"],
    xpReward: 160,
  },
  {
    id: "repo_auto_subtitle",
    title: "Auto-Subtitle with Whisper",
    repo: "m1guelpf/auto-subtitle",
    url: "https://github.com/m1guelpf/auto-subtitle",
    stars: "5.1k ★",
    category: "YouTube & Video Automation",
    description: "Automatically generate and overlay viral subtitles onto videos using OpenAI Whisper speech recognition and FFmpeg.",
    recommendedPath: "auto_subtitle/cli.py",
    tags: ["youtube-shorts", "subtitles", "whisper", "ffmpeg"],
    xpReward: 180,
  },

  // 7. LOCAL LLMS & MCP
  {
    id: "repo_mcp_servers",
    title: "Model Context Protocol (MCP) Reference Servers",
    repo: "modelcontextprotocol/servers",
    url: "https://github.com/modelcontextprotocol/servers",
    stars: "8.6k ★",
    category: "Local LLMs & MCP",
    description: "Official Model Context Protocol servers for Filesystem, Git, PostgreSQL, Brave Search, Puppeteer, and memory tooling.",
    recommendedPath: "src/filesystem & src/postgres",
    tags: ["mcp", "tool-calling", "anthropic", "antigravity"],
    xpReward: 210,
  },
  {
    id: "repo_ollama",
    title: "Ollama Sovereign Local LLM Runner",
    repo: "ollama/ollama",
    url: "https://github.com/ollama/ollama",
    stars: "115.4k ★",
    category: "Local LLMs & MCP",
    description: "Get up and running with Llama 3.3, DeepSeek-R1, and Mistral locally on your GPU/CPU with an OpenAI-compatible REST API.",
    recommendedPath: "docs/modelfile.md & docs/api.md",
    tags: ["local-llm", "offline", "sovereign", "gpu"],
    xpReward: 250,
  },
];

/**
 * Filter and search plugins by category and query.
 */
export function searchPlugins(
  plugins: GitHubRepoPlugin[],
  query: string,
  category: string
): GitHubRepoPlugin[] {
  let list = plugins;

  if (category && category !== "All") {
    list = list.filter((p) => p.category === category);
  }

  const q = query.trim().toLowerCase();
  if (!q) {
    return list;
  }

  return list.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.repo.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.recommendedPath.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

/**
 * Generates the clean terminal git clone command for a repository.
 */
export function formatCloneCommand(repo: string): string {
  const clean = repo.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    const url = clean.endsWith(".git") ? clean : `${clean}.git`;
    return `git clone ${url}`;
  }
  return `git clone https://github.com/${clean}.git`;
}

/**
 * Validates a GitHub repo input string (e.g. "owner/repo" or "https://github.com/owner/repo").
 */
export function validateGitHubRepoString(repo: string): boolean {
  const clean = repo.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
  const parts = clean.split("/").filter(Boolean);
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

/**
 * Creates a custom user-defined GitHub repo plugin.
 */
export function createCustomPlugin(input: {
  title: string;
  repo: string;
  category: GitHubPluginCategory;
  description?: string;
  tags?: string[];
}): GitHubRepoPlugin {
  const cleanRepo = input.repo
    .trim()
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "");

  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    title: input.title.trim(),
    repo: cleanRepo,
    url: `https://github.com/${cleanRepo}`,
    stars: "Custom ★",
    category: input.category,
    description: input.description?.trim() || "User-added sovereign GitHub repository plugin.",
    recommendedPath: "README.md",
    tags: input.tags && input.tags.length > 0 ? input.tags : ["custom", "plugin"],
    xpReward: 100,
    isCustom: true,
  };
}

/**
 * Toggles a plugin bookmark in the user's bookmarked IDs array.
 */
export function toggleBookmarkPlugin(bookmarks: string[], pluginId: string): string[] {
  if (bookmarks.includes(pluginId)) {
    return bookmarks.filter((id) => id !== pluginId);
  }
  return [...bookmarks, pluginId];
}
