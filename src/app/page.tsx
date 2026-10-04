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
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [customTier, setCustomTier] = useState<DifficultyTier>(DifficultyTier.Routine);
  const [customAttribute, setCustomAttribute] = useState("Discipline");

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    const basePointsMap: Record<DifficultyTier, number> = {
      [DifficultyTier.Micro]: 100,
      [DifficultyTier.Routine]: 300,
      [DifficultyTier.Challenging]: 750,
      [DifficultyTier.Boss]: 1500,
      [DifficultyTier.Legendary]: 3500,
    };
    const newItem: AnchorItem = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      subtitle: customSubtitle.trim() || "Custom founder objective",
      tier: customTier,
      basePoints: basePointsMap[customTier] || 300,
      attribute: customAttribute,
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      completed: false,
      boosted: false,
    };
    setAnchors((prev) => [...prev, newItem]);
    awardXp(100, `Objective Declared: ${newItem.title}`, customAttribute);
    setCustomTitle("");
    setCustomSubtitle("");
    setShowAddTaskModal(false);
  };

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
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Morning Anchor &middot; 05:30 AM
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-mono hidden sm:inline">
              Streak Multiplier: <strong className="text-amber-300">1.25x</strong>
            </span>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold font-mono transition flex items-center gap-1 shadow-sm"
            >
              <span>+</span> Add Task / Item
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {anchors.map((item, idx) => (
            <div
              key={item.id}
              onClick={(e) => toggleTask(idx, e)}
              className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                item.completed
                  ? "bg-[#121218]/90 border-amber-500/50 text-slate-400"
                  : "bg-[#121218] border-red-950/60 hover:border-amber-500/40 text-white"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}} // handled by parent onClick
                  className="w-5 h-5 rounded bg-black border-red-900/60 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                />
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.completed ? "line-through text-slate-400" : "text-white"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-300">{item.subtitle}</p>
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
                  className={`text-[11px] px-2.5 py-1 rounded font-bold transition ${
                    item.boosted
                      ? "bg-amber-500 text-black cursor-default shadow-sm"
                      : "bg-red-950/70 hover:bg-red-900/80 text-amber-300 border border-red-800/40"
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
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
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
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>23:1 OMAD Fasting Protocol</span>
              <span className="text-[10px] bg-red-950/70 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                Stage: Autophagy &amp; Fat Oxidation
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Feeding Window opens at <strong className="text-white font-mono">05:30 PM</strong> (Target: ~1,800 kcal &middot; 140g Protein)
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-200">
              <span>
                Protein Target: <strong className="text-amber-400 font-mono font-bold">140g</strong>
              </span>
              <span className="text-red-600">&bull;</span>
              <span>
                Body Recomp: <strong className="text-white font-mono font-bold">170 &rarr; 155 lbs</strong>
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => awardXp(300, "OMAD Single Feeding Window Logged", "Discipline")}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white border border-red-600/50 text-xs font-bold shadow-lg transition"
        >
          Log OMAD Meal (+300 XP)
        </button>
      </section>

      {/* CHRONOLOGICAL TIMELINE (Structured Inspired with Buffers) */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Chronological Campaign Timeline
          </h2>
          <span className="text-xs text-amber-400/90 font-mono">Dynamic Buffer Engine Active</span>
        </div>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-red-950/60">
          
          {/* Block 1 */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-red-600 -translate-x-1/2 ring-4 ring-[#0A0A0F]"></span>
            <div className="bg-[#121218] border border-red-950/70 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  08:30 AM &ndash; 10:30 AM (120m)
                </span>
                <h4 className="text-sm font-semibold text-white">
                  Stoic Business Consulting: Client Acquisition &amp; Fiverr Gig Delivery
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/50 font-mono font-bold">
                Tier 4 &middot; Boss Battle
              </span>
            </div>
          </div>

          {/* Dynamic Buffer Block */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-amber-600 -translate-x-1/2"></span>
            <div className="bg-black/60 border border-dashed border-red-900/40 px-3 py-1.5 rounded text-xs text-slate-300 flex items-center justify-between">
              <span>&cudarrr; 24-Min Transition Buffer (Hydration, Physical Reset)</span>
              <span className="font-mono text-[10px] text-amber-400/70">
                Bi = max(15m, 0.20 &times; Dur)
              </span>
            </div>
          </div>

          {/* Block 2 */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-amber-500 -translate-x-1/2 ring-4 ring-[#0A0A0F]"></span>
            <div className="bg-[#121218] border border-red-950/70 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  10:54 AM &ndash; 12:30 PM (96m)
                </span>
                <h4 className="text-sm font-semibold text-white">
                  DBA Doctoral Research: Assignment Resubmission &amp; Writing
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-600/40 font-mono font-bold">
                Tier 3 &middot; +750 XP
              </span>
            </div>
          </div>

          {/* Dynamic Buffer Block */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-amber-600 -translate-x-1/2"></span>
            <div className="bg-black/60 border border-dashed border-red-900/40 px-3 py-1.5 rounded text-xs text-slate-300">
              &cudarrr; 19-Min Transition Buffer
            </div>
          </div>

          {/* Block 3 */}
          <div className="relative pl-8">
            <span className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-red-600 -translate-x-1/2 ring-4 ring-[#0A0A0F]"></span>
            <div className="bg-[#121218] border border-red-950/70 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  12:49 PM &ndash; 02:00 PM (71m)
                </span>
                <h4 className="text-sm font-semibold text-white">
                  Ultron Self-Hosted LLM Setup &amp; Skill Indexing
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                Tier 3 &middot; +750 XP
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* DAILY STOIC REFLECTION (Stoic App Inspired) */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-serif text-amber-400 uppercase tracking-widest font-bold">
            Stoic Meditation &middot; Meditations IV.3
          </span>
          <span className="text-xs text-slate-300 font-medium">Marcus Aurelius</span>
        </div>
        <blockquote className="italic text-sm text-white border-l-2 border-amber-500 pl-3 py-1 font-serif">
          &ldquo;Nowhere can man find a quieter or more untroubled retreat than in his own soul... Constantly give yourself this retreat, and renew yourself.&rdquo;
        </blockquote>
        <div className="mt-4 pt-3 border-t border-red-950/70 flex items-center justify-between">
          <input
            type="text"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            disabled={reflectionSaved}
            placeholder="Write your evening virtue reflection..."
            className="bg-black border border-red-950/80 rounded px-3 py-1.5 text-xs text-white placeholder-slate-400 flex-1 mr-3 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />
          <button
            onClick={handleSealDay}
            disabled={reflectionSaved}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              reflectionSaved
                ? "bg-red-700 text-white cursor-default"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow"
            }`}
          >
            {reflectionSaved ? "Sealed (+300 XP)" : "Seal Day (+300 XP)"}
          </button>
        </div>
      </section>

      {/* ADD TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-red-900/80 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-red-950 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Add Daily Task / Item
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-300 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCustomTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check Mustang 15mm Bolt / Pitch Client on Fiverr"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                  Subtitle / Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6.0 qt 5W-20 / Zone 2 Heart Rate / Review rubric"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                    Friction Tier (XP)
                  </label>
                  <select
                    value={customTier}
                    onChange={(e) => setCustomTier(Number(e.target.value) as DifficultyTier)}
                    className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={DifficultyTier.Micro}>Tier 1: Micro (+100 XP)</option>
                    <option value={DifficultyTier.Routine}>Tier 2: Routine (+300 XP)</option>
                    <option value={DifficultyTier.Challenging}>Tier 3: Labor (+750 XP)</option>
                    <option value={DifficultyTier.Boss}>Tier 4: Boss (+1,500 XP)</option>
                    <option value={DifficultyTier.Legendary}>Tier 5: Legendary (+3,500 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                    Stoic Attribute
                  </label>
                  <select
                    value={customAttribute}
                    onChange={(e) => setCustomAttribute(e.target.value)}
                    className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Discipline">Discipline</option>
                    <option value="Strength">Strength (Physical)</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Intellect">Intellect (DBA / AI)</option>
                    <option value="Dominion">Dominion (Consulting)</option>
                    <option value="Recovery">Recovery (OMAD / Fast)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-red-950/70">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3.5 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-wider transition shadow"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
