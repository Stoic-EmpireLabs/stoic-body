"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getNutritionNotebook, NotebookDietPlan, NotebookMeal } from "@/lib/nutrition-notebook";
import { useStoic } from "@/context/StoicContext";
import { fireBrilliantConfetti } from "@/lib/confetti";
import { BookOpen, Check, ZoomIn, Utensils, Sparkles, Scale } from "lucide-react";

interface FieldNotebookDietCardProps {
  goal?: string;
  targetCalories?: number;
  onOpenBiohacks?: () => void;
}

export default function FieldNotebookDietCard({
  goal = "Aggressive Cut",
  targetCalories = 1750,
  onOpenBiohacks,
}: FieldNotebookDietCardProps) {
  const { awardXp, playBellSound, playAnvilChime } = useStoic();
  const [dietPlan] = useState<NotebookDietPlan>(() => getNutritionNotebook(goal, targetCalories));
  const [loggedMeals, setLoggedMeals] = useState<Record<string, boolean>>({});
  const [showFullNotebook, setShowFullNotebook] = useState(false);

  const toggleMealLog = (meal: NotebookMeal) => {
    const isLogged = !!loggedMeals[meal.romanNumeral];
    const nextState = { ...loggedMeals, [meal.romanNumeral]: !isLogged };
    setLoggedMeals(nextState);

    if (!isLogged) {
      awardXp(150, `Logged Meal ${meal.romanNumeral}: ${meal.name}`, "Discipline");
      playAnvilChime();
    }
  };

  const allMealsLogged = dietPlan.meals.every((m) => loggedMeals[m.romanNumeral]);

  const handleClaimFullDay = () => {
    awardXp(500, "100% Tactical Nutrition Blueprint Adhered", "Discipline");
    playBellSound();
    fireBrilliantConfetti();
  };

  return (
    <div className="bg-[#0A0A0F] border border-amber-900/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-950/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-lg font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Tactical Field-Notebook Nutrition
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Lined Journal Blueprint &middot; Roman Numeral Feeding Protocol &middot; Precision Grams
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBiohacks && (
            <button
              onClick={onOpenBiohacks}
              className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs font-mono font-bold border border-red-500/40 flex items-center gap-1.5 transition"
            >
              <span>🌿</span> Stoic Apothecary
            </button>
          )}
          <button
            onClick={() => setShowFullNotebook(true)}
            className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-neutral-900 text-amber-300 text-xs font-mono font-bold border border-amber-500/40 flex items-center gap-1.5 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            Zoom Journal
          </button>
        </div>
      </div>

      {/* Main Grid: Left Notebook Content | Right Boxed Macro Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Roman Numeral Meal Entries */}
        <div className="lg:col-span-8 space-y-3 font-sans">
          {dietPlan.meals.map((meal) => {
            const isDone = !!loggedMeals[meal.romanNumeral];

            return (
              <div
                key={meal.romanNumeral}
                className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-[#121218] border-amber-950/50 hover:border-amber-500/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-amber-400 min-w-[28px]">
                      {meal.romanNumeral}
                    </span>
                    <h3 className="font-bold text-sm text-white tracking-wide">{meal.name}</h3>
                    {meal.timing && (
                      <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-400">
                        {meal.timing}
                      </span>
                    )}
                  </div>

                  <div className="pl-9 space-y-0.5">
                    {meal.items.map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400/70" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 pt-2 sm:pt-0 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">
                      ~{meal.approxCalories} kcal
                    </span>
                    <span className="text-[10px] font-mono text-amber-300">
                      {meal.approxProteinG}g Protein
                    </span>
                  </div>

                  <button
                    onClick={() => toggleMealLog(meal)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
                      isDone
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-400 shadow"
                        : "bg-black border-amber-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Logged
                      </>
                    ) : (
                      "Log Meal"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Boxed Macro Summary Card & Journal Preview */}
        <div className="lg:col-span-4 space-y-4">
          {/* Hand-Drawn Boxed Macro Card */}
          <div className="bg-[#121218] border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold rounded-bl-xl border-l border-b border-amber-500/30">
              BOXED TOTALS
            </div>

            <h3 className="font-mono font-black text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Daily Caloric Targets
            </h3>

            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-amber-950/60 pb-2">
                <span className="text-xs text-slate-400">Total Calories:</span>
                <span className="text-base font-bold text-amber-300">
                  {dietPlan.macros.calories} kcal
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-950/60 pb-2">
                <span className="text-xs text-slate-400">Protein Target:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {dietPlan.macros.protein}g
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-950/60 pb-2">
                <span className="text-xs text-slate-400">Carbohydrates:</span>
                <span className="text-sm font-bold text-blue-400">
                  {dietPlan.macros.carbs}g
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-amber-950/60 pb-2">
                <span className="text-xs text-slate-400">Dietary Fats:</span>
                <span className="text-sm font-bold text-amber-400">
                  {dietPlan.macros.fats}g
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Dietary Fiber:</span>
                <span className="text-sm font-bold text-purple-400">
                  {dietPlan.macros.fiber}g+
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-amber-950/60">
              <button
                onClick={handleClaimFullDay}
                disabled={!allMealsLogged}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition border ${
                  allMealsLogged
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer"
                    : "bg-black/60 text-slate-500 border-white/5 cursor-not-allowed"
                }`}
              >
                {allMealsLogged ? "Conquer Nutrition (+500 XP)" : "Log All Meals to Claim"}
              </button>
            </div>
          </div>

          {/* Lined Notebook Thumbnail */}
          <div
            onClick={() => setShowFullNotebook(true)}
            className="relative rounded-2xl overflow-hidden border border-amber-900/40 cursor-pointer group aspect-[4/5] bg-neutral-900"
          >
            <Image
              src={dietPlan.notebookImageUrl}
              alt="Stoic Sovereign Cutting Diet Journal"
              fill
              className="object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-amber-300 bg-black/80 px-2 py-1 rounded border border-amber-500/30 backdrop-blur-md">
                Field Journal Sheet &middot; Click to Zoom
              </span>
              <span className="p-1 rounded bg-black/80 text-white border border-white/10">
                <ZoomIn className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal for Full Journal Sheet */}
      {showFullNotebook && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullNotebook(false)}
        >
          <div className="max-w-3xl w-full bg-[#0A0A0F] border border-amber-500/50 rounded-2xl overflow-hidden p-2 space-y-3">
            <div className="flex items-center justify-between p-3 border-b border-amber-950/60">
              <h3 className="font-mono font-bold text-white text-sm uppercase">
                Stoic Sovereign Field-Notebook Diet &middot; High-Resolution Journal
              </h3>
              <button
                onClick={() => setShowFullNotebook(false)}
                className="px-3 py-1 rounded bg-neutral-900 text-white font-mono text-xs hover:bg-neutral-800"
              >
                Close ✕
              </button>
            </div>
            <div className="relative aspect-[3/4] max-h-[80vh] w-full">
              <Image
                src={dietPlan.notebookImageUrl}
                alt="Stoic Sovereign Cutting Diet Journal"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
