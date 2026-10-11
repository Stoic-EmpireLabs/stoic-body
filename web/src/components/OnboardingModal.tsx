import React, { useState, useMemo } from 'react';
import { useGymStore, allBuiltinExercises } from '../store/useGymStore';
import {
  Shield,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Target,
  Clock,
  Heart,
  Flame,
  User,
  Zap,
  Calendar,
  Utensils,
  Layers,
  ChevronRight,
  Activity,
  CheckSquare,
  Square,
  Award,
} from 'lucide-react';
import type { OnboardingAnswers, CoachPersonality } from '../types';
import { generateCustomPlan, DAY_NAMES } from '../utils/planGenerator';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, completeOnboarding, dismissOnboarding } = useGymStore();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;

  const [answers, setAnswers] = useState<OnboardingAnswers>({
    gender: 'female',
    name: 'Sophia',
    callsign: 'Aurelia',
    workoutKind: 'toning',
    focus: 'glute_waist',
    experience: 'intermediate',
    equipment: 'full_gym',
    selectedDays: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
    workoutTime: '07:30',
    workoutDuration: 45,
    targetEmphasis: ['abs_core', 'glutes', 'posture_waist'],
    fasting: '16_8',
    personality: 'aurelia',
  });

  // Dynamically compute custom plan preview on the fly
  const computedPlan = useMemo(() => {
    return generateCustomPlan(answers, allBuiltinExercises);
  }, [answers]);

  if (!showOnboarding) return null;

  const isFemale = answers.gender === 'female';
  const accentColor = isFemale ? '#E0A899' : '#D9A184';

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setAnswers((prev) => ({
      ...prev,
      gender,
      name: gender === 'female' ? 'Sophia' : 'Marcus',
      callsign: gender === 'female' ? 'Aurelia' : 'Spartan',
      workoutKind: gender === 'female' ? 'toning' : 'combat',
      focus: gender === 'female' ? 'glute_waist' : 'combat',
      personality: gender === 'female' ? 'aurelia' : 'marine',
      fasting: gender === 'female' ? '16_8' : 'omad',
      workoutTime: gender === 'female' ? '07:30' : '06:00',
      targetEmphasis: gender === 'female' ? ['abs_core', 'glutes', 'posture_waist'] : ['abs_core'],
    }));
  };

  const toggleDay = (day: number) => {
    const current = answers.selectedDays || [];
    let updated: number[];
    if (current.includes(day)) {
      if (current.length === 1) return; // Must keep at least 1 day
      updated = current.filter((d) => d !== day);
    } else {
      updated = [...current, day].sort((a, b) => a - b);
    }
    setAnswers((prev) => ({
      ...prev,
      selectedDays: updated,
      frequency: updated.length,
    }));
  };

  const applyDayPreset = (presetDays: number[]) => {
    setAnswers((prev) => ({
      ...prev,
      selectedDays: presetDays,
      frequency: presetDays.length,
    }));
  };

  const toggleEmphasis = (emphasisId: string) => {
    const current = answers.targetEmphasis || [];
    let updated: string[];
    if (current.includes(emphasisId)) {
      updated = current.filter((id) => id !== emphasisId);
    } else {
      updated = [...current, emphasisId];
    }
    setAnswers((prev) => ({
      ...prev,
      targetEmphasis: updated,
    }));
  };

  const handleFinish = () => {
    completeOnboarding(answers);
  };

  const selectedDaysList = answers.selectedDays || [];
  const selectedDaysReadable = selectedDaysList
    .map((d) => DAY_NAMES[d]?.short || `Day ${d}`)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#161416] border border-[#2B2428] rounded-[32px] w-full max-w-xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#242024] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border"
              style={{
                backgroundColor: isFemale ? 'rgba(224, 168, 153, 0.15)' : 'rgba(217, 161, 132, 0.15)',
                borderColor: isFemale ? 'rgba(224, 168, 153, 0.4)' : 'rgba(217, 161, 132, 0.4)',
                color: accentColor,
              }}
            >
              {step}/{totalSteps}
            </div>
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                STOIC BODY · PROTOCOL ASSESSMENT
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                {step === 8 ? 'Protocol Computation Complete' : 'Personalize Your Training Protocol'}
              </h3>
            </div>
          </div>

          <button
            onClick={dismissOnboarding}
            className="px-3 py-1.5 rounded-xl bg-[#201D1F] hover:bg-[#2A2629] border border-[#302B2E] text-xs font-bold text-neutral-400 hover:text-white transition-all flex items-center gap-1.5"
            title="Close Setup"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1 bg-[#121012]">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(step / totalSteps) * 100}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* STEP 1: Athlete Gender & Archetype */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Choose your athlete profile and interface mode
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Calibrates exercise illustrations across all 552 movements, color tones, stoic quotes, and split designs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Female Archetype */}
                <div
                  onClick={() => handleGenderSelect('female')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 relative ${
                    isFemale
                      ? 'bg-[#261E22] border-[#E0A899] shadow-lg shadow-[#E0A899]/15 text-white scale-[1.01]'
                      : 'bg-[#141214] border-[#262024] hover:border-[#3E343A] text-neutral-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1C161A] border border-[#E0A899]/30 flex items-center justify-center text-[#E0A899] text-xl font-black">
                      ♀
                    </div>
                    {isFemale && <Check className="w-5 h-5 text-[#E0A899] stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-white">Female / Empress</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#E0A899]/20 text-[#E0A899]">
                        Aurelia
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      All exercise illustrations feature female athletes. Rose gold and obsidian palette, glute and posture sculpting, and sovereign stoic wisdom.
                    </p>
                  </div>
                </div>

                {/* Male Archetype */}
                <div
                  onClick={() => handleGenderSelect('male')}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 relative ${
                    !isFemale
                      ? 'bg-[#221C18] border-[#D9A184] shadow-lg shadow-[#D9A184]/15 text-white scale-[1.01]'
                      : 'bg-[#141214] border-[#262024] hover:border-[#3E343A] text-neutral-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1C1A18] border border-[#D9A184]/30 flex items-center justify-center text-[#D9A184] text-xl font-black">
                      ♂
                    </div>
                    {!isFemale && <Check className="w-5 h-5 text-[#D9A184] stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-white">Male / Spartan</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#D9A184]/20 text-[#D9A184]">
                        USMC / Stoic
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      All exercise illustrations feature male athletic forms. Tactical obsidian amber palette, compound iron splits, and combat conditioning quotes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Athlete Name & Experience */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Athlete identity & lifting background
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Used for personalized greetings and calibrating volume, sets per exercise, and rest periods.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={answers.name || ''}
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                    placeholder={isFemale ? 'e.g. Sophia' : 'e.g. Marcus'}
                    className="w-full bg-[#100F10] border border-[#2B2428] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E0A899]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Callsign / Title
                  </label>
                  <input
                    type="text"
                    value={answers.callsign || ''}
                    onChange={(e) => setAnswers({ ...answers, callsign: e.target.value })}
                    placeholder={isFemale ? 'e.g. Aurelia' : 'e.g. Spartan'}
                    className="w-full bg-[#100F10] border border-[#2B2428] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E0A899]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Lifting Experience (Volume & Intensity Calibration)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'recruit' as const, label: 'Recruit', sub: '< 1 Year · 3 Sets' },
                    { id: 'intermediate' as const, label: 'Dedicated', sub: '1-3 Years · 3-4 Sets' },
                    { id: 'veteran' as const, label: 'Advanced', sub: '3+ Years · 4 Sets' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, experience: lvl.id })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        answers.experience === lvl.id
                          ? 'bg-[#261E22] border-[#E0A899] text-white font-bold'
                          : 'bg-[#121012] border-[#242024] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black">{lvl.label}</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{lvl.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: What Kind of Workout Do You Want? */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  What kind of workout do you want?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Select your primary training methodology. This defines rep tempo, rest intervals, and exercise sequencing.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'toning' as const,
                    title: 'Lean Toning & Definition',
                    badge: 'FAT LOSS & DEFINITION',
                    desc: 'High cadence, continuous tension, metabolic circuits, and core tightening. Ideal for athletic definition without excess bulk.',
                  },
                  {
                    id: 'glute_sculpt' as const,
                    title: 'Glute & Posture Sculpt (Empress Curve)',
                    badge: 'HOURGLASS SCULPT',
                    desc: 'High tension hip thrusts, Romanian deadlifts, Bulgarian split squats, and upper back posture alignment.',
                  },
                  {
                    id: 'hypertrophy' as const,
                    title: 'Muscle Hypertrophy & Density',
                    badge: '8-12 REPS · VOLUME',
                    desc: 'Classic bodybuilding splits. Mechanical tension near failure, strict form, and targeted muscle group volume progression.',
                  },
                  {
                    id: 'strength' as const,
                    title: 'Raw Compound Iron Strength',
                    badge: 'HEAVY COMPOUND 3-6 REPS',
                    desc: 'Squat, bench press, deadlift, overhead barbell. Heavy central nervous system stimulus and progressive overload.',
                  },
                  {
                    id: 'combat' as const,
                    title: 'USMC Combat & Functional Conditioning',
                    badge: 'TACTICAL ENDURANCE',
                    desc: 'Calisthenics, strict pull-ups, push variations, loaded carries, and functional mission stamina.',
                  },
                ].map((kind) => {
                  const isSelected = answers.workoutKind === kind.id;
                  return (
                    <div
                      key={kind.id}
                      onClick={() => setAnswers({ ...answers, workoutKind: kind.id })}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-99 ${
                        isSelected
                          ? 'bg-[#261E22] border-[#E0A899] text-white shadow-md'
                          : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-xs sm:text-sm text-white">{kind.title}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E0A899]/15 text-[#E0A899] border border-[#E0A899]/30">
                            {kind.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{kind.desc}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-[#E0A899] text-[#140D09]' : 'border border-[#383036]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Target Focus & Muscle Add-ons (Abs / Core Finisher) */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Target emphasis & workout add-ons
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-[#E0A899]/15 text-[#E0A899] border border-[#E0A899]/30">
                    {answers.targetEmphasis?.length || 0} ACTIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Selecting an add-on automatically injects dedicated exercise modules and finishers into your daily computed routines.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'abs_core',
                    title: 'Daily Abs & Core Toning Finisher (Recommended)',
                    badge: 'DAILY CORE FINISHER',
                    desc: 'Automatically appends a dedicated abdominal circuit (hanging leg raises, planks, dead bugs, Russian twists) to EVERY single workout session.',
                  },
                  {
                    id: 'glutes',
                    title: 'Glute & Posterior Chain Priority',
                    badge: 'GLUTE ACCELERATION',
                    desc: 'Injects extra glute activation and hip thrust / kickback volume into lower body sessions.',
                  },
                  {
                    id: 'posture_waist',
                    title: 'Posture & Hourglass V-Taper (Upper Back)',
                    badge: 'POSTURE SCULPT',
                    desc: 'Injects face pulls, lat pulldowns, and scapular stabilizers for upright poise and waist taper.',
                  },
                  {
                    id: 'arms_shoulders',
                    title: 'Arms & Shoulder Cap Hyper-Pump',
                    badge: 'DELTS & ARMS',
                    desc: 'Adds lateral raises, hammer curls, and tricep pushdown finishers to upper body sessions.',
                  },
                ].map((addon) => {
                  const isChecked = (answers.targetEmphasis || []).includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleEmphasis(addon.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-99 ${
                        isChecked
                          ? 'bg-[#261E22] border-[#E0A899] text-white shadow-md'
                          : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-xs sm:text-sm text-white">{addon.title}</span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E0A899]/15 text-[#E0A899] border border-[#E0A899]/30">
                            {addon.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{addon.desc}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked ? 'bg-[#E0A899] text-[#140D09]' : 'border border-[#383036]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {(answers.targetEmphasis || []).includes('abs_core') && (
                <div className="p-3 rounded-xl bg-[#1C181B] border border-[#3A2B34] flex items-center gap-2.5 text-xs text-[#E0A899]">
                  <Sparkles className="w-4 h-4 flex-shrink-0 fill-current" />
                  <span>
                    <strong>Abs & Core Engine Active:</strong> An ab finisher will be mathematically placed at the end of every routine!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Exactly WHICH DAYS Do You Want to Workout? */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Which days do you want to workout?
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-[#E0A899]/15 text-[#E0A899] border border-[#E0A899]/30">
                    {selectedDaysList.length} DAYS SELECTED
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Tap to select the exact days of the week you will train. Your routines and 14-day calendar will be mapped strictly to these days.
                </p>
              </div>

              {/* Day Toggle Buttons */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                {[
                  { day: 1, label: 'Mon', sub: 'M' },
                  { day: 2, label: 'Tue', sub: 'T' },
                  { day: 3, label: 'Wed', sub: 'W' },
                  { day: 4, label: 'Thu', sub: 'Th' },
                  { day: 5, label: 'Fri', sub: 'F' },
                  { day: 6, label: 'Sat', sub: 'Sa' },
                  { day: 7, label: 'Sun', sub: 'Su' },
                ].map((item) => {
                  const isSelected = selectedDaysList.includes(item.day);
                  return (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => toggleDay(item.day)}
                      className={`h-20 sm:h-24 rounded-2xl border flex flex-col items-center justify-between p-2 sm:p-2.5 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-[#261E22] border-[#E0A899] text-white shadow-md shadow-[#E0A899]/10'
                          : 'bg-[#121012] border-[#242024] text-neutral-400 hover:text-white hover:border-[#383036]'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                        {item.sub}
                      </span>
                      <div className="text-xs sm:text-sm font-black text-white">{item.label}</div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#E0A899] text-[#140D09]' : 'border border-[#383036]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Days Confirmation Box */}
              <div className="p-3.5 rounded-2xl bg-[#141214] border border-[#242024] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                    Schedule Distribution
                  </span>
                  <div className="text-sm font-black text-white mt-0.5">
                    {selectedDaysList.length} Days / Week: {selectedDaysReadable || 'None'}
                  </div>
                </div>
                <span className="text-xs text-[#E0A899] font-mono font-bold">
                  {7 - selectedDaysList.length} Recovery Days
                </span>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-2">
                  Or apply a balanced split preset:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '3 Days (M/W/F)', days: [1, 3, 5] },
                    { label: '4 Days (M/T/Th/F)', days: [1, 2, 4, 5] },
                    { label: '5 Days (M-F)', days: [1, 2, 3, 4, 5] },
                    { label: 'Custom 4 (T/Th/Sa/Su)', days: [2, 4, 6, 7] },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyDayPreset(preset.days)}
                      className="px-2.5 py-2 rounded-xl bg-[#181618] hover:bg-[#221F22] border border-[#2B252B] text-neutral-300 hover:text-white text-[11px] font-bold text-center transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: What Time & Session Duration? */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Workout time & session duration
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Sets your calendar alarms and determines how many total exercises & sets are programmed into each session.
                </p>
              </div>

              {/* Time Picker */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  What time of day do you want to workout?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { time: '06:00', label: '06:00 AM', tag: 'Dawn' },
                    { time: '07:30', label: '07:30 AM', tag: 'Morning' },
                    { time: '12:00', label: '12:00 PM', tag: 'Noon' },
                    { time: '17:30', label: '05:30 PM', tag: 'Evening' },
                    { time: '19:30', label: '07:30 PM', tag: 'Night' },
                  ].map((t) => (
                    <button
                      key={t.time}
                      type="button"
                      onClick={() => setAnswers({ ...answers, workoutTime: t.time })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        answers.workoutTime === t.time
                          ? 'bg-[#261E22] border-[#E0A899] text-white font-bold'
                          : 'bg-[#121012] border-[#242024] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{t.label}</div>
                      <div className="text-[9px] text-neutral-500 uppercase mt-0.5">{t.tag}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Or custom time:</span>
                  <input
                    type="time"
                    value={answers.workoutTime || '07:30'}
                    onChange={(e) => setAnswers({ ...answers, workoutTime: e.target.value })}
                    className="bg-[#121012] border border-[#2B2428] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#E0A899]"
                  />
                </div>
              </div>

              {/* Session Duration */}
              <div className="pt-2">
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Session Duration (Exercise Volume Calibration)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { duration: 30, label: '30 Min', sub: 'Express (3-4 Movements)' },
                    { duration: 45, label: '45 Min', sub: 'Standard (4-5 Movements)' },
                    { duration: 60, label: '60 Min', sub: 'Volume (5-6 Movements)' },
                    { duration: 75, label: '75 Min', sub: 'Overload (6-7 Movements)' },
                  ].map((d) => (
                    <button
                      key={d.duration}
                      type="button"
                      onClick={() => setAnswers({ ...answers, workoutDuration: d.duration })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        answers.workoutDuration === d.duration
                          ? 'bg-[#261E22] border-[#E0A899] text-white font-bold'
                          : 'bg-[#121012] border-[#242024] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black">{d.label}</div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{d.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Equipment Access & Fasting Protocol */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Equipment access & fasting protocol
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Filters exercises to kit you actually own and establishes your metabolic feeding window.
                </p>
              </div>

              {/* Equipment */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Equipment Access
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'full_gym' as const,
                      title: 'Full Commercial Gym',
                      desc: 'Barbells, dumbbells, cable stacks, leg press & machines',
                    },
                    {
                      id: 'barbell_home' as const,
                      title: 'Iron Home Gym',
                      desc: 'Power rack, Olympic barbell, weight plates & bench',
                    },
                    {
                      id: 'dumbbells' as const,
                      title: 'Dumbbells & Bench',
                      desc: 'Adjustable dumbbells, incline bench & bands',
                    },
                    {
                      id: 'bodyweight' as const,
                      title: 'Bodyweight & Mobility Only',
                      desc: 'Calisthenics, floor mat, pull-up bar & bands',
                    },
                  ].map((eq) => (
                    <div
                      key={eq.id}
                      onClick={() => setAnswers({ ...answers, equipment: eq.id })}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        answers.equipment === eq.id
                          ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                          : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{eq.title}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{eq.desc}</div>
                      </div>
                      {answers.equipment === eq.id && <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fasting Protocol */}
              <div className="pt-2">
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  Fasting & Feeding Protocol
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: '16_8' as const,
                      title: '16:8 Lean Gains',
                      desc: '16h Fast / 8h Feeding (12:00 - 20:00). Optimal hormonal balance.',
                    },
                    {
                      id: 'omad' as const,
                      title: '23:1 OMAD Warrior Feast',
                      desc: '23h Fast / 1h Nutrient-dense refeed at 17:30. Maximal autophagy.',
                    },
                    {
                      id: '20_4' as const,
                      title: '20:4 Warrior Window',
                      desc: '20h Fast / 4h Feeding (16:00 - 20:00). High insulin sensitivity.',
                    },
                    {
                      id: 'standard' as const,
                      title: 'Standard Whole Food',
                      desc: 'Consistent 3-meal feeding schedule with high protein distribution.',
                    },
                  ].map((proto) => (
                    <div
                      key={proto.id}
                      onClick={() => setAnswers({ ...answers, fasting: proto.id })}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        answers.fasting === proto.id
                          ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                          : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{proto.title}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{proto.desc}</div>
                      </div>
                      {answers.fasting === proto.id && <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Computed Protocol Review & 1-Click Launch */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1C181B] border border-[#3A2B34] flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-[#E0A899] flex-shrink-0 fill-current" />
                <div>
                  <h4 className="text-base font-black text-white">
                    {computedPlan.summary.splitName}
                  </h4>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    {computedPlan.summary.selectedDaysText} · {computedPlan.summary.workoutTimeText} ({computedPlan.summary.durationText})
                  </p>
                </div>
              </div>

              {/* Active Add-ons & Research Integration */}
              <div className="p-3 rounded-xl bg-[#141214] border border-[#242024]">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold mb-1.5">
                  Computed Protocol Inclusions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {computedPlan.summary.activeAddons.map((addon) => (
                    <span
                      key={addon}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono bg-[#E0A899]/15 text-[#E0A899] border border-[#E0A899]/30"
                    >
                      ✓ {addon}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono bg-[#8FA377]/15 text-[#8FA377] border border-[#8FA377]/30">
                    {computedPlan.summary.equipmentTitle}
                  </span>
                </div>
              </div>

              {/* Generated Routines Preview */}
              <div>
                <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider block mb-2">
                  Generated Workout Routines ({computedPlan.routines.length})
                </span>
                <div className="space-y-2">
                  {computedPlan.routines.map((r, idx) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl bg-[#121112] border border-[#242024] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        <div>
                          <div className="text-xs font-black text-white">{r.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {r.exerciseIds.length} Movements · {r.group}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1E1A1E] text-[#E0A899] border border-[#2E282E] font-bold">
                          {selectedDaysList[idx] ? DAY_NAMES[selectedDaysList[idx]]?.short : `Session ${idx + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Split & Calendar Sync */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#121112] border border-[#242024]">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold text-white">
                    <Calendar className="w-3.5 h-3.5 text-[#E0A899]" />
                    Calendar Sync
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    14 Days scheduled strictly on {selectedDaysReadable} at {answers.workoutTime}.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#121112] border border-[#242024]">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold text-white">
                    <Utensils className="w-3.5 h-3.5 text-[#8FA377]" />
                    Nutrition Targets
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug font-mono">
                    {computedPlan.nutritionTargets.calories} kcal · {computedPlan.nutritionTargets.protein}g Protein · {(computedPlan.nutritionTargets.waterMl / 1000).toFixed(1)}L Water
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-[#242024] bg-[#121012] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-[#1C181C] hover:bg-[#262026] text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg"
              style={{
                backgroundColor: accentColor,
                color: '#140D09',
              }}
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xl"
              style={{
                backgroundColor: accentColor,
                color: '#140D09',
              }}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Launch Protocol & Enter Sanctuary
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
