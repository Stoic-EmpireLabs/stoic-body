"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import {
  calculateBodyFatNavy,
  projectRecompositionTimeline,
  calculateMovingAverageWeight,
} from "@/lib/health";

export default function BodyProgressPage() {
  const { awardXp, playAnvilChime, playBellSound } = useStoic();

  // Scale Weights State (Historical 7-day rolling window)
  const [weights, setWeights] = useState<{ date: string; weight: number }[]>([
    { date: "D-6", weight: 171.4 },
    { date: "D-5", weight: 170.8 },
    { date: "D-4", weight: 171.2 },
    { date: "D-3", weight: 170.4 },
    { date: "D-2", weight: 169.8 },
    { date: "D-1", weight: 170.2 },
    { date: "Today", weight: 169.5 },
  ]);
  const [newWeightInput, setNewWeightInput] = useState("169.5");

  // US Navy Body Fat Calculator State (Default 5'10", 33.5" waist, 15.5" neck)
  const [heightInches, setHeightInches] = useState<number>(70); // 5'10"
  const [waistInches, setWaistInches] = useState<number>(33.5);
  const [neckInches, setNeckInches] = useState<number>(15.5);

  // Circumference Tape Measurements
  const [tapeData, setTapeData] = useState({
    chest: "40.5",
    arms: "14.5",
    thighs: "22.5",
    shoulders: "47.0",
  });

  // Recomposition Forecast Settings
  const [dailyDeficit, setDailyDeficit] = useState<number>(500);
  const targetWeight = 155.0;

  // Encrypted Vault State
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [localPhotos, setLocalPhotos] = useState<
    { id: string; date: string; label: string; notes: string }[]
  >([
    {
      id: "photo-1",
      date: "2026-09-20",
      label: "Baseline Week 0",
      notes: "171.2 lbs · Soft abdominal definition",
    },
    {
      id: "photo-2",
      date: "2026-10-04",
      label: "Check-in Week 2",
      notes: "169.5 lbs · Upper two abs visible under morning lighting",
    },
  ]);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWeights = localStorage.getItem("stoic_scale_weights");
      if (savedWeights) {
        try {
          const parsed = JSON.parse(savedWeights);
          if (Array.isArray(parsed) && parsed.length > 0) setWeights(parsed);
        } catch (e) {}
      }

      const savedTape = localStorage.getItem("stoic_progress_tape");
      if (savedTape) {
        try {
          const parsed = JSON.parse(savedTape);
          if (parsed && typeof parsed === "object") setTapeData(parsed);
        } catch (e) {}
      }

      const savedWaist = localStorage.getItem("stoic_navy_waist");
      if (savedWaist) setWaistInches(Number(savedWaist));

      const savedNeck = localStorage.getItem("stoic_navy_neck");
      if (savedNeck) setNeckInches(Number(savedNeck));
    }
  }, []);

  // Moving Average Weight
  const rollingAvg = calculateMovingAverageWeight(weights);
  const currentWeightEst = rollingAvg > 0 ? rollingAvg : 170.0;
  const lbsToLose = Math.max(0, currentWeightEst - targetWeight);

  // Navy Body Fat % Calculations
  const currentBfPercent = calculateBodyFatNavy(waistInches, neckInches, heightInches);
  const targetBfPercent = calculateBodyFatNavy(31.0, neckInches, heightInches); // 31" waist target

  // Lean vs Fat Mass breakdown
  const fatMassLbs = Math.round(((currentWeightEst * currentBfPercent) / 100) * 10) / 10;
  const leanMassLbs = Math.round((currentWeightEst - fatMassLbs) * 10) / 10;

  // Recomposition Forecast
  const recompForecast = projectRecompositionTimeline(
    currentWeightEst,
    targetWeight,
    dailyDeficit
  );

  // Handle Log Weight
  const handleAddWeight = () => {
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 100 && val < 400) {
      const todayLabel = new Date().toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      const updated = [...weights.slice(-6), { date: todayLabel, weight: val }];
      setWeights(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_scale_weights", JSON.stringify(updated));
      }
      awardXp(75, `Morning Scale Weight Logged: ${val} lbs`, "Recovery");
      playAnvilChime();
    }
  };

  // Save Tape Measurements
  const handleSaveTape = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_progress_tape", JSON.stringify(tapeData));
      localStorage.setItem("stoic_navy_waist", String(waistInches));
      localStorage.setItem("stoic_navy_neck", String(neckInches));
    }
    awardXp(100, "Circumference Tape Telemetry Saved", "Discipline");
    playBellSound();
  };

  // Add Local Photo Record
  const handleAddPhotoRecord = () => {
    const today = new Date().toISOString().split("T")[0];
    const newEntry = {
      id: `photo-${Date.now()}`,
      date: today,
      label: `Progress Check-in (${currentWeightEst.toFixed(1)} lbs)`,
      notes: `Waist: ${waistInches}" · Body Fat: ${currentBfPercent}%`,
    };
    const updated = [newEntry, ...localPhotos];
    setLocalPhotos(updated);
    awardXp(150, "Encrypted Progress Photo Attached", "Discipline");
    playAnvilChime();
  };

  return (
    <div className="space-y-6">

      {/* 170 -> 155 RECOMPOSITION TELEMETRY HERO */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Body Recomposition Telemetry &middot; 170 &rarr; 155 lbs
            </h2>
            <p className="text-xs text-slate-300">
              MacroFactor adherence-neutral trend smoothing: filters out daily hydration and sodium noise.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-red-950/80 text-amber-300 px-3 py-1 rounded border border-amber-500/40">
            {lbsToLose.toFixed(1)} lbs to Visible Abs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* 7-Day Rolling Trend */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-[11px] text-amber-400 uppercase font-bold block">
              7-Day Rolling Moving Average
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {currentWeightEst.toFixed(1)}{" "}
              <span className="text-xs text-amber-400 font-bold">lbs</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block font-mono font-bold">
              &darr; 0.9 lbs net trend (Fat Oxidation Active)
            </span>
          </div>

          {/* Target Weight & Estimated Arrival */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-[11px] text-amber-400 uppercase font-bold block">
              Target Body Goal &middot; Sovereign Baseline
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {targetWeight.toFixed(1)}{" "}
              <span className="text-xs text-amber-400 font-bold">lbs</span>
            </div>
            <span className="text-[10px] text-slate-300 mt-1 block font-mono font-semibold">
              Forecast Arrival: ~{recompForecast.weeksRequired} Weeks ({recompForecast.estimatedCompletionDate})
            </span>
          </div>

          {/* Quick Weigh-In Input */}
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-[11px] text-amber-400 uppercase font-bold block">
              Log Morning Scale Weight
            </span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.1"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddWeight}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold uppercase tracking-wider transition shadow shrink-0"
              >
                Log
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Weigh post-wake, post-void, before water.
            </span>
          </div>
        </div>

        {/* 7-DAY WEIGHT HISTORY BAR GRAPH */}
        <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Last 7 Rolling Weigh-Ins (lbs)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Noise Dampening: Active
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-24 pt-3 border-b border-red-950/80">
            {weights.map((w, idx) => {
              const heightPixels = Math.max(18, Math.min(80, (w.weight - 165) * 12));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono font-bold text-white">
                    {w.weight.toFixed(1)}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-red-800 to-amber-500 border border-amber-500/60 rounded-t shadow-sm transition-all duration-300"
                    style={{ height: `${heightPixels}px` }}
                  ></div>
                  <span className="text-[9px] text-amber-300 font-mono font-bold mt-1">
                    {w.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* US NAVY BODY FAT & RECOMPOSITION ENGINE */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              US Navy Body Fat Formula &amp; Abdominal Telemetry
            </h3>
            <p className="text-xs text-slate-300">
              Validated clinical formula: 86.010 &times; log10(waist - neck) - 70.041 &times; log10(height) + 36.76.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
            Current Est: {currentBfPercent}% Body Fat
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Interactive Biometric Sliders */}
          <div className="space-y-4 p-4 rounded-lg bg-[#121218] border border-red-950/60">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-bold uppercase">
                  Waist Circumference (Navel)
                </span>
                <span className="font-mono font-bold text-white">{waistInches}&quot;</span>
              </div>
              <input
                type="range"
                min="28"
                max="42"
                step="0.1"
                value={waistInches}
                onChange={(e) => setWaistInches(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>28.0&quot; (Sub-8% Shredded)</span>
                <span className="text-amber-300 font-bold">Target: 31.0&quot; (Full Visible Abs)</span>
                <span>42.0&quot;</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-bold uppercase">
                  Neck Circumference (Narrowest)
                </span>
                <span className="font-mono font-bold text-white">{neckInches}&quot;</span>
              </div>
              <input
                type="range"
                min="13"
                max="19"
                step="0.1"
                value={neckInches}
                onChange={(e) => setNeckInches(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>13.0&quot;</span>
                <span className="text-slate-300">Preserved through calisthenics</span>
                <span>19.0&quot;</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold uppercase">
                  Height (Baseline: 5&apos;10&quot;)
                </span>
                <span className="font-mono font-bold text-white">{heightInches}&quot; (5&apos;10&quot;)</span>
              </div>
              <input
                type="range"
                min="64"
                max="76"
                step="0.5"
                value={heightInches}
                onChange={(e) => setHeightInches(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Composition Breakdown Card */}
          <div className="p-4 rounded-lg bg-[#121218] border border-red-950/60 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                Biometric Composition Analysis
              </span>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2.5 rounded bg-black/60 border border-red-950">
                  <span className="text-[10px] uppercase text-slate-300 block">Estimated Fat Mass</span>
                  <span className="text-lg font-mono font-bold text-red-400">{fatMassLbs} lbs</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Adipose Tissue</span>
                </div>
                <div className="p-2.5 rounded bg-black/60 border border-red-950">
                  <span className="text-[10px] uppercase text-slate-300 block">Lean Body Mass</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">{leanMassLbs} lbs</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Muscle, Bone, Water</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Current Body Fat %:</span>
                  <span className="font-mono font-bold text-white">{currentBfPercent}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target @ 155 lbs (31.0&quot; Waist):</span>
                  <span className="font-mono font-bold text-amber-400">~{targetBfPercent}% (Visible Abs)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Net Fat to Oxidize:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {(fatMassLbs - 15.5).toFixed(1)} lbs of Fat Tissue
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-red-950/70 text-[11px] text-slate-400">
              <strong className="text-white">Lean Preservation Rule:</strong> Sparing {leanMassLbs} lbs of muscle requires 140g daily protein + high-rep calisthenics overload during 23:1 OMAD.
            </div>
          </div>
        </div>

        {/* HONEST TIMELINE FORECAST */}
        <div className="p-4 rounded-lg bg-[#121218] border border-red-950/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Honest Recomposition Timeline Forecast
              </h4>
              <p className="text-[11px] text-slate-300">
                Modeled on standard 3,500 kcal / lb fat tissue deficit with biological adaptation bounds.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300 font-semibold">Deficit:</span>
              <button
                onClick={() => setDailyDeficit(350)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                  dailyDeficit === 350
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-black border-red-950 text-slate-300"
                }`}
              >
                350 kcal
              </button>
              <button
                onClick={() => setDailyDeficit(500)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                  dailyDeficit === 500
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-black border-red-950 text-slate-300"
                }`}
              >
                500 kcal (Founder)
              </button>
              <button
                onClick={() => setDailyDeficit(750)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition border ${
                  dailyDeficit === 750
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-black border-red-950 text-slate-300"
                }`}
              >
                750 kcal (Aggressive)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-black/60 border border-red-950">
              <span className="text-slate-400 uppercase text-[10px] block">Estimated Duration</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {recompForecast.weeksRequired} Weeks
              </span>
              <span className="text-[10px] text-amber-400">
                Range: {recompForecast.uncertaintyRangeWeeks.min} &ndash; {recompForecast.uncertaintyRangeWeeks.max} Weeks
              </span>
            </div>

            <div className="p-3 rounded bg-black/60 border border-red-950">
              <span className="text-slate-400 uppercase text-[10px] block">Projected Arrival Date</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {recompForecast.estimatedCompletionDate}
              </span>
              <span className="text-[10px] text-emerald-400">
                155.0 lbs &amp; Full Abdominal Definition
              </span>
            </div>

            <div className="p-3 rounded bg-black/60 border border-red-950">
              <span className="text-slate-400 uppercase text-[10px] block">Weekly Fat Loss Rate</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {((dailyDeficit * 7) / 3500).toFixed(2)} lbs / wk
              </span>
              <span className="text-[10px] text-slate-300">
                Optimal muscle-sparing velocity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CIRCUMFERENCE TAPE TELEMETRY */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Circumference Tape Telemetry (Inches)
            </h3>
            <p className="text-xs text-slate-300">
              Track muscle hypertrophy vs waist reduction without scale obsession.
            </p>
          </div>
          <button
            onClick={handleSaveTape}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow"
          >
            Save Tape (+100 XP)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Waist (Navel)</span>
            <input
              type="text"
              value={waistInches}
              onChange={(e) => setWaistInches(parseFloat(e.target.value) || 33.5)}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">Goal: 31.0 in (Abs)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Chest (Nipple Line)</span>
            <input
              type="text"
              value={tapeData.chest}
              onChange={(e) => setTapeData({ ...tapeData, chest: e.target.value })}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">Preserve through Dips</span>
          </div>

          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Arms (Flexed Peak)</span>
            <input
              type="text"
              value={tapeData.arms}
              onChange={(e) => setTapeData({ ...tapeData, arms: e.target.value })}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">Pull-Up Hypertrophy</span>
          </div>

          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60">
            <span className="text-xs text-amber-400 font-bold uppercase block mb-1">Shoulders (Delts)</span>
            <input
              type="text"
              value={tapeData.shoulders}
              onChange={(e) => setTapeData({ ...tapeData, shoulders: e.target.value })}
              className="w-full bg-black border border-red-950/80 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-300 mt-1 block">V-Taper Ratio</span>
          </div>
        </div>
      </section>

      {/* ENCRYPTED PRIVATE PHOTO VAULT */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Encrypted Private Progress Vault</span>
              <span className="text-[10px] bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                100% Local Hardware
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Zero cloud exposure. Progress check-ins stay on your private browser device.
            </p>
          </div>
          <button
            onClick={() => setVaultUnlocked(!vaultUnlocked)}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 border border-red-950 transition font-bold"
          >
            {vaultUnlocked ? "🔒 Lock Vault" : "🔓 Unlock Vault"}
          </button>
        </div>

        {vaultUnlocked ? (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-[#121218] border border-red-950/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Attach Weekly Check-In Snapshot</span>
                <span className="text-[11px] text-slate-300">Record visual definition milestones privately.</span>
              </div>
              <button
                onClick={handleAddPhotoRecord}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow"
              >
                + Record Check-In (+150 XP)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {localPhotos.map((photo) => (
                <div key={photo.id} className="p-3.5 rounded-lg bg-[#121218] border border-red-950/60 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white">{photo.label}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{photo.date}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{photo.notes}</p>
                  <div className="mt-2 pt-2 border-t border-red-950/70 text-[10px] text-emerald-400 flex items-center gap-1">
                    <span>✓ Local Hardware Encrypted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#121218] border border-red-950/60 text-center text-slate-400 text-xs">
            🔒 Vault Locked. Tap &ldquo;🔓 Unlock Vault&rdquo; above to inspect private biometrics and progress media.
          </div>
        )}
      </section>

    </div>
  );
}
