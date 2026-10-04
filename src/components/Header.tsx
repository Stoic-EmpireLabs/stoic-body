"use client";

import React from "react";
import { useStoic } from "@/context/StoicContext";
import Link from "next/link";

export default function Header() {
  const { totalXp, streakDays, calmMode, toggleCalmMode, levelInfo } = useStoic();

  const dailyXpTarget = 2500;
  const dailyProgress = Math.min(100, Math.round((2850 / dailyXpTarget) * 100));

  return (
    <header className="sticky top-0 z-40 bg-[#090A0F]/90 backdrop-blur-md border-b border-[#232636] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Character Prestige & Level Badge */}
        <Link href="/character" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-[#13141C] p-[2px] shadow-lg group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#13141C] rounded-[10px] flex items-center justify-center font-bold text-amber-400 text-xs font-mono">
              LVL {levelInfo.level}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif tracking-wide text-xs text-amber-400 uppercase font-semibold">
                {levelInfo.title}
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                Founder
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-100 flex items-center gap-1">
              Stoic Sovereign
            </p>
          </div>
        </Link>

        {/* Streak & Target Rings */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Flame Streak with Shield */}
          <div className="flex items-center gap-1.5 bg-[#13141C] px-3 py-1.5 rounded-lg border border-[#232636] shadow-sm">
            <span className="text-base">🔥</span>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-amber-400">{streakDays} Days</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span>🛡️ Shield Active</span>
              </div>
            </div>
          </div>

          {/* Daily Target XP Ring */}
          <div className="hidden sm:flex items-center gap-2 bg-[#13141C] px-3 py-1.5 rounded-lg border border-[#232636] shadow-sm">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500 transition-all duration-500" strokeDasharray="100, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[9px] font-mono font-bold text-amber-300">XP</span>
            </div>
            <div className="text-left">
              <div className="text-xs font-mono font-bold text-slate-100">
                {totalXp.toLocaleString()} <span className="text-slate-400 text-[10px]">XP</span>
              </div>
              <div className="text-[10px] text-amber-400 font-medium">114% Goal Met!</div>
            </div>
          </div>

          {/* Calm Mode Switch */}
          <button
            onClick={toggleCalmMode}
            className="text-xs px-2.5 py-1.5 rounded bg-[#1C1E2B] border border-[#232636] text-slate-300 hover:text-white transition"
            title="Silence audio effects and hide combat numbers for deep focus"
          >
            Calm Mode:{" "}
            <span className={calmMode ? "font-bold text-emerald-400" : "font-bold text-slate-400"}>
              {calmMode ? "ON" : "OFF"}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}
