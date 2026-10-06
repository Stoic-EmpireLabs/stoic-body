"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { WORKOUT_BLUEPRINTS, WorkoutBlueprint, ExerciseBlueprint } from "@/lib/workout-blueprints";
import { useStoic } from "@/context/StoicContext";
import { fireBrilliantConfetti } from "@/lib/confetti";
import { Dumbbell, Flame, CheckCircle2, ZoomIn, Sparkles, ChevronRight, Activity } from "lucide-react";

interface WorkoutBlueprintCardProps {
  initialSplit?: "push" | "pull" | "legs";
  onOpenAIStudio?: () => void;
  compact?: boolean;
}

export default function WorkoutBlueprintCard({
  initialSplit = "push",
  onOpenAIStudio,
  compact = false,
}: WorkoutBlueprintCardProps) {
  const { awardXp, playBellSound, playAnvilChime } = useStoic();
  const [activeSplit, setActiveSplit] = useState<"push" | "pull" | "legs">(initialSplit);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [showFullSheet, setShowFullSheet] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "logger" | "poster">("split");

  const blueprint: WorkoutBlueprint = WORKOUT_BLUEPRINTS[activeSplit] || WORKOUT_BLUEPRINTS.push;

  // Load set status from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`stoic_blueprint_sets_${activeSplit}`);
      if (saved) {
        try {
          setCompletedSets(JSON.parse(saved));
        } catch (e) {}
      } else {
        setCompletedSets({});
      }
    }
  }, [activeSplit]);

  const toggleSet = (exerciseId: string, setIndex: number) => {
    const key = `${exerciseId}-s${setIndex}`;
    const nextState = { ...completedSets, [key]: !completedSets[key] };
    setCompletedSets(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem(`stoic_blueprint_sets_${activeSplit}`, JSON.stringify(nextState));
    }
    if (!completedSets[key]) {
      awardXp(50, `Completed Set ${setIndex} of ${exerciseId}`, "Strength");
      playAnvilChime();
    }
  };

  const totalSetsRequired = blueprint.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const totalSetsDone = blueprint.exercises.reduce((acc, ex) => {
    let done = 0;
    for (let s = 1; s <= ex.sets; s++) {
      if (completedSets[`${ex.id}-s${s}`]) done++;
    }
    return acc + done;
  }, 0);

  const isCompleted = totalSetsDone >= totalSetsRequired && totalSetsRequired > 0;

  const handleClaimWorkout = () => {
    awardXp(750, `${blueprint.title} Conquered`, "Strength");
    playBellSound();
    fireBrilliantConfetti();
  };

  return (
    <div className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Header with Split Tabs, View Mode, & AI Studio Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-950/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-400" />
              {blueprint.title}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{blueprint.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Split Buttons */}
          <div className="flex bg-black/80 p-1 rounded-lg border border-red-950/80">
            {(["push", "pull", "legs"] as const).map((split) => (
              <button
                key={split}
                onClick={() => setActiveSplit(split)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition ${
                  activeSplit === split
                    ? "bg-red-700 text-white shadow-lg shadow-red-950/80 border border-red-500/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {split}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden sm:flex bg-black/80 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded transition ${
                viewMode === "split" ? "bg-amber-500 text-black font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("logger")}
              className={`px-2.5 py-1 rounded transition ${
                viewMode === "logger" ? "bg-amber-500 text-black font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Sets Only
            </button>
            <button
              onClick={() => setViewMode("poster")}
              className={`px-2.5 py-1 rounded transition ${
                viewMode === "poster" ? "bg-amber-500 text-black font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Poster Only
            </button>
          </div>

          {onOpenAIStudio && (
            <button
              onClick={onOpenAIStudio}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 text-amber-300 text-xs font-mono font-bold border border-amber-500/40 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Studio
            </button>
          )}
        </div>
      </div>

      {/* Progress & Set Status */}
      <div className="flex items-center justify-between bg-[#121218] p-3 rounded-xl border border-red-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 font-mono font-bold text-sm">
            {totalSetsDone}/{totalSetsRequired}
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase">Workout Volume Progress</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {Math.round((totalSetsDone / totalSetsRequired) * 100) || 0}% Total Sets Finished
            </div>
          </div>
        </div>

        <button
          onClick={handleClaimWorkout}
          disabled={!isCompleted}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition border ${
            isCompleted
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black border-amber-400/80 shadow-lg shadow-amber-500/20"
              : "bg-black/60 text-slate-500 border-white/5 cursor-not-allowed"
          }`}
        >
          {isCompleted ? "Conquer Routine (+750 XP)" : "Incomplete Sets"}
        </button>
      </div>

      {/* DUAL PANE / ADAPTIVE LAYOUT */}
      <div className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
        
        {/* LEFT PANE: HIGH-RESOLUTION ANATOMICAL BLUEPRINT POSTER (3:4 Ratio, Uncropped) */}
        {(viewMode === "split" || viewMode === "poster") && (
          <div className={`${viewMode === "split" ? "lg:col-span-5" : "w-full max-w-xl mx-auto"} space-y-2`}>
            <div
              className="relative rounded-xl overflow-hidden border border-red-950/80 bg-black cursor-pointer group shadow-2xl"
              onClick={() => setShowFullSheet(true)}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  key={blueprint.id}
                  src={blueprint.sheetIllustrationUrl}
                  alt={blueprint.title}
                  fill
                  priority
                  className="object-contain group-hover:scale-[1.02] transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-black/85 px-2.5 py-1 rounded border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5 shadow">
                    <Activity className="w-3.5 h-3.5 text-red-400" />
                    Anatomical Muscle Blueprint &middot; Click to Zoom
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/85 p-1.5 rounded border border-white/20 hover:border-amber-400 transition shadow">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
              <span>Crimson Zones = Active Primary Targets</span>
              <button onClick={() => setShowFullSheet(true)} className="text-amber-400 underline hover:text-amber-300">
                Inspect 4K Anatomy &rarr;
              </button>
            </div>
          </div>
        )}

        {/* RIGHT PANE: EXERCISES LIST & INTERACTIVE SET TRACKER */}
        {(viewMode === "split" || viewMode === "logger") && (
          <div className={`${viewMode === "split" ? "lg:col-span-7" : "w-full"} space-y-3`}>
        {blueprint.exercises.map((ex, idx) => {
          const allSetsDone = Array.from({ length: ex.sets }).every((_, i) => completedSets[`${ex.id}-s${i + 1}`]);

          return (
            <div
              key={ex.id}
              className={`p-4 rounded-xl border transition ${
                allSetsDone
                  ? "bg-red-950/20 border-red-500/40"
                  : "bg-[#121218] border-red-950/60 hover:border-amber-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">#{idx + 1}</span>
                    <h3 className="font-bold text-sm text-white tracking-wide">{ex.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-red-900/60 border border-red-500/40 text-[10px] font-mono font-bold text-red-200">
                      {ex.repsRange}
                    </span>
                  </div>

                  {/* Muscle Highlight Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {ex.targetMuscleGroups.map((muscle) => (
                      <span
                        key={muscle}
                        className="px-2 py-0.5 rounded-full bg-black/80 border border-red-500/30 text-[10px] font-mono font-semibold text-red-300"
                      >
                        {muscle}
                      </span>
                    ))}
                    {ex.notes && <span className="text-[11px] text-slate-400 ml-1 italic">&middot; {ex.notes}</span>}
                  </div>
                </div>

                {/* Set Pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {Array.from({ length: ex.sets }).map((_, sIdx) => {
                    const sNum = sIdx + 1;
                    const isDone = !!completedSets[`${ex.id}-s${sNum}`];
                    return (
                      <button
                        key={sNum}
                        onClick={() => toggleSet(ex.id, sNum)}
                        className={`w-10 h-10 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center border ${
                          isDone
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-md shadow-red-950"
                            : "bg-black border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/50"
                        }`}
                      >
                        {isDone ? `✓ S${sNum}` : `S${sNum}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

          {/* Cardio Finisher Card */}
          {blueprint.cardioFinisher && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-black border border-red-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-900/60 border border-red-500/40 flex items-center justify-center text-red-300">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                    Cardio Finisher &middot; {blueprint.cardioFinisher.durationMin} Minutes
                  </div>
                  <div className="text-sm font-bold text-white">{blueprint.cardioFinisher.name}</div>
                  <div className="text-xs text-slate-400">{blueprint.cardioFinisher.intensity}</div>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono font-bold text-slate-300">
                Zone 2 Aerobic
              </span>
            </div>
          )}
        </div>
      )}
    </div>

      {/* Zoom Modal for Full Sheet Blueprint */}
      {showFullSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullSheet(false)}
        >
          <div className="max-w-4xl w-full bg-[#0A0A0F] border border-amber-500/50 rounded-2xl overflow-hidden p-2 space-y-3">
            <div className="flex items-center justify-between p-3 border-b border-red-950/60">
              <h3 className="font-mono font-bold text-white text-sm uppercase">{blueprint.title} &middot; High-Resolution Anatomy Blueprint</h3>
              <button
                onClick={() => setShowFullSheet(false)}
                className="px-3 py-1 rounded bg-neutral-900 text-white font-mono text-xs hover:bg-neutral-800"
              >
                Close ✕
              </button>
            </div>
            <div className="relative aspect-[3/4] max-h-[80vh] w-full">
              <Image
                key={`modal-${blueprint.id}`}
                src={blueprint.sheetIllustrationUrl}
                alt={blueprint.title}
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
