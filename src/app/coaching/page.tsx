"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStoic } from "@/context/StoicContext";
import {
  AUTHENTICATED_STOIC_QUOTES,
  PRESET_INQUIRIES,
  resolveStoicOracleGuidance,
  generateCoachingDialogue,
  CoachingTone,
  AuthenticatedQuote,
  OracleGuidance,
} from "@/lib/coaching";
import {
  Shield,
  Flame,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  Send,
  History,
  RotateCcw,
} from "lucide-react";

interface SavedAudit {
  id: string;
  timestamp: string;
  reflection: string;
  tone: CoachingTone;
}

export default function CoachingPage() {
  const {
    totalXp,
    streakDays,
    levelInfo,
    dailyTasks,
    userProfile,
    activeProfile,
    awardXp,
    playBellSound,
    playAnvilChime,
    playBoxingBell,
  } = useStoic();

  const [tone, setTone] = useState<CoachingTone>("grill_me");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("fasting-temptation");
  const [customDilemma, setCustomDilemma] = useState("");
  const [activeDilemmaText, setActiveDilemmaText] = useState(
    PRESET_INQUIRIES[0].dilemma
  );
  const [directiveExecuted, setDirectiveExecuted] = useState(false);

  // Quote vault state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedQuote, setSelectedQuote] = useState<AuthenticatedQuote>(
    AUTHENTICATED_STOIC_QUOTES[0]
  );

  // Evening Audit state
  const [reflectionText, setReflectionText] = useState("");
  const [recentAudits, setRecentAudits] = useState<SavedAudit[]>([]);

  // Load saved audits on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stoic_evening_audits");
      if (saved) {
        setRecentAudits(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
  }, []);

  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const pendingCount = dailyTasks.length - completedCount;

  // Build coaching context from live user profile
  const founderContext = useMemo(() => {
    return {
      founderName: activeProfile?.name || userProfile?.name || "Stoic",
      currentLevel: levelInfo?.level || 1,
      streakDays: streakDays || 1,
      pendingTaskCount: pendingCount,
      completedTaskCount: completedCount,
      weightLbs: activeProfile?.currentWeight || userProfile?.currentWeight || 170.0,
      targetWeightLbs: activeProfile?.targetWeight || userProfile?.targetWeight || 155.0,
      isFatigued: false,
      dietType: activeProfile?.fastingProtocol || userProfile?.diet || "23:1 OMAD",
    };
  }, [activeProfile, userProfile, levelInfo, streakDays, pendingCount, completedCount]);

  // Daily dialogue banner
  const dailyDialogue = useMemo(() => {
    return generateCoachingDialogue(founderContext, tone);
  }, [founderContext, tone]);

  // Active Oracle Guidance
  const oracleGuidance: OracleGuidance = useMemo(() => {
    return resolveStoicOracleGuidance(activeDilemmaText, tone, founderContext);
  }, [activeDilemmaText, tone, founderContext]);

  // Handle Preset Selection
  const handleSelectPreset = (id: string, text: string) => {
    setSelectedInquiryId(id);
    setActiveDilemmaText(text);
    setDirectiveExecuted(false);
  };

  // Handle Custom Dilemma Consultation
  const handleConsultCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDilemma.trim()) return;
    setSelectedInquiryId("custom");
    setActiveDilemmaText(customDilemma.trim());
    setDirectiveExecuted(false);
  };

  // Claim Tactical Directive XP
  const handleExecuteDirective = () => {
    if (directiveExecuted) return;
    setDirectiveExecuted(true);
    playBoxingBell();
    awardXp(100, "Oracle Tactical Directive Executed", "discipline");
  };

  // Seal Evening Audit
  const handleSealAudit = () => {
    if (!reflectionText.trim()) return;
    playAnvilChime();
    awardXp(250, "Evening Stoic Audit Sealed", "discipline");

    const newAudit: SavedAudit = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      reflection: reflectionText.trim(),
      tone,
    };

    const updated = [newAudit, ...recentAudits].slice(0, 5);
    setRecentAudits(updated);
    setReflectionText("");

    try {
      localStorage.setItem("stoic_evening_audits", JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    if (selectedCategory === "all") return AUTHENTICATED_STOIC_QUOTES;
    return AUTHENTICATED_STOIC_QUOTES.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION WITH TONE SWITCHER */}
      <section className="bg-gradient-to-r from-[#0E0608] via-[#0A0A0F] to-[#120D05] border border-red-950/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase tracking-wider text-white">
              Socratic Stoic Oracle &amp; Advisory
            </h1>
            <span className="text-[10px] bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
              Autonomous Guidance Engine
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Interrogate weakness, dispel rationalizations, and separate what is within your control from what is external noise. Backed by verified citations from Marcus Aurelius, Epictetus, and Seneca.
          </p>
        </div>

        {/* TONE SWITCHER PILLS */}
        <div className="flex flex-wrap bg-black/90 p-1.5 rounded-xl border border-red-950/80 gap-1 shrink-0">
          <button
            onClick={() => {
              setTone("grill_me");
              playBellSound();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tone === "grill_me"
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white border border-red-500/60 shadow-lg shadow-red-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🥊</span>
            <span>Grill Me (High Pressure)</span>
          </button>
          <button
            onClick={() => {
              setTone("direct_centurion");
              playBellSound();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tone === "direct_centurion"
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500/60 shadow-lg shadow-amber-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>⚔️</span>
            <span>Centurion (Tactical)</span>
          </button>
          <button
            onClick={() => {
              setTone("philosophical_stoic");
              playBellSound();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              tone === "philosophical_stoic"
                ? "bg-gradient-to-r from-stone-800 to-stone-900 text-amber-200 border border-amber-500/50 shadow-lg shadow-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🏛️</span>
            <span>Citadel (Reason)</span>
          </button>
        </div>
      </section>

      {/* SECTION 1: SOCRATIC ORACLE ENGINE (CORE UPGRADE) */}
      <section className="bg-[#0A0A0F] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Sovereign Socratic Oracle
              </h2>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                Dichotomy of Control Solver
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Select a frequent friction point or describe your obstacle below for instant philosophical triage.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Streak: <strong className="text-amber-400">{founderContext.streakDays}d</strong></span>
            <span>&bull;</span>
            <span>Level: <strong className="text-amber-400">{founderContext.currentLevel}</strong></span>
          </div>
        </div>

        {/* PRESET FRICTION CHIPS */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Quick Dilemma Inquiries:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_INQUIRIES.map((preset) => {
              const isActive = selectedInquiryId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id, preset.dilemma)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border text-left flex items-center gap-2 ${
                    isActive
                      ? "bg-red-950/80 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40"
                      : "bg-[#121218] border-red-950/60 text-slate-300 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-400/90 border border-white/5">
                    {preset.category}
                  </span>
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOM INQUIRY SUBMIT */}
        <form onSubmit={handleConsultCustom} className="flex gap-2">
          <input
            type="text"
            value={customDilemma}
            onChange={(e) => setCustomDilemma(e.target.value)}
            placeholder="Or write your current friction (e.g. 'Feeling resistance before cold shower' or 'Impostor syndrome with new client')..."
            className="flex-1 bg-black/80 border border-red-950/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
          <button
            type="submit"
            disabled={!customDilemma.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition border border-red-600/50 flex items-center gap-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consult</span>
          </button>
        </form>

        {/* ACTIVE RESOLVED GUIDANCE CARD */}
        <div className="bg-[#0E0608]/90 border border-amber-500/40 rounded-xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Oracle Verdict:
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                {oracleGuidance.verdictTitle}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-red-950/90 text-amber-300 px-2.5 py-1 rounded border border-amber-500/40 font-mono font-bold block sm:inline-block">
                {oracleGuidance.quote.author} &bull; {oracleGuidance.quote.citation}
              </span>
            </div>
          </div>

          {/* DICHOTOMY OF CONTROL VISUALIZER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WITHIN SOVEREIGN CONTROL */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Within Sovereign Control (Act Decisively)
                </h4>
              </div>
              <ul className="space-y-2">
                {oracleGuidance.withinControl.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="text-emerald-400 font-mono font-bold text-xs mt-0.5">✓</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* OUTSIDE SOVEREIGN CONTROL */}
            <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                  Outside Sovereign Control (Disregard &amp; Surrender)
                </h4>
              </div>
              <ul className="space-y-2">
                {oracleGuidance.outsideControl.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-red-400 font-mono font-bold text-xs mt-0.5">✗</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5-MINUTE TACTICAL ACTION DIRECTIVE */}
          <div className="bg-black/80 border border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Next 120-Second Tactical Directive:</span>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">
                {oracleGuidance.tacticalActionDirective}
              </p>
            </div>
            <button
              onClick={handleExecuteDirective}
              disabled={directiveExecuted}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shrink-0 shadow flex items-center gap-2 ${
                directiveExecuted
                  ? "bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 cursor-default"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-950/50"
              }`}
            >
              {directiveExecuted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Executed (+100 XP Claimed)</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Execute Now &amp; Claim +100 XP</span>
                </>
              )}
            </button>
          </div>

          {/* INVERSION EXERCISE (PREMEDITATIO MALORUM) */}
          <div className="bg-stone-900/40 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
            <span className="text-lg">🔮</span>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">Premeditatio Malorum (Mental Inversion):</strong>
              <span className="italic leading-relaxed">{oracleGuidance.inversionExercise}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STANDALONE ACTIVE COACHING BANNER */}
      <section
        className={`border rounded-2xl p-6 shadow-2xl transition-all ${
          tone === "grill_me"
            ? "bg-[#0E0608] border-red-700/60"
            : tone === "direct_centurion"
            ? "bg-[#0E0B05] border-amber-600/60"
            : "bg-[#0C0B10] border-amber-700/40"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
              tone === "grill_me"
                ? "bg-red-950/80 text-red-300 border-red-600/50"
                : tone === "direct_centurion"
                ? "bg-amber-950/80 text-amber-300 border-amber-600/50"
                : "bg-stone-900/80 text-amber-200 border-amber-600/40"
            }`}
          >
            Live Advisor Tone: {dailyDialogue.headline}
          </span>
          <span className="text-xs font-mono font-bold text-amber-300">
            Day {founderContext.streakDays} &bull; 170 &rarr; 155 lbs (Abs Protocol)
          </span>
        </div>

        <p className="text-white leading-relaxed font-serif text-lg italic my-4">
          &ldquo;{dailyDialogue.content}&rdquo;
        </p>

        <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400">Tactical Directive:</span>
            <div className="text-xs font-bold text-white mt-0.5">{dailyDialogue.actionPrompt}</div>
          </div>
          <button
            onClick={() => {
              playBoxingBell();
              awardXp(50, "Advisor Directive Acknowledged", "discipline");
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow shrink-0"
          >
            Acknowledge &amp; Execute (+50 XP)
          </button>
        </div>
      </section>

      {/* SECTION 3: AUTHENTICATED HISTORICAL CITATION VAULT */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Verified Classical Stoic Texts
              </h3>
              <span className="text-[10px] bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
                Exact Book &amp; Section Citations
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Zero synthetic quotes. Every passage is verified against primary translations of Meditations, Letters from a Stoic, Discourses, and Enchiridion.
            </p>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="flex flex-wrap bg-black/80 p-1 rounded-xl border border-red-950/70 gap-1 text-xs">
            {["all", "discipline", "action", "adversity", "focus", "temperance"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                  selectedCategory === cat
                    ? "bg-red-900/80 text-amber-300 border border-amber-500/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEATURED SELECTED QUOTE DISPLAY */}
        <div className="bg-[#121218] border border-red-950/70 rounded-xl p-6 relative overflow-hidden">
          <div className="text-amber-400 font-serif text-5xl opacity-15 absolute top-2 right-4 pointer-events-none">
            &ldquo;
          </div>
          <p className="text-base text-white font-serif italic mb-4 leading-relaxed">
            &ldquo;{selectedQuote.text}&rdquo;
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-t border-red-950/70 pt-3 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="text-amber-400 font-bold text-sm">{selectedQuote.author}</strong>
              <span className="text-red-700">&bull;</span>
              <span className="text-slate-200 italic font-medium">{selectedQuote.work}</span>
              <span className="text-red-700">&bull;</span>
              <span className="font-mono text-white bg-black px-2 py-0.5 rounded text-[11px] border border-red-950/80 font-bold">
                {selectedQuote.citation}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 font-bold w-fit">
              {selectedQuote.category}
            </span>
          </div>
        </div>

        {/* QUOTE SELECTOR TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredQuotes.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuote(q)}
              className={`p-3.5 rounded-xl border text-left text-xs transition space-y-1.5 ${
                selectedQuote.id === q.id
                  ? "bg-red-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-md"
                  : "bg-black/90 border-red-950/60 text-slate-300 hover:text-white hover:border-red-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate">{q.author}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-amber-400/90 border border-white/5">
                  {q.category}
                </span>
              </div>
              <div className="text-[11px] text-amber-400/80 truncate font-medium">{q.work}</div>
              <p className="text-[11px] text-slate-400 line-clamp-2 italic font-serif">
                &ldquo;{q.text}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 4: SENECA EVENING AUDIT & PERMANENT LOG */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Seneca Evening Audit &amp; Daily Seal
              </h3>
              <span className="text-[10px] bg-red-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
                De Ira &bull; Book III
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              &ldquo;When the light has been removed and my wife has fallen silent, I examine my entire day and go back over what I've done and said.&rdquo; &ndash; Seneca
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-red-950/80 px-3 py-1 rounded-lg border border-amber-500/40 shrink-0">
            +250 XP Reward
          </span>
        </div>

        {/* INPUT BOX */}
        <div className="space-y-3">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="1. What virtue did you cultivate today?&#10;2. Where did you bargain with discomfort or hesitate?&#10;3. What will you do better at dawn tomorrow?"
            rows={4}
            className="w-full bg-black/90 border border-red-950/80 rounded-xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition leading-relaxed"
          />
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-mono">
              Written entries are sealed into local state and award full XP.
            </span>
            <button
              onClick={handleSealAudit}
              disabled={!reflectionText.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950/50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Seal Audit &amp; Claim +250 XP</span>
            </button>
          </div>
        </div>

        {/* RECENT SEALED AUDITS LOG */}
        {recentAudits.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Archived Evening Audits:</span>
            </h4>
            <div className="space-y-2.5">
              {recentAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="bg-[#121218] border border-red-950/60 rounded-xl p-4 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {audit.timestamp}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black text-slate-300 border border-white/5">
                      Tone: {audit.tone}
                    </span>
                  </div>
                  <p className="text-slate-200 italic font-serif leading-relaxed">
                    &ldquo;{audit.reflection}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
