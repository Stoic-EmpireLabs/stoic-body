import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCourseMastery,
  evaluateQuizAnswer,
  calculateDailyLearningTarget,
  createCustomCourse,
  FOUNDER_AI_COURSES,
  InteractiveCourse,
} from "../src/lib/courses";

test("Phase 6 Courses — Course Mastery Calculation", () => {
  const sampleCourse: InteractiveCourse = {
    id: "test-course",
    title: "Test AI Course",
    repoSource: "test/repo",
    repoStars: "10k ★",
    category: "AI Agents & MCP",
    level: "Intermediate",
    description: "Testing course mastery logic",
    estimatedHours: 2,
    xpReward: 500,
    modules: [
      {
        id: "mod-1",
        title: "Module 1",
        lessons: [
          {
            id: "l1",
            title: "Lesson 1",
            concept: "Concept 1",
            codeSnippet: "console.log('hi')",
            codeLanguage: "typescript",
            actionPrompt: "Run code",
            quiz: {
              question: "What is 2+2?",
              options: ["3", "4", "5"],
              correctIndex: 1,
              explanation: "2+2=4",
            },
            xpReward: 50,
            completed: true,
          },
          {
            id: "l2",
            title: "Lesson 2",
            concept: "Concept 2",
            codeSnippet: "console.log('bye')",
            codeLanguage: "typescript",
            actionPrompt: "Run code",
            quiz: {
              question: "What is 3+3?",
              options: ["5", "6", "7"],
              correctIndex: 1,
              explanation: "3+3=6",
            },
            xpReward: 50,
            completed: false,
          },
        ],
      },
    ],
  };

  const mastery = calculateCourseMastery(sampleCourse);
  assert.equal(mastery.totalLessons, 2);
  assert.equal(mastery.completedLessons, 1);
  assert.equal(mastery.percentage, 50);
});

test("Phase 6 Courses — Brilliant Quiz Answer Evaluation & Instant Feedback", () => {
  const quiz = {
    question: "Why use MCP (Model Context Protocol)?",
    options: [
      "To restrict the LLM to plaintext only",
      "To provide a standardized JSON-RPC interface for LLMs to securely call tools and read resources",
      "To replace the GPU hardware driver",
    ],
    correctIndex: 1,
    explanation: "MCP standardizes how AI agents discover and invoke local/remote tools and context.",
  };

  // Correct choice
  const correctResult = evaluateQuizAnswer(quiz, 1, 50);
  assert.equal(correctResult.isCorrect, true);
  assert.equal(correctResult.xpEarned, 50);
  assert.ok(correctResult.feedback.includes("Correct!"));

  // Incorrect choice
  const wrongResult = evaluateQuizAnswer(quiz, 0, 50);
  assert.equal(wrongResult.isCorrect, false);
  assert.equal(wrongResult.xpEarned, 0);
  assert.ok(wrongResult.feedback.includes("Not quite"));
});

test("Phase 6 Courses — Daily Learning Target & Streak Calculation", () => {
  const status1 = calculateDailyLearningTarget(2, 3);
  assert.equal(status1.isTargetMet, false);
  assert.equal(status1.remainingLessons, 1);

  const status2 = calculateDailyLearningTarget(3, 3);
  assert.equal(status2.isTargetMet, true);
  assert.equal(status2.remainingLessons, 0);
});

test("Phase 6 Courses — Custom Course Creation", () => {
  const custom = createCustomCourse({
    title: "FastAPI & LangGraph Production Microservice",
    repoSource: "tiangolo/fastapi",
    repoStars: "75k ★",
    category: "Full-Stack AI Apps",
    level: "Advanced",
    description: "Building an asynchronous AI microservice in Python with FastAPI and LangGraph.",
    estimatedHours: 3,
    xpReward: 750,
    lessons: [
      {
        title: "Async FastAPI Streaming Endpoint",
        concept: "Streaming tokens via SSE in FastAPI",
        codeSnippet: "async def stream_tokens(): pass",
        codeLanguage: "python",
        actionPrompt: "Implement async generator",
        quizQuestion: "Which protocol sends server-initiated streaming tokens?",
        quizOptions: ["Server-Sent Events (SSE)", "FTP", "SMTP"],
        correctIndex: 0,
        explanation: "SSE provides lightweight, unidirectional HTTP streaming.",
      },
    ],
  });

  assert.ok(custom.id.startsWith("course-custom-"));
  assert.equal(custom.title, "FastAPI & LangGraph Production Microservice");
  assert.equal(custom.modules[0].lessons.length, 1);
  assert.equal(custom.modules[0].lessons[0].quiz.correctIndex, 0);
});

test("Phase 6 Courses — Pre-loaded GitHub AI Courses Verification", () => {
  assert.ok(FOUNDER_AI_COURSES.length >= 4, "Should have at least 4 pre-loaded GitHub AI courses");

  for (const course of FOUNDER_AI_COURSES) {
    assert.ok(course.id, "Course must have an ID");
    assert.ok(course.title, "Course must have a title");
    assert.ok(course.repoSource, "Course must have a GitHub repo source");
    assert.ok(course.modules.length > 0, "Course must have at least 1 module");
    
    for (const mod of course.modules) {
      assert.ok(mod.lessons.length > 0, "Module must have at least 1 lesson");
      for (const lesson of mod.lessons) {
        assert.ok(lesson.concept, "Lesson must have concept explanation");
        assert.ok(lesson.codeSnippet, "Lesson must have code snippet or terminal command");
        assert.ok(lesson.quiz.options.length >= 2, "Quiz must have at least 2 options");
        assert.ok(lesson.quiz.correctIndex >= 0 && lesson.quiz.correctIndex < lesson.quiz.options.length);
      }
    }
  }
});

test("Phase 6 Courses — AI Hierarchy Spectrum Flagship Curriculum Verification", () => {
  const spectrumCourse = FOUNDER_AI_COURSES.find((c) => c.id === "ai-spectrum-hierarchy");
  assert.ok(spectrumCourse, "AI Hierarchy Spectrum course must exist in FOUNDER_AI_COURSES");
  assert.equal(spectrumCourse.category, "AI Architecture Spectrum");
  assert.equal(spectrumCourse.level, "Sovereign Architect");

  const module1 = spectrumCourse.modules[0];
  assert.ok(module1, "Spectrum course must have module 1");
  assert.equal(module1.lessons.length, 8, "Must have exactly 8 lessons matching the infographic");

  const expectedLessonIds = [
    "ai-l1-umbrella",
    "ai-l2-ml",
    "ai-l3-dl",
    "ai-l4-genai",
    "ai-l5-llms",
    "ai-l6-rag",
    "ai-l7-agentic",
    "ai-l8-modern-concepts",
  ];

  for (let i = 0; i < expectedLessonIds.length; i++) {
    const lesson = module1.lessons[i];
    assert.equal(lesson.id, expectedLessonIds[i], `Lesson index ${i} ID mismatch`);
    assert.ok(lesson.title.length > 5, `Lesson ${lesson.id} must have descriptive title`);
    assert.ok(lesson.concept.length > 20, `Lesson ${lesson.id} must have in-depth concept text`);
    assert.ok(lesson.codeSnippet.length > 10, `Lesson ${lesson.id} must have executable code snippet`);
    assert.ok(lesson.quiz.options.length >= 2, `Lesson ${lesson.id} quiz must have >= 2 choices`);
    assert.ok(lesson.quiz.explanation.length > 10, `Lesson ${lesson.id} quiz must have educational explanation`);
    assert.ok(lesson.xpReward >= 100, `Lesson ${lesson.id} must reward >= 100 XP`);
  }
});
