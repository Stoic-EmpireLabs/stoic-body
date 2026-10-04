"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";

interface Quest {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tier: number;
  xpReward: number;
  description: string;
  steps: string[];
}

export default function QuestVault() {
  const { awardXp, playAnvilChime, playBellSound } = useStoic();

  const [quests] = useState<Quest[]>([
    {
      id: "q-mustang",
      title: "2015 Ford Mustang V6 3.7L DIY Oil Change",
      category: "Makerspace",
      difficulty: "Legendary",
      tier: 5,
      xpReward: 3500,
      description:
        "Master automotive self-reliance: Save money, build vehicle knowledge, and change your own motor oil using verified Ford factory specifications.",
      steps: [
        "Acquire 6.0 Quarts 5W-20 Full Synthetic Oil & Motorcraft FL-500S Filter",
        "Warm engine 3 minutes, chock rear wheels, jack car securely on heavy jack stands",
        "Loosen 15mm oil pan drain bolt into pan; inspect magnetic drain plug for debris",
        "Spin off old filter; lube fresh rubber gasket with new oil; hand-tighten FL-500S",
        "Torque plug to 19 lb-ft, pour 6.0 qts, check dipstick level, reset dash oil life meter",
      ],
    },
    {
      id: "q-tv",
      title: "Precision TV Wall-Mount Installation",
      category: "Home Infrastructure",
      difficulty: "Boss",
      tier: 4,
      xpReward: 1500,
      description:
        "Mount flat screen TV securely to wall studs with heavy-duty lag bolts, ensuring perfect horizontal bubble level.",
      steps: [
        "Locate center of wood wall studs using stud finder and verify with nail test",
        "Align heavy metal wall bracket using precision bubble level and mark pilot holes",
        "Pre-drill 3/16 inch pilot holes into center of studs",
        "Drive heavy-duty lag bolts with ratchet socket firmly into studs",
        "Hang TV onto bracket arms and click safety retention locks into place",
      ],
    },
    {
      id: "q-ultron",
      title: "Ultron Self-Hosted LLM Deployment & Knowledge Pipeline",
      category: "AI & Tech",
      difficulty: "Boss",
      tier: 4,
      xpReward: 1500,
      description:
        "Deploy private self-hosted LLM runtime with local knowledge indexing, private weights, and agent tool execution.",
      steps: [
        "Verify GPU VRAM allocations and model quantizations (Ollama / vLLM)",
        "Index Antigravity workspace skills, personal notes, and doctoral research papers",
        "Expose OpenAI-compatible endpoint with token rate limiting",
        "Run offline test queries verifying zero telemetry or unconsented external leaks",
      ],
    },
  ]);

  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSteps = localStorage.getItem("stoic_checked_quest_steps");
      if (savedSteps) try { setCheckedSteps(JSON.parse(savedSteps)); } catch (e) {}
      const savedQuests = localStorage.getItem("stoic_completed_quests");
      if (savedQuests) try { setCompletedQuests(JSON.parse(savedQuests)); } catch (e) {}
    }
  }, []);

  const toggleStep = (questId: string, stepIdx: number) => {
    playAnvilChime();
    const key = `${questId}-${stepIdx}`;
    setCheckedSteps((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_checked_quest_steps", JSON.stringify(next));
      }
      return next;
    });
  };

  const claimQuest = (quest: Quest) => {
    if (completedQuests[quest.id]) return;
    playBellSound();
    awardXp(quest.xpReward, `Quest Completed: ${quest.title}`, "Knowledge");
    setCompletedQuests((prev) => {
      const next = { ...prev, [quest.id]: true };
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_completed_quests", JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">

      <div className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Makerspace &amp; Sovereign Quest Vault
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-world domestic, mechanical, and technical challenges designed to build tangible masculine capability.
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-red-950/80 text-amber-300 border border-amber-500/40">
          3 Active Quests
        </span>
      </div>

      <div className="space-y-5">
        {quests.map((quest) => {
          const isDone = !!completedQuests[quest.id];
          const allStepsChecked = quest.steps.every(
            (_, idx) => !!checkedSteps[`${quest.id}-${idx}`]
          );

          return (
            <div
              key={quest.id}
              className={`border rounded-xl p-6 shadow-2xl transition ${
                isDone
                  ? "border-amber-500/60 bg-red-950/30 ring-1 ring-amber-500/40"
                  : "bg-[#0A0A0F] border-red-950/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {quest.category} &middot; Tier {quest.tier} {quest.difficulty}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-red-950/80 text-amber-300 border border-amber-500/40">
                  +{quest.xpReward.toLocaleString()} XP
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{quest.title}</h3>
              <p className="text-xs text-slate-200 mt-1">{quest.description}</p>

              <div className="mt-4 space-y-2 border-t border-red-950/70 pt-3">
                {quest.steps.map((step, idx) => {
                  const stepKey = `${quest.id}-${idx}`;
                  const isStepChecked = !!checkedSteps[stepKey];
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={isStepChecked}
                        onChange={() => toggleStep(quest.id, idx)}
                        className="rounded bg-black border-red-900/60 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                      />
                      <span className={isStepChecked ? "line-through text-slate-500" : "font-medium"}>
                        {step}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-red-950/70 flex justify-end">
                <button
                  onClick={() => claimQuest(quest)}
                  disabled={!allStepsChecked || isDone}
                  className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    isDone
                      ? "bg-red-700 text-white cursor-default"
                      : allStepsChecked
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow"
                      : "bg-neutral-900 text-slate-400 cursor-not-allowed border border-red-950/60"
                  }`}
                >
                  {isDone
                    ? "Quest Completed (+XP Claimed)"
                    : allStepsChecked
                    ? `Claim Quest Reward (+${quest.xpReward} XP)`
                    : "Complete All Steps to Claim"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
