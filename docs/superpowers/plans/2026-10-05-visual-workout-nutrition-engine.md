# Visual Workout & Tactical Nutrition Blueprint Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Stoic Body workouts, nutrition, symptom remedies, and schedule from dry text lists into addictive, high-fidelity visual blueprints (illustrated muscle heatmaps, tactical lined-notebook meal plans, comic-style biohacks, and an in-app AI visual generator).

**Architecture:** A modular React/Next.js frontend backed by typed blueprint libraries (`workout-blueprints.ts`, `nutrition-notebook.ts`, `biohacks.ts`), high-resolution visual assets stored in `public/assets/blueprints/`, interactive tracking components with tap-to-complete sets and instant macro logging, and a Gemini multimodal AI API route for on-demand personalized visual generation.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, Vitest, Google Gemini API.

**Spec:** `docs/superpowers/specs/2026-10-05-visual-workout-nutrition-engine-design.md`

## Global Constraints
- Responsive desktop & mobile views with high contrast dark mode aesthetic (black, gold, crimson).
- Offline-first fallback: built-in curated blueprint assets load instantly without waiting for API keys or network requests.
- TDD required: core blueprint lookups, set completion calculations, and macro math must have passing Vitest unit tests.
- Zero TypeScript errors (`npm run typecheck` must pass).

## Review Focus
1. Workout set tracking persists across sessions in localStorage without losing completed state.
2. Notebook diet macro values dynamically scale based on user's calibrated Mifflin-St Jeor daily calories.
3. Biohack symptom guides load instantly with actionable dosages, timing, and comic visual guides.
4. AI generator gracefully falls back to built-in curated blueprints if API key is missing or network times out.
5. Desktop standalone app displays the new visual sheets seamlessly without layout shifting.

---

### Task 1: Core Blueprint Data Registries & Tests

**Files:**
- Create: `src/lib/workout-blueprints.ts`
- Create: `src/lib/nutrition-notebook.ts`
- Create: `src/lib/biohacks.ts`
- Test: `tests/core/blueprints.test.ts`

**Interfaces:**
- Produces: `getWorkoutBlueprint(id: string): WorkoutBlueprint | undefined`
- Produces: `getNutritionNotebook(goal: string, targetCalories: number): NotebookDietPlan`
- Produces: `getBiohackRemedy(symptomId: string): BiohackRemedy | undefined`

- [ ] **Step 1: Write the failing unit tests in `tests/core/blueprints.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement data structures and lookup functions**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: High-Resolution Visual Assets Integration

**Files:**
- Create: `public/assets/blueprints/push-day.jpg`
- Create: `public/assets/blueprints/pull-day.jpg`
- Create: `public/assets/blueprints/notebook-diet.jpg`
- Create: `public/assets/blueprints/bloating-ginger.jpg`

- [ ] **Step 1: Copy verified generated assets from brain directory into `public/assets/blueprints/`**
- [ ] **Step 2: Verify asset presence and public accessibility via Node script**
- [ ] **Step 3: Commit**

---

### Task 3: Interactive Workout Blueprint Component

**Files:**
- Create: `src/components/WorkoutBlueprintCard.tsx`
- Modify: `src/app/training/page.tsx`
- Modify: `src/app/page.tsx` (Today dashboard routine item)

- [ ] **Step 1: Build `WorkoutBlueprintCard.tsx` with sheet illustration, anatomical muscle callouts, sets × reps notation, and interactive set check-off pills**
- [ ] **Step 2: Connect set completion to XP awards and localStorage state**
- [ ] **Step 3: Embed interactive blueprint card into Training Studio and Today Dashboard**
- [ ] **Step 4: Verify rendering and test interactions**
- [ ] **Step 5: Commit**

---

### Task 4: Tactical Field-Notebook Nutrition Component

**Files:**
- Create: `src/components/FieldNotebookDietCard.tsx`
- Modify: `src/app/nutrition/page.tsx`
- Modify: `src/app/page.tsx` (Today dashboard feeding window card)

- [ ] **Step 1: Build `FieldNotebookDietCard.tsx` with lined notebook styling, Roman numerals I-VII, portion weights, and boxed macro summary card**
- [ ] **Step 2: Add quick-log action for individual Roman numeral meals**
- [ ] **Step 3: Integrate into Nutrition Hub and Today Dashboard**
- [ ] **Step 4: Verify rendering and test macro synchronization**
- [ ] **Step 5: Commit**

---

### Task 5: Illustrated Symptom Biohack Guide Modal ("Stoic Apothecary")

**Files:**
- Create: `src/components/BiohackGuideModal.tsx`
- Modify: `src/app/nutrition/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build `BiohackGuideModal.tsx` displaying the warm comic artwork, symptom trigger, protocol, and ingredient dosages**
- [ ] **Step 2: Add quick symptom remedy buttons (Bloating, Soreness, Energy Crash, Cravings, Sleep) to Nutrition Hub and Dashboard**
- [ ] **Step 3: Test modal open/close and remedy display**
- [ ] **Step 4: Commit**

---

### Task 6: In-App AI Visualizer Studio

**Files:**
- Create: `src/app/api/generate-visual/route.ts`
- Create: `src/components/AIVisualStudioModal.tsx`
- Modify: `src/app/progress/page.tsx`
- Modify: `src/components/HostOnboardingModal.tsx`

- [ ] **Step 1: Build API route accepting prompt parameters (gender, goal, archetype, meal/exercise) and returning generated illustration**
- [ ] **Step 2: Build `AIVisualStudioModal.tsx` allowing users to generate custom workout & diet cards**
- [ ] **Step 3: Integrate into Progress studio and Onboarding calibration HUD**
- [ ] **Step 4: Test API endpoint and UI generator**
- [ ] **Step 5: Commit**

---

### Task 7: Full E2E Build, Verification, & Production Deployment

**Files:**
- Run: `npm run typecheck`
- Run: `npm test`
- Run: `npm run build`
- Run: `vercel --scope stoic-dev-team --prod --yes`

- [ ] **Step 1: Run typecheck and unit tests**
- [ ] **Step 2: Compile production Next.js build**
- [ ] **Step 3: Deploy to Vercel production and verify HTTP 200 OK**
- [ ] **Step 4: Capture fresh Playwright screenshots of the live visual cards**
- [ ] **Step 5: Commit & Push to GitHub main**
