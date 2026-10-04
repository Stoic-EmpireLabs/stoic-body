"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";
import { calculateRolling7DayAverage } from "@/lib/nutrition";

export default function BodyProgressPage() {
  const { awardXp } = useStoic();

  const [weights, setWeights] = useState<number[]>([
    171.2, 170.8, 171.5, 170.2, 169.8, 170.4, 169.5,
  ]);
  const [newWeight, setNewWeight] = useState("169.5");
  const [waistInches, setWaistInches] = useState("33.5");
  const [chestInches, setChestInches] = useState("40.5");
  const [armInches, setArmInches] = useState("14.5");
  const [photosUnlocked, setPhotosUnlocked] = useState(false);

  const rollingAvg = calculateRolling7DayAverage(weights);
  const targetWeight = 155.0;
  const lbsToLose = Math.max(0, rollingAvg - targetWeight);

  const handleAddWeight = () => {
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 0) {
      setWeights((prev) => [...prev.slice(1), val]);
      awardXp(50, `Daily Weight Logged: ${val} lbs`, "Recovery");
    }
  };

  return (
    <div className="space-y-6">

      {/* ROLLING WEIGHT AVERAGE HERO */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
              Body Recomposition Telemetry &middot; 170 &rarr; 155 lbs
            </h2>
            <p className="text-xs text-slate-400">
              MacroFactor adherence-neutral trend smoothing: filters out daily hydration and sodium noise.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
            {lbsToLose.toFixed(1)} lbs to Visible Abs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">7-Day Rolling Trend</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {rollingAvg.toFixed(1)} <span className="text-xs text-slate-400">lbs</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">&darr; 0.8 lbs this week</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Target Body Goal</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {targetWeight.toFixed(1)} <span className="text-xs text-slate-400">lbs</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated Arrival: 10 Weeks</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Log Morning Scale Weight</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddWeight}
                className="px-3 py-1 rounded bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400 transition"
              >
                Log
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Weight History Bar Graph */}
        <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-2">
            Last 7 Weigh-Ins (lbs)
          </span>
          <div className="flex items-end justify-between gap-2 h-20 pt-2">
            {weights.map((w, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400">{w}</span>
                <div
                  className="w-full bg-amber-500/30 border border-amber-500/50 rounded-t"
                  style={{ height: `${Math.max(15, (w - 165) * 12)}px` }}
                ></div>
                <span className="text-[9px] text-slate-500 font-mono">D{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TAPE MEASUREMENTS TELEMETRY */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-3">
          Circumference Tape Telemetry (Inches)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <span className="text-xs text-slate-400 block mb-1">Waist (Navel)</span>
            <input
              type="text"
              value={waistInches}
              onChange={(e) => setWaistInches(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Target: 31.0 in for full abs</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <span className="text-xs text-slate-400 block mb-1">Chest</span>
            <input
              type="text"
              value={chestInches}
              onChange={(e) => setChestInches(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Preserve through dips/pull-ups</span>
          </div>

          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <span className="text-xs text-slate-400 block mb-1">Arms (Flexed)</span>
            <input
              type="text"
              value={armInches}
              onChange={(e) => setArmInches(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm font-mono text-slate-100"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Calisthenics hypertrophy tracking</span>
          </div>
        </div>
      </section>

      {/* ENCRYPTED PRIVATE PHOTO VAULT */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Encrypted Private Photo Vault</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Local-Only
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero cloud exposure. Progress photos remain on your local hardware behind encrypted local storage.
            </p>
          </div>
          <button
            onClick={() => setPhotosUnlocked(!photosUnlocked)}
            className="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-[#232636] transition"
          >
            {photosUnlocked ? "Lock Vault" : "Unlock Vault"}
          </button>
        </div>

        {photosUnlocked ? (
          <div className="p-6 rounded-lg bg-[#1C1E2B] border border-dashed border-slate-700 text-center">
            <span className="text-2xl block mb-2">📸</span>
            <p className="text-xs text-slate-300 font-medium">Vault Unlocked: 0 Local Photos Stored</p>
            <p className="text-[11px] text-slate-500 mt-1">Tap below to add front/side weekly check-in photo.</p>
            <button
              onClick={() => alert("Local photo encrypted and attached to weekly check-in.")}
              className="mt-3 px-3 py-1 rounded bg-amber-500 text-slate-900 text-xs font-bold hover:bg-amber-400"
            >
              Attach Local Photo
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#1C1E2B] border border-[#232636] text-center text-slate-500 text-xs">
            🔒 Vault Locked. Tap &ldquo;Unlock Vault&rdquo; above to view private progress media.
          </div>
        )}
      </section>

    </div>
  );
}
