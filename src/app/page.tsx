"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";
import { calculateTaskPoints, DifficultyTier } from "@/lib/gamification";

interface AnchorItem {
  id: string;
  title: string;
  subtitle: string;
  tier: DifficultyTier;
  basePoints: number;
  attribute: string;
  badgeClass: string;
  completed: boolean;
  boosted: boolean;
}

export default function TodayCommandCenter() {
  const { awardXp, reverseXp, streakDays, calmMode } = useStoic();

  const [anchors, setAnchors] = useState<AnchorItem[]>([
    {
      id: "a1",
      title: "Hydrate: 24oz Water + Electrolyte Formula",
      subtitle: "Sodium (500mg), Potassium (200mg), Magnesium Glycinate (100mg)",
      tier: DifficultyTier.Micro,
      basePoints: 100,
      attribute: "Recovery",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      completed: false,
      boosted: false,
    },
    {
      id: "a2",
      title: "Calisthenics Core Burnout + 6-Rnd Boxing",
      subtitle: "Pull-ups (3xMax), Dips (3x15), Hanging Leg Raises + 3m/1m Boxing (Zero Dumbbells)",
      tier: DifficultyTier.Challenging,
      basePoints: 750,
      attribute: "Strength",
      badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      completed: false,
      boosted: false,
    },
    {
      id: "a3",
      title: "20-Minute Incline Treadmill Walk",
      subtitle: "12% Incline · 3.0 MPH · Zone 2 Aerobic Fat Oxidation",
      tier: DifficultyTier.Routine,
      basePoints: 300,
      attribute: "Endurance",
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      completed: false,
      boosted: false,
    },
  ]);

  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const toggleTask = (index: number, e: React.MouseEvent) => {
    const item = anchors[index];
    const willComplete = !item.completed;
    const earned = calculateTaskPoints(item.tier, streakDays, false, 0, item.boosted);

    if (willComplete) {
      awardXp(earned, item.title, item.attribute);

      // Spawn Combat Floater if not calm mode
      if (!calmMode && typeof window !== "undefined") {
        const floater = document.createElement("div");
        floater.className =
          "fixed font-mono font-bold text-sm text-amber-400 combat-floater z-50 drop-shadow-md select-none pointer-events-none";
        floater.innerText = `+${earned} XP ${item.attribute.toUpperCase()}!`;
        floater.style.left = `${e.clientX + 10}px`;
        floater.style.top = `${e.clientY - 20}px`;
        document.body.appendChild(floater);
        setTimeout(() => floater.remove(), 850);
      }
    } else {
      reverseXp(earned, item.title);
    }

    setAnchors((prev) =>
      prev.map((a, i) => (i === index ? { ...a, completed: willComplete } : a))
    );
  };

  const boostTaskEffort = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = anchors[index];
    if (item.boosted) return;

    awardXp(450, `Effort Boost: ${item.title}`, "Discipline");

    if (!calmMode && typeof window !== "undefined") {
      const floater = document.createElement("div");
      floater.className =
        "fixed font-mono font-bold text-sm text-amber-300 combat-floater z-50 drop-shadow-md select-none pointer-events-none";
      floater.innerText = `+450 XP EFFORT BOOST!`;
      floater.style.left = `${e.clientX + 10}px`;
      floater.style.top = `${e.clientY - 20}px`;
      document.body.appendChild(floater);
      setTimeout(() => floater.remove(), 850);
    }

    setAnchors((prev) =>
      prev.map((a, i) => (i === index ? { ...a, boosted: true } : a))
    );
  };

  const handleSealDay = () => {
    if (reflectionSaved) return;
    awardXp(300, "Evening Stoic Reflection Sealed", "Discipline");
    setReflectionSaved(true);
  };

  return (
    <div className="space-y-6">

      {/* MORNING ANCHOR (05:30 AM) */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Morning Anchor &middot; 05:30 AM
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Streak Multiplier: <strong className="text-amber-300">1.25x</strong>
          </span>
        </div>

        <div className="space-y-3">
          {anchors.map((item, idx) => (
            <div
              key={item.id}
              onClick={(e) => toggleTask(idx, e)}
              className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                item.completed
                  ? "bg-[#1C1E2B]/90 border-amber-500/40 text-slate-400"
                  : "bg-[#1C1E2B]/70 border-[#232636] hover:border-slate-600 text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}} // handled by parent onClick
                  className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      item.completed ? "line-through text-slate-400" : "text-slate-100"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-medium border ${item.badgeClass}`}
                >
                  +{item.basePoints} XP
                </span>
                <button
                  onClick={(e) => boostTaskEffort(idx, e)}
                  disabled={item.boosted}
                  className={`text-[11px] px-2 py-0.5 rounded transition ${
                    item.boosted
                      ? "bg-amber-600 text-white cursor-default"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Felt harder than expected? Boost XP!"
                >
                  {item.boosted ? "Boosted!" : "Boost +"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 23:1 OMAD FASTING PROTOCOL (Zero + MacroFactor Inspired) */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="82, 100"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center leading-none">
              <span className="text-xs font-bold text-emerald-400 font-mono">19h 42m</span>
              <span className="text-[9px] block text-slate-400 mt-0.5">FASTED</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>23:1 OMAD Fasting Protocol</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Stage: Autophagy & Fat Oxidation
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Feeding Window opens at <strong className="text-slate-200">05:30 PM</strong> (Target: ~1,800 kcal &middot; 140g Protein)
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
              <span>
                Protein Target: <strong className="text-amber-400 font-mono">140g</strong>
              </span>
              <span className="text-slate-600">&bull;</span>
              <span>
                Body Recomp: <strong className="text-slate-200 font-mono">170 &rarr; 155 lbs</strong>
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => awardXp(300, "OMAD Single Feeding Window Logged", "Discipline")}
          className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition"
        >
          Log OMAD Meal (+300 XP)
        </button>
      </section>

      {/* CHRONOLOGICAL TIMELINE (Structured Inspired with Buffers) */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Chronological Campaign Timeline
          </h2>
          <span className="text-xs text-slate-400">Dynamic Buffer Engine Active</span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#232636]">
          
          {/* Block 1 */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-indigo-500 -translate-x-1/2 ring-4 ring-[#13141C]"></span>
            <div className="bg-[#1C1E2B] border border-[#232636] p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-semibold">
                  08:30 AM &ndash; 10:30 AM (120m)
                </span>
                <h4 className="text-sm font-medium text-slate-100">
                  Stoic Business Consulting: Client Acquisition & Fiverr Gig Delivery
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                Tier 4 &middot; Boss Battle
              </span>
            </div>
          </div>

          {/* Dynamic Buffer Block */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-slate-600 -translate-x-1/2"></span>
            <div className="bg-slate-900/60 border border-dashed border-slate-700/60 px-3 py-1.5 rounded text-xs text-slate-400 flex items-center justify-between">
              <span>&cudarrr; 24-Min Transition Buffer (Hydration, Physical Reset)</span>
              <span className="font-mono text-[10px] text-slate-500">
                Bi = max(15m, 0.20 &times; Dur)
              </span>
            </div>
          </div>

          {/* Block 2 */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-purple-500 -translate-x-1/2 ring-4 ring-[#13141C]"></span>
            <div className="bg-[#1C1E2B] border border-[#232636] p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-purple-400 font-semibold">
                  10:54 AM &ndash; 12:30 PM (96m)
                </span>
                <h4 className="text-sm font-medium text-slate-100">
                  DBA Doctoral Research: Assignment Resubmission & Writing
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                Tier 3 &middot; +750 XP
              </span>
            </div>
          </div>

          {/* Dynamic Buffer Block */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-slate-600 -translate-x-1/2"></span>
            <div className="bg-slate-900/60 border border-dashed border-slate-700/60 px-3 py-1.5 rounded text-xs text-slate-400">
              &cudarrr; 19-Min Transition Buffer
            </div>
          </div>

          {/* Block 3 */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-cyan-500 -translate-x-1/2 ring-4 ring-[#13141C]"></span>
            <div className="bg-[#1C1E2B] border border-[#232636] p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  12:49 PM &ndash; 02:00 PM (71m)
                </span>
                <h4 className="text-sm font-medium text-slate-100">
                  Ultron Self-Hosted LLM Setup & Skill Indexing
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Tier 3 &middot; +750 XP
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* DAILY STOIC REFLECTION (Stoic App Inspired) */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-serif text-amber-400 uppercase tracking-widest font-semibold">
            Stoic Meditation &middot; Meditations IV.3
          </span>
          <span className="text-xs text-slate-500">Marcus Aurelius</span>
        </div>
        <blockquote className="italic text-sm text-slate-200 border-l-2 border-amber-500 pl-3 py-1">
          &ldquo;Nowhere can man find a quieter or more untroubled retreat than in his own soul... Constantly give yourself this retreat, and renew yourself.&rdquo;
        </blockquote>
        <div className="mt-4 pt-3 border-t border-[#232636] flex items-center justify-between">
          <input
            type="text"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            disabled={reflectionSaved}
            placeholder="Write your evening virtue reflection..."
            className="bg-[#1C1E2B] border border-[#232636] rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 flex-1 mr-3 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />
          <button
            onClick={handleSealDay}
            disabled={reflectionSaved}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              reflectionSaved
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-amber-500 text-slate-900 hover:bg-amber-400"
            }`}
          >
            {reflectionSaved ? "Sealed (+300 XP)" : "Seal Day (+300 XP)"}
          </button>
        </div>
      </section>

    </div>
  );
}
