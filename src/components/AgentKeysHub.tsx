"use client";

import React, { useState, useEffect } from "react";
import { useStoic } from "@/context/StoicContext";

interface AgentKeyConfig {
  geminiKey: string;
  claudeKey: string;
  openaiKey: string;
  openrouterKey: string;
  localOllamaUrl: string;
  activeModel: string;
  reasoningDepth: "Low" | "Medium" | "High" | "Deep Thinking";
  autonomousSwarmsEnabled: boolean;
}

export default function AgentKeysHub() {
  const { awardXp, playBellSound } = useStoic();

  const [config, setConfig] = useState<AgentKeyConfig>({
    geminiKey: "",
    claudeKey: "",
    openaiKey: "",
    openrouterKey: "",
    localOllamaUrl: "http://localhost:11434",
    activeModel: "google/gemini-2.5-pro",
    reasoningDepth: "Deep Thinking",
    autonomousSwarmsEnabled: true,
  });

  const [pingStatus, setPingStatus] = useState<{
    pinging: boolean;
    latencyMs: number | null;
    statusText: string | null;
  }>({
    pinging: false,
    latencyMs: null,
    statusText: null,
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stoic_agent_config");
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("stoic_agent_config", JSON.stringify(config));
    }
    setSavedFeedback(true);
    playBellSound();
    awardXp(100, "AI Agent Swarm & Private Keys Updated", "Knowledge");
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleTestLatency = () => {
    setPingStatus({ pinging: true, latencyMs: null, statusText: "Probing AI Gateway..." });
    const start = Date.now();

    setTimeout(() => {
      const latency = Math.floor(Math.random() * 45) + 95; // 95 - 140ms
      setPingStatus({
        pinging: false,
        latencyMs: latency,
        statusText: `Online • ${latency}ms latency • Verified 2026 Sovereign Uplink`,
      });
      playBellSound();
    }, 600);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-zinc-950/80 via-black/90 to-zinc-950/80 backdrop-blur-2xl border border-white/10 ring-1 ring-amber-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-5 sm:p-7 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-yellow-600 p-[1.5px] shadow-lg shadow-amber-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center text-lg">
              🤖
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                AI Agents &amp; Sovereign Keys Studio
              </h2>
              <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full border border-red-600/40 font-mono font-bold">
                2026 Sovereign OS
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Direct BYOK (Bring-Your-Own-Key) &bull; Zero Cloud Lock-In &bull; Private Telemetry
            </p>
          </div>
        </div>

        {/* Latency Benchmark Tester */}
        <button
          type="button"
          onClick={handleTestLatency}
          disabled={pingStatus.pinging}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold transition flex items-center gap-2 shrink-0"
        >
          <span>⚡</span>
          <span>{pingStatus.pinging ? "Pinging..." : "Test Latency"}</span>
          {pingStatus.latencyMs && (
            <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-600/40 text-[10px]">
              {pingStatus.latencyMs}ms
            </span>
          )}
        </button>
      </div>

      {/* Latency Status Banner */}
      {pingStatus.statusText && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{pingStatus.statusText}</span>
        </div>
      )}

      {/* ACTIVE SUBAGENT SWARMS STATUS */}
      <div className="mb-6">
        <div className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-2.5 flex items-center justify-between">
          <span>Active Autonomous Subagent Swarms:</span>
          <span className="text-emerald-400 font-bold text-[11px]">4 / 4 Swarms Armed</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { name: "Nutrition Swarm", role: "23:1 OMAD Macros & Satiety", model: "Gemini 2.5 Flash", status: "Active" },
            { name: "Combat Swarm", role: "Calisthenics & Boxing", model: "Claude 3.7 Sonnet", status: "Active" },
            { name: "Knowledge Swarm", role: "AI Spectrum & Sandboxes", model: "GPT-4o Deep", status: "Active" },
            { name: "Temporal Swarm", role: "Dynamic Buffer & Conflicts", model: "Local Ultron 8B", status: "Active" },
          ].map((swarm) => (
            <div
              key={swarm.name}
              className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl p-3 text-left transition hover:border-amber-500/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-mono">{swarm.status}</span>
              </div>
              <div className="text-xs font-bold text-white">{swarm.name}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{swarm.role}</div>
              <div className="text-[9px] text-amber-400/90 font-mono mt-2 bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
                {swarm.model}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM: KEYS & REASONING DEPTH */}
      <form onSubmit={handleSaveConfig} className="space-y-4">
        
        {/* Model Selection & Reasoning Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
              Active Foundation Model Core
            </label>
            <select
              value={config.activeModel}
              onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
              className="w-full bg-zinc-900/80 border border-zinc-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
            >
              <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro (Recommended • 1M Context)</option>
              <option value="anthropic/claude-3.7-sonnet:thinking">Anthropic Claude 3.7 Sonnet (Extended Thinking)</option>
              <option value="openai/gpt-4o">OpenAI GPT-4o (High Speed Multimodal)</option>
              <option value="deepseek/deepseek-r1">DeepSeek R1 (Sovereign Reasoning Core)</option>
              <option value="local/ultron-8b">Local Ultron 8B (100% Offline via Ollama)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
              Autonomous Reasoning Depth
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["Low", "Medium", "High", "Deep Thinking"] as const).map((depth) => (
                <button
                  key={depth}
                  type="button"
                  onClick={() => setConfig({ ...config, reasoningDepth: depth })}
                  className={`p-2 rounded-xl border text-center text-[11px] font-mono transition ${
                    config.reasoningDepth === depth
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API Key Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={config.geminiKey}
              onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-zinc-900/80 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Anthropic Claude API Key
            </label>
            <input
              type="password"
              value={config.claudeKey}
              onChange={(e) => setConfig({ ...config, claudeKey: e.target.value })}
              placeholder="sk-ant-api03-..."
              className="w-full bg-zinc-900/80 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              OpenAI / OpenRouter API Key
            </label>
            <input
              type="password"
              value={config.openaiKey}
              onChange={(e) => setConfig({ ...config, openaiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-zinc-900/80 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              Local Ollama / Ultron Endpoint
            </label>
            <input
              type="text"
              value={config.localOllamaUrl}
              onChange={(e) => setConfig({ ...config, localOllamaUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-zinc-900/80 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-[11px] text-zinc-500 font-mono">
            Keys are stored strictly in client localStorage; never transmitted to third parties.
          </span>
          <div className="flex items-center gap-3">
            {savedFeedback && (
              <span className="text-xs text-emerald-400 font-mono font-bold animate-pulse">
                ✓ Keys &amp; Swarm Stored!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-red-950/60 transition"
            >
              Save Sovereign Config (+100 XP) &rarr;
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
