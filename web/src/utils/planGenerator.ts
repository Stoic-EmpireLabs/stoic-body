import type {
  Exercise,
  Routine,
  ScheduledEvent,
  NutritionTargets,
  Profile,
  Settings,
  CoachPersonality,
  OnboardingAnswers,
} from '../types';
import { getLocalDateString } from '../data/defaultSchedule';

export interface PlanSummary {
  splitName: string;
  routineCount: number;
  daysScheduled: number;
  primaryFocusTitle: string;
  equipmentTitle: string;
  nutritionTitle: string;
  macrosSummary: string;
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

export function generateCustomPlan(
  answers: OnboardingAnswers,
  allBuiltinExercises: Exercise[]
): GeneratedPlan {
  const isFemale = answers.gender === 'female';
  const equipment = answers.equipment || 'full_gym';
  const experience = answers.experience || 'intermediate';
  const frequency = (answers.frequency || (isFemale ? 4 : 4)) as 3 | 4 | 5 | 6;
  const workoutTime = answers.workoutTime || (isFemale ? '07:30' : '06:00');
  const fasting = answers.fasting || (isFemale ? '16_8' : 'omad');
  const personality = answers.personality || (isFemale ? 'aurelia' : 'marine');

  const pool = filterByEquipment(allBuiltinExercises, equipment);
  const targetExerciseCount = experience === 'veteran' ? 6 : experience === 'intermediate' ? 5 : 4;

  const routines: Routine[] = [];
  const weeklyPlan: Record<number, string> = {};

  // Accent Colors
  const femalePrimaryColor = '#E0A899'; // Rose Gold
  const femaleAccent1 = '#8FA377'; // Sage
  const femaleAccent2 = '#7FA8C9'; // Soft Slate
  const femaleAccent3 = '#D4A373'; // Amber Gold

  const malePrimaryColor = '#D9A184'; // Ember Gold
  const maleAccent1 = '#C85A48'; // Spartan Crimson
  const maleAccent2 = '#7FA8C9'; // Tactical Slate
  const maleAccent3 = '#8FA377'; // Olive Field

  // -------------------------------------------------------------
  // FEMALE ROUTINE BLUEPRINTS
  // -------------------------------------------------------------
  if (isFemale) {
    if (answers.focus === 'glute_waist' || !answers.focus) {
      // 1. Glute Hypertrophy & Hip Thrust Primary
      const used1 = new Set<string>();
      const r1Ex: string[] = [
        pickExercise(pool, ['hip-thrust', 'barbell-hip-thrust', 'dumbbell-hip-thrust', 'glute-bridge'], 'glutes', used1),
        pickExercise(pool, ['wQ2c4XD', 'romanian-deadlift', 'barbell-romanian-deadlift', 'dumbbell-romanian-deadlift'], 'glutes', used1),
        pickExercise(pool, ['qx4fgX7', 'split-squat', 'dumbbell-single-leg-split-squat', 'bulgarian-split-squat'], 'quads', used1),
        pickExercise(pool, ['HEJ6DIX', 'cable-glute-kickback', 'cable-kickback', 'glute-kickback', 'banded-glute-kickback'], 'glutes', used1),
        pickExercise(pool, ['dead-bug', 'deadbug', 'banded-dead-bug', 'plank'], 'abdomen', used1),
        pickExercise(pool, ['standing-calf-raise', '8ozhUIZ', 'calf-raise'], 'calves', used1),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-glute-hypertrophy',
        name: 'Glute Hypertrophy & Hip Thrust Primary',
        group: 'Empress Periodization',
        color: femalePrimaryColor,
        exerciseIds: r1Ex,
      });

      // 2. Upper Torso & Posture Definition (Hourglass V-Taper)
      const used2 = new Set<string>();
      const r2Ex: string[] = [
        pickExercise(pool, ['close-grip-lat-pulldown', 'lat-pulldown', 'wide-grip-lat-pulldown', 'pull-up'], 'back', used2),
        pickExercise(pool, ['standing-dumbbell-press', 'A6wtbuL', 'dumbbell-shoulder-press', 'overhead-press'], 'shoulders', used2),
        pickExercise(pool, ['face-pull', 'banded-face-pull', 'cable-face-pull'], 'shoulders', used2),
        pickExercise(pool, ['ns0SIbU', 'incline-dumbbell-press', 'dumbbell-incline-bench-press', '3TZduzM'], 'chest', used2),
        pickExercise(pool, ['DsgkuIt', 'lateral-raise', 'dumbbell-lateral-raise', 'goJ6ezq'], 'shoulders', used2),
        pickExercise(pool, ['scapular-push-up', 'push-up', 'knee-push-up'], 'chest', used2),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-upper-posture',
        name: 'Hourglass Torso & Posture Sculpt',
        group: 'Empress Periodization',
        color: femaleAccent1,
        exerciseIds: r2Ex,
      });

      // 3. Lower Posterior & Hamstring Curve
      const used3 = new Set<string>();
      const r3Ex: string[] = [
        pickExercise(pool, ['KgI0tqW', 'sumo-deadlift', 'barbell-sumo-deadlift', 'ila4NZS', 'deadlift'], 'glutes', used3),
        pickExercise(pool, ['yn8yg1r', 'goblet-squat', 'dumbbell-goblet-squat', 'barbell-squat', 'qXTaZnJ'], 'quads', used3),
        pickExercise(pool, ['leg-press', 'leg-extension', 'dumbbell-lunge', 'walking-lunge'], 'quads', used3),
        pickExercise(pool, ['zHEpuuc', 'leg-curl', 'cable-assisted-inverse-leg-curl', 'hamstring-curl'], 'hamstrings', used3),
        pickExercise(pool, ['standing-calf-raise', '8ozhUIZ'], 'calves', used3),
        pickExercise(pool, ['plank', 'side-plank'], 'abdomen', used3),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-lower-posterior',
        name: 'Posterior Chain & Hamstring Curve',
        group: 'Empress Periodization',
        color: femaleAccent2,
        exerciseIds: r3Ex,
      });

