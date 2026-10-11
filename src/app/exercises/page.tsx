"use client";

import React, { useState, useMemo } from "react";
import { ALL_EXERCISES, MUSCLE_GROUPS, ExerciseItem } from "@/lib/exercise-catalog";
import LiveSessionModal from "@/components/LiveSessionModal";

export default function ExerciseLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Live session launch
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [sessionExercises, setSessionExercises] = useState<ExerciseItem[]>([]);

  // Selected exercise detail modal
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);

  // Equipment options
  const equipmentOptions = ["all", "Barbell", "Dumbbell", "Bodyweight", "Cable", "Machine", "Kettlebell"];
  const difficultyOptions = ["all", "Beginner", "Intermediate", "Advanced"];

  const filteredExercises = useMemo(() => {
    return ALL_EXERCISES.filter((ex) => {
      const matchesSearch =
        searchQuery === "" ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.secondary.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMuscle =
        selectedMuscle === "all" ||
        ex.primary.toLowerCase() === selectedMuscle.toLowerCase() ||
        ex.secondary.some((s) => s.toLowerCase() === selectedMuscle.toLowerCase());

      const matchesEquipment =
        selectedEquipment === "all" ||
        ex.equipment.toLowerCase() === selectedEquipment.toLowerCase();

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        ex.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty;
    });
  }, [searchQuery, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const handleStartSoloSession = (ex: ExerciseItem) => {
    setSessionExercises([ex]);
    setIsSessionOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 p-6 shadow-2xl ring-1 ring-amber-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                OPEN-GYM REVERSE-ENGINEERED CATALOG
              </span>
              <span className="text-xs font-mono text-zinc-500">552 EXERCISES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SOVEREIGN EXERCISE VAULT
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Anatomically verified movements with step-by-step execution cues, target muscle telemetry, and instant live session tracking.
            </p>
          </div>

          <button
            onClick={() => {
              setSessionExercises(filteredExercises.slice(0, 4));
              setIsSessionOpen(true);
            }}
            disabled={filteredExercises.length === 0}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 self-start sm:self-auto"
          >
            <span>⚡</span> START SESSION ({Math.min(filteredExercises.length, 4)})
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exercise name, target muscle, or keyword..."
              className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 font-mono shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-white text-xs font-mono"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Muscle Group Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedMuscle("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 ${
                selectedMuscle === "all"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
              }`}
            >
              All Muscles
            </button>
            {MUSCLE_GROUPS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMuscle(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-1 ${
                  selectedMuscle === m.id
                    ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Secondary Filters (Equipment & Difficulty) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 px-2 uppercase">EQUIPMENT:</span>
              {equipmentOptions.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquipment(eq)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] capitalize transition-all ${
                    selectedEquipment === eq
                      ? "bg-zinc-700 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 px-2 uppercase">DIFFICULTY:</span>
              {difficultyOptions.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] capitalize transition-all ${
                    selectedDifficulty === diff
                      ? "bg-zinc-700 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-zinc-500">
        <span>SHOWING {filteredExercises.length} EXERCISES</span>
        <span>TAP CARD FOR TECHNIQUE CUES</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredExercises.slice(0, 60).map((ex) => (
          <div
            key={ex.id}
            onClick={() => setActiveExercise(ex)}
            className="group relative bg-zinc-950 hover:bg-zinc-900/90 border border-white/5 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-950/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {ex.primary}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{ex.equipment}</span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                {ex.name}
              </h3>

              {ex.secondary.length > 0 && (
                <p className="text-[11px] font-mono text-zinc-500 mt-1 truncate">
                  + {ex.secondary.join(", ")}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{ex.difficulty}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartSoloSession(ex);
                }}
                className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-zinc-800 group-hover:bg-amber-500 group-hover:text-black text-zinc-300 transition-all"
              >
                LOG SETS ▶
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length > 60 && (
        <div className="text-center py-4">
          <p className="text-xs font-mono text-zinc-500">
            Showing first 60 of {filteredExercises.length} movements. Use search or muscle filters to narrow down.
          </p>
        </div>
      )}

      {/* Exercise Detail Sheet / Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 ring-1 ring-amber-500/20">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {activeExercise.primary} · {activeExercise.equipment}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{activeExercise.name}</h3>
              </div>
              <button
                onClick={() => setActiveExercise(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Steps & Technique */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase">
                TECHNIQUE & EXECUTION
              </h4>
              <div className="bg-zinc-900/60 rounded-2xl p-4 border border-white/5 space-y-2.5 max-h-60 overflow-y-auto font-mono text-xs text-zinc-300">
                {activeExercise.steps.map((st, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="text-amber-400 font-bold">{i + 1}.</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  handleStartSoloSession(activeExercise);
                  setActiveExercise(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-center"
              >
                START LIVE WORKOUT TRACKER ▶
              </button>
              <button
                onClick={() => setActiveExercise(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs hover:text-white"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Session Modal */}
      <LiveSessionModal
        isOpen={isSessionOpen}
        onClose={() => setIsSessionOpen(false)}
        initialExercises={sessionExercises}
        sessionTitle="Open-GYM Live Tactical Tracker"
      />
    </div>
  );
}
