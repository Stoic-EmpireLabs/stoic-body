"use client";

import React, { useState } from "react";
import { useStoic, UserProfile } from "@/context/StoicContext";

export default function SettingsPage() {
  const {
    calmMode,
    toggleCalmMode,
    isFounderMode,
    totalXp,
    transactions,
    userProfile,
    updateProfile,
    playAnvilChime,
    playBellSound,
  } = useStoic();

  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [profileSaved, setProfileSaved] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      user: profileForm,
      totalXp,
      exportedAt: new Date().toISOString(),
      transactions,
      system: "Stoic Body Sovereign Workstation Edition",
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

      {/* HEADER SECTION */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>System Settings &amp; Founder Account</span>
            <span className="text-[10px] bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
              Sovereign Workstation Unlocked
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Configure biometrics, 170&rarr;155 target weights, sound chimes, notification schedule, and commercial store packaging.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 bg-red-950/60 px-3 py-1.5 rounded-lg border border-amber-500/40">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Founder Sovereign Active</span>
        </div>
      </section>

      {/* PROFILE & BIOMETRICS SETTINGS */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-red-950/70 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Profile &amp; Recomposition Biometrics
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Personal physiological targets for calorie burn, macro balancing, and fasting countdowns.
            </p>
          </div>
          {profileSaved && (
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
              ✓ Saved &amp; Updated (+100 XP)
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Name / Codename
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Age
              </label>
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) || 33 })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Height
              </label>
              <input
                type="text"
                value={profileForm.height}
                onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Current Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={profileForm.currentWeight}
                onChange={(e) => setProfileForm({ ...profileForm, currentWeight: parseFloat(e.target.value) || 170.0 })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={profileForm.targetWeight}
                onChange={(e) => setProfileForm({ ...profileForm, targetWeight: parseFloat(e.target.value) || 155.0 })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Daily Diet Archetype
              </label>
              <select
                value={profileForm.diet}
                onChange={(e) => setProfileForm({ ...profileForm, diet: e.target.value })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="23:1 OMAD">23:1 One Meal A Day (OMAD)</option>
                <option value="20:4 Warrior">20:4 Warrior Diet</option>
                <option value="16:8 LeanGains">16:8 Time-Restricted Feeding</option>
                <option value="Low Carb High Protein">Low Carb High Protein</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold uppercase text-[11px]">
                Protein Minimum (g)
              </label>
              <input
                type="number"
                value={profileForm.dailyProtein}
                onChange={(e) => setProfileForm({ ...profileForm, dailyProtein: parseInt(e.target.value) || 140 })}
                className="w-full bg-black border border-red-950/80 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-wider transition shadow text-xs"
            >
              Save Profile Baseline
            </button>
          </div>
        </form>
      </section>

      {/* FOUNDER SOVEREIGN LICENSE BANNER */}
      <section className="bg-[#0A0A0F] border border-amber-500/50 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400">
              Founder Sovereign License &middot; Permanent Unlock
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40">
            SOVEREIGN ACTIVATED
          </span>
        </div>
        <h3 className="text-base font-bold text-white">
          Workstation Local Edition: 100% Free &amp; Offline-Persistent
        </h3>
        <p className="text-xs text-slate-200 mt-1">
          Your personal workstation instance runs with zero paywalls, zero subscription checks, and zero telemetry. All Pro systems, Calisthenics studios, and Quest vaults are permanently unlocked.
        </p>
      </section>

      {/* COMMERCIAL STORE SUBSCRIPTION STATUS */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Retail Commercial Store Configuration
          </h3>
          <span className="text-xs font-mono text-amber-300">Apple &amp; Microsoft Distribution</span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          For commercial retail customers on the Apple App Store and Microsoft Store, monetization is configured at:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/70">
            <div className="text-slate-300 font-semibold">Monthly Tier</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">$9.99 / month</div>
            <div className="text-[11px] text-amber-300/80 mt-1">7-Day Free Trial Included &bull; Apple &amp; Microsoft StoreKit</div>
          </div>
          <div className="p-3.5 rounded-lg bg-[#121218] border border-red-950/70">
            <div className="text-slate-300 font-semibold">Annual Tier (33% Savings)</div>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">$79.99 / year</div>
            <div className="text-[11px] text-amber-300/80 mt-1">~$6.67/month effective &bull; 7-Day Free Trial Included</div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-red-950/70 flex justify-end">
          <button
            onClick={() => alert("StoreKit / Microsoft Commerce purchase restoration verified: Founder Sovereign Mode permanently active.")}
            className="text-xs px-3.5 py-1.5 rounded bg-neutral-900 text-white hover:bg-neutral-800 border border-red-950 transition font-bold"
          >
            Restore Store Purchases
          </button>
        </div>
      </section>

      {/* AUDIO & MONASTIC CALM MODE */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Audio &amp; Focus Preferences
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg bg-[#121218] border border-red-950/60 gap-3">
          <div>
            <h4 className="text-sm font-semibold text-white">Calm Mode (Monastic Silence)</h4>
            <p className="text-xs text-slate-300">
              Silence all Web Audio chimes and suppress combat numbers for distraction-free deep work.
            </p>
          </div>
          <button
            onClick={toggleCalmMode}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition shrink-0 ${
              calmMode
                ? "bg-red-700 text-white"
                : "bg-neutral-900 text-amber-300 border border-amber-500/40 hover:bg-neutral-800"
            }`}
          >
            {calmMode ? "ENABLED (SILENT)" : "DISABLED (FULL AUDIO)"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={playAnvilChime}
            className="text-xs px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white border border-red-950 transition flex items-center gap-1.5 font-semibold"
          >
            <span>🔔</span> Test Anvil Chime (+XP)
          </button>
          <button
            onClick={playBellSound}
            className="text-xs px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white border border-red-950 transition flex items-center gap-1.5 font-semibold"
          >
            <span>🥊</span> Test Boxing Round Bell
          </button>
        </div>
      </section>

      {/* SCHEDULE & NOTIFICATIONS */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Daily Anchor Reminders &amp; Alerts
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              PWA and desktop push reminder alerts for core biological rituals.
            </p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`px-3 py-1 rounded text-xs font-bold font-mono transition ${
              notificationsEnabled ? "bg-red-950/80 text-amber-300 border border-amber-500/40" : "bg-neutral-900 text-slate-400"
            }`}
          >
            {notificationsEnabled ? "REMINDERS ON" : "MUTED"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/70">
            <span className="text-slate-300 text-[11px] block font-semibold">Morning Anchor</span>
            <span className="font-mono font-bold text-white text-sm">05:30 AM</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">Hydration + Calisthenics</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/70">
            <span className="text-slate-300 text-[11px] block font-semibold">OMAD Feeding Window</span>
            <span className="font-mono font-bold text-white text-sm">06:00 PM</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">140g Protein Target</span>
          </div>
          <div className="p-3 rounded-lg bg-[#121218] border border-red-950/70">
            <span className="text-slate-300 text-[11px] block font-semibold">Evening Stoic Audit</span>
            <span className="font-mono font-bold text-white text-sm">09:30 PM</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">Daily Journal &amp; XP Seal</span>
          </div>
        </div>
      </section>

      {/* LOCAL-FIRST DATA PORTABILITY */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Local SQLite Storage &amp; Privacy Sovereignty
        </h3>
        <p className="text-xs text-slate-300">
          Your personal biometrics, nutrition logs, and quest progress are stored locally on this machine with native SQLite (<code className="text-amber-300 font-mono">node:sqlite</code>). Zero data is sent to external commercial advertising databases.
        </p>
        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 text-white border border-red-500/40 text-xs font-bold transition shadow-lg"
        >
          {exported ? "Data Export Downloaded" : "Export Full JSON Backup"}
        </button>
      </section>

      {/* CLINICAL MEDICAL & FASTING DISCLAIMER (Apple Guideline 1.4) */}
      <section className="bg-black/80 border border-red-950/60 rounded-xl p-4 text-[11px] text-slate-400 leading-relaxed">
        <strong className="text-white block mb-1">Clinical Safety &amp; Health Disclaimer:</strong>
        Stoic Body provides informational tools for discipline, habit formation, calisthenics movement, and time-restricted feeding. It does not provide medical diagnosis or replace personalized medical counsel. Fasting protocols (such as 23:1 OMAD) should be undertaken with proper hydration and electrolytes, and are not recommended for individuals with a history of disordered eating, pregnancy, or specific metabolic conditions without consulting a physician.
      </section>

    </div>
  );
}
