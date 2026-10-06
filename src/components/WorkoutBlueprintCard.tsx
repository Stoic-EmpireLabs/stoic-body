"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { WORKOUT_BLUEPRINTS, WorkoutBlueprint, ExerciseBlueprint } from "@/lib/workout-blueprints";
import { useStoic } from "@/context/StoicContext";
import { fireBrilliantConfetti } from "@/lib/confetti";
import {
  Dumbbell,
  Flame,
  CheckCircle2,
  ZoomIn,
  Sparkles,
  ChevronRight,
  Activity,
  Timer,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

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
  const { awardXp, playBellSound, playAnvilChime, playBoxingBell } = useStoic();
  const [activeSplit, setActiveSplit] = useState<"push" | "pull" | "legs">(initialSplit);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [showFullSheet, setShowFullSheet] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "logger" | "poster">("split");
  const [expandedCueId, setExpandedCueId] = useState<string | null>(null);

  // Tactical Rest Timer state
  const [restTimer, setRestTimer] = useState<{
    active: boolean;
    secondsRemaining: number;
    totalSeconds: number;
    exerciseName: string;
  }>({
    active: false,
    secondsRemaining: 0,
    totalSeconds: 90,
    exerciseName: "",
  });

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

  // Countdown interval for rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (restTimer.active && restTimer.secondsRemaining > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev.secondsRemaining <= 1) {
            playBoxingBell();
            return { ...prev, secondsRemaining: 0, active: false };
          }
          return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restTimer.active, restTimer.secondsRemaining, playBoxingBell]);

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

      // Auto-trigger tactical rest timer
      const currentEx = blueprint.exercises.find((e) => e.id === exerciseId);
      const rest = currentEx?.formCues?.restSecs || 90;
      setRestTimer({
        active: true,
        secondsRemaining: rest,
        totalSeconds: rest,
        exerciseName: currentEx?.name || exerciseId,
      });
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

                  {/* Form Cues Trigger */}
                  {ex.formCues && (
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedCueId(expandedCueId === ex.id ? null : ex.id)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 px-2 py-0.5 rounded transition"
                      >
                        <Info className="w-3 h-3 text-amber-400" />
                        <span>Tactical Form Cues</span>
                        {expandedCueId === ex.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
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

              {/* Expandable Form Cues & Biomechanics Drawer */}
              {expandedCueId === ex.id && ex.formCues && (
                <div className="mt-3 pt-3 border-t border-red-950/70 bg-black/60 p-3 rounded-lg space-y-2.5 text-xs font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-[#161620] p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Setup & Scapular Lockout
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{ex.formCues.setup}</p>
                    </div>

                    <div className="bg-[#161620] p-2.5 rounded border border-white/5 space-y-1">
                      <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        Cadence & Biomechanics
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{ex.formCues.execution}</p>
                    </div>
                  </div>

                  <div className="bg-red-950/30 p-2.5 rounded border border-red-500/30 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-red-400 font-bold uppercase block">Fatal Flaw to Avoid</span>
                      <p className="text-[11px] text-red-200 leading-relaxed">{ex.formCues.mistakeAvoid}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-amber-400" />
                      Recommended Rest: <strong className="text-white">{ex.formCues.restSecs}s</strong>
                    </span>
                    <button
                      onClick={() => {
                        setRestTimer({
                          active: true,
                          secondsRemaining: ex.formCues!.restSecs,
                          totalSeconds: ex.formCues!.restSecs,
                          exerciseName: ex.name,
                        });
                      }}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline"
                    >
                      Start {ex.formCues.restSecs}s Rest Interval &rarr;
                    </button>
                  </div>
                </div>
              )}
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

      {/* Tactical Floating Rest Timer HUD */}
      {restTimer.active && (
        <div className="fixed bottom-4 right-4 sm:right-8 z-50 bg-[#0A0A10]/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.9)] max-w-sm w-[90vw] backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-400" />
                Resting &bull; {restTimer.exerciseName}
              </span>
            </div>
            <button
              onClick={() => setRestTimer({ ...restTimer, active: false })}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              title="Dismiss Rest Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Countdown Display & Progress Bar */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-3xl font-mono font-black text-white tracking-wider">
              {Math.floor(restTimer.secondsRemaining / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(restTimer.secondsRemaining % 60).toString().padStart(2, "0")}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Target: {restTimer.totalSeconds}s
            </span>
          </div>

          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-amber-500/30 mb-3">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
              style={{
                width: `${Math.max(0, Math.min(100, (restTimer.secondsRemaining / restTimer.totalSeconds) * 100))}%`,
              }}
            />
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex items-center justify-between gap-1.5 font-mono text-xs">
            <button
              onClick={() =>
                setRestTimer((p) => ({
                  ...p,
                  secondsRemaining: Math.max(0, p.secondsRemaining - 15),
                }))
              }
              className="px-2.5 py-1 rounded bg-black/80 border border-white/10 hover:border-amber-400 text-slate-300 hover:text-white transition"
            >
              -15s
            </button>
            <button
              onClick={() =>
                setRestTimer((p) => ({
                  ...p,
                  secondsRemaining: p.secondsRemaining + 30,
                  totalSeconds: Math.max(p.totalSeconds, p.secondsRemaining + 30),
                }))
              }
              className="px-2.5 py-1 rounded bg-black/80 border border-white/10 hover:border-amber-400 text-slate-300 hover:text-white transition"
            >
              +30s
            </button>
            <button
              onClick={() =>
                setRestTimer((p) => ({
                  ...p,
                  secondsRemaining: p.secondsRemaining + 60,
                  totalSeconds: Math.max(p.totalSeconds, p.secondsRemaining + 60),
                }))
              }
              className="px-2.5 py-1 rounded bg-black/80 border border-white/10 hover:border-amber-400 text-slate-300 hover:text-white transition"
            >
              +60s
            </button>
            <button
              onClick={() => {
                playBoxingBell();
                setRestTimer({ ...restTimer, active: false, secondsRemaining: 0 });
              }}
              className="px-3 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold uppercase transition shadow-md shadow-amber-950"
            >
              Ready
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
