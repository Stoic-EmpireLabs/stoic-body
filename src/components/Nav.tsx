"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Today", id: "tour-tab-today", icon: "⚡" },
    { href: "/calendar", label: "Calendar", id: "tour-tab-calendar", icon: "📅" },
    { href: "/goals", label: "Goals & Countdown", id: "tour-tab-goals", icon: "🎯" },
    { href: "/training", label: "Boxing & Calisthenics", id: "tour-tab-training", icon: "🥊" },
    { href: "/nutrition", label: "23:1 OMAD", id: "tour-tab-nutrition", icon: "🥗" },
    { href: "/progress", label: "170→155 Recomp", id: "tour-tab-progress", icon: "📊" },
    { href: "/learning", label: "AI Spectrum & Courses", id: "tour-tab-learning", icon: "🧠" },
    { href: "/coaching", label: "Stoic Coach", id: "tour-tab-coaching", icon: "🏛️" },
    { href: "/quests", label: "Quests", id: "tour-tab-quests", icon: "⚔️" },
    { href: "/character", label: "Character HUD", id: "tour-tab-character", icon: "🛡️" },
    { href: "/imports", label: "Document Vault", id: "tour-tab-imports", icon: "📂" },
    { href: "/settings", label: "AI Agents & Keys", id: "tour-tab-settings", icon: "⚙️" },
  ];

  return (
    <nav
      id="tour-nav-tabs"
      className="sticky top-[58px] sm:top-[62px] z-30 max-w-4xl mx-auto px-2 sm:px-4 mt-2 overflow-x-auto no-scrollbar"
    >
      <div className="bg-zinc-950/75 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center gap-1 min-w-max ring-1 ring-amber-500/10">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              id={link.id}
              className={`relative px-3 py-2 text-xs font-mono font-medium tracking-wide transition-all rounded-xl flex items-center gap-1.5 select-none ${
                isActive
                  ? "bg-gradient-to-r from-red-950/80 via-zinc-900 to-amber-950/80 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/40 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              <span>{link.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
