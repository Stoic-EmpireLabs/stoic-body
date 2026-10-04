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
  const { awardXp } = useStoic();

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

  const toggleStep = (questId: string, stepIdx: number) => {
    const key = `${questId}-${stepIdx}`;
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const claimQuest = (quest: Quest) => {
    if (completedQuests[quest.id]) return;
    awardXp(quest.xpReward, `Quest Completed: ${quest.title}`, "Knowledge");
    setCompletedQuests((prev) => ({ ...prev, [quest.id]: true }));
  };

  return (
    <div className="space-y-6">

      <div className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
            Makerspace & Sovereign Quest Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-world domestic, mechanical, and technical challenges designed to build tangible masculine capability.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
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
              className={`bg-[#13141C] border rounded-xl p-5 shadow-lg transition ${
                isDone ? "border-amber-500/50 bg-[#1C1E2B]/90" : "border-[#232636]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {quest.category} &middot; Tier {quest.tier} {quest.difficulty}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  +{quest.xpReward.toLocaleString()} XP
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100">{quest.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{quest.description}</p>

              <div className="mt-4 space-y-2 border-t border-[#232636] pt-3">
                {quest.steps.map((step, idx) => {
                  const stepKey = `${quest.id}-${idx}`;
                  const isStepChecked = !!checkedSteps[stepKey];
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={isStepChecked}
                        onChange={() => toggleStep(quest.id, idx)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                      />
                      <span className={isStepChecked ? "line-through text-slate-500" : ""}>
                        {step}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#232636] flex justify-end">
                <button
                  onClick={() => claimQuest(quest)}
                  disabled={!allStepsChecked || isDone}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    isDone
                      ? "bg-amber-600 text-white cursor-default"
                      : allStepsChecked
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
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
