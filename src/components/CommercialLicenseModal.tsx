"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";
import {
  LicenseState,
  COMMERCIAL_PRICING,
  DEFAULT_FOUNDER_LICENSE,
  evaluateLicenseState,
  simulateStorePurchase,
  simulateRestorePurchases,
  generateOfflineLicenseToken,
  ALL_SOVEREIGN_FEATURES,
} from "@/lib/entitlements";
import { confettiCelebration } from "@/lib/confetti";

interface CommercialLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommercialLicenseModal({
  isOpen,
  onClose,
}: CommercialLicenseModalProps) {
  const { playBellSound, awardXp } = useStoic();

  const [licenseState, setLicenseState] = useState<LicenseState>(DEFAULT_FOUNDER_LICENSE);
  const [offlineToken, setOfflineToken] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stoic_license_state");
      if (saved) {
        try {
          setLicenseState(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const evaluation = evaluateLicenseState(licenseState);

  const handleSimulatePurchase = (interval: "monthly" | "yearly") => {
    const newState = simulateStorePurchase(interval, "web");
    setLicenseState(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_license_state", JSON.stringify(newState));
    }
    playBellSound();
    confettiCelebration();
    awardXp(500, `Purchased ${interval.toUpperCase()} Sovereign Pass ($${interval === "yearly" ? 79.99 : 9.99})`, "Discipline");
    setFeedbackMsg(`✓ Sandbox Store Purchase Successful: ${interval === "yearly" ? "$79.99/yr" : "$9.99/mo"} Active!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleRestore = () => {
    const restored = simulateRestorePurchases(licenseState);
    setLicenseState(restored);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_license_state", JSON.stringify(restored));
    }
    playBellSound();
    setFeedbackMsg("✓ Store Receipt Restored: Active License Synced");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleResetToFounder = () => {
    setLicenseState(DEFAULT_FOUNDER_LICENSE);
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_license_state", JSON.stringify(DEFAULT_FOUNDER_LICENSE));
    }
    playBellSound();
    setFeedbackMsg("⚡ Restored Lifetime Founder Sovereign Status (0 Paywalls)");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleGenerateOfflineToken = () => {
    const token = generateOfflineLicenseToken(licenseState);
    setOfflineToken(token);
    playBellSound();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(token);
      setFeedbackMsg("📋 Offline License Token Copied to Clipboard!");
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-950/95 border border-amber-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-7 text-white animate-fade-in my-6">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[1.5px] shadow-lg shadow-amber-950/40 flex items-center justify-center">
              <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center text-lg">
                🛡️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Commercial Licensing &amp; Sovereign Access
                </h3>
                <span className="text-[10px] bg-red-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono font-bold">
                  Phase 6B Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Store Entitlements, Offline Binding &amp; Zero-Subscription Founder Mode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs font-mono px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.04] transition"
          >
            Close &times;
          </button>
        </div>

        {/* Current License Badge */}
        <div className="bg-gradient-to-r from-zinc-900 via-black to-amber-950/40 border border-amber-500/30 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono uppercase">Current License State</span>
            <span className="text-xs bg-emerald-950/80 text-emerald-300 font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-500/40">
              {evaluation.isUnlocked ? "✓ UNLOCKED" : "LOCKED"}
            </span>
          </div>
          <div className="text-lg font-bold font-serif text-amber-300 mt-1">
            {evaluation.licenseType}
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-1 flex items-center gap-3">
            <span>Platform: <strong className="text-white">{licenseState.platform}</strong></span>
            <span>&bull;</span>
            <span>Hardware ID: <strong className="text-white">{licenseState.hardwareBindingId || "Local-Isolated"}</strong></span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono p-3 rounded-xl mb-4 text-center">
            {feedbackMsg}
          </div>
        )}

        {/* Commercial Store Pricing Grid (Apple & Microsoft Approved SKUs) */}
        <div className="mb-5">
          <span className="text-xs text-zinc-400 font-mono block mb-2 uppercase">
            Store Commercial Pass (Sandbox Store Simulator)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#12121C] border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-white">Monthly Sovereign Pass</div>
                <div className="text-lg font-extrabold text-amber-400 font-mono mt-1">
                  ${COMMERCIAL_PRICING.monthly.priceUSD} <span className="text-xs text-zinc-400 font-normal">/ mo</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-1">
                  SKU: {COMMERCIAL_PRICING.monthly.appleProductId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSimulatePurchase("monthly")}
                className="mt-3 w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white transition"
              >
                Simulate $9.99 Buy
              </button>
            </div>

            <div className="bg-[#12121C] border border-amber-500/40 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-black font-bold font-mono px-1.5 py-0.5 rounded">
                Save 33%
              </span>
              <div>
                <div className="text-xs font-bold text-white">Annual Sovereign Pass</div>
                <div className="text-lg font-extrabold text-amber-400 font-mono mt-1">
                  ${COMMERCIAL_PRICING.yearly.priceUSD} <span className="text-xs text-zinc-400 font-normal">/ yr</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-1">
                  Includes 7-Day Free Trial
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSimulatePurchase("yearly")}
                className="mt-3 w-full py-1.5 rounded-lg bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-xs font-mono font-bold text-white transition shadow-md"
              >
                Simulate $79.99 Buy
              </button>
            </div>
          </div>
        </div>

        {/* Feature Entitlements Matrix */}
        <div className="bg-black/60 border border-white/5 rounded-xl p-3.5 mb-5 text-xs font-mono">
          <div className="text-zinc-400 font-bold uppercase mb-2">Sovereign Entitlements Matrix:</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {ALL_SOVEREIGN_FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-1.5 text-zinc-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="capitalize">{feat.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Token Generator & Management */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestore}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            >
              Restore Store Receipt
            </button>
            <button
              type="button"
              onClick={handleGenerateOfflineToken}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            >
              Copy Offline Token
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetToFounder}
            className="text-amber-400 hover:text-amber-300 font-bold underline"
          >
            Reset to Lifetime Founder
          </button>
        </div>

        {offlineToken && (
          <div className="mt-3 p-2.5 bg-zinc-900/90 border border-zinc-700 rounded-lg text-[10px] font-mono break-all text-zinc-400">
            <span className="text-amber-400 font-bold block mb-1">OFFLINE CRYPTOGRAPHIC TOKEN:</span>
            {offlineToken}
          </div>
        )}

      </div>
    </div>
  );
}
