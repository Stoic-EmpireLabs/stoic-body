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
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Multi-Tone Stoic Advisory &amp; Authenticated Wisdom</span>
            <span className="text-[10px] bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
              Socratic &bull; Centurion &bull; Classical
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time accountability dialogue paired with verified classical citations from Seneca, Epictetus, and Marcus Aurelius.
          </p>
        </div>

        {/* TONE SWITCHER PILLS */}
        <div className="flex bg-black p-1 rounded-lg border border-red-950/80">
          <button
            onClick={() => setTone("grill_me")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tone === "grill_me"
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white border border-red-500/60 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🥊 Grill Me
          </button>
          <button
            onClick={() => setTone("direct_centurion")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tone === "direct_centurion"
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500/60 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            ⚔️ Direct Centurion
          </button>
          <button
            onClick={() => setTone("philosophical_stoic")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              tone === "philosophical_stoic"
                ? "bg-gradient-to-r from-indigo-700 to-indigo-800 text-white border border-indigo-500/60 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🏛️ Stoic Citadel
          </button>
        </div>
      </section>

      {/* ACTIVE COACHING DIALOGUE CARD */}
      <section
        className={`border rounded-xl p-6 shadow-2xl transition-all ${
          tone === "grill_me"
            ? "bg-[#0E0608] border-red-700/60"
            : tone === "direct_centurion"
            ? "bg-[#0E0B05] border-amber-600/60"
            : "bg-[#080812] border-indigo-600/60"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
              tone === "grill_me"
                ? "bg-red-950/80 text-red-300 border-red-600/50"
                : tone === "direct_centurion"
                ? "bg-amber-950/80 text-amber-300 border-amber-600/50"
                : "bg-indigo-950/80 text-indigo-300 border-indigo-600/50"
            }`}
          >
            Advisor: {dialogue.headline}
          </span>
          <span className="text-xs font-mono font-bold text-amber-300">Context: Day {founderContext.streakDays} &bull; 170 &rarr; 155 lbs</span>
        </div>

        <p className="text-white leading-relaxed font-serif text-lg italic my-4">
          &ldquo;{dialogue.content}&rdquo;
        </p>

        <div className="bg-black/60 border border-white/10 rounded-lg p-3.5 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400">Tactical Directive:</span>
            <div className="text-xs font-bold text-white mt-0.5">{dialogue.actionPrompt}</div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow shrink-0">
            Acknowledge &amp; Execute
          </button>
        </div>
      </section>

      {/* AUTHENTICATED HISTORICAL CITATION VAULT */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Verified Classical Stoic Texts</span>
            <span className="text-[10px] bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
              Exact Book &amp; Section Citations
            </span>
          </h3>
          <span className="text-xs text-amber-300 font-mono font-bold">
            {AUTHENTICATED_STOIC_QUOTES.length} Canonical Sources
          </span>
        </div>

        {/* FEATURED AUTHENTIC QUOTE */}
        <div className="bg-[#121218] border border-red-950/70 rounded-xl p-5 relative overflow-hidden">
          <div className="text-amber-400 font-serif text-4xl opacity-20 absolute top-2 right-4">&ldquo;</div>
          <p className="text-sm text-white font-serif italic mb-3">
            &ldquo;{selectedQuote.text}&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs border-t border-red-950/70 pt-3">
            <div className="flex items-center gap-2">
              <strong className="text-amber-400 font-bold">{selectedQuote.author}</strong>
              <span className="text-red-700">&bull;</span>
              <span className="text-slate-200 italic font-medium">{selectedQuote.work}</span>
              <span className="text-red-700">&bull;</span>
              <span className="font-mono text-white bg-black px-2 py-0.5 rounded text-[11px] border border-red-950/80 font-bold">
                {selectedQuote.citation}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
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
                  ? "bg-red-950/50 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-sm"
                  : "bg-black border-red-950/60 text-slate-300 hover:text-white"
              }`}
            >
              <div className="font-bold truncate text-white">{q.author}</div>
              <div className="text-[10px] text-amber-400/80 truncate font-medium">{q.work}</div>
            </button>
          ))}
        </div>
      </section>

      {/* EVENING STOIC REFLECTION & XP SEAL */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Evening Audit &amp; Daily Seal (Seneca Evening Review)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              &ldquo;When the light has been removed and my wife has fallen silent, I examine my entire day and go back over what I've done and said.&rdquo; &ndash; Seneca
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-red-950/80 px-2.5 py-0.5 rounded border border-amber-500/40">
            +250 XP Reward
          </span>
        </div>

        {reflectionSealed ? (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-700/60 text-white text-xs flex items-center justify-between">
            <div>
              <span className="font-bold block text-sm text-amber-300">✓ Evening Stoic Audit Sealed</span>
              <span className="text-white mt-1 block italic font-serif">
                &ldquo;{reflectionText}&rdquo;
              </span>
              <span className="text-[10px] text-amber-400 font-mono mt-2 block font-bold">
                Archived into encrypted local SQLite &bull; +250 XP Awarded
              </span>
            </div>
            <button
              onClick={() => setReflectionSealed(false)}
              className="text-xs underline text-amber-400 hover:text-white font-bold"
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
              className="w-full bg-black border border-red-950/80 rounded-lg p-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSealReflection}
                disabled={!reflectionText.trim()}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider transition shadow"
              >
                Seal Audit &amp; Claim +250 XP
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
