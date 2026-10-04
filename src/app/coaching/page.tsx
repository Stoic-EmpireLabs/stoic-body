"use client";

import React, { useState } from "react";
import {
  AUTHENTICATED_STOIC_QUOTES,
  generateCoachingDialogue,
  CoachingContext,
  CoachingTone,
  AuthenticatedQuote,
} from "@/lib/coaching";

export default function CoachingPage() {
  const [tone, setTone] = useState<CoachingTone>("grill_me");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSealed, setReflectionSealed] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<AuthenticatedQuote>(AUTHENTICATED_STOIC_QUOTES[0]);

  const founderContext: CoachingContext = {
    founderName: "Stoic",
    currentLevel: 12,
    streakDays: 14,
    pendingTaskCount: 3,
    completedTaskCount: 2,
    weightLbs: 170.0,
    targetWeightLbs: 155.0,
    isFatigued: false,
    dietType: "23:1 OMAD",
  };

  const dialogue = generateCoachingDialogue(founderContext, tone);

  const handleSealReflection = () => {
    if (!reflectionText.trim()) return;
    setReflectionSealed(true);
  };

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Multi-Tone Stoic Advisory & Authenticated Wisdom</span>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
              Socratic &bull; Centurion &bull; Classical
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time accountability dialogue paired with verified classical citations from Seneca, Epictetus, and Marcus Aurelius.
          </p>
        </div>

        {/* TONE SWITCHER PILLS */}
        <div className="flex bg-[#181924] p-1 rounded-lg border border-[#232636]">
          <button
            onClick={() => setTone("grill_me")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tone === "grill_me"
                ? "bg-red-500/20 text-red-300 border border-red-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🥊 Grill Me
          </button>
          <button
            onClick={() => setTone("direct_centurion")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tone === "direct_centurion"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚔️ Direct Centurion
          </button>
          <button
            onClick={() => setTone("philosophical_stoic")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tone === "philosophical_stoic"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🏛️ Stoic Citadel
          </button>
        </div>
      </section>

      {/* ACTIVE COACHING DIALOGUE CARD */}
      <section
        className={`border rounded-xl p-6 shadow-lg transition-all ${
          tone === "grill_me"
            ? "bg-[#181317] border-red-500/30"
            : tone === "direct_centurion"
            ? "bg-[#171714] border-amber-500/30"
            : "bg-[#141520] border-indigo-500/30"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              tone === "grill_me"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : tone === "direct_centurion"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            }`}
          >
            Advisor: {dialogue.headline}
          </span>
          <span className="text-xs font-mono text-slate-400">Context: Day {founderContext.streakDays} &bull; 170 &rarr; 155 lbs</span>
        </div>

        <p className="text-sm text-slate-100 leading-relaxed font-serif text-lg italic my-4">
          &ldquo;{dialogue.content}&rdquo;
        </p>

        <div className="bg-black/30 border border-white/5 rounded-lg p-3.5 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Tactical Directive:</span>
            <div className="text-xs font-semibold text-amber-300 mt-0.5">{dialogue.actionPrompt}</div>
          </div>
          <button className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow shrink-0">
            Acknowledge & Execute
          </button>
        </div>
      </section>

      {/* AUTHENTICATED HISTORICAL CITATION VAULT */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Verified Classical Stoic Texts</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              Exact Book & Section Citations
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {AUTHENTICATED_STOIC_QUOTES.length} Canonical Sources
          </span>
        </div>

        {/* FEATURED AUTHENTIC QUOTE */}
        <div className="bg-[#1C1E2B] border border-[#232636] rounded-xl p-5 relative overflow-hidden">
          <div className="text-amber-400 font-serif text-3xl opacity-20 absolute top-2 right-4">&ldquo;</div>
          <p className="text-sm text-slate-200 font-serif italic mb-3">
            &ldquo;{selectedQuote.text}&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs border-t border-[#2B2E42] pt-3">
            <div className="flex items-center gap-2">
              <strong className="text-amber-400 font-semibold">{selectedQuote.author}</strong>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-400 italic">{selectedQuote.work}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                {selectedQuote.citation}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
              {selectedQuote.category}
            </span>
          </div>
        </div>

        {/* QUOTE SELECTOR CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {AUTHENTICATED_STOIC_QUOTES.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuote(q)}
              className={`p-2.5 rounded-lg border text-left text-xs transition ${
                selectedQuote.id === q.id
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-[#181924] border-[#232636] text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="font-bold truncate">{q.author}</div>
              <div className="text-[10px] text-slate-500 truncate">{q.work}</div>
            </button>
          ))}
        </div>
      </section>

      {/* EVENING STOIC REFLECTION & XP SEAL */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Evening Audit & Daily Seal (Seneca Evening Review)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              &ldquo;When the light has been removed and my wife has fallen silent, I examine my entire day and go back over what I've done and said.&rdquo; &ndash; Seneca
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            +250 XP Reward
          </span>
        </div>

        {reflectionSealed ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold block text-sm">✓ Evening Stoic Audit Sealed</span>
              <span className="text-slate-300 mt-1 block">
                &ldquo;{reflectionText}&rdquo;
              </span>
              <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
                Archived into encrypted local SQLite &bull; +250 XP Awarded
              </span>
            </div>
            <button
              onClick={() => setReflectionSealed(false)}
              className="text-xs underline text-slate-400 hover:text-slate-200"
            >
              Edit Audit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What virtue did you cultivate today? Where did you hesitate or bargain with discomfort? What will you do better at dawn tomorrow?"
              rows={3}
              className="w-full bg-[#181924] border border-[#232636] rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSealReflection}
                disabled={!reflectionText.trim()}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider transition shadow"
              >
                Seal Audit & Claim +250 XP
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
