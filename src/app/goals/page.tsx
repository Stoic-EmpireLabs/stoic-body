"use client";

import React, { useState } from "react";
import { useStoic, WeeklyGoal, LifeGoal } from "@/context/StoicContext";

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
  const [category, setCategory] = useState<"Physical" | "Consulting" | "DBA" | "Recovery" | "Family">("Physical");
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

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Goals &amp; Weekly Targets Hub</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Weekly Quotas &bull; Strategic Life Milestones
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set and track your weekly cadence quotas, habit targets, and long-term milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-2"
        >
          <span>+</span> Add New Goal
        </button>
      </section>

      {/* WEEKLY GOALS MATRIX */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#232636] pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Weekly Targets &amp; Quotas</span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                This Week: Oct 4 &ndash; Oct 10
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click &ldquo;+1 Log&rdquo; each time you complete a repetition or session.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
            {weeklyGoals.filter((g) => g.currentCount >= g.targetCount).length} / {weeklyGoals.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {weeklyGoals.map((goal) => {
            const isComplete = goal.currentCount >= goal.targetCount;
            const progressPct = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isComplete
                    ? "bg-[#141A18] border-emerald-500/40"
                    : "bg-[#181924] border-[#232636] hover:border-slate-500"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {goal.category}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-100 mt-1.5 leading-snug">
                        {goal.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      +{goal.xpReward} XP
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Progress: {goal.currentCount} / {goal.targetCount}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isComplete ? "bg-emerald-400" : "bg-amber-500"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#232636] flex items-center justify-between">
                  {isComplete ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      ✓ Weekly Quota Conquered!
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      {goal.targetCount - goal.currentCount} remaining this week
                    </span>
                  )}

                  <button
                    onClick={() => incrementWeeklyGoal(goal.id)}
                    disabled={isComplete}
                    className={`px-3 py-1 rounded text-xs font-bold font-mono transition ${
                      isComplete
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-400 text-black shadow"
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
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-[#232636] pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Strategic Life Goals &amp; Long-Term Milestones
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Major transformation objectives with phased milestones and heavy XP rewards.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {lifeGoals.filter((g) => g.completed).length} / {lifeGoals.length} Conquered
          </span>
        </div>

        <div className="space-y-3">
          {lifeGoals.map((lg) => (
            <div
              key={lg.id}
              onClick={() => toggleLifeGoal(lg.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                lg.completed
                  ? "bg-[#141A18] border-emerald-500/40 opacity-80"
                  : "bg-[#181924] border-[#232636] hover:border-amber-500/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    lg.completed ? "bg-emerald-500 text-black" : "border border-slate-600"
                  }`}
                >
                  {lg.completed && "✓"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {lg.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Target Date: {lg.targetDate}
                    </span>
                  </div>
                  <h4
                    className={`text-sm font-semibold mt-1 ${
                      lg.completed ? "line-through text-slate-500" : "text-slate-100"
                    }`}
                  >
                    {lg.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {lg.milestones.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400"
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
                <div className="text-[10px] text-slate-500 mt-1">
                  {lg.completed ? "Completed" : "Click to Complete"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CREATE GOAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13141C] border border-[#232636] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#232636] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
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
              {/* GOAL TYPE TOGGLE */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                  Goal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGoalType("weekly")}
                    className={`py-2 rounded font-semibold transition border ${
                      goalType === "weekly"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500"
                        : "bg-[#181924] border-[#232636] text-slate-400"
                    }`}
                  >
                    Weekly Target Quota
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalType("life")}
                    className={`py-2 rounded font-semibold transition border ${
                      goalType === "life"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500"
                        : "bg-[#181924] border-[#232636] text-slate-400"
                    }`}
                  >
                    Strategic Life Milestone
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    goalType === "weekly"
                      ? "e.g. 4 Calisthenics Sessions / 5 Business Pitches"
                      : "e.g. Reach 155 lbs baseline / Close $10k AI retainer"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Physical">Physical (Calisthenics/Boxing)</option>
                    <option value="Consulting">Consulting (Fiverr / Local)</option>
                    <option value="DBA">Doctoral DBA Research</option>
                    <option value="Recovery">Recovery (OMAD / Fasting)</option>
                    <option value="Family">Family Sanctuary (Cheer/Weekend)</option>
                  </select>
                </div>

                {goalType === "weekly" ? (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                      Weekly Target Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={targetCount}
                      onChange={(e) => setTargetCount(e.target.value)}
                      className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                  Completion XP Reward
                </label>
                <select
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="500">+500 XP (Minor Milestone)</option>
                  <option value="1000">+1,000 XP (Standard Weekly Quota)</option>
                  <option value="1500">+1,500 XP (Major Target)</option>
                  <option value="2500">+2,500 XP (Consulting Retainer Bounty)</option>
                  <option value="5000">+5,000 XP (Epic Milestone: 155 lbs)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#232636]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition"
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
