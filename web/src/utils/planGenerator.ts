import type {
  Exercise,
  Routine,
  ScheduledEvent,
  NutritionTargets,
  Profile,
  Settings,
  CoachPersonality,
  OnboardingAnswers,
  SetKind,
} from '../types';
import { getLocalDateString } from '../data/defaultSchedule';

export interface PlanSummary {
  splitName: string;
  routineCount: number;
  daysScheduled: number;
  selectedDaysText: string;
  workoutTimeText: string;
  durationText: string;
  primaryFocusTitle: string;
  equipmentTitle: string;
  nutritionTitle: string;
  macrosSummary: string;
  activeAddons: string[];
}

export interface GeneratedPlan {
  routines: Routine[];
  weeklyPlan: Record<number, string>;
  scheduledEvents: ScheduledEvent[];
  nutritionTargets: NutritionTargets;
  profileUpdates: Partial<Profile>;
  settingsUpdates: Partial<Settings>;
  coachPersonality: CoachPersonality;
  summary: PlanSummary;
}

// Helper to filter exercises safely by user's equipment
function filterByEquipment(exercises: Exercise[], equipment: string): Exercise[] {
  return exercises.filter((e) => {
    if (!e || !e.id) return false;
    const eq = (e.equipment || '').toLowerCase();
    if (equipment === 'bodyweight') {
      return eq === 'bodyweight';
    }
    if (equipment === 'dumbbells') {
      return eq === 'dumbbell' || eq === 'bodyweight' || eq === 'band';
    }
    if (equipment === 'barbell_home') {
      return eq === 'barbell' || eq === 'dumbbell' || eq === 'bodyweight' || eq === 'weighted';
    }
    // full_gym allows everything
    return true;
  });
}

// Find exercise by preferred identifiers or fallback to best match for muscle group
function pickExercise(
  available: Exercise[],
  preferredIdentifiers: string[],
  muscleFallback: string,
  usedIds: Set<string>
): string | null {
  // 1. Try preferred identifiers (match id, art slug, or partial name)
  for (const identifier of preferredIdentifiers) {
    const idLower = identifier.toLowerCase();
    const match = available.find(
      (e) =>
        !usedIds.has(e.id) &&
        (e.id.toLowerCase() === idLower ||
          (e.art && e.art.toLowerCase() === idLower) ||
          e.name.toLowerCase().includes(idLower))
    );
    if (match) {
      usedIds.add(match.id);
      return match.id;
    }
  }

  // 2. Fallback to any unused exercise in target muscle group
  const muscleMatch = available.find(
    (e) =>
      !usedIds.has(e.id) &&
      (e.primary.toLowerCase() === muscleFallback.toLowerCase() ||
        (e.secondary && e.secondary.some((s) => s.toLowerCase() === muscleFallback.toLowerCase())))
  );
  if (muscleMatch) {
    usedIds.add(muscleMatch.id);
    return muscleMatch.id;
  }

  // 3. Fallback to any unused exercise
  const anyMatch = available.find((e) => !usedIds.has(e.id));
  if (anyMatch) {
    usedIds.add(anyMatch.id);
    return anyMatch.id;
  }

  return null;
}

// Day name helper: 1=Mon .. 7=Sun
export const DAY_NAMES: Record<number, { short: string; full: string }> = {
  1: { short: 'Mon', full: 'Monday' },
  2: { short: 'Tue', full: 'Tuesday' },
  3: { short: 'Wed', full: 'Wednesday' },
  4: { short: 'Thu', full: 'Thursday' },
  5: { short: 'Fri', full: 'Friday' },
  6: { short: 'Sat', full: 'Saturday' },
  7: { short: 'Sun', full: 'Sunday' },
};

