"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStoic } from "@/context/StoicContext";

export default function TrainingStudio() {
  const { awardXp, playAnvilChime, playBellSound } = useStoic();

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
            playBellSound();
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
  }, [isRunning, isRest, playBellSound]);

  const handleStartTimer = () => {
    if (!isRunning) {
      playBellSound();
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
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-6 shadow-lg text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Home Boxing Round Timer
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
            ROUND {currentRound} of 6
          </span>
        </div>

        <div className="my-4">
          <div className="text-6xl font-mono font-black tracking-tight text-slate-100">
            {formatTime(timerSeconds)}
          </div>
          <div
            className={`text-xs font-bold uppercase tracking-widest mt-1 ${
              isRest ? "text-blue-400" : "text-emerald-400"
            }`}
          >
            {isRest ? "REST & BREATHE INTERVAL" : "FIGHT · HIGH INTENSITY"}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleStartTimer}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition shadow-lg shadow-red-900/30"
          >
            START ROUND
          </button>
          <button
            onClick={handlePauseTimer}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition"
          >
            PAUSE
          </button>
          <button
            onClick={handleResetTimer}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium text-sm transition"
          >
            RESET
          </button>
        </div>
      </section>

      {/* NO-DUMBBELL CALISTHENICS WORKOUT DECK */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Home Calisthenics & High-Rep Suite
            </h3>
            <p className="text-xs text-slate-400">
              Strict Equipment Constraint: Zero Dumbbells &middot; High Reps &middot; Progressive Overload
            </p>
          </div>
          <button
            onClick={completeCalisthenics}
            disabled={routineCompleted}
            className={`text-xs font-mono px-3 py-1 rounded border transition ${
              routineCompleted
                ? "bg-purple-600 text-white border-purple-500 cursor-default"
                : "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
            }`}
          >
            {routineCompleted ? "Completed (+750 XP)" : "Claim Routine (+750 XP)"}
          </button>
        </div>

        <div className="space-y-3">
          
          {/* Exercise 1 */}
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636] flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-slate-100">Strict Overhand Pull-Ups</h5>
              <p className="text-xs text-slate-400">Target: 3 Sets &times; Max Reps (RPE 9)</p>
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
                        ? "bg-amber-500 text-slate-900"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    S{s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise 2 */}
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636] flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-slate-100">Parallel Bar Dips</h5>
              <p className="text-xs text-slate-400">Target: 3 Sets &times; 15 Reps</p>
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
                        ? "bg-amber-500 text-slate-900"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    S{s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise 3 */}
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636] flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-slate-100">Diamond Push-Up Burnout</h5>
              <p className="text-xs text-slate-400">Target: 3 Sets &times; 20 Reps (Triceps & Chest Focus)</p>
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
                        ? "bg-amber-500 text-slate-900"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    S{s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise 4 */}
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636] flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-slate-100">Hanging Leg Raises & Hollow Holds</h5>
              <p className="text-xs text-slate-400">Target: 3 Sets &times; 12 Reps (Compressed Core for Abs)</p>
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
                        ? "bg-amber-500 text-slate-900"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">
            Cheerleading Partner Flyer Stunt Coaching
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
            Family Sanctuary
          </span>
        </div>
        <p className="text-sm font-medium text-slate-100">
          Daughter Flyer Base Fundamentals & Balance Elevation
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Coaching cues: Chest upright, lock elbows at 90 degrees, absorb with deep quad drive, establish firm wrist lock under foot arches. Emphasize trust, locked core, and soft dismount catches.
        </p>
        <div className="mt-3 pt-3 border-t border-[#232636] flex justify-end">
          <button
            onClick={() => awardXp(1500, "Cheer Flyer Partner Stunt Session", "Strength")}
            className="px-3 py-1.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold hover:bg-pink-500/30 transition"
          >
            Log Practice Drill (+1,500 XP)
          </button>
        </div>
      </section>

    </div>
  );
}
