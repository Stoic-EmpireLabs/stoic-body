"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";
import { QuestionnaireAnswers } from "@/lib/onboarding";
import { confettiCelebration } from "@/lib/confetti";

export default function HostOnboardingModal() {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    saveNewClientProfile,
    switchProfile,
    startTour,
    awardXp,
    playBellSound,
  } = useStoic();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Form State
  const [formData, setFormData] = useState<QuestionnaireAnswers>({
    callsign: "Stoic Initiate",
    age: 30,
    height: "5'10\"",
    currentWeight: 170,
    targetWeight: 155,
    targetWeeks: 10,
    targetDate: "2026-12-15",
    primaryMission: "Sovereign physical recomposition and elite AI mastery",
    fastingProtocol: "23:1 OMAD",
    proteinPreference: "Chicken",
    hydrationFocus: "Lemon Chia Water",
    trainingFocus: "Calisthenics",
    trainingDaysPerWeek: 5,
    techMasteryTrack: "AI Spectrum",
    dailyStudyMinutes: 45,
  });

  if (!isOnboardingOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      playBellSound();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinishOnboarding = (launchTourAfter: boolean) => {
    const profile = saveNewClientProfile(formData);
    awardXp(500, "🎉 Sovereign Client Onboarding & Calibration Completed", "Knowledge");
    confettiCelebration();
    setIsOnboardingOpen(false);

    if (launchTourAfter) {
      setTimeout(() => {
        startTour();
      }, 400);
    }
  };

  const handleLoadFounderDefaults = () => {
    switchProfile("founder");
    setIsOnboardingOpen(false);
    awardXp(200, "Loaded Stoic Founder Protocol (170 -> 155 Recomp)", "Discipline");
    confettiCelebration();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0A0A0F] border border-amber-500/40 rounded-2xl shadow-2xl shadow-red-950/50 p-6 sm:p-8 text-white animate-fade-in my-8">
        
        {/* Host Avatar & Greeting Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[2px] shadow-lg shadow-amber-900/40">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-xl">
                🤖
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Aethelgard
                </h2>
                <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-600/40 font-mono font-bold uppercase">
                  Autonomous Host
                </span>
              </div>
              <p className="text-xs text-amber-400/90 font-mono">
                Sovereign Protocol Calibration Engine
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-400 font-mono">
              Step <span className="text-amber-400 font-bold">{step}</span> of {totalSteps}
            </div>
            {/* Step progress dots */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step
                      ? "w-6 bg-gradient-to-r from-red-600 to-amber-500"
                      : s < step
                      ? "w-2 bg-amber-500/60"
                      : "w-2 bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* HOST DIALOGUE SPEECH BUBBLE */}
        <div className="bg-[#12121A]/85 border border-amber-500/30 ring-1 ring-white/5 rounded-xl p-4 mb-6 shadow-inner text-sm text-zinc-200 leading-relaxed font-sans backdrop-blur-sm">
          {step === 1 && (
            <p>
              &ldquo;Welcome to <strong>Stoic Sovereign</strong>. I am your autonomous system host. This is not a passive logging tool — it is a gamified operating system engineered for radical physical discipline, sovereign intellect, and zero-compromise execution. Let us establish your identity in the registry.&rdquo;
            </p>
          )}
          {step === 2 && (
            <p>
              &ldquo;Now for your physical baseline. We build bodies by the numbers: empirical scale weights, 7-day moving averages, and non-emotional deficit tracking. Where do you stand today, and what is your sovereign target?&rdquo;
            </p>
          )}
          {step === 3 && (
            <p>
              &ldquo;Discipline begins in the feeding window. In 23:1 OMAD, we fast for 23 hours to induce peak autophagy and ketosis, then replenish with an exact 140g protein whole-food feast and cellular hydration elixirs.&rdquo;
            </p>
          )}
          {step === 4 && (
            <p>
              &ldquo;We forge muscle without machines or excuses. Dumbbell-free calisthenics (strict pull-ups, dips, core burnouts) and sharp 3-minute boxing intervals condition both the body and the warrior nervous system.&rdquo;
            </p>
          )}
          {step === 5 && (
            <p>
              &ldquo;Physical power without intellectual dominance is hollow. Select your technical mastery track for daily focus — AI, Autonomous Antigravity Swarms, or Vibe Coding. We track knowledge XP just like physical reps.&rdquo;
            </p>
          )}
          {step === 6 && (
            <p>
              &ldquo;Your biometric and intellectual blueprint is synthesized. I have allocated your baseline macros, daily anchor missions, and initial weekly targets. You are now equipped. Shall I guide you through the command deck?&rdquo;
            </p>
          )}
        </div>

        {/* STEP CONTENT BODY */}
        <div className="min-h-[280px]">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                1. Registry & Warrior Call-Sign
              </h3>
              <div>
                <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                  Warrior Call-Sign / Name
                </label>
                <input
                  type="text"
                  value={formData.callsign}
                  onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                  placeholder="e.g. Stoic Centurion, Vanguard Titan..."
                  className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5 font-medium">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="e.g. 5'10&quot;"
                    className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                  Primary Life Mission
                </label>
                <input
                  type="text"
                  value={formData.primaryMission}
                  onChange={(e) => setFormData({ ...formData, primaryMission: e.target.value })}
                  placeholder="e.g. Reach 155 lbs with visible abs & master autonomous AI swarms"
                  className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              {/* Quick load founder preset banner */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>Looking for the pre-loaded 170 &rarr; 155 lbs founder setup?</span>
                <button
                  type="button"
                  onClick={handleLoadFounderDefaults}
                  className="text-amber-400 hover:text-amber-300 font-bold underline font-mono ml-2"
                >
                  ⚡ Load Founder Baseline &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BIOMETRICS, TIMELINE & DEFICIT CALIBRATION */}
          {step === 2 && (() => {
            const targetLoss = Math.max(0, formData.currentWeight - formData.targetWeight);
            const weeks = Math.max(1, formData.targetWeeks || 10);
            const weeklyVelocity = (targetLoss / weeks).toFixed(1);
            const dailyDeficit = Math.round((Number(weeklyVelocity) * 3500) / 7);
            const targetDateStr = formData.targetDate || "2026-12-15";

            const setPresetDuration = (w: number) => {
              const d = new Date();
              d.setDate(d.getDate() + w * 7);
              setFormData({
                ...formData,
                targetWeeks: w,
                targetDate: d.toISOString().split("T")[0],
              });
            };

            return (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                  2. Biometrics, Target Timeline &amp; Deficit Velocity
                </h3>

                {/* Weights Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#12121C] border border-zinc-800 p-4 rounded-xl">
                    <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">
                      Current Scale Weight
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.currentWeight}
                        onChange={(e) =>
                          setFormData({ ...formData, currentWeight: Number(e.target.value) })
                        }
                        className="w-24 bg-[#181824] border border-zinc-700 rounded-lg px-3 py-2 text-xl font-bold text-white outline-none"
                      />
                      <span className="text-sm font-mono text-zinc-400">lbs</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2">
                      Founder baseline: 170.0 lbs
                    </p>
                  </div>

                  <div className="bg-[#12121C] border border-amber-500/30 p-4 rounded-xl">
                    <label className="block text-xs text-amber-400 mb-1 font-mono uppercase">
                      Target Recomp Weight
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.targetWeight}
                        onChange={(e) =>
                          setFormData({ ...formData, targetWeight: Number(e.target.value) })
                        }
                        className="w-24 bg-[#181824] border border-amber-500/50 rounded-lg px-3 py-2 text-xl font-bold text-amber-400 outline-none"
                      />
                      <span className="text-sm font-mono text-amber-300">lbs</span>
                    </div>
                    <p className="text-[11px] text-amber-400/80 mt-2">
                      Target: 155.0 lbs (Visible Abs)
                    </p>
                  </div>
                </div>

                {/* Target Timeline / Duration Selector */}
                <div className="bg-[#12121C] border border-zinc-800/80 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-zinc-300 font-mono uppercase font-bold">
                      Target Campaign Duration &amp; Deadline
                    </label>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      {formData.targetWeeks || 10} Weeks &bull; Target: {targetDateStr}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {[
                      { w: 4, label: "4 Wks", desc: "Sprint" },
                      { w: 8, label: "8 Wks", desc: "Rapid" },
                      { w: 10, label: "10 Wks", desc: "Founder" },
                      { w: 12, label: "12 Wks", desc: "Optimal" },
                      { w: 16, label: "16 Wks", desc: "Steady" },
                    ].map((item) => (
                      <button
                        key={item.w}
                        type="button"
                        onClick={() => setPresetDuration(item.w)}
                        className={`p-2 rounded-lg border text-center transition ${
                          formData.targetWeeks === item.w
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                            : "bg-[#181824] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-xs font-mono">{item.label}</div>
                        <div className="text-[9px] text-zinc-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-zinc-400 font-mono mb-1">
                        Custom Duration (Weeks)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="52"
                        value={formData.targetWeeks || 10}
                        onChange={(e) => {
                          const w = Math.max(1, Number(e.target.value));
                          const d = new Date();
                          d.setDate(d.getDate() + w * 7);
                          setFormData({
                            ...formData,
                            targetWeeks: w,
                            targetDate: d.toISOString().split("T")[0],
                          });
                        }}
                        className="w-full bg-[#181824] border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 font-mono mb-1">
                        Target Goal Deadline Date
                      </label>
                      <input
                        type="date"
                        value={targetDateStr}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const diffMs = new Date(newDate).getTime() - new Date().getTime();
                          const computedWeeks = Math.max(1, Math.round(diffMs / (7 * 86400000)));
                          setFormData({
                            ...formData,
                            targetDate: newDate,
                            targetWeeks: computedWeeks,
                          });
                        }}
                        className="w-full bg-[#181824] border border-zinc-700 rounded-lg px-3 py-1.5 text-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-Time Telemetry & Deficit Velocity Display */}
                <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Total Fat Loss Target:</span>
                    <strong className="text-white font-bold">{targetLoss} lbs</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Weekly Fat Loss Velocity:</span>
                    <strong className="text-amber-400 font-bold">-{weeklyVelocity} lbs / week</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Required Daily Energy Deficit:</span>
                    <strong className="text-red-400 font-bold">-{dailyDeficit} kcal / day</strong>
                  </div>
                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-medium">
                      ✓ Feasibility: {Number(weeklyVelocity) <= 2.0 ? "Optimal & Muscle-Preserving (Morton 2018)" : "Aggressive Shred Protocol"}
                    </span>
                    <span className="text-zinc-500">
                      Schedules {weeks * 7} Days &bull; ~{weeks * 21} Events
                    </span>
                  </div>
                </div>

                {/* Quick Archetype Preset Buttons */}
                <div className="pt-1">
                  <span className="text-xs text-zinc-400 font-mono block mb-2">
                    Quick Recomp Archetypes:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          currentWeight: 170,
                          targetWeight: 155,
                          targetWeeks: 10,
                          targetDate: "2026-12-15",
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left transition ${
                        formData.currentWeight === 170 && formData.targetWeight === 155 && formData.targetWeeks === 10
                          ? "bg-amber-500/10 border-amber-500 text-amber-300"
                          : "bg-[#14141E] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-bold">170 &rarr; 155 lbs &bull; 10 Wks</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Founder Protocol (Dec 15)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          currentWeight: 185,
                          targetWeight: 165,
                          targetWeeks: 12,
                          targetDate: "2026-12-28",
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left transition ${
                        formData.currentWeight === 185 && formData.targetWeight === 165
                          ? "bg-amber-500/10 border-amber-500 text-amber-300"
                          : "bg-[#14141E] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-bold">185 &rarr; 165 lbs &bull; 12 Wks</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Heavy Recomp</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          currentWeight: 160,
                          targetWeight: 150,
                          targetWeeks: 8,
                          targetDate: "2026-11-30",
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left transition ${
                        formData.currentWeight === 160 && formData.targetWeight === 150
                          ? "bg-amber-500/10 border-amber-500 text-amber-300"
                          : "bg-[#14141E] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-bold">160 &rarr; 150 lbs &bull; 8 Wks</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Competition Shred</div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 3: NUTRITION & FASTING */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                3. Fasting Protocol & Meal Blueprints
              </h3>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-mono uppercase">
                  Fasting Protocol Archetype
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "23:1 OMAD", title: "23:1 OMAD (Recommended)", desc: "23h Fast / 1h 140g Protein Feast" },
                    { id: "16:8 Lean Gains", title: "16:8 Lean Gains", desc: "16h Fast / 8h Two-Meal Window" },
                    { id: "20:4 Warrior Diet", title: "20:4 Warrior Diet", desc: "20h Fast / 4h Feeding Window" },
                    { id: "3 Clean Meals", title: "3 Clean Meals", desc: "Evenly spaced macro feedings" },
                  ].map((proto) => (
                    <button
                      key={proto.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, fastingProtocol: proto.id as any })
                      }
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.fastingProtocol === proto.id
                          ? "bg-red-950/40 border-red-600 text-white shadow-sm"
                          : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-400">{proto.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{proto.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-mono uppercase">
                  Preferred Sovereign Protein Blueprint
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Fish", label: "🐟 Wild Fish", desc: "14oz Salmon/Cod + Shrimp" },
                    { id: "Turkey", label: "🦃 Lean Turkey", desc: "16oz 93/7 Turkey + 3 Eggs" },
                    { id: "Chicken", label: "🍗 Clean Chicken", desc: "16oz Chicken Breast" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, proteinPreference: p.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        formData.proteinPreference === p.id
                          ? "bg-amber-500/10 border-amber-500 text-white"
                          : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-amber-400">{p.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1 font-mono uppercase">
                  Hydration & Satiety Elixir
                </label>
                <select
                  value={formData.hydrationFocus}
                  onChange={(e) => setFormData({ ...formData, hydrationFocus: e.target.value as any })}
                  className="w-full bg-[#151520] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Lemon Chia Water">💧 Sovereign Lemon Water with Soaked Chia Seeds (Satiety Shield)</option>
                  <option value="Fasting Electrolytes">⚡ Fasting Mineral Electrolyte Shield (Zero-Calorie)</option>
                  <option value="EGCG Matcha">🍵 Ceremonial Matcha & EGCG Fat Oxidation Tonic</option>
                  <option value="All Elixirs">🧪 All 5 Healthy Drinks & Recovery Elixirs</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: PHYSICAL MOVEMENT */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                4. Physical Movement Discipline
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "Calisthenics",
                    title: "Dumbbell-Free Calisthenics",
                    desc: "Strict pull-ups, chin-ups, chest-to-bar, dips, hollow holds, hanging leg raises.",
                  },
                  {
                    id: "Boxing",
                    title: "Boxing Interval Rounds",
                    desc: "3-minute intense rounds, 1-minute rest. Footwork, shadowboxing & heavy bag.",
                  },
                  {
                    id: "Incline Walk",
                    title: "Incline Treadmill Zone 2",
                    desc: "12% incline at 3.0 MPH for 20-30 minutes. Pure mitochondrial fat oxidation.",
                  },
                  {
                    id: "Hybrid All-Around",
                    title: "Hybrid All-Around",
                    desc: "Calisthenics + boxing rounds + Zone-2 cardio integrated into 1 seamless flow.",
                  },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, trainingFocus: mod.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.trainingFocus === mod.id
                        ? "bg-red-950/40 border-red-600 text-white"
                        : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-400">{mod.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{mod.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-mono uppercase">
                  Target Workouts Per Week: <span className="text-amber-400 font-bold">{formData.trainingDaysPerWeek} Days</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  value={formData.trainingDaysPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, trainingDaysPerWeek: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>3 Days (Minimum)</span>
                  <span>5 Days (Warrior Standard)</span>
                  <span>7 Days (Iron Sovereign)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TECH & AI MASTERY */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                5. Intellectual Dominion & AI Mastery Track
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "AI Spectrum",
                    title: "🧠 AI Hierarchy Spectrum",
                    desc: "Master AI -> ML -> DL -> GenAI -> LLMs -> RAG -> Autonomous Agent Swarms with interactive code.",
                  },
                  {
                    id: "Antigravity Swarms",
                    title: "⚡ Antigravity & Agent Workflows",
                    desc: "Autonomous software development, subagent pipelines, background daemons, and CLI mastery.",
                  },
                  {
                    id: "Vibe Coding",
                    title: "🚀 Vibe Coding & Next.js",
                    desc: "Turn raw vision into production web apps with Claude/Gemini, TypeScript, and modern UI.",
                  },
                  {
                    id: "Full-Stack Web",
                    title: "🌐 Full-Stack Architecture",
                    desc: "Modern CSS, Tailwind, Edge computing, SQLite durability, and Vercel cloud hosting.",
                  },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, techMasteryTrack: track.id as any })
                    }
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.techMasteryTrack === track.id
                        ? "bg-amber-500/10 border-amber-500 text-white"
                        : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-400">{track.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-1 leading-snug">{track.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-mono uppercase">
                  Daily Dedicated Tech Study: <span className="text-amber-400 font-bold">{formData.dailyStudyMinutes} Minutes</span>
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyStudyMinutes: mins })}
                      className={`p-2 rounded-lg border text-center transition ${
                        formData.dailyStudyMinutes === mins
                          ? "bg-red-950/60 border-red-600 text-white font-bold"
                          : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SYNTHESIS & COMPLETION */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
                6. Sovereign Protocol Synthesized
              </h3>

              <div className="bg-[#12121E] border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs text-zinc-400 font-mono">Profile Callsign:</span>
                  <span className="text-sm font-bold text-white">{formData.callsign}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs text-zinc-400 font-mono">Body Recomp Goal:</span>
                  <span className="text-xs font-bold text-amber-400">
                    {formData.currentWeight} lbs &rarr; {formData.targetWeight} lbs ({formData.fastingProtocol})
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs text-zinc-400 font-mono">Daily Calibrated Nutrition:</span>
                  <span className="text-xs font-mono font-bold text-white">
                    ~1,800 kcal &bull; 140g Protein &bull; {formData.proteinPreference} Formula
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs text-zinc-400 font-mono">Movement & Tech Track:</span>
                  <span className="text-xs text-zinc-300">
                    {formData.trainingFocus} &bull; {formData.techMasteryTrack} ({formData.dailyStudyMinutes}m)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-amber-400 font-mono font-bold">Initiate Bounty Reward:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                    +500 XP Awarded &bull; Level 1 Initiate
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-950/40 to-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 text-xs text-zinc-300">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <span>🎓 Guided App Tour Recommended</span>
                </div>
                The Host can now walk you through your Command Center, Fasting Ring, Meal Blueprints, and Interactive AI Courses step-by-step.
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER BUTTONS */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-5 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition"
            >
              &larr; Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(false)}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-400 transition"
            >
              Skip Setup (Explore as Guest)
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-red-950/60 transition"
            >
              Continue &rarr;
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinishOnboarding(false)}
                className="px-4 py-2.5 rounded-xl bg-[#181824] border border-zinc-700 hover:border-zinc-500 text-xs font-bold text-zinc-300 transition"
              >
                Enter App Directly
              </button>
              <button
                type="button"
                onClick={() => handleFinishOnboarding(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-red-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-extrabold text-xs tracking-wider shadow-lg shadow-amber-950/60 transition font-mono"
              >
                🎓 Launch Interactive Tour &rarr;
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
