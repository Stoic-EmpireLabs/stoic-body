"use client";

import React from "react";
import { useStoic } from "@/context/StoicContext";
import Link from "next/link";

export default function Header() {
  const {
    totalXp,
    streakDays,
    calmMode,
    toggleCalmMode,
    levelInfo,
    activeProfile,
    startTour,
    setIsLoginOpen,
  } = useStoic();

  return (
    <header
      id="tour-target-header"
      className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-red-900/40 px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg shadow-black/60"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Character Prestige & Level Badge (Gold & Red Accent) */}
        <Link href="/character" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="relative w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[2px] shadow-lg shadow-red-950/50 group-hover:scale-105 transition">
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
              <span className="font-serif tracking-wider text-[11px] sm:text-xs text-amber-400 uppercase font-bold">
                {levelInfo.title}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase font-mono ${
                activeProfile.role === "founder"
                  ? "bg-red-950/70 text-red-300 border-red-600/40"
                  : "bg-amber-950/70 text-amber-300 border-amber-600/40"
              }`}>
                {activeProfile.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
              {activeProfile.callsign}
            </p>
          </div>
        </Link>

        {/* Controls, Streak & Tour Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Flame Streak in Red/Gold with Shield */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0D0A0C] px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-600/40 shadow-sm shadow-red-950/30">
            <span className="text-sm sm:text-base animate-pulse">🔥</span>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-red-400 font-mono">{streakDays}d</div>
              <div className="hidden sm:flex text-[10px] text-amber-400 font-medium items-center gap-1">
                <span>🛡️ Shield</span>
              </div>
            </div>
          </div>

          {/* Guided Tour Trigger Button */}
          <button
            onClick={startTour}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-red-600/10 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white transition font-mono font-bold"
            title="Launch interactive step-by-step walkthrough"
          >
            <span>🧭</span>
            <span className="hidden sm:inline">Tour</span>
          </button>

          {/* Profile Switcher / Client Login Button */}
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition font-mono font-medium"
            title="Switch Profile or Client Sign-In"
          >
            <span>👤</span>
            <span className="hidden md:inline">Account</span>
          </button>

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
