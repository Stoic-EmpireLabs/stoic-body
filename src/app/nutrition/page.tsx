"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";
import { calculateMacroCalories, calculateAdherenceStatus } from "@/lib/nutrition";

export default function NutritionPage() {
  const { awardXp } = useStoic();

  // Food Log State
  const [proteinInput, setProteinInput] = useState(140);
  const [carbsInput, setCarbsInput] = useState(120);
  const [fatInput, setFatInput] = useState(55);
  const [waterOz, setWaterOz] = useState(72);
  const [electrolytesDone, setElectrolytesDone] = useState(true);
  const [loggedToday, setLoggedToday] = useState(false);

  const totalCalories = calculateMacroCalories(proteinInput, carbsInput, fatInput);
  const targetCalories = 1800;
  const targetProtein = 140;

  const adherence = calculateAdherenceStatus(
    proteinInput,
    targetProtein,
    totalCalories,
    targetCalories
  );

  const handleLogMeal = () => {
    awardXp(300, "23:1 OMAD Meal Logged", "Discipline");
    setLoggedToday(true);
  };

  const dietMatrix = [
    { name: "OMAD (23:1)", timing: "23h Fast / 1h Feed", primary: "Fasting & Recomp", status: "Active Founder Archetype", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    { name: "Ketogenic", timing: "Flexible", primary: "<50g Net Carbs, High Fat", status: "Metabolic Alternative", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "Mediterranean", timing: "3 Meals / Day", primary: "Omega-3s, Whole Grains", status: "Cardiovascular Gold Standard", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "PSMF (Protein-Sparing)", timing: "Flexible", primary: "Extreme Protein, Near Zero Fat/Carb", status: "Short-Term Aggressive Deficit", badge: "bg-slate-800 text-slate-300 border-slate-700" },
    { name: "Balanced Flexible (IIFYM)", timing: "Flexible", primary: "Calorie & Protein Priority", status: "MacroFactor Standard", badge: "bg-slate-800 text-slate-300 border-slate-700" },
  ];

  return (
    <div className="space-y-6">

      {/* 23:1 OMAD FASTING HERO DECK */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Intermittent Fasting &middot; 23:1 OMAD Protocol
            </span>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold">Feeding Window: 05:30 PM &ndash; 06:30 PM</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
          
          {/* Circular Countdown Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-neutral-900" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-amber-500 transition-all duration-500" strokeDasharray="85, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center leading-none">
              <span className="text-base font-bold text-amber-400 font-mono">19h 42m</span>
              <span className="text-[10px] block text-slate-300 mt-1 font-bold">AUTOPHAGY</span>
            </div>
          </div>

          {/* Metabolic Stages */}
          <div className="flex-1 space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#121218] border border-red-950/60">
              <span className="text-slate-200">12h &ndash; 16h: Ketosis Induction</span>
              <span className="text-amber-400 font-bold font-mono">COMPLETED</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#121218] border border-red-600/50">
              <span className="text-white font-semibold">16h &ndash; 23h: Deep Autophagy &amp; Lipolysis</span>
              <span className="text-red-400 font-bold font-mono">ACTIVE (3h 18m left)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#121218] border border-red-950/60">
              <span className="text-slate-300">23h+: OMAD Feeding &amp; Nutrient Replenishment</span>
              <span className="text-amber-300 font-mono font-semibold">QUEUED @ 05:30 PM</span>
            </div>
          </div>

        </div>
      </section>

      {/* MACRONUTRIENT & CALORIE LOGGING (ADHERENCE-NEUTRAL) */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              OMAD Single Meal Intake &amp; Macros
            </h3>
            <p className="text-xs text-slate-300">MacroFactor-inspired adherence-neutral feedback: zero shame, strictly objective telemetry.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40">
            {totalCalories} / {targetCalories} kcal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <label className="text-[11px] text-amber-400 font-bold uppercase block mb-1">
              Protein Target: 140g
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={proteinInput}
                onChange={(e) => setProteinInput(Number(e.target.value))}
                className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-300 font-mono font-bold">g</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">560 kcal (4 kcal/g)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <label className="text-[11px] text-blue-400 font-bold uppercase block mb-1">
              Carbohydrates
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={carbsInput}
                onChange={(e) => setCarbsInput(Number(e.target.value))}
                className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-300 font-mono font-bold">g</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">480 kcal (4 kcal/g)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <label className="text-[11px] text-purple-400 font-bold uppercase block mb-1">
              Fats
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fatInput}
                onChange={(e) => setFatInput(Number(e.target.value))}
                className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-slate-300 font-mono font-bold">g</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">495 kcal (9 kcal/g)</span>
          </div>
        </div>

        {/* Adherence Feedback Card */}
        <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-white block">Adherence-Neutral Status:</span>
            <span className="text-xs text-slate-300">{adherence.message}</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
            {adherence.status}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLogMeal}
            disabled={loggedToday}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              loggedToday
                ? "bg-red-700 text-white cursor-default"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow"
            }`}
          >
            {loggedToday ? "Meal Logged (+300 XP)" : "Save OMAD Meal Log (+300 XP)"}
          </button>
        </div>
      </section>

      {/* 9-DIET EVIDENCE-BASED MATRIX */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
          Clinical Evidence Matrix &middot; 9 Dietary Archetypes
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          Decoupling meal timing (fasting) from dietary composition. Scientific comparisons based on peer-reviewed clinical research.
        </p>
        <div className="space-y-2">
          {dietMatrix.map((diet, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">{diet.name}</span>
                <span className="text-slate-300 ml-2">&bull; {diet.timing}</span>
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
