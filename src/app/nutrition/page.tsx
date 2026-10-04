"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import { calculateDailyMacros, MealLogItem } from "@/lib/health";
import { calculateAdherenceStatus } from "@/lib/nutrition";

const FOUNDER_PRESET_MEALS: Omit<MealLogItem, "id" | "loggedAt">[] = [
  {
    name: "16oz Grass-Fed Ribeye + 4 Pasture Eggs",
    calories: 1150,
    protein: 105,
    carbs: 2,
    fat: 82,
    sodiumMg: 750,
  },
  {
    name: "Whey Isolate + Greek Yogurt Recovery Bowl",
    calories: 380,
    protein: 52,
    carbs: 18,
    fat: 6,
    sodiumMg: 180,
  },
  {
    name: "Lean Grass-Fed Beef Mince + Jasmine Rice",
    calories: 680,
    protein: 60,
    carbs: 75,
    fat: 14,
    sodiumMg: 520,
  },
  {
    name: "Electrolyte Hydration (Sodium + Potassium + Mg)",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sodiumMg: 1000,
  },
  {
    name: "Wild Sardines, Extra Virgin Olive Oil & Avocado",
    calories: 440,
    protein: 26,
    carbs: 5,
    fat: 36,
    sodiumMg: 460,
  },
];

