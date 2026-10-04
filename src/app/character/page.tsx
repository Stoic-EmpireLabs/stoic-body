"use client";

import React, { useEffect, useRef } from "react";
import { useStoic } from "@/context/StoicContext";

export default function CharacterStatus() {
  const { totalXp, levelInfo, transactions } = useStoic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = 85;

    ctx.clearRect(0, 0, w, h);

    // Attributes: Strength, Endurance, Discipline, Knowledge, Recovery
    const stats = [0.68, 0.72, 0.88, 0.78, 0.65];
    const labels = ["STR", "END", "DIS", "KNO", "REC"];
    const count = stats.length;

    // Draw concentric web rings
    for (let level = 1; level <= 4; level++) {
      const curR = (r / 4) * level;
      ctx.beginPath();
      ctx.strokeStyle = "#232636";
      ctx.lineWidth = 1;
      for (let i = 0; i < count; i++) {
        const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
        const x = cx + curR * Math.cos(angle);
        const y = cy + curR * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines and attribute labels
    ctx.font = "10px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.textAlign = "center";
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.strokeStyle = "#232636";
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      const lx = cx + (r + 18) * Math.cos(angle);
      const ly = cy + (r + 18) * Math.sin(angle) + 4;
      ctx.fillText(labels[i], lx, ly);
    }

    // Draw stat polygon
    ctx.beginPath();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
      const curR = r * stats[i];
      const x = cx + curR * Math.cos(angle);
      const y = cy + curR * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, []);

  return (
    <div className="space-y-6">

      {/* 5-AXIS RADAR & PRESTIGE STATUS */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Radar Canvas */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <canvas ref={canvasRef} width="250" height="250"></canvas>
          </div>

          {/* Character Stats & Attributes */}
          <div className="flex-1 space-y-3 w-full">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider">
                  Level {levelInfo.level} {levelInfo.title}
                </span>
                <span className="font-mono">
                  Lifetime XP: <strong>{totalXp.toLocaleString()}</strong>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>
                  {levelInfo.currentLevelXp.toLocaleString()} / {levelInfo.xpToNextLevel.toLocaleString()} XP to Level {levelInfo.level + 1}
                </span>
                <span>Next Title: Spartan Tribune @ LVL 20</span>
              </div>
            </div>

            {/* Attribute Breakdowns */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-[#1C1E2B] p-2.5 rounded border border-[#232636]">
                <div className="text-[11px] text-red-400 font-semibold uppercase">
                  Strength &middot; 48
                </div>
                <div className="text-xs text-slate-300">Calisthenics, Dips, Pull-Ups</div>
              </div>
              <div className="bg-[#1C1E2B] p-2.5 rounded border border-[#232636]">
                <div className="text-[11px] text-blue-400 font-semibold uppercase">
                  Endurance &middot; 52
                </div>
                <div className="text-xs text-slate-300">Boxing, Zone 2 Treadmill</div>
              </div>
              <div className="bg-[#1C1E2B] p-2.5 rounded border border-[#232636]">
                <div className="text-[11px] text-purple-400 font-semibold uppercase">
                  Discipline &middot; 68
                </div>
                <div className="text-xs text-slate-300">OMAD, Morning Anchor, Streaks</div>
              </div>
              <div className="bg-[#1C1E2B] p-2.5 rounded border border-[#232636]">
                <div className="text-[11px] text-cyan-400 font-semibold uppercase">
                  Knowledge &middot; 60
                </div>
                <div className="text-xs text-slate-300">DBA Research, Ultron LLM</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PRESTIGE HIERARCHY LADDER */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          100-Level Prestige Title Progression
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-[#232636] flex justify-between">
            <span className="text-slate-400">LVL 1&ndash;4</span>
            <span className="text-amber-400 font-bold">Stoic Initiate</span>
          </div>
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-[#232636] flex justify-between">
            <span className="text-slate-400">LVL 5&ndash;9</span>
            <span className="text-slate-300 font-bold">Disciplined Legionnaire</span>
          </div>
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-amber-500/50 flex justify-between">
            <span className="text-amber-400 font-bold">LVL 10&ndash;19 (Active)</span>
            <span className="text-amber-300 font-bold">Frontline Centurion</span>
          </div>
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-[#232636] flex justify-between">
            <span className="text-slate-500">LVL 20&ndash;34</span>
            <span className="text-slate-400">Spartan Tribune</span>
          </div>
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-[#232636] flex justify-between">
            <span className="text-slate-500">LVL 35&ndash;49</span>
            <span className="text-slate-400">Praetorian Commander</span>
          </div>
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-[#232636] flex justify-between">
            <span className="text-slate-500">LVL 50&ndash;99</span>
            <span className="text-slate-400">Sovereign Imperator</span>
          </div>
          <div className="p-2.5 rounded bg-[#1C1E2B] border border-[#232636] sm:col-span-2 flex justify-between">
            <span className="text-amber-500 font-bold">LVL 100+ (Mastery)</span>
            <span className="text-amber-400 font-bold">Stoic Sage (Transcendence)</span>
          </div>
        </div>
      </section>

      {/* ANTI-EXPLOIT TRANSACTION LOG */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Live XP Transaction Ledger (Anti-Exploit Proof)
        </h3>
        <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`flex justify-between p-2 rounded border ${
                tx.isReversed
                  ? "bg-red-950/40 text-red-300 border-red-900/40"
                  : "bg-[#1C1E2B] text-slate-300 border-[#232636]"
              }`}
            >
              <span>{tx.label}</span>
              <span
                className={`font-bold ${
                  tx.isReversed ? "text-red-400" : "text-amber-400"
                }`}
              >
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount} XP
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
