"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OpenGymDock() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryTabs = [
    { href: "/", label: "Today", icon: "⚡" },
    { href: "/training", label: "Train", icon: "🎯" },
    { href: "/exercises", label: "Exercises", icon: "📖" },
    { href: "/progress", label: "Progress", icon: "📊" },
  ];

  const moreTabs = [
    { href: "/nutrition", label: "23:1 OMAD Field Notebook", icon: "🥗" },
    { href: "/coaching", label: "Socratic Coaching Oracle", icon: "🏛️" },
    { href: "/quests", label: "Sovereign Quests", icon: "⚔️" },
    { href: "/character", label: "Character HUD & Attributes", icon: "🛡️" },
    { href: "/learning", label: "AI Spectrum & Courses", icon: "🧠" },
    { href: "/goals", label: "Goals & Countdown", icon: "🏹" },
    { href: "/calendar", label: "Master Calendar", icon: "📅" },
    { href: "/imports", label: "Document Vault", icon: "📂" },
    { href: "/settings", label: "AI Keys & Settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Floating Bottom Dock (Open-GYM Liquid Bar) */}
      <div className="fixed bottom-3 inset-x-0 z-40 max-w-lg mx-auto px-3 pointer-events-none">
        <div className="bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-around ring-1 ring-amber-500/20 pointer-events-auto">
          {primaryTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative px-4 py-2 text-xs font-mono font-medium rounded-full flex items-center gap-1.5 transition-all select-none ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-lg shadow-amber-500/30 scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-black ml-0.5 animate-ping" />
                )}
              </Link>
            );
          })}

          {/* More Drawer Trigger */}
          <button
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-mono font-medium rounded-full flex items-center gap-1.5 transition-all select-none ${
              isMoreOpen
                ? "bg-red-950 text-red-300 border border-red-500/50"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>✨</span>
            <span className="hidden sm:inline">Suite</span>
          </button>
        </div>
      </div>

      {/* "More / Sovereign Suite" Bottom Sheet */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 ring-1 ring-amber-500/20 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase">
                  SOVEREIGN SUITE EXTENSIONS
                </span>
                <h3 className="text-base font-bold text-white">Full Antigravity Arsenal</h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {moreTabs.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                        : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-900 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs font-mono font-medium">{item.label}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
