"use client";

import React, { useEffect, useState } from "react";
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

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = APP_TOUR_STEPS[currentTourStep] || APP_TOUR_STEPS[0];
  const isFirst = currentTourStep === 0;
  const isLast = currentTourStep === APP_TOUR_STEPS.length - 1;

  // Auto-route to the matching screen if needed
  useEffect(() => {
    if (isTourOpen && currentStep && currentStep.route !== pathname) {
      router.push(currentStep.route);
    }
  }, [isTourOpen, currentTourStep, currentStep, pathname, router]);

  // Track target tab bounding client rect for real-time spotlight & arrow placement
  useEffect(() => {
    if (!isTourOpen || !currentStep) return;

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 300);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isTourOpen, currentTourStep, currentStep, pathname]);

  // Keyboard navigation: Left/Right arrows and Escape
  useEffect(() => {
    if (!isTourOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (!isLast) nextTourStep();
      } else if (e.key === "ArrowLeft") {
        if (!isFirst) prevTourStep();
      } else if (e.key === "Escape") {
        closeTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourOpen, isFirst, isLast, nextTourStep, prevTourStep, closeTour]);

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

  const handlePreviewTab = () => {
    if (currentStep.route !== pathname) {
      router.push(currentStep.route);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end sm:justify-center items-center p-4">
      {/* Semi-transparent dark overlay */}
      <div
        onClick={closeTour}
        className="absolute inset-0 bg-black/80 backdrop-blur-[3px] pointer-events-auto transition-opacity"
      />

      {/* PHYSICAL TAB SPOTLIGHT HIGHLIGHTER */}
      {targetRect && (
        <>
          {/* Glowing pulse ring over the exact navigation tab */}
          <div
            style={{
              position: "fixed",
              top: `${Math.max(0, targetRect.top - 4)}px`,
              left: `${Math.max(0, targetRect.left - 4)}px`,
              width: `${targetRect.width + 8}px`,
              height: `${targetRect.height + 8}px`,
              zIndex: 55,
              pointerEvents: "none",
            }}
            className="rounded-xl border-2 border-amber-400 ring-4 ring-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.8)] animate-pulse"
          />

          {/* Animated pointer indicator aiming directly at the tab */}
          <div
            style={{
              position: "fixed",
              top: `${Math.max(0, targetRect.bottom + 8)}px`,
              left: `${Math.max(0, targetRect.left + targetRect.width / 2 - 40)}px`,
              zIndex: 56,
              pointerEvents: "none",
            }}
            className="flex flex-col items-center animate-bounce"
          >
            <div className="w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" />
            <span className="text-[10px] bg-gradient-to-r from-amber-500 to-red-600 text-black font-mono font-black px-2.5 py-0.5 rounded shadow-lg whitespace-nowrap tracking-wider uppercase">
              Spotlight Tab
            </span>
          </div>
        </>
      )}

      {/* 2026 LIQUID OBSIDIAN GLASSMORPHISM TOUR CARD */}
      <div className="relative z-50 w-full max-w-lg bg-zinc-950/90 backdrop-blur-2xl border border-amber-500/40 ring-1 ring-amber-500/20 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] pointer-events-auto animate-fade-in text-white mb-4 sm:mb-0">
        
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header: Host Avatar & Step Counter */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[2px] shadow-lg shadow-amber-950/50">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-lg">
                🤖
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Aethelgard &bull; Host Tour
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 uppercase font-mono font-bold">
                  Interactive Tab Spotlight
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-amber-400 font-mono font-bold">
                  Step {currentStep.stepNumber} of {APP_TOUR_STEPS.length}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  &bull; Tab: <strong className="text-white">{currentStep.tabLabel}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Close / Skip button */}
          <button
            onClick={closeTour}
            className="text-zinc-400 hover:text-white text-xs font-mono px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] transition"
            title="Exit tour anytime"
          >
            Skip &times;
          </button>
        </div>

        {/* Step Title & Subtitle */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-amber-400 font-serif tracking-wide">
              {currentStep.title}
            </h3>
            <button
              onClick={handlePreviewTab}
              type="button"
              className="text-[11px] font-mono font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition shrink-0"
              title="Navigate directly to this tab"
            >
              Preview Live ↗
            </button>
          </div>
          <p className="text-xs text-zinc-300 font-mono mt-0.5">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Host Narration */}
        <div className="bg-zinc-900/80 border-l-4 border-amber-500 rounded-r-xl p-3.5 mb-4 text-xs text-zinc-200 leading-relaxed shadow-inner">
          {currentStep.hostDialogue}
        </div>

        {/* Action Hint */}
        <div className="flex items-center gap-2 text-[11px] text-amber-300/95 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg mb-5">
          <span>💡</span>
          <span>{currentStep.actionHint}</span>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {APP_TOUR_STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentTourStep
                    ? "w-6 bg-gradient-to-r from-red-500 to-amber-400"
                    : idx < currentTourStep
                    ? "w-2 bg-amber-500/50"
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
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition"
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
