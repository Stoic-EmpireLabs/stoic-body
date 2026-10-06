"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useStoic } from "@/context/StoicContext";
import { calculateAttributeScores, AttributeScores } from "@/lib/gamification";
import {
  Shield,
  Swords,
  BookOpen,
  HeartPulse,
  Flame,
  Trophy,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function CharacterStatus() {
  const { totalXp, levelInfo, transactions, activeProfile } = useStoic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute dynamic 5-axis attribute scores based on real transactions
  const attrScores: AttributeScores = useMemo(() => {
    return calculateAttributeScores(transactions);
  }, [transactions]);

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
    const stats = [
      attrScores.strength,
      attrScores.endurance,
      attrScores.discipline,
      attrScores.knowledge,
      attrScores.recovery,
    ];
    const labels = ["STR", "END", "DIS", "KNO", "REC"];
    const count = stats.length;

    // Draw concentric web rings
    for (let level = 1; level <= 4; level++) {
      const curR = (r / 4) * level;
      ctx.beginPath();
      ctx.strokeStyle = "#450A0A";
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
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.strokeStyle = "#7F1D1D";
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      const lx = cx + (r + 18) * Math.cos(angle);
      const ly = cy + (r + 18) * Math.sin(angle) + 4;
      ctx.fillText(labels[i], lx, ly);
    }

    // Draw stat polygon with dynamic coordinates
    ctx.beginPath();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "rgba(220, 38, 38, 0.35)";
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

    // Draw points at vertices
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i - Math.PI / 2;
      const curR = r * stats[i];
      const x = cx + curR * Math.cos(angle);
      const y = cy + curR * Math.sin(angle);
      ctx.beginPath();
      ctx.fillStyle = "#FBBF24";
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [attrScores]);

  const relics = [
    {
      id: "relic-1",
      name: "Corinthian Centurion Crest",
      slot: "Helm",
      tier: "Tier 4 Boss",
      unlocked: levelInfo.level >= 10,
      description: "Forged in unbending Spartan discipline. Protects mental fortress against doubt.",
      icon: <Award className="w-5 h-5 text-amber-400" />,
    },
    {
      id: "relic-2",
      name: "Aegis Shield of Syracuse",
      slot: "Shield",
      tier: "Tier 5 Legendary",
      unlocked: true,
      description: "Blocks emotional friction and temptation during 23:1 OMAD fasting windows.",
      icon: <Shield className="w-5 h-5 text-red-400" />,
    },
    {
      id: "relic-3",
      name: "Damascus Calisthenics Blade",
      slot: "Weapon",
      tier: "Tier 3 Epic",
      unlocked: attrScores.rawXp.strength >= 1000,
      description: "Tempered by high-rep pull-ups, parallel bar dips, and 6-round boxing flurries.",
      icon: <Swords className="w-5 h-5 text-blue-400" />,
    },
    {
      id: "relic-4",
      name: "Enchiridion of Epictetus",
      slot: "Tome",
      tier: "Tier 4 Boss",
      unlocked: attrScores.rawXp.knowledge >= 1500,
      description: "Inscribed with the Dichotomy of Control: 'Some things are in our control, others not.'",
      icon: <BookOpen className="w-5 h-5 text-purple-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 5-AXIS RADAR & PRESTIGE STATUS */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Radar Canvas with Dynamic Live Scores */}
          <div className="relative w-64 h-64 flex flex-col items-center justify-center shrink-0">
            <canvas ref={canvasRef} width="250" height="250"></canvas>
            <span className="text-[10px] font-mono text-zinc-400 mt-1">
              Dynamic 5-Axis Telemetry &bull; Live
            </span>
          </div>

          {/* Character Stats & Attributes */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center justify-between text-xs text-white mb-1.5">
                <span className="font-mono font-black text-amber-400 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  Level {levelInfo.level} &bull; {levelInfo.title}
                </span>
                <span className="font-mono text-xs">
                  Lifetime XP: <strong className="text-white">{totalXp.toLocaleString()}</strong>
                </span>
              </div>
              <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-red-950/80">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-1">
                <span>
                  {levelInfo.currentLevelXp.toLocaleString()} / {levelInfo.xpToNextLevel.toLocaleString()} XP to Level {levelInfo.level + 1}
                </span>
                <span className="text-amber-400 font-bold">
                  Next Title: {levelInfo.level >= 20 ? "Praetorian Commander @ LVL 35" : "Spartan Tribune @ LVL 20"}
                </span>
              </div>
            </div>

            {/* 5 Dynamic Attribute Breakdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs">
              <div className="bg-[#121218] p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-bold uppercase text-[11px] flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5" /> STR
                  </span>
                  <span className="text-white font-bold">{Math.round(attrScores.strength * 100)}</span>
                </div>
                <div className="text-[10px] text-slate-400">Strength &bull; {attrScores.rawXp.strength} XP</div>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-bold uppercase text-[11px] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> END
                  </span>
                  <span className="text-white font-bold">{Math.round(attrScores.endurance * 100)}</span>
                </div>
                <div className="text-[10px] text-slate-400">Endurance &bull; {attrScores.rawXp.endurance} XP</div>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-bold uppercase text-[11px] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> DIS
                  </span>
                  <span className="text-white font-bold">{Math.round(attrScores.discipline * 100)}</span>
                </div>
                <div className="text-[10px] text-slate-400">Discipline &bull; {attrScores.rawXp.discipline} XP</div>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-red-950/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> KNO
                  </span>
                  <span className="text-white font-bold">{Math.round(attrScores.knowledge * 100)}</span>
                </div>
                <div className="text-[10px] text-slate-400">Knowledge &bull; {attrScores.rawXp.knowledge} XP</div>
              </div>

              <div className="bg-[#121218] p-3 rounded-xl border border-red-950/60 space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" /> REC
                  </span>
                  <span className="text-white font-bold">{Math.round(attrScores.recovery * 100)}</span>
                </div>
                <div className="text-[10px] text-slate-400">Recovery &bull; {attrScores.rawXp.recovery} XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOVEREIGN SPARTAN LOADOUT & PRESTIGE RELICS */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-red-950/60 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono font-bold text-white text-sm uppercase tracking-wide">
              Sovereign Spartan Loadout &bull; Unlocked Relics
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2.5 py-1 rounded">
            Prestige Tier: Centurion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {relics.map((relic) => (
            <div
              key={relic.id}
              className={`p-4 rounded-xl border transition space-y-2 flex flex-col justify-between ${
                relic.unlocked
                  ? "bg-[#121218] border-red-950/80 hover:border-amber-500/40 shadow-lg"
                  : "bg-black/40 border-white/5 opacity-60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-black border border-white/10">
                    {relic.icon}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
                    {relic.slot}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{relic.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-400 block">{relic.tier}</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {relic.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                {relic.unlocked ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Equipped
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Locked
                  </span>
                )}
                <span className="text-amber-400 font-bold">+100 Virtue</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRESTIGE HIERARCHY LADDER */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          100-Level Prestige Title Progression
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex justify-between">
            <span className="text-slate-300 font-semibold">LVL 1&ndash;4</span>
            <span className="text-amber-400 font-bold">Stoic Initiate</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex justify-between">
            <span className="text-slate-300 font-semibold">LVL 5&ndash;9</span>
            <span className="text-white font-bold">Disciplined Legionnaire</span>
          </div>
          <div className="p-3 rounded-lg bg-red-950/40 border border-amber-500 ring-1 ring-amber-500 flex justify-between shadow-md">
            <span className="text-amber-300 font-bold">LVL 10&ndash;19 (Active Rank)</span>
            <span className="text-white font-bold">Frontline Centurion</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex justify-between">
            <span className="text-slate-400">LVL 20&ndash;34</span>
            <span className="text-slate-200 font-semibold">Spartan Tribune</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex justify-between">
            <span className="text-slate-400">LVL 35&ndash;49</span>
            <span className="text-slate-200 font-semibold">Praetorian Commander</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 flex justify-between">
            <span className="text-slate-400">LVL 50&ndash;99</span>
            <span className="text-slate-200 font-semibold">Sovereign Imperator</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/60 sm:col-span-2 flex justify-between">
            <span className="text-amber-400 font-bold">LVL 100+ (Mastery)</span>
            <span className="text-white font-bold">Stoic Sage (Transcendence)</span>
          </div>
        </div>
      </section>

      {/* ANTI-EXPLOIT TRANSACTION LOG */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
          Live XP Transaction Ledger &bull; Anti-Exploit Cryptographic Log
        </h3>
        <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`flex justify-between p-2.5 rounded-lg border ${
                tx.isReversed
                  ? "bg-red-950/60 text-red-300 border-red-800/60"
                  : "bg-[#121218] text-white border-red-950/60"
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-medium block">{tx.label}</span>
                {tx.attribute && (
                  <span className="text-[10px] text-amber-400/80 uppercase">
                    Attribute: {tx.attribute}
                  </span>
                )}
              </div>
              <span
                className={`font-bold shrink-0 ${
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
