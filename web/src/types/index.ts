export type SetKind = 'normal' | 'warmup' | 'drop' | 'failure' | 'restPause';

export interface Exercise {
  id: string;
  name: string;
  primary: string;
  secondary: string[];
  equipment: string;
  difficulty: string;
  art: string;
  steps: string[];
  mode?: string;
  isCustom?: boolean;
}

export interface SessionSet {
  id: string;
  reps: number;
  weight: number;
  done: boolean;
  kind: SetKind;
  rpe?: number;
  sec?: number;
  km?: number;
  previous?: { weight: number; reps: number };
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  name: string;
  primary: string;
  sets: SessionSet[];
  notes?: string;
  linkedNext?: boolean;
}

export interface ActiveSession {
  startTime: number;
  elapsedSeconds: number;
  isPaused: boolean;
  exercises: SessionExercise[];
  currentExerciseIndex: number;
  restEndsAt: number | null;
  restTotalSeconds: number;
  routineId?: string;
  routineName?: string;
}

export interface LoggedSet {
  reps: number;
  weight: number;
  kind: SetKind;
  rpe?: number;
  sec?: number;
  km?: number;
}

export interface LoggedExercise {
  id: string;
  name: string;
  primary: string;
  sets: LoggedSet[];
}

export interface LoggedSession {
  id: string;
  date: string; // ISO string
  durationSec: number;
  exercises: LoggedExercise[];
  volume: number;
  setCount: number;
  routineName?: string;
}

export interface Routine {
  id: string;
  name: string;
  group: string;
  color: string;
  exerciseIds: string[];
  setsCount?: Record<string, number>;
  plannedSets?: Record<string, { reps: number; weight: number; kind: SetKind }[]>;
}

export interface BodyweightEntry {
  id: string;
  date: string;
  kg: number;
}

export interface BodyMeasure {
  id: string;
  date: string;
  part: string;
  val: number;
}

export interface GymNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

export type CoachPersonality = 'marine' | 'stoic' | 'coach' | 'aurelia';

export interface OnboardingAnswers {
  gender: 'male' | 'female';
  name?: string;
  callsign?: string;
  focus: 'combat' | 'hypertrophy' | 'strength' | 'athletic' | 'glute_waist' | 'pilates_tone';
  experience: 'recruit' | 'intermediate' | 'veteran';
  equipment: 'full_gym' | 'barbell_home' | 'dumbbells' | 'bodyweight';
  frequency?: 3 | 4 | 5 | 6;
  workoutTime?: string;
  fasting?: '16_8' | '20_4' | 'omad' | 'standard';
  personality: CoachPersonality;
}

export interface AthleteAccount {
  id: string;
  name: string;
  callsign: string;
  role: string;
  personality: CoachPersonality;
  gender?: 'male' | 'female';
  createdDate: string;
}

export interface Profile {
  name: string;
  bio: string;
  heightCm: number;
  targetWeightKg: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';
  callsign?: string;
  serviceBranch?: string;
}

export interface Settings {
  theme: 'dark' | 'amoled' | 'warm' | 'light';
  units: 'kg' | 'lb';
  soundEnabled: boolean;
  defaultRestSec: number;
  heatTone: 'ember' | 'green' | 'blue' | 'mono' | 'rose';
  language: string;
  coachPersonality: CoachPersonality;
  gender?: 'male' | 'female';
  activeProfileId: string;
  onboardingCompleted: boolean;
}

export type EventCategory = 'workout' | 'meal' | 'task' | 'recovery' | 'sleep' | 'habit';

export interface ScheduledEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  title: string;
  category: EventCategory;
  tier?: 1 | 2 | 3 | 4 | 5;
  citation?: string;
  completed: boolean;
  routineId?: string;
  calories?: number;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  sodiumMg?: number;
  loggedAt?: string; // HH:mm
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  fastingHours: number;
  fastingProtocol: 'omad' | '16_8' | '20_4' | 'standard';
  fastStartTime?: string; // HH:mm
}

export const MUSCLES = [
  { id: 'chest', label: 'Chest', view: 'front', group: 'Chest' },
  { id: 'shoulders', label: 'Shoulders', view: 'front', group: 'Shoulders' },
  { id: 'biceps', label: 'Biceps', view: 'front', group: 'Arms' },
  { id: 'forearm', label: 'Forearm', view: 'front', group: 'Arms' },
  { id: 'abdomen', label: 'Abdomen', view: 'front', group: 'Core' },
  { id: 'obliques', label: 'Obliques', view: 'front', group: 'Core' },
  { id: 'quads', label: 'Quads', view: 'front', group: 'Legs' },
  { id: 'trapezius', label: 'Trapezius', view: 'back', group: 'Back' },
  { id: 'back', label: 'Back', view: 'back', group: 'Back' },
  { id: 'triceps', label: 'Triceps', view: 'back', group: 'Arms' },
  { id: 'glutes', label: 'Glutes', view: 'back', group: 'Legs' },
  { id: 'hamstrings', label: 'Hamstrings', view: 'back', group: 'Legs' },
  { id: 'calves', label: 'Calves', view: 'back', group: 'Legs' },
] as const;
