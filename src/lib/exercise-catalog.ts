import exerciseData from "./exercise-catalog-data.json";

export interface ExerciseItem {
  id: string;
  name: string;
  primary: string;
  secondary: string[];
  equipment: string;
  difficulty: string;
  art?: string;
  steps: string[];
}

export const ALL_EXERCISES: ExerciseItem[] = exerciseData as ExerciseItem[];

export const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", view: "front", icon: "🛡️" },
  { id: "shoulders", label: "Shoulders", view: "both", icon: "⚔️" },
  { id: "biceps", label: "Biceps", view: "front", icon: "💪" },
  { id: "triceps", label: "Triceps", view: "back", icon: "⚡" },
  { id: "forearm", label: "Forearms", view: "both", icon: "✊" },
  { id: "abdomen", label: "Abs & Core", view: "front", icon: "🏛️" },
  { id: "obliques", label: "Obliques", view: "front", icon: "🔥" },
  { id: "back", label: "Back & Lats", view: "back", icon: "🦅" },
  { id: "trapezius", label: "Traps", view: "back", icon: "🏔️" },
  { id: "glutes", label: "Glutes", view: "back", icon: "🗿" },
  { id: "quads", label: "Quads", view: "front", icon: "🦵" },
  { id: "hamstrings", label: "Hamstrings", view: "back", icon: "🏹" },
  { id: "calves", label: "Calves", view: "both", icon: "⚡" },
];

export function getExercisesForMuscles(muscles: string[]): ExerciseItem[] {
  if (!muscles || muscles.length === 0) return ALL_EXERCISES.slice(0, 50);
  const normalized = muscles.map(m => m.toLowerCase());
  return ALL_EXERCISES.filter(ex => 
    normalized.includes(ex.primary.toLowerCase()) ||
    ex.secondary.some(s => normalized.includes(s.toLowerCase()))
  );
}

export function getExerciseById(id: string): ExerciseItem | undefined {
  return ALL_EXERCISES.find(e => e.id === id || e.name.toLowerCase() === id.toLowerCase());
}
