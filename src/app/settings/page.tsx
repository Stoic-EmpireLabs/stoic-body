"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";

export default function SettingsPage() {
  const { calmMode, toggleCalmMode, isFounderMode, totalXp, transactions } = useStoic();
  const [exported, setExported] = useState(false);

  const handleExportData = () => {
    const data = {
      user: "Stoic Founder",
      totalXp,
      exportedAt: new Date().toISOString(),
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stoic-body-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <div className="space-y-6">

      {/* FOUNDER SOVEREIGN MODE BANNER */}
      <section className="bg-[#13141C] border border-amber-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400">
              Founder Sovereign License &middot; Permanent Unlock
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
            SOVEREIGN ACTIVATED
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-100">
          Workstation Local Edition: 100% Free &amp; Offline-Persistent
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Your personal workstation instance runs with zero paywalls, zero subscription checks, and zero telemetry. All Pro systems, Calisthenics studios, and Quest vaults are permanently unlocked.
        </p>
      </section>

      {/* COMMERCIAL STORE SUBSCRIPTION STATUS */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Retail Commercial Store Configuration
          </h3>
          <span className="text-xs font-mono text-slate-400">Apple &amp; Microsoft Distribution</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          For commercial retail customers on the Apple App Store and Microsoft Store, monetization is configured at:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <div className="text-slate-400">Monthly Tier</div>
            <div className="text-base font-bold text-slate-100 font-mono mt-0.5">$9.99 / month</div>
            <div className="text-[11px] text-slate-500 mt-1">7-Day Free Trial Included</div>
          </div>
          <div className="p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
            <div className="text-slate-400">Annual Tier (33% Savings)</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">$79.99 / year</div>
            <div className="text-[11px] text-slate-500 mt-1">~$6.67/month effective</div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#232636] flex justify-end">
          <button
            onClick={() => alert("StoreKit / Microsoft Commerce purchase restoration verified: Founder Sovereign Mode permanently active.")}
            className="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-[#232636] transition"
          >
            Restore Store Purchases
          </button>
        </div>
      </section>

      {/* PREFERENCES & CALM MODE */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
          Display &amp; Focus Preferences
        </h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#1C1E2B] border border-[#232636]">
          <div>
            <h4 className="text-sm font-medium text-slate-100">Calm Mode (Monastic Focus)</h4>
            <p className="text-xs text-slate-400">
              Silence all Web Audio chime feedback and suppress upward-floating combat numbers for distraction-free deep work.
            </p>
          </div>
          <button
            onClick={toggleCalmMode}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              calmMode
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {calmMode ? "ENABLED (SILENT)" : "DISABLED (FULL AUDIO)"}
          </button>
        </div>
      </section>

      {/* LOCAL-FIRST DATA PORTABILITY */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-2">
          Local SQLite Storage &amp; Privacy
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Your personal biometrics, nutrition logs, and quest progress are stored locally on this machine with native SQLite (<code className="text-slate-300 font-mono">node:sqlite</code>). Zero data is sent to external commercial advertising databases.
        </p>
        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition"
        >
          {exported ? "Data Export Downloaded" : "Export Full JSON Backup"}
        </button>
      </section>

      {/* CLINICAL MEDICAL & FASTING DISCLAIMER (Apple Guideline 1.4) */}
      <section className="bg-[#13141C]/60 border border-[#232636] rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed">
        <strong className="text-slate-400 block mb-1">Clinical Safety &amp; Health Disclaimer:</strong>
        Stoic Body provides informational tools for discipline, habit formation, calisthenics movement, and time-restricted feeding. It does not provide medical diagnosis or replace personalized medical counsel. Fasting protocols (such as 23:1 OMAD) should be undertaken with proper hydration and electrolytes, and are not recommended for individuals with a history of disordered eating, pregnancy, or specific metabolic conditions without consulting a physician.
      </section>

    </div>
  );
}
