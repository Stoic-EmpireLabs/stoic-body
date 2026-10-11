import { useState, useEffect } from 'react';
import allExercisesData from '../data/exercises.json';
import defaultPrograms from '../data/programs.json';
import { AWARDS } from '../data/awards';
import { sound } from '../services/sound';
import type {
  Exercise,
  ActiveSession,
  LoggedSession,
  LoggedExercise,
  LoggedSet,
  Routine,
  BodyweightEntry,
  BodyMeasure,
  GymNote,
  Profile,
  Settings,
  SetKind,
  SessionExercise,
  SessionSet,
  CoachPersonality,
  OnboardingAnswers,
  AthleteAccount,
  ScheduledEvent,
  MealEntry,
  NutritionTargets,
  EventCategory,
} from '../types';
import { getRandomQuote, type StoicQuote } from '../data/stoicQuotes';
import {
  generateDefaultSchedule,
  generateEventsForDate,
  defaultMealsToday,
  defaultNutritionTargets,
  getLocalDateString,
} from '../data/defaultSchedule';
import { generateCustomPlan } from '../utils/planGenerator';

export const allBuiltinExercises: Exercise[] = allExercisesData as Exercise[];

const STORAGE_KEY = 'stoic_community_v1';

export type RouteName =
  | 'home'
  | 'schedule'
  | 'nutrition'
  | 'train'
  | 'session'
  | 'progress'
  | 'exercises'
  | 'exercise-detail'
  | 'routines'
  | 'routine-edit'
  | 'tools'
  | 'tool-detail'
  | 'awards'
  | 'timeline'
  | 'measures'
  | 'notes'
  | 'settings'
  | 'about'
  | 'profile';

interface GymState {
  route: RouteName;
  routeStack: RouteName[];
  selectedMuscles: string[];
  sessionPicks: string[];
  activeExerciseId: string | null;
  activeRoutineId: string | null;
  activeToolId: string | null;
  session: ActiveSession | null;
  sessions: LoggedSession[];
  routines: Routine[];
  weeklyPlan: Record<number, string>;
  favorites: Record<string, boolean>;
  customExercises: Exercise[];
  bodyweight: BodyweightEntry[];
  measures: BodyMeasure[];
  notes: GymNote[];
  profile: Profile;
  settings: Settings;
  unlockedAwards: string[];
  latestAwardUnlocked: string | null;
  coachPersonality: CoachPersonality;
  activeProfileId: string;
  athleteAccounts: AthleteAccount[];
  onboardingDone: boolean;
  showOnboarding: boolean;
  showLoginModal: boolean;
  onboardingAnswers: OnboardingAnswers | null;
  currentQuote: StoicQuote;
  scheduledEvents: ScheduledEvent[];
  meals: MealEntry[];
  nutritionTargets: NutritionTargets;
  waterMl: number;
}

const defaultAthleteAccounts: AthleteAccount[] = [
  {
    id: 'athlete-female',
    name: 'Sophia',
    callsign: 'Aurelia',
    role: 'Empress / Female Athlete',
    personality: 'aurelia',
    gender: 'female',
    createdDate: new Date().toISOString(),
  },
  {
    id: 'athlete-male',
    name: 'Marcus',
    callsign: 'Spartan',
    role: 'Spartan / Tactical Athlete',
    personality: 'marine',
    gender: 'male',
    createdDate: new Date().toISOString(),
  },
];

const defaultPlan = generateCustomPlan(
  {
    gender: 'female',
    name: 'Sophia',
    callsign: 'Aurelia',
    focus: 'glute_waist',
    experience: 'intermediate',
    equipment: 'full_gym',
    frequency: 4,
    workoutTime: '07:30',
    fasting: '16_8',
    personality: 'aurelia',
  },
  allBuiltinExercises
);

const defaultRoutines: Routine[] = defaultPlan.routines;

const defaultState: GymState = {
  route: 'home',
  routeStack: [],
  selectedMuscles: [],
  sessionPicks: [],
  activeExerciseId: null,
  activeRoutineId: null,
  activeToolId: null,
  session: null,
  sessions: [],
  routines: defaultPlan.routines,
  weeklyPlan: defaultPlan.weeklyPlan,
  favorites: {},
  customExercises: [],
  bodyweight: [],
  measures: [],
  notes: [
    {
      id: 'note-welcome',
      title: 'Welcome to Your Private Sanctuary',
      content: 'Your training log is stored 100% locally on your machine with zero cloud tracking. Tap Train to build your first session!',
      date: new Date().toISOString(),
    },
  ],
  profile: {
    name: 'Sophia',
    bio: 'Empress & Aurelia Discipline · Toned Strength & Poise',
    heightCm: 168,
    targetWeightKg: 62,
    gender: 'female',
    activityLevel: 'athlete',
    callsign: 'Aurelia',
  },
  settings: {
    theme: 'dark',
    units: 'lb',
    soundEnabled: true,
    defaultRestSec: 90,
    heatTone: 'rose',
    language: 'en',
    coachPersonality: 'aurelia',
    activeProfileId: 'athlete-female',
    onboardingCompleted: false,
    gender: 'female',
  },
  unlockedAwards: [],
  latestAwardUnlocked: null,
  coachPersonality: 'aurelia',
  activeProfileId: 'athlete-female',
  athleteAccounts: defaultAthleteAccounts,
  onboardingDone: false,
  showOnboarding: true,
  showLoginModal: false,
  onboardingAnswers: {
    gender: 'female',
    name: 'Sophia',
    callsign: 'Aurelia',
    focus: 'glute_waist',
    experience: 'intermediate',
    equipment: 'full_gym',
    frequency: 4,
    workoutTime: '07:30',
    personality: 'aurelia',
    fasting: '16_8',
  },
  currentQuote: getRandomQuote('aurelia'),
  scheduledEvents: defaultPlan.scheduledEvents,
  meals: [],
  nutritionTargets: defaultPlan.nutritionTargets,
  waterMl: 0,
};

