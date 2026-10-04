"use client";

import React from "react";
import { useStoic } from "@/context/StoicContext";
import Link from "next/link";

export default function Header() {
  const { totalXp, streakDays, calmMode, toggleCalmMode, levelInfo } = useStoic();

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-red-900/40 px-4 py-3 shadow-lg shadow-black/60">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Character Prestige & Level Badge (Gold & Red Accent) */}
        <Link href="/character" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[2px] shadow-lg shadow-red-950/50 group-hover:scale-105 transition">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center font-bold text-amber-400 text-xs font-mono border border-amber-500/40">
              LVL {levelInfo.level}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif tracking-wider text-xs text-amber-400 uppercase font-bold">
                {levelInfo.title}
              </span>
              <span className="text-[10px] bg-red-950/70 text-red-300 px-1.5 py-0.5 rounded border border-red-600/40 font-bold">
                Founder
              </span>
            </div>
            <p className="text-sm font-bold text-white flex items-center gap-1">
              Stoic Sovereign
            </p>
          </div>
        </Link>

        {/* Streak & Target Rings (Red & Gold) */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Flame Streak in Red/Gold with Shield */}
          <div className="flex items-center gap-2 bg-[#0D0A0C] px-3 py-1.5 rounded-lg border border-red-600/40 shadow-sm shadow-red-950/30">
            <span className="text-base animate-pulse">🔥</span>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-red-400 font-mono">{streakDays} Days</div>
              <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                <span>🛡️ Shield Active</span>
              </div>
            </div>
          </div>

          {/* Daily Target XP Ring */}
          <div className="hidden sm:flex items-center gap-2.5 bg-[#0D0A0C] px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-sm">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-zinc-900" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-400 transition-all duration-500" strokeDasharray="100, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[9px] font-mono font-bold text-amber-300">XP</span>
            </div>
            <div className="text-left">
              <div className="text-xs font-mono font-bold text-white">
                {totalXp.toLocaleString()} <span className="text-slate-400 text-[10px]">XP</span>
              </div>
              <div className="text-[10px] text-amber-400 font-medium font-mono">114% Target Met</div>
            </div>
          </div>

          {/* Calm Mode Switch */}
          <button
            onClick={toggleCalmMode}
            className="text-xs px-2.5 py-1.5 rounded bg-[#121218] border border-zinc-800 text-white hover:border-red-600/50 transition font-medium"
            title="Silence audio effects and hide combat numbers for deep focus"
          >
            Calm:{" "}
            <span className={calmMode ? "font-bold text-emerald-400 font-mono" : "font-bold text-slate-400 font-mono"}>
              {calmMode ? "ON" : "OFF"}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}
