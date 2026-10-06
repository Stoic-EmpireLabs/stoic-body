export interface FormCues {
  setup: string;
  execution: string;
  mistakeAvoid: string;
  restSecs: number;
}

export interface ExerciseBlueprint {
  id: string;
  name: string;
  targetMuscleGroups: string[];
  sets: number;
  repsRange: string;
  rpeTarget: number;
  illustrationUrl: string;
  notes?: string;
  formCues?: FormCues;
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
        formCues: {
          setup: "Set bench to 30° incline. Pinch shoulder blades down and back into pad. Feet planted flat.",
          execution: "Lower under control (3s descent) to upper clavicle. Drive upward towards eye level without unlocking scapulae.",
          mistakeAvoid: "Flaring elbows to 90° or bouncing weights off chest. Keep elbows tucked at 45–60°.",
          restSecs: 90,
        },
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
        formCues: {
          setup: "Seat height adjusted so handles align with mid-nipple line. Back flush to pad.",
          execution: "Drive through the heels of hands. Hold the peak contraction squeeze for a solid 1 second.",
          mistakeAvoid: "Shrugging shoulders into traps or letting elbows hyperextend behind body on return.",
          restSecs: 75,
        },
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
        formCues: {
          setup: "Upright back support at 80–85°. Dumbbells or handles starting at ear level.",
          execution: "Press overhead in a controlled convergence path. Keep ribcage locked down.",
          mistakeAvoid: "Excessive lower back arching. If ribcage flares up, reduce weight immediately.",
          restSecs: 90,
        },
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
        formCues: {
          setup: "Pulley set to wrist/hip level. Stand tall or lean 15° away from column.",
          execution: "Lead with elbows out and slightly forward in the scapular plane (30° forward).",
          mistakeAvoid: "Using torso heave or swinging hips. Isolate pure lateral delt.",
          restSecs: 60,
        },
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
        formCues: {
          setup: "High/mid pulley with rope. Staggered stance, torso angled forward 30°.",
          execution: "Elbows held stationary near temples. Flare forearms outward at lockout.",
          mistakeAvoid: "Letting elbows drift wildly or using torso momentum.",
          restSecs: 60,
        },
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
        formCues: {
          setup: "High pulley with rope. Slight forward hip hinge, elbows pinned to ribs.",
          execution: "Push downwards until arms are straight, spreading ropes apart at bottom.",
          mistakeAvoid: "Allowing elbows to ride forward on the eccentric return.",
          restSecs: 60,
        },
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
        formCues: {
          setup: "Thigh pad locked firm. Use neutral-grip V-bar or attachment.",
          execution: "Depress scapulae, driving elbows straight down into hips. Proud chest.",
          mistakeAvoid: "Rocking backwards past 15° or yanking with biceps instead of lats.",
          restSecs: 90,
        },
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
        formCues: {
          setup: "Chest firmly on pad, feet braced. Neutral or semi-pronated grip.",
          execution: "Pull elbows past torso line, pinching shoulder blades together tightly.",
          mistakeAvoid: "Heaving chest off the pad to start the rep. Keep ribs glued to pad.",
          restSecs: 90,
        },
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
        formCues: {
          setup: "Cable set at belly-button level. Staggered stance with opposite leg forward.",
          execution: "Reach forward for deep lat stretch, row to hip crease while rotating wrist.",
          mistakeAvoid: "Twisting lower back violently. Motion occurs in thoracic spine and lat.",
          restSecs: 60,
        },
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
        formCues: {
          setup: "Adjust seat so handles are at eye/shoulder level. Chest against pad.",
          execution: "Squeeze rear delts backwards with micro-bent elbows. 1s pause at peak.",
          mistakeAvoid: "Using triceps extension to push handles back. Keep arm angle fixed.",
          restSecs: 60,
        },
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
        formCues: {
          setup: "Bench at 45–55°. Arms hanging fully perpendicular to floor.",
          execution: "Curl dumbbells up while turning wrists outward (supination) at top.",
          mistakeAvoid: "Swinging elbows forward to engage front delts. Keep upper arms still.",
          restSecs: 60,
        },
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
        formCues: {
          setup: "Palms facing inward towards thighs. Stand tall, core braced.",
          execution: "Curl straight up without rotating wrists. Control the negative descent.",
          mistakeAvoid: "Using hip thrust momentum. Stand against a wall if cheating occurs.",
          restSecs: 60,
        },
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
    sheetIllustrationUrl: "/assets/blueprints/legs-day.jpg",
    exercises: [
      {
        id: "legs-1",
        name: "Barbell Back Squats",
        targetMuscleGroups: ["Quadriceps", "Glutes"],
        sets: 3,
        repsRange: "5–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/legs-day.jpg",
        notes: "Full depth at parallel, drive through midfoot",
        formCues: {
          setup: "Bar across traps, hands snug. Feet shoulder-width, toes angled 15–30° out.",
          execution: "Inhale, brace 360°, sit down between hips. Break parallel, explode through midfoot.",
          mistakeAvoid: "Knees collapsing inward (valgus) or chest caving forward into a 'good morning'.",
          restSecs: 120,
        },
      },
      {
        id: "legs-2",
        name: "Romanian Deadlift",
        targetMuscleGroups: ["Hamstrings", "Gluteus Maximus"],
        sets: 3,
        repsRange: "6–8 reps",
        rpeTarget: 8.5,
        illustrationUrl: "/assets/blueprints/legs-day.jpg",
        notes: "Hips back, barbell glued to shins",
        formCues: {
          setup: "Stand with bar at hips. Soft knee bend (15°). Scapulae locked.",
          execution: "Push hips straight back like touching a wall. Bar stays against shins. Squeeze glutes at top.",
          mistakeAvoid: "Rounding the lower spine or squatting down. This is a pure hip hinge.",
          restSecs: 90,
        },
      },
      {
        id: "legs-3",
        name: "Leg Press",
        targetMuscleGroups: ["Quadriceps", "Adductors"],
        sets: 2,
        repsRange: "10–12 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/legs-day.jpg",
        notes: "Control depth, do not round tailbone off pad",
        formCues: {
          setup: "Butt and lower back flat against pad. Feet shoulder-width mid-sled.",
          execution: "Lower sled under 3s tempo until knees reach 90°. Press through whole foot.",
          mistakeAvoid: "Hyperextending and locking out knees violently at the top.",
          restSecs: 90,
        },
      },
      {
        id: "legs-4",
        name: "Lying Leg Curls",
        targetMuscleGroups: ["Hamstrings"],
        sets: 3,
        repsRange: "10–12 reps",
        rpeTarget: 9.0,
        illustrationUrl: "/assets/blueprints/legs-day.jpg",
        notes: "Hips stay glued to pad, squeeze hamstrings",
        formCues: {
          setup: "Pad sits just below calves. Hips firmly pressed down into bench.",
          execution: "Curl up towards glutes with 1-second squeeze at top. 3s eccentric return.",
          mistakeAvoid: "Allowing butt/hips to rise up off the bench during the curl.",
          restSecs: 60,
        },
      },
      {
        id: "legs-5",
        name: "Standing Calf Raises",
        targetMuscleGroups: ["Gastrocnemius", "Soleus"],
        sets: 4,
        repsRange: "10–15 reps",
        rpeTarget: 9.5,
        illustrationUrl: "/assets/blueprints/legs-day.jpg",
        notes: "2-second deep stretch at bottom, explosive rise",
        formCues: {
          setup: "Balls of feet on edge of platform. Knees locked straight.",
          execution: "Sink heels down into full 2s stretch, then explode onto big toes for 1s squeeze.",
          mistakeAvoid: "Bouncing up and down quickly without bottom stretch pause.",
          restSecs: 45,
        },
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