let globalState: GymState = defaultState;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
  saveToStorage();
}

function saveToStorage() {
  try {
    const toSave = {
      sessions: globalState.sessions,
      routines: globalState.routines,
      weeklyPlan: globalState.weeklyPlan,
      favorites: globalState.favorites,
      customExercises: globalState.customExercises,
      bodyweight: globalState.bodyweight,
      measures: globalState.measures,
      notes: globalState.notes,
      profile: globalState.profile,
      settings: globalState.settings,
      unlockedAwards: globalState.unlockedAwards,
      session: globalState.session,
      coachPersonality: globalState.coachPersonality,
      activeProfileId: globalState.activeProfileId,
      athleteAccounts: globalState.athleteAccounts,
      onboardingDone: globalState.onboardingDone,
      onboardingAnswers: globalState.onboardingAnswers,
      scheduledEvents: globalState.scheduledEvents,
      meals: globalState.meals,
      nutritionTargets: globalState.nutritionTargets,
      waterMl: globalState.waterMl,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save gym state:', err);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const personality = parsed.coachPersonality || parsed.settings?.coachPersonality || 'marine';
      globalState = {
        ...defaultState,
        ...parsed,
        route: parsed.session ? 'session' : 'home',
        routeStack: [],
        settings: { ...defaultState.settings, ...(parsed.settings || {}) },
        profile: { ...defaultState.profile, ...(parsed.profile || {}) },
        coachPersonality: personality,
        activeProfileId: parsed.activeProfileId || parsed.settings?.activeProfileId || 'stoic1712',
        athleteAccounts: parsed.athleteAccounts || defaultAthleteAccounts,
        onboardingDone: parsed.onboardingDone ?? true,
        showOnboarding: false,
        currentQuote: getRandomQuote(personality),
        scheduledEvents: parsed.scheduledEvents && parsed.scheduledEvents.length > 0 ? parsed.scheduledEvents : defaultState.scheduledEvents,
        meals: parsed.meals && parsed.meals.length > 0 ? parsed.meals : defaultState.meals,
        nutritionTargets: { ...defaultState.nutritionTargets, ...(parsed.nutritionTargets || {}) },
        waterMl: parsed.waterMl ?? defaultState.waterMl,
      };
    }
  } catch (e) {
    console.error('Could not parse saved storage:', e);
  }
}

// Initial load
if (typeof window !== 'undefined') {
  loadFromStorage();
}

