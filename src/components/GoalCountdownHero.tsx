"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import { calculateGoalCountdown, calculateMilestoneProgression, GoalMilestoneCheckpoint } from "@/lib/scheduling";
import Link from "next/link";

export default function GoalCountdownHero() {
  const { activeProfile } = useStoic();

  const [countdown, setCountdown] = useState({
    days: 72,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  const [milestones, setMilestones] = useState<GoalMilestoneCheckpoint[]>([]);

  useEffect(() => {
    const targetDate = activeProfile.targetDate || "2026-12-15T23:59:59Z";
    const update = () => {
      const res = calculateGoalCountdown(targetDate);
      setCountdown(res);
    };

    update();
    const interval = setInterval(update, 1000);

    const ms = calculateMilestoneProgression(
      activeProfile.currentWeight || 170,
      activeProfile.targetWeight || 155,
      activeProfile.targetWeeks || 10,
      activeProfile.createdDate || "2026-10-04"
    );
    setMilestones(ms);

    return () => clearInterval(interval);
  }, [activeProfile]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-950/80 via-black/90 to-zinc-950/80 backdrop-blur-2xl border border-white/10 ring-1 ring-amber-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-5 sm:p-7 text-white transition-all hover:border-amber-500/40">
      
      {/* Radiant ambient glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-amber-500/10 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-red-600/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Goal Target & Scientific Velocity */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[1.5px] shadow-lg shadow-amber-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center text-lg">
              🎯
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                Sovereign Recomp Objective
              </span>
              <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full border border-red-600/40 font-mono font-bold">
                {activeProfile.targetWeeks || 10} Weeks Campaign
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
              <span>{activeProfile.currentWeight} lbs</span>
              <span className="text-amber-400 font-mono text-base">&rarr;</span>
              <span className="text-amber-300 font-mono">{activeProfile.targetWeight} lbs</span>
              <span className="text-xs text-zinc-400 font-sans font-normal hidden md:inline">
                (Visible Abs &amp; Calisthenics Mastery)
              </span>
            </h2>
          </div>
        </div>

        {/* Target Deadline Badge */}
        <div className="text-left sm:text-right font-mono">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wider">
            Target Completion Deadline
          </div>
          <div className="text-sm font-bold text-amber-300 flex items-center sm:justify-end gap-1.5">
            <span>🗓️</span>
            <span>{activeProfile.targetDate || "2026-12-15"}</span>
          </div>
        </div>
      </div>

      {/* LIVE COUNTDOWN TICKER DISPLAY (Distilled: Unified strip, no nested cards) */}
      <div className="relative z-10 bg-black/50 border border-white/10 rounded-xl py-3.5 px-2 sm:px-6 mb-6">
        <div className="grid grid-cols-4 divide-x divide-white/10">
          {[
            { label: "DAYS", value: String(countdown.days).padStart(2, "0") },
            { label: "HOURS", value: String(countdown.hours).padStart(2, "0") },
            { label: "MINUTES", value: String(countdown.minutes).padStart(2, "0") },
            { label: "SECONDS", value: String(countdown.seconds).padStart(2, "0") },
          ].map((unit) => (
            <div key={unit.label} className="text-center px-2">
              <div className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                {unit.value}
              </div>
              <div className="text-[9px] sm:text-[11px] font-mono text-amber-400/90 font-bold uppercase tracking-widest mt-1">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Recomp Physics (Distilled: Clean 3-column metric row with subtle dividers) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-y border-white/10 py-3 mb-5 text-xs font-mono">
        <div className="py-2 md:py-0 md:pr-4">
          <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Weekly Fat Loss Velocity</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            -{activeProfile.targetWeeklyLossLbs || 1.5} lbs / week
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Preserves 100% lean mass via 140g protein
          </p>
        </div>

        <div className="py-2 md:py-0 md:px-4">
          <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Target Energy Balance</div>
          <div className="text-sm font-bold text-amber-400 mt-1">
            1,800 kcal &bull; -{activeProfile.dailyCalorieDeficit || 750} kcal
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            23:1 OMAD: Elevated lipolysis &amp; HGH
          </p>
        </div>

        <div className="py-2 md:py-0 md:pl-4">
          <div className="text-zinc-400 text-[10px] uppercase tracking-wider">Movement Modality</div>
          <div className="text-sm font-bold text-white mt-1">
            {activeProfile.trainingFocus || "Calisthenics & Boxing"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Zero dumbbells &bull; Mechanical tension &amp; EPOC
          </p>
        </div>
      </div>

      {/* Milestone Checkpoint Roadmap (Distilled: Clean progression step strip) */}
      <div className="relative z-10 pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Periodized Milestone Roadmap
          </span>
          <Link
            href="/calendar"
            className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
          >
            <span>View Full {activeProfile.targetWeeks || 10}-Week Calendar &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={m.phaseName}
              className={`p-3 rounded-xl transition ${
                idx === 0
                  ? "bg-amber-500/10 border border-amber-500/40 text-white"
                  : "bg-black/30 border border-white/5 text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span>{m.weekRange}</span>
                <span className="text-amber-300 font-bold">{m.estimatedDate}</span>
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{idx === 0 ? "⚡" : idx === 1 ? "🔥" : "🏆"}</span>
                <span>{m.phaseName}</span>
              </div>
              <div className="text-[11px] font-mono text-amber-400 font-bold mt-1">
                Target: {m.targetWeightLbs} lbs
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                {m.focusProtocol}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
