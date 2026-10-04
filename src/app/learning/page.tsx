"use client";

import React, { useState } from "react";
import {
  FOUNDER_LEARNING_PATHWAYS,
  calculatePathwayProgress,
  calculateNextReviewDate,
  LearningPathway,
} from "@/lib/learning";

export default function LearningPage() {
  const [pathways, setPathways] = useState<LearningPathway[]>(FOUNDER_LEARNING_PATHWAYS);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>("mustang_oil_change");

  const currentPathway = pathways.find((p) => p.id === selectedPathwayId) || pathways[0];
  const progress = calculatePathwayProgress(currentPathway);

  const toggleStep = (stepId: string) => {
    setPathways((prev) =>
      prev.map((pw) => {
        if (pw.id !== currentPathway.id) return pw;
        return {
          ...pw,
          steps: pw.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)),
        };
      })
    );
  };

  const nextReview = calculateNextReviewDate(new Date(), currentPathway.reviewIntervalLevel);

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Deconstructed Learning Curricula</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Prerequisite &rarr; Milestone &rarr; Review
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Master real-world mechanics, fatherhood athleticism, home fabrication, and AI consulting with verified guides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Next Spaced Review:</span>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
            {nextReview.toISOString().split("T")[0]} (Interval Lvl {currentPathway.reviewIntervalLevel})
          </span>
        </div>
      </section>

      {/* PATHWAY SELECTOR PILLS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pathways.map((pw) => {
          const isSelected = pw.id === selectedPathwayId;
          const pwProgress = calculatePathwayProgress(pw);
          return (
            <button
              key={pw.id}
              onClick={() => setSelectedPathwayId(pw.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition border flex items-center gap-2 ${
                isSelected
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                  : "bg-[#13141C] text-slate-400 border-[#232636] hover:text-slate-200"
              }`}
            >
              <span>{pw.title.split("—")[0].split("DIY")[0]}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {pwProgress.percentage}%
              </span>
            </button>
          );
        })}
      </div>

      {/* SELECTED PATHWAY DETAIL */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-6 shadow-lg space-y-6">

        {/* TITLE & PROGRESS BAR */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Category: {currentPathway.category.replace("_", " ")}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-2">{currentPathway.title}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{currentPathway.description}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-black text-amber-400">{progress.percentage}%</span>
              <div className="text-[11px] text-slate-400 font-mono">
                {progress.completedSteps} / {progress.totalSteps} Steps Complete
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* PREREQUISITES AUDIT */}
        <div className="bg-[#181924] border border-[#232636] rounded-lg p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Tooling & Safety Prerequisites
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentPathway.prerequisites.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{req.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP-BY-STEP DECONSTRUCTED CHECKLIST */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Milestone Steps with Time Estimates
          </h4>
          <div className="space-y-2.5">
            {currentPathway.steps.map((step, idx) => (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between gap-4 ${
                  step.completed
                    ? "bg-slate-900/60 border-emerald-500/30 text-slate-400"
                    : "bg-[#1C1E2B] border-[#232636] hover:border-amber-500/40 text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                      step.completed ? "bg-emerald-500 text-black" : "border border-slate-600"
                    }`}
                  >
                    {step.completed && "✓"}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-500 mr-2">Step {idx + 1}</span>
                    <span className={`text-sm ${step.completed ? "line-through text-slate-500" : "font-medium"}`}>
                      {step.title}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                  {step.estimatedMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* VERIFIED RESOURCES */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Verified Documentation & Manuals
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentPathway.verifiedResources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg bg-[#181924] border border-[#232636] hover:border-amber-500/40 text-xs flex items-center justify-between group transition"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-amber-400 transition">
                    {res.title}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">Type: {res.type.replace("_", " ")}</div>
                </div>
                <span className="text-slate-500 group-hover:text-amber-400 text-sm">↗</span>
              </a>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
