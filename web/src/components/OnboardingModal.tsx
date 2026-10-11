import React, { useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import {
  Shield,
  Dumbbell,
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import type { OnboardingAnswers, CoachPersonality } from '../types';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, completeOnboarding, dismissOnboarding } = useGymStore();

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    focus: 'combat',
    experience: 'veteran',
    equipment: 'full_gym',
    personality: 'marine',
  });

  if (!showOnboarding) return null;

  const totalSteps = 4;

  const handleFinish = () => {
    completeOnboarding(answers);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#161514] border border-[#2B2724] rounded-3xl w-full max-w-xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-[#242220] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#28221D] border border-[#D9A184]/40 text-[#D9A184] flex items-center justify-center font-black text-xs">
              {step}/{totalSteps}
            </div>
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                STOIC BODY ASSESSMENT
              </span>
              <h3 className="text-base font-black text-white">Personalize Your Protocol</h3>
            </div>
          </div>

          <button
            onClick={dismissOnboarding}
            className="px-3 py-1.5 rounded-xl bg-[#201D1B] hover:bg-[#2A2724] border border-[#302C28] text-xs font-bold text-neutral-400 hover:text-white transition-all flex items-center gap-1.5"
            title="Skip to Dashboard"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1 bg-[#121110]">
          <div
            className="h-full bg-gradient-to-r from-[#B4632C] to-[#D9A184] transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* STEP 1: Focus */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">
                  What is your primary physical objective?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  We will calibrate your routine splits and training volume to match this mission.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    id: 'combat' as const,
                    title: 'Combat Conditioning',
                    desc: 'USMC PFT/CFT readiness, stamina, functional power & grit',
                    icon: <Shield className="w-5 h-5 text-red-400" />,
                  },
                  {
                    id: 'hypertrophy' as const,
                    title: 'Muscle Growth (Hypertrophy)',
                    desc: 'Aesthetic shape, volume overload & muscle density',
                    icon: <Dumbbell className="w-5 h-5 text-[#D9A184]" />,
                  },
                  {
                    id: 'strength' as const,
                    title: 'Raw Iron Strength',
                    desc: 'Squat, bench, deadlift, overhead power & 1RM mastery',
                    icon: <Zap className="w-5 h-5 text-amber-400" />,
                  },
                  {
                    id: 'athletic' as const,
                    title: 'Lean Athleticism',
                    desc: 'Cardiovascular engine, mobility & functional endurance',
                    icon: <Target className="w-5 h-5 text-blue-400" />,
                  },
                ].map((item) => {
                  const isSelected = answers.focus === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers({ ...answers, focus: item.id })}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 ${
                        isSelected
                          ? 'bg-[#221C18] border-[#D9A184] shadow-md text-white'
                          : 'bg-[#121110] border-[#242220] hover:border-[#383430] text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-xl bg-[#1C1A18]">{item.icon}</div>
                        {isSelected && <Check className="w-4 h-4 text-[#D9A184] stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">{item.title}</div>
                        <div className="text-[11px] text-neutral-400 mt-1 leading-snug">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Experience */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">
                  What is your background and lifting tenure?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Determines your baseline sets, warm-up stages, and rest interval defaults.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  {
                    id: 'veteran' as const,
                    title: 'Combat Veteran / Advanced Athlete',
                    desc: 'Years of heavy barbell and tactical conditioning. Accustomed to high volume and intensity.',
                  },
                  {
                    id: 'intermediate' as const,
                    title: 'Dedicated Gym Athlete (1-3 Years)',
                    desc: 'Comfortable with compound lifts and looking for disciplined progression and PR tracking.',
                  },
                  {
                    id: 'recruit' as const,
                    title: 'Recruit / Beginner (< 1 Year)',
                    desc: 'Building fundamental mechanics, safe lifting form, and daily consistency.',
                  },
                ].map((item) => {
                  const isSelected = answers.experience === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers({ ...answers, experience: item.id })}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-99 ${
                        isSelected
                          ? 'bg-[#221C18] border-[#D9A184] text-white shadow-md'
                          : 'bg-[#121110] border-[#242220] hover:border-[#383430] text-neutral-300'
                      }`}
                    >
                      <div className="pr-4">
                        <div className="font-black text-sm text-white">{item.title}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-[#D9A184] text-[#140D09]' : 'border border-[#383430]'
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

          {/* STEP 3: Equipment */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">
                  What equipment do you have access to?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Filters exercise recommendations and plate calculations accordingly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  {
                    id: 'full_gym' as const,
                    title: 'Commercial / Base Gym',
                    desc: 'Barbells, dumbbells, cable stacks, machines, pull-up rigs',
                  },
                  {
                    id: 'barbell_home' as const,
                    title: 'Home Iron Garage',
                    desc: 'Power rack, Olympic barbell, iron plates & flat/incline bench',
                  },
                  {
                    id: 'dumbbells' as const,
                    title: 'Dumbbells & Bench',
                    desc: 'Adjustable dumbbells, resistance bands & bodyweight',
                  },
                  {
                    id: 'bodyweight' as const,
                    title: 'Field & Calisthenics',
                    desc: 'Pull-up bar, dip bars, boots & pack, bodyweight mastery',
                  },
                ].map((item) => {
                  const isSelected = answers.equipment === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers({ ...answers, equipment: item.id })}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-98 ${
                        isSelected
                          ? 'bg-[#221C18] border-[#D9A184] shadow-md text-white'
                          : 'bg-[#121110] border-[#242220] hover:border-[#383430] text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-[#D9A184] font-mono">EQUIPMENT</span>
                        {isSelected && <Check className="w-4 h-4 text-[#D9A184] stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">{item.title}</div>
                        <div className="text-[11px] text-neutral-400 mt-1 leading-snug">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Coaching Personality */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">
                  Choose your coaching voice & discipline philosophy
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Dictates motivational cadences, rest timer cues, and daily philosophical wisdom.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  {
                    id: 'marine' as CoachPersonality,
                    title: 'Marine Combat Conditioning (USMC)',
                    subtitle: 'Semper Fidelis · Uncompromising Discipline & Grit',
                    desc: '“Pain is weakness leaving the body.” No excuses, mission-first, warrior mindset.',
                    badge: 'USMC VETERAN RECOMMENDED',
                    icon: <Shield className="w-5 h-5 text-red-400" />,
                  },
                  {
                    id: 'stoic' as CoachPersonality,
                    title: 'Classical Stoic (Marcus Aurelius & Epictetus)',
                    subtitle: 'Mastery of Self · The Obstacle is the Way',
                    desc: '“You have power over your mind, not outside events.” Calm, calculated, virtuous iron work.',
                    badge: 'PHILOSOPHICAL MASTERY',
                    icon: <Compass className="w-5 h-5 text-[#D9A184]" />,
                  },
                  {
                    id: 'coach' as CoachPersonality,
                    title: 'High-Performance Specialist',
                    subtitle: 'Progressive Overload · Periodization & Metrics',
                    desc: '“Consistency beats intensity.” Data-driven, precise RPE tracking and systematic adaptation.',
                    badge: 'DATA & SCIENCE',
                    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
                  },
                ].map((item) => {
                  const isSelected = answers.personality === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAnswers({ ...answers, personality: item.id })}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between active:scale-99 ${
                        isSelected
                          ? 'bg-[#221C18] border-[#D9A184] text-white shadow-md'
                          : 'bg-[#121110] border-[#242220] hover:border-[#383430] text-neutral-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 pr-2">
                        <div className="p-2.5 rounded-xl bg-[#1C1A18] mt-0.5">{item.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-sm text-white">{item.title}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#1C1A18] text-[#D9A184] border border-[#D9A184]/30">
                              {item.badge}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-neutral-400">
                            {item.subtitle}
                          </div>
                          <div className="text-[11px] text-neutral-500 italic mt-1 leading-snug">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                          isSelected ? 'bg-[#D9A184] text-[#140D09]' : 'border border-[#383430]'
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
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#242220] bg-[#121110] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-[#1C1A18] hover:bg-[#262422] border border-[#2E2C2A] text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-[#140D09] font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-full bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Complete Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