      // 4. Core, Pelvic Stability & Glute Burnout
      const used4 = new Set<string>();
      const r4Ex: string[] = [
        pickExercise(pool, ['hip-thrust', 'dumbbell-hip-thrust', 'glute-bridge'], 'glutes', used4),
        pickExercise(pool, ['hanging-leg-raise', 'hanging-knee-raise', 'dead-bug'], 'abdomen', used4),
        pickExercise(pool, ['cable-woodchopper', 'russian-twist', 'plank'], 'abdomen', used4),
        pickExercise(pool, ['walking-lunge', 'dumbbell-lunge', 'split-squat'], 'quads', used4),
        pickExercise(pool, ['cable-kickback', 'banded-hip-thrust'], 'glutes', used4),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-core-glute-burnout',
        name: 'Pelvic Floor Stability & Glute Finisher',
        group: 'Empress Periodization',
        color: femaleAccent3,
        exerciseIds: r4Ex,
      });

      // 5. Full Body Toned Conditioning (if 5+ days)
      if (frequency >= 5) {
        const used5 = new Set<string>();
        const r5Ex: string[] = [
          pickExercise(pool, ['goblet-squat', 'dumbbell-goblet-squat'], 'quads', used5),
          pickExercise(pool, ['push-up', 'knee-push-up', 'I4hDWkc'], 'chest', used5),
          pickExercise(pool, ['dumbbell-bench-press', 'SpYC0Kp'], 'chest', used5),
          pickExercise(pool, ['dumbbell-hammer-curl', 'slDvUAU'], 'biceps', used5),
          pickExercise(pool, ['plank', 'dead-bug'], 'abdomen', used5),
        ].filter(Boolean).slice(0, targetExerciseCount) as string[];

        routines.push({
          id: 'routine-fullbody-metabolic',
          name: 'Empress Full Body Metabolic Sculpt',
          group: 'Empress Periodization',
          color: '#C490D1',
          exerciseIds: r5Ex,
        });
      }

      // 6. Delts, Arms & Calves Hyper-Pump (if 6 days)
      if (frequency >= 6) {
        const used6 = new Set<string>();
        const r6Ex: string[] = [
          pickExercise(pool, ['lateral-raise', 'DsgkuIt'], 'shoulders', used6),
          pickExercise(pool, ['face-pull', 'banded-face-pull'], 'shoulders', used6),
          pickExercise(pool, ['bicep-curl', '25GPyDY'], 'biceps', used6),
          pickExercise(pool, ['standing-calf-raise', '8ozhUIZ'], 'calves', used6),
          pickExercise(pool, ['plank', 'dead-bug'], 'abdomen', used6),
        ].filter(Boolean).slice(0, targetExerciseCount) as string[];

        routines.push({
          id: 'routine-delts-arms-sculpt',
          name: 'Delts, Triceps & Calves High-Tension Pump',
          group: 'Empress Periodization',
          color: '#E0A899',
          exerciseIds: r6Ex,
        });
      }
    } else {
      // General Athletic / Toning for Female
      const usedA = new Set<string>();
      routines.push({
        id: 'routine-female-full-a',
        name: 'Full Body Alignment & Core Sculpt',
        group: 'Aurelia Protocols',
        color: femalePrimaryColor,
        exerciseIds: [
          pickExercise(pool, ['hip-thrust', 'dumbbell-hip-thrust'], 'glutes', usedA),
          pickExercise(pool, ['lat-pulldown', 'pull-up'], 'back', usedA),
          pickExercise(pool, ['dumbbell-bench-press', 'push-up'], 'chest', usedA),
          pickExercise(pool, ['dead-bug', 'plank'], 'abdomen', usedA),
          pickExercise(pool, ['standing-calf-raise'], 'calves', usedA),
        ].filter(Boolean).slice(0, targetExerciseCount) as string[],
      });

      const usedB = new Set<string>();
      routines.push({
        id: 'routine-female-full-b',
        name: 'Posterior Hypertrophy & Delt Poise',
        group: 'Aurelia Protocols',
        color: femaleAccent1,
        exerciseIds: [
          pickExercise(pool, ['romanian-deadlift', 'sumo-deadlift'], 'glutes', usedB),
          pickExercise(pool, ['standing-dumbbell-press', 'overhead-press'], 'shoulders', usedB),
          pickExercise(pool, ['split-squat', 'walking-lunge'], 'quads', usedB),
          pickExercise(pool, ['face-pull', 'lateral-raise'], 'shoulders', usedB),
          pickExercise(pool, ['hanging-leg-raise', 'plank'], 'abdomen', usedB),
        ].filter(Boolean).slice(0, targetExerciseCount) as string[],
      });

      const usedC = new Set<string>();
      routines.push({
        id: 'routine-female-full-c',
        name: 'Glute Burnout & Transverse Core',
        group: 'Aurelia Protocols',
        color: femaleAccent2,
        exerciseIds: [
          pickExercise(pool, ['barbell-hip-thrust', 'cable-kickback'], 'glutes', usedC),
          pickExercise(pool, ['goblet-squat', 'barbell-squat'], 'quads', usedC),
          pickExercise(pool, ['incline-dumbbell-press', 'push-up'], 'chest', usedC),
          pickExercise(pool, ['cable-woodchopper', 'dead-bug'], 'abdomen', usedC),
          pickExercise(pool, ['standing-calf-raise'], 'calves', usedC),
        ].filter(Boolean).slice(0, targetExerciseCount) as string[],
      });

      if (frequency >= 4) {
        const usedD = new Set<string>();
        routines.push({
          id: 'routine-female-full-d',
          name: 'Pelvic Floor Stability & Mobility Reset',
          group: 'Aurelia Protocols',
          color: femaleAccent3,
          exerciseIds: [
            pickExercise(pool, ['glute-bridge', 'hip-thrust'], 'glutes', usedD),
            pickExercise(pool, ['scapular-push-up', 'face-pull'], 'back', usedD),
            pickExercise(pool, ['dead-bug', 'plank'], 'abdomen', usedD),
            pickExercise(pool, ['walking-lunge'], 'quads', usedD),
          ].filter(Boolean).slice(0, targetExerciseCount) as string[],
        });
      }
    }
  } else {
    // -------------------------------------------------------------
    // MALE / SPARTAN ROUTINE BLUEPRINTS
    // -------------------------------------------------------------
    // 1. Tactical Push & Heavy Chest Armor
    const usedM1 = new Set<string>();
    const rm1Ex: string[] = [
      pickExercise(pool, ['EIeI8Vf', 'bench-press', 'barbell-bench-press', 'SpYC0Kp', 'dumbbell-bench-press'], 'chest', usedM1),
      pickExercise(pool, ['3TZduzM', 'incline-bench-press', 'ns0SIbU', 'incline-dumbbell-press'], 'chest', usedM1),
      pickExercise(pool, ['standing-dumbbell-press', 'A6wtbuL', 'overhead-press', 'military-press'], 'shoulders', usedM1),
      pickExercise(pool, ['9WTm7dq', 'chest-dip', 'dip', 'X6C6i5Y'], 'chest', usedM1),
      pickExercise(pool, ['DsgkuIt', 'lateral-raise', 'dumbbell-lateral-raise'], 'shoulders', usedM1),
      pickExercise(pool, ['tricep-pushdown', 'skull-crusher'], 'triceps', usedM1),
    ].filter(Boolean).slice(0, targetExerciseCount) as string[];

    routines.push({
      id: 'routine-tactical-push',
      name: 'Tactical Push & Upper Armor',
      group: 'Spartan Combat Splits',
      color: malePrimaryColor,
      exerciseIds: rm1Ex,
    });

    // 2. Combat Pull & Heavy Lat Overload
    const usedM2 = new Set<string>();
    const rm2Ex: string[] = [
      pickExercise(pool, ['lBDjFxJ', 'pull-up', 'weighted-pull-up', 'close-grip-lat-pulldown'], 'back', usedM2),
      pickExercise(pool, ['barbell-row', 'inverted-row', 'seated-cable-row'], 'back', usedM2),
      pickExercise(pool, ['ila4NZS', 'deadlift', 'barbell-deadlift', 'wQ2c4XD'], 'glutes', usedM2),
      pickExercise(pool, ['face-pull', 'banded-face-pull', 'cable-face-pull'], 'shoulders', usedM2),
      pickExercise(pool, ['slDvUAU', 'hammer-curl', 'dumbbell-hammer-curl', '25GPyDY'], 'biceps', usedM2),
      pickExercise(pool, ['VBAWRPG', 'plank', 'weighted-front-plank'], 'abdomen', usedM2),
    ].filter(Boolean).slice(0, targetExerciseCount) as string[];

    routines.push({
      id: 'routine-combat-pull',
      name: 'Combat Pull & Heavy Posterior Overload',
      group: 'Spartan Combat Splits',
      color: maleAccent1,
      exerciseIds: rm2Ex,
    });

    // 3. Armor-Plated Legs & Explosive Drive
    const usedM3 = new Set<string>();
    const rm3Ex: string[] = [
      pickExercise(pool, ['qXTaZnJ', 'squat', 'barbell-full-squat', 'zG0zs85', 'front-squat', 'yn8yg1r'], 'glutes', usedM3),
      pickExercise(pool, ['wQ2c4XD', 'romanian-deadlift', 'sumo-deadlift'], 'glutes', usedM3),
      pickExercise(pool, ['qx4fgX7', 'split-squat', 'walking-lunge', 'leg-press'], 'quads', usedM3),
      pickExercise(pool, ['standing-calf-raise', '8ozhUIZ'], 'calves', usedM3),
      pickExercise(pool, ['hanging-leg-raise', 'dead-bug', 'plank'], 'abdomen', usedM3),
    ].filter(Boolean).slice(0, targetExerciseCount) as string[];

    routines.push({
      id: 'routine-spartan-legs',
      name: 'Armor-Plated Legs & Compound Drive',
      group: 'Spartan Combat Splits',
      color: maleAccent2,
      exerciseIds: rm3Ex,
    });

    // 4. Tactical Calisthenics & Mission Grit (if 4+ days)
    if (frequency >= 4) {
      const usedM4 = new Set<string>();
      const rm4Ex: string[] = [
        pickExercise(pool, ['I4hDWkc', 'push-up', 'archer-push-up', 'deep-push-up'], 'chest', usedM4),
        pickExercise(pool, ['lBDjFxJ', 'pull-up', 'chin-up'], 'back', usedM4),
        pickExercise(pool, ['9WTm7dq', 'dip', 'chest-dip'], 'chest', usedM4),
        pickExercise(pool, ['hanging-leg-raise', 'hanging-knee-raise'], 'abdomen', usedM4),
        pickExercise(pool, ['walking-lunge', 'bodyweight-squat'], 'quads', usedM4),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-tactical-grit',
        name: 'USMC Calisthenics & Tactical Grit',
        group: 'Spartan Combat Splits',
        color: maleAccent3,
        exerciseIds: rm4Ex,
      });
    }

    // 5. Heavy Overhead Press & Arm Density (if 5+ days)
    if (frequency >= 5) {
      const usedM5 = new Set<string>();
      const rm5Ex: string[] = [
        pickExercise(pool, ['overhead-press', 'standing-dumbbell-press', 'A6wtbuL'], 'shoulders', usedM5),
        pickExercise(pool, ['slDvUAU', 'hammer-curl', 'bicep-curl'], 'biceps', usedM5),
        pickExercise(pool, ['tricep-pushdown', 'skull-crusher'], 'triceps', usedM5),
        pickExercise(pool, ['lateral-raise', 'DsgkuIt'], 'shoulders', usedM5),
        pickExercise(pool, ['plank', 'dead-bug'], 'abdomen', usedM5),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-shoulder-arm-density',
        name: 'Overhead Power & Arm Density Finisher',
        group: 'Spartan Combat Splits',
        color: '#E07A5F',
        exerciseIds: rm5Ex,
      });
    }

    // 6. Heavy Compound Deadlift & Carry Overload (if 6 days)
    if (frequency >= 6) {
      const usedM6 = new Set<string>();
      const rm6Ex: string[] = [
        pickExercise(pool, ['ila4NZS', 'deadlift', 'sumo-deadlift'], 'glutes', usedM6),
        pickExercise(pool, ['barbell-row', 'inverted-row'], 'back', usedM6),
        pickExercise(pool, ['goblet-squat', 'front-squat'], 'quads', usedM6),
        pickExercise(pool, ['standing-calf-raise'], 'calves', usedM6),
        pickExercise(pool, ['plank', 'hanging-leg-raise'], 'abdomen', usedM6),
      ].filter(Boolean).slice(0, targetExerciseCount) as string[];

      routines.push({
        id: 'routine-compound-carry-overload',
        name: 'Deadlift Power & Structural Integrity',
        group: 'Spartan Combat Splits',
        color: '#D9A184',
        exerciseIds: rm6Ex,
      });
    }
  }

  // -------------------------------------------------------------
  // WEEKLY PLAN MAPPING (1 = Mon .. 7 = Sun)
  // -------------------------------------------------------------
  if (frequency === 3) {
    weeklyPlan[1] = routines[0]?.id || '';
    weeklyPlan[3] = routines[1]?.id || '';
    weeklyPlan[5] = routines[2]?.id || '';
  } else if (frequency === 4) {
    weeklyPlan[1] = routines[0]?.id || '';
    weeklyPlan[2] = routines[1]?.id || '';
    weeklyPlan[4] = routines[2]?.id || '';
    weeklyPlan[5] = routines[3]?.id || (routines[0]?.id || '');
  } else if (frequency === 5) {
    weeklyPlan[1] = routines[0]?.id || '';
    weeklyPlan[2] = routines[1]?.id || '';
    weeklyPlan[3] = routines[2]?.id || '';
    weeklyPlan[4] = routines[3]?.id || '';
    weeklyPlan[5] = routines[4]?.id || '';
  } else if (frequency === 6) {
    weeklyPlan[1] = routines[0]?.id || '';
    weeklyPlan[2] = routines[1]?.id || '';
    weeklyPlan[3] = routines[2]?.id || '';
    weeklyPlan[4] = routines[3]?.id || '';
    weeklyPlan[5] = routines[4]?.id || '';
    weeklyPlan[6] = routines[5]?.id || (routines[0]?.id || '');
  }

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
    if (answers.focus === 'glute_waist') {
      calories = 1950;
      protein = 135;
      carbs = 200;
      fat = 55;
      waterMl = 2800;
    } else if (answers.focus === 'pilates_tone') {
      calories = 1750;
      protein = 125;
      carbs = 165;
      fat = 50;
      waterMl = 2600;
    } else if (answers.focus === 'strength') {
      calories = 2100;
      protein = 145;
      carbs = 225;
      fat = 60;
      waterMl = 3000;
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
    if (answers.focus === 'combat') {
      calories = 2600;
      protein = 200;
      carbs = 250;
      fat = 70;
      waterMl = 3600;
    } else if (answers.focus === 'hypertrophy') {
      calories = 2750;
      protein = 210;
      carbs = 285;
      fat = 75;
      waterMl = 3800;
    } else if (answers.focus === 'strength') {
      calories = 2900;
      protein = 215;
      carbs = 310;
      fat = 80;
      waterMl = 4000;
    } else {
      calories = 2450;
      protein = 190;
      carbs = 230;
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
  // 14-DAY CALENDAR SCHEDULE GENERATION
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
    const assignedRoutineId = weeklyPlan[dayOfWeek];
    if (assignedRoutineId) {
      const routine = routines.find((r) => r.id === assignedRoutineId);
      const routineName = routine ? routine.name : 'Targeted Split';
      const duration = experience === 'veteran' ? 60 : experience === 'intermediate' ? 50 : 45;

      scheduledEvents.push({
        id: `sched-workout-${dateStr}`,
        date: dateStr,
        time: workoutTime,
        durationMinutes: duration,
        title: `${routineName} (${routine?.exerciseIds.length || 5} movements)`,
        category: 'workout',
        tier: 3,
        routineId: assignedRoutineId,
        citation: isFemale
          ? 'Contreras & Schoenfeld (2020): High-tension gluteal muscle fiber recruitment'
          : 'Schoenfeld (2017): Direct compound set density near mechanical failure',
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
        citation: 'Proactive fatigue clearing prevents systemic inflammation and joint overload',
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
  const focusLabels: Record<string, string> = {
    glute_waist: 'Glute Hypertrophy & Waist Sculpt',
    pilates_tone: 'Lean Toning & Core Posture',
    athletic: 'Metabolic Conditioning & Functional Engine',
    strength: 'Compound Iron Strength',
    combat: 'USMC Combat Conditioning',
    hypertrophy: 'Muscle Hypertrophy & Density',
  };

  const equipLabels: Record<string, string> = {
    full_gym: 'Full Commercial Gym',
    barbell_home: 'Iron Home Gym',
    dumbbells: 'Dumbbells & Bench Only',
    bodyweight: 'Bodyweight & Calisthenics Only',
  };

  const summary: PlanSummary = {
    splitName: `${frequency}-Day ${isFemale ? 'Empress' : 'Spartan'} ${focusLabels[answers.focus] || 'Custom Protocol'}`,
    routineCount: routines.length,
    daysScheduled: 14,
    primaryFocusTitle: focusLabels[answers.focus] || 'Full Body Optimization',
    equipmentTitle: equipLabels[equipment] || 'Full Gym',
    nutritionTitle: `${fasting.toUpperCase().replace('_', ':')} Protocol · ${calories} kcal`,
    macrosSummary: `${protein}g Protein · ${carbs}g Carbs · ${fat}g Fat · ${(waterMl / 1000).toFixed(1)}L Water`,
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
