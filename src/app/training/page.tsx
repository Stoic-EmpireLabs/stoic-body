"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useStoic } from "@/context/StoicContext";
import { generateBoxingCombos, BoxingCombo } from "@/lib/health";
import WorkoutBlueprintCard from "@/components/WorkoutBlueprintCard";
import BodyMap from "@/components/BodyMap";
import LiveSessionModal from "@/components/LiveSessionModal";
import { getExercisesForMuscles, ExerciseItem, ALL_EXERCISES } from "@/lib/exercise-catalog";

interface IntervalPreset {
  id: string;
  name: string;
  workSeconds: number;
  restSeconds: number;
  totalRounds: number;
}

const PRESETS: IntervalPreset[] = [
  {
    id: "championship",
    name: "3m / 1m Championship (6 Rounds)",
    workSeconds: 180,
    restSeconds: 60,
    totalRounds: 6,
  },
  {
    id: "sprint",
    name: "2m / 30s High-Velocity Sprint (8 Rounds)",
    workSeconds: 120,
    restSeconds: 30,
    totalRounds: 8,
  },
  {
    id: "heavybag",
    name: "5m / 1m Heavy Bag Endurance (4 Rounds)",
    workSeconds: 300,
    restSeconds: 60,
    totalRounds: 4,
  },
];