export default function NutritionPage() {
  const { awardXp, playAnvilChime, playBellSound } = useStoic();

  // Targets
  const targetCalories = 1800;
  const targetProtein = 140;

  // Local-First Meal Ledger State
  const [meals, setMeals] = useState<MealLogItem[]>([
    {
      id: "meal-seed-1",
      name: "16oz Grass-Fed Ribeye + 4 Pasture Eggs",
      calories: 1150,
      protein: 105,
      carbs: 2,
      fat: 82,
      sodiumMg: 750,
      loggedAt: "05:45 PM",
    },
    {
      id: "meal-seed-2",
      name: "Whey Isolate + Greek Yogurt Recovery Bowl",
      calories: 380,
      protein: 52,
      carbs: 18,
      fat: 6,
      sodiumMg: 180,
      loggedAt: "06:15 PM",
    },
  ]);

  // Fasting Timer State (default 19h 45m into 23:1 OMAD)
  const [fastHours, setFastHours] = useState<number>(19);
  const [fastMinutes, setFastMinutes] = useState<number>(45);
  const [waterOz, setWaterOz] = useState<number>(72);
  const [electrolytesTaken, setElectrolytesTaken] = useState<boolean>(true);

  // New Meal Form Modal / Inputs
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newMealName, setNewMealName] = useState("");
  const [newCalories, setNewCalories] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [newCarbs, setNewCarbs] = useState("");
  const [newFat, setNewFat] = useState("");
  const [newSodium, setNewSodium] = useState("");

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stoic_nutrition_meals");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMeals(parsed);
          }
        } catch (e) {}
      }

      const savedWater = localStorage.getItem("stoic_water_oz");
      if (savedWater) setWaterOz(Number(savedWater));

      const savedFastH = localStorage.getItem("stoic_fast_hours");
      if (savedFastH) setFastHours(Number(savedFastH));
    }
  }, []);

  // Save meals to localStorage
  const saveMeals = (updated: MealLogItem[]) => {
    setMeals(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_nutrition_meals", JSON.stringify(updated));
    }
  };

  // Macro Calculations
  const macroTotals = calculateDailyMacros(meals);
  const adherence = calculateAdherenceStatus(
    macroTotals.totalProtein,
    targetProtein,
    macroTotals.totalCalories,
    targetCalories
  );

  // Add Custom Meal
  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;

    const item: MealLogItem = {
      id: `meal-${Date.now()}`,
      name: newMealName.trim(),
      calories: Math.max(0, parseInt(newCalories) || 0),
      protein: Math.max(0, parseInt(newProtein) || 0),
      carbs: Math.max(0, parseInt(newCarbs) || 0),
      fat: Math.max(0, parseInt(newFat) || 0),
      sodiumMg: Math.max(0, parseInt(newSodium) || 0),
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const next = [...meals, item];
    saveMeals(next);
    awardXp(150, `Logged Meal: ${item.name}`, "Discipline");
    playAnvilChime();

    // Reset Form
    setNewMealName("");
    setNewCalories("");
    setNewProtein("");
    setNewCarbs("");
    setNewFat("");
    setNewSodium("");
    setShowAddModal(false);
  };

  // Add Preset Meal
  const handleAddPreset = (preset: Omit<MealLogItem, "id" | "loggedAt">) => {
    const item: MealLogItem = {
      ...preset,
      id: `meal-${Date.now()}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const next = [...meals, item];
    saveMeals(next);
    awardXp(150, `Quick Preset Logged: ${item.name}`, "Discipline");
    playAnvilChime();
  };

  // Remove Meal
  const handleRemoveMeal = (id: string) => {
    const next = meals.filter((m) => m.id !== id);
    saveMeals(next);
  };

  // Clear Ledger
  const handleClearLedger = () => {
    if (confirm("Reset daily meal ledger for today?")) {
      saveMeals([]);
    }
  };

  // Log Hydration (+8oz)
  const addWater = (oz: number) => {
    const next = waterOz + oz;
    setWaterOz(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_water_oz", String(next));
    }
    awardXp(25, `Hydration Logged (+${oz}oz Water)`, "Recovery");
    playAnvilChime();
  };

  // Toggle Electrolytes
  const toggleElectrolytes = () => {
    setElectrolytesTaken((prev) => !prev);
    if (!electrolytesTaken) {
      awardXp(100, "Morning Electrolyte Protocol (1,000mg Sodium, 400mg K, 200mg Mg)", "Recovery");
      playBellSound();
    }
  };

  // Fasting Progress calculation (target 23h for OMAD)
  const totalFastMinutes = fastHours * 60 + fastMinutes;
  const targetFastMinutes = 23 * 60;
  const fastPercent = Math.min(100, Math.round((totalFastMinutes / targetFastMinutes) * 100));

  const dietMatrix = [
    { name: "OMAD (23:1)", timing: "23h Fast / 1h Feed", primary: "Fasting & Recomp", status: "Active Founder Archetype", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    { name: "Ketogenic", timing: "Flexible", primary: "<50g Net Carbs, High Fat", status: "Metabolic Alternative", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "Carnivore / Zero-Carb", timing: "1-2 Meals / Day", primary: "Ruminant Meat, Eggs, Butter", status: "Autoimmune & Elimination", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "Mediterranean", timing: "3 Meals / Day", primary: "Omega-3s, Olive Oil, Greens", status: "Cardiovascular Standard", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "PSMF (Protein-Sparing)", timing: "Flexible", primary: "Extreme Protein, Minimal Fat/Carb", status: "Aggressive Crash Recomp", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "Flexible IIFYM", timing: "Flexible", primary: "Calorie & Protein Priority", status: "MacroFactor Standard", badge: "bg-slate-800 text-slate-300 border-slate-700" },
  ];

  return (
    <div className="space-y-6">

      {/* 23:1 OMAD FASTING HERO DECK */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Intermittent Fasting &middot; 23:1 OMAD Protocol
            </span>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold bg-black/60 px-2.5 py-1 rounded border border-amber-500/30">
            Feeding Window: 05:30 PM &ndash; 06:30 PM (Daily)
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
          
          {/* Circular Countdown Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-900"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 transition-all duration-500"
                strokeDasharray={`${fastPercent}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center leading-none">
              <span className="text-lg font-bold text-amber-400 font-mono">
                {fastHours}h {fastMinutes}m
              </span>
              <span className="text-[10px] block text-white font-bold mt-1 tracking-wider uppercase">
                {fastHours >= 16 ? "AUTOPHAGY" : fastHours >= 12 ? "KETOSIS" : "GLYCOGEN"}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                {fastPercent}% of 23h Target
              </span>
            </div>
          </div>

          {/* Metabolic Stages Progression */}
          <div className="flex-1 w-full space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#121218] border border-red-950/60">
              <div>
                <span className="text-white font-bold block">0h &ndash; 12h: Glycogen Depletion</span>
                <span className="text-[11px] text-slate-300">Blood glucose stabilizes; insulin drops; liver glycogen cleared.</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-500/30">
                COMPLETED
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#121218] border border-red-950/60">
              <div>
                <span className="text-white font-bold block">12h &ndash; 16h: Ketosis Induction &amp; Lipolysis</span>
                <span className="text-[11px] text-slate-300">Adipose triglycerides mobilized into free fatty acids and ketone bodies.</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-500/30">
                COMPLETED
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#121218] border border-red-600/70 shadow-lg shadow-red-950/40">
              <div>
                <span className="text-amber-300 font-bold block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  16h &ndash; 23h: Deep Autophagy &amp; Peak Fat Oxidation
                </span>
                <span className="text-[11px] text-slate-200">
                  Cellular recycling, damaged organelle clearance, elevated growth hormone.
                </span>
              </div>
              <span className="text-red-400 font-bold font-mono px-2 py-0.5 bg-red-950/60 rounded border border-red-500/40">
                ACTIVE ({Math.max(0, 23 - fastHours)}h {Math.max(0, 60 - fastMinutes)}m LEFT)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#121218] border border-red-950/60">
              <div>
                <span className="text-white font-bold block">23h+: OMAD Feast &amp; Nutrient Repletion</span>
                <span className="text-[11px] text-slate-300">
                  1-hour anabolic feeding: 140g protein + whole food micronutrients.
                </span>
              </div>
              <span className="text-amber-400 font-bold font-mono px-2 py-0.5 bg-amber-950/40 rounded border border-amber-500/30">
                OPENS @ 05:30 PM
              </span>
            </div>
          </div>

        </div>

        {/* Quick Fasting Hours Adjuster */}
        <div className="mt-4 pt-3 border-t border-red-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold">Fast Duration:</span>
            <button
              onClick={() => {
                const next = Math.max(0, fastHours - 1);
                setFastHours(next);
                if (typeof window !== "undefined") localStorage.setItem("stoic_fast_hours", String(next));
              }}
              className="px-2 py-1 bg-black border border-red-950 rounded text-white font-bold hover:border-amber-500"
            >
              -1h
            </button>
            <span className="font-mono font-bold text-amber-400">{fastHours} Hours</span>
            <button
              onClick={() => {
                const next = Math.min(48, fastHours + 1);
                setFastHours(next);
                if (typeof window !== "undefined") localStorage.setItem("stoic_fast_hours", String(next));
              }}
              className="px-2 py-1 bg-black border border-red-950 rounded text-white font-bold hover:border-amber-500"
            >
              +1h
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold">Hydration:</span>
            <span className="font-mono font-bold text-blue-400">{waterOz} oz</span>
            <button
              onClick={() => addWater(8)}
              className="px-2.5 py-1 bg-blue-950/50 border border-blue-500/40 rounded text-blue-300 font-bold hover:bg-blue-900/50 transition"
            >
              +8 oz Water
            </button>
            <button
              onClick={toggleElectrolytes}
              className={`px-2.5 py-1 rounded font-bold transition border ${
                electrolytesTaken
                  ? "bg-amber-500 text-black border-amber-400 shadow"
                  : "bg-black border-red-950 text-slate-300 hover:text-white"
              }`}
            >
              {electrolytesTaken ? "✓ Electrolytes Taken" : "Take Electrolytes"}
            </button>
          </div>
        </div>
      </section>

      {/* MACRONUTRIENT PROGRESS & TOTALS */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Daily Macro Totals &amp; Calorie Balance
            </h3>
            <p className="text-xs text-slate-300">
              MacroFactor adherence-neutral philosophy: zero shame, purely empirical energy balance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-red-950/80 text-amber-300 px-3 py-1 rounded border border-amber-500/40">
              {macroTotals.totalCalories} / {targetCalories} kcal
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold uppercase tracking-wider shadow"
            >
              + Log Food
            </button>
          </div>
        </div>

        {/* Metric Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
          {/* Calories Card */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11px] font-bold uppercase text-amber-400">Total Energy</span>
              <span className="text-xs font-mono font-bold text-white">
                {Math.round((macroTotals.totalCalories / targetCalories) * 100)}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-2">
              {macroTotals.totalCalories} <span className="text-xs text-amber-400 font-bold">/ {targetCalories} kcal</span>
            </div>
            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-red-950">
              <div
                className={`h-full transition-all duration-500 ${
                  macroTotals.totalCalories > targetCalories ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (macroTotals.totalCalories / targetCalories) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {targetCalories - macroTotals.totalCalories >= 0
                ? `${targetCalories - macroTotals.totalCalories} kcal remaining in deficit`
                : `${macroTotals.totalCalories - targetCalories} kcal above target`}
            </span>
          </div>

          {/* Protein Card */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11px] font-bold uppercase text-emerald-400">Protein (Target: 140g)</span>
              <span className="text-xs font-mono font-bold text-white">
                {Math.round((macroTotals.totalProtein / targetProtein) * 100)}%
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-2">
              {macroTotals.totalProtein} <span className="text-xs text-emerald-400 font-bold">/ {targetProtein}g</span>
            </div>
            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-red-950">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (macroTotals.totalProtein / targetProtein) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {macroTotals.proteinMet(targetProtein)
                ? "✓ Lean Muscle Sparing Target Met"
                : `${targetProtein - macroTotals.totalProtein}g needed to protect lean tissue`}
            </span>
          </div>

          {/* Carbs Card */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11px] font-bold uppercase text-blue-400">Carbohydrates</span>
              <span className="text-xs font-mono text-slate-300 font-bold">{macroTotals.totalCarbs * 4} kcal</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-2">
              {macroTotals.totalCarbs} <span className="text-xs text-blue-400 font-bold">g</span>
            </div>
            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-red-950">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (macroTotals.totalCarbs / 150) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Timed post-training glycogen refuel</span>
          </div>

          {/* Fats Card */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11px] font-bold uppercase text-purple-400">Essential Fats</span>
              <span className="text-xs font-mono text-slate-300 font-bold">{macroTotals.totalFat * 9} kcal</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-2">
              {macroTotals.totalFat} <span className="text-xs text-purple-400 font-bold">g</span>
            </div>
            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-red-950">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (macroTotals.totalFat / 80) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Endocrine &amp; testosterone synthesis</span>
          </div>
        </div>

        {/* Adherence Feedback Card */}
        <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <span className="text-xs font-bold text-white block">Adherence-Neutral Feedback:</span>
            <span className="text-xs text-slate-200">{adherence.message}</span>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
            STATUS: {adherence.status}
          </span>
        </div>

        {/* 1-CLICK QUICK FOUNDER PRESETS */}
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
            1-Click Sovereign Founder Food Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {FOUNDER_PRESET_MEALS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleAddPreset(preset)}
                className="p-2.5 rounded-lg bg-[#121218] border border-red-950/80 hover:border-amber-500/60 hover:bg-neutral-900 text-left transition flex flex-col justify-between group"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                    + Log
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 mt-1.5 flex gap-2">
                  <span className="text-white font-bold">{preset.calories} kcal</span>
                  <span className="text-emerald-400">{preset.protein}g P</span>
                  <span className="text-blue-400">{preset.carbs}g C</span>
                  <span className="text-purple-400">{preset.fat}g F</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DAILY FOOD LEDGER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Today&apos;s Meal Ledger ({meals.length} Items)
            </span>
            {meals.length > 0 && (
              <button
                onClick={handleClearLedger}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold transition"
              >
                Clear Ledger
              </button>
            )}
          </div>

          {meals.length === 0 ? (
            <div className="p-6 rounded-lg bg-[#121218] border border-dashed border-red-950 text-center text-xs text-slate-400">
              No meals logged today yet. Click &ldquo;+ Log Food&rdquo; or tap any 1-Click Founder Preset above.
            </div>
          ) : (
            <div className="space-y-2">
              {meals.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.name}</span>
                      {item.loggedAt && (
                        <span className="text-[10px] font-mono text-slate-400">@{item.loggedAt}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] mt-1 text-slate-300">
                      <span className="text-amber-400 font-bold">{item.calories} kcal</span>
                      <span className="text-emerald-400 font-semibold">{item.protein}g P</span>
                      <span className="text-blue-400 font-semibold">{item.carbs}g C</span>
                      <span className="text-purple-400 font-semibold">{item.fat}g F</span>
                      {item.sodiumMg ? (
                        <span className="text-slate-400">{item.sodiumMg}mg Na</span>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMeal(item.id)}
                    className="text-slate-400 hover:text-red-400 font-bold px-2 py-1 transition"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL: ADD CUSTOM MEAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-red-950 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-red-950 pb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                Log Custom Food / Meal
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCustomMeal} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Meal / Food Description</label>
                <input
                  type="text"
                  placeholder="e.g. 12oz Bison Ribeye + Sweet Potato"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  required
                  className="w-full bg-black border border-red-950/80 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-amber-400 font-bold block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="e.g. 650"
                    value={newCalories}
                    onChange={(e) => setNewCalories(e.target.value)}
                    required
                    className="w-full bg-black border border-red-950/80 rounded px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 font-bold block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 55"
                    value={newProtein}
                    onChange={(e) => setNewProtein(e.target.value)}
                    required
                    className="w-full bg-black border border-red-950/80 rounded px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-blue-400 font-bold block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 40"
                    value={newCarbs}
                    onChange={(e) => setNewCarbs(e.target.value)}
                    className="w-full bg-black border border-red-950/80 rounded px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-purple-400 font-bold block mb-1">Fats (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={newFat}
                    onChange={(e) => setNewFat(e.target.value)}
                    className="w-full bg-black border border-red-950/80 rounded px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Sodium (mg) (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 600"
                  value={newSodium}
                  onChange={(e) => setNewSodium(e.target.value)}
                  className="w-full bg-black border border-red-950/80 rounded px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-red-950">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-neutral-900 text-slate-300 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow"
                >
                  Save to Daily Ledger (+150 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9-DIET EVIDENCE-BASED MATRIX */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
          Clinical Evidence Matrix &middot; Dietary Composition Archetypes
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          Decoupling meal timing (fasting) from dietary composition. Scientific comparisons based on peer-reviewed clinical research.
        </p>
        <div className="space-y-2">
          {dietMatrix.map((diet, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-white">{diet.name}</span>
                <span className="text-slate-300 ml-2">&bull; {diet.timing}</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">{diet.primary}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${diet.badge}`}>
                {diet.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
