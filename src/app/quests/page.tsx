"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import { PRELOADED_QUESTS, Quest, QuestCategory } from "@/lib/quests";
import { fireBrilliantConfetti } from "@/lib/confetti";
import {
  Wrench,
  Home,
  Cpu,
  Swords,
  Users,
  CheckCircle2,
  Plus,
  Flame,
  Award,
  Clock,
  Sparkles,
  Shield,
  Layers,
  X,
} from "lucide-react";

export default function QuestVault() {
  const { awardXp, playAnvilChime, playBellSound } = useStoic();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [customQuests, setCustomQuests] = useState<Quest[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [showForgeModal, setShowForgeModal] = useState<boolean>(false);

  // New Custom Quest Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<QuestCategory>("Makerspace & Mechanical");
  const [newDifficulty, setNewDifficulty] = useState<"Initiate" | "Routine" | "Challenging" | "Boss" | "Legendary">("Boss");
  const [newTier, setNewTier] = useState<number>(4);
  const [newXp, setNewXp] = useState<number>(1500);
  const [newAttr, setNewAttr] = useState<"Strength" | "Endurance" | "Discipline" | "Knowledge" | "Recovery">("Knowledge");
  const [newEstTime, setNewEstTime] = useState("45 mins");
  const [newDesc, setNewDesc] = useState("");
  const [newSteps, setNewSteps] = useState<string[]>(["Step 1", "Step 2", "Step 3"]);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSteps = localStorage.getItem("stoic_checked_quest_steps");
      if (savedSteps) try { setCheckedSteps(JSON.parse(savedSteps)); } catch (e) {}
      const savedQuests = localStorage.getItem("stoic_completed_quests");
      if (savedQuests) try { setCompletedQuests(JSON.parse(savedQuests)); } catch (e) {}
      const savedCustom = localStorage.getItem("stoic_custom_quests");
      if (savedCustom) try { setCustomQuests(JSON.parse(savedCustom)); } catch (e) {}
    }
  }, []);

  const allQuests = [...PRELOADED_QUESTS, ...customQuests];

  const filteredQuests =
    activeCategory === "All"
      ? allQuests
      : allQuests.filter((q) => q.category === activeCategory);

  const toggleStep = (questId: string, stepIdx: number) => {
    playAnvilChime();
    const key = `${questId}-${stepIdx}`;
    setCheckedSteps((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_checked_quest_steps", JSON.stringify(next));
      }
      return next;
    });
  };

  const claimQuest = (quest: Quest) => {
    if (completedQuests[quest.id]) return;
    playBellSound();
    fireBrilliantConfetti();
    awardXp(quest.xpReward, `Conquered Quest: ${quest.title}`, quest.attributeTarget);
    setCompletedQuests((prev) => {
      const next = { ...prev, [quest.id]: true };
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_completed_quests", JSON.stringify(next));
      }
      return next;
    });
  };

  const handleCreateCustomQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newSteps.filter((s) => s.trim().length > 0).length === 0) return;

    const quest: Quest = {
      id: `custom-q-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      difficulty: newDifficulty,
      tier: newTier,
      xpReward: newXp,
      attributeTarget: newAttr,
      estimatedTime: newEstTime.trim() || "30 mins",
      description: newDesc.trim() || "Custom sovereign tactical challenge.",
      steps: newSteps.filter((s) => s.trim().length > 0),
    };

    const updated = [quest, ...customQuests];
    setCustomQuests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_custom_quests", JSON.stringify(updated));
    }

    setNewTitle("");
    setNewDesc("");
    setNewSteps(["Step 1", "Step 2", "Step 3"]);
    setShowForgeModal(false);
    playAnvilChime();
  };

  const getTierBadgeStyle = (tier: number) => {
    switch (tier) {
      case 5:
        return "bg-amber-950/80 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/50";
      case 4:
        return "bg-red-950/80 border-red-500 text-red-300 shadow-md shadow-red-950/40";
      case 3:
        return "bg-purple-950/80 border-purple-500 text-purple-300";
      case 2:
        return "bg-blue-950/80 border-blue-500 text-blue-300";
      default:
        return "bg-zinc-900 border-zinc-700 text-zinc-400";
    }
  };

  const categories: { label: string; value: string; icon: React.ReactNode }[] = [
    { label: "All Quests", value: "All", icon: <Layers className="w-3.5 h-3.5" /> },
    { label: "Makerspace & Auto", value: "Makerspace & Mechanical", icon: <Wrench className="w-3.5 h-3.5" /> },
    { label: "Home Fabrication", value: "Home Infrastructure & Fabrication", icon: <Home className="w-3.5 h-3.5" /> },
    { label: "AI & Systems", value: "AI Systems & Sovereign Tech", icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: "Athletics & Combat", value: "Combat Conditioning & Athletics", icon: <Swords className="w-3.5 h-3.5" /> },
    { label: "Fatherhood & Tribe", value: "Fatherhood & Tribe", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* HERO SECTION */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-base font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Sovereign Quest Vault &bull; Real-World Capability
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Tangible domestic, automotive, mechanical, combat, and private AI missions.
              Complete steps, forge self-reliance, and claim sovereign XP bounties.
            </p>
          </div>

          <button
            onClick={() => setShowForgeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 border border-amber-400/40 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Forge New Quest
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pt-2 border-t border-red-950/60">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shrink-0 border ${
                activeCategory === c.value
                  ? "bg-gradient-to-r from-red-900 to-amber-900 text-amber-300 border-amber-500/80 shadow"
                  : "bg-black/60 border-red-950/80 text-slate-400 hover:text-white"
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
              <span className="text-[10px] opacity-70">
                ({c.value === "All" ? allQuests.length : allQuests.filter((q) => q.category === c.value).length})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* QUESTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuests.map((quest) => {
          const isClaimed = !!completedQuests[quest.id];
          const totalSteps = quest.steps.length;
          const completedStepCount = quest.steps.reduce((acc, _, sIdx) => {
            return acc + (checkedSteps[`${quest.id}-${sIdx}`] ? 1 : 0);
          }, 0);
          const percentDone = Math.round((completedStepCount / totalSteps) * 100);
          const canClaim = completedStepCount === totalSteps && !isClaimed;

          return (
            <div
              key={quest.id}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 ${
                isClaimed
                  ? "bg-[#0A0E0A] border-emerald-900/60 shadow-lg"
                  : "bg-[#0A0A0F] border-red-950/80 hover:border-amber-500/40 shadow-xl"
              }`}
            >
              <div className="space-y-3">
                {/* Header with Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase border ${getTierBadgeStyle(quest.tier)}`}>
                        Tier {quest.tier} &bull; {quest.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {quest.estimatedTime}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-amber-400">
                        +{quest.xpReward} XP &bull; {quest.attributeTarget}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide pt-1">
                      {quest.title}
                    </h3>
                  </div>

                  {isClaimed && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold uppercase shrink-0 flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Conquered
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {quest.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      Progress: {completedStepCount}/{totalSteps} Steps
                    </span>
                    <span className={percentDone === 100 ? "text-emerald-400 font-bold" : "text-amber-400"}>
                      {percentDone}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-red-950/80">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isClaimed
                          ? "bg-emerald-500"
                          : percentDone === 100
                          ? "bg-amber-400 animate-pulse"
                          : "bg-gradient-to-r from-red-600 to-amber-500"
                      }`}
                      style={{ width: `${percentDone}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Steps */}
                <div className="space-y-2 pt-2 border-t border-red-950/60 font-mono text-xs">
                  {quest.steps.map((step, idx) => {
                    const isChecked = !!checkedSteps[`${quest.id}-${idx}`];
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition select-none ${
                          isChecked
                            ? "bg-white/[0.03] text-slate-400 line-through"
                            : "hover:bg-white/[0.05] text-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStep(quest.id, idx)}
                          className="mt-0.5 rounded border-red-950/80 text-amber-500 focus:ring-0 bg-black cursor-pointer"
                        />
                        <span className="text-[11px] leading-relaxed">{step}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Claim Bounty Button */}
              <div className="pt-2">
                <button
                  onClick={() => claimQuest(quest)}
                  disabled={!canClaim || isClaimed}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 border ${
                    isClaimed
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 cursor-default"
                      : canClaim
                      ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/30 animate-pulse cursor-pointer"
                      : "bg-black/60 text-slate-500 border-white/5 cursor-not-allowed"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {isClaimed
                    ? "Bounty Claimed (+XP Added)"
                    : canClaim
                    ? `Claim Bounty (+${quest.xpReward} XP)`
                    : `Complete All Steps (${completedStepCount}/${totalSteps})`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORGE CUSTOM QUEST MODAL */}
      {showForgeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0A0A0F] border border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-red-950/80 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm uppercase">Forge Custom Sovereign Quest</h3>
              </div>
              <button
                onClick={() => setShowForgeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomQuest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 uppercase font-bold block">Quest Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Garage Welding Table Fabrication"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 uppercase font-bold block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as QuestCategory)}
                    className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Makerspace & Mechanical">Makerspace & Mechanical</option>
                    <option value="Home Infrastructure & Fabrication">Home Infrastructure & Fabrication</option>
                    <option value="AI Systems & Sovereign Tech">AI Systems & Sovereign Tech</option>
                    <option value="Combat Conditioning & Athletics">Combat Conditioning & Athletics</option>
                    <option value="Fatherhood & Tribe">Fatherhood & Tribe</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 uppercase font-bold block">Difficulty Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => {
                      const t = parseInt(e.target.value);
                      setNewTier(t);
                      if (t === 5) { setNewDifficulty("Legendary"); setNewXp(3500); }
                      else if (t === 4) { setNewDifficulty("Boss"); setNewXp(1500); }
                      else if (t === 3) { setNewDifficulty("Challenging"); setNewXp(750); }
                      else if (t === 2) { setNewDifficulty("Routine"); setNewXp(300); }
                      else { setNewDifficulty("Initiate"); setNewXp(100); }
                    }}
                    className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value={1}>Tier 1 · Initiate (100 XP)</option>
                    <option value={2}>Tier 2 · Routine (300 XP)</option>
                    <option value={3}>Tier 3 · Challenging (750 XP)</option>
                    <option value={4}>Tier 4 · Boss (1,500 XP)</option>
                    <option value={5}>Tier 5 · Legendary (3,500 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 uppercase font-bold block">Attribute Target</label>
                  <select
                    value={newAttr}
                    onChange={(e) => setNewAttr(e.target.value as any)}
                    className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Strength">Strength (STR)</option>
                    <option value="Endurance">Endurance (END)</option>
                    <option value="Discipline">Discipline (DIS)</option>
                    <option value="Knowledge">Knowledge (KNO)</option>
                    <option value="Recovery">Recovery (REC)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 uppercase font-bold block">Est. Duration</label>
                  <input
                    type="text"
                    value={newEstTime}
                    onChange={(e) => setNewEstTime(e.target.value)}
                    placeholder="e.g. 45 mins"
                    className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 uppercase font-bold block">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Operational context and tangible outcome..."
                  className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 uppercase font-bold">Execution Steps</label>
                  <button
                    type="button"
                    onClick={() => setNewSteps([...newSteps, `Step ${newSteps.length + 1}`])}
                    className="text-amber-400 hover:text-amber-300 text-[10px] underline"
                  >
                    + Add Step
                  </button>
                </div>
                {newSteps.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-500 w-5 text-right">{idx + 1}.</span>
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => {
                        const copy = [...newSteps];
                        copy[idx] = e.target.value;
                        setNewSteps(copy);
                      }}
                      className="flex-1 bg-black border border-red-950/80 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none text-xs"
                    />
                    {newSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewSteps(newSteps.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 font-bold uppercase text-xs transition border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold uppercase text-xs transition shadow-lg shadow-amber-950"
                >
                  Save &amp; Forge Quest (+{newXp} XP Bounty)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
