"use client";

import React, { useState } from "react";
import bodySvgData from "@/lib/body-svg-data.json";

export interface BodyMapProps {
  selectedMuscles: string[];
  onToggleMuscle: (muscleId: string) => void;
  className?: string;
  readOnly?: boolean;
}

const MUSCLE_NAMES: Record<string, string> = {
  chest: "Chest (Pecs)",
  shoulders: "Shoulders (Delts)",
  biceps: "Biceps",
  triceps: "Triceps",
  forearm: "Forearms",
  abdomen: "Abs & Core",
  obliques: "Obliques",
  back: "Lats & Upper Back",
  trapezius: "Traps",
  glutes: "Glutes",
  quads: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

export default function BodyMap({
  selectedMuscles,
  onToggleMuscle,
  className = "",
  readOnly = false,
}: BodyMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const isSelected = (id: string) => selectedMuscles.includes(id);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Front & Back Headings */}
      <div className="w-full flex justify-between px-6 mb-2 text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" /> FRONT VIEW
        </span>
        <span className="text-zinc-400 font-semibold text-center">
          {hoveredMuscle ? (
            <span className="text-amber-400 font-bold transition-all animate-pulse">
              {MUSCLE_NAMES[hoveredMuscle] || hoveredMuscle}
            </span>
          ) : selectedMuscles.length > 0 ? (
            <span className="text-amber-300">
              {selectedMuscles.length} Muscle{selectedMuscles.length > 1 ? "s" : ""} Targeted
            </span>
          ) : (
            <span className="text-zinc-600">TAP A MUSCLE TO TARGET</span>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          BACK VIEW <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-[535/462] max-w-[500px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-black rounded-3xl border border-white/10 p-2 shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-amber-500/10">
        {/* Glow ambient layer */}
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        <svg
          viewBox={`0 0 ${bodySvgData.bodyViewW} ${bodySvgData.bodyViewH}`}
          className="w-full h-full filter drop-shadow-md"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            {/* Spartan Gold Glow Filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#D97706" floodOpacity="0.4" />
            </filter>
            {/* Crimson Red Glow Filter */}
            <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#DC2626" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. Base Silhouette (Main + Lite Outlines) */}
          <g className="body-silhouette opacity-35" fill="#1C1C22" stroke="#2E2E38" strokeWidth="0.8">
            {bodySvgData.bodyBaseMain.map((d, i) => (
              <path key={`base-main-${i}`} d={d} fillRule="evenodd" />
            ))}
            {bodySvgData.bodyBaseLite.map((d, i) => (
              <path key={`base-lite-${i}`} d={d} fillRule="evenodd" />
            ))}
          </g>

          {/* 2. Interactive Muscle Group Layers */}
          {Object.entries(bodySvgData.muscleFills).map(([muscleId, paths]) => {
            const active = isSelected(muscleId);
            const isHovered = hoveredMuscle === muscleId;

            // Colors based on state
            let fillColor = "#2A2A32";
            let strokeColor = "#3F3F4E";
            let strokeWidth = 0.5;
            let filterStyle = undefined;

            if (active) {
              fillColor = "#F59E0B"; // Spartan Gold / Amber
              strokeColor = "#FDE68A";
              strokeWidth = 1.2;
              filterStyle = "url(#goldGlow)";
            } else if (isHovered) {
              fillColor = "#78350F"; // Warm amber hover preview
              strokeColor = "#D97706";
              strokeWidth = 1;
            }

            return (
              <g
                key={muscleId}
                id={`muscle-group-${muscleId}`}
                className={`transition-all duration-200 ${readOnly ? "" : "cursor-pointer"}`}
                onClick={() => !readOnly && onToggleMuscle(muscleId)}
                onMouseEnter={() => !readOnly && setHoveredMuscle(muscleId)}
                onMouseLeave={() => !readOnly && setHoveredMuscle(null)}
              >
                {paths.map((d, idx) => (
                  <path
                    key={`${muscleId}-${idx}`}
                    d={d}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fillRule="evenodd"
                    filter={filterStyle}
                    className="transition-colors duration-200"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Muscle Chips */}
      <div className="w-full mt-3 flex flex-wrap gap-1.5 justify-center items-center">
        {selectedMuscles.length === 0 ? (
          <p className="text-xs text-zinc-500 font-mono py-1">
            Tap muscles on front or back body to filter tactical workouts
          </p>
        ) : (
          selectedMuscles.map((id) => (
            <button
              key={id}
              onClick={() => onToggleMuscle(id)}
              className="group flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 transition-all shadow-sm"
              title="Click to remove"
            >
              <span>{MUSCLE_NAMES[id] || id}</span>
              <span className="text-[10px] text-zinc-400 group-hover:text-red-400 font-bold">✕</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
