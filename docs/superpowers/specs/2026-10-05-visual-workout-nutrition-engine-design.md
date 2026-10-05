# Visual Workout & Tactical Nutrition Blueprint Engine Design

## Overview
This specification details the transformation of Stoic Body's workouts, nutrition, daily schedules, and symptom remedies from dry text lists into an addictive, visual-first sovereign operating system matching the user's reference designs:
1. **Visual Muscle-Heatmap Workout Blueprints**: Illustrated Push, Pull, Legs, Calisthenics, and Boxing routines with glowing crimson-red anatomical muscle highlights, exact sets x reps (`[3 sets × 5–8 reps]`), and interactive tap-to-complete set tracking pills.
2. **Tactical Field-Notebook Nutrition**: Lined notebook styling with Roman numerals (`I Breakfast` to `VII Night-Recovery`), portion gram weights, and a distinct boxed daily macro summary card.
3. **Illustrated Symptom Biohacks ("Stoic Apothecary")**: Two-panel comic-style remedies for real-world friction (Bloating $\to$ Ginger, Soreness $\to$ Tart Cherry + Magnesium, Energy crash $\to$ Salt/Lemon water, etc.).
4. **Autonomous In-App AI Visualizer**: An on-demand generator powered by the Gemini multimodal API that allows users to generate personalized illustrated workout cards, meal blueprints, and physique milestone cards featuring their likeness directly into their schedule.

---

## 1. Visual Workout Architecture & Anatomy Highlighting

### 1.1 Workout Blueprint Registry
Workouts are stored as structured blueprints in `src/lib/workout-blueprints.ts`:
* **Push Day (Chest, Delts, Triceps)**: Incline Smith/Dumbbell Press, Machine Chest Press, Seated Shoulder Press, Cable Lateral Raises, Overhead Cable Tricep Extension, Rope Pushdown, Incline Treadmill Finisher.
* **Pull Day (Lats, Upper Back, Biceps)**: Neutral Grip Lat Pulldown, Chest-Supported T-Bar Rows, Single-Arm Cable Rows, Reverse Pec Deck Flyes, Incline Dumbbell Curls, Hammer Curls, Cycling Cardio Finisher.
* **Leg Day & Athletic Power (Quads, Hamstrings, Glutes, Calves)**: Barbell Squats, Romanian Deadlifts, Leg Press, Lying/Seated Leg Curls, Leg Extensions, Standing Calf Raises, Treadmill Incline Walk.
* **Sovereign Calisthenics & Boxing (Core, Back, Striking)**: Strict Overhand Pull-Ups, Parallel Bar Dips, Hanging Leg Raises, Push-Up Ladders, 6-Round Boxing Strike Interval Deck.

### 1.2 Data Structure
```typescript
export interface ExerciseBlueprint {
  id: string;
  name: string;
  targetMuscleGroups: string[]; // e.g. ["Chest (Upper)", "Front Delts", "Triceps"]
  sets: number;
  repsRange: string; // e.g. "5-8 reps"
  rpeTarget: number; // e.g. 8.5
  illustrationUrl: string; // generated blueprint asset or SVG schematic
  cardioTimeMin?: number;
}

export interface WorkoutBlueprint {
  id: string;
  title: string; // e.g. "Day 1 -> Push"
  subtitle: string;
  sheetIllustrationUrl: string;
  exercises: ExerciseBlueprint[];
  cardioFinisher?: {
    name: string;
    durationMin: number;
    intensity: string;
  };
}
```

### 1.3 Interactive Component: `WorkoutBlueprintCard.tsx`
* Renders the high-definition illustrated sheet.
* Provides interactive set pills `[S1] [S2] [S3]` that toggle active/done status and award XP upon full exercise completion.
* Expandable modal / full-view showing the high-resolution blueprint.

---

## 2. Tactical Field-Notebook Nutrition

### 2.1 Notebook Schema & Data
Located in `src/lib/nutrition-notebook.ts`:
* **Roman Numeral Meals**:
  * `I Breakfast`: Protein source + egg whites + black coffee.
  * `II Afternoon Fuel`: High-protein yogurt / chia pudding / oats + berries.
  * `III Sovereign Feast (Lunch)`: Clean lean meat + complex carb + steamed greens.
  * `IV Pre-Workout`: Fast carbs + black coffee + sodium booster (pink salt).
  * `V Post-Workout`: Fast-digesting protein + creatine + high-glycemic fruit.
  * `VI Dinner`: Whole eggs / healthy fats / fiber.
  * `VII Night-Recovery`: Slow-digesting casein / cottage cheese / magnesium.
* **Boxed Macro Totals**: Calories, Protein, Carbs, Fats, Fiber dynamically synchronized with the user's calibrated Mifflin-St Jeor daily targets.

### 2.2 Interactive Component: `FieldNotebookDietCard.tsx`
* Styled with notebook lined-paper textures, authentic ink typography, and custom borders.
* Includes an "Instant Log Meal" action next to each Roman numeral to increment daily logged totals and award XP.

---

## 3. Illustrated Symptom Biohacks ("Stoic Apothecary")

### 3.1 Biohacks Registry
Located in `src/lib/biohacks.ts`:
1. **Bloating & Gut Distension**: Fresh Ginger Root + Warm Lemon Water Infusion.
2. **Delayed Onset Muscle Soreness (DOMS)**: Tart Cherry Extract + 400mg Magnesium Glycinate.
3. **Midday Cognitive Fatigue**: 24oz Cold Water + Himalayan Salt + Lemon Elixir.
4. **Sugar Cravings During Deficit**: Sparkling Mineral Water + 1 tbsp Apple Cider Vinegar + Cinnamon.
5. **High Evening Cortisol & Insomnia**: Chamomile Tea + 200mg L-Theanine + 10m NSDR Protocol.

### 3.2 Component: `BiohackGuideModal.tsx`
* Renders the warm, two-panel comic artwork for each symptom.
* Allows users to tap "I have this issue" from the Dashboard or Nutrition page to receive the exact protocol, ingredient grams, and scientific mechanism.

---

## 4. Autonomous In-App AI Visualizer Studio

### 4.1 Architecture
* API Route: `src/app/api/generate-visual/route.ts`
* Uses Google Gemini multimodal capabilities (`gemini-2.5-flash` / `imagen-3.0-generate-002`) to generate custom illustrated workout sheets, meal plates, and user physique visualizations.
* Automatically includes user preferences (Gender, Goal, Calisthenics vs Weights, Target body fat %) in generation prompts.
* Saves generated assets to localStorage and IndexedDB with fallback to curated high-resolution built-in blueprints.

---

## 5. Desktop Application Integration
* Windows shortcuts (`Stoic Body Desktop.lnk` and `Stoic Body.lnk`) are bound to Chrome/Edge in standalone app mode with the verified gold shield icon (`assets/brand/stoic-body.ico`).
* Zero PowerShell execution required.
