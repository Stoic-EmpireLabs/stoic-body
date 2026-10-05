"use client";

import React, { useState, useId } from "react";
import { useStoic } from "@/context/StoicContext";
import { QuestionnaireAnswers } from "@/lib/onboarding";
import { confettiCelebration } from "@/lib/confetti";

export default function HostOnboardingModal() {
  const fileInputId = useId();
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
  const totalSteps = 7;

  // Form State initialized with Sovereign Defaults
  const [formData, setFormData] = useState<QuestionnaireAnswers>({
    callsign: "Stoic Initiate",
    gender: "male",
    primaryGoal: "recomp",
    startingBodyType: "average",
    targetPhysique: "spartan",
    userPhotoUrl: "",
    age: 30,
    height: "5'10\"",
    currentWeight: 170,
    targetWeight: 155,
    targetWeeks: 10,
    targetDate: "2026-12-15",
    primaryMission: "Sovereign physical recomposition, 140g protein OMAD, and elite daily discipline",
    fastingProtocol: "23:1 OMAD",
    proteinPreference: "Chicken",
    foodPreferences: ["Chicken", "Greens", "Chia Seeds"],
    hydrationFocus: "Lemon Chia Water",
    trainingFocus: "Calisthenics & Boxing",
    trainingDaysPerWeek: 5,
    stoicHabits: ["05:30 Wake & Cold Plunge", "24oz Lemon Chia Water", "Evening Stoic Reflection"],
  });

  if (!isOnboardingOpen) return null;

  // Scientific live calculations based on current answers
  const isFemale = formData.gender === "female";
  const weightKg = (formData.currentWeight || 170) / 2.20462;
  const heightCm = 178; // 5'10"
  const age = formData.age || 30;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (isFemale ? -161 : 5);
  const tdee = Math.round(bmr * 1.45);

  const targetLoss = Math.max(0, formData.currentWeight - formData.targetWeight);
  const weeks = Math.max(1, formData.targetWeeks || 10);
  const weeklyLossLbs = (targetLoss / weeks).toFixed(1);

  let dailyDeficit = Math.round((Number(weeklyLossLbs) * 3500) / 7);
  let dailyCalories = Math.max(1500, tdee - dailyDeficit);

  if (formData.primaryGoal === "bulk") {
    dailyDeficit = -350;
    dailyCalories = tdee + 350;
  } else if (formData.primaryGoal === "maintain") {
    dailyDeficit = 0;
    dailyCalories = tdee;
  } else if (formData.primaryGoal === "recomp") {
    dailyDeficit = 350;
    dailyCalories = tdee - 350;
  }

  const dailyProtein = Math.max(
    130,
    Math.round(Math.min(formData.targetWeight, formData.currentWeight) * 0.95)
  );

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

  const handleFinishOnboarding = (launchTourAfter: boolean = false) => {
    saveNewClientProfile(formData);
    awardXp(750, "🎉 Sovereign Plan Configured & Launched", "Dominion");
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === "string") {
          setFormData((prev) => ({
            ...prev,
            userPhotoUrl: uploadEvent.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFoodPreference = (item: string) => {
    const current = formData.foodPreferences || [];
    if (current.includes(item)) {
      setFormData({ ...formData, foodPreferences: current.filter((f) => f !== item) });
    } else {
      setFormData({ ...formData, foodPreferences: [...current, item] });
    }
  };

  const toggleStoicHabit = (item: string) => {
    const current = formData.stoicHabits || [];
    if (current.includes(item)) {
      setFormData({ ...formData, stoicHabits: current.filter((h) => h !== item) });
    } else {
      setFormData({ ...formData, stoicHabits: [...current, item] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950/95 border border-amber-500/40 ring-1 ring-white/10 rounded-2xl shadow-2xl p-5 sm:p-8 text-white animate-fade-in my-6">
        
        {/* Glow ambient accent */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Host Avatar & Progress */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[1.5px] shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center text-lg">
                🛡️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-serif">
                  Aethelgard
                </h2>
                <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-600/40 font-mono font-bold uppercase">
                  Self-Service Calibrator
                </span>
              </div>
              <p className="text-xs text-amber-400 font-mono">
                Zero Trainers &bull; 100% Autonomous Sovereign Plan Generator
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-400 font-mono">
              Step <span className="text-amber-400 font-bold">{step}</span> of {totalSteps}
            </div>
            {/* Step progress pills */}
            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-5 bg-gradient-to-r from-amber-400 to-red-600"
                      : s < step
                      ? "w-2 bg-amber-500/60"
                      : "w-2 bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* HOST DIALOGUE NARRATION */}
        <div className="bg-[#12121A]/85 border border-amber-500/30 ring-1 ring-white/5 rounded-xl p-3.5 mb-5 shadow-inner text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans backdrop-blur-sm">
          {step === 1 && (
            <p>
              &ldquo;This is a self-service operating system. No trainers, no gatekeepers. Select your biological baseline and whether you are <strong>Cutting</strong>, <strong>Leaning Out</strong>, or <strong>Bulking</strong>. We configure your exact numbers automatically.&rdquo;
            </p>
          )}
          {step === 2 && (
            <p>
              &ldquo;Identify your starting baseline from real visual archetypes. Every body responds differently to deficits and autophagy — selecting your closest frame calibrates our metabolic algorithms.&rdquo;
            </p>
          )}
          {step === 3 && (
            <p>
              &ldquo;What is your sovereign target? Upload your starting photo if desired for our side-by-side progression engine. We render a realistic target goal physique grounded in genuine human body composition physics.&rdquo;
            </p>
          )}
          {step === 4 && (
            <p>
              &ldquo;Choose your feeding protocol. From strict <strong>23:1 OMAD</strong> for maximum autophagy and lipolysis, to <strong>16:8 Intermittent Fasting</strong>, <strong>Liquid Smoothies</strong>, or whole foods. We calculate exact calories and a guaranteed 140g+ protein target.&rdquo;
            </p>
          )}
          {step === 5 && (
            <p>
              &ldquo;Discipline is built on the mat and in daily habits. We build muscle without dumbbells via strict calisthenics and boxing rounds, paired with the 05:30 AM morning anchor and evening reflection.&rdquo;
            </p>
          )}
          {step === 6 && (
            <p>
              &ldquo;Set your empirical starting and target scale weights. The system calculates weekly velocity, daily energy deficit, and periodizes your 10 to 12-week roadmap.&rdquo;
            </p>
          )}
          {step === 7 && (
            <p>
              &ldquo;Your Sovereign Blueprint is compiled. Review your calories, protein, and generated 7-day calendar. With one click, launch your plan and begin execution on Today.&rdquo;
            </p>
          )}
        </div>

        {/* STEP CONTENT BODY */}
        <div className="min-h-[300px]">

          {/* STEP 1: GENDER & PRIMARY DIRECTIVE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block mb-2">
                  1. Biological Baseline &amp; Physiology
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "male", label: "Male Sovereign", icon: "⚔️", desc: "Mifflin-St Jeor (+5 constant)" },
                    { id: "female", label: "Female Sovereign", icon: "🛡️", desc: "Mifflin-St Jeor (-161 constant)" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g.id as any })}
                      className={`p-4 rounded-xl border text-left transition flex items-center gap-3.5 min-h-[48px] ${
                        formData.gender === g.id
                          ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 text-white"
                          : "bg-zinc-900/60 border-white/10 hover:border-amber-500/30 text-zinc-300"
                      }`}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{g.label}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{g.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block mb-2">
                  2. Primary Objective (Direction)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "cut",
                      title: "🔥 Aggressive Cut",
                      subtitle: "Rapid Fat Loss & Single-Digit Body Fat",
                      desc: "-750 kcal daily deficit, 1.5 lbs/week velocity. Preserves 100% lean mass with 140g+ protein.",
                    },
                    {
                      id: "recomp",
                      title: "⚡ Lean Recomp (Recommended)",
                      subtitle: "Burn Fat & Build Muscle Simultaneously",
                      desc: "-350 kcal deficit. 170 -> 155 lbs baseline with visible abs & calisthenics power.",
                    },
                    {
                      id: "bulk",
                      title: "💪 Clean Hypertrophy Bulk",
                      subtitle: "Pack Dense Muscle Mass",
                      desc: "+350 kcal surplus. Progressive overload calisthenics with high amino acid turnover.",
                    },
                    {
                      id: "maintain",
                      title: "🛡️ Maintain & Harden",
                      subtitle: "Peak Athletic Conditioning",
                      desc: "Zero deficit. Functional power, combat cardio, and metabolic optimization.",
                    },
                  ].map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, primaryGoal: obj.id as any })}
                      className={`p-3.5 rounded-xl border text-left transition min-h-[48px] ${
                        formData.primaryGoal === obj.id
                          ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 text-white"
                          : "bg-zinc-900/60 border-white/10 hover:border-amber-500/30 text-zinc-300"
                      }`}
                    >
                      <div className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{obj.title}</span>
                        {formData.primaryGoal === obj.id && (
                          <span className="text-xs text-amber-400 font-mono">✓ Selected</span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono mt-0.5">{obj.subtitle}</div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{obj.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Founder Baseline Quick Loader */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span>Looking for the 170 &rarr; 155 lbs Founder Baseline?</span>
                <button
                  type="button"
                  onClick={handleLoadFounderDefaults}
                  className="text-amber-400 hover:text-amber-300 font-bold underline font-mono min-h-[44px] flex items-center"
                >
                  ⚡ Load 170 &rarr; 155 lbs Founder Preset &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STARTING BODY TYPE (VISUAL ARCHETYPES) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Select Your Closest Starting Frame ({isFemale ? "Female" : "Male"})
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">Visual Reference Guide</span>
              </div>

              {/* Reference artwork visual banner */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 p-2 text-center">
                <img
                  src="/assets/brand/body-references.webp"
                  alt="Body Archetype Reference Sheet"
                  className="w-full h-auto max-h-48 object-cover rounded-lg opacity-90 hover:opacity-100 transition"
                />
                <div className="text-[10px] text-zinc-400 font-mono mt-1.5 flex justify-around">
                  <span>Col 1: Slender</span>
                  <span>Col 2: Average</span>
                  <span>Col 3: Fuller</span>
                  <span>Col 4: Athletic</span>
                </div>
              </div>

              {/* Archetype Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: "slender",
                    title: "Slender / Ectomorph",
                    desc: "Naturally lean, modest muscle, fast metabolism.",
                  },
                  {
                    id: "average",
                    title: "Average / Soft Mid",
                    desc: "Common baseline, softer midsection, ready to cut.",
                  },
                  {
                    id: "fuller",
                    title: "Fuller / High Storage",
                    desc: "Broader frame, high energy storage, primed for OMAD.",
                  },
                  {
                    id: "athletic",
                    title: "Athletic / Solid Base",
                    desc: "Existing muscle foundation, ready for recomp.",
                  },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, startingBodyType: type.id as any })}
                    className={`p-3 rounded-xl border text-left transition min-h-[48px] ${
                      formData.startingBodyType === type.id
                        ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 text-white"
                        : "bg-zinc-900/60 border-white/10 hover:border-amber-500/30 text-zinc-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{type.title}</div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TARGET GOAL PHYSIQUE & PHOTO VISUALIZATION */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block">
                Target Goal Physique &amp; Photo Visualization
              </span>

              {/* Physique Archetype Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: "spartan",
                    title: "Chiseled Spartan",
                    bf: isFemale ? "16-18% BF" : "8-10% BF",
                    desc: "Deep abdominal serratus & visible six-pack.",
                  },
                  {
                    id: "gladiator",
                    title: "Athletic Gladiator",
                    bf: isFemale ? "19-21% BF" : "11-13% BF",
                    desc: "Functional combat power, thick lats & stamina.",
                  },
                  {
                    id: "titan",
                    title: "Heavyweight Titan",
                    bf: isFemale ? "22-25% BF" : "15-18% BF",
                    desc: "Maximum raw mass, dense shoulder & chest power.",
                  },
                  {
                    id: "sculpted",
                    title: "Sculpted Athlete",
                    bf: isFemale ? "17-19% BF" : "10-12% BF",
                    desc: "Light, agile, maximum calisthenics leverage.",
                  },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetPhysique: p.id as any })}
                    className={`p-3 rounded-xl border text-left transition min-h-[48px] ${
                      formData.targetPhysique === p.id
                        ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 text-white"
                        : "bg-zinc-900/60 border-white/10 hover:border-amber-500/30 text-zinc-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{p.title}</div>
                    <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">{p.bf}</div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{p.desc}</p>
                  </button>
                ))}
              </div>

              {/* Photo Upload & Realistic Goal Visualization Studio */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Upload Drop Zone */}
                  <div className="w-full sm:w-1/2 border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-4 text-center transition">
                    {formData.userPhotoUrl ? (
                      <div className="space-y-2">
                        <img
                          src={formData.userPhotoUrl}
                          alt="Starting Baseline Photo"
                          className="h-28 w-28 object-cover rounded-lg mx-auto border border-amber-500/40"
                        />
                        <span className="text-[10px] text-emerald-400 font-mono block">
                          ✓ Photo Uploaded Locally (Private)
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, userPhotoUrl: "" })}
                          className="text-[10px] text-red-400 underline font-mono"
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl mb-1">📸</div>
                        <div className="text-xs font-bold text-white">Upload Starting Photo</div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Drag &amp; drop or click to upload. Stored 100% locally in browser memory.
                        </p>
                        <label
                          htmlFor={fileInputId}
                          className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-mono font-bold cursor-pointer transition min-h-[44px] flex items-center justify-center"
                        >
                          Choose Photo
                        </label>
                        <input
                          id={fileInputId}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Goal Physique Preview Card */}
                  <div className="w-full sm:w-1/2 p-3.5 rounded-xl bg-zinc-900/80 border border-amber-500/30 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase">
                      <span>Realistic Goal Visualization</span>
                      <span className="text-[9px] bg-red-950/80 text-red-300 px-1.5 py-0.5 rounded border border-red-600/40">
                        Physique Physics
                      </span>
                    </div>
                    <div className="text-white">
                      Target Physique: <strong className="text-amber-300 uppercase">{formData.targetPhysique}</strong>
                    </div>
                    <div className="text-zinc-300 text-[11px]">
                      Expected Body Fat: <strong className="text-emerald-400">{isFemale ? "16-18%" : "8-10%"}</strong>
                    </div>
                    <div className="text-zinc-300 text-[11px]">
                      Lean Mass Protection: <strong className="text-amber-300">100% via 140g Protein</strong>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">
                      *Goal illustration is grounded in empirical body composition metrics and Mifflin-St Jeor metabolic physics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NAMED DIETING PROTOCOLS & FOODS */}
          {step === 4 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block">
                Select Your Feeding Protocol
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: "23:1 OMAD",
                    title: "23:1 OMAD (One Meal A Day)",
                    badge: "Autophagy & High Lipolysis",
                    desc: "23h fasting window. 1 large 140g+ protein evening banquet at 05:30 PM. Massive GH release.",
                  },
                  {
                    id: "16:8 Lean Gains",
                    title: "16:8 Intermittent Fasting",
                    badge: "Steady Energy & Satiety",
                    desc: "16h fast, 8h feeding window (e.g. 12:00 PM - 08:00 PM). Sustained insulin sensitivity.",
                  },
                  {
                    id: "3 Clean Meals",
                    title: "Structured Whole-Food Deficit",
                    badge: "Classic Sports Nutrition",
                    desc: "3 clean, high-protein meals spaced throughout the day. Easy social adherence.",
                  },
                  {
                    id: "Liquid Diet / Smoothies",
                    title: "Liquid Nutrition & Clean Smoothies",
                    badge: "Digestive Rest & Hydration",
                    desc: "High-protein recovery shakes, green superfood elixirs, and nutrient-dense hydration broths.",
                  },
                  {
                    id: "Carnivore / Animal-Based",
                    title: "Carnivore / Animal-Based",
                    badge: "Zero Anti-Nutrients",
                    desc: "Steaks, ground beef, eggs, butter, salt. Maximum testosterone and zero intestinal bloating.",
                  },
                ].map((diet) => (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, fastingProtocol: diet.id as any })}
                    className={`p-3 rounded-xl border text-left transition min-h-[48px] ${
                      formData.fastingProtocol === diet.id
                        ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 text-white"
                        : "bg-zinc-900/60 border-white/10 hover:border-amber-500/30 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{diet.title}</span>
                      <span className="text-[9px] bg-red-950/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                        {diet.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{diet.desc}</p>
                  </button>
                ))}
              </div>

              {/* Food Preferences Multi-Select */}
              <div>
                <span className="text-xs font-bold text-zinc-300 font-mono block mb-1.5">
                  Select Preferred Protein &amp; Nutrient Sources (Choose all that apply):
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Chicken", "Turkey", "Salmon/Fish", "Lean Beef", "Whole Eggs", "Plant Protein", "Chia Seeds", "Steamed Greens"].map((food) => {
                    const isSelected = (formData.foodPreferences || []).includes(food);
                    return (
                      <button
                        key={food}
                        type="button"
                        onClick={() => toggleFoodPreference(food)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition min-h-[44px] flex items-center ${
                          isSelected
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md"
                            : "bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "} {food}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TRAINING MODALITY & STOIC HABITS */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block mb-2">
                  Training Modality (No Dumbbells Required)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "Calisthenics",
                      title: "Strict Calisthenics",
                      desc: "Pull-ups, dips, push-ups, and core compression.",
                    },
                    {
                      id: "Boxing",
                      title: "Boxing & Striking",
                      desc: "3-minute rounds, shadow combinations, high EPOC.",
                    },
                    {
                      id: "Calisthenics & Boxing",
                      title: "Warrior Hybrid",
                      desc: "Alternating calisthenics tension & fight conditioning.",
                    },
                  ].map((train) => (
                    <button
                      key={train.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, trainingFocus: train.id })}
                      className={`p-3 rounded-xl border text-left transition min-h-[48px] ${
                        formData.trainingFocus === train.id
                          ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 text-white"
                          : "bg-zinc-900/60 border-white/10 hover:border-amber-500/30 text-zinc-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{train.title}</div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{train.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Frequency */}
              <div>
                <label className="block text-xs text-zinc-300 mb-1.5 font-mono">
                  Weekly Training Frequency: <strong className="text-amber-400">{formData.trainingDaysPerWeek} Days / Week</strong>
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData({ ...formData, trainingDaysPerWeek: days })}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition min-h-[44px] flex items-center justify-center flex-1 ${
                        formData.trainingDaysPerWeek === days
                          ? "bg-amber-500 text-black shadow-md"
                          : "bg-zinc-900 border border-white/10 text-zinc-300"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Stoic Disciplines */}
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block mb-1.5">
                  Daily Stoic Habits &amp; Anchors:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "05:30 Wake & Cold Plunge",
                    "24oz Lemon Chia Water",
                    "Evening Stoic Reflection",
                    "Gallon Daily Hydration",
                  ].map((habit) => {
                    const isSelected = (formData.stoicHabits || []).includes(habit);
                    return (
                      <button
                        key={habit}
                        type="button"
                        onClick={() => toggleStoicHabit(habit)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition min-h-[44px] flex items-center ${
                          isSelected
                            ? "bg-gradient-to-r from-red-700 to-red-800 text-white border border-red-500/50 shadow"
                            : "bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white"
                        }`}
                      >
                        {isSelected ? "🛡️ " : "+ "} {habit}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: EMPIRICAL MEASUREMENTS & TIMELINE */}
          {step === 6 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block">
                Empirical Measurements &amp; Campaign Velocity
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-mono">Current Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                      className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2.5 text-white font-mono text-sm outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">lbs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-mono">Target Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                      className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2.5 text-white font-mono text-sm outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">lbs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-mono">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2.5 text-white font-mono text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-mono">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-[#151520] border border-zinc-700 focus:border-amber-500 rounded-lg px-3 py-2.5 text-white font-mono text-sm outline-none"
                  />
                </div>
              </div>

              {/* Target Weeks Presets */}
              <div>
                <label className="block text-xs text-zinc-300 mb-1.5 font-mono">
                  Campaign Duration: <strong className="text-amber-400">{formData.targetWeeks} Weeks</strong>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 8, 10, 12].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + w * 7);
                        setFormData({
                          ...formData,
                          targetWeeks: w,
                          targetDate: d.toISOString().split("T")[0],
                        });
                      }}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition min-h-[44px] flex items-center justify-center ${
                        formData.targetWeeks === w
                          ? "bg-amber-500 text-black shadow-md"
                          : "bg-zinc-900 border border-white/10 text-zinc-300"
                      }`}
                    >
                      {w} Weeks
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Scientific Metrics Bar */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 grid grid-cols-3 divide-x divide-white/10 text-center font-mono text-xs">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Target Velocity</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">-{weeklyLossLbs} lbs / wk</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Daily Deficit</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">-{dailyDeficit} kcal</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Target Date</div>
                  <div className="text-sm font-bold text-white mt-0.5">{formData.targetDate || "2026-12-15"}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: MASTER PLAN SUMMARY & 1-CLICK LAUNCH */}
          {step === 7 && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block">
                Sovereign Blueprint Ready &bull; Autonomous Schedule Generated
              </span>

              {/* Blueprint Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/40 text-xs font-mono space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/5">
                    <div className="text-[10px] text-zinc-400 uppercase">Scale Goal</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {formData.currentWeight} &rarr; {formData.targetWeight} lbs
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/5">
                    <div className="text-[10px] text-zinc-400 uppercase">Daily Calories</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">{dailyCalories} kcal</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/5">
                    <div className="text-[10px] text-zinc-400 uppercase">Daily Protein</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{dailyProtein}g</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/5">
                    <div className="text-[10px] text-zinc-400 uppercase">Fasting Mode</div>
                    <div className="text-sm font-bold text-white mt-0.5">{formData.fastingProtocol}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-1">
                  <div className="text-amber-400 font-bold">Autonomous Calendar Generation:</div>
                  <div className="text-zinc-300 text-[11px]">
                    &bull; <strong>{formData.trainingDaysPerWeek}x Weekly Workouts:</strong> {formData.trainingFocus} (Scheduled at 06:30 AM)
                  </div>
                  <div className="text-zinc-300 text-[11px]">
                    &bull; <strong>Daily Eating Window:</strong> {formData.fastingProtocol} Feast at 05:30 PM ({dailyProtein}g Protein Target)
                  </div>
                  <div className="text-zinc-300 text-[11px]">
                    &bull; <strong>Daily Stoic Anchors:</strong> {(formData.stoicHabits || []).join(", ")}
                  </div>
                </div>
              </div>

              {/* Master 1-Click Launch Button */}
              <button
                type="button"
                onClick={() => handleFinishOnboarding(false)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase font-mono tracking-widest transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 min-h-[52px]"
              >
                <span>⚡</span> CONQUER &amp; LAUNCH SOVEREIGN PLAN
              </button>
            </div>
          )}

        </div>

        {/* FOOTER CONTROLS */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition min-h-[44px] flex items-center ${
              step === 1
                ? "text-zinc-600 cursor-not-allowed"
                : "text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 hover:border-amber-500/30"
            }`}
          >
            &larr; Back
          </button>

          <div className="flex items-center gap-2">
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs uppercase font-mono tracking-wider transition shadow-md shadow-amber-950/40 min-h-[44px] flex items-center"
              >
                Next Step &rarr;
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFinishOnboarding(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-mono underline ml-2"
              >
                Launch with Interactive Tour
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
