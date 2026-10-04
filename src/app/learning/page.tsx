"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import {
  InteractiveCourse,
  InteractiveLesson,
  FOUNDER_AI_COURSES,
  calculateCourseMastery,
  evaluateQuizAnswer,
  calculateDailyLearningTarget,
  createCustomCourse,
  CreateCourseInput,
} from "@/lib/courses";
import {
  FOUNDER_LEARNING_PATHWAYS,
  calculatePathwayProgress,
  LearningPathway,
} from "@/lib/learning";

interface HowToVideo {
  id: string;
  title: string;
  category: "Mechanical" | "Fatherhood" | "Home Fabrication" | "Calisthenics & Boxing" | "AI & Systems" | "Consulting";
  duration: string;
  thumbnailGradient: string;
  description: string;
  chapters: { time: string; title: string }[];
  videoUrl: string;
  embedUrl: string;
  watched: boolean;
  xpReward: number;
}

const DEFAULT_VIDEOS: HowToVideo[] = [
  {
    id: "vid-mustang",
    title: "2015 Ford Mustang V6 3.7L DIY Oil & Filter Change Masterclass",
    category: "Mechanical",
    duration: "14:28",
    thumbnailGradient: "from-amber-900 to-slate-900",
    description: "Full mechanical execution: Ramps, 15mm drain plug bolt, FL-500S filter removal, 6.0 qts Motorcraft 5W-20 Synthetic Blend, 19 lb-ft torque specs.",
    chapters: [
      { time: "00:00", title: "Safety, Ramps & 150°F Engine Warm-up" },
      { time: "02:45", title: "15mm Drain Plug Removal & Catch Pan Positioning" },
      { time: "06:10", title: "Motorcraft FL-500S Filter Removal & O-Ring Lubrication" },
      { time: "09:30", title: "Hand-Tightening Filter & 19 lb-ft Torque Spec" },
      { time: "11:15", title: "Pouring Exactly 6.0 Quarts 5W-20 & Dipstick Reading" },
    ],
    videoUrl: "https://www.youtube.com/watch?v=kYn_sWn5jC0",
    embedUrl: "https://www.youtube.com/embed/kYn_sWn5jC0",
    watched: false,
    xpReward: 250,
  },
  {
    id: "vid-cheer",
    title: "Father & Daughter Cheerleading Flyer Stunting Progression",
    category: "Fatherhood",
    duration: "12:15",
    thumbnailGradient: "from-purple-900 to-slate-900",
    description: "Step-by-step partner stunting: Teaching tight hollow body core in the flyer, base palm shelf grip, balance line, elevator lift, and safe cradle catch.",
    chapters: [
      { time: "00:00", title: "Safety Rules, Floor Mat & Spotter Fundamentals" },
      { time: "02:20", title: "Flyer Ground Hollow Body & Locked Knee Drills" },
      { time: "05:10", title: "Base Palm Shelf Grip Biomechanics" },
      { time: "07:45", title: "Thigh Stand Lockout & Balance Transfer" },
      { time: "10:00", title: "Elevator Extension & Chest-Level Cradle Catch" },
    ],
    videoUrl: "https://www.youtube.com/watch?v=VlSjZ_N7pTI",
    embedUrl: "https://www.youtube.com/embed/VlSjZ_N7pTI",
    watched: false,
    xpReward: 250,
  },
  {
    id: "vid-ultron",
    title: "Ultron Private LLM: Local Ollama & Antigravity Indexing",
    category: "AI & Systems",
    duration: "16:20",
    thumbnailGradient: "from-cyan-900 to-slate-900",
    description: "Self-hosting local models: Quantized Qwen 2.5 14B / DeepSeek, measuring GPU VRAM offload, private vector embeddings, and Antigravity workspace integration.",
    chapters: [
      { time: "00:00", title: "Ollama Local Runtime & Model Architecture" },
      { time: "04:15", title: "Measuring Tokens/Sec Throughput & VRAM Offload" },
      { time: "08:30", title: "Local Vector Embeddings for Doctoral DBA Notes" },
      { time: "12:45", title: "Binding Endpoint into Antigravity Custom Tools" },
    ],
    videoUrl: "https://www.youtube.com/watch?v=rQnL_U6K9yE",
    embedUrl: "https://www.youtube.com/embed/rQnL_U6K9yE",
    watched: false,
    xpReward: 300,
  },
  {
    id: "vid-tv-mount",
    title: "Heavy Duty Dual-Stud TV Wall Mounting (Zero Sag Guide)",
    category: "Home Fabrication",
    duration: "10:45",
    thumbnailGradient: "from-blue-900 to-slate-900",
    description: "Electronic stud-center calibration, 16\" spacing, 7/32\" pilot drill bits, 3\" lag bolt installation, and 100 lb downward pull load test.",
    chapters: [
      { time: "00:00", title: "Stud Finder Deep Scan & Eye-Level Height (42\")" },
      { time: "03:10", title: "Pre-drilling 4 Pilot Holes with 7/32\" Bit" },
      { time: "06:00", title: "Ratcheting 3\" Lag Bolts & 100 lb Pull Test" },
      { time: "08:30", title: "VESA Bracket Mounting & Articulating Arm Leveling" },
    ],
    videoUrl: "https://www.youtube.com/watch?v=Z7bB0-3T10o",
    embedUrl: "https://www.youtube.com/embed/Z7bB0-3T10o",
    watched: false,
    xpReward: 200,
  },
];