// Physiological Set & Rep Scheme Calculator based on athlete gender, experience & workout goal
export function buildCalibratedRoutineSets(
  exerciseIds: string[],
  allExercises: Exercise[],
  workoutKind: string,
  experience: 'recruit' | 'intermediate' | 'veteran',
  isFemale: boolean,
  equipment: string
): {
  plannedSets: Record<string, { reps: number; weight: number; kind: SetKind }[]>;
  setsCount: Record<string, number>;
} {
  const plannedSets: Record<string, { reps: number; weight: number; kind: SetKind }[]> = {};
  const setsCount: Record<string, number> = {};

  const baseSetCount = experience === 'veteran' ? 4 : 3;

  exerciseIds.forEach((exId, idx) => {
    const ex = allExercises.find((e) => e.id === exId);
    const primary = (ex?.primary || '').toLowerCase();
    const name = (ex?.name || '').toLowerCase();
    const isCore =
      primary === 'abdomen' ||
      primary === 'obliques' ||
      name.includes('plank') ||
      name.includes('raise') ||
      name.includes('bug') ||
      name.includes('twist') ||
      idx === exerciseIds.length - 1;

    let targetReps = 10;
    let targetWeight = 20;
    let numSets = baseSetCount;

    if (equipment === 'bodyweight') {
      if (isCore) {
        targetReps = name.includes('plank') ? 60 : 25;
        targetWeight = 0;
      } else if (name.includes('pull-up') || name.includes('chin-up')) {
        targetReps = isFemale ? 6 : 10;
        targetWeight = 0;
      } else if (name.includes('push-up')) {
        targetReps = isFemale ? 12 : 20;
        targetWeight = 0;
      } else if (name.includes('dip')) {
        targetReps = isFemale ? 8 : 15;
        targetWeight = 0;
      } else {
        targetReps = 20;
        targetWeight = 0;
      }
    } else if (isCore) {
      targetReps = name.includes('plank') ? 45 : 20;
      targetWeight = 0;
      numSets = 3;
    } else if (workoutKind === 'strength') {
      targetReps = 5;
      numSets = experience === 'recruit' ? 3 : 4;
      if (primary === 'chest') targetWeight = isFemale ? 30 : 65;
      else if (primary === 'glutes' || primary === 'quads') targetWeight = isFemale ? 45 : 85;
      else if (primary === 'back') targetWeight = isFemale ? 35 : 75;
      else if (primary === 'shoulders') targetWeight = isFemale ? 14 : 45;
      else targetWeight = isFemale ? 12 : 25;
    } else if (workoutKind === 'glute_sculpt') {
      if (name.includes('thrust') || name.includes('bridge')) {
        targetReps = 12;
        targetWeight = isFemale ? 45 : 70;
        numSets = 4;
      } else if (name.includes('kickback')) {
        targetReps = 15;
        targetWeight = isFemale ? 12 : 18;
        numSets = 3;
      } else if (name.includes('romanian') || name.includes('rdl') || name.includes('deadlift')) {
        targetReps = 10;
        targetWeight = isFemale ? 35 : 60;
        numSets = 4;
      } else if (name.includes('squat') || name.includes('lunge')) {
        targetReps = 12;
        targetWeight = isFemale ? 10 : 20;
        numSets = 3;
      } else {
        targetReps = 15;
        targetWeight = isFemale ? 8 : 18;
      }
    } else if (workoutKind === 'toning') {
      targetReps = 15;
      numSets = 3;
      if (primary === 'glutes' || primary === 'quads') targetWeight = isFemale ? 25 : 45;
      else if (primary === 'chest' || primary === 'back') targetWeight = isFemale ? 20 : 40;
      else targetWeight = isFemale ? 8 : 16;
    } else if (workoutKind === 'combat') {
      numSets = 4;
      if (name.includes('pull-up') || name.includes('chin-up')) {
        targetReps = 12;
        targetWeight = 0;
      } else if (name.includes('push-up')) {
        targetReps = 25;
        targetWeight = 0;
      } else if (name.includes('dip')) {
        targetReps = 15;
        targetWeight = 0;
      } else {
        targetReps = 15;
        targetWeight = 25;
      }
    } else {
      targetReps = 10;
      if (primary === 'chest' || primary === 'back') targetWeight = isFemale ? 25 : 55;
      else if (primary === 'glutes' || primary === 'quads') targetWeight = isFemale ? 35 : 70;
      else targetWeight = isFemale ? 10 : 22;
    }

    const sets: { reps: number; weight: number; kind: SetKind }[] = [];
    for (let s = 1; s <= numSets; s++) {
      sets.push({
        reps: targetReps,
        weight: targetWeight,
        kind: 'normal',
      });
    }

    plannedSets[exId] = sets;
    setsCount[exId] = numSets;
  });

  return { plannedSets, setsCount };
}

