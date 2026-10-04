"use client";

import React, { useState } from "react";
import { calculateBufferMinutes, detectScheduleOverflow, ScheduledTask } from "@/lib/scheduling";

export default function CalendarPage() {
  const [mvdActive, setMvdActive] = useState(false);

  const baseTasks: ScheduledTask[] = [
    { id: "1", title: "Morning Anchor (Water, Calisthenics, Treadmill)", durationMinutes: mvdActive ? 25 : 65, priorityTier: 1 },
    { id: "2", title: "Stoic Consulting: Client Acquisition & Fiverr", durationMinutes: mvdActive ? 90 : 120, priorityTier: 2 },
    { id: "3", title: "DBA Doctoral Research: Assignment Resubmission", durationMinutes: mvdActive ? 60 : 96, priorityTier: 2 },
    { id: "4", title: "Ultron LLM: Skill Indexing & Private Weights", durationMinutes: 60, priorityTier: 3 },
    { id: "5", title: "23:1 OMAD Feeding Window (140g Protein)", durationMinutes: 60, priorityTier: 1 },
    { id: "6", title: "Evening Stoic Reflection & Daily XP Seal", durationMinutes: 15, priorityTier: 1 },
  ];

  const audit = detectScheduleOverflow(baseTasks, "05:30", "22:00");

  return (
    <div className="space-y-6">

      {/* CALENDAR CONTROLS & MVD SWITCH */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Unified Temporal Calendar</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Structured Timeline + Buffer Engine
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Waking Allocation: 05:30 AM &ndash; 10:00 PM (16.5 Hours &middot; 990 Minutes)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMvdActive(!mvdActive)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
              mvdActive
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-slate-800 text-slate-300 border-[#232636] hover:bg-slate-700"
            }`}
          >
            {mvdActive ? "⚡ MVD ACTIVE (COMPRESSED)" : "Activate Minimum Viable Day"}
          </button>
        </div>
      </section>

      {/* SCHEDULE AUDIT CARD */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-4 shadow-lg flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400">Total Commitment (Tasks + Buffers): </span>
          <strong className="text-slate-100 font-mono">{audit.totalCommitmentMinutes} mins</strong>
          <span className="text-slate-500 mx-2">&bull;</span>
          <span className="text-slate-400">Available: </span>
          <strong className="text-emerald-400 font-mono">{audit.availableWakingMinutes} mins</strong>
        </div>
        <span
          className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[11px] ${
            audit.hasOverflow
              ? "bg-red-500/10 text-red-400 border border-red-500/30"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {audit.hasOverflow ? `Overflow: +${audit.overflowMinutes}m` : "Conflict-Free Balance"}
        </span>
      </section>

      {/* VERTICAL CHRONOLOGICAL TIME BLOCKS */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
          Today's Scheduled Sequence with Transitional Buffers
        </h3>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#232636]">
          {baseTasks.map((task, idx) => {
            const buffer = calculateBufferMinutes(task.durationMinutes);
            return (
              <React.Fragment key={task.id}>
                {/* Task Card */}
                <div className="relative pl-8">
                  <span className="absolute left-2 top-3 w-2.5 h-2.5 rounded-full bg-amber-500 -translate-x-1/2 ring-4 ring-[#13141C]"></span>
                  <div className="bg-[#1C1E2B] border border-[#232636] p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-semibold text-slate-300">
                        Block {idx + 1} &middot; {task.durationMinutes} Minutes
                      </div>
                      <h4 className="text-sm font-medium text-slate-100">{task.title}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      Tier {task.priorityTier}
                    </span>
                  </div>
                </div>

                {/* Buffer Spacer */}
                {idx < baseTasks.length - 1 && (
                  <div className="relative pl-8">
                    <span className="absolute left-2 top-2 w-1.5 h-1.5 rounded-full bg-slate-600 -translate-x-1/2"></span>
                    <div className="bg-slate-900/50 border border-dashed border-slate-700/50 px-3 py-1.5 rounded text-[11px] text-slate-400 flex items-center justify-between">
                      <span>&cudarrr; {buffer}-Min Protective Transition Buffer</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        Bi = max(15, 0.20 &times; {task.durationMinutes})
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

    </div>
  );
}
