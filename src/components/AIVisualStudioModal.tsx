"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStoic } from "@/context/StoicContext";
import { fireBrilliantConfetti } from "@/lib/confetti";
import { Sparkles, X, Wand2, Download, Check, Camera, RefreshCw } from "lucide-react";

interface AIVisualStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
  initialType?: string;
  onApplyImage?: (url: string) => void;
}

export const AI_GENERATED_PRESETS = [
  {
    type: "workout",
    label: "🏋️‍♂️ Push Day",
    previewUrl: "/assets/blueprints/push-day.jpg",
    prompt: "Anatomical muscle heatmap highlighting upper chest, front delts, and lateral deltoids.",
  },
  {
    type: "pull",
    label: "🥋 Pull Day",
    previewUrl: "/assets/blueprints/pull-day.jpg",
    prompt: "Lats and upper back muscle heatmap with cable rows and hammer curls.",
  },
  {
    type: "legs",
    label: "🦵 Legs Day",
    previewUrl: "/assets/blueprints/legs-day.jpg",
    prompt: "Anatomical lower body heatmap highlighting quadriceps, hamstrings, gluteus maximus, and calves.",
  },
  {
    type: "nutrition",
    label: "📓 Nutrition Journal",
    previewUrl: "/assets/blueprints/notebook-diet.jpg",
    prompt: "Tactical lined-notebook cutting diet with Roman numerals and boxed macro summary.",
  },
  {
    type: "biohack",
    label: "🌿 Biohack Guide",
    previewUrl: "/assets/blueprints/bloating-ginger.jpg",
    prompt: "Warm hand-drawn comic guide for gut bloating and fresh ginger infusion.",
  },
  {
    type: "physique_male",
    label: "⚔️ Male Spartan",
    previewUrl: "/assets/brand/male-goal-physique.jpg",
    prompt: "Realistic athletic male Spartan physique, 8-10% body fat, chiseled six-pack abs and V-taper.",
  },
  {
    type: "physique_female",
    label: "🛡️ Female Spartan",
    previewUrl: "/assets/brand/female-goal-physique.jpg",
    prompt: "Realistic athletic female Spartan physique, 16-18% body fat, toned abdominal definition and athletic shoulders.",
  },
];

export default function AIVisualStudioModal({
  isOpen,
  onClose,
  defaultType = "workout",
  initialType,
  onApplyImage,
}: AIVisualStudioModalProps) {
  const { awardXp, playBellSound, playAnvilChime } = useStoic();
  const [visualType, setVisualType] = useState<string>(initialType || defaultType);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl: string;
    mode: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    playAnvilChime();

    try {
      const res = await fetch("/api/generate-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visualType,
          prompt: customPrompt || "Sovereign high-definition fitness visual blueprint",
          gender: "Male Sovereign",
          goal: "Lean Recomp",
        }),
      });
      const data = await res.json();
      setGeneratedResult({
        imageUrl: data.imageUrl || "/assets/blueprints/push-day.jpg",
        mode: data.mode || "curated_blueprint_cached",
        message: data.message || "Custom visual blueprint synthesized.",
      });
      awardXp(250, "Synthesized Sovereign AI Visual", "Intellect");
      playBellSound();
      fireBrilliantConfetti();
    } catch (e) {
      setGeneratedResult({
        imageUrl: "/assets/blueprints/push-day.jpg",
        mode: "fallback",
        message: "Offline sovereign blueprint active.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#0A0A0F] border border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl space-y-4 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/60 to-black border-b border-red-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
            <div>
              <h2 className="font-mono font-black text-white text-base tracking-wide uppercase">
                Stoic AI Visual Studio
              </h2>
              <p className="text-xs text-slate-400">
                Generate Custom Illustrated Workout Sheets, Notebook Diets &amp; Biohack Guides
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

        <div className="p-4 sm:p-5 space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-2">
              Select Visual Blueprint Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AI_GENERATED_PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  onClick={() => {
                    setVisualType(preset.type);
                    setCustomPrompt(preset.prompt);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-mono font-bold transition ${
                    visualType === preset.type
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                      : "bg-[#121218] border-red-950/60 text-slate-400 hover:text-white hover:border-amber-500/40"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
              Custom Directives &amp; Specific Focus:
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include 4-set lateral raises, 12% incline treadmill walk, and strict RPE 9 cues..."
              rows={2}
              className="w-full bg-black border border-red-950/80 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/60 font-mono"
            />
          </div>

          {/* Generation Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition border flex items-center justify-center gap-2 ${
              isGenerating
                ? "bg-red-950 text-red-300 border-red-800 cursor-wait"
                : "bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border-red-500/50 shadow-xl shadow-red-950/50"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Visual Blueprint...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-amber-300" /> Synthesize Personalized Blueprint (+250 XP)
              </>
            )}
          </button>

          {/* Output Display */}
          {generatedResult && (
            <div className="p-4 rounded-xl bg-[#121218] border border-amber-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {generatedResult.message}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-white/5 uppercase">
                  {generatedResult.mode}
                </span>
              </div>

              <div className="relative aspect-[3/4] max-h-72 w-full rounded-lg overflow-hidden border border-red-950/80 mx-auto bg-black">
                <Image
                  src={generatedResult.imageUrl}
                  alt="Generated Stoic Blueprint"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    if (onApplyImage && generatedResult?.imageUrl) {
                      onApplyImage(generatedResult.imageUrl);
                    }
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs hover:from-amber-400 transition"
                >
                  Apply to My Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
