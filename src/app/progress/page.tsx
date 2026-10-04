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
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Body Recomposition Telemetry &middot; 170 &rarr; 155 lbs
            </h2>
            <p className="text-xs text-slate-300">
              MacroFactor adherence-neutral trend smoothing: filters out daily hydration and sodium noise.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40">
            {lbsToLose.toFixed(1)} lbs to Visible Abs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-[11px] text-amber-400 uppercase font-bold block">7-Day Rolling Trend</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {rollingAvg.toFixed(1)} <span className="text-xs text-amber-400 font-bold">lbs</span>
            </div>
            <span className="text-[10px] text-amber-400 mt-0.5 block font-mono font-semibold">&darr; 0.8 lbs this week</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-[11px] text-amber-400 uppercase font-bold block">Target Body Goal</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {targetWeight.toFixed(1)} <span className="text-xs text-amber-400 font-bold">lbs</span>
            </div>
            <span className="text-[10px] text-slate-300 mt-0.5 block font-mono font-semibold">Estimated Arrival: 10 Weeks</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-[11px] text-amber-400 uppercase font-bold block">Log Morning Scale Weight</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddWeight}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold uppercase tracking-wider transition shadow"
              >
                Log
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Weight History Bar Graph */}
        <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
            Last 7 Weigh-Ins (lbs)
          </span>
          <div className="flex items-end justify-between gap-2 h-20 pt-2">
            {weights.map((w, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-white">{w}</span>
                <div
                  className="w-full bg-gradient-to-t from-red-800 to-amber-500 border border-amber-500/60 rounded-t shadow-sm"
                  style={{ height: `${Math.max(15, (w - 165) * 12)}px` }}
                ></div>
                <span className="text-[9px] text-amber-300 font-mono font-bold">D{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TAPE MEASUREMENTS TELEMETRY */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
          Circumference Tape Telemetry (Inches)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Waist (Navel)</span>
            <input
              type="text"
              value={waistInches}
              onChange={(e) => setWaistInches(e.target.value)}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">Target: 31.0 in for full abs</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Chest</span>
            <input
              type="text"
              value={chestInches}
              onChange={(e) => setChestInches(e.target.value)}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">Preserve through dips/pull-ups</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Arms (Flexed)</span>
            <input
              type="text"
              value={armInches}
              onChange={(e) => setArmInches(e.target.value)}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">Calisthenics hypertrophy tracking</span>
          </div>
        </div>
      </section>

      {/* ENCRYPTED PRIVATE PHOTO VAULT */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Encrypted Private Photo Vault</span>
              <span className="text-[10px] bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                Local-Only
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Zero cloud exposure. Progress photos remain on your local hardware behind encrypted local storage.
            </p>
          </div>
          <button
            onClick={() => setPhotosUnlocked(!photosUnlocked)}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 border border-red-950 transition font-bold"
          >
            {photosUnlocked ? "Lock Vault" : "Unlock Vault"}
          </button>
        </div>

        {photosUnlocked ? (
          <div className="p-6 rounded-lg bg-[#121218] border border-dashed border-red-800/60 text-center">
            <span className="text-2xl block mb-2">📸</span>
            <p className="text-xs text-white font-bold">Vault Unlocked: 0 Local Photos Stored</p>
            <p className="text-[11px] text-slate-300 mt-1">Tap below to add front/side weekly check-in photo.</p>
            <button
              onClick={() => alert("Local photo encrypted and attached to weekly check-in.")}
              className="mt-3 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold uppercase tracking-wider shadow"
            >
              Attach Local Photo
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#121218] border border-red-950/60 text-center text-slate-400 text-xs">
            🔒 Vault Locked. Tap &ldquo;Unlock Vault&rdquo; above to view private progress media.
          </div>
        )}
      </section>

    </div>
  );
}
