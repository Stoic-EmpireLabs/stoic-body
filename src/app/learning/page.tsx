"use client";

import React, { useState } from "react";
import { useStoic } from "@/context/StoicContext";
import {
  FOUNDER_LEARNING_PATHWAYS,
  calculatePathwayProgress,
  calculateNextReviewDate,
  LearningPathway,
} from "@/lib/learning";

interface HowToVideo {
  id: string;
  title: string;
  category: "Mechanical" | "Fatherhood" | "Home Fabrication" | "Calisthenics & Boxing" | "AI & Systems" | "Consulting";
  duration: string;
  thumbnailGradient: string;
  description: string;
  chapters: { time: string; title: string }[];
  embedUrl: string;
  watched: boolean;
  xpReward: number;
}

const HOW_TO_VIDEOS: HowToVideo[] = [
  {
    id: "vid-mustang",
    title: "2015 Ford Mustang V6 3.7L DIY Oil & Filter Change Masterclass",
    category: "Mechanical",
    duration: "14:28",
    thumbnailGradient: "from-amber-900 to-slate-900",
    description: "Full mechanical execution: Ramps, 15mm drain plug bolt, FL-500S filter removal, 6.0 qts Motorcraft 5W-20 Synthetic Blend, 19 lb-ft torque specs.",
    chapters: [
      { time: "00:00", title: "Safety, Ramps & 150°F Engine Warm-up" },
      { time: "02:45", title: "15mm Drain Plug Removal & Catch Pan Positioning" },
      { time: "06:10", title: "Motorcraft FL-500S Filter Removal & O-Ring Lubrication" },
      { time: "09:30", title: "Hand-Tightening Filter & 19 lb-ft Torque Spec" },
      { time: "11:15", title: "Pouring Exactly 6.0 Quarts 5W-20 & Dipstick Reading" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 250,
  },
  {
    id: "vid-cheer",
    title: "Father & Daughter Cheerleading Flyer Stunting Progression",
    category: "Fatherhood",
    duration: "12:15",
    thumbnailGradient: "from-purple-900 to-slate-900",
    description: "Step-by-step partner stunting: Teaching tight hollow body core in the flyer, base palm shelf grip, balance line, elevator lift, and safe cradle catch.",
    chapters: [
      { time: "00:00", title: "Safety Rules, Floor Mat & Spotter Fundamentals" },
      { time: "02:20", title: "Flyer Ground Hollow Body & Locked Knee Drills" },
      { time: "05:10", title: "Base Palm Shelf Grip Biomechanics" },
      { time: "07:45", title: "Thigh Stand Lockout & Balance Transfer" },
      { time: "10:00", title: "Elevator Extension & Chest-Level Cradle Catch" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 250,
  },
  {
    id: "vid-tv-mount",
    title: "Heavy Duty Dual-Stud TV Wall Mounting (Zero Sag Guide)",
    category: "Home Fabrication",
    duration: "10:45",
    thumbnailGradient: "from-blue-900 to-slate-900",
    description: "Electronic stud-center calibration, 16\" spacing, 7/32\" pilot drill bits, 3\" lag bolt installation, and 100 lb downward pull load test.",
    chapters: [
      { time: "00:00", title: "Stud Finder Deep Scan & Eye-Level Height (42\")" },
      { time: "03:10", title: "Pre-drilling 4 Pilot Holes with 7/32\" Bit" },
      { time: "06:00", title: "Ratcheting 3\" Lag Bolts & 100 lb Pull Test" },
      { time: "08:30", title: "VESA Bracket Mounting & Articulating Arm Leveling" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 200,
  },
  {
    id: "vid-bed-frame",
    title: "King Solid Wood Bed Frame Structural Joinery & Anti-Squeak",
    category: "Home Fabrication",
    duration: "11:30",
    thumbnailGradient: "from-emerald-900 to-slate-900",
    description: "Squaring headboard/footboard rails, steel corner tension brackets, heavy-duty center support beam leveling feet, and pine slat fastening.",
    chapters: [
      { time: "00:00", title: "90-Degree Rail Squaring & Pre-Fit" },
      { time: "03:20", title: "Steel Corner Tension Bracket Torquing" },
      { time: "06:40", title: "Adjustable Center Leveling Feet Mounting" },
      { time: "09:10", title: "Slat Fastening (3\" Max Spacing) & Anti-Squeak Felt" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 200,
  },
  {
    id: "vid-calisthenics",
    title: "Strict Dumbbell-Free Calisthenics & Incline Walk Form",
    category: "Calisthenics & Boxing",
    duration: "15:10",
    thumbnailGradient: "from-red-900 to-slate-900",
    description: "Bodyweight mastery: Hollow body pushups, dead-hang chin-ups, dip bar mechanics, and 12% incline 3.0 mph Zone 2 treadmill technique.",
    chapters: [
      { time: "00:00", title: "Hollow-Body Plank & Core Stiffness" },
      { time: "03:45", title: "Strict Chin-up Form (Zero Kipping / Momentum)" },
      { time: "07:30", title: "Parallel Bar Dips & Scapular Depression" },
      { time: "11:20", title: "12% Incline Treadmill Walk & Zone 2 Fat Oxidation" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 250,
  },
  {
    id: "vid-boxing",
    title: "Home Boxing 3m/1m Interval Rounds & Footwork Mastery",
    category: "Calisthenics & Boxing",
    duration: "13:40",
    thumbnailGradient: "from-amber-950 to-slate-900",
    description: "Home heavy bag and shadow mechanics: Orthodox stance, 1-2 jab-cross combination, slip and roll defense, and 3m work / 1m rest round pacing.",
    chapters: [
      { time: "00:00", title: "Stance, Balance & Center of Gravity" },
      { time: "03:00", title: "Snapping Jab & Power Cross (1-2 Combo)" },
      { time: "06:30", title: "Head Movement: Slip, Roll & Counter" },
      { time: "09:45", title: "Managing Round Fatigue on the 3m/1m Timer" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 250,
  },
  {
    id: "vid-ultron",
    title: "Ultron Private LLM: Local Ollama & Antigravity Indexing",
    category: "AI & Systems",
    duration: "16:20",
    thumbnailGradient: "from-cyan-900 to-slate-900",
    description: "Self-hosting local models: Quantized Qwen 2.5 14B / DeepSeek, measuring GPU VRAM offload, private vector embeddings, and Antigravity workspace integration.",
    chapters: [
      { time: "00:00", title: "Ollama Local Runtime & Model Architecture" },
      { time: "04:15", title: "Measuring Tokens/Sec Throughput & VRAM Offload" },
      { time: "08:30", title: "Local Vector Embeddings for Doctoral DBA Notes" },
      { time: "12:45", title: "Binding Endpoint into Antigravity Custom Tools" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 300,
  },
  {
    id: "vid-consulting",
    title: "Stoic Business Consulting: High-Margin Fiverr & Town Retainers",
    category: "Consulting",
    duration: "18:05",
    thumbnailGradient: "from-emerald-950 to-slate-900",
    description: "Packaging AI automation transformations: Structuring $5,000/mo enterprise retainers, Fiverr Pro gig optimization, and in-person SMB pitch walkthroughs.",
    chapters: [
      { time: "00:00", title: "Value-Based Pricing vs Hourly Commoditization" },
      { time: "04:30", title: "Fiverr Pro Gig Copywriting & Case Study Presentation" },
      { time: "09:15", title: "In-Person Executive SMB Walkthrough with Live iPad Demo" },
      { time: "14:00", title: "Closing the First $5,000/mo Automation Retainer" },
    ],
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    watched: false,
    xpReward: 300,
  },
];

export default function LearningPage() {
  const { awardXp } = useStoic();
  const [videos, setVideos] = useState<HowToVideo[]>(HOW_TO_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<HowToVideo>(HOW_TO_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [pathways, setPathways] = useState<LearningPathway[]>(FOUNDER_LEARNING_PATHWAYS);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>("mustang_oil_change");

  const currentPathway = pathways.find((p) => p.id === selectedPathwayId) || pathways[0];
  const progress = calculatePathwayProgress(currentPathway);

  const toggleStep = (stepId: string) => {
    setPathways((prev) =>
      prev.map((pw) => {
        if (pw.id !== currentPathway.id) return pw;
        return {
          ...pw,
          steps: pw.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)),
        };
      })
    );
  };

  const markVideoWatched = (vidId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== vidId || v.watched) return v;
        awardXp(v.xpReward, `🎬 Mastered Video Guide: ${v.title}`, "Intellect");
        return { ...v, watched: true };
      })
    );
  };

  const nextReview = calculateNextReviewDate(new Date(), currentPathway.reviewIntervalLevel);

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Video How-To Guides &amp; Deconstructed Curricula</span>
            <span className="text-[10px] bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
              Interactive Video Players &bull; Step Milestones
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Watch verified video walk-throughs for real-world maintenance, cheer stunting, home fabrication, and AI consulting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Next Spaced Review:</span>
          <span className="text-xs font-mono font-bold text-amber-300 bg-red-950/60 px-2.5 py-1 rounded border border-amber-500/30">
            {nextReview.toISOString().split("T")[0]}
          </span>
        </div>
      </section>

      {/* FEATURED INTERACTIVE HOW-TO VIDEO PLAYER */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-red-950/70 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase bg-red-950/80 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
              {selectedVideo.category} Masterclass &bull; {selectedVideo.duration}
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              {selectedVideo.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {selectedVideo.watched ? (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded border border-emerald-500/30">
                ✓ Video Mastered (+{selectedVideo.xpReward} XP)
              </span>
            ) : (
              <button
                onClick={() => markVideoWatched(selectedVideo.id)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5"
              >
                <span>✓</span> Mark Watched (+{selectedVideo.xpReward} XP)
              </button>
            )}
          </div>
        </div>

        {/* RESPONSIVE VIDEO SCREEN */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-black via-[#0D0507] to-black rounded-xl overflow-hidden border border-red-900/40 shadow-2xl flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono bg-black/80 backdrop-blur-md px-3 py-1 rounded text-white border border-red-900/40">
              HD &bull; High Frame Rate &bull; Step Breakdown
            </span>
            <span className="text-xs font-mono text-amber-400 bg-black/80 px-2.5 py-1 rounded border border-amber-500/30 font-bold">
              {selectedVideo.duration}
            </span>
          </div>

          {/* PLAY BUTTON / ACTIVE VIEWER */}
          <div className="self-center text-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center text-2xl shadow-2xl transition transform hover:scale-105 border border-red-400/30"
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <div className="text-xs text-white mt-3 font-bold tracking-wide">
              {isPlaying ? "Playing Video Guide..." : "Click to Play Video Guide"}
            </div>
            <p className="text-[11px] text-slate-300 max-w-md mx-auto mt-1">
              {selectedVideo.description}
            </p>
          </div>

          {/* TIMELINE CHAPTERS */}
          <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-red-950/80 flex flex-wrap gap-2 text-[11px] font-mono text-white overflow-x-auto">
            <span className="text-amber-400 font-bold self-center">Chapters:</span>
            {selectedVideo.chapters.map((ch, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded bg-neutral-900/90 border border-red-950 hover:border-amber-400/50 cursor-pointer whitespace-nowrap text-white font-medium"
              >
                <strong className="text-amber-400 mr-1">{ch.time}</strong> {ch.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW-TO VIDEO LIBRARY GRID */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-red-950/70 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Founder Video Masterclass Library
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Click any guide to load into player. Watch all 8 guides to earn +2,000 XP.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300">
            {videos.length} Verified Video Walk-Throughs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {videos.map((vid) => {
            const isSelected = selectedVideo.id === vid.id;
            return (
              <div
                key={vid.id}
                onClick={() => {
                  setSelectedVideo(vid);
                  setIsPlaying(true);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? "bg-red-950/40 border-amber-500 shadow-xl ring-2 ring-amber-500/60"
                    : "bg-[#121218] border-red-950/60 hover:border-amber-500/50"
                }`}
              >
                <div>
                  <div className={`h-24 rounded-lg bg-gradient-to-br ${vid.thumbnailGradient} flex items-center justify-center relative overflow-hidden border border-white/5`}>
                    <div className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center text-amber-400 text-sm shadow border border-amber-500/30">
                      ▶
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 font-mono text-[10px] bg-black/90 px-1.5 py-0.5 rounded text-white font-bold">
                      {vid.duration}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mt-2">
                    {vid.category}
                  </span>
                  <h4 className="text-xs font-semibold text-white mt-1 leading-snug line-clamp-2">
                    {vid.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-red-950/70 flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-amber-400">+{vid.xpReward} XP</span>
                  <span className={vid.watched ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    {vid.watched ? "✓ Mastered" : "Watch Now"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DECONSTRUCTED CHECKLISTS & STEP PROGRESSION */}
      <section className="bg-[#0A0A0F] border border-red-950/80 rounded-xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
            Step-by-Step Mechanical &amp; Project Checklists
          </h3>
          <p className="text-xs text-slate-300">
            Check off steps as you physically perform them. Tool requirements and factory torque specs included.
          </p>
        </div>

        {/* PATHWAY SELECTOR PILLS */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pathways.map((pw) => {
            const isSelected = pw.id === selectedPathwayId;
            const pwProgress = calculatePathwayProgress(pw);
            return (
              <button
                key={pw.id}
                onClick={() => setSelectedPathwayId(pw.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-red-700 to-red-800 text-white border-red-500/60 shadow-md"
                    : "bg-black text-slate-300 border-red-950/70 hover:text-white"
                }`}
              >
                <span>{pw.title.split("—")[0].split("DIY")[0]}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-amber-300 border border-amber-500/30">
                  {pwProgress.percentage}%
                </span>
              </button>
            );
          })}
        </div>

        {/* SELECTED PATHWAY DETAIL */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-red-950/80 px-2.5 py-0.5 rounded border border-amber-500/30">
                Category: {currentPathway.category.replace("_", " ")}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">{currentPathway.title}</h3>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl">{currentPathway.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-mono font-black text-amber-400">{progress.percentage}%</span>
              <div className="text-[11px] text-slate-300 font-mono">
                {progress.completedSteps} / {progress.totalSteps} Steps Complete
              </div>
            </div>
          </div>

          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-red-950/80">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>

          {/* PREREQUISITES AUDIT */}
          <div className="bg-black border border-red-950/80 rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Tooling &amp; Safety Prerequisites
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentPathway.prerequisites.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-white">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{req.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP-BY-STEP DECONSTRUCTED CHECKLIST */}
          <div className="space-y-2.5">
            {currentPathway.steps.map((step, idx) => (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between gap-4 ${
                  step.completed
                    ? "bg-black/60 border-red-950/40 text-slate-400"
                    : "bg-[#121218] border-red-950/70 hover:border-amber-500/40 text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                      step.completed ? "bg-amber-500 text-black font-bold" : "border border-red-900/60 bg-black"
                    }`}
                  >
                    {step.completed && "✓"}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold mr-2">Step {idx + 1}</span>
                    <span className={`text-sm ${step.completed ? "line-through text-slate-500" : "font-semibold text-white"}`}>
                      {step.title}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-amber-300 font-bold border border-red-950 shrink-0">
                  {step.estimatedMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
