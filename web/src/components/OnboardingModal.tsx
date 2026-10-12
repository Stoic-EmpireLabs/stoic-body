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
  Scale,
  Droplets,
  Volume2,
  Compass,
  Download,
} from 'lucide-react';
import type { OnboardingAnswers, CoachPersonality } from '../types';
import { generateCustomPlan, DAY_NAMES } from '../utils/planGenerator';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, completeOnboarding, dismissOnboarding, profile } = useGymStore();

  const [step, setStep] = useState<number>(1);
  const totalQuestions = 20;
  const reviewStep = 21;

  const [answers, setAnswers] = useState<OnboardingAnswers>({
    gender: 'female',
    name: 'Sophia',
    callsign: 'Aurelia',
    workoutKind: 'toning',
    focus: 'glute_waist',
    experience: 'intermediate',
    age: 26,
    heightCm: 168,
    weightKg: 62,
    targetWeightKg: 59,
    bodyFat: 'athletic',
    frequency: 4,
    selectedDays: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
    workoutTime: '07:30',
    workoutDuration: 45,
    trainingSplit: 'glute_sculpt',
    equipment: 'full_gym',
    jointLimitations: ['none'],
    priorityMuscles: ['glutes', 'posture_waist'],
    absCoreProtocol: 'daily_5min',
    cardioProtocol: 'zone2_incline',
    dietType: 'omnivore',
    fasting: '16_8',
    calorieStrategy: 'moderate_cut',
    hydrationLiters: 3.2,
    supplements: ['creatine', 'electrolytes'],
    targetEmphasis: ['abs_core', 'glutes', 'posture_waist'],
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
      trainingSplit: gender === 'female' ? 'glute_sculpt' : 'ppl',
      personality: gender === 'female' ? 'aurelia' : 'marine',
      fasting: gender === 'female' ? '16_8' : 'omad',
      workoutTime: gender === 'female' ? '07:30' : '06:00',
      weightKg: gender === 'female' ? 62 : 82,
      targetWeightKg: gender === 'female' ? 59 : 80,
      heightCm: gender === 'female' ? 168 : 180,
      targetEmphasis: gender === 'female' ? ['abs_core', 'glutes', 'posture_waist'] : ['abs_core'],
    }));
  };

  const toggleDay = (day: number) => {
    const current = answers.selectedDays || [];
    let updated: number[];
    if (current.includes(day)) {
      if (current.length === 1) return;
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

  const toggleJoint = (jointId: string) => {
    const current = answers.jointLimitations || ['none'];
    let updated: string[];
    if (jointId === 'none') {
      updated = ['none'];
    } else {
      const filtered = current.filter((j) => j !== 'none');
      if (filtered.includes(jointId)) {
        updated = filtered.filter((j) => j !== jointId);
        if (updated.length === 0) updated = ['none'];
      } else {
        updated = [...filtered, jointId];
      }
    }
    setAnswers((prev) => ({ ...prev, jointLimitations: updated }));
  };

  const toggleSupplement = (suppId: string) => {
    const current = answers.supplements || [];
    let updated: string[];
    if (current.includes(suppId)) {
      updated = current.filter((s) => s !== suppId);
    } else {
      updated = [...current, suppId];
    }
    setAnswers((prev) => ({ ...prev, supplements: updated }));
  };

  const handleFinish = () => {
    completeOnboarding(answers);
  };

  const handleExportProtocolJSON = () => {
    try {
      const exportData = {
        athlete: {
          name: answers.name,
          callsign: answers.callsign,
          gender: answers.gender,
          personality: answers.personality,
        },
        protocolAnswers: answers,
        computedSummary: computedPlan.summary,
        routines: computedPlan.routines,
        weeklyPlan: computedPlan.weeklyPlan,
        nutritionTargets: computedPlan.nutritionTargets,
        scheduledEvents: computedPlan.scheduledEvents,
        exportedAt: new Date().toISOString(),
        stoicBodyVersion: '2.4.0',
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stoic-protocol-${answers.name || 'athlete'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export protocol:', e);
    }
  };

  const selectedDaysList = answers.selectedDays || [];
  const selectedDaysReadable = selectedDaysList
    .map((d) => DAY_NAMES[d]?.short || `Day ${d}`)
    .join(', ');

  // Phase Title Helper
  const getPhaseTitle = (s: number) => {
    if (s <= 4) return 'Phase 1 · Biological Foundation & Identity';
    if (s <= 8) return 'Phase 2 · Composition & Schedule Planning';
    if (s <= 12) return 'Phase 3 · Biomechanical Architecture & Equipment';
    if (s <= 15) return 'Phase 4 · Muscle Priority & Conditioning';
    if (s <= 20) return 'Phase 5 · Nutrition, Fasting & Stoic Mindset';
    return 'Clinical Protocol Synthesis';
  };

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
              {step <= totalQuestions ? `${step}/${totalQuestions}` : '✓'}
            </div>
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                {getPhaseTitle(step)}
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                {step === reviewStep
                  ? 'Protocol Computation Complete'
                  : `Question ${step} of ${totalQuestions}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step < reviewStep && (
              <button
                type="button"
                onClick={() => setStep(reviewStep)}
                className="px-2.5 py-1 rounded-xl bg-[#262024] hover:bg-[#342C32] text-[11px] font-bold text-[#E0A899] border border-[#3E343A] transition-all flex items-center gap-1 shadow-sm"
                title="Jump directly to synthesized protocol review"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Auto-Calculate</span>
              </button>
            )}

            <button
              onClick={dismissOnboarding}
              className="px-3 py-1.5 rounded-xl bg-[#201D1F] hover:bg-[#2A2629] border border-[#302B2E] text-xs font-bold text-neutral-400 hover:text-white transition-all flex items-center gap-1.5"
              title="Close Setup"
            >
              <span>Skip</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1 bg-[#121012]">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${(step / reviewStep) * 100}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* QUESTION 1: Athlete Gender & Archetype */}
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

          {/* QUESTION 2: Athlete Name & Callsign */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Athlete identity & callsign
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  How should your coach and journal address you in daily briefings and training logs?
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Athlete Name
                  </label>
                  <input
                    type="text"
                    value={answers.name || ''}
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                    placeholder={isFemale ? 'e.g. Sophia' : 'e.g. Marcus'}
                    className="w-full bg-[#121012] border border-[#2B2428] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E0A899] font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Callsign / Title
                  </label>
                  <input
                    type="text"
                    value={answers.callsign || ''}
                    onChange={(e) => setAnswers({ ...answers, callsign: e.target.value })}
                    placeholder={isFemale ? 'e.g. Aurelia / Empress' : 'e.g. Spartan / Centurion'}
                    className="w-full bg-[#121012] border border-[#2B2428] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E0A899] font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                    Chronological Age (Years)
                  </label>
                  <input
                    type="number"
                    value={answers.age !== undefined && answers.age !== null ? answers.age : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers({ ...answers, age: v === '' ? undefined : parseInt(v, 10) });
                    }}
                    placeholder="26"
                    className="w-full bg-[#121012] border border-[#2B2428] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E0A899] font-medium font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 3: Primary Athletic Quest */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  What kind of workout do you want?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Determines the rep ranges, tempo, time-under-tension, and neuromuscular stimulus.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'toning' as const,
                    title: 'Lean Toning & Definition',
                    badge: '12-15 Reps · High TUT',
                    desc: 'Metabolic conditioning, high volume, muscular endurance, and lean athletic definition.',
                    color: '#E0A899',
                  },
                  {
                    id: 'glute_sculpt' as const,
                    title: 'Glute & Posture Sculpt',
                    badge: '10-12 Reps · Peak Tension',
                    desc: 'Horizontal hip extension, Romanian deadlifts, V-taper lat width, and transverse core cinching.',
                    color: '#D4AF37',
                  },
                  {
                    id: 'hypertrophy' as const,
                    title: 'Muscle Hypertrophy & Density',
                    badge: '8-12 Reps · Overload',
                    desc: 'Mechanical tension, muscle fiber recruitment, volume accumulation, and structural growth.',
                    color: '#D9A184',
                  },
                  {
                    id: 'strength' as const,
                    title: 'Raw Compound Strength',
                    badge: '3-5 Reps · 80-90% 1RM',
                    desc: 'Maximal neuromuscular drive, squat, bench, deadlift, overhead press, and tendon density.',
                    color: '#C25953',
                  },
                  {
                    id: 'combat' as const,
                    title: 'USMC Combat Readiness',
                    badge: '15-25 Reps · Calisthenics',
                    desc: 'Tactical pull-ups, dips, push-ups, explosive core bracing, and relentless work capacity.',
                    color: '#8FA377',
                  },
                ].map((kind) => (
                  <div
                    key={kind.id}
                    onClick={() => setAnswers({ ...answers, workoutKind: kind.id })}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.workoutKind === kind.id
                        ? 'bg-[#221A1E] border-[#E0A899] shadow-md shadow-[#E0A899]/10 text-white'
                        : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-sm text-white">{kind.title}</h5>
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase"
                          style={{
                            backgroundColor: `${kind.color}25`,
                            color: kind.color,
                          }}
                        >
                          {kind.badge}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{kind.desc}</p>
                    </div>
                    {answers.workoutKind === kind.id && (
                      <Check className="w-5 h-5 text-[#E0A899] stroke-[3] flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 4: Training Age & Experience */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Training age and lifting experience
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Calibrates starting weights, warmup sets, exercise complexity, and recovery spacing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'recruit' as const,
                    title: 'Recruit (0–6 Months)',
                    sub: 'Foundation Building',
                    desc: 'Focus on perfect form, movement patterns, and conservative linear loading.',
                  },
                  {
                    id: 'novice' as const,
                    title: 'Novice (6–12 Months)',
                    sub: 'Linear Progression',
                    desc: 'Consistently adding resistance to basic compound movements each week.',
                  },
                  {
                    id: 'intermediate' as const,
                    title: 'Intermediate (1–3 Years)',
                    sub: 'Volume Accumulation',
                    desc: 'Experienced with major barbells and dumbbells, needing periodized wave loading.',
                  },
                  {
                    id: 'veteran' as const,
                    title: 'Elite Veteran (3–5+ Years)',
                    sub: 'Maximal Work Capacity',
                    desc: 'High neuromuscular efficiency, RPE autoregulation, and advanced overloading.',
                  },
                ].map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        experience: exp.id === 'novice' ? 'recruit' : exp.id,
                      })
                    }
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 ${
                      answers.experience === (exp.id === 'novice' ? 'recruit' : exp.id)
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#E0A899] font-bold">
                        {exp.sub}
                      </span>
                      <h5 className="font-bold text-sm text-white mt-1">{exp.title}</h5>
                      <p className="text-xs text-neutral-400 mt-1 leading-snug">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 5: Current Biometrics */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Current physical biometrics
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Used by our clinical metabolic equations (Mifflin-St Jeor) to compute exact baseline TDEE.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#121012] border border-[#2B2428]">
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={answers.heightCm !== undefined && answers.heightCm !== null ? answers.heightCm : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers({ ...answers, heightCm: v === '' ? undefined : parseInt(v, 10) });
                    }}
                    placeholder="168"
                    className="w-full bg-[#181618] border border-[#342C32] rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                    ~{Math.floor((answers.heightCm || 168) / 30.48)}'
                    {Math.round(((answers.heightCm || 168) % 30.48) / 2.54)}"
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#121012] border border-[#2B2428]">
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={answers.weightKg !== undefined && answers.weightKg !== null ? answers.weightKg : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers({ ...answers, weightKg: v === '' ? undefined : parseFloat(v) });
                    }}
                    placeholder="62"
                    className="w-full bg-[#181618] border border-[#342C32] rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                    ~{((answers.weightKg || 62) * 2.20462).toFixed(1)} lbs
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#121012] border border-[#2B2428]">
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Goal Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={answers.targetWeightKg !== undefined && answers.targetWeightKg !== null ? answers.targetWeightKg : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers({ ...answers, targetWeightKg: v === '' ? undefined : parseFloat(v) });
                    }}
                    placeholder="59"
                    className="w-full bg-[#181618] border border-[#342C32] rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                    Target endpoint
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 6: Estimated Body Fat & Composition Goal */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Estimated body fat & composition goal
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Calibrates the ratio of carbohydrates to clean dietary lipids in your macro prescription.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'lean' as const,
                    title: 'Ultra-Lean Vascular Shred',
                    male: '<11% Body Fat',
                    female: '<19% Body Fat',
                    desc: 'Primary objective is cutting body fat while preserving hard lean tissue.',
                  },
                  {
                    id: 'athletic' as const,
                    title: 'Athletic High-Performance',
                    male: '12–15% Body Fat',
                    female: '20–23% Body Fat',
                    desc: 'Optimal hormonal equilibrium, peak energy output, and crisp muscle tone.',
                  },
                  {
                    id: 'moderate' as const,
                    title: 'Muscular Recomposition',
                    male: '16–19% Body Fat',
                    female: '24–27% Body Fat',
                    desc: 'Gradually trading fat mass for dense muscle mass at neutral energy balance.',
                  },
                  {
                    id: 'full' as const,
                    title: 'Heavy Mass Construction',
                    male: '20%+ Body Fat',
                    female: '28%+ Body Fat',
                    desc: 'Focus on maximal strength, structural hypertrophy, and caloric surplus.',
                  },
                ].map((bf) => (
                  <div
                    key={bf.id}
                    onClick={() => setAnswers({ ...answers, bodyFat: bf.id })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 ${
                      answers.bodyFat === bf.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#E0A899]">
                        {isFemale ? bf.female : bf.male}
                      </span>
                      <h5 className="font-bold text-sm text-white mt-1">{bf.title}</h5>
                      <p className="text-xs text-neutral-400 mt-1 leading-snug">{bf.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 7: Weekly Training Frequency */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Weekly training frequency
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  How many days per week can you reliably dedicate to intense physical training?
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { days: 2, label: '2 Days', sub: 'Full Body' },
                  { days: 3, label: '3 Days', sub: 'Classic Split' },
                  { days: 4, label: '4 Days', sub: 'Upper / Lower' },
                  { days: 5, label: '5 Days', sub: 'PPL + Recomp' },
                  { days: 6, label: '6 Days', sub: 'High Volume' },
                ].map((f) => (
                  <button
                    key={f.days}
                    type="button"
                    onClick={() => {
                      const presets: Record<number, number[]> = {
                        2: [2, 5],
                        3: [1, 3, 5],
                        4: [1, 2, 4, 5],
                        5: [1, 2, 3, 4, 5],
                        6: [1, 2, 3, 4, 5, 6],
                      };
                      applyDayPreset(presets[f.days] || [1, 3, 5]);
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      (answers.selectedDays || []).length === f.days
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow-lg'
                        : 'bg-[#121012] border-[#242024] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-base font-black text-white">{f.label}</div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{f.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 8: Exact Days of Week */}
          {step === 8 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Which days do you want to workout?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Select the exact days of the week. Rest days are automatically programmed with active recovery.
                </p>
              </div>

              {/* Day Selector Buttons */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                  const isSelected = (answers.selectedDays || []).includes(dayNum);
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => toggleDay(dayNum)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#261E22] border-[#E0A899] text-white shadow-md'
                          : 'bg-[#121012] border-[#242024] text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase">
                        {DAY_NAMES[dayNum]?.short}
                      </span>
                      <span className="text-sm font-black mt-1">{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block font-bold">
                  Recommended Split Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Mon / Wed / Fri (3-Day)', days: [1, 3, 5] },
                    { label: 'Custom 4 (T/Th/Sa/Su)', days: [2, 4, 6, 7] },
                    { label: 'Upper / Lower (M/T/Th/F)', days: [1, 2, 4, 5] },
                    { label: 'Weekdays (M-F)', days: [1, 2, 3, 4, 5] },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyDayPreset(preset.days)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#141214] hover:bg-[#201C1E] border border-[#262024] text-[11px] font-bold text-neutral-300 hover:text-white transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121012] border border-[#242024] flex items-center justify-between">
                <span className="text-xs text-neutral-400">Currently scheduled:</span>
                <span className="text-xs font-mono font-bold text-[#E0A899]">
                  {selectedDaysReadable}
                </span>
              </div>
            </div>
          )}

          {/* QUESTION 9: Preferred Time & Duration */}
          {step === 9 && (
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
                  ].map((dur) => (
                    <button
                      key={dur.duration}
                      type="button"
                      onClick={() => setAnswers({ ...answers, workoutDuration: dur.duration })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        answers.workoutDuration === dur.duration
                          ? 'bg-[#261E22] border-[#E0A899] text-white font-bold shadow'
                          : 'bg-[#121012] border-[#242024] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black text-white">{dur.label}</div>
                      <div className="text-[9px] text-neutral-500 mt-1 leading-snug">{dur.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QUESTION 10: Training Split Architecture */}
          {step === 10 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Training split architecture
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  How should muscle groups be grouped and paired throughout the week?
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'glute_sculpt' as const,
                    title: 'Empress Posterior & Posture Sculpt',
                    desc: 'Glute & hamstring anchors on lower days, shoulder capped width on upper days.',
                  },
                  {
                    id: 'ppl' as const,
                    title: 'Push / Pull / Legs (PPL)',
                    desc: 'Classic biomechanical division separating chest/shoulders, back/biceps, and legs.',
                  },
                  {
                    id: 'upper_lower' as const,
                    title: 'Upper / Lower Split',
                    desc: 'Balanced 2x weekly bodypart stimulation optimizing systemic recovery.',
                  },
                  {
                    id: 'full_body' as const,
                    title: 'Full Body High Frequency',
                    desc: 'Every session trains primary movement patterns with moderate volume.',
                  },
                  {
                    id: 'arnold' as const,
                    title: 'Arnold Opposing Antagonist Split',
                    desc: 'Chest & Back supersets, Shoulders & Arms, followed by dedicated Legs.',
                  },
                ].map((split) => (
                  <div
                    key={split.id}
                    onClick={() => setAnswers({ ...answers, trainingSplit: split.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.trainingSplit === split.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-300'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-white">{split.title}</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{split.desc}</p>
                    </div>
                    {answers.trainingSplit === split.id && (
                      <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 11: Gym Equipment Access */}
          {step === 11 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Equipment access & gym setup
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Filters all 552 movement variations strictly to gear you actually have available.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'full_gym' as const,
                    title: 'Full Commercial Gym',
                    desc: 'Barbells, dumbbells, cable stacks, leg press, hack squat & machines',
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
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
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
          )}

          {/* QUESTION 12: Joint Limitations & Safeguards */}
          {step === 12 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Physical safeguards & joint limitations
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Select any joints that need deloading or exercise substitutions to prevent flare-ups.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'none', title: 'Full Mobility (No Limitations)', desc: 'Zero restrictions across all exercises.' },
                  { id: 'knees', title: 'Knee Protection Protocol', desc: 'Eliminates deep knee shearing, prioritizes hinge movements.' },
                  { id: 'lower_back', title: 'Lower Back Deload', desc: 'Substitutes axial spinal compression with chest-supported lifts.' },
                  { id: 'shoulders', title: 'Shoulder Impingement Safe', desc: 'Replaces overhead barbell pressing with neutral dumbbells.' },
                  { id: 'wrists', title: 'Wrist-Friendly Grips', desc: 'Prioritizes neutral grips and dumbbells over straight bars.' },
                ].map((j) => {
                  const isChecked = (answers.jointLimitations || ['none']).includes(j.id);
                  return (
                    <div
                      key={j.id}
                      onClick={() => toggleJoint(j.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                        isChecked
                          ? 'bg-[#261E22] border-[#E0A899] text-white'
                          : 'bg-[#121012] border-[#242024] text-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{j.title}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{j.desc}</div>
                      </div>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#E0A899]" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION 13: Target Emphasis & Add-ons */}
          {step === 13 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Target emphasis & workout add-ons
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Our research engine automatically appends high-value finishers to every programmed session.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'abs_core',
                    title: 'Daily Abs & Core Toning Finisher',
                    desc: 'Automatically adds 5-minute progressive core finishers (weighted planks, hanging leg raises, dead bugs) to the end of every workout.',
                  },
                  {
                    id: 'glutes',
                    title: 'Glute & Posterior Chain Priority',
                    desc: 'Injects high-EMG glute activation sets (hip thrusts, cable kickbacks, Bulgarian split squats) into your weekly split.',
                  },
                  {
                    id: 'posture_waist',
                    title: 'Posture & Hourglass Waist Shaping',
                    desc: 'Lat pulldowns, face pulls, and transverse abdominal vacuum mechanics for an upright sovereign silhouette.',
                  },
                  {
                    id: 'arms_shoulders',
                    title: 'Capped Delts & Arm Definition',
                    desc: 'Dedicated lateral raises, overhead press density, and arm supersets.',
                  },
                ].map((addon) => {
                  const isChecked = (answers.targetEmphasis || []).includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleEmphasis(addon.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between active:scale-98 ${
                        isChecked
                          ? 'bg-[#221A1E] border-[#E0A899] text-white shadow-md'
                          : 'bg-[#121012] border-[#242024] hover:border-[#383036] text-neutral-400'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-white">{addon.title}</h5>
                          {addon.id === 'abs_core' && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-[#E0A899]/20 text-[#E0A899] font-bold">
                              RESEARCH ENHANCED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                          {addon.desc}
                        </p>
                      </div>
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-[#E0A899] flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION 14: Core & Transverse Abdominis */}
          {step === 14 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Core, transverse abdominis & abs protocol
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  How should abdominal and deep corset pelvic stabilization be structured?
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'daily_5min' as const,
                    title: '5-Minute High-Density Core Finisher',
                    desc: 'Every session concludes with hanging leg raises, ab wheel, and weighted planks.',
                  },
                  {
                    id: 'tva_corset' as const,
                    title: 'TVA Pelvic Floor & Vacuum Corset',
                    desc: 'Deep inner-unit transverse abdominis vacuum holds and dead bugs to tighten the waist.',
                  },
                  {
                    id: 'rotational' as const,
                    title: 'Oblique & Rotational Anti-Flexion',
                    desc: 'Cable woodchoppers, Pallof presses, and side planks for rotational core stability.',
                  },
                  {
                    id: 'compounds_only' as const,
                    title: 'Heavy Compound Bracing Only',
                    desc: 'Rely purely on heavy squats, deadlifts, and overhead presses for isometric core strength.',
                  },
                ].map((core) => (
                  <div
                    key={core.id}
                    onClick={() => setAnswers({ ...answers, absCoreProtocol: core.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.absCoreProtocol === core.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] text-neutral-400'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-white">{core.title}</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{core.desc}</p>
                    </div>
                    {answers.absCoreProtocol === core.id && (
                      <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 15: Cardiovascular Protocol */}
          {step === 15 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Cardiovascular & conditioning protocol
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Cardiovascular conditioning periodization synchronized alongside your weight training.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'zone2_incline' as const,
                    title: 'Zone 2 Aerobic Incline Walk / Ruck (30 Min)',
                    desc: 'Low-impact nasal breathing on incline treadmill. Maximizes mitochondrial fat oxidation without compromising leg recovery.',
                  },
                  {
                    id: 'hiit_sprints' as const,
                    title: 'HIIT Tabata High-Output Sprints',
                    desc: '15-minute high intensity bursts triggering excess post-exercise oxygen consumption (EPOC).',
                  },
                  {
                    id: 'jump_rope' as const,
                    title: 'Jump Rope Conditioning Rounds',
                    desc: 'Light on the toes, rhythm, calf density, and shoulder endurance.',
                  },
                  {
                    id: 'outdoor_run' as const,
                    title: 'Outdoor Road / Trail Run (5K)',
                    desc: 'Steady state outdoor endurance running.',
                  },
                  {
                    id: 'none' as const,
                    title: 'Iron Focus Only (No Extra Cardio)',
                    desc: 'Direct all caloric and recovery reserves entirely toward weightlifting and muscle growth.',
                  },
                ].map((cardio) => (
                  <div
                    key={cardio.id}
                    onClick={() => setAnswers({ ...answers, cardioProtocol: cardio.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.cardioProtocol === cardio.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] text-neutral-400'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-white">{cardio.title}</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{cardio.desc}</p>
                    </div>
                    {answers.cardioProtocol === cardio.id && (
                      <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 16: Nutritional Philosophy */}
          {step === 16 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Nutritional philosophy & dietary preference
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Configures the macro distribution matrix and pre-workout fueling advice.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'omnivore' as const,
                    title: 'Clean Omnivore Whole Foods',
                    desc: 'Lean meats, eggs, wild fish, sweet potatoes, jasmine rice, berries, and healthy fats.',
                  },
                  {
                    id: 'high_protein' as const,
                    title: 'High-Protein / Low-Carb Shred',
                    desc: 'Elevated protein (40%), controlled carbohydrates, and moderate clean fats.',
                  },
                  {
                    id: 'keto' as const,
                    title: 'Ketogenic Metabolic Adaptation',
                    desc: '70% healthy fats, 25% protein, under 5% carbs for continuous fat oxidation.',
                  },
                  {
                    id: 'mediterranean' as const,
                    title: 'Mediterranean Anti-Inflammatory',
                    desc: 'Extra virgin olive oil, wild salmon, greens, legumes, and systemic joint protection.',
                  },
                  {
                    id: 'plant_based' as const,
                    title: 'Plant-Based High-Density Protein',
                    desc: 'Tofu, tempeh, lentils, pea/rice protein isolate, and micro-nutrient variety.',
                  },
                ].map((diet) => (
                  <div
                    key={diet.id}
                    onClick={() => setAnswers({ ...answers, dietType: diet.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.dietType === diet.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] text-neutral-400'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-white">{diet.title}</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{diet.desc}</p>
                    </div>
                    {answers.dietType === diet.id && (
                      <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 17: Intermittent Fasting Protocol */}
          {step === 17 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Equipment access & fasting protocol
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Sets your daily feeding interval and calendar alerts for fasting window open & close.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: '16_8' as const,
                    title: '16:8 Lean Gains',
                    desc: '16h Fast / 8h Feeding (12:00 - 20:00). Gold standard for metabolic health and fat loss.',
                  },
                  {
                    id: '20_4' as const,
                    title: '20:4 Warrior Window',
                    desc: '20h Fast / 4h Feeding (16:00 - 20:00). High insulin sensitivity and peak morning alertness.',
                  },
                  {
                    id: 'omad' as const,
                    title: '23:1 OMAD Warrior Feast',
                    desc: '23h Fast / 1h Nutrient-dense feast at 17:30. Maximal cellular autophagy surge.',
                  },
                  {
                    id: '14_10' as const,
                    title: '14:10 Hormone-Supportive',
                    desc: '14h Fast / 10h Feeding (10:00 - 20:00). Cortisol-gentle, ideal for female endocrine harmony.',
                  },
                  {
                    id: 'standard' as const,
                    title: 'Standard Whole Food Feeding',
                    desc: 'Consistent 3-meal feeding schedule with high protein distribution throughout the day.',
                  },
                ].map((proto) => (
                  <div
                    key={proto.id}
                    onClick={() => setAnswers({ ...answers, fasting: proto.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.fasting === proto.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] text-neutral-400'
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
          )}

          {/* QUESTION 18: Caloric Target Strategy */}
          {step === 18 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Caloric target strategy & energy balance
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Adjusts the daily caloric total relative to your baseline maintenance expenditures.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'aggressive_cut' as const,
                    title: 'Aggressive Fat Shred (-20% Deficit)',
                    desc: 'Rapid body fat reduction while prioritizing high protein to defend lean muscle mass.',
                  },
                  {
                    id: 'moderate_cut' as const,
                    title: 'Moderate Sustainable Cut (-10% Deficit)',
                    desc: 'Gradual, steady fat loss with zero strength dips or metabolic slowdown.',
                  },
                  {
                    id: 'maintenance' as const,
                    title: 'Clean Athletic Recomposition (Maintenance)',
                    desc: 'Preserve exact bodyweight while trading body fat for dense muscle fiber.',
                  },
                  {
                    id: 'lean_bulk' as const,
                    title: 'Lean Hypertrophic Surplus (+10% Surplus)',
                    desc: 'Fuel progressive overload and muscle synthesis with minimal adiposity accumulation.',
                  },
                  {
                    id: 'heavy_bulk' as const,
                    title: 'Heavy Mass Construction (+20% Surplus)',
                    desc: 'Maximal size and raw compound strength acceleration.',
                  },
                ].map((strat) => (
                  <div
                    key={strat.id}
                    onClick={() => setAnswers({ ...answers, calorieStrategy: strat.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                      answers.calorieStrategy === strat.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] text-neutral-400'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-white">{strat.title}</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{strat.desc}</p>
                    </div>
                    {answers.calorieStrategy === strat.id && (
                      <Check className="w-4 h-4 text-[#E0A899] stroke-[3]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUESTION 19: Hydration & Supplements */}
          {step === 19 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Hydration goal & ergogenic supplements
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Adds daily intake reminders to your mission calendar.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'creatine', title: 'Creatine Monohydrate (5g Daily)', desc: 'ATP cellular replenishment & intracellular hydration.' },
                  { id: 'electrolytes', title: 'Mineral Electrolytes & Sea Salt', desc: 'Hydration charging upon waking and intra-workout pumps.' },
                  { id: 'protein', title: 'Whey / Plant Isolate', desc: 'Post-workout rapid leucine threshold delivery.' },
                  { id: 'caffeine', title: 'Clean Pre-Workout Caffeine', desc: 'Adenosine antagonism and CNS focus.' },
                  { id: 'omega3', title: 'Omega-3 Fish Oil & D3', desc: 'Joint lubricity and anti-inflammatory cellular integrity.' },
                ].map((supp) => {
                  const isChecked = (answers.supplements || []).includes(supp.id);
                  return (
                    <div
                      key={supp.id}
                      onClick={() => toggleSupplement(supp.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                        isChecked
                          ? 'bg-[#261E22] border-[#E0A899] text-white'
                          : 'bg-[#121012] border-[#242024] text-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{supp.title}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{supp.desc}</div>
                      </div>
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#E0A899]" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION 20: Stoic Coaching Voice */}
          {step === 20 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Stoic coaching persona & mindset voice
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Who should deliver your post-set motivation, rest timer countdowns, and daily stoic reflections?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'marine' as const,
                    name: 'Staff Sgt. Stone',
                    sub: 'USMC Drill Instructor',
                    desc: 'Relentless accountability, military discipline, zero excuses. Push beyond perceived limits.',
                  },
                  {
                    id: 'stoic' as const,
                    name: 'Marcus Aurelius',
                    sub: 'Philosophical Stoic',
                    desc: 'Meditative reason, sovereign virtue, emotional regulation, and quiet iron fortitude.',
                  },
                  {
                    id: 'aurelia' as const,
                    name: 'Aurelia',
                    sub: 'Sovereign Empress',
                    desc: 'Regal grace, aesthetic precision, unshakeable poise, and calculated majesty.',
                  },
                  {
                    id: 'coach' as const,
                    name: 'Coach Miller',
                    sub: 'High-Performance Science',
                    desc: 'Positive athletic encouragement, biomechanical cues, and evidence-based progress.',
                  },
                ].map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setAnswers({ ...answers, personality: persona.id })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 ${
                      answers.personality === persona.id
                        ? 'bg-[#261E22] border-[#E0A899] text-white shadow'
                        : 'bg-[#121012] border-[#242024] text-neutral-400'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#E0A899] font-bold">
                        {persona.sub}
                      </span>
                      <h5 className="font-bold text-sm text-white mt-1">{persona.name}</h5>
                      <p className="text-xs text-neutral-400 mt-1 leading-snug">{persona.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 21: REVIEW & LAUNCH PROTOCOL */}
          {step === reviewStep && (
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
                  Protocol Inclusions & Safeguards
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
                  {computedPlan.summary.cardioTitle && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono bg-[#7AA2F7]/15 text-[#7AA2F7] border border-[#7AA2F7]/30">
                      {computedPlan.summary.cardioTitle}
                    </span>
                  )}
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

              {/* Weekly Split & Nutrition Targets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#121112] border border-[#242024]">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold text-white">
                    <Calendar className="w-4 h-4 text-[#E0A899]" />
                    <span>Visual Schedule</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    14-day schedule mapped with daily hydration, workout session, and fasting intervals.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#121112] border border-[#242024]">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold text-white">
                    <Utensils className="w-4 h-4 text-[#8FA377]" />
                    <span>Diet & Nutrition</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono leading-snug">
                    {computedPlan.summary.macrosSummary}
                  </p>
                </div>
              </div>

              {/* Data Portability for Clients & GitHub */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleExportProtocolJSON}
                  className="w-full py-2.5 rounded-xl bg-[#1C1A18] hover:bg-[#25221F] border border-[#2E2A26] text-xs font-bold text-neutral-300 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Download className="w-3.5 h-3.5 text-[#E0A899]" />
                  Export Protocol JSON (Backup for GitHub / Clients)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-[#242024] bg-[#121012] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-[#1E1A1E] hover:bg-[#2A242A] text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < reviewStep ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#E0A899] hover:bg-[#EBB8AA] text-[#140D09] font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-98"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-[#E0A899] hover:bg-[#EBB8AA] text-[#140D09] font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#E0A899]/20 transition-all active:scale-98"
            >
              <Dumbbell className="w-4 h-4 stroke-[3]" />
              Launch Protocol & Enter Sanctuary
              <Sparkles className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
