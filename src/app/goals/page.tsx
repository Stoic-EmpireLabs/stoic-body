"use client";

import React, { useState } from "react";
import { useStoic, WeeklyGoal, LifeGoal } from "@/context/StoicContext";
import GoalCountdownHero from "@/components/GoalCountdownHero";

export default function GoalsPage() {
  const {
    weeklyGoals,
    lifeGoals,
    addWeeklyGoal,
    incrementWeeklyGoal,
    addLifeGoal,
    toggleLifeGoal,
  } = useStoic();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [goalType, setGoalType] = useState<"weekly" | "life">("weekly");

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Physical" | "Consulting" | "DBA" | "Recovery" | "Family" | "Intellect">("Physical");
  const [targetCount, setTargetCount] = useState("5");
  const [targetDate, setTargetDate] = useState("2026-11-30");
  const [xpReward, setXpReward] = useState("1000");

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (goalType === "weekly") {
      addWeeklyGoal({
        title: title.trim(),
        targetCount: parseInt(targetCount) || 5,
        category,
        xpReward: parseInt(xpReward) || 1000,
      });
    } else {
      addLifeGoal({
        title: title.trim(),
        category,
        targetDate,
        milestones: ["Initiate Execution", "Overcome Intermediate Friction", "Final Mastery"],
        xpReward: parseInt(xpReward) || 3500,
      });
    }

    setTitle("");
    setShowAddModal(false);
  };

  // Distinct category styling (Black, Red, Gold theme + differentiated goal colors)
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "Physical":
        return {
          cardBg: "bg-[#10080A]",
          border: "border-red-600/40 hover:border-red-500",
          tag: "bg-red-600 text-white font-bold",
          bar: "bg-red-500",
          xpText: "text-red-400",
        };
      case "Consulting":
        return {
          cardBg: "bg-[#110E07]",
          border: "border-amber-500/40 hover:border-amber-400",
          tag: "bg-amber-500 text-black font-bold",
          bar: "bg-amber-400",
          xpText: "text-amber-400",
        };
      case "DBA":
        return {
          cardBg: "bg-[#090C14]",
          border: "border-blue-600/40 hover:border-blue-400",
          tag: "bg-blue-600 text-white font-bold",
          bar: "bg-blue-400",
          xpText: "text-blue-400",
        };
      case "Recovery":
        return {
          cardBg: "bg-[#08120D]",
          border: "border-emerald-600/40 hover:border-emerald-400",
          tag: "bg-emerald-600 text-white font-bold",
          bar: "bg-emerald-400",
          xpText: "text-emerald-400",
        };
      case "Intellect":
        return {
          cardBg: "bg-[#100B1A]",
          border: "border-purple-600/40 hover:border-purple-400",
          tag: "bg-purple-600 text-white font-bold",
          bar: "bg-purple-400",
          xpText: "text-purple-300",
        };
      case "Family":
      default:
        return {
          cardBg: "bg-[#12080E]",
          border: "border-rose-600/40 hover:border-rose-400",
          tag: "bg-rose-600 text-white font-bold",
          bar: "bg-rose-400",
          xpText: "text-rose-400",
        };
    }
  };

  return (
    <div className="space-y-6">

      {/* 2026 LIVE GOAL COUNTDOWN & ROADMAP */}
      <GoalCountdownHero />

      {/* HEADER SECTION (2026 Liquid Obsidian Glassmorphism) */}
      <section className="bg-gradient-to-b from-zinc-950/80 via-black/90 to-zinc-950/80 backdrop-blur-2xl border border-white/10 ring-1 ring-amber-500/20 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Goals &amp; Weekly Targets Hub</span>
            <span className="text-[10px] bg-red-950/70 text-red-300 px-2 py-0.5 rounded border border-red-600/40 font-bold font-mono">
              Weekly Quotas &bull; Strategic Milestones
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Calibrated multi-week progress tracking with precision deficit and sovereign execution milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase font-mono tracking-wider transition shadow-lg shadow-amber-950/50 flex items-center gap-2 shrink-0"
        >
          <span>+</span> Add New Goal
        </button>
      </section>

      {/* WEEKLY GOALS MATRIX */}
      <section className="bg-[#0B0B0F] border border-red-950/80 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-red-950/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Weekly Targets &amp; Quotas</span>
              <span className="text-xs font-mono text-amber-400 bg-[#16161D] px-2 py-0.5 rounded border border-amber-500/20">
                This Week: Oct 4 &ndash; Oct 10
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Click &ldquo;+1 Log Progress&rdquo; each time you execute a repetition or block.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 font-bold">
            {weeklyGoals.filter((g) => g.currentCount >= g.targetCount).length} / {weeklyGoals.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {weeklyGoals.map((goal) => {
            const isComplete = goal.currentCount >= goal.targetCount;
            const progressPct = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
            const style = getCategoryStyles(goal.category);

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${style.cardBg} ${
                  isComplete ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${style.tag}`}>
                        {goal.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2 leading-snug">
                        {goal.title}
                      </h4>
                    </div>
                    <span className={`text-xs font-mono font-bold ${style.xpText} shrink-0`}>
                      +{goal.xpReward} XP
                    </span>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex justify-between text-xs font-mono text-white mb-1.5">
                      <span>Progress: <strong className="text-amber-400">{goal.currentCount}</strong> / {goal.targetCount}</span>
                      <span className="font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-black/80 h-2.5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isComplete ? "bg-emerald-400" : style.bar
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  {isComplete ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      ✓ Weekly Quota Conquered!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300 font-mono">
                      {goal.targetCount - goal.currentCount} remaining this week
                    </span>
                  )}

                  <button
                    onClick={() => incrementWeeklyGoal(goal.id)}
                    disabled={isComplete}
                    className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition ${
                      isComplete
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-950/30"
                    }`}
                  >
                    +1 Log Progress
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STRATEGIC LIFE MILESTONES */}
      <section className="bg-[#0B0B0F] border border-red-950/80 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-red-950/60 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Strategic Life Goals &amp; Long-Term Milestones
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Phased transformation milestones with heavy prestige rewards.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            {lifeGoals.filter((g) => g.completed).length} / {lifeGoals.length} Conquered
          </span>
        </div>

        <div className="space-y-3">
          {lifeGoals.map((lg) => {
            const style = getCategoryStyles(lg.category);
            return (
              <div
                key={lg.id}
                onClick={() => toggleLifeGoal(lg.id)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  style.cardBg
                } ${lg.completed ? "border-emerald-500/50 opacity-70" : style.border}`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      lg.completed ? "bg-emerald-500 text-black" : "border border-zinc-600 bg-black"
                    }`}
                  >
                    {lg.completed && "✓"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${style.tag}`}>
                        {lg.category}
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        Target Date: <strong className="text-white">{lg.targetDate}</strong>
                      </span>
                    </div>
                    <h4
                      className={`text-sm font-bold mt-1.5 ${
                        lg.completed ? "line-through text-zinc-500" : "text-white"
                      }`}
                    >
                      {lg.title}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lg.milestones.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-black/60 border border-white/10 px-2 py-0.5 rounded text-slate-200"
                        >
                          &bull; {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    +{lg.xpReward} XP
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {lg.completed ? "Completed" : "Click to Complete"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CREATE GOAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0B0F] border border-red-600/50 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-red-950/60 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Define New Goal
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                  Goal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGoalType("weekly")}
                    className={`py-2 rounded font-semibold transition border ${
                      goalType === "weekly"
                        ? "bg-red-950/40 text-red-300 border-red-500 font-bold"
                        : "bg-[#14141A] border-zinc-800 text-slate-300"
                    }`}
                  >
                    Weekly Target Quota
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalType("life")}
                    className={`py-2 rounded font-semibold transition border ${
                      goalType === "life"
                        ? "bg-amber-950/40 text-amber-300 border-amber-500 font-bold"
                        : "bg-[#14141A] border-zinc-800 text-slate-300"
                    }`}
                  >
                    Strategic Life Milestone
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    goalType === "weekly"
                      ? "e.g. 5 Calisthenics Sessions / 5 Business Pitches"
                      : "e.g. Reach 155 lbs baseline / Close $10k AI retainer"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#14141A] border border-red-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#14141A] border border-red-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Physical">Physical (Red Accent)</option>
                    <option value="Consulting">Consulting (Gold Accent)</option>
                    <option value="DBA">Doctoral DBA (Blue Accent)</option>
                    <option value="Recovery">Recovery (Emerald Accent)</option>
                    <option value="Family">Family Sanctuary (Rose Accent)</option>
                    <option value="Intellect">Intellect / AI Mastery (Purple Accent)</option>
                  </select>
                </div>

                {goalType === "weekly" ? (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                      Weekly Target Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={targetCount}
                      onChange={(e) => setTargetCount(e.target.value)}
                      className="w-full bg-[#14141A] border border-red-950 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-[#14141A] border border-red-950 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                  Completion XP Reward
                </label>
                <select
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="w-full bg-[#14141A] border border-red-950 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="500">+500 XP (Minor Target)</option>
                  <option value="1000">+1,000 XP (Standard Weekly Quota)</option>
                  <option value="1500">+1,500 XP (High Discipline Target)</option>
                  <option value="2500">+2,500 XP (Consulting Retainer Bounty)</option>
                  <option value="5000">+5,000 XP (Epic Milestone: 155 lbs)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-red-950/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded bg-zinc-800 text-slate-200 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition shadow"
                >
                  Commit Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
