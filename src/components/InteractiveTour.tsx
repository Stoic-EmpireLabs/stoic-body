"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStoic } from "@/context/StoicContext";
import { APP_TOUR_STEPS } from "@/lib/onboarding";
import { confettiCelebration } from "@/lib/confetti";

export default function InteractiveTour() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isTourOpen,
    currentTourStep,
    nextTourStep,
    prevTourStep,
    closeTour,
    completeTour,
    playBellSound,
  } = useStoic();

  const currentStep = APP_TOUR_STEPS[currentTourStep] || APP_TOUR_STEPS[0];
  const isFirst = currentTourStep === 0;
  const isLast = currentTourStep === APP_TOUR_STEPS.length - 1;

  // Auto-route to the matching screen if needed
  useEffect(() => {
    if (isTourOpen && currentStep && currentStep.route !== pathname) {
      router.push(currentStep.route);
    }
  }, [isTourOpen, currentTourStep, currentStep, pathname, router]);

  // Scroll target into view
  useEffect(() => {
    if (!isTourOpen || !currentStep) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [isTourOpen, currentTourStep, currentStep]);

  if (!isTourOpen) return null;

  const handleNext = () => {
    playBellSound();
    if (isLast) {
      confettiCelebration();
      completeTour();
    } else {
      nextTourStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end sm:justify-center items-center p-4">
      {/* Semi-transparent dark overlay */}
      <div
        onClick={closeTour}
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px] pointer-events-auto transition-opacity"
      />

      {/* Host Tooltip Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#0C0C14] border-2 border-amber-500 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-red-950/80 pointer-events-auto animate-fade-in text-white mb-6 sm:mb-0">
        
        {/* Header: Host Avatar & Step Counter */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[2px]">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-lg">
                🤖
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Aethelgard &bull; Host Tour
                </span>
                <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-600/40 uppercase font-mono font-bold">
                  Interactive Guide
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">
                Step {currentStep.stepNumber} of {APP_TOUR_STEPS.length}
              </span>
            </div>
          </div>

          {/* Close / Skip button */}
          <button
            onClick={closeTour}
            className="text-zinc-500 hover:text-zinc-300 text-sm font-mono px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700"
            title="Exit tour anytime"
          >
            Skip &times;
          </button>
        </div>

        {/* Step Title & Subtitle */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-amber-400 font-serif tracking-wide">
            {currentStep.title}
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Host Narration */}
        <div className="bg-[#141420] border-l-4 border-amber-500 rounded-r-xl p-3.5 mb-4 text-xs text-zinc-200 leading-relaxed">
          {currentStep.hostDialogue}
        </div>

        {/* Action Hint */}
        <div className="flex items-center gap-2 text-[11px] text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg mb-5">
          <span>💡</span>
          <span>{currentStep.actionHint}</span>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-1.5">
            {APP_TOUR_STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentTourStep
                    ? "w-5 bg-amber-400"
                    : idx < currentTourStep
                    ? "w-2 bg-red-600"
                    : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={prevTourStep}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition"
              >
                &larr; Prev
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-red-950/60 transition"
            >
              {isLast ? "Complete Tour (+250 XP) 🏆" : "Next Step &rarr;"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
