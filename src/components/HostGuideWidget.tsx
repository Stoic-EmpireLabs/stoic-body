"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStoic } from "@/context/StoicContext";
import { getHostContextDirective } from "@/lib/onboarding";

export default function HostGuideWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeProfile,
    startTour,
    setIsOnboardingOpen,
    setIsLoginOpen,
    playBellSound,
  } = useStoic();

  const [isOpen, setIsOpen] = useState(false);

  const directive = getHostContextDirective(pathname, activeProfile);

  const handleAction = (route: string) => {
    playBellSound();
    setIsOpen(false);
    router.push(route);
  };

  const handleStartTour = () => {
    setIsOpen(false);
    startTour();
  };

  const handleOpenOnboarding = () => {
    setIsOpen(false);
    setIsOnboardingOpen(true);
  };

  const handleOpenLogin = () => {
    setIsOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <>
      {/* Floating Host Trigger Button in Bottom-Right */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#141420] via-black to-[#141420] border-2 border-amber-500/70 hover:border-amber-400 px-3.5 py-2.5 rounded-full shadow-2xl shadow-red-950/80 transition-all hover:scale-105 active:scale-95"
          title="Open Autonomous Sovereign Host Guide"
        >
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[1.5px] flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs">
              🤖
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-white font-mono flex items-center gap-1">
              <span>Host Guide</span>
            </div>
            <div className="text-[10px] text-amber-400 font-mono">
              Aethelgard
            </div>
          </div>
        </button>
      </div>

      {/* Host Companion Slide-over / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-950/95 border border-amber-500/30 ring-1 ring-white/10 rounded-2xl p-5 shadow-2xl shadow-red-950/80 text-white flex flex-col justify-between overflow-y-auto">
            
            {/* Top Bar */}
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 p-[1.5px] flex items-center justify-center">
                    <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center text-base">
                      🤖
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Aethelgard Companion
                    </h3>
                    <p className="text-[10px] text-amber-400 font-mono">
                      Host for: {activeProfile.callsign}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close companion guide"
                  className="text-zinc-400 hover:text-white text-xl font-bold p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition"
                >
                  &times;
                </button>
              </div>

              {/* Real-Time Context Directive */}
              <div className="bg-zinc-900/70 border border-amber-500/30 rounded-xl p-3.5 mb-4 shadow-sm">
                <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5 font-mono">
                  <span>⚡</span>
                  <span>{directive.title}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {directive.message}
                </p>
                <button
                  onClick={() => handleAction(directive.actionRoute)}
                  className="mt-2.5 text-[11px] font-mono font-bold text-amber-300 hover:text-white flex items-center gap-1 underline min-h-[32px]"
                >
                  {directive.suggestedAction} &rarr;
                </button>
              </div>

              {/* Host Quick Actions */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Host Guided Tools:
                </div>

                <button
                  onClick={handleStartTour}
                  className="w-full p-2.5 rounded-xl bg-[#14141E] border border-zinc-800 hover:border-amber-500/60 text-left flex items-center gap-2.5 transition text-xs group"
                >
                  <span className="text-base group-hover:scale-110 transition">🎓</span>
                  <div>
                    <div className="font-bold text-white group-hover:text-amber-400 transition">
                      Start / Replay App Tour
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Step-by-step walkthrough of all features
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleOpenOnboarding}
                  className="w-full p-2.5 rounded-xl bg-[#14141E] border border-zinc-800 hover:border-red-600/60 text-left flex items-center gap-2.5 transition text-xs group"
                >
                  <span className="text-base group-hover:scale-110 transition">📋</span>
                  <div>
                    <div className="font-bold text-white group-hover:text-amber-400 transition">
                      New Client Intake Questionnaire
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Recalibrate biometrics, fasting & tech goals
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleOpenLogin}
                  className="w-full p-2.5 rounded-xl bg-[#14141E] border border-zinc-800 hover:border-amber-500/60 text-left flex items-center gap-2.5 transition text-xs group"
                >
                  <span className="text-base group-hover:scale-110 transition">👤</span>
                  <div>
                    <div className="font-bold text-white group-hover:text-amber-400 transition">
                      Switch Profile / Client Log In
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Toggle between Founder Mode & Client Profiles
                    </div>
                  </div>
                </button>
              </div>

              {/* Navigation Shortcuts */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2">
                  Sovereign Deck Shortcuts:
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => handleAction("/nutrition")}
                    className="p-2 rounded-lg bg-[#14141E] border border-zinc-800 hover:border-zinc-700 text-left text-zinc-300 hover:text-white"
                  >
                    🥗 Meal Blueprints
                  </button>
                  <button
                    onClick={() => handleAction("/learning")}
                    className="p-2 rounded-lg bg-[#14141E] border border-zinc-800 hover:border-zinc-700 text-left text-zinc-300 hover:text-white"
                  >
                    🧠 AI Studio
                  </button>
                  <button
                    onClick={() => handleAction("/training")}
                    className="p-2 rounded-lg bg-[#14141E] border border-zinc-800 hover:border-zinc-700 text-left text-zinc-300 hover:text-white"
                  >
                    🥊 Boxing Arena
                  </button>
                  <button
                    onClick={() => handleAction("/calendar")}
                    className="p-2 rounded-lg bg-[#14141E] border border-zinc-800 hover:border-zinc-700 text-left text-zinc-300 hover:text-white"
                  >
                    📅 24h Calendar
                  </button>
                </div>
              </div>
            </div>

            {/* Host Wisdom Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 italic font-serif text-center">
              &ldquo;No man is free who is not master of himself.&rdquo; &mdash; Epictetus
            </div>

          </div>
        </div>
      )}
    </>
  );
}
