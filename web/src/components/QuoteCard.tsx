import React from 'react';
import { useGymStore } from '../store/useGymStore';
import { Quote, RefreshCw, Shield, Sparkles, Compass } from 'lucide-react';
import type { CoachPersonality } from '../types';

export const QuoteCard: React.FC = () => {
  const { currentQuote, coachPersonality, setCoachPersonality, shuffleQuote } = useGymStore();

  const personalityLabels: Record<CoachPersonality, { name: string; tag: string; icon: React.ReactNode; color: string }> = {
    marine: {
      name: 'Marine Combat Creed',
      tag: 'USMC · SEMPER FI',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-red-950/40 text-red-300 border-red-800/40',
    },
    stoic: {
      name: 'Classical Stoic',
      tag: 'MARCUS AURELIUS & SENECA',
      icon: <Compass className="w-3.5 h-3.5" />,
      color: 'bg-amber-950/40 text-[#D9A184] border-[#D9A184]/40',
    },
    coach: {
      name: 'High Performance',
      tag: 'PERIODIZATION & OVERLOAD',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    },
  };

  const currentMeta = personalityLabels[coachPersonality] || personalityLabels.marine;

  return (
    <div className="bg-[#161514] border border-[#262422] rounded-[28px] p-6 shadow-xl space-y-4 relative overflow-hidden transition-all">
      {/* Background ambient accent */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#D9A184]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${currentMeta.color}`}
          >
            {currentMeta.icon}
            {currentMeta.tag}
          </span>
          <span className="text-xs text-neutral-400 font-bold hidden sm:inline">
            Daily Discipline
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Personality Quick Selectors */}
          <div className="flex bg-[#100F0E] p-1 rounded-xl border border-[#242220]">
            {(['marine', 'stoic', 'coach'] as CoachPersonality[]).map((p) => {
              const active = coachPersonality === p;
              const titles = { marine: 'USMC', stoic: 'Stoic', coach: 'Coach' };
              return (
                <button
                  key={p}
                  onClick={() => setCoachPersonality(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                    active
                      ? 'bg-white text-[#140D09] shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={`Switch voice to ${personalityLabels[p].name}`}
                >
                  {titles[p]}
                </button>
              );
            })}
          </div>

          {/* Shuffle Button */}
          <button
            onClick={shuffleQuote}
            className="p-2 rounded-xl bg-[#201D1B] hover:bg-[#2A2724] border border-[#302C28] text-neutral-300 hover:text-white transition-all active:scale-95 shadow"
            title="Draw another quote"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D9A184]" />
          </button>
        </div>
      </div>

      {/* Quote Content */}
      <div className="space-y-2 pt-1">
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed italic tracking-tight flex items-start gap-2">
          <Quote className="w-5 h-5 text-[#D9A184] flex-shrink-0 mt-1 rotate-180 opacity-60" />
          <span>"{currentQuote?.text || 'Discipline equals freedom.'}"</span>
        </p>

        <div className="flex items-center justify-between text-xs text-neutral-400 pl-7 pt-1">
          <span className="font-extrabold text-[#D9A184]">
            — {currentQuote?.author || 'Stoic Body Standard'}
          </span>
          {currentQuote?.source && (
            <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
              {currentQuote.source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