export default function LearningPage() {
  const { awardXp, playAnvilChime, playBellSound } = useStoic();

  // Tab View Mode: 'brilliant-courses' vs 'video-guides'
  const [activeTab, setActiveTab] = useState<"brilliant-courses" | "video-guides">("brilliant-courses");

  // Brilliant-Style Interactive Courses State
  const [courses, setCourses] = useState<InteractiveCourse[]>(FOUNDER_AI_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(FOUNDER_AI_COURSES[0].id);
  const [activeLessonId, setActiveLessonId] = useState<string>(
    FOUNDER_AI_COURSES[0].modules[0].lessons[0].id
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Brilliant Scoring & Quiz Interaction State
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [dailyCompletedCount, setDailyCompletedCount] = useState<number>(2);

  // Custom Course Builder Modal State
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customRepo, setCustomRepo] = useState("");
  const [customCategory, setCustomCategory] = useState<InteractiveCourse["category"]>("Google Antigravity Mastery");
  const [customLevel, setCustomLevel] = useState<InteractiveCourse["level"]>("Advanced");
  const [customDesc, setCustomDesc] = useState("");
  const [customLessonTitle, setCustomLessonTitle] = useState("");
  const [customConcept, setCustomConcept] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customOpt1, setCustomOpt1] = useState("");
  const [customOpt2, setCustomOpt2] = useState("");
  const [customOpt3, setCustomOpt3] = useState("");
  const [customCorrectIdx, setCustomCorrectIdx] = useState(0);
  const [customExplanation, setCustomExplanation] = useState("");

  // Video Library State
  const [videos, setVideos] = useState<HowToVideo[]>(DEFAULT_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<HowToVideo>(DEFAULT_VIDEOS[0]);

  // Mechanical Checklists State
  const [pathways, setPathways] = useState<LearningPathway[]>(FOUNDER_LEARNING_PATHWAYS);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>("mustang_oil_change");

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCourses = localStorage.getItem("stoic_interactive_courses");
      if (savedCourses) {
        try {
          const parsed = JSON.parse(savedCourses);
          if (Array.isArray(parsed) && parsed.length > 0) setCourses(parsed);
        } catch (e) {}
      }

      const savedCount = localStorage.getItem("stoic_daily_learning_count");
      if (savedCount) setDailyCompletedCount(Number(savedCount));

      const savedVideos = localStorage.getItem("stoic_learning_videos");
      if (savedVideos) {
        try {
          const parsed = JSON.parse(savedVideos);
          if (Array.isArray(parsed) && parsed.length > 0) setVideos(parsed);
        } catch (e) {}
      }
    }
  }, []);

  // Save courses to localStorage
  const saveCourses = (updated: InteractiveCourse[]) => {
    setCourses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_interactive_courses", JSON.stringify(updated));
    }
  };

  // Find active course and lesson
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allCurrentLessons = currentCourse.modules.flatMap((m) => m.lessons);
  const currentLesson =
    allCurrentLessons.find((l) => l.id === activeLessonId) || allCurrentLessons[0] || currentCourse.modules[0]?.lessons[0];

  const courseMastery = calculateCourseMastery(currentCourse);
  const dailyTarget = calculateDailyLearningTarget(dailyCompletedCount, 3);

  // Total Concepts Mastered across all courses
  const totalMasteredCount = courses
    .flatMap((c) => c.modules)
    .flatMap((m) => m.lessons)
    .filter((l) => l.completed).length;

  // Handle Quiz Submission (Brilliant-Style Active Feedback)
  const handleAnswerQuiz = (index: number) => {
    if (quizSubmitted) return;
    setSelectedQuizIndex(index);
    const result = evaluateQuizAnswer(currentLesson.quiz, index, currentLesson.xpReward);
    setQuizFeedback(result);
    setQuizSubmitted(true);

    if (result.isCorrect) {
      playAnvilChime();
      awardXp(currentLesson.xpReward, `Active Mastery Check: ${currentLesson.title}`, "Intellect");
      // Mark lesson completed
      const updatedCourses = courses.map((c) => {
        if (c.id !== currentCourse.id) return c;
        return {
          ...c,
          modules: c.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) => (l.id === currentLesson.id ? { ...l, completed: true } : l)),
          })),
        };
      });
      saveCourses(updatedCourses);

      const nextCount = dailyCompletedCount + 1;
      setDailyCompletedCount(nextCount);
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_daily_learning_count", String(nextCount));
      }

      if (nextCount === 3) {
        awardXp(250, "🏆 Daily Learning Target Conquered (3/3 Concepts)", "Intellect");
        playBellSound();
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedQuizIndex(null);
    setQuizSubmitted(false);
    setQuizFeedback(null);
  };

  const handleSelectLesson = (lesson: InteractiveLesson) => {
    setActiveLessonId(lesson.id);
    handleResetQuiz();
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Next Lesson Progression
  const handleNextLesson = () => {
    const currentIndex = allCurrentLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex >= 0 && currentIndex < allCurrentLessons.length - 1) {
      const nextLesson = allCurrentLessons[currentIndex + 1];
      setActiveLessonId(nextLesson.id);
      handleResetQuiz();
    } else {
      // Completed all lessons in course!
      awardXp(currentCourse.xpReward, `🌟 Full Course Mastered: ${currentCourse.title}`, "Intellect");
      playBellSound();
      alert(`Course "${currentCourse.title}" fully conquered! +${currentCourse.xpReward} XP awarded.`);
    }
  };

  // Handle Custom Course Creation
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customLessonTitle.trim()) return;

    const input: CreateCourseInput = {
      title: customTitle.trim(),
      repoSource: customRepo.trim() || "Stoic-EmpireLabs/custom",
      repoStars: "Custom ★",
      category: customCategory,
      level: customLevel,
      description: customDesc.trim() || "User-authored sovereign curriculum.",
      estimatedHours: 2,
      xpReward: 1000,
      lessons: [
        {
          title: customLessonTitle.trim(),
          concept: customConcept.trim() || "Key mental model and core architecture.",
          codeSnippet: customCode.trim() || "# Run and inspect\nprint('Mastery initialized')",
          codeLanguage: "python",
          actionPrompt: "Execute and verify expected behavior.",
          quizQuestion: customQuestion.trim() || "What is the primary architectural takeaway?",
          quizOptions: [
            customOpt1.trim() || "Option A",
            customOpt2.trim() || "Option B",
            customOpt3.trim() || "Option C",
          ],
          correctIndex: customCorrectIdx,
          explanation: customExplanation.trim() || "Reinforces foundational mechanics.",
        },
      ],
    };

    const newCourse = createCustomCourse(input);
    const updated = [newCourse, ...courses];
    saveCourses(updated);
    setSelectedCourseId(newCourse.id);
    setActiveLessonId(newCourse.modules[0].lessons[0].id);
    setShowCourseModal(false);
    handleResetQuiz();

    awardXp(500, `New Custom Course Authored: ${newCourse.title}`, "Intellect");
    playBellSound();

    // Reset Form
    setCustomTitle("");
    setCustomRepo("");
    setCustomDesc("");
    setCustomLessonTitle("");
    setCustomConcept("");
    setCustomCode("");
    setCustomQuestion("");
    setCustomOpt1("");
    setCustomOpt2("");
    setCustomOpt3("");
    setCustomExplanation("");
  };

  // Filter courses by category
  const filteredCourses =
    categoryFilter === "All" ? courses : courses.filter((c) => c.category === categoryFilter);

  // Toggle Mechanical Step
  const togglePathwayStep = (stepId: string) => {
    setPathways((prev) =>
      prev.map((pw) => {
        if (pw.id !== selectedPathwayId) return pw;
        return {
          ...pw,
          steps: pw.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)),
        };
      })
    );
  };

  const currentPathway = pathways.find((p) => p.id === selectedPathwayId) || pathways[0];
  const pathwayProgress = calculatePathwayProgress(currentPathway);

  return (
    <div className="space-y-6">

      {/* BRILLIANT METRICS & SCORING HERO DECK */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Interactive Active Learning &middot; Video How-To Guides</span>
              <span className="text-[10px] bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
                Brilliant Engine &bull; Learn by Doing &bull; Top GitHub AI Repos
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Active problem solving with live code challenges, conceptual mental models, and in-app course authoring.
            </p>
          </div>

          {/* MODE TOGGLES */}
          <div className="flex rounded-lg bg-black border border-red-950 p-1 gap-1">
            <button
              onClick={() => setActiveTab("brilliant-courses")}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "brilliant-courses"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>⚡</span> Brilliant AI Courses &amp; Studio
            </button>
            <button
              onClick={() => setActiveTab("video-guides")}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "video-guides"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>🎬</span> Video How-To Guides
            </button>
          </div>
        </div>

        {/* 4 BRILLIANT METRICS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Tile 1: Daily Learning Streak */}
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase mb-1">
              <span>Daily Streak</span>
              <span>🔥</span>
            </div>
            <div className="text-xl font-mono font-black text-white">
              {dailyTarget.streakDays} <span className="text-xs text-amber-400 font-bold">Days</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5 block">
              ✓ Streak Shield Active
            </span>
          </div>

          {/* Tile 2: Daily Goal Progress */}
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase mb-1">
              <span>Daily Target</span>
              <span>🎯</span>
            </div>
            <div className="text-xl font-mono font-black text-white">
              {dailyTarget.completedToday} / {dailyTarget.dailyTarget}{" "}
              <span className="text-xs text-slate-300 font-bold">Concepts</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 mt-1.5 overflow-hidden border border-red-950">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (dailyTarget.completedToday / dailyTarget.dailyTarget) * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Tile 3: Total Concepts Mastered */}
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase mb-1">
              <span>Mastered Lessons</span>
              <span>🧠</span>
            </div>
            <div className="text-xl font-mono font-black text-white">
              {totalMasteredCount}{" "}
              <span className="text-xs text-blue-400 font-bold">Completed</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
              Across all {courses.length} curricula
            </span>
          </div>

          {/* Tile 4: Founder League Tier */}
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase mb-1">
              <span>League Tier</span>
              <span>💎</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Diamond Centurion
            </div>
            <span className="text-[10px] text-purple-300 font-mono mt-0.5 block">
              Top 1% Sovereign Bracket
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* TAB 1: BRILLIANT INTERACTIVE COURSES & ACTIVE LEARNING STUDIO */}
      {/* ============================================================== */}
      {activeTab === "brilliant-courses" && (
        <div className="space-y-6">

          {/* ACTIVE INTERACTIVE LESSON PLAYER (THE BRILLIANT ACTIVE EXPERIENCE) */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-950 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    {currentCourse.category} &bull; {currentCourse.repoStars}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 bg-neutral-900 px-2 py-0.5 rounded border border-red-950">
                    Repo: {currentCourse.repoSource}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                  <span>{currentCourse.title}</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    &bull; {courseMastery.percentage}% Mastered
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow"
                >
                  + Create Custom Course
                </button>
              </div>
            </div>

            {/* LESSON NAVIGATION TABS */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allCurrentLessons.map((lesson, idx) => {
                const isActive = lesson.id === currentLesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                      isActive
                        ? "bg-red-900/60 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40"
                        : lesson.completed
                        ? "bg-black/60 border-emerald-900/50 text-emerald-300"
                        : "bg-[#121218] border-red-950 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{lesson.completed ? "✓" : `${idx + 1}.`}</span>
                    <span>{lesson.title}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      +{lesson.xpReward} XP
                    </span>
                  </button>
                );
              })}
            </div>

            {/* BRILLIANT ACTIVE LESSON CARD */}
            <div className="space-y-4 p-5 rounded-xl bg-[#121218] border border-red-950/70">
              {/* STEP 1: CONCEPTUAL INTUITION */}
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold block mb-1">
                  1. The Mental Model &amp; Core Architecture
                </span>
                <h4 className="text-base font-bold text-white mb-2">{currentLesson.title}</h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-black/50 p-3.5 rounded-lg border border-red-950">
                  {currentLesson.concept}
                </p>
              </div>

              {/* STEP 2: INTERACTIVE CODE / TERMINAL SNIPPET */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-xs font-mono uppercase text-blue-400 font-bold">
                    2. Code &amp; Terminal Execution Prompt
                  </span>
                  <button
                    onClick={() => handleCopyCode(currentLesson.codeSnippet)}
                    className="text-[11px] font-mono font-bold text-amber-300 hover:text-white transition px-2 py-0.5 rounded bg-black border border-red-950"
                  >
                    {copiedCode ? "✓ Copied to Clipboard!" : "📋 Copy Code"}
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-lg bg-black border border-red-950/80 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                    <code>{currentLesson.codeSnippet}</code>
                  </pre>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block italic">
                  💡 Action Prompt: {currentLesson.actionPrompt}
                </span>
              </div>

              {/* STEP 3: BRILLIANT-STYLE INTERACTIVE ACTIVE KNOWLEDGE CHECK */}
              <div className="pt-2 border-t border-red-950/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    3. Active Problem-Solving Challenge
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-black px-2 py-0.5 rounded border border-amber-500/30">
                    Mastery Check &bull; Instant Feedback
                  </span>
                </div>

                <p className="text-sm font-semibold text-white mb-3">
                  {currentLesson.quiz.question}
                </p>

                {/* Multiple-Choice Options */}
                <div className="space-y-2 mb-3">
                  {currentLesson.quiz.options.map((option, optIdx) => {
                    const isSelected = selectedQuizIndex === optIdx;
                    const isCorrect = optIdx === currentLesson.quiz.correctIndex;
                    let btnClass = "bg-black/70 border-red-950 text-slate-200 hover:border-amber-500/50";

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "bg-red-950/60 border-red-600 text-red-300 font-bold";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-amber-950/40 border-amber-500 text-amber-300 font-bold";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerQuiz(optIdx)}
                        disabled={quizSubmitted}
                        className={`w-full p-3 rounded-lg text-left text-xs transition border flex items-center justify-between gap-3 ${btnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center font-mono text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {quizSubmitted && isCorrect && (
                          <span className="text-emerald-400 font-mono text-xs font-bold">✓ CORRECT</span>
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <span className="text-red-400 font-mono text-xs font-bold">✕ WRONG</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instant Pedagogical Feedback */}
                {quizFeedback && (
                  <div
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed mb-3 ${
                      quizFeedback.isCorrect
                        ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-200"
                        : "bg-red-950/50 border-red-600/60 text-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p>{quizFeedback.feedback}</p>
                      {!quizFeedback.isCorrect && (
                        <button
                          onClick={handleResetQuiz}
                          className="px-2.5 py-1 rounded bg-black text-amber-400 hover:text-white border border-amber-500/40 font-bold text-[10px] shrink-0"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Lesson Action */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleNextLesson}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-extrabold uppercase tracking-wider shadow flex items-center gap-1.5"
                  >
                    <span>Next Lesson</span> &rarr;
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* GITHUB TOP AI REPOS COURSE CATALOG */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-950 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Curated GitHub AI Masterclasses &amp; Full Courses
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Reverse-engineered from top GitHub repositories for AI engineering, local LLMs, and agent systems.
                </p>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "All",
                  "Google Antigravity Mastery",
                  "Vibe Coding & AI Dev",
                  "Web & UI/UX Design",
                  "Autonomous Automation",
                  "Full-Stack Frontend & Backend",
                  "AI Agents & MCP",
                  "Local Sovereign LLMs",
                  "Mechanical & Craft",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition border ${
                      categoryFilter === cat
                        ? "bg-red-800 text-white border-red-500 shadow"
                        : "bg-black border-red-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((c) => {
                const mastery = calculateCourseMastery(c);
                const isSelected = c.id === selectedCourseId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      setActiveLessonId(c.modules[0].lessons[0].id);
                      handleResetQuiz();
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-red-950/30 border-amber-500 shadow-xl ring-2 ring-amber-500/50"
                        : "bg-[#121218] border-red-950/60 hover:border-amber-500/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase bg-black px-2 py-0.5 rounded text-amber-400 border border-amber-500/30 font-bold">
                          {c.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-300 bg-neutral-900 px-2 py-0.5 rounded border border-red-950 font-bold">
                          {c.repoStars} &bull; {c.level}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{c.title}</h4>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        GitHub: {c.repoSource}
                      </span>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-red-950/70">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold">Mastery Progress</span>
                        <span className="font-mono font-bold text-amber-400">
                          {mastery.percentage}% ({mastery.completedLessons}/{mastery.totalLessons} Lessons)
                        </span>
                      </div>
                      <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-red-950 mb-3">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300"
                          style={{ width: `${mastery.percentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          +{c.xpReward} Total XP
                        </span>
                        <button
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                            isSelected
                              ? "bg-amber-500 text-black shadow"
                              : "bg-black text-white border border-red-950 hover:border-amber-500"
                          }`}
                        >
                          {isSelected ? "Current Course" : "Select Course"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ORIGINAL VIDEO MASTERCLASSES & MECHANICAL CHECKLISTS   */}
      {/* ============================================================== */}
      {activeTab === "video-guides" && (
        <div className="space-y-6">

          {/* FEATURED VIDEO PLAYER */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-red-950/70 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
                  {selectedVideo.category} Masterclass &bull; {selectedVideo.duration}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedVideo.title}</h3>
              </div>

              <a
                href={selectedVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5"
              >
                <span>▶</span> Open Video Link ↗
              </a>
            </div>

            {/* VIDEO LAUNCHPAD */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-black via-[#140608] to-black rounded-xl overflow-hidden border border-red-900/60 shadow-2xl flex flex-col justify-between p-6 text-center">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono bg-black/90 px-3 py-1 rounded text-white border border-red-900/40">
                  HD &bull; Verified Instructional Video Guide
                </span>
                <span className="text-xs font-mono text-amber-400 bg-black/90 px-2.5 py-1 rounded border border-amber-500/30 font-bold">
                  {selectedVideo.duration}
                </span>
              </div>

              <div className="my-auto">
                <a
                  href={selectedVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-center text-3xl shadow-2xl transition transform hover:scale-110 border-2 border-red-400/40 cursor-pointer mb-3"
                >
                  ▶
                </a>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>

              {/* TIMELINE CHAPTERS */}
              <div className="bg-black/90 p-3 rounded-lg border border-red-950/80 flex flex-wrap gap-2 text-[11px] font-mono text-white overflow-x-auto justify-center">
                <span className="text-amber-400 font-bold self-center">Key Chapters:</span>
                {selectedVideo.chapters.map((ch, idx) => (
                  <a
                    key={idx}
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-0.5 rounded bg-neutral-900 border border-red-950 hover:border-amber-400 text-white font-medium"
                  >
                    <strong className="text-amber-400 mr-1">{ch.time}</strong> {ch.title}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* VIDEO LIST */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Video Masterclass Catalog ({videos.length} Guides)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedVideo.id === vid.id
                      ? "bg-red-950/40 border-amber-500 shadow-xl"
                      : "bg-[#121218] border-red-950/60 hover:border-amber-500/50"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                      {vid.category}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2">{vid.title}</h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-red-950/70 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">+{vid.xpReward} XP</span>
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-red-800 text-white rounded font-bold"
                    >
                      ▶ Watch ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DECONSTRUCTED MECHANICAL CHECKLISTS */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-red-950 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Step-by-Step Mechanical &amp; Fabrication Checklists
                </h3>
                <p className="text-xs text-slate-300">
                  Physical execution checklists with safety checks and factory torque specs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {pathwayProgress.percentage}% Mastered
              </span>
            </div>

            {/* Pathway Selectors */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pathways.map((pw) => {
                const isSelected = pw.id === selectedPathwayId;
                const prog = calculatePathwayProgress(pw);
                return (
                  <button
                    key={pw.id}
                    onClick={() => setSelectedPathwayId(pw.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                      isSelected
                        ? "bg-gradient-to-r from-red-700 to-red-800 text-white border-red-500"
                        : "bg-black text-slate-300 border-red-950 hover:text-white"
                    }`}
                  >
                    <span>{pw.title.split("DIY")[0].split("—")[0]}</span>{" "}
                    <span className="text-amber-400">({prog.percentage}%)</span>
                  </button>
                );
              })}
            </div>

            {/* Current Pathway Steps */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white">{currentPathway.title}</h4>
              <p className="text-xs text-slate-300">{currentPathway.description}</p>

              <div className="space-y-2 mt-3">
                {currentPathway.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={() => togglePathwayStep(step.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-4 ${
                      step.completed
                        ? "bg-black/60 border-red-950/40 text-slate-400"
                        : "bg-[#121218] border-red-950/70 hover:border-amber-500/40 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          step.completed ? "bg-amber-500 text-black font-bold" : "border border-red-900/60 bg-black"
                        }`}
                      >
                        {step.completed && "✓"}
                      </div>
                      <span className={`text-xs ${step.completed ? "line-through text-slate-500" : "font-semibold text-white"}`}>
                        Step {idx + 1}: {step.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold shrink-0">
                      {step.estimatedMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE CUSTOM IN-APP COURSE (STUDIO)                   */}
      {/* ============================================================== */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-red-950 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-red-950 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  In-App Course Authoring Studio
                </h3>
                <p className="text-xs text-slate-300">
                  Build full-on interactive courses for anything you want to learn. Includes code actions and active quiz checks.
                </p>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white font-bold block mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python FastMCP Tooling & Agent Sandboxes"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-white font-bold block mb-1">GitHub Repo Source (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. modelcontextprotocol/python-sdk"
                    value={customRepo}
                    onChange={(e) => setCustomRepo(e.target.value)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Google Antigravity Mastery">Google Antigravity Mastery</option>
                    <option value="Vibe Coding & AI Dev">Vibe Coding &amp; AI Dev</option>
                    <option value="Web & UI/UX Design">Web &amp; UI/UX Design</option>
                    <option value="Autonomous Automation">Autonomous Automation</option>
                    <option value="Full-Stack Frontend & Backend">Full-Stack Frontend &amp; Backend</option>
                    <option value="AI Agents & MCP">AI Agents &amp; MCP</option>
                    <option value="Local Sovereign LLMs">Local Sovereign LLMs</option>
                    <option value="Mechanical & Craft">Mechanical &amp; Craft</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Difficulty Level</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value as any)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Sovereign Architect">Sovereign Architect</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-white font-bold block mb-1">Course Overview &amp; Objective</label>
                <textarea
                  rows={2}
                  placeholder="What core architectural ability does this course impart?"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-[#121218] border border-red-950 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Lesson 1 Definition */}
              <div className="p-4 rounded-xl bg-black border border-red-950/80 space-y-3">
                <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
                  Lesson 1: Concept, Code &amp; Brilliant Challenge Check
                </span>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Declaring Asynchronous FastMCP Tools with Type Annotations"
                    value={customLessonTitle}
                    onChange={(e) => setCustomLessonTitle(e.target.value)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Mental Model / Explanation</label>
                  <textarea
                    rows={2}
                    placeholder="Clear intuitive breakdown of how and why this works..."
                    value={customConcept}
                    onChange={(e) => setCustomConcept(e.target.value)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">Code Snippet or Terminal Command</label>
                  <textarea
                    rows={3}
                    placeholder="paste executable code or shell commands..."
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Challenge Question */}
                <div className="space-y-2 pt-2 border-t border-red-950">
                  <label className="text-xs text-emerald-400 font-bold block">
                    Interactive Challenge Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Which decorator exposes the function to the MCP protocol?"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="w-full bg-[#121218] border border-red-950 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Option A (Correct default)"
                      value={customOpt1}
                      onChange={(e) => setCustomOpt1(e.target.value)}
                      className="w-full bg-[#121218] border border-red-950 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option B"
                      value={customOpt2}
                      onChange={(e) => setCustomOpt2(e.target.value)}
                      className="w-full bg-[#121218] border border-red-950 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Option C"
                      value={customOpt3}
                      onChange={(e) => setCustomOpt3(e.target.value)}
                      className="w-full bg-[#121218] border border-red-950 rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">
                      Correct Option Index (0 = Option A, 1 = Option B, 2 = Option C)
                    </label>
                    <select
                      value={customCorrectIdx}
                      onChange={(e) => setCustomCorrectIdx(Number(e.target.value))}
                      className="bg-[#121218] border border-red-950 rounded px-3 py-1 text-xs text-white"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">Pedagogical Explanation</label>
                    <input
                      type="text"
                      placeholder="Why this answer is correct..."
                      value={customExplanation}
                      onChange={(e) => setCustomExplanation(e.target.value)}
                      className="w-full bg-[#121218] border border-red-950 rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-red-950">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded bg-neutral-900 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow"
                >
                  Save &amp; Launch In-App Course (+500 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
