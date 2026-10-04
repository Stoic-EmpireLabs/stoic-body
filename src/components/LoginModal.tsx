"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";
import { FOUNDER_PROFILE } from "@/lib/onboarding";

export default function LoginModal() {
  const {
    isLoginOpen,
    setIsLoginOpen,
    activeProfile,
    allProfiles,
    switchProfile,
    setIsOnboardingOpen,
    awardXp,
    playBellSound,
  } = useStoic();

  const [enteredPin, setEnteredPin] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>(activeProfile.id);
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);

  if (!isLoginOpen) return null;

  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    setPinFeedback(null);
  };

  const handleConfirmLogin = () => {
    switchProfile(selectedProfileId);
    playBellSound();
    awardXp(50, "Sovereign Profile Activated", "Discipline");
    setIsLoginOpen(false);
  };

  const handleLaunchNewOnboarding = () => {
    setIsLoginOpen(false);
    setIsOnboardingOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#0A0A0F] border border-amber-500/40 rounded-2xl shadow-2xl shadow-red-950/50 p-6 sm:p-7 text-white animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[2px]">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-lg">
                🛡️
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Sovereign Identity & Access
              </h2>
              <p className="text-xs text-amber-400 font-mono">
                Switch Warrior Profile &bull; Client Log In
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoginOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 text-lg font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Active Profile Status */}
        <div className="bg-[#12121A] border border-zinc-800 p-3.5 rounded-xl mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-amber-500/40 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
              L{activeProfile.level}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{activeProfile.name}</span>
                <span className="text-[10px] bg-red-950/80 text-red-300 px-1.5 py-0.5 rounded border border-red-600/40 uppercase font-mono">
                  {activeProfile.role}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {activeProfile.currentWeight} &rarr; {activeProfile.targetWeight} lbs &bull; {activeProfile.fastingProtocol}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
            Active Now
          </span>
        </div>

        {/* Profile Switcher List */}
        <div className="mb-5">
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
            Available Profiles in Local Registry:
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {allProfiles.map((p) => {
              const isSelected = selectedProfileId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProfile(p.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 text-white shadow-sm"
                      : "bg-[#14141E] border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{p.role === "founder" ? "👑" : "⚔️"}</span>
                    <div>
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <span>{p.callsign}</span>
                        {p.role === "founder" && (
                          <span className="text-[9px] bg-red-950 text-red-300 px-1 rounded border border-red-600/40 font-mono">
                            Founder
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {p.trainingFocus} &bull; {p.dailyProtein}g Protein Target
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <div className="text-amber-300 font-bold">{p.totalXp.toLocaleString()} XP</div>
                    <div className="text-zinc-500 text-[10px]">Level {p.level}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create New Client Action */}
        <div className="mb-6 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Want to set up a fresh custom client?</span>
          <button
            type="button"
            onClick={handleLaunchNewOnboarding}
            className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 underline"
          >
            + New Client Onboarding &rarr;
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsLoginOpen(false)}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogin}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-red-950/60 transition"
          >
            Switch to Profile &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
