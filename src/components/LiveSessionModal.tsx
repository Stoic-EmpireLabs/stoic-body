"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStoic } from "@/context/StoicContext";
import { ExerciseItem } from "@/lib/exercise-catalog";
import { fireBrilliantConfetti } from "@/lib/confetti";

export type SetKind = "working" | "warmup" | "drop" | "failure";

export interface LoggedSet {
  id: string;
  kind: SetKind;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface SessionExerciseState {
  exercise: ExerciseItem;
  sets: LoggedSet[];
}

export interface LiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExercises: ExerciseItem[];
  sessionTitle?: string;
}

export default function LiveSessionModal({
  isOpen,
  onClose,
  initialExercises,
  sessionTitle = "Tactical Training Session",
}: LiveSessionModalProps) {
  const { awardXp } = useStoic();

  // Session clock
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Exercise navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseState[]>([]);

  // Rest timer
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState<number>(90);
  const [isResting, setIsResting] = useState(false);

  // Completion state
  const [isFinished, setIsFinished] = useState(false);
  const [finishStats, setFinishStats] = useState<{ volume: number; setsCount: number; duration: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize exercises on open
  useEffect(() => {
    if (isOpen) {
      const initial = (initialExercises.length > 0
        ? initialExercises
        : [
            {
              id: "EIeI8Vf",
              name: "Barbell Bench Press",
              primary: "chest",
              secondary: ["triceps", "shoulders"],
              equipment: "Barbell",
              difficulty: "Intermediate",
              steps: ["Lie flat on bench, feet planted, grip bar slightly wider than shoulder-width, lower to mid-chest, press up."],
            },
          ]
      ).map((ex) => ({
        exercise: ex,
        sets: [
          { id: "s1", kind: "warmup" as SetKind, weight: 135, reps: 10, completed: false },
          { id: "s2", kind: "working" as SetKind, weight: 185, reps: 8, completed: false },
          { id: "s3", kind: "working" as SetKind, weight: 185, reps: 8, completed: false },
          { id: "s4", kind: "working" as SetKind, weight: 185, reps: 8, completed: false },
        ],
      }));

      setSessionExercises(initial);
      setCurrentIndex(0);
      setElapsedSeconds(0);
      setIsActive(true);
      setIsFinished(false);
      setIsResting(false);
      setRestSeconds(null);
    }
  }, [isOpen, initialExercises]);

  // Main session stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished]);

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restSeconds !== null && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsResting(false);
            playRestChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds]);

  // Audio chime for rest timer
  const playRestChime = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/rest_over.wav");
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Fallback Web Audio API beep
        playSynthesizedBeep();
      });
    } catch {
      playSynthesizedBeep();
    }
  };

  const playSynthesizedBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not permitted without user gesture
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const currentExerciseState = sessionExercises[currentIndex];
  if (!currentExerciseState) return null;

  // Toggle set completion & auto-start rest timer
  const handleToggleSet = (setIdx: number) => {
    setSessionExercises((prev) => {
      const next = [...prev];
      const exState = { ...next[currentIndex] };
      const sets = [...exState.sets];
      const target = { ...sets[setIdx] };

      target.completed = !target.completed;
      sets[setIdx] = target;
      exState.sets = sets;
      next[currentIndex] = exState;

      // If set was just completed, trigger rest timer & small XP
      if (target.completed) {
        awardXp(50, `Set Completed: ${exState.exercise.name}`, "Strength");
        setRestSeconds(restTotal);
        setIsResting(true);
      }

      return next;
    });
  };

  const handleUpdateSet = (setIdx: number, field: "weight" | "reps" | "kind", val: number | SetKind) => {
    setSessionExercises((prev) => {
      const next = [...prev];
      const exState = { ...next[currentIndex] };
      const sets = [...exState.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      exState.sets = sets;
      next[currentIndex] = exState;
      return next;
    });
  };

  const handleAddSet = () => {
    setSessionExercises((prev) => {
      const next = [...prev];
      const exState = { ...next[currentIndex] };
      const lastSet = exState.sets[exState.sets.length - 1];
      const newSet: LoggedSet = {
        id: `s_${Date.now()}`,
        kind: "working",
        weight: lastSet ? lastSet.weight : 135,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      };
      exState.sets = [...exState.sets, newSet];
      next[currentIndex] = exState;
      return next;
    });
  };

  const handleFinishWorkout = () => {
    let totalVol = 0;
    let completedSets = 0;

    sessionExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVol += s.weight * s.reps;
          completedSets++;
        }
      });
    });

    setFinishStats({
      volume: totalVol,
      setsCount: completedSets,
      duration: formatTime(elapsedSeconds),
    });

    awardXp(750, `Tactical Session Conquered: ${sessionTitle}`, "Strength");
    setIsFinished(true);
    setIsActive(false);
    fireBrilliantConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-amber-500/20 my-auto">
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
                {sessionTitle}
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                TIME: <span className="text-amber-400 font-bold">{formatTime(elapsedSeconds)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <button
                onClick={handleFinishWorkout}
                className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/50 hover:brightness-110 active:scale-95 transition-all"
              >
                FINISH LOG
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Workout Body */}
        {!isFinished ? (
          <div className="p-5 space-y-6">
            {/* Exercise Selector Strip */}
            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-2xl border border-white/5">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-800 disabled:opacity-30 text-zinc-300 hover:text-white"
              >
                ◀ PREV
              </button>

              <div className="text-center px-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-500/80 uppercase">
                  EXERCISE {currentIndex + 1} OF {sessionExercises.length}
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-[260px] sm:max-w-xs">
                  {currentExerciseState.exercise.name}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Primary: <span className="text-amber-400 uppercase font-semibold">{currentExerciseState.exercise.primary}</span>
                </span>
              </div>

              <button
                onClick={() => setCurrentIndex((prev) => Math.min(sessionExercises.length - 1, prev + 1))}
                disabled={currentIndex === sessionExercises.length - 1}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-800 disabled:opacity-30 text-zinc-300 hover:text-white"
              >
                NEXT ▶
              </button>
            </div>

            {/* Set Tracking Table */}
            <div className="bg-zinc-900/40 rounded-2xl border border-white/5 p-4">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase px-2 mb-2">
                <span className="col-span-2">SET</span>
                <span className="col-span-4 text-center">LBS</span>
                <span className="col-span-4 text-center">REPS</span>
                <span className="col-span-2 text-right">DONE</span>
              </div>

              <div className="space-y-2">
                {currentExerciseState.sets.map((set, sIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl border transition-all ${
                      set.completed
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                        : "bg-zinc-900/80 border-white/5 text-zinc-200"
                    }`}
                  >
                    {/* Set Kind Pill */}
                    <div className="col-span-2 flex items-center gap-1">
                      <span className="font-mono text-xs font-bold">{sIdx + 1}</span>
                      <select
                        value={set.kind}
                        onChange={(e) => handleUpdateSet(sIdx, "kind", e.target.value as SetKind)}
                        className="bg-zinc-800 text-[10px] font-mono text-zinc-300 rounded px-1 py-0.5 border border-white/10 outline-none"
                      >
                        <option value="working">W</option>
                        <option value="warmup">Warm</option>
                        <option value="drop">Drop</option>
                        <option value="failure">Fail</option>
                      </select>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdateSet(sIdx, "weight", Math.max(0, set.weight - 5))}
                        className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleUpdateSet(sIdx, "weight", Number(e.target.value))}
                        className="w-16 bg-black/60 border border-white/10 rounded-lg text-center font-mono font-bold text-xs py-1 text-white"
                      />
                      <button
                        onClick={() => handleUpdateSet(sIdx, "weight", set.weight + 5)}
                        className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdateSet(sIdx, "reps", Math.max(0, set.reps - 1))}
                        className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSet(sIdx, "reps", Number(e.target.value))}
                        className="w-12 bg-black/60 border border-white/10 rounded-lg text-center font-mono font-bold text-xs py-1 text-white"
                      />
                      <button
                        onClick={() => handleUpdateSet(sIdx, "reps", set.reps + 1)}
                        className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Completion Checkmark */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleToggleSet(sIdx)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                          set.completed
                            ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/40 scale-105"
                            : "bg-zinc-800 text-zinc-500 hover:text-white border border-white/10"
                        }`}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={handleAddSet}
                className="w-full mt-3 py-2 text-xs font-mono font-semibold rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-dashed border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1.5"
              >
                <span>+</span> ADD SET
              </button>
            </div>

            {/* Floating Tactical Rest Timer Ring */}
            {isResting && restSeconds !== null && (
              <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between animate-fade-in shadow-xl shadow-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-800"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-amber-400 transition-all duration-1000 ease-linear"
                        strokeDasharray={`${(restSeconds / restTotal) * 100}, 100`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-mono text-xs font-bold text-amber-300">
                      {restSeconds}s
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold">
                      TACTICAL REST RECOVERY
                    </span>
                    <p className="text-xs text-zinc-300">Breathe deep. Hydrate. Reset glycogen.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRestSeconds((prev) => (prev ? prev + 30 : 30))}
                    className="px-2 py-1 text-[11px] font-mono rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => {
                      setIsResting(false);
                      setRestSeconds(0);
                    }}
                    className="px-2 py-1 text-[11px] font-mono rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-300"
                  >
                    SKIP
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Finished Celebration View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
              🏛️
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                MISSION ACCOMPLISHED · SEMPER FI
              </span>
              <h3 className="text-2xl font-black text-white mt-1">TACTICAL LOG ARCHIVED</h3>
              <p className="text-sm text-zinc-400 mt-2 italic max-w-md mx-auto">
                "No citizen has a right to be an amateur in the matter of physical training... what a disgrace it is to grow old without ever seeing the beauty and strength of which his body is capable."
              </p>
            </div>

            {finishStats && (
              <div className="grid grid-cols-3 gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-white/10 max-w-md mx-auto font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">VOLUME</span>
                  <p className="text-base font-bold text-amber-400">{finishStats.volume.toLocaleString()} LBS</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">SETS</span>
                  <p className="text-base font-bold text-emerald-400">{finishStats.setsCount}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">DURATION</span>
                  <p className="text-base font-bold text-blue-400">{finishStats.duration}</p>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-mono font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
            >
              RETURN TO COMMAND CENTER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
