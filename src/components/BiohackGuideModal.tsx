"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BIOHACKS_REGISTRY, BiohackRemedy } from "@/lib/biohacks";
import { useStoic } from "@/context/StoicContext";
import { fireBrilliantConfetti } from "@/lib/confetti";
import { Sparkles, Check, X, ShieldAlert, BookOpen, Clock, Beaker } from "lucide-react";

interface BiohackGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymptom?: string;
}

export default function BiohackGuideModal({
  isOpen,
  onClose,
  initialSymptom = "bloating",
}: BiohackGuideModalProps) {
  const { awardXp, playBellSound, playAnvilChime } = useStoic();
  const [selectedKey, setSelectedKey] = useState<string>(initialSymptom);
  const [appliedBiohacks, setAppliedBiohacks] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentRemedy: BiohackRemedy = BIOHACKS_REGISTRY[selectedKey] || BIOHACKS_REGISTRY.bloating;
  const isApplied = !!appliedBiohacks[currentRemedy.id];

  const handleApplyRemedy = () => {
    setAppliedBiohacks((prev) => ({ ...prev, [currentRemedy.id]: true }));
    awardXp(150, `Biohack Applied: ${currentRemedy.headline}`, "Recovery");
    playBellSound();
    fireBrilliantConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="max-w-3xl w-full bg-[#0A0A0F] border border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl space-y-4 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/60 to-black border-b border-red-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">
              🌿
            </span>
            <div>
              <h2 className="font-mono font-black text-white text-base tracking-wide uppercase">
                Stoic Apothecary &middot; Symptom Biohacks
              </h2>
              <p className="text-xs text-slate-400">
                Visual Illustrated Field Remedies for Physical &amp; Digestive Friction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-300 hover:text-white transition border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Symptom Navigation Tabs */}
        <div className="px-4 sm:px-5 flex items-center gap-2 overflow-x-auto pb-2 border-b border-red-950/40 scrollbar-thin">
          {Object.values(BIOHACKS_REGISTRY).map((remedy) => (
            <button
              key={remedy.id}
              onClick={() => setSelectedKey(remedy.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition border ${
                selectedKey === remedy.id
                  ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-black/60 border-red-950/80 text-slate-400 hover:text-white hover:border-amber-500/40"
              }`}
            >
              {remedy.id === "bloating" && "🫚 "}
              {remedy.id === "soreness" && "🍒 "}
              {remedy.id === "energy-crash" && "⚡ "}
              {remedy.id === "cravings" && "🍎 "}
              {remedy.id === "sleep" && "🌙 "}
              {remedy.headline.split("?")[0]}?
            </button>
          ))}
        </div>

        {/* Content Body: Illustrated Comic & Protocol Breakdown */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Comic Infographic Illustration */}
          <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-amber-500/30 aspect-[3/4] bg-neutral-950 shadow-inner">
            <Image
              src={currentRemedy.comicIllustrationUrl}
              alt={currentRemedy.headline}
              fill
              className="object-cover"
            />
          </div>

          {/* Detailed Remedy Information */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-500/30">
                Verified Botanical Protocol
              </span>
              <h3 className="text-lg font-mono font-black text-white mt-1.5">
                {currentRemedy.headline}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{currentRemedy.subtitle}</p>
            </div>

            {/* Preparation Protocol Box */}
            <div className="p-3.5 rounded-xl bg-[#121218] border border-amber-500/30 space-y-2">
              <h4 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Preparation &amp; Administration
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {currentRemedy.protocol}
              </p>
            </div>

            {/* Required Ingredients */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Beaker className="w-3.5 h-3.5 text-amber-400" />
                Required Formula &amp; Dosages
              </h4>
              <div className="space-y-1">
                {currentRemedy.ingredients.map((ing, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Mechanism */}
            <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Biochemical Mechanism:
              </span>
              <p className="text-[11px] text-slate-300 leading-normal italic">
                {currentRemedy.scientificMechanism}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleApplyRemedy}
                disabled={isApplied}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition border flex items-center justify-center gap-2 ${
                  isApplied
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/50 cursor-default"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                }`}
              >
                {isApplied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Remedy Applied (+150 XP)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Apply Botanical Protocol (+150 XP)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
