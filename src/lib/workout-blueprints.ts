export interface ExerciseBlueprint {
  id: string;
  name: string;
  targetMuscleGroups: string[];
  sets: number;
  repsRange: string;
  rpeTarget: number;
  illustrationUrl: string;
  notes?: string;
}

export interface WorkoutBlueprint {
  id: string;
  title: string;
  subtitle: string;
  sheetIllustrationUrl: string;
  exercises: ExerciseBlueprint[];
  cardioFinisher?: {
    name: string;
    durationMin: number;
    intensity: string;
  };
}

export const WORKOUT_BLUEPRINTS: Record<string, WorkoutBlueprint> = {
  push: {
    id: "push",
    title: "Day 1 -> Push",
    subtitle: "Incline Press · Machine Press · Lateral Raises · Triceps · Treadmill",
    sheetIllustrationUrl: "/assets/blueprints/push-day.jpg",
    exercises: [
      {
        id: "push-1",
        name: "Incline Chest Press",
        targetMuscleGroups: ["Upper Chest", "Front Delts"],
        sets: 3,
        repsRange: "5–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/push-day.jpg",
        notes: "30-degree incline, control the 3-second eccentric stretch",
      },
      {
        id: "push-2",
        name: "Machine Chest Press",
        targetMuscleGroups: ["Mid/Lower Pectorals", "Triceps"],
        sets: 2,
        repsRange: "8–10 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/push-day.jpg",
        notes: "Drive through the palms, squeeze at peak contraction",
      },
      {
        id: "push-3",
        name: "Seated Shoulder Press",
        targetMuscleGroups: ["Anterior Delts", "Lateral Delts"],
        sets: 2,
        repsRange: "6–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/push-day.jpg",
        notes: "Keep wrists aligned above elbows, do not flare wide",
      },
      {
        id: "push-4",
        name: "Cable Lateral Raises",
        targetMuscleGroups: ["Lateral Deltoid", "Shoulder Cap"],
        sets: 4,
        repsRange: "12–15 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/push-day.jpg",
        notes: "Constant cable tension, lead with elbows up to collarbone height",
      },
      {
        id: "push-5",
        name: "Overhead Cable Tricep Extension",
        targetMuscleGroups: ["Triceps (Long Head)"],
        sets: 3,
        repsRange: "10–12 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/push-day.jpg",
        notes: "Deep overhead stretch, lock out cleanly without flaring",
      },
      {
        id: "push-6",
        name: "Rope Pushdown",
        targetMuscleGroups: ["Triceps (Lateral & Medial Heads)"],
        sets: 2,
        repsRange: "12–15 reps",
        rpeTarget: 9.5,
        illustrationUrl: "/assets/blueprints/push-day.jpg",
        notes: "Spread the rope at the bottom, pause for 1 second",
      },
    ],
    cardioFinisher: {
      name: "Incline Treadmill Walk",
      durationMin: 20,
      intensity: "12% Incline · 3.0 MPH · Zone 2 Aerobic Fat Burn",
    },
  },
  pull: {
    id: "pull",
    title: "Day 2 -> Pull",
    subtitle: "Lat Pulldown · T-Bar Row · Cable Row · Rear Delts · Curls · Cycling",
    sheetIllustrationUrl: "/assets/blueprints/pull-day.jpg",
    exercises: [
      {
        id: "pull-1",
        name: "Neutral Grip Lat Pulldown",
        targetMuscleGroups: ["Latissimus Dorsi", "Biceps"],
        sets: 3,
        repsRange: "5–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
        notes: "Pull elbows down into front pockets, chest proud",
      },
      {
        id: "pull-2",
        name: "Chest-Supported T-Bar Rows",
        targetMuscleGroups: ["Rhomboids", "Middle Traps", "Lats"],
        sets: 3,
        repsRange: "6–8 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
        notes: "Retract scapulae fully at top, zero lower back swing",
      },
      {
        id: "pull-3",
        name: "Single-Arm Cable Rows",
        targetMuscleGroups: ["Lats", "Teres Major"],
        sets: 2,
        repsRange: "10–12 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
        notes: "Rotate torso slightly to maximize lat stretch and contraction",
      },
      {
        id: "pull-4",
        name: "Reverse Pec Deck Flyes",
        targetMuscleGroups: ["Posterior Deltoids", "Rhomboids"],
        sets: 3,
        repsRange: "12–15 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
        notes: "Keep elbows slightly bent, drive backwards through knuckles",
      },
      {
        id: "pull-5",
        name: "Incline Dumbbell Bicep Curls",
        targetMuscleGroups: ["Biceps Brachii (Long Head)"],
        sets: 3,
        repsRange: "8–10 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
        notes: "Full extension at bottom, supinate at top of curl",
      },
      {
        id: "pull-6",
        name: "Hammer Curls",
        targetMuscleGroups: ["Brachialis", "Forearms"],
        sets: 2,
        repsRange: "10–12 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
        notes: "Strict upright posture, heavy controlled cadence",
      },
    ],
    cardioFinisher: {
      name: "Cycling Cardio Finisher",
      durationMin: 18,
      intensity: "Moderate RPM · Low Impact Recovery Aerobics",
    },
  },
  legs: {
    id: "legs",
    title: "Day 3 -> Legs",
    subtitle: "Squats · Romanian Deadlift · Leg Press · Curls · Calves",
    sheetIllustrationUrl: "/assets/blueprints/pull-day.jpg",
    exercises: [
      {
        id: "legs-1",
        name: "Barbell Back Squats",
        targetMuscleGroups: ["Quadriceps", "Glutes"],
        sets: 3,
        repsRange: "5–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
      },
      {
        id: "legs-2",
        name: "Romanian Deadlift",
        targetMuscleGroups: ["Hamstrings", "Gluteus Maximus"],
        sets: 3,
        repsRange: "6–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
      },
      {
        id: "legs-3",
        name: "Leg Press",
        targetMuscleGroups: ["Quadriceps", "Adductors"],
        sets: 2,
        repsRange: "10–12 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
      },
      {
        id: "legs-4",
        name: "Lying Leg Curls",
        targetMuscleGroups: ["Hamstrings"],
        sets: 3,
        repsRange: "10–12 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
      },
      {
        id: "legs-5",
        name: "Standing Calf Raises",
        targetMuscleGroups: ["Gastrocnemius", "Soleus"],
        sets: 4,
        repsRange: "10–15 reps",
        rpeTarget: 9.5,
        illustrationUrl: "/assets/blueprints/pull-day.jpg",
      },
    ],
    cardioFinisher: {
      name: "Treadmill Walk",
      durationMin: 12,
      intensity: "Incline 8% · 2.8 MPH Flush",
    },
  },
};

export function getWorkoutBlueprint(id: string): WorkoutBlueprint | undefined {
  const normalized = id.toLowerCase().trim();
  if (normalized.includes("push") || normalized.includes("chest")) return WORKOUT_BLUEPRINTS.push;
  if (normalized.includes("pull") || normalized.includes("back")) return WORKOUT_BLUEPRINTS.pull;
  if (normalized.includes("leg") || normalized.includes("squat")) return WORKOUT_BLUEPRINTS.legs;
  return WORKOUT_BLUEPRINTS.push;
}