export function useGymStore() {
  const [state, setState] = useState<GymState>(globalState);

  useEffect(() => {
    const listener = () => setState({ ...globalState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);


  // Navigation
  const pushRoute = (route: RouteName) => {
    if (globalState.route !== route) {
      globalState.routeStack.push(globalState.route);
      globalState.route = route;
      notify();
    }
  };

  const popRoute = (fallback: RouteName = 'home') => {
    if (globalState.routeStack.length > 0) {
      globalState.route = globalState.routeStack.pop()!;
    } else {
      globalState.route = fallback;
    }
    notify();
  };

  const setRoute = (route: RouteName) => {
    globalState.routeStack = [];
    globalState.route = route;
    notify();
  };

  const setActiveExerciseId = (id: string | null) => {
    globalState.activeExerciseId = id;
    notify();
  };

  // Exercise getters
  const allExercises = [...allBuiltinExercises, ...globalState.customExercises];

  const getExerciseById = (id: string): Exercise | undefined => {
    return allExercises.find((e) => e.id === id || e.art === id);
  };

  const toggleFavorite = (exerciseId: string) => {
    globalState.favorites[exerciseId] = !globalState.favorites[exerciseId];
    notify();
  };

  // Muscle selection for body map
  const toggleMuscle = (muscleId: string) => {
    if (globalState.selectedMuscles.includes(muscleId)) {
      globalState.selectedMuscles = globalState.selectedMuscles.filter((m) => m !== muscleId);
    } else {
      globalState.selectedMuscles = [...globalState.selectedMuscles, muscleId];
    }
    notify();
  };

  const clearSelectedMuscles = () => {
    globalState.selectedMuscles = [];
    globalState.sessionPicks = [];
    notify();
  };

  const setSessionPicks = (picks: string[]) => {
    globalState.sessionPicks = picks;
    notify();
  };

  const toggleSessionPick = (exerciseId: string) => {
    if (globalState.sessionPicks.includes(exerciseId)) {
      globalState.sessionPicks = globalState.sessionPicks.filter((id) => id !== exerciseId);
    } else {
      globalState.sessionPicks = [...globalState.sessionPicks, exerciseId];
    }
    notify();
  };

  // Workout Session Engine
  const startWorkoutFromExercises = (exerciseIds: string[], routineName?: string) => {
    const exercises: SessionExercise[] = exerciseIds
      .map((id) => {
        const ex = getExerciseById(id);
        if (!ex) return null;
        // Check for previous performance in sessions
        const previousSets = getPreviousPerformance(id);
        const initialSets: SessionSet[] = [
          {
            id: `s-${Date.now()}-1`,
            reps: previousSets[0]?.reps || 10,
            weight: previousSets[0]?.weight || 20,
            done: false,
            kind: 'normal',
            previous: previousSets[0],
          },
          {
            id: `s-${Date.now()}-2`,
            reps: previousSets[1]?.reps || 10,
            weight: previousSets[1]?.weight || 20,
            done: false,
            kind: 'normal',
            previous: previousSets[1],
          },
          {
            id: `s-${Date.now()}-3`,
            reps: previousSets[2]?.reps || 10,
            weight: previousSets[2]?.weight || 20,
            done: false,
            kind: 'normal',
            previous: previousSets[2],
          },
        ];

        return {
          id: `se-${Date.now()}-${id}`,
          exerciseId: id,
          name: ex.name,
          primary: ex.primary,
          sets: initialSets,
        };
      })
      .filter(Boolean) as SessionExercise[];

    globalState.session = {
      startTime: Date.now(),
      elapsedSeconds: 0,
      isPaused: false,
      exercises,
      currentExerciseIndex: 0,
      restEndsAt: null,
      restTotalSeconds: globalState.settings.defaultRestSec,
      routineName,
    };

    globalState.route = 'session';
    notify();
  };

  const startEmptyWorkout = () => {
    globalState.session = {
      startTime: Date.now(),
      elapsedSeconds: 0,
      isPaused: false,
      exercises: [],
      currentExerciseIndex: 0,
      restEndsAt: null,
      restTotalSeconds: globalState.settings.defaultRestSec,
    };
    globalState.route = 'session';
    notify();
  };

  const startWorkoutFromRoutine = (routineId: string) => {
    const routine = globalState.routines.find((r) => r.id === routineId);
    if (!routine) return;
    startWorkoutFromExercises(routine.exerciseIds, routine.name);
  };

  const addExerciseToCurrentSession = (exerciseId: string) => {
    if (!globalState.session) return;
    const ex = getExerciseById(exerciseId);
    if (!ex) return;

    const previousSets = getPreviousPerformance(exerciseId);
    const newEx: SessionExercise = {
      id: `se-${Date.now()}-${exerciseId}`,
      exerciseId: exerciseId,
      name: ex.name,
      primary: ex.primary,
      sets: [
        {
          id: `s-${Date.now()}-1`,
          reps: previousSets[0]?.reps || 10,
          weight: previousSets[0]?.weight || 20,
          done: false,
          kind: 'normal',
          previous: previousSets[0],
        },
        {
          id: `s-${Date.now()}-2`,
          reps: previousSets[1]?.reps || 10,
          weight: previousSets[1]?.weight || 20,
          done: false,
          kind: 'normal',
          previous: previousSets[1],
        },
        {
          id: `s-${Date.now()}-3`,
          reps: previousSets[2]?.reps || 10,
          weight: previousSets[2]?.weight || 20,
          done: false,
          kind: 'normal',
          previous: previousSets[2],
        },
      ],
    };

    globalState.session.exercises.push(newEx);
    notify();
  };

  const removeExerciseFromSession = (index: number) => {
    if (!globalState.session) return;
    globalState.session.exercises.splice(index, 1);
    if (globalState.session.currentExerciseIndex >= globalState.session.exercises.length) {
      globalState.session.currentExerciseIndex = Math.max(0, globalState.session.exercises.length - 1);
    }
    notify();
  };

  const setCurrentExerciseIndex = (index: number) => {
    if (!globalState.session) return;
    globalState.session.currentExerciseIndex = index;
    notify();
  };

  const updateSet = (exerciseIndex: number, setIndex: number, partial: Partial<SessionSet>) => {
    if (!globalState.session) return;
    const currentExercises = globalState.session.exercises;
    if (!currentExercises[exerciseIndex] || !currentExercises[exerciseIndex].sets[setIndex]) return;

    const newExercises = currentExercises.map((ex, exIdx) => {
      if (exIdx !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, sIdx) => {
          if (sIdx !== setIndex) return s;
          return { ...s, ...partial };
        }),
      };
    });

    globalState.session = {
      ...globalState.session,
      exercises: newExercises,
    };
    notify();
  };

  const toggleSetDone = (exerciseIndex: number, setIndex: number) => {
    if (!globalState.session) return;
    const currentExercises = globalState.session.exercises;
    const targetSet = currentExercises[exerciseIndex]?.sets[setIndex];
    if (!targetSet) return;

    const newDone = !targetSet.done;
    const newExercises = currentExercises.map((ex, exIdx) => {
      if (exIdx !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, sIdx) => {
          if (sIdx !== setIndex) return s;
          return { ...s, done: newDone };
        }),
      };
    });

    let restEndsAt = globalState.session.restEndsAt;
    let restTotalSeconds = globalState.session.restTotalSeconds;

    if (newDone) {
      try {
        sound.playTick(globalState.settings.soundEnabled);
      } catch (_) {}
      const restSec = globalState.settings.defaultRestSec || 60;
      restEndsAt = Date.now() + restSec * 1000;
      restTotalSeconds = restSec;
    } else {
      restEndsAt = null;
    }

    globalState.session = {
      ...globalState.session,
      exercises: newExercises,
      restEndsAt,
      restTotalSeconds,
    };
    notify();
  };

  const addSetToExercise = (exerciseIndex: number) => {
    if (!globalState.session) return;
    const currentExercises = globalState.session.exercises;
    const ex = currentExercises[exerciseIndex];
    if (!ex) return;

    const lastSet = ex.sets[ex.sets.length - 1];
    const newSet: SessionSet = {
      id: `s-${Date.now()}-${ex.sets.length + 1}`,
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 20,
      done: false,
      kind: lastSet?.kind || 'normal',
    };

    const newExercises = currentExercises.map((e, exIdx) => {
      if (exIdx !== exerciseIndex) return e;
      return {
        ...e,
        sets: [...e.sets, newSet],
      };
    });

    globalState.session = {
      ...globalState.session,
      exercises: newExercises,
    };
    notify();
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    if (!globalState.session) return;
    const currentExercises = globalState.session.exercises;
    const ex = currentExercises[exerciseIndex];
    if (!ex || ex.sets.length <= 1) return;

    const newExercises = currentExercises.map((e, exIdx) => {
      if (exIdx !== exerciseIndex) return e;
      return {
        ...e,
        sets: e.sets.filter((_, sIdx) => sIdx !== setIndex),
      };
    });

    globalState.session = {
      ...globalState.session,
      exercises: newExercises,
    };
    notify();
  };

  const adjustRestTime = (secondsDelta: number) => {
    if (!globalState.session) return;
    const now = Date.now();
    const currentEnd = globalState.session.restEndsAt && globalState.session.restEndsAt > now
      ? globalState.session.restEndsAt
      : now;
    const newEnd = Math.max(now, currentEnd + secondsDelta * 1000);
    const restTotal = Math.max(15, (globalState.session.restTotalSeconds || 60) + secondsDelta);

    globalState.session = {
      ...globalState.session,
      restEndsAt: newEnd > now ? newEnd : null,
      restTotalSeconds: restTotal,
    };
    notify();
  };

  const skipRestTimer = () => {
    if (!globalState.session) return;
    globalState.session = {
      ...globalState.session,
      restEndsAt: null,
    };
    notify();
  };

  const toggleSessionPause = () => {
    if (!globalState.session) return;
    globalState.session = {
      ...globalState.session,
      isPaused: !globalState.session.isPaused,
    };
    notify();
  };

  const tickSessionTimer = () => {
    if (!globalState.session || globalState.session.isPaused) return;
    globalState.session.elapsedSeconds += 1;

    // Check rest timer
    if (globalState.session.restEndsAt && Date.now() >= globalState.session.restEndsAt) {
      globalState.session.restEndsAt = null;
      sound.playRestComplete(globalState.settings.soundEnabled);
    }
    notify();
  };

  const finishWorkout = (): LoggedSession | null => {
    if (!globalState.session) return null;

    const exercises: LoggedExercise[] = globalState.session.exercises.map((se) => ({
      id: se.exerciseId,
      name: se.name,
      primary: se.primary,
      sets: se.sets.filter((s) => s.done).map((s) => ({
        reps: s.reps,
        weight: s.weight,
        kind: s.kind,
        rpe: s.rpe,
        sec: s.sec,
        km: s.km,
      })),
    })).filter((e) => e.sets.length > 0);

    let totalVolume = 0;
    let totalSets = 0;

    exercises.forEach((e) => {
      e.sets.forEach((s) => {
        if (s.kind !== 'warmup') {
          totalVolume += s.reps * s.weight;
          totalSets += 1;
        }
      });
    });

    const logged: LoggedSession = {
      id: `w-${Date.now()}`,
      date: new Date().toISOString(),
      durationSec: globalState.session.elapsedSeconds,
      exercises,
      volume: totalVolume,
      setCount: totalSets,
      routineName: globalState.session.routineName,
    };

    globalState.sessions.unshift(logged);
    globalState.session = null;

    sound.playCheer(globalState.settings.soundEnabled);
    checkAwards(logged);
    notify();
    return logged;
  };

  const discardWorkout = () => {
    globalState.session = null;
    globalState.route = 'home';
    notify();
  };

  // Previous performance lookup
  const getPreviousPerformance = (exerciseId: string): { weight: number; reps: number }[] => {
    for (const session of globalState.sessions) {
      const ex = session.exercises.find((e) => e.id === exerciseId);
      if (ex && ex.sets.length > 0) {
        return ex.sets.map((s) => ({ weight: s.weight, reps: s.reps }));
      }
    }
    return [];
  };

  // Personal Records
  const getPersonalRecord = (exerciseId: string) => {
    let maxWeight = 0;
    let maxOneRm = 0;
    let maxVolume = 0;

    globalState.sessions.forEach((sess) => {
      const ex = sess.exercises.find((e) => e.id === exerciseId);
      if (!ex) return;

      ex.sets.forEach((s) => {
        if (s.weight > maxWeight) maxWeight = s.weight;
        const oneRm = s.weight * (1 + s.reps / 30);
        if (oneRm > maxOneRm) maxOneRm = oneRm;
        const vol = s.weight * s.reps;
        if (vol > maxVolume) maxVolume = vol;
      });
    });

    return { maxWeight, maxOneRm: Math.round(maxOneRm * 10) / 10, maxVolume };
  };

  // Streak & Heatmap
  const getStreak = () => {
    if (globalState.sessions.length === 0) return 0;
    const dates = new Set(
      globalState.sessions.map((s) => s.date.slice(0, 10))
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // check if trained today or yesterday
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let current = dates.has(todayStr) ? today : dates.has(yesterdayStr) ? yesterday : null;
    if (!current) return 0;

    while (current) {
      const dStr = current.toISOString().slice(0, 10);
      if (dates.has(dStr)) {
        streak++;
        current = new Date(current.getTime() - 86400000);
      } else {
        break;
      }
    }
    return streak;
  };

  const getHeatmapDays = (numDays: number = 84) => {
    const days: { date: string; level: number; volume: number; count: number }[] = [];
    const dateMap = new Map<string, { volume: number; count: number }>();

    globalState.sessions.forEach((s) => {
      const d = s.date.slice(0, 10);
      const curr = dateMap.get(d) || { volume: 0, count: 0 };
      curr.volume += s.volume;
      curr.count += 1;
      dateMap.set(d, curr);
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const stats = dateMap.get(dateStr);

      let level = 0;
      if (stats && stats.count > 0) {
        if (stats.volume > 15000) level = 4;
        else if (stats.volume > 8000) level = 3;
        else if (stats.volume > 3000) level = 2;
        else level = 1;
      }

      days.push({
        date: dateStr,
        level,
        volume: stats?.volume || 0,
        count: stats?.count || 0,
      });
    }

    return days;
  };

  // 30-Day Muscle Workload Distribution (for Body HeatMap)
  const get30DayMuscleLoad = (): Record<string, number> => {
    const cutoff = Date.now() - 30 * 86400000;
    const loads: Record<string, number> = {};

    globalState.sessions.forEach((s) => {
      if (new Date(s.date).getTime() < cutoff) return;
      s.exercises.forEach((e) => {
        const muscle = e.primary || 'chest';
        const setsCount = e.sets.filter((x) => x.kind !== 'warmup').length;
        loads[muscle] = (loads[muscle] || 0) + setsCount;
      });
    });

    const maxVal = Math.max(1, ...Object.values(loads));
    const normalized: Record<string, number> = {};
    for (const [k, v] of Object.entries(loads)) {
      normalized[k] = Math.min(1, v / maxVal);
    }
    return normalized;
  };

  // Awards Checker
  const checkAwards = (latest?: LoggedSession) => {
    const unlocked = new Set(globalState.unlockedAwards);
    const totalWorkouts = globalState.sessions.length;
    const totalVolume = globalState.sessions.reduce((acc, s) => acc + s.volume, 0);
    const totalSets = globalState.sessions.reduce((acc, s) => acc + s.setCount, 0);
    const totalHours = globalState.sessions.reduce((acc, s) => acc + s.durationSec / 3600, 0);
    const streak = getStreak();

    AWARDS.forEach((a) => {
      if (unlocked.has(a.id)) return;
      let shouldUnlock = false;

      if (a.id === 'firstStep') shouldUnlock = true;
      if (a.id === 'firstWorkout' && totalWorkouts >= 1) shouldUnlock = true;
      if (a.id === 'firstRoutine' && globalState.routines.length >= 1) shouldUnlock = true;
      if (a.id === 'firstRecord' && totalWorkouts >= 1) shouldUnlock = true;
      if (a.id === 'streak3' && streak >= 3) shouldUnlock = true;
      if (a.id === 'streak7' && streak >= 7) shouldUnlock = true;
      if (a.id === 'streak30' && streak >= 30) shouldUnlock = true;
      if (a.id === 'streak100' && streak >= 100) shouldUnlock = true;
      if (a.id === 'workouts10' && totalWorkouts >= 10) shouldUnlock = true;
      if (a.id === 'workouts50' && totalWorkouts >= 50) shouldUnlock = true;
      if (a.id === 'workouts100' && totalWorkouts >= 100) shouldUnlock = true;
      if (a.id === 'workouts365' && totalWorkouts >= 365) shouldUnlock = true;
      if (a.id === 'tonne1' && totalVolume >= 1000) shouldUnlock = true;
      if (a.id === 'tonnes10' && totalVolume >= 10000) shouldUnlock = true;
      if (a.id === 'tonnes100' && totalVolume >= 100000) shouldUnlock = true;
      if (a.id === 'sets100' && totalSets >= 100) shouldUnlock = true;
      if (a.id === 'sets1000' && totalSets >= 1000) shouldUnlock = true;
      if (a.id === 'hours10' && totalHours >= 10) shouldUnlock = true;
      if (a.id === 'hours50' && totalHours >= 50) shouldUnlock = true;
      if (a.id === 'hours100' && totalHours >= 100) shouldUnlock = true;

      if (shouldUnlock) {
        unlocked.add(a.id);
        globalState.latestAwardUnlocked = a.id;
      }
    });

    globalState.unlockedAwards = Array.from(unlocked);
  };

  // Routine management
  const createRoutine = (name: string, group: string = '', color: string = '#D9A184') => {
    const id = `routine-${Date.now()}`;
    const newRoutine: Routine = {
      id,
      name: name.trim() || 'Custom Routine',
      group,
      color,
      exerciseIds: [],
    };
    globalState.routines = [...globalState.routines, newRoutine];
    checkAwards();
    notify();
    return id;
  };

  const updateRoutine = (id: string, partial: Partial<Routine>) => {
    const r = globalState.routines.find((x) => x.id === id);
    if (!r) return;
    Object.assign(r, partial);
    notify();
  };

  const deleteRoutine = (id: string) => {
    globalState.routines = globalState.routines.filter((r) => r.id !== id);
    notify();
  };

  const assignWeeklyRoutine = (day: number, routineId: string) => {
    globalState.weeklyPlan[day] = routineId;
    notify();
  };

  // Bodyweight & Measures
  const addBodyweight = (kg: number) => {
    globalState.bodyweight = [
      {
        id: `bw-${Date.now()}`,
        date: new Date().toISOString(),
        kg,
      },
      ...globalState.bodyweight,
    ];
    notify();
  };

  const addBodyMeasure = (part: string, val: number) => {
    globalState.measures = [
      {
        id: `bm-${Date.now()}`,
        date: new Date().toISOString(),
        part,
        val,
      },
      ...globalState.measures,
    ];
    notify();
  };

  // Notes
  const addNote = (title: string, content: string) => {
    globalState.notes = [
      {
        id: `note-${Date.now()}`,
        title,
        content,
        date: new Date().toISOString(),
      },
      ...globalState.notes,
    ];
    notify();
  };

  const deleteNote = (id: string) => {
    globalState.notes = globalState.notes.filter((n) => n.id !== id);
    notify();
  };

  // Profile & Settings
  const updateProfile = (p: Partial<Profile>) => {
    globalState.profile = { ...globalState.profile, ...p };
    notify();
  };

  const updateSettings = (s: Partial<Settings>) => {
    globalState.settings = { ...globalState.settings, ...s };
    notify();
  };

  // Export / Import JSON
  const exportDataJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(globalState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `stoic-body-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      globalState = {
        ...defaultState,
        ...data,
      };
      notify();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    globalState = { ...defaultState };
    notify();
  };

  const setCoachPersonality = (personality: CoachPersonality) => {
    globalState.coachPersonality = personality;
    globalState.settings.coachPersonality = personality;
    globalState.currentQuote = getRandomQuote(personality);
    sound.playTick(globalState.settings.soundEnabled);
    notify();
  };

  const switchAthlete = (athleteId: string) => {
    // 1. Snapshot current athlete state
    const currentId = globalState.activeProfileId;
    if (currentId) {
      try {
        const snapshot = {
          sessions: globalState.sessions,
          routines: globalState.routines,
          weeklyPlan: globalState.weeklyPlan,
          bodyweight: globalState.bodyweight,
          measures: globalState.measures,
          notes: globalState.notes,
          profile: globalState.profile,
          settings: globalState.settings,
          scheduledEvents: globalState.scheduledEvents,
          meals: globalState.meals,
          nutritionTargets: globalState.nutritionTargets,
          waterMl: globalState.waterMl,
        };
        localStorage.setItem(`stoic_community_athlete_data_${currentId}`, JSON.stringify(snapshot));
      } catch (err) {
        console.error('Failed to snapshot athlete data:', err);
      }
    }

    const acc = globalState.athleteAccounts.find((a) => a.id === athleteId);
    if (!acc) return;

    globalState.activeProfileId = acc.id;
    globalState.settings.activeProfileId = acc.id;

    // 2. Restore saved data for this athlete if exists
    try {
      const savedRaw = localStorage.getItem(`stoic_community_athlete_data_${acc.id}`);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        globalState.sessions = saved.sessions || [];
        globalState.routines = saved.routines || defaultRoutines;
        globalState.weeklyPlan = saved.weeklyPlan || globalState.weeklyPlan;
        globalState.bodyweight = saved.bodyweight || [];
        globalState.measures = saved.measures || [];
        globalState.notes = saved.notes || [];
        globalState.profile = saved.profile || globalState.profile;
        globalState.settings = saved.settings || globalState.settings;
        globalState.scheduledEvents = saved.scheduledEvents || generateDefaultSchedule(14);
        globalState.meals = saved.meals || [];
        globalState.nutritionTargets = saved.nutritionTargets || globalState.nutritionTargets;
        globalState.waterMl = saved.waterMl || 0;
        globalState.coachPersonality = acc.personality;
        globalState.currentQuote = getRandomQuote(acc.personality);
        sound.playBeepBell();
        notify();
        return;
      }
    } catch (err) {
      console.error('Failed to load athlete snapshot:', err);
    }

    // Otherwise apply athlete defaults
    globalState.coachPersonality = acc.personality;
    globalState.settings.coachPersonality = acc.personality;
    globalState.settings.gender = acc.gender || 'female';
    globalState.profile = {
      ...globalState.profile,
      name: acc.name,
      callsign: acc.callsign,
      gender: acc.gender || 'female',
      bio:
        acc.personality === 'aurelia'
          ? 'Empress & Aurelia Discipline · Toned Strength & Poise'
          : acc.personality === 'marine'
          ? 'USMC Veteran · Semper Fidelis · Lift. Log it. Grow.'
          : 'Stoic Practitioner · Master of Self · Lift. Log it. Grow.',
    };
    globalState.currentQuote = getRandomQuote(acc.personality);
    sound.playBeepBell();
    notify();
  };

  const saveAthlete = (account: AthleteAccount) => {
    const existingIdx = globalState.athleteAccounts.findIndex((a) => a.id === account.id);
    if (existingIdx >= 0) {
      globalState.athleteAccounts[existingIdx] = account;
    } else {
      globalState.athleteAccounts = [...globalState.athleteAccounts, account];
    }
    notify();
  };

  const openLoginModal = () => {
    globalState.showLoginModal = true;
    notify();
  };

  const dismissLoginModal = () => {
    globalState.showLoginModal = false;
    notify();
  };

  const openOnboarding = () => {
    globalState.showOnboarding = true;
    notify();
  };

  const dismissOnboarding = () => {
    globalState.showOnboarding = false;
    notify();
  };

  const completeOnboarding = (answers: OnboardingAnswers) => {
    const plan = generateCustomPlan(answers, allBuiltinExercises);

    globalState.onboardingAnswers = answers;
    globalState.onboardingDone = true;
    globalState.showOnboarding = false;
    globalState.showLoginModal = false;
    globalState.coachPersonality = plan.coachPersonality;
    globalState.settings.coachPersonality = plan.coachPersonality;
    globalState.settings.onboardingCompleted = true;
    globalState.settings.gender = answers.gender;
    globalState.settings.heatTone = answers.gender === 'female' ? 'rose' : 'ember';
    globalState.profile = {
      ...globalState.profile,
      ...plan.profileUpdates,
    };
    globalState.routines = plan.routines;
    globalState.weeklyPlan = plan.weeklyPlan;
    globalState.scheduledEvents = plan.scheduledEvents;
    globalState.nutritionTargets = plan.nutritionTargets;
    globalState.currentQuote = getRandomQuote(plan.coachPersonality);

    // Save or update athlete account
    const athleteId = globalState.activeProfileId || (answers.gender === 'female' ? 'athlete-female' : 'athlete-male');
    const existingIdx = globalState.athleteAccounts.findIndex((a) => a.id === athleteId);
    const updatedAccount: AthleteAccount = {
      id: athleteId,
      name: answers.name || (answers.gender === 'female' ? 'Sophia' : 'Marcus'),
      callsign: answers.callsign || (answers.gender === 'female' ? 'Aurelia' : 'Spartan'),
      role: answers.gender === 'female' ? 'Empress Athlete' : 'Tactical Athlete',
      personality: plan.coachPersonality,
      gender: answers.gender,
      createdDate: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      globalState.athleteAccounts[existingIdx] = updatedAccount;
    } else {
      globalState.athleteAccounts = [...globalState.athleteAccounts, updatedAccount];
    }
    globalState.activeProfileId = athleteId;

    // Snapshot state for this athlete account
    try {
      const snapshot = {
        sessions: globalState.sessions,
        routines: globalState.routines,
        weeklyPlan: globalState.weeklyPlan,
        bodyweight: globalState.bodyweight,
        measures: globalState.measures,
        notes: globalState.notes,
        profile: globalState.profile,
        settings: globalState.settings,
        scheduledEvents: globalState.scheduledEvents,
        meals: globalState.meals,
        nutritionTargets: globalState.nutritionTargets,
        waterMl: globalState.waterMl,
      };
      localStorage.setItem(`stoic_community_athlete_data_${athleteId}`, JSON.stringify(snapshot));
    } catch (e) {
      console.error('Failed to snapshot athlete data on onboarding completion:', e);
    }

    sound.playCheer(globalState.settings.soundEnabled);
    notify();
  };

  const shuffleQuote = () => {
    globalState.currentQuote = getRandomQuote(globalState.coachPersonality);
    sound.playTick(globalState.settings.soundEnabled);
    notify();
  };

  // Scheduling Actions
  const addScheduledEvent = (event: Omit<ScheduledEvent, 'id'>) => {
    const newEvent: ScheduledEvent = {
      ...event,
      id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    globalState.scheduledEvents = [...globalState.scheduledEvents, newEvent].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    sound.playTick(globalState.settings.soundEnabled);
    notify();
  };

  const updateScheduledEvent = (id: string, partial: Partial<ScheduledEvent>) => {
    globalState.scheduledEvents = globalState.scheduledEvents.map((e) =>
      e.id === id ? { ...e, ...partial } : e
    );
    notify();
  };

  const toggleScheduledEvent = (id: string) => {
    globalState.scheduledEvents = globalState.scheduledEvents.map((e) => {
      if (e.id === id) {
        const next = !e.completed;
        if (next) sound.playCheer(globalState.settings.soundEnabled);
        return { ...e, completed: next };
      }
      return e;
    });
    notify();
  };

  const deleteScheduledEvent = (id: string) => {
    globalState.scheduledEvents = globalState.scheduledEvents.filter((e) => e.id !== id);
    notify();
  };

  const getEventsForDate = (dateStr: string): ScheduledEvent[] => {
    let dayEvents = globalState.scheduledEvents.filter((e) => e.date === dateStr);
    if (dayEvents.length === 0) {
      const generated = generateEventsForDate(dateStr);
      globalState.scheduledEvents = [...globalState.scheduledEvents, ...generated].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      notify();
      return generated;
    }
    return dayEvents.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Nutrition Actions
  const logMeal = (meal: Omit<MealEntry, 'id'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: meal.loggedAt || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    };
    globalState.meals = [newMeal, ...globalState.meals];
    sound.playCheer(globalState.settings.soundEnabled);
    notify();
  };

  const removeMeal = (id: string) => {
    globalState.meals = globalState.meals.filter((m) => m.id !== id);
    notify();
  };

  const addWater = (ml: number) => {
    globalState.waterMl = Math.max(0, globalState.waterMl + ml);
    sound.playTick(globalState.settings.soundEnabled);
    notify();
  };

  const resetWater = () => {
    globalState.waterMl = 0;
    notify();
  };

  const updateNutritionTargets = (targets: Partial<NutritionTargets>) => {
    globalState.nutritionTargets = { ...globalState.nutritionTargets, ...targets };
    notify();
  };

  const injectDayPlanTemplate = (
    dateStr: string,
    template: 'marine_tactical' | 'omad_conditioning' | 'hypertrophy_split'
  ) => {
    const nonDateEvents = globalState.scheduledEvents.filter((e) => e.date !== dateStr);
    let templateEvents: ScheduledEvent[] = [];

    if (template === 'marine_tactical') {
      templateEvents = [
        {
          id: `sched-m1-${dateStr}`,
          date: dateStr,
          time: '05:30',
          durationMinutes: 15,
          title: 'Cellular Hydration: 24oz Filtered Water + Electrolyte Shield',
          category: 'recovery',
          tier: 1,
          citation: 'Huberman Lab: Sodium-potassium cellular pump charging upon waking',
          completed: false,
        },
        {
          id: `sched-m2-${dateStr}`,
          date: dateStr,
          time: '06:00',
          durationMinutes: 50,
          title: 'USMC Combat Conditioning: Heavy Barbell Push & Pull-Up Overload',
          category: 'workout',
          tier: 3,
          citation: 'MCO 6110.3A: Marine PFT/CFT maximal performance calibration',
          completed: false,
        },
        {
          id: `sched-m3-${dateStr}`,
          date: dateStr,
          time: '08:30',
          durationMinutes: 40,
          title: 'Zone 2 Tactical Ruck / Incline Walk (Fat Oxidation)',
          category: 'workout',
          tier: 2,
          citation: 'San-Millán: Maximal mitochondrial lipid clearance',
          completed: false,
        },
        {
          id: `sched-m4-${dateStr}`,
          date: dateStr,
          time: '11:30',
          durationMinutes: 60,
          title: 'Tactical Deep Work: Single Mission Priority Block',
          category: 'task',
          tier: 2,
          citation: 'Newport (2016): Zero distraction deep execution',
          completed: false,
        },
        {
          id: `sched-m5-${dateStr}`,
          date: dateStr,
          time: '17:30',
          durationMinutes: 60,
          title: '23:1 OMAD Meal: 140g Whole Protein + Jasmine Rice & Greens',
          category: 'meal',
          tier: 2,
          citation: 'Phillips: High-protein bolus muscle protein synthesis preservation',
          completed: false,
          calories: 1400,
        },
        {
          id: `sched-m6-${dateStr}`,
          date: dateStr,
          time: '21:30',
          durationMinutes: 20,
          title: 'Magnesium Glycinate & Sleep Wind-down Protocol',
          category: 'recovery',
          tier: 1,
          citation: 'Walker: Non-REM slow-wave cellular regeneration',
          completed: false,
        },
      ];
    } else if (template === 'omad_conditioning') {
      templateEvents = [
        {
          id: `sched-o1-${dateStr}`,
          date: dateStr,
          time: '06:00',
          durationMinutes: 45,
          title: 'Fasted Boxing & Interval Conditioning (6 Rounds)',
          category: 'workout',
          tier: 3,
          citation: 'Tremblay EPOC: +14% post-exercise metabolic surge',
          completed: false,
        },
        {
          id: `sched-o2-${dateStr}`,
          date: dateStr,
          time: '09:00',
          durationMinutes: 15,
          title: 'Electrolyte Mineral Refresher & Green Tea',
          category: 'recovery',
          tier: 1,
          citation: 'Maintains blood pressure and electrolyte balance in deep ketosis',
          completed: false,
        },
        {
          id: `sched-o3-${dateStr}`,
          date: dateStr,
          time: '12:00',
          durationMinutes: 30,
          title: 'Midday Sunlight & 2-Mile Aerobic Stroll',
          category: 'recovery',
          tier: 1,
          citation: 'Circadian entrainment and glucose clearance',
          completed: false,
        },
        {
          id: `sched-o4-${dateStr}`,
          date: dateStr,
          time: '17:30',
          durationMinutes: 60,
          title: '23:1 OMAD Feast: Wild Salmon, Eggs & Sweet Potato',
          category: 'meal',
          tier: 2,
          citation: 'Single nutrient-dense feeding window maximizes daily autophagy',
          completed: false,
          calories: 1550,
        },
        {
          id: `sched-o5-${dateStr}`,
          date: dateStr,
          time: '21:30',
          durationMinutes: 20,
          title: 'Cold Bedroom Sleep Optimization (66°F)',
          category: 'recovery',
          tier: 1,
          citation: 'Deep restorative core temperature drop',
          completed: false,
        },
      ];
    } else {
      templateEvents = [
        {
          id: `sched-h1-${dateStr}`,
          date: dateStr,
          time: '06:30',
          durationMinutes: 60,
          title: 'Heavy Barbell Hypertrophy: 4-6 RIR Primary Lifts',
          category: 'workout',
          tier: 3,
          citation: 'Schoenfeld: Progressive mechanical tension for muscle hypertrophy',
          completed: false,
        },
        {
          id: `sched-h2-${dateStr}`,
          date: dateStr,
          time: '08:00',
          durationMinutes: 30,
          title: 'Post-Workout Meal 1: Whey Isolate, Oats & Berries',
          category: 'meal',
          tier: 1,
          citation: 'Aragon: Post-exercise amino acid hyper-perfusion',
          completed: false,
          calories: 550,
        },
        {
          id: `sched-h3-${dateStr}`,
          date: dateStr,
          time: '12:30',
          durationMinutes: 45,
          title: 'Balanced High-Protein Meal 2: Chicken Breast & Rice',
          category: 'meal',
          tier: 1,
          citation: 'Sustained 4-hour leucine elevation',
          completed: false,
          calories: 650,
        },
        {
          id: `sched-h4-${dateStr}`,
          date: dateStr,
          time: '16:00',
          durationMinutes: 20,
          title: 'Joint Mobility & Shoulder Pre-hab Protocol',
          category: 'recovery',
          tier: 1,
          citation: 'Cuff stabilization and rotator health',
          completed: false,
        },
        {
          id: `sched-h5-${dateStr}`,
          date: dateStr,
          time: '19:30',
          durationMinutes: 45,
          title: 'Dinner Meal 3: Grass-fed Beef, Broccoli & Olive Oil',
          category: 'meal',
          tier: 2,
          citation: 'Micronutrient density and slow-digesting evening protein',
          completed: false,
          calories: 750,
        },
        {
          id: `sched-h6-${dateStr}`,
          date: dateStr,
          time: '22:00',
          durationMinutes: 15,
          title: 'Sleep Wind-Down & Darkness Reset',
          category: 'recovery',
          tier: 1,
          citation: 'Melatonin secretion facilitation',
          completed: false,
        },
      ];
    }

    globalState.scheduledEvents = [...nonDateEvents, ...templateEvents].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    sound.playBeepBell();
    notify();
  };

  return {
    ...state,
    allExercises,
    pushRoute,
    popRoute,
    setRoute,
    getExerciseById,
    setActiveExerciseId,
    toggleFavorite,
    toggleMuscle,
    clearSelectedMuscles,
    setSessionPicks,
    toggleSessionPick,
    startWorkoutFromExercises,
    startEmptyWorkout,
    startWorkoutFromRoutine,
    addExerciseToCurrentSession,
    removeExerciseFromSession,
    setCurrentExerciseIndex,
    updateSet,
    toggleSetDone,
    addSetToExercise,
    removeSetFromExercise,
    adjustRestTime,
    skipRestTimer,
    toggleSessionPause,
    tickSessionTimer,
    finishWorkout,
    discardWorkout,
    getPersonalRecord,
    getStreak,
    getHeatmapDays,
    get30DayMuscleLoad,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    assignWeeklyRoutine,
    addBodyweight,
    addBodyMeasure,
    addNote,
    deleteNote,
    updateProfile,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    setCoachPersonality,
    switchAthlete,
    saveAthlete,
    openLoginModal,
    dismissLoginModal,
    openOnboarding,
    dismissOnboarding,
    completeOnboarding,
    shuffleQuote,
    addScheduledEvent,
    updateScheduledEvent,
    toggleScheduledEvent,
    deleteScheduledEvent,
    logMeal,
    removeMeal,
    addWater,
    resetWater,
    updateNutritionTargets,
    injectDayPlanTemplate,
    getEventsForDate,
    dismissLatestAward: () => {
      globalState.latestAwardUnlocked = null;
      notify();
    },
  };
}

useGymStore.getState = () => globalState;

if (typeof window !== 'undefined') {
  (window as any).gymStore = {
    getState: () => globalState,
    setRoute: (r: any) => { globalState.routeStack = []; globalState.route = r; notify(); },
    pushRoute: (r: any) => { globalState.routeStack.push(globalState.route); globalState.route = r; notify(); },
    setActiveExerciseId: (id: any) => { globalState.activeExerciseId = id; notify(); },
    setProfileGender: (g: 'male' | 'female') => {
      globalState.profile.gender = g;
      globalState.settings.gender = g;
      globalState.coachPersonality = g === 'female' ? 'aurelia' : 'marine';
      globalState.profile.callsign = g === 'female' ? 'Aurelia' : 'Spartan';
      notify();
    }
  };
}

