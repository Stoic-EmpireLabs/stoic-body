"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStoic } from "@/context/StoicContext";

export default function TrainingStudio() {
  const { awardXp, playAnvilChime, playBoxingBell } = useStoic();

  // Boxing Timer State
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Round / Rest Switch
            playBoxingBell();
            if (!isRest) {
              // Transition to 1m Rest
              setIsRest(true);
              return 60;
            } else {
              // Transition to Next Round
              setIsRest(false);
              setCurrentRound((r) => Math.min(6, r + 1));
              return 180;
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
  }, [isRunning, isRest, playBoxingBell]);

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
    setTimerSeconds(180);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Set Tracking State
  const [setsState, setSetsState] = useState<Record<string, boolean>>({});

  const toggleSet = (exerciseKey: string, setIndex: number) => {
    playAnvilChime();
    const key = `${exerciseKey}-${setIndex}`;
    setSetsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [routineCompleted, setRoutineCompleted] = useState(false);

  const completeCalisthenics = () => {
    if (routineCompleted) return;
    awardXp(750, "Full Calisthenics Core & High-Rep Routine", "Strength");
    setRoutineCompleted(true);
  };

  return (
    <div className="space-y-6">

      {/* BOXING ROUND TIMER */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            Home Boxing Round Timer
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-red-950/80 text-amber-300 border border-amber-500/40">
            ROUND {currentRound} of 6
          </span>
        </div>

        <div className="my-4">
          <div className="text-6xl font-mono font-black tracking-tight text-white">
            {formatTime(timerSeconds)}
          </div>
          <div
            className={`text-xs font-bold uppercase tracking-widest mt-1.5 ${
              isRest ? "text-amber-400" : "text-red-400"
            }`}
          >
            {isRest ? "REST & BREATHE INTERVAL (60 SEC)" : "FIGHT · HIGH INTENSITY STRIKING"}
          </div>
        </div>

        <div className="flex justify-center gap-3">
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
      </section>

      {/* NO-DUMBBELL CALISTHENICS WORKOUT DECK */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Home Calisthenics &amp; High-Rep Suite
            </h3>
            <p className="text-xs text-slate-300">
              Strict Equipment Constraint: Zero Dumbbells &middot; High Reps &middot; Progressive Overload
            </p>
          </div>
          <button
            onClick={completeCalisthenics}
            disabled={routineCompleted}
            className={`text-xs font-mono font-bold px-3 py-1.5 rounded border transition ${
              routineCompleted
                ? "bg-red-700 text-white border-red-500 cursor-default"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-amber-400/50 shadow"
            }`}
          >
            {routineCompleted ? "Completed (+750 XP)" : "Claim Routine (+750 XP)"}
          </button>
        </div>

        <div className="space-y-3">
          
          {/* Exercise 1 */}
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-semibold text-white">Strict Overhand Pull-Ups</h5>
              <p className="text-xs text-slate-300">Target: 3 Sets &times; Max Reps (RPE 9)</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => {
                const isDone = !!setsState[`pullups-${s}`];
                return (
                  <button
                    key={s}
                    onClick={() => toggleSet("pullups", s)}
                    className={`w-8 h-8 rounded font-mono text-xs font-bold transition ${
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
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-semibold text-white">Parallel Bar Dips</h5>
              <p className="text-xs text-slate-300">Target: 3 Sets &times; 15 Reps</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => {
                const isDone = !!setsState[`dips-${s}`];
                return (
                  <button
                    key={s}
                    onClick={() => toggleSet("dips", s)}
                    className={`w-8 h-8 rounded font-mono text-xs font-bold transition ${
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
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-semibold text-white">Diamond Push-Up Burnout</h5>
              <p className="text-xs text-slate-300">Target: 3 Sets &times; 20 Reps (Triceps &amp; Chest Focus)</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => {
                const isDone = !!setsState[`pushups-${s}`];
                return (
                  <button
                    key={s}
                    onClick={() => toggleSet("pushups", s)}
                    className={`w-8 h-8 rounded font-mono text-xs font-bold transition ${
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
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between">
            <div>
              <h5 className="text-sm font-semibold text-white">Hanging Leg Raises &amp; Hollow Holds</h5>
              <p className="text-xs text-slate-300">Target: 3 Sets &times; 12 Reps (Compressed Core for Abs)</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => {
                const isDone = !!setsState[`core-${s}`];
                return (
                  <button
                    key={s}
                    onClick={() => toggleSet("core", s)}
                    className={`w-8 h-8 rounded font-mono text-xs font-bold transition ${
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

      {/* CHEER STUNTING FLYER DRILL */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Cheerleading Partner Flyer Stunt Coaching
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
            Family Sanctuary
          </span>
        </div>
        <p className="text-sm font-semibold text-white">
          Daughter Flyer Base Fundamentals &amp; Balance Elevation
        </p>
        <p className="text-xs text-slate-300 mt-1">
          Coaching cues: Chest upright, lock elbows at 90 degrees, absorb with deep quad drive, establish firm wrist lock under foot arches. Emphasize trust, locked core, and soft dismount catches.
        </p>
        <div className="mt-3 pt-3 border-t border-red-950/70 flex justify-end">
          <button
            onClick={() => awardXp(1500, "Cheer Flyer Partner Stunt Session", "Strength")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 text-white border border-rose-500/40 text-xs font-bold shadow-lg transition"
          >
            Log Practice Drill (+1,500 XP)
          </button>
        </div>
      </section>

    </div>
  );
}