export default function TrainingStudio() {
  const { awardXp, playAnvilChime, playBellSound, playBoxingBell } = useStoic();

  // Primary Mode Navigation: "bodymap" | "blueprints" | "boxing"
  const [activeTab, setActiveTab] = useState<"bodymap" | "blueprints" | "boxing">("bodymap");

  // Open-GYM Anatomical Body Map Selection
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(["chest", "triceps"]);
  const [isLiveSessionOpen, setIsLiveSessionOpen] = useState(false);
  const [selectedSessionExercises, setSelectedSessionExercises] = useState<ExerciseItem[]>([]);

  // Filtered exercises based on selected muscles
  const targetedExercises = useMemo(() => {
    return getExercisesForMuscles(selectedMuscles);
  }, [selectedMuscles]);

  const toggleMuscle = (muscleId: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscleId) ? prev.filter((m) => m !== muscleId) : [...prev, muscleId]
    );
  };

  // Launch live tracker with selected exercises
  const handleLaunchTargetedSession = () => {
    const picks = targetedExercises.slice(0, 4);
    setSelectedSessionExercises(picks.length > 0 ? picks : ALL_EXERCISES.slice(0, 4));
    setIsLiveSessionOpen(true);
  };

  // Preset Selection for Boxing
  const [selectedPreset, setSelectedPreset] = useState<IntervalPreset>(PRESETS[0]);
  const [timerSeconds, setTimerSeconds] = useState(PRESETS[0].workSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Boxing Combos
  const combos: BoxingCombo[] = generateBoxingCombos(5);
  const [comboIndex, setComboIndex] = useState(0);

  // Calisthenics Set Tracking State
  const [setsState, setSetsState] = useState<Record<string, boolean>>({});
  const [routineCompleted, setRoutineCompleted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSets = localStorage.getItem("stoic_training_sets");
      if (savedSets) {
        try {
          setSetsState(JSON.parse(savedSets));
        } catch {}
      }
      const savedCompleted = localStorage.getItem("stoic_calisthenics_completed");
      if (savedCompleted) {
        setRoutineCompleted(savedCompleted === "true");
      }
    }
  }, []);

  // Interval Countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            playBoxingBell();
            if (!isRest) {
              setIsRest(true);
              return selectedPreset.restSeconds;
            } else {
              if (currentRound >= selectedPreset.totalRounds) {
                setIsRunning(false);
                setIsRest(false);
                awardXp(500, `Boxing Session Completed: ${selectedPreset.name}`, "Strength");
                playBellSound();
                return selectedPreset.workSeconds;
              }
              setIsRest(false);
              setCurrentRound((r) => r + 1);
              setComboIndex((c) => (c + 1) % combos.length);
              return selectedPreset.workSeconds;
            }
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isRest, currentRound, selectedPreset, playBoxingBell, playBellSound, awardXp, combos.length]);

  const handleSelectPreset = (preset: IntervalPreset) => {
    setIsRunning(false);
    setSelectedPreset(preset);
    setIsRest(false);
    setCurrentRound(1);
    setTimerSeconds(preset.workSeconds);
  };

  const handleStartTimer = () => {
    if (!isRunning) {
      playBoxingBell();
      setIsRunning(true);
    }
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsRest(false);
    setCurrentRound(1);
    setTimerSeconds(selectedPreset.workSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Calisthenics Set Toggle
  const toggleSet = (exerciseKey: string, setIndex: number) => {
    playAnvilChime();
    const key = `${exerciseKey}-${setIndex}`;
    setSetsState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_training_sets", JSON.stringify(next));
      }
      return next;
    });
  };

  const completeCalisthenics = () => {
    if (routineCompleted) return;
    awardXp(750, "Full Calisthenics Core & High-Rep Routine", "Strength");
    playBellSound();
    setRoutineCompleted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_calisthenics_completed", "true");
    }
  };

  const completedSetsCount = Object.values(setsState).filter(Boolean).length;
  const currentCombo = combos[comboIndex] || combos[0];

  return (
    <div className="space-y-6 pb-24">
      {/* PRIMARY STUDIO SWITCHER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/80 p-2 sm:p-3 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl ring-1 ring-amber-500/10">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("bodymap")}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "bodymap"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🎯</span> ANATOMICAL BODY MAP
          </button>
          <button
            onClick={() => setActiveTab("blueprints")}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "blueprints"
                ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/50"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🛡️</span> TACTICAL BLUEPRINTS (PPL)
          </button>
          <button
            onClick={() => setActiveTab("boxing")}
            className={`px-3.5 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "boxing"
                ? "bg-gradient-to-r from-red-700 to-red-900 text-white shadow-lg shadow-red-950/50"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🥊</span> COMBAT STUDIO & CALISTHENICS
          </button>
        </div>

        {activeTab === "bodymap" && (
          <button
            onClick={handleLaunchTargetedSession}
            className="px-4 py-2 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>⚡</span> START LIVE TRACKER ({targetedExercises.length})
          </button>
        )}
      </div>

      {/* TAB 1: OPEN-GYM ANATOMICAL BODY MAP ENGINE */}
      {activeTab === "bodymap" && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="text-center max-w-lg mx-auto mb-6">
              <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase">
                STEP 1 · TAP MUSCLES TO TARGET
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                INTERACTIVE ANATOMICAL BODY MAP
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Reverse-engineered from Open-GYM. Select any muscle group on the front or back silhouette to load exercises and launch a live set-by-set tracker.
              </p>
            </div>

            {/* Interactive Anatomical SVG Map */}
            <BodyMap
              selectedMuscles={selectedMuscles}
              onToggleMuscle={toggleMuscle}
              className="my-2"
            />
          </div>

          {/* STEP 2: MATCHING MOVEMENTS CAROUSEL / LIST */}
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase">
                  STEP 2 · TARGETED MOVEMENTS ({targetedExercises.length})
                </span>
                <h3 className="text-lg font-bold text-white">
                  TACTICAL EXERCISES FOR SELECTED MUSCLES
                </h3>
              </div>
              <button
                onClick={handleLaunchTargetedSession}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
              >
                LOG LIVE SESSION ▶
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {targetedExercises.slice(0, 9).map((ex) => (
                <div
                  key={ex.id}
                  className="bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 hover:border-amber-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {ex.primary}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{ex.equipment}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{ex.name}</h4>
                    {ex.secondary.length > 0 && (
                      <p className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
                        + {ex.secondary.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{ex.difficulty}</span>
                    <button
                      onClick={() => {
                        setSelectedSessionExercises([ex]);
                        setIsLiveSessionOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 transition-all"
                    >
                      LOG SETS ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TACTICAL PUSH / PULL / LEGS BLUEPRINTS */}
      {activeTab === "blueprints" && (
        <div className="space-y-6">
          <WorkoutBlueprintCard initialSplit="push" />
        </div>
      )}

      {/* TAB 3: MARINE COMBAT BOXING & CALISTHENICS */}
      {activeTab === "boxing" && (
        <div className="space-y-6">
          {/* BOXING ROUND TIMER HERO */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-red-500 block">
                  Home Boxing Round Timer · Interval Studio
                </h2>
                <span className="text-xs text-slate-300">
                  Championship pacing · Heavy bag &amp; shadowboxing cadence.
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-red-950/80 text-amber-300 border border-amber-500/40">
                ROUND {currentRound} OF {selectedPreset.totalRounds}
              </span>
            </div>

            {/* Preset Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    selectedPreset.id === p.id
                      ? "bg-red-900/60 border-red-500 text-white shadow"
                      : "bg-black/60 border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Big Digital Display */}
            <div className="my-5 text-center">
              <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-white">
                {formatTime(timerSeconds)}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-widest mt-2 ${
                  isRest ? "text-amber-400" : "text-red-400"
                }`}
              >
                {isRest
                  ? `REST & BREATHE INTERVAL (${selectedPreset.restSeconds} SEC)`
                  : "FIGHT · HIGH INTENSITY STRIKING & FOOTWORK"}
              </div>
            </div>

            {/* Timer Control Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              <button
                onClick={handleStartTimer}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm transition shadow-xl shadow-red-950/50 border border-red-500/30 tracking-wider uppercase"
              >
                START ROUND
              </button>
              <button
                onClick={handlePauseTimer}
                className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm transition border border-red-950/80"
              >
                PAUSE
              </button>
              <button
                onClick={handleResetTimer}
                className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-300 hover:text-white font-bold text-sm transition border border-red-950/80"
              >
                RESET
              </button>
            </div>

            {/* ACTIVE COMBINATION DRILL CALLOUT */}
            <div className="p-4 rounded-lg bg-[#121218] border border-red-950/70 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Active Round Drill Callout · Combination #{comboIndex + 1}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setComboIndex((c) => (c - 1 + combos.length) % combos.length)
                    }
                    aria-label="Previous Combination Drill"
                    className="px-3 py-2 min-h-[44px] rounded-lg bg-black/80 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-mono transition hover:border-amber-500/40"
                  >
                    &larr; Prev
                  </button>
                  <button
                    onClick={() => setComboIndex((c) => (c + 1) % combos.length)}
                    aria-label="Next Combination Drill"
                    className="px-3 py-2 min-h-[44px] rounded-lg bg-black/80 border border-white/10 text-slate-300 hover:text-white text-xs font-bold font-mono transition hover:border-amber-500/40"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-base font-bold font-mono text-white block">
                    {currentCombo.callout}
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">{currentCombo.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {currentCombo.comboSequence.map((strike, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded bg-black/80 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300"
                    >
                      {strike}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* NO-DUMBBELL CALISTHENICS WORKOUT DECK */}
          <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Home Calisthenics &amp; High-Rep Suite
                </h3>
                <p className="text-xs text-slate-300">
                  Zero Dumbbell Constraint · Strict Form · {completedSetsCount} Sets Completed
                </p>
              </div>
              <button
                onClick={completeCalisthenics}
                disabled={routineCompleted}
                className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded border transition ${
                  routineCompleted
                    ? "bg-red-700 text-white border-red-500 cursor-default"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black border-amber-400/50 shadow"
                }`}
              >
                {routineCompleted ? "✓ Routine Conquered (+750 XP)" : "Claim Routine (+750 XP)"}
              </button>
            </div>

            <div className="space-y-3">
              {/* Exercise 1 */}
              <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Strict Overhand Pull-Ups</h3>
                  <p className="text-xs text-slate-300">Target: 3 Sets &times; Max Reps (RPE 9 · Latissimus Hypertrophy)</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => {
                    const isDone = !!setsState[`pullups-${s}`];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSet("pullups", s)}
                        aria-label={`Toggle Set ${s} for Strict Overhand Pull-Ups`}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                          isDone
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow"
                            : "bg-black border border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                        }`}
                      >
                        S{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercise 2 */}
              <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Parallel Bar Dips</h3>
                  <p className="text-xs text-slate-300">Target: 3 Sets &times; 15 Reps (Lower Chest &amp; Triceps Extension)</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => {
                    const isDone = !!setsState[`dips-${s}`];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSet("dips", s)}
                        aria-label={`Toggle Set ${s} for Parallel Bar Dips`}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                          isDone
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow"
                            : "bg-black border border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                        }`}
                      >
                        S{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercise 3 */}
              <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Diamond Push-Up Burnout</h3>
                  <p className="text-xs text-slate-300">Target: 3 Sets &times; 20 Reps (Inward Chest Cleavage &amp; Triceps)</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => {
                    const isDone = !!setsState[`pushups-${s}`];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSet("pushups", s)}
                        aria-label={`Toggle Set ${s} for Diamond Push-Up Burnout`}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                          isDone
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow"
                            : "bg-black border border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                        }`}
                      >
                        S{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercise 4 */}
              <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Hanging Leg Raises &amp; Hollow Holds</h3>
                  <p className="text-xs text-slate-300">Target: 3 Sets &times; 12 Reps (Compressed Core for Visible Abs)</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => {
                    const isDone = !!setsState[`core-${s}`];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSet("core", s)}
                        aria-label={`Toggle Set ${s} for Hanging Leg Raises & Hollow Holds`}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                          isDone
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow"
                            : "bg-black border border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                        }`}
                      >
                        S{s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercise 5 */}
              <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Inverted Australian Rows</h3>
                  <p className="text-xs text-slate-300">Target: 3 Sets &times; 12 Reps (Mid-Trap &amp; Rhomboid Rhomboids)</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => {
                    const isDone = !!setsState[`rows-${s}`];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSet("rows", s)}
                        aria-label={`Toggle Set ${s} for Inverted Australian Rows`}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                          isDone
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow"
                            : "bg-black border border-red-950/80 text-slate-300 hover:text-white hover:border-amber-500/40"
                        }`}
                      >
                        S{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Live Session Modal */}
      <LiveSessionModal
        isOpen={isLiveSessionOpen}
        onClose={() => setIsLiveSessionOpen(false)}
        initialExercises={selectedSessionExercises}
        sessionTitle="Open-GYM Live Tactical Tracker"
      />
    </div>
  );
}
