import React, { useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import {
  Utensils,
  Flame,
  Droplets,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Shield,
  Check,
  ChevronRight,
  X,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { founderPresets, clinicalDietMatrix, getLocalDateString } from '../data/defaultSchedule';
import type { MealEntry } from '../types';

export const NutritionScreen: React.FC = () => {
  const {
    meals,
    logMeal,
    removeMeal,
    nutritionTargets,
    updateNutritionTargets,
    waterMl,
    addWater,
    resetWater,
  } = useGymStore();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [sodiumMg, setSodiumMg] = useState('');

  const todayStr = getLocalDateString();
  const todayMeals = meals.filter((m) => m.date === todayStr);

  const totalCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = todayMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + m.fat, 0);
  const totalSodium = todayMeals.reduce((acc, m) => acc + (m.sodiumMg || 0), 0);

  const calPct = Math.min(100, Math.round((totalCalories / nutritionTargets.calories) * 100));
  const proPct = Math.min(100, Math.round((totalProtein / nutritionTargets.protein) * 100));
  const carbPct = Math.min(100, Math.round((totalCarbs / nutritionTargets.carbs) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / nutritionTargets.fat) * 100));
  const waterPct = Math.min(100, Math.round((waterMl / nutritionTargets.waterMl) * 100));

  const handleLogCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !calories) return;

    logMeal({
      date: todayStr,
      name: mealName.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      sodiumMg: sodiumMg ? parseInt(sodiumMg) : undefined,
    });

    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSodiumMg('');
    setShowAddModal(false);
  };

  const handleQuickAddPreset = (preset: (typeof founderPresets)[0]) => {
    logMeal({
      date: todayStr,
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      sodiumMg: preset.sodiumMg,
      loggedAt: preset.loggedAt,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Utensils className="w-6 h-6 text-[#8FA377]" />
            Nutrition & Macro Ledger
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Clinical macronutrient tracking, fasting windows, and high-protein whole food ledger
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[#8FA377] hover:bg-[#9EB385] text-[#140D09] font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Log Custom Food
        </button>
      </div>

      {/* Top Macro Summary Card */}
      <div className="bg-[#161514] border border-[#262422] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#242220]">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
              DAILY ENERGY BALANCE
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {totalCalories}
              </span>
              <span className="text-xs text-neutral-400 font-bold font-mono">
                / {nutritionTargets.calories} kcal ({calPct}%)
              </span>
            </div>
          </div>

          {/* Caloric remaining badge */}
          <div className="px-4 py-2 rounded-2xl bg-[#1C1A18] border border-[#2E2A26] flex items-center gap-2 self-start sm:self-auto">
            <Flame className="w-4 h-4 text-[#D9A184]" />
            <span className="text-xs font-bold text-neutral-300">
              {Math.max(0, nutritionTargets.calories - totalCalories)} kcal remaining
            </span>
          </div>
        </div>

        {/* 4 Macro Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Protein */}
          <div className="p-4 rounded-2xl bg-[#121110] border border-[#242220] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#D9A184]">PROTEIN</span>
              <span className="font-mono text-neutral-400 font-bold">
                {totalProtein}/{nutritionTargets.protein}g
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#1C1A18] overflow-hidden">
              <div
                className="h-full bg-[#D9A184] rounded-full transition-all duration-500"
                style={{ width: `${proPct}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              {proPct}% · 1.6-2.2g/kg muscle retention
            </span>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-2xl bg-[#121110] border border-[#242220] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#7FA8C9]">CARBS</span>
              <span className="font-mono text-neutral-400 font-bold">
                {totalCarbs}/{nutritionTargets.carbs}g
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#1C1A18] overflow-hidden">
              <div
                className="h-full bg-[#7FA8C9] rounded-full transition-all duration-500"
                style={{ width: `${carbPct}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              {carbPct}% · Glycogen replenishment
            </span>
          </div>

          {/* Fats */}
          <div className="p-4 rounded-2xl bg-[#121110] border border-[#242220] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-purple-300">FATS</span>
              <span className="font-mono text-neutral-400 font-bold">
                {totalFat}/{nutritionTargets.fat}g
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#1C1A18] overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${fatPct}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              {fatPct}% · Hormonal endocrine baseline
            </span>
          </div>

          {/* Hydration */}
          <div className="p-4 rounded-2xl bg-[#121110] border border-[#242220] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-400">WATER</span>
              <span className="font-mono text-neutral-400 font-bold">
                {(waterMl / 1000).toFixed(1)}/{(nutritionTargets.waterMl / 1000).toFixed(1)}L
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#1C1A18] overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${waterPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={() => addWater(250)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1A18] hover:bg-[#25221F] text-blue-300 border border-[#2A2826]"
              >
                +250ml
              </button>
              <button
                onClick={() => addWater(500)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1A18] hover:bg-[#25221F] text-blue-300 border border-[#2A2826]"
              >
                +500ml
              </button>
              <button
                onClick={resetWater}
                className="text-[10px] font-mono text-neutral-600 hover:text-neutral-400"
                title="Reset water count"
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fasting & Feeding Protocol Card */}
      <div className="bg-[#161514] border border-[#262422] rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#221C18] border border-[#D9A184]/40 text-[#D9A184] flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Fasting Protocol: {nutritionTargets.fastingProtocol.toUpperCase()}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                  Autophagy Active
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {nutritionTargets.fastingHours}h Daily Fast · Single 1-hour nutrient-dense feeding window at 17:30
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#100F0E] p-1 rounded-xl border border-[#242220] self-start sm:self-auto">
            {(['omad', '16_8', '20_4', 'standard'] as const).map((p) => (
              <button
                key={p}
                onClick={() =>
                  updateNutritionTargets({
                    fastingProtocol: p,
                    fastingHours: p === 'omad' ? 23 : p === '16_8' ? 16 : p === '20_4' ? 20 : 12,
                  })
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all uppercase ${
                  nutritionTargets.fastingProtocol === p
                    ? 'bg-[#D9A184] text-[#140D09]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1-Click Founder & Tactical Food Presets */}
      <div className="bg-[#161514] border border-[#262422] rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D9A184]" />
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              1-Click Founder & Tactical Presets
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">Instant Macro Logging</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {founderPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAddPreset(preset)}
              className="p-3.5 rounded-2xl bg-[#121110] hover:bg-[#1C1A18] border border-[#242220] hover:border-[#D9A184]/40 text-left transition-all active:scale-98 group flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-[#D9A184] transition-colors line-clamp-1">
                  {preset.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-1">
                  <span className="text-white font-bold">{preset.calories} kcal</span>
                  <span>•</span>
                  <span className="text-[#D9A184]">{preset.protein}g P</span>
                  <span>•</span>
                  <span className="text-[#7FA8C9]">{preset.carbs}g C</span>
                  <span>•</span>
                  <span className="text-purple-300">{preset.fat}g F</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#1C1A18] text-[10px] text-neutral-500 font-bold">
                <span>+ Add to Today's Ledger</span>
                <Plus className="w-3.5 h-3.5 text-[#D9A184] group-hover:scale-110 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Logged Foods Ledger */}
      <div className="bg-[#161514] border border-[#262422] rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#8FA377]" />
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Today's Food & Meal Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {todayMeals.length} item{todayMeals.length === 1 ? '' : 's'} logged
          </span>
        </div>

        {todayMeals.length === 0 ? (
          <div className="p-8 text-center bg-[#100F0E] rounded-2xl border border-[#22201E] text-xs text-neutral-400 italic">
            No meals logged today yet. Tap any 1-Click Preset above or click "+ Log Custom Food".
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {todayMeals.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#121110] border border-[#242220] flex items-center justify-between gap-3 text-xs group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">{item.name}</span>
                    {item.loggedAt && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        @{item.loggedAt}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] mt-1 text-neutral-300">
                    <span className="text-white font-bold">{item.calories} kcal</span>
                    <span className="text-[#D9A184] font-semibold">{item.protein}g P</span>
                    <span className="text-[#7FA8C9] font-semibold">{item.carbs}g C</span>
                    <span className="text-purple-300 font-semibold">{item.fat}g F</span>
                    {item.sodiumMg ? (
                      <span className="text-neutral-500">{item.sodiumMg}mg Na</span>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={() => removeMeal(item.id)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/20 transition-all opacity-40 group-hover:opacity-100"
                  title="Remove food item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Evidence Matrix */}
      <div className="bg-[#161514] border border-[#262422] rounded-3xl p-5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#D9A184]" />
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Clinical Dietary Composition Archetypes
          </h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Decoupling fasting timing from macronutrient composition based on peer-reviewed clinical research.
        </p>

        <div className="space-y-2 pt-1">
          {clinicalDietMatrix.map((diet, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#121110] border border-[#242220] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white">{diet.name}</span>
                  <span className="text-[11px] text-neutral-500 font-mono">({diet.timing})</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{diet.primary}</p>
              </div>
              <span
                className={`self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${diet.badge}`}
              >
                {diet.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD CUSTOM FOOD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161514] border border-[#2B2724] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#242220]">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#8FA377]" />
                <h3 className="text-base font-black text-white">Log Custom Food Item</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogCustomMeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Food / Meal Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12oz Bison Ribeye + Sweet Potato"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#8FA377]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 650"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#8FA377]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 55"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#D9A184] focus:outline-none focus:border-[#D9A184]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 40"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#7FA8C9] focus:outline-none focus:border-[#7FA8C9]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 600"
                    value={sodiumMg}
                    onChange={(e) => setSodiumMg(e.target.value)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-300 focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#242220]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#222] text-xs font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8FA377] hover:bg-[#9EB385] text-[#140D09] text-xs font-black shadow"
                >
                  Log to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
