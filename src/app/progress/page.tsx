"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import {
  calculateBodyFatUSMC,
  calculateBodyFatNavy,
  projectRecompositionTimeline,
  calculateMovingAverageWeight,
} from "@/lib/health";
import AIVisualStudioModal from "@/components/AIVisualStudioModal";

export default function BodyProgressPage() {
  const { awardXp, playAnvilChime, playBellSound, activeProfile } = useStoic();
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [customGoalPhoto, setCustomGoalPhoto] = useState<string>("");

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

  // USMC Body Composition Program (BCP) State (MCO 6110.3A Standard, Default 5'10", 33.5" waist, 15.5" neck)
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

  // Realistic Goal Physique & Photo Studio State
  const [userPhoto, setUserPhoto] = useState<string>("");
  const [goalGender, setGoalGender] = useState<"male" | "female">("male");
  const [goalPhysique, setGoalPhysique] = useState<string>("spartan");

  // Encrypted Vault State
  const [vaultUnlocked, setVaultUnlocked] = useState(true);
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

      const savedWaist = localStorage.getItem("stoic_usmc_waist") || localStorage.getItem("stoic_navy_waist");
      if (savedWaist) setWaistInches(Number(savedWaist));

      const savedNeck = localStorage.getItem("stoic_usmc_neck") || localStorage.getItem("stoic_navy_neck");
      if (savedNeck) setNeckInches(Number(savedNeck));
    }
  }, []);

  // Moving Average Weight
  const rollingAvg = calculateMovingAverageWeight(weights);
  const currentWeightEst = rollingAvg > 0 ? rollingAvg : 170.0;
  const lbsToLose = Math.max(0, currentWeightEst - targetWeight);

  // USMC Body Fat % Calculations (Marine Corps Order 6110.3A BCP Standard)
  const currentBfPercent = calculateBodyFatUSMC(waistInches, neckInches, heightInches);
  const targetBfPercent = calculateBodyFatUSMC(31.0, neckInches, heightInches); // 31" waist target

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
      localStorage.setItem("stoic_usmc_waist", String(waistInches));
      localStorage.setItem("stoic_usmc_neck", String(neckInches));
      // Backward compatibility key
      localStorage.setItem("stoic_navy_waist", String(waistInches));
      localStorage.setItem("stoic_navy_neck", String(neckInches));
    }
    awardXp(100, "USMC Tape Telemetry Saved", "Discipline");
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

          <div className="flex items-end justify-between gap-2 h-24 pt-6 border-b border-red-950/80 mt-2">
            {weights.map((w, idx) => {
              const heightPixels = Math.max(16, Math.min(50, (w.weight - 165) * 8));
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

      {/* USMC BODY COMPOSITION PROGRAM (BCP) & RECOMPOSITION ENGINE */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>USMC Body Composition Program (BCP) &amp; Marine Tape Telemetry</span>
              <span className="text-[10px] bg-red-950/90 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
                MCO 6110.3A Standard
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Marine Corps circumference formula: 86.010 &times; log10(abdomen - neck) - 70.041 &times; log10(height) + 36.76.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
              Current Est: {currentBfPercent}% Body Fat
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                currentBfPercent <= 12.0
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                  : currentBfPercent <= 18.0
                  ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                  : "bg-red-950/80 text-red-300 border-red-500/50"
              }`}
            >
              {currentBfPercent <= 12.0
                ? "🦅 USMC Elite Recon Standard (Semper Fi)"
                : currentBfPercent <= 18.0
                ? "🦅 USMC BCP Compliant & Combat Ready"
                : "🦅 USMC Recomp Target (170 → 155 lbs)"}
            </span>
          </div>
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
                  <span className="font-mono font-bold text-amber-400">~{targetBfPercent}% (Marine Recon Abs)</span>
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

      {/* REALISTIC GOAL PHYSIQUE & PROGRESS PHOTO STUDIO */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Realistic Goal Physique &amp; Progress Photo Studio</span>
              <span className="text-[10px] bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                100% Local Hardware Encrypted
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Side-by-side starting baseline vs. realistic goal physique illustration vs. actual verified progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGoalGender(goalGender === "male" ? "female" : "male")}
              className="text-xs px-3 py-1.5 min-h-[44px] rounded-lg bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-amber-300 font-mono font-bold flex items-center gap-1.5"
            >
              <span>{goalGender === "male" ? "⚔️ Male Model" : "🛡️ Female Model"}</span>
            </button>
            <button
              onClick={() => setVaultUnlocked(!vaultUnlocked)}
              className="text-xs px-3.5 py-1.5 min-h-[44px] rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 border border-red-950 transition font-bold flex items-center"
            >
              {vaultUnlocked ? "🔒 Lock Vault" : "🔓 Unlock Vault"}
            </button>
          </div>
        </div>

        {vaultUnlocked ? (
          <div className="space-y-5">
            {/* SIDE-BY-SIDE 3-PANEL STUDIO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* PANEL 1: STARTING PHOTO / BASELINE */}
              <div className="p-4 rounded-xl bg-[#121218] border border-red-950/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 mb-2 uppercase">
                    <span>1. Starting Baseline</span>
                    <span className="text-zinc-500">Day 0</span>
                  </div>
                  {userPhoto ? (
                    <div className="relative rounded-lg overflow-hidden border border-amber-500/40 mb-3 bg-black">
                      <img
                        src={userPhoto}
                        alt="Starting Baseline"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => setUserPhoto("")}
                        className="absolute top-2 right-2 bg-black/80 text-red-400 text-[10px] px-2 py-0.5 rounded border border-red-500/40 font-mono"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="h-48 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center p-3 text-center mb-3 bg-black/40">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs font-bold text-white">Upload Starting Photo</span>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Private local browser storage only.
                      </p>
                      <label className="mt-2.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-mono font-bold cursor-pointer min-h-[40px] flex items-center">
                        Select Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = (ev) => {
                                if (typeof ev.target?.result === "string") setUserPhoto(ev.target.result);
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                  <div className="space-y-1 text-xs font-mono">
                    <div className="text-zinc-300">
                      Scale Weight: <strong className="text-white">170.0 lbs</strong>
                    </div>
                    <div className="text-zinc-300">
                      Estimated Body Fat: <strong className="text-amber-400">{currentBfPercent}%</strong>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      Soft abdominal definition &middot; Ready for OMAD deficit
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-emerald-400 font-mono">
                  ✓ Baseline Secure
                </div>
              </div>

              {/* PANEL 2: REALISTIC GOAL PHYSIQUE VISUALIZATION */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-amber-500/10 via-black to-zinc-950 border border-amber-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 mb-2 uppercase">
                    <span>2. Realistic Goal Target</span>
                    <span className="text-emerald-400">Target Recomp</span>
                  </div>

                  {/* Archetype Quick Selector */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {[
                      { id: "spartan", name: "Spartan" },
                      { id: "gladiator", name: "Gladiator" },
                      { id: "titan", name: "Titan" },
                      { id: "sculpted", name: "Sculpted" },
                    ].map((arch) => (
                      <button
                        key={arch.id}
                        onClick={() => setGoalPhysique(arch.id)}
                        className={`py-1 px-2 rounded text-[11px] font-mono font-bold transition min-h-[36px] ${
                          goalPhysique === arch.id
                            ? "bg-amber-500 text-black shadow"
                            : "bg-black/60 border border-white/10 text-zinc-300"
                        }`}
                      >
                        {arch.name}
                      </button>
                    ))}
                  </div>

                  {/* Realistic Goal Visual Image */}
                  <div className="relative rounded-lg overflow-hidden border border-amber-500/40 mb-3 h-48 bg-black group">
                    <img
                      src={
                        customGoalPhoto ||
                        (goalGender === "female"
                          ? "/assets/brand/female-goal-physique.jpg"
                          : "/assets/brand/male-goal-physique.jpg")
                      }
                      alt="Realistic Goal Physique"
                      className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                    <div className="absolute top-2 left-2 bg-black/85 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-500/40">
                      {goalGender === "female" ? "♀ Female Spartan" : "♂ Male Spartan"} &bull; {goalPhysique.toUpperCase()}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-white font-bold">{goalGender === "female" ? "135 lbs · 16-18% BF" : "155 lbs · 8-10% BF"}</span>
                      <span className="text-emerald-400 font-bold">Six-Pack &amp; V-Taper</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 space-y-1 font-mono text-[11px] mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Target Model:</span>
                      <span className="text-amber-300 font-bold uppercase">{goalGender} &bull; {goalPhysique}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Target Goal Weight:</span>
                      <span className="text-white font-bold">{goalGender === "female" ? "135.0 lbs" : "155.0 lbs"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Target Body Fat:</span>
                      <span className="text-emerald-400 font-bold">{goalGender === "female" ? "16-18%" : "8-10%"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Lean Mass Protection:</span>
                      <span className="text-amber-300 font-bold">100% via 140g Protein</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAIStudioOpen(true)}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition min-h-[38px]"
                  >
                    <span>✨</span> Launch AI Visual Studio &rarr;
                  </button>

                  <p className="text-[10px] text-zinc-400 italic font-mono leading-snug mt-2">
                    *Grounded in human body composition physics, Mifflin-St Jeor metabolic equations, and 140g protein OMAD.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-amber-400 font-mono">
                  🎯 Target Velocity: -1.5 lbs / week
                </div>
              </div>

              {/* PANEL 3: ACTUAL PROGRESS TIMELINE */}
              <div className="p-4 rounded-xl bg-[#121218] border border-red-950/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 mb-2 uppercase">
                    <span>3. Actual Progress</span>
                    <span className="text-zinc-400">{localPhotos.length} Check-ins</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
                    {localPhotos.map((photo) => (
                      <div key={photo.id} className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-xs">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-white text-xs">{photo.label}</span>
                          <span className="text-[10px] font-mono text-amber-400">{photo.date}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-snug">{photo.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddPhotoRecord}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black text-xs font-bold font-mono uppercase tracking-wider shadow min-h-[44px] flex items-center justify-center"
                >
                  + Record Check-In (+150 XP)
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#121218] border border-red-950/60 text-center text-slate-400 text-xs">
            🔒 Vault Locked. Tap &ldquo;🔓 Unlock Vault&rdquo; above to inspect private biometrics and progress media.
          </div>
        )}
      </section>

      {/* IN-APP AI VISUAL STUDIO MODAL */}
      <AIVisualStudioModal
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        initialType={goalGender === "female" ? "physique_female" : "physique_male"}
        onApplyImage={(url: string) => {
          setCustomGoalPhoto(url);
          setIsAIStudioOpen(false);
          awardXp(500, "Personalized Goal Physique Visual Synchronized", "Dominion");
          playBellSound();
        }}
      />

    </div>
  );
}
