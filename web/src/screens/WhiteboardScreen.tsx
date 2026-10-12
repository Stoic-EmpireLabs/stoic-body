import React, { useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import {
  Sparkles,
  Zap,
  Calendar,
  Utensils,
  Dumbbell,
  Shield,
  Download,
  Share2,
  ArrowRight,
  Sun,
  Moon,
  Check,
  Flame,
  Layers,
} from 'lucide-react';

export const WhiteboardScreen: React.FC = () => {
  const { openOnboarding, profile, settings, pushRoute } = useGymStore();

  const [currentTab, setCurrentTab] = useState<'intake' | 'schedule' | 'sets' | 'diet' | 'portability'>('intake');
  const [selectedSex, setSelectedSex] = useState<'female' | 'male'>(
    profile?.gender === 'male' || settings?.gender === 'male' ? 'male' : 'female'
  );
  const [isBlackboard, setIsBlackboard] = useState<boolean>(true);

  const isFemale = selectedSex === 'female';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden shadow-2xl ${
        isBlackboard
          ? 'bg-[#121418] border-[#2A303C] text-white'
          : 'bg-white border-slate-300 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-700/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#E0A899]/20 text-[#E0A899] border border-[#E0A899]/30">
                ARCHITECTURE WHITEBOARD
              </span>
              <span className={`text-xs font-mono ${isBlackboard ? 'text-neutral-400' : 'text-slate-500'}`}>
                Visual Computational Web v2.4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
              <span>🕸️ System Architecture & Neural Web</span>
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isBlackboard ? 'text-neutral-300' : 'text-slate-600'}`}>
              Interactive whiteboard showing how your 20-question intake assessment customizes the full 14-day schedule, biomechanical routines, planned sets, and nutritional diet.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Whiteboard / Blackboard Theme Toggle */}
            <button
              onClick={() => setIsBlackboard(!isBlackboard)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isBlackboard
                  ? 'bg-[#1C222C] border-[#364050] text-neutral-200 hover:text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isBlackboard ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isBlackboard ? 'Whiteboard Mode' : 'Blackboard Mode'}</span>
            </button>

            {/* Sex Toggle */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              isBlackboard ? 'bg-[#161A20] border-[#2A323E]' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                onClick={() => setSelectedSex('female')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isFemale
                    ? 'bg-[#E0A899] text-[#140D09] shadow font-black'
                    : isBlackboard ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ♀ Empress (Sophia)
              </button>
              <button
                onClick={() => setSelectedSex('male')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isFemale
                    ? 'bg-[#D9A184] text-[#140D09] shadow font-black'
                    : isBlackboard ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ♂ Spartan (Marcus)
              </button>
            </div>
          </div>
        </div>

        {/* Web Navigation Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 pt-1">
          {[
            { id: 'intake' as const, label: '🕸️ 1. Intake Questionnaire Web' },
            { id: 'schedule' as const, label: '📅 2. Picture Schedule Web' },
            { id: 'sets' as const, label: '⚡ 3. Planned Sets & Reps Web' },
            { id: 'diet' as const, label: '🥗 4. Diet, Fasting & Macros Web' },
            { id: 'portability' as const, label: '💾 5. Client JSON & GitHub Web' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                currentTab === tab.id
                  ? 'bg-[#E0A899] text-[#140D09] font-black scale-[1.02]'
                  : isBlackboard
                  ? 'bg-[#181C22] text-neutral-300 hover:bg-[#202630] border border-[#2A323E]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* WHITEBOARD SURFACE */}
      <div
        className={`border-4 rounded-3xl p-6 sm:p-8 shadow-2xl relative min-h-[540px] transition-all ${
          isBlackboard
            ? 'bg-[#0E1014] border-[#222832] text-white'
            : 'bg-[#FAFCFF] border-slate-300 text-slate-900'
        }`}
        style={{
          backgroundImage: isBlackboard
            ? 'radial-gradient(#222832 1.5px, transparent 1.5px)'
            : 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* ============================================================== */}
        {/* TAB 1: INTAKE QUESTIONNAIRE NEURAL WEB */}
        {/* ============================================================== */}
        {currentTab === 'intake' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/30">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#E0A899]">
                  Neural Decision Graph
                </span>
                <h2 className="text-xl font-black mt-0.5">
                  How 20 Questionnaire Answers Compute the Platform
                </h2>
              </div>
              <button
                onClick={openOnboarding}
                className="px-3.5 py-1.5 rounded-xl bg-[#E0A899] hover:bg-[#EBB8AA] text-[#140D09] text-xs font-black flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Retake 20-Q Assessment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Column 1: The 4 Input Clusters */}
              <div className="md:col-span-4 space-y-3">
                <div className={`p-4 rounded-2xl border-2 shadow-sm ${
                  isBlackboard ? 'bg-[#141820] border-indigo-900/50' : 'bg-white border-indigo-200'
                }`}>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase block mb-1">
                    Cluster 1 · Q1–Q4
                  </span>
                  <h4 className="font-bold text-sm">Biological Foundation & Identity</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-snug">
                    • Archetype: <strong className="text-white">{isFemale ? 'Female / Empress (Aurelia)' : 'Male / Spartan (Marcus)'}</strong><br />
                    • Quest: {isFemale ? 'Lean Toning & Glute Sculpt' : 'Raw Compound Strength (3-5r)'}<br />
                    • Experience: Intermediate (1–3 Years)
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border-2 shadow-sm ${
                  isBlackboard ? 'bg-[#141820] border-emerald-900/50' : 'bg-white border-emerald-200'
                }`}>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block mb-1">
                    Cluster 2 · Q5–Q8
                  </span>
                  <h4 className="font-bold text-sm">Biometrics & Schedule Allocation</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-snug">
                    • {isFemale ? '168 cm · 62 kg' : '180 cm · 82 kg'}<br />
                    • 4 Days / Week (Tue, Thu, Sat, Sun)<br />
                    • Workout Time: {isFemale ? '07:30 AM (45 min)' : '06:00 AM (60 min)'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border-2 shadow-sm ${
                  isBlackboard ? 'bg-[#141820] border-amber-900/50' : 'bg-white border-amber-200'
                }`}>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block mb-1">
                    Cluster 3 · Q9–Q15
                  </span>
                  <h4 className="font-bold text-sm">Biomechanical Split & Joints</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-snug">
                    • Split: {isFemale ? 'Empress Posterior Chain' : 'Push / Pull / Legs (PPL)'}<br />
                    • Equipment: Full Commercial Gym<br />
                    • Core: TVA Pelvic Floor Corset / Abs Finisher
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border-2 shadow-sm ${
                  isBlackboard ? 'bg-[#141820] border-rose-900/50' : 'bg-white border-rose-200'
                }`}>
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block mb-1">
                    Cluster 4 · Q16–Q20
                  </span>
                  <h4 className="font-bold text-sm">Nutrition, Fasting & Voice</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-snug">
                    • Fasting: {isFemale ? '16:8 Lean Gains (12:00–20:00)' : '23:1 OMAD Warrior Feast'}<br />
                    • Strategy: Moderate Cut (-10%)<br />
                    • Coaching: {isFemale ? 'Aurelia Empress Poise' : 'Staff Sgt. Stone USMC'}
                  </p>
                </div>
              </div>

              {/* Column 2: Central Computational Nexus */}
              <div className={`md:col-span-4 p-5 rounded-3xl border-2 border-dashed flex flex-col justify-center items-center text-center relative ${
                isBlackboard ? 'bg-[#12161E] border-[#2A3240]' : 'bg-slate-50 border-slate-300'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-[#E0A899]/20 border border-[#E0A899]/40 flex items-center justify-center text-[#E0A899] mb-3 shadow">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-black text-base">Mifflin-St Jeor & Biomechanical Engine</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Processes all 20 dimensions simultaneously into deterministic routines and calendar records.
                </p>

                <div className="w-full mt-4 space-y-2 text-left">
                  <div className={`p-3 rounded-xl border text-xs ${
                    isBlackboard ? 'bg-[#181D26] border-[#2A3444]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="font-bold text-[#E0A899]">BMR + TDEE Formula:</div>
                    <div className="font-mono text-[11px] text-neutral-400 mt-0.5">
                      {isFemale
                        ? '10(62) + 6.25(168) - 5(26) - 161 = 1,385 kcal BMR'
                        : '10(82) + 6.25(180) - 5(28) + 5 = 1,810 kcal BMR'}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs ${
                    isBlackboard ? 'bg-[#181D26] border-[#2A3444]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="font-bold text-[#E0A899]">Planned Sets Allocation:</div>
                    <div className="font-mono text-[11px] text-neutral-400 mt-0.5">
                      Compounds: 1 Warmup @ 55% + 3 Working sets<br />
                      Accessories: 3 Sets @ 12-15r with 60s rest
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Outputs */}
              <div className="md:col-span-4 space-y-3">
                <div
                  onClick={() => pushRoute('schedule')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer hover:border-[#E0A899] transition-all shadow-sm ${
                    isBlackboard ? 'bg-[#141820] border-[#242C38]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#E0A899]" />
                    <h4 className="font-bold text-sm">Visual Picture Schedule</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">
                    7-day grid rendering 3D exercise thumbnails, workout durations, and 1-click launch.
                  </p>
                </div>

                <div
                  onClick={() => pushRoute('nutrition')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer hover:border-[#E0A899] transition-all shadow-sm ${
                    isBlackboard ? 'bg-[#141820] border-[#242C38]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm">Macro & Fasting Ledger</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">
                    {isFemale ? '1,750 kcal · 135g Protein · 160g Carbs · 50g Fat · 3.2L' : '2,800 kcal · 215g Protein · 290g Carbs · 75g Fat · 4.0L'}.
                  </p>
                </div>

                <div
                  onClick={() => pushRoute('routines')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer hover:border-[#E0A899] transition-all shadow-sm ${
                    isBlackboard ? 'bg-[#141820] border-[#242C38]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm">Biomechanical Routines</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">
                    Pre-populated sets, reps, and starting loads across all 552 movement variations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PICTURE SCHEDULE WEB */}
        {/* ============================================================== */}
        {currentTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/30">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  Visual Calendar Web
                </span>
                <h2 className="text-xl font-black mt-0.5">
                  7-Day Picture Schedule Periodization
                </h2>
              </div>
              <button
                onClick={() => pushRoute('schedule')}
                className="px-3.5 py-1.5 rounded-xl bg-[#E0A899] text-[#140D09] text-xs font-black flex items-center gap-1.5"
              >
                Go to Live Schedule →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  day: 'Tuesday · 07:30 AM',
                  title: isFemale ? 'Hourglass Torso & Posture Sculpt' : 'Spartan Upper Armor Bench',
                  moves: isFemale
                    ? ['Lat Pulldown (3x15r @ 35kg)', 'DB Shoulder Press (3x15r @ 12kg)', 'Face Pull (3x15r @ 18kg)', 'Incline DB Bench (3x15r @ 14kg)', 'Dead Bug TVA (3x20r Core)']
                    : ['Flat Barbell Bench (4x5r @ 85kg)', 'Incline DB Press (4x8r @ 32kg)', 'Weighted Dips (3x10r @ +15kg)', 'Lateral Cable Raise (4x12r @ 14kg)', 'Hanging Leg Raise (3x20r)'],
                },
                {
                  day: 'Thursday · 07:30 AM',
                  title: isFemale ? 'Glute Hypertrophy & Hip Thrust' : 'Squat & Posterior Overload',
                  moves: isFemale
                    ? ['Barbell Hip Thrust (4x12r @ 45kg)', 'Romanian Deadlift (4x10r @ 40kg)', 'Bulgarian Split Squat (3x12r @ 12kg)', 'Cable Kickback (3x15r @ 14kg)', 'Weighted Front Plank (3x60s)']
                    : ['Back Squat (5x5r @ 120kg)', 'Romanian Deadlift (4x8r @ 110kg)', 'Leg Press (4x10r @ 240kg)', 'Standing Calf Raise (4x15r @ 90kg)', 'Ab Wheel Rollout (3x15r)'],
                },
                {
                  day: 'Saturday · 07:30 AM',
                  title: isFemale ? 'V-Taper Lat Width & Delts' : 'Back Thickness & Pull-Ups',
                  moves: isFemale
                    ? ['Neutral Pull-Up (3x8r @ BW)', 'DB Lateral Raise (4x15r @ 7kg)', 'Chest-Supported Row (3x12r @ 16kg)', 'Tricep Extension (3x15r @ 12kg)', 'Hanging Knee Raise (3x15r)']
                    : ['Weighted Pull-Up (4x6r @ +20kg)', 'Barbell Bent Row (4x8r @ 85kg)', 'T-Bar Row (4x10r @ 70kg)', 'Incline DB Curl (4x10r @ 18kg)', 'Cable Woodchopper (3x15r)'],
                },
                {
                  day: 'Sunday · 07:30 AM',
                  title: isFemale ? 'Pelvic Floor & Core Corset' : 'Combat Tactical Conditioning',
                  moves: isFemale
                    ? ['Goblet Squat (4x12r @ 20kg)', 'Seated Leg Curl (3x15r @ 30kg)', 'Cable Woodchopper (3x15r @ 15kg)', 'Standing Calf Raise (4x20r @ 40kg)', 'Vacuum Core Holds (4x30s)']
                    : ['Standing Military Press (4x5r @ 65kg)', 'Farmer Walks (4x40m @ 32kg)', 'Kettlebell Swings (4x20r @ 28kg)', 'Weighted Dips (3x15r)', 'Plank to Push-up (3x20r)'],
                },
              ].map((d) => (
                <div
                  key={d.day}
                  className={`p-4 rounded-2xl border-2 shadow-sm ${
                    isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase text-[#E0A899] block mb-1">
                    {d.day}
                  </span>
                  <h4 className="font-bold text-sm mb-2">{d.title}</h4>
                  <div className="space-y-1 text-xs font-mono text-neutral-400 border-t pt-2 border-slate-700/30">
                    {d.moves.map((m, idx) => (
                      <div key={idx} className={idx === d.moves.length - 1 ? 'text-[#E0A899] font-bold' : ''}>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PLANNED SETS & REPS WEB */}
        {/* ============================================================== */}
        {currentTab === 'sets' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/30">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-amber-400">
                  Biomechanical Hierarchy
                </span>
                <h2 className="text-xl font-black mt-0.5">
                  Planned Sets, Reps & Weight Engine
                </h2>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Zero Empty Placeholders
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-5 rounded-2xl border-2 ${
                isBlackboard ? 'bg-[#141820] border-indigo-900/40' : 'bg-white border-indigo-200'
              }`}>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Tier 1 Compound</span>
                <h4 className="font-bold text-base mt-1">Axial Compound Loading</h4>
                <p className="text-xs text-neutral-400 mt-1">Barbell Squat, Flat Bench, Deadlift, Hip Thrust</p>

                <div className={`mt-4 p-3 rounded-xl space-y-1 font-mono text-xs ${
                  isBlackboard ? 'bg-[#0E1218]' : 'bg-slate-50'
                }`}>
                  <div className="text-neutral-500 font-bold">• Periodized Working Scheme:</div>
                  <div className="text-neutral-300 pl-2">Set 1: Warmup @ 55% 1RM</div>
                  <div className="text-white font-bold pl-2">Set 2: Working @ Target (RPE 8)</div>
                  <div className="text-white font-bold pl-2">Set 3: Working @ Target (RPE 8.5)</div>
                  <div className="text-white font-bold pl-2">Set 4: Overload @ Target (RPE 9)</div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-2 ${
                isBlackboard ? 'bg-[#141820] border-emerald-900/40' : 'bg-white border-emerald-200'
              }`}>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Tier 2 Accessories</span>
                <h4 className="font-bold text-base mt-1">Metabolic Stress & TUT</h4>
                <p className="text-xs text-neutral-400 mt-1">Cable Kickbacks, Lat Pulldowns, DB Lateral Raises</p>

                <div className={`mt-4 p-3 rounded-xl space-y-1 font-mono text-xs ${
                  isBlackboard ? 'bg-[#0E1218]' : 'bg-slate-50'
                }`}>
                  <div className="text-neutral-500 font-bold">• High Time-Under-Tension:</div>
                  <div className="text-neutral-300 pl-2">Set 1: 15 reps (Controlled tempo)</div>
                  <div className="text-white font-bold pl-2">Set 2: 15 reps (2s Peak Hold)</div>
                  <div className="text-white font-bold pl-2">Set 3: 15 reps to failure</div>
                  <div className="text-amber-400 pl-2">Rest: Strict 60s countdown timer</div>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-2 ${
                isBlackboard ? 'bg-[#141820] border-rose-900/40' : 'bg-white border-rose-200'
              }`}>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Tier 3 Core Finisher</span>
                <h4 className="font-bold text-base mt-1">TVA & Inner Corset</h4>
                <p className="text-xs text-neutral-400 mt-1">Dead Bugs, Weighted Planks, Hanging Leg Raises</p>

                <div className={`mt-4 p-3 rounded-xl space-y-1 font-mono text-xs ${
                  isBlackboard ? 'bg-[#0E1218]' : 'bg-slate-50'
                }`}>
                  <div className="text-neutral-500 font-bold">• Core Finisher Circuit:</div>
                  <div className="text-white font-bold pl-2">Set 1: 20 reps / 45s static hold</div>
                  <div className="text-white font-bold pl-2">Set 2: 20 reps / 60s static hold</div>
                  <div className="text-white font-bold pl-2">Set 3: Burnout to failure</div>
                  <div className="text-neutral-400 pl-2">Weight: 0kg bodyweight mechanics</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: DIET, FASTING & MACROS WEB */}
        {/* ============================================================== */}
        {currentTab === 'diet' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/30">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-purple-400">
                  Nutritional Biochemistry
                </span>
                <h2 className="text-xl font-black mt-0.5">
                  Macro Targets & Intermittent Fasting Schedule
                </h2>
              </div>
              <button
                onClick={() => pushRoute('nutrition')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-xs font-black flex items-center gap-1.5"
              >
                Go to Macro Ledger →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border-2 text-center ${
                isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
              }`}>
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">Daily Calorie Target</span>
                <div className="text-3xl font-black mt-1 text-[#E0A899]">
                  {isFemale ? '1,750' : '2,800'} <span className="text-sm font-normal text-neutral-400">kcal</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold block mt-1">Moderate Deficit (-10%)</span>
              </div>

              <div className={`p-4 rounded-2xl border-2 text-center ${
                isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
              }`}>
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">Protein Floor</span>
                <div className="text-3xl font-black mt-1 text-rose-400">
                  {isFemale ? '135' : '215'} <span className="text-sm font-normal text-neutral-400">g</span>
                </div>
                <span className="text-[11px] text-neutral-400 font-bold block mt-1">2.18–2.62 g/kg bodyweight</span>
              </div>

              <div className={`p-4 rounded-2xl border-2 text-center ${
                isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
              }`}>
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">Clean Fats & Lipids</span>
                <div className="text-3xl font-black mt-1 text-amber-400">
                  {isFemale ? '50' : '75'} <span className="text-sm font-normal text-neutral-400">g</span>
                </div>
                <span className="text-[11px] text-neutral-400 font-bold block mt-1">Hormonal steroidogenesis</span>
              </div>

              <div className={`p-4 rounded-2xl border-2 text-center ${
                isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
              }`}>
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">Cellular Hydration</span>
                <div className="text-3xl font-black mt-1 text-blue-400">
                  {isFemale ? '3.2' : '4.0'} <span className="text-sm font-normal text-neutral-400">L</span>
                </div>
                <span className="text-[11px] text-neutral-400 font-bold block mt-1">Electrolyte balanced</span>
              </div>
            </div>

            {/* Fasting Bar */}
            <div className={`p-5 rounded-2xl border-2 space-y-2 ${
              isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
            }`}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span>{isFemale ? '16:8 Lean Gains Schedule' : '23:1 OMAD Warrior Feast Schedule'}</span>
                <span className="font-mono text-purple-400 font-black">
                  {isFemale ? '16h Fasting / 8h Feeding' : '23h Fasting / 1h Feast'}
                </span>
              </div>
              <div className="w-full h-8 rounded-xl overflow-hidden flex border border-slate-700/40">
                <div className={`${isFemale ? 'w-1/3' : 'w-[8%]'} bg-purple-600 text-white text-[10px] font-mono font-bold flex items-center justify-center`}>
                  FEED
                </div>
                <div className={`${isFemale ? 'w-2/3' : 'w-[92%]'} bg-[#0E1218] text-neutral-400 text-[10px] font-mono font-bold flex items-center justify-center`}>
                  AUTOPHAGY CELLULAR CLEARING WINDOW
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: CLIENT JSON & GITHUB WEB */}
        {/* ============================================================== */}
        {currentTab === 'portability' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/30">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-blue-400">
                  Data Portability & Sovereignty
                </span>
                <h2 className="text-xl font-black mt-0.5">
                  Client JSON Export & GitHub Architecture
                </h2>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Zero Cloud Tracking
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-5 rounded-2xl border-2 space-y-3 ${
                isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
              }`}>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E0A899]/20 text-[#E0A899] uppercase">
                  Personal Trainers & Clients
                </span>
                <h4 className="font-bold text-base">Client Program Distribution</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Trainers can build custom programs using the 20-question engine, click <strong>"Export Profile JSON"</strong>, and deliver the configuration file to their clients. The client imports the file directly with 1 click to instantiate the schedule and routines.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border-2 space-y-3 ${
                isBlackboard ? 'bg-[#141820] border-[#2A3240]' : 'bg-white border-slate-300'
              }`}>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                  GitHub Open Source Developers
                </span>
                <h4 className="font-bold text-base">Self-Hosted Autonomous Engine</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Every user who clones the repository from GitHub gains full access to all 552 exercises, the 20-question intake engine, offline PWA capabilities, and instantaneous Vercel deployments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
