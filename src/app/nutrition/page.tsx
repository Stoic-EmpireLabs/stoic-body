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
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Intermittent Fasting &middot; 23:1 OMAD Protocol
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Feeding Window: 05:30 PM &ndash; 06:30 PM</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
          
          {/* Circular Countdown Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500 transition-all duration-500" strokeDasharray="85, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center leading-none">
              <span className="text-base font-bold text-emerald-400 font-mono">19h 42m</span>
              <span className="text-[10px] block text-slate-400 mt-1">AUTOPHAGY</span>
            </div>
          </div>

          {/* Metabolic Stages */}
          <div className="flex-1 space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-[#1C1E2B] border border-[#232636]">
              <span className="text-slate-400">12h &ndash; 16h: Ketosis Induction</span>
              <span className="text-emerald-400 font-semibold font-mono">COMPLETED</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[#1C1E2B] border border-emerald-500/30">
              <span className="text-emerald-300 font-medium">16h &ndash; 23h: Deep Autophagy &amp; Lipolysis</span>
              <span className="text-emerald-400 font-semibold font-mono">ACTIVE (3h 18m left)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[#1C1E2B] border border-[#232636]">
              <span className="text-slate-500">23h+: OMAD Feeding &amp; Nutrient Replenishment</span>
              <span className="text-slate-400 font-mono">QUEUED @ 05:30 PM</span>
            </div>
          </div>

        </div>
      </section>

      {/* MACRONUTRIENT & CALORIE LOGGING (ADHERENCE-NEUTRAL) */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              OMAD Single Meal Intake &amp; Macros
            </h3>
            <p className="text-xs text-slate-400">MacroFactor-inspired adherence-neutral feedback: zero shame, strictly objective telemetry.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
            {totalCalories} / {targetCalories} kcal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <label className="text-[11px] text-amber-400 font-semibold uppercase block mb-1">
              Protein Target: 140g
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={proteinInput}
                onChange={(e) => setProteinInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400 font-mono">g</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">560 kcal (4 kcal/g)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <label className="text-[11px] text-blue-400 font-semibold uppercase block mb-1">
              Carbohydrates
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={carbsInput}
                onChange={(e) => setCarbsInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-400 font-mono">g</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">480 kcal (4 kcal/g)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <label className="text-[11px] text-purple-400 font-semibold uppercase block mb-1">
              Fats
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={fatInput}
                onChange={(e) => setFatInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100 focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-slate-400 font-mono">g</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">495 kcal (9 kcal/g)</span>
          </div>
        </div>

        {/* Adherence Feedback Card */}
        <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636] flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">Adherence-Neutral Status:</span>
            <span className="text-xs text-slate-400">{adherence.message}</span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
            {adherence.status}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLogMeal}
            disabled={loggedToday}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              loggedToday
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-amber-500 text-slate-900 hover:bg-amber-400"
            }`}
          >
            {loggedToday ? "Meal Logged (+300 XP)" : "Save OMAD Meal Log (+300 XP)"}
          </button>
        </div>
      </section>

      {/* 9-DIET EVIDENCE-BASED MATRIX */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-3">
          Clinical Evidence Matrix &middot; 9 Dietary Archetypes
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Decoupling meal timing (fasting) from dietary composition. Scientific comparisons based on peer-reviewed clinical research.
        </p>
        <div className="space-y-2">
          {dietMatrix.map((diet, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-[#1C1E2B] border border-[#232636] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-100">{diet.name}</span>
                <span className="text-slate-400 ml-2">&bull; {diet.timing}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${diet.badge}`}>
                {diet.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