export function generateCustomPlan(
  answers: OnboardingAnswers,
  allBuiltinExercises: Exercise[]
): GeneratedPlan {
  const isFemale = answers.gender === 'female';
  const equipment = answers.equipment || 'full_gym';
  const experience = answers.experience || 'intermediate';
  const workoutTime = answers.workoutTime || (isFemale ? '07:30' : '06:00');
  const workoutDuration = answers.workoutDuration || 45; // 30, 45, 60, 75
  const fasting = answers.fasting || (isFemale ? '16_8' : 'omad');
  const personality = answers.personality || (isFemale ? 'aurelia' : 'marine');

  // Workout Kind Resolution
  let workoutKind = answers.workoutKind;
  if (!workoutKind) {
    if (answers.focus === 'glute_waist') workoutKind = 'glute_sculpt';
    else if (answers.focus === 'pilates_tone') workoutKind = 'toning';
    else if (answers.focus === 'combat') workoutKind = 'combat';
    else if (answers.focus === 'hypertrophy') workoutKind = 'hypertrophy';
    else if (answers.focus === 'strength') workoutKind = 'strength';
    else workoutKind = isFemale ? 'toning' : 'combat';
  }

  // Target Emphasis Add-ons (e.g. Abs & Core Toning, Glutes, Posture, Arms)
  const targetEmphasis = answers.targetEmphasis || (isFemale ? ['abs_core', 'glutes'] : ['abs_core']);
  const hasAbsCoreAddon = targetEmphasis.includes('abs_core') || workoutKind === 'toning';
  const hasGluteAddon = targetEmphasis.includes('glutes') || workoutKind === 'glute_sculpt';
  const hasPostureAddon = targetEmphasis.includes('posture_waist');
  const hasArmsAddon = targetEmphasis.includes('arms_shoulders');

  // Exact Workout Days: [1, 2, 4, 5] (1=Mon .. 7=Sun)
  let selectedDays = answers.selectedDays && answers.selectedDays.length > 0
    ? [...answers.selectedDays].sort((a, b) => a - b)
    : [];

  if (selectedDays.length === 0) {
    const freq = answers.frequency || 4;
    if (freq === 1) selectedDays = [1];
    else if (freq === 2) selectedDays = [1, 4];
    else if (freq === 3) selectedDays = [1, 3, 5];
    else if (freq === 5) selectedDays = [1, 2, 3, 4, 5];
    else if (freq === 6) selectedDays = [1, 2, 3, 4, 5, 6];
    else if (freq === 7) selectedDays = [1, 2, 3, 4, 5, 6, 7];
    else selectedDays = [1, 2, 4, 5]; // Default 4 days: Mon, Tue, Thu, Fri
  }

  const frequency = selectedDays.length;

  const pool = filterByEquipment(allBuiltinExercises, equipment);

  // Calibrate base exercise count by session duration & experience
  let baseExerciseCount = 4;
  if (workoutDuration <= 30) {
    baseExerciseCount = experience === 'recruit' ? 3 : 4;
  } else if (workoutDuration <= 45) {
    baseExerciseCount = experience === 'veteran' ? 5 : 4;
  } else if (workoutDuration <= 60) {
    baseExerciseCount = experience === 'veteran' ? 6 : 5;
  } else {
    // 75 min
    baseExerciseCount = experience === 'recruit' ? 5 : 6;
  }

  // Dynamic Core / Abs finisher pool by equipment
  const coreExercisePool = [
    'hanging-leg-raise',
    'hanging-knee-raise',
    'dead-bug',
    'plank',
    'weighted-front-plank',
    'cable-woodchopper',
    'russian-twist',
    'side-plank',
    'ab-wheel-rollout',
    'mountain-climber',
    'hollow-body-hold',
  ];

  // Helper to append a unique abs/core finisher if add-on is active
  const appendAbsFinisher = (exerciseList: string[], usedSet: Set<string>, routineIndex: number) => {
    if (!hasAbsCoreAddon) return;
    // Rotate through core candidates
    const candidateCoreId = pickExercise(
      pool,
      [
        coreExercisePool[routineIndex % coreExercisePool.length],
        coreExercisePool[(routineIndex + 3) % coreExercisePool.length],
        'dead-bug',
        'plank',
      ],
      'abdomen',
      usedSet
    );
    if (candidateCoreId && !exerciseList.includes(candidateCoreId)) {
      exerciseList.push(candidateCoreId);
    }
  };

  const routines: Routine[] = [];
  const weeklyPlan: Record<number, string> = {};

  // Theme Colors
  const femalePrimaryColor = '#E0A899'; // Rose Gold
  const femaleAccent1 = '#8FA377'; // Sage
  const femaleAccent2 = '#7FA8C9'; // Soft Slate
  const femaleAccent3 = '#D4A373'; // Amber Gold

  const malePrimaryColor = '#D9A184'; // Ember Gold
  const maleAccent1 = '#C85A48'; // Spartan Crimson
  const maleAccent2 = '#7FA8C9'; // Tactical Slate
  const maleAccent3 = '#8FA377'; // Olive Field

  // -------------------------------------------------------------
  // FEMALE / EMPRESS ROUTINE BLUEPRINTS
  // -------------------------------------------------------------
  if (isFemale) {
    if (workoutKind === 'glute_sculpt' || workoutKind === 'toning') {
      // Routine 1: Glute Hypertrophy & Hip Thrust Anchor
      const used1 = new Set<string>();
      const r1Ex: string[] = [
        pickExercise(pool, ['hip-thrust', 'barbell-hip-thrust', 'dumbbell-hip-thrust', 'glute-bridge'], 'glutes', used1),
        pickExercise(pool, ['wQ2c4XD', 'romanian-deadlift', 'barbell-romanian-deadlift', 'dumbbell-romanian-deadlift'], 'glutes', used1),
        pickExercise(pool, ['qx4fgX7', 'split-squat', 'dumbbell-single-leg-split-squat', 'bulgarian-split-squat'], 'quads', used1),
        pickExercise(pool, ['HEJ6DIX', 'cable-glute-kickback', 'cable-kickback', 'glute-kickback', 'banded-glute-kickback'], 'glutes', used1),
        pickExercise(pool, ['standing-calf-raise', '8ozhUIZ', 'calf-raise'], 'calves', used1),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(r1Ex, used1, 0);

      const { plannedSets: p1, setsCount: c1 } = buildCalibratedRoutineSets(r1Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-glute-hypertrophy',
        name: workoutKind === 'toning' ? 'Lower Body Tone & Glute Activation' : 'Glute Hypertrophy & Hip Thrust Anchor',
        group: 'Empress Periodization',
        color: femalePrimaryColor,
        exerciseIds: r1Ex,
        setsCount: c1,
        plannedSets: p1,
      });

      // Routine 2: Hourglass Torso & Posture Sculpt
      const used2 = new Set<string>();
      const r2Ex: string[] = [
        pickExercise(pool, ['close-grip-lat-pulldown', 'lat-pulldown', 'wide-grip-lat-pulldown', 'pull-up'], 'back', used2),
        pickExercise(pool, ['standing-dumbbell-press', 'A6wtbuL', 'dumbbell-shoulder-press', 'overhead-press'], 'shoulders', used2),
        pickExercise(pool, ['face-pull', 'banded-face-pull', 'cable-face-pull'], 'shoulders', used2),
        pickExercise(pool, ['ns0SIbU', 'incline-dumbbell-press', 'dumbbell-incline-bench-press', '3TZduzM'], 'chest', used2),
        pickExercise(pool, ['DsgkuIt', 'lateral-raise', 'dumbbell-lateral-raise', 'goJ6ezq'], 'shoulders', used2),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(r2Ex, used2, 1);

      const { plannedSets: p2, setsCount: c2 } = buildCalibratedRoutineSets(r2Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-upper-posture',
        name: 'Hourglass Torso & Posture Sculpt',
        group: 'Empress Periodization',
        color: femaleAccent1,
        exerciseIds: r2Ex,
        setsCount: c2,
        plannedSets: p2,
      });

      // Routine 3: Posterior Chain & Hamstring Curve
      const used3 = new Set<string>();
      const r3Ex: string[] = [
        pickExercise(pool, ['KgI0tqW', 'sumo-deadlift', 'barbell-sumo-deadlift', 'ila4NZS', 'deadlift'], 'glutes', used3),
        pickExercise(pool, ['yn8yg1r', 'goblet-squat', 'dumbbell-goblet-squat', 'barbell-squat', 'qXTaZnJ'], 'quads', used3),
        pickExercise(pool, ['leg-press', 'leg-extension', 'dumbbell-lunge', 'walking-lunge'], 'quads', used3),
        pickExercise(pool, ['zHEpuuc', 'leg-curl', 'cable-assisted-inverse-leg-curl', 'hamstring-curl'], 'hamstrings', used3),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(r3Ex, used3, 2);

      const { plannedSets: p3, setsCount: c3 } = buildCalibratedRoutineSets(r3Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-lower-posterior',
        name: 'Posterior Chain & Hamstring Curve',
        group: 'Empress Periodization',
        color: femaleAccent2,
        exerciseIds: r3Ex,
        setsCount: c3,
        plannedSets: p3,
      });

      // Routine 4: Pelvic Floor Stability & Glute Finisher
      const used4 = new Set<string>();
      const r4Ex: string[] = [
        pickExercise(pool, ['hip-thrust', 'dumbbell-hip-thrust', 'glute-bridge'], 'glutes', used4),
        pickExercise(pool, ['walking-lunge', 'dumbbell-lunge', 'split-squat'], 'quads', used4),
        pickExercise(pool, ['cable-kickback', 'banded-hip-thrust'], 'glutes', used4),
        pickExercise(pool, ['standing-calf-raise', '8ozhUIZ'], 'calves', used4),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(r4Ex, used4, 3);

      const { plannedSets: p4, setsCount: c4 } = buildCalibratedRoutineSets(r4Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-core-glute-burnout',
        name: 'Pelvic Stability & Waistline Sculpt',
        group: 'Empress Periodization',
        color: femaleAccent3,
        exerciseIds: r4Ex,
        setsCount: c4,
        plannedSets: p4,
      });

      // Routine 5: Full Body Metabolic Toning (if 5+ days)
      if (frequency >= 5) {
        const used5 = new Set<string>();
        const r5Ex: string[] = [
          pickExercise(pool, ['goblet-squat', 'dumbbell-goblet-squat'], 'quads', used5),
          pickExercise(pool, ['push-up', 'knee-push-up', 'I4hDWkc'], 'chest', used5),
          pickExercise(pool, ['dumbbell-bench-press', 'SpYC0Kp'], 'chest', used5),
          pickExercise(pool, ['dumbbell-hammer-curl', 'slDvUAU'], 'biceps', used5),
        ].filter(Boolean).slice(0, baseExerciseCount) as string[];
        appendAbsFinisher(r5Ex, used5, 4);

        const { plannedSets: p5, setsCount: c5 } = buildCalibratedRoutineSets(r5Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
        routines.push({
          id: 'routine-fullbody-metabolic',
          name: 'Empress Full Body Metabolic Tone',
          group: 'Empress Periodization',
          color: '#C490D1',
          exerciseIds: r5Ex,
          setsCount: c5,
          plannedSets: p5,
        });
      }

      // Routine 6: Delts & Upper Symmetry (if 6+ days)
      if (frequency >= 6) {
        const used6 = new Set<string>();
        const r6Ex: string[] = [
          pickExercise(pool, ['lateral-raise', 'DsgkuIt'], 'shoulders', used6),
          pickExercise(pool, ['face-pull', 'banded-face-pull'], 'shoulders', used6),
          pickExercise(pool, ['bicep-curl', '25GPyDY'], 'biceps', used6),
          pickExercise(pool, ['standing-calf-raise', '8ozhUIZ'], 'calves', used6),
        ].filter(Boolean).slice(0, baseExerciseCount) as string[];
        appendAbsFinisher(r6Ex, used6, 5);

        const { plannedSets: p6, setsCount: c6 } = buildCalibratedRoutineSets(r6Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
        routines.push({
          id: 'routine-delts-arms-sculpt',
          name: 'Delts, Arms & Calves Poise',
          group: 'Empress Periodization',
          color: '#E0A899',
          exerciseIds: r6Ex,
          setsCount: c6,
          plannedSets: p6,
        });
      }
    } else {
      // General Female Strength / Athletic
      const usedA = new Set<string>();
      const rA: string[] = [
        pickExercise(pool, ['hip-thrust', 'dumbbell-hip-thrust'], 'glutes', usedA),
        pickExercise(pool, ['lat-pulldown', 'pull-up'], 'back', usedA),
        pickExercise(pool, ['dumbbell-bench-press', 'push-up'], 'chest', usedA),
        pickExercise(pool, ['standing-calf-raise'], 'calves', usedA),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(rA, usedA, 0);

      const { plannedSets: pA, setsCount: cA } = buildCalibratedRoutineSets(rA, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-female-full-a',
        name: 'Full Body Alignment & Core Sculpt',
        group: 'Aurelia Protocols',
        color: femalePrimaryColor,
        exerciseIds: rA,
        setsCount: cA,
        plannedSets: pA,
      });

      const usedB = new Set<string>();
      const rB: string[] = [
        pickExercise(pool, ['romanian-deadlift', 'sumo-deadlift'], 'glutes', usedB),
        pickExercise(pool, ['standing-dumbbell-press', 'overhead-press'], 'shoulders', usedB),
        pickExercise(pool, ['split-squat', 'walking-lunge'], 'quads', usedB),
        pickExercise(pool, ['face-pull', 'lateral-raise'], 'shoulders', usedB),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(rB, usedB, 1);

      const { plannedSets: pB, setsCount: cB } = buildCalibratedRoutineSets(rB, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-female-full-b',
        name: 'Posterior Hypertrophy & Delt Poise',
        group: 'Aurelia Protocols',
        color: femaleAccent1,
        exerciseIds: rB,
        setsCount: cB,
        plannedSets: pB,
      });

      const usedC = new Set<string>();
      const rC: string[] = [
        pickExercise(pool, ['barbell-hip-thrust', 'cable-kickback'], 'glutes', usedC),
        pickExercise(pool, ['goblet-squat', 'barbell-squat'], 'quads', usedC),
        pickExercise(pool, ['incline-dumbbell-press', 'push-up'], 'chest', usedC),
        pickExercise(pool, ['standing-calf-raise'], 'calves', usedC),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(rC, usedC, 2);

      const { plannedSets: pC, setsCount: cC } = buildCalibratedRoutineSets(rC, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-female-full-c',
        name: 'Glute Burnout & Transverse Core',
        group: 'Aurelia Protocols',
        color: femaleAccent2,
        exerciseIds: rC,
        setsCount: cC,
        plannedSets: pC,
      });

      if (frequency >= 4) {
        const usedD = new Set<string>();
        const rD: string[] = [
          pickExercise(pool, ['glute-bridge', 'hip-thrust'], 'glutes', usedD),
          pickExercise(pool, ['scapular-push-up', 'face-pull'], 'back', usedD),
          pickExercise(pool, ['walking-lunge'], 'quads', usedD),
        ].filter(Boolean).slice(0, baseExerciseCount) as string[];
        appendAbsFinisher(rD, usedD, 3);

        const { plannedSets: pD, setsCount: cD } = buildCalibratedRoutineSets(rD, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
        routines.push({
          id: 'routine-female-full-d',
          name: 'Pelvic Floor Stability & Mobility Reset',
          group: 'Aurelia Protocols',
          color: femaleAccent3,
          exerciseIds: rD,
          setsCount: cD,
          plannedSets: pD,
        });
      }
    }
  } else {
    // -------------------------------------------------------------
    // MALE / SPARTAN ROUTINE BLUEPRINTS
    // -------------------------------------------------------------
    // Routine 1: Tactical Push & Upper Armor
    const usedM1 = new Set<string>();
    const rm1Ex: string[] = [
      pickExercise(pool, ['EIeI8Vf', 'bench-press', 'barbell-bench-press', 'SpYC0Kp', 'dumbbell-bench-press'], 'chest', usedM1),
      pickExercise(pool, ['3TZduzM', 'incline-bench-press', 'ns0SIbU', 'incline-dumbbell-press'], 'chest', usedM1),
      pickExercise(pool, ['standing-dumbbell-press', 'A6wtbuL', 'overhead-press', 'military-press'], 'shoulders', usedM1),
      pickExercise(pool, ['9WTm7dq', 'chest-dip', 'dip', 'X6C6i5Y'], 'chest', usedM1),
      pickExercise(pool, ['DsgkuIt', 'lateral-raise', 'dumbbell-lateral-raise'], 'shoulders', usedM1),
      pickExercise(pool, ['tricep-pushdown', 'skull-crusher'], 'triceps', usedM1),
    ].filter(Boolean).slice(0, baseExerciseCount) as string[];
    appendAbsFinisher(rm1Ex, usedM1, 0);

    const { plannedSets: pm1, setsCount: cm1 } = buildCalibratedRoutineSets(rm1Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
    routines.push({
      id: 'routine-tactical-push',
      name: workoutKind === 'toning' ? 'Push Definition & Core Toning' : 'Tactical Push & Upper Armor',
      group: 'Spartan Combat Splits',
      color: malePrimaryColor,
      exerciseIds: rm1Ex,
      setsCount: cm1,
      plannedSets: pm1,
    });

    // Routine 2: Combat Pull & Heavy Lat Overload
    const usedM2 = new Set<string>();
    const rm2Ex: string[] = [
      pickExercise(pool, ['lBDjFxJ', 'pull-up', 'weighted-pull-up', 'close-grip-lat-pulldown'], 'back', usedM2),
      pickExercise(pool, ['barbell-row', 'inverted-row', 'seated-cable-row'], 'back', usedM2),
      pickExercise(pool, ['ila4NZS', 'deadlift', 'barbell-deadlift', 'wQ2c4XD'], 'glutes', usedM2),
      pickExercise(pool, ['face-pull', 'banded-face-pull', 'cable-face-pull'], 'shoulders', usedM2),
      pickExercise(pool, ['slDvUAU', 'hammer-curl', 'dumbbell-hammer-curl', '25GPyDY'], 'biceps', usedM2),
    ].filter(Boolean).slice(0, baseExerciseCount) as string[];
    appendAbsFinisher(rm2Ex, usedM2, 1);

    const { plannedSets: pm2, setsCount: cm2 } = buildCalibratedRoutineSets(rm2Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
    routines.push({
      id: 'routine-combat-pull',
      name: 'Combat Pull & Posterior Chain Density',
      group: 'Spartan Combat Splits',
      color: maleAccent1,
      exerciseIds: rm2Ex,
      setsCount: cm2,
      plannedSets: pm2,
    });

    // Routine 3: Armor-Plated Legs & Explosive Drive
    const usedM3 = new Set<string>();
    const rm3Ex: string[] = [
      pickExercise(pool, ['qXTaZnJ', 'squat', 'barbell-full-squat', 'zG0zs85', 'front-squat', 'yn8yg1r'], 'glutes', usedM3),
      pickExercise(pool, ['wQ2c4XD', 'romanian-deadlift', 'sumo-deadlift'], 'glutes', usedM3),
      pickExercise(pool, ['qx4fgX7', 'split-squat', 'walking-lunge', 'leg-press'], 'quads', usedM3),
      pickExercise(pool, ['standing-calf-raise', '8ozhUIZ'], 'calves', usedM3),
    ].filter(Boolean).slice(0, baseExerciseCount) as string[];
    appendAbsFinisher(rm3Ex, usedM3, 2);

    const { plannedSets: pm3, setsCount: cm3 } = buildCalibratedRoutineSets(rm3Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
    routines.push({
      id: 'routine-spartan-legs',
      name: 'Armor-Plated Legs & Compound Drive',
      group: 'Spartan Combat Splits',
      color: maleAccent2,
      exerciseIds: rm3Ex,
      setsCount: cm3,
      plannedSets: pm3,
    });

    // Routine 4: Tactical Calisthenics & Mission Grit (if 4+ days)
    if (frequency >= 4) {
      const usedM4 = new Set<string>();
      const rm4Ex: string[] = [
        pickExercise(pool, ['I4hDWkc', 'push-up', 'archer-push-up', 'deep-push-up'], 'chest', usedM4),
        pickExercise(pool, ['lBDjFxJ', 'pull-up', 'chin-up'], 'back', usedM4),
        pickExercise(pool, ['9WTm7dq', 'dip', 'chest-dip'], 'chest', usedM4),
        pickExercise(pool, ['walking-lunge', 'bodyweight-squat'], 'quads', usedM4),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(rm4Ex, usedM4, 3);

      const { plannedSets: pm4, setsCount: cm4 } = buildCalibratedRoutineSets(rm4Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-tactical-grit',
        name: 'USMC Calisthenics & Core Stamina',
        group: 'Spartan Combat Splits',
        color: maleAccent3,
        exerciseIds: rm4Ex,
        setsCount: cm4,
        plannedSets: pm4,
      });
    }

    // Routine 5: Overhead Power & Arm Density (if 5+ days)
    if (frequency >= 5) {
      const usedM5 = new Set<string>();
      const rm5Ex: string[] = [
        pickExercise(pool, ['overhead-press', 'standing-dumbbell-press', 'A6wtbuL'], 'shoulders', usedM5),
        pickExercise(pool, ['slDvUAU', 'hammer-curl', 'bicep-curl'], 'biceps', usedM5),
        pickExercise(pool, ['tricep-pushdown', 'skull-crusher'], 'triceps', usedM5),
        pickExercise(pool, ['lateral-raise', 'DsgkuIt'], 'shoulders', usedM5),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(rm5Ex, usedM5, 4);

      const { plannedSets: pm5, setsCount: cm5 } = buildCalibratedRoutineSets(rm5Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-shoulder-arm-density',
        name: 'Overhead Power & Arm Density Finisher',
        group: 'Spartan Combat Splits',
        color: '#E07A5F',
        exerciseIds: rm5Ex,
        setsCount: cm5,
        plannedSets: pm5,
      });
    }

    // Routine 6: Compound Carry & Structural Overload (if 6+ days)
    if (frequency >= 6) {
      const usedM6 = new Set<string>();
      const rm6Ex: string[] = [
        pickExercise(pool, ['ila4NZS', 'deadlift', 'sumo-deadlift'], 'glutes', usedM6),
        pickExercise(pool, ['barbell-row', 'inverted-row'], 'back', usedM6),
        pickExercise(pool, ['goblet-squat', 'front-squat'], 'quads', usedM6),
        pickExercise(pool, ['standing-calf-raise'], 'calves', usedM6),
      ].filter(Boolean).slice(0, baseExerciseCount) as string[];
      appendAbsFinisher(rm6Ex, usedM6, 5);

      const { plannedSets: pm6, setsCount: cm6 } = buildCalibratedRoutineSets(rm6Ex, allBuiltinExercises, workoutKind, experience, isFemale, equipment);
      routines.push({
        id: 'routine-compound-carry-overload',
        name: 'Deadlift Power & Structural Integrity',
        group: 'Spartan Combat Splits',
        color: '#D9A184',
        exerciseIds: rm6Ex,
        setsCount: cm6,
        plannedSets: pm6,
      });
    }
  }

  // -------------------------------------------------------------
  // POPULATE CALIBRATED SETS & REPS FOR EACH ROUTINE
  // -------------------------------------------------------------
  routines.forEach((routine) => {
    const { plannedSets, setsCount } = buildCalibratedRoutineSets(
      routine.exerciseIds,
      allBuiltinExercises,
      workoutKind,
      experience,
      isFemale,
      equipment
    );
    routine.plannedSets = plannedSets;
    routine.setsCount = setsCount;
  });

  // -------------------------------------------------------------
  // WEEKLY PLAN MAPPING ONTO EXACT SELECTED DAYS (1=Mon .. 7=Sun)
  // -------------------------------------------------------------
  selectedDays.forEach((dayNumber, index) => {
    const routine = routines[index % routines.length];
    if (routine) {
      weeklyPlan[dayNumber] = routine.id;
    }
  });

  // -------------------------------------------------------------
  // NUTRITION & MACRO TARGETS CALCULATION
  // -------------------------------------------------------------
  let calories = 2000;
  let protein = 140;
  let carbs = 200;
  let fat = 60;
  let waterMl = 3000;
  let fastingHours = 16;
  let fastStartTime = '20:00';

  if (isFemale) {
    if (workoutKind === 'toning') {
      calories = 1750;
      protein = 135;
      carbs = 160;
      fat = 50;
      waterMl = 2800;
    } else if (workoutKind === 'glute_sculpt') {
      calories = 1950;
      protein = 140;
      carbs = 200;
      fat = 55;
      waterMl = 3000;
    } else if (workoutKind === 'strength') {
      calories = 2100;
      protein = 145;
      carbs = 225;
      fat = 60;
      waterMl = 3200;
    } else {
      calories = 1850;
      protein = 130;
      carbs = 180;
      fat = 55;
      waterMl = 2800;
    }

    if (fasting === 'omad') {
      fastingHours = 23;
      fastStartTime = '18:30';
    } else if (fasting === '20_4') {
      fastingHours = 20;
      fastStartTime = '20:00';
    } else if (fasting === 'standard') {
      fastingHours = 12;
      fastStartTime = '21:00';
    } else {
      fastingHours = 16;
      fastStartTime = '20:00';
    }
  } else {
    // Male
    if (workoutKind === 'toning') {
      calories = 2250;
      protein = 200;
      carbs = 210;
      fat = 60;
      waterMl = 3600;
    } else if (workoutKind === 'combat') {
      calories = 2650;
      protein = 210;
      carbs = 260;
      fat = 70;
      waterMl = 3800;
    } else if (workoutKind === 'hypertrophy') {
      calories = 2800;
      protein = 215;
      carbs = 290;
      fat = 75;
      waterMl = 4000;
    } else if (workoutKind === 'strength') {
      calories = 2950;
      protein = 220;
      carbs = 315;
      fat = 80;
      waterMl = 4200;
    } else {
      calories = 2500;
      protein = 195;
      carbs = 240;
      fat = 65;
      waterMl = 3500;
    }

    if (fasting === 'omad') {
      fastingHours = 23;
      fastStartTime = '18:30';
    } else if (fasting === '20_4') {
      fastingHours = 20;
      fastStartTime = '20:00';
    } else if (fasting === 'standard') {
      fastingHours = 12;
      fastStartTime = '21:00';
    } else {
      fastingHours = 16;
      fastStartTime = '20:00';
    }
  }

  // Adjust hydration for longer sessions
  if (workoutDuration >= 60) {
    waterMl += 400;
  }

  const nutritionTargets: NutritionTargets = {
    calories,
    protein,
    carbs,
    fat,
    waterMl,
    fastingHours,
    fastingProtocol: fasting,
    fastStartTime,
  };

  // -------------------------------------------------------------
  // 14-DAY CALENDAR SCHEDULE GENERATION (MAPPED TO EXACT DAYS)
  // -------------------------------------------------------------
  const scheduledEvents: ScheduledEvent[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const curDate = new Date();
    curDate.setDate(today.getDate() + i);
    const dateStr = getLocalDateString(curDate);
    const dayOfWeek = curDate.getDay() || 7; // 1 = Mon .. 7 = Sun
    const isToday = i === 0;

    // 1. Morning Hydration
    scheduledEvents.push({
      id: `sched-hydro-${dateStr}`,
      date: dateStr,
      time: '06:00',
      durationMinutes: 15,
      title: 'Cellular Hydration: 24oz Filtered Water + Mineral Electrolytes',
      category: 'recovery',
      tier: 1,
      citation: 'Huberman Lab: Sodium-potassium cellular pump charging upon waking',
      completed: isToday,
    });

    // 2. Physical Workout vs Active Recovery
    const isWorkoutDay = selectedDays.includes(dayOfWeek);
    const assignedRoutineId = weeklyPlan[dayOfWeek];

    if (isWorkoutDay && assignedRoutineId) {
      const routine = routines.find((r) => r.id === assignedRoutineId);
      const routineName = routine ? routine.name : 'Targeted Protocol';

      scheduledEvents.push({
        id: `sched-workout-${dateStr}`,
        date: dateStr,
        time: workoutTime,
        durationMinutes: workoutDuration,
        title: `${routineName} (${routine?.exerciseIds.length || 5} movements)`,
        category: 'workout',
        tier: 3,
        routineId: assignedRoutineId,
        citation: isFemale
          ? 'Contreras & Schoenfeld: Progressive tension overload on target motor units'
          : 'Schoenfeld: Direct compound set density near mechanical failure',
        completed: false,
      });
    } else {
      // Off day: Active Recovery & Mobility
      scheduledEvents.push({
        id: `sched-recovery-${dateStr}`,
        date: dateStr,
        time: '08:00',
        durationMinutes: 30,
        title: isFemale
          ? 'Sovereign Mobility & Deep Glute/Hip Alignment Walk'
          : 'CNS Parasympathetic Recovery Walk & Joint Mobility Reset',
        category: 'recovery',
        tier: 1,
        citation: 'Fatigue dissipation without systemic joint inflammation',
        completed: false,
      });
    }

    // 3. Fasting & Feeding Blocks
    if (fasting === '16_8') {
      scheduledEvents.push({
        id: `sched-feed-open-${dateStr}`,
        date: dateStr,
        time: '12:00',
        durationMinutes: 30,
        title: 'Feeding Window Opens (12:00 - 20:00): High Protein Refeed 1',
        category: 'meal',
        tier: 2,
        citation: '16:8 Lean Gains: Optimal insulin sensitivity & muscle protein synthesis',
        completed: false,
      });
      scheduledEvents.push({
        id: `sched-fast-start-${dateStr}`,
        date: dateStr,
        time: '20:00',
        durationMinutes: 15,
        title: 'Fasting Window Begins (20:00): Hydration & Autophagy Lock',
        category: 'habit',
        tier: 2,
        citation: 'De Cabo & Mattson: Autophagy cellular clearing cascade',
        completed: false,
      });
    } else if (fasting === 'omad') {
      scheduledEvents.push({
        id: `sched-omad-feed-${dateStr}`,
        date: dateStr,
        time: '17:30',
        durationMinutes: 60,
        title: '23:1 Warrior Feast: Complete Micronutrient & Protein Refeed',
        category: 'meal',
        tier: 3,
        citation: 'Maximal cellular autophagy surge followed by high-gravity single refeed',
        completed: false,
      });
    } else if (fasting === '20_4') {
      scheduledEvents.push({
        id: `sched-feed-open-${dateStr}`,
        date: dateStr,
        time: '16:00',
        durationMinutes: 30,
        title: '20:4 Feeding Window Opens (16:00 - 20:00): Primary Refeed',
        category: 'meal',
        tier: 2,
        completed: false,
      });
      scheduledEvents.push({
        id: `sched-fast-start-${dateStr}`,
        date: dateStr,
        time: '20:00',
        durationMinutes: 15,
        title: '20:4 Fasting Window Commences',
        category: 'habit',
        tier: 2,
        completed: false,
      });
    } else {
      // Standard whole food meals
      scheduledEvents.push({
        id: `sched-meal-1-${dateStr}`,
        date: dateStr,
        time: '07:30',
        durationMinutes: 30,
        title: 'Whole Food Breakfast: High Protein & Complex Micronutrients',
        category: 'meal',
        tier: 2,
        completed: false,
      });
      scheduledEvents.push({
        id: `sched-meal-2-${dateStr}`,
        date: dateStr,
        time: '12:30',
        durationMinutes: 30,
        title: 'Balanced Lunch: Lean Protein & Clean Carbohydrate Refeed',
        category: 'meal',
        tier: 2,
        completed: false,
      });
      scheduledEvents.push({
        id: `sched-meal-3-${dateStr}`,
        date: dateStr,
        time: '19:00',
        durationMinutes: 45,
        title: 'Evening Dinner: Recovery Feast & Essential Healthy Fats',
        category: 'meal',
        tier: 2,
        completed: false,
      });
    }

    // 4. Evening Wind-down
    scheduledEvents.push({
      id: `sched-sleep-${dateStr}`,
      date: dateStr,
      time: '21:30',
      durationMinutes: 30,
      title: 'CNS Recovery Wind-down: Magnesium Shield & Screen Dimming',
      category: 'sleep',
      tier: 1,
      citation: 'Walker: Non-REM deep sleep drives 95% of natural GH pulsatile release',
      completed: false,
    });
  }

  // Summary object for UI confirmation screen
  const kindLabels: Record<string, string> = {
    toning: 'Lean Toning & Definition',
    glute_sculpt: 'Glute & Posture Sculpt',
    hypertrophy: 'Muscle Hypertrophy & Density',
    strength: 'Raw Compound Strength',
    combat: 'USMC Combat Readiness',
  };

  const equipLabels: Record<string, string> = {
    full_gym: 'Full Commercial Gym',
    barbell_home: 'Iron Home Gym',
    dumbbells: 'Dumbbells & Bench',
    bodyweight: 'Bodyweight & Mobility Only',
  };

  const selectedDaysText = selectedDays.map((d) => DAY_NAMES[d]?.short || `Day ${d}`).join(', ');

  const activeAddons: string[] = [];
  if (hasAbsCoreAddon) activeAddons.push('Daily Abs & Core Finisher');
  if (hasGluteAddon) activeAddons.push('Glute & Posterior Chain Priority');
  if (hasPostureAddon) activeAddons.push('Posture & Hourglass V-Taper');
  if (hasArmsAddon) activeAddons.push('Delts & Arm Density');

  const summary: PlanSummary = {
    splitName: `${frequency}-Day ${isFemale ? 'Empress' : 'Spartan'} ${kindLabels[workoutKind] || 'Adaptive System'}`,
    routineCount: routines.length,
    daysScheduled: 14,
    selectedDaysText: `${frequency} Days/Week (${selectedDaysText})`,
    workoutTimeText: `${workoutTime} Daily`,
    durationText: `${workoutDuration} min session`,
    primaryFocusTitle: kindLabels[workoutKind] || 'Full Body Optimization',
    equipmentTitle: equipLabels[equipment] || 'Full Gym',
    nutritionTitle: `${fasting.toUpperCase().replace('_', ':')} Protocol · ${calories} kcal`,
    macrosSummary: `${protein}g Protein · ${carbs}g Carbs · ${fat}g Fat · ${(waterMl / 1000).toFixed(1)}L Water`,
    activeAddons,
  };

  return {
    routines,
    weeklyPlan,
    scheduledEvents,
    nutritionTargets,
    profileUpdates: {
      name: answers.name || (isFemale ? 'Sophia' : 'Marcus'),
      callsign: answers.callsign || (isFemale ? 'Aurelia' : 'Spartan'),
      gender: answers.gender,
      bio: isFemale
        ? 'Empress & Aurelia Discipline · Toned Strength & Poise'
        : answers.personality === 'marine'
        ? 'USMC Combat Conditioning · Semper Fidelis · Lift. Log it. Grow.'
        : 'Stoic Iron Discipline · Sovereignty of Mind & Body',
    },
    settingsUpdates: {
      gender: answers.gender,
      coachPersonality: personality,
      heatTone: isFemale ? 'rose' : 'ember',
      onboardingCompleted: true,
    },
    coachPersonality: personality,
    summary,
  };
}
