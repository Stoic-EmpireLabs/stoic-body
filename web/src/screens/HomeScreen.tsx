import React from 'react';
import { useGymStore } from '../store/useGymStore';
import {
  Play,
  Flame,
  Dumbbell,
  Calculator,
  BookOpen,
  Scale,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Utensils,
  Check,
  Plus,
  Droplets,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ExerciseArt } from '../components/ExerciseArt';
import { QuoteCard } from '../components/QuoteCard';
import { getLocalDateString } from '../data/defaultSchedule';

export const HomeScreen: React.FC = () => {
  const {
    session,
    sessions,
    routines,
    weeklyPlan,
    pushRoute,
    setRoute,
    startWorkoutFromRoutine,
    startEmptyWorkout,
    getStreak,
    getHeatmapDays,
    allExercises,
    setActiveExerciseId,
    scheduledEvents,
    toggleScheduledEvent,
    getEventsForDate,
    meals,
    nutritionTargets,
    waterMl,
    addWater,
  } = useGymStore();

  const streak = getStreak();
  const heatmapDays = getHeatmapDays(84);

  // Today's recommended routine
  const todayDay = new Date().getDay() || 7; // 1 = Mon .. 7 = Sun
  const todayRoutineId = weeklyPlan[todayDay];
  const todayRoutine = routines.find((r) => r.id === todayRoutineId) || routines[0];

  // This Week Stats
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const weekSessions = sessions.filter(
    (s) => new Date(s.date).getTime() >= startOfWeek.getTime()
  );

  const weekVolume = weekSessions.reduce((acc, s) => acc + s.volume, 0);
  const weekWorkouts = weekSessions.length;
  const weekSets = weekSessions.reduce((acc, s) => acc + s.setCount, 0);
  const weekDurationMinutes = Math.round(
    weekSessions.reduce((acc, s) => acc + s.durationSec, 0) / 60
  );

  const formatVolume = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
    return `${Math.round(kg)} kg`;
  };

  const recommended = allExercises.slice(0, 8);

  // Today's Mission Schedule & Tasks
  const todayStr = getLocalDateString(new Date());
  const todayEvents = getEventsForDate(todayStr);

  const completedEventsCount = todayEvents.filter((e) => e.completed).length;
  const totalEventsCount = todayEvents.length;
  const eventsProgressPct =
    totalEventsCount > 0 ? Math.round((completedEventsCount / totalEventsCount) * 100) : 0;

  const handleEventDirectNavigation = (evt: any) => {
    if (evt.category === 'workout') {
      if (session) {
        setRoute('session');
      } else if (todayRoutine) {
        startWorkoutFromRoutine(todayRoutine.id);
        pushRoute('session');
      } else {
        startEmptyWorkout();
        pushRoute('session');
      }
    } else if (evt.category === 'meal') {
      setRoute('nutrition');
    } else if (evt.category === 'sleep' || evt.category === 'recovery' || evt.category === 'task') {
      setRoute('schedule');
    } else {
      setRoute('schedule');
    }
  };

  // Today's Meals & Nutrition
  const todayMeals = (meals || []).filter((m) => m.date === todayStr);
  const consumedCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const consumedProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);
  const consumedCarbs = todayMeals.reduce((acc, m) => acc + m.carbs, 0);
  const consumedFat = todayMeals.reduce((acc, m) => acc + m.fat, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Grid: Hero Workout Card & Weekly Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hero Workout Card (As seen in 01-home.png) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1C1916] via-[#161413] to-[#100F0E] border border-[#2B2724] p-6 shadow-2xl flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D9A184]/15 text-[#D9A184] border border-[#D9A184]/30">
                <Sparkles className="w-3.5 h-3.5" />
                {session ? 'Workout In Progress' : "TODAY'S ROUTINE"}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {session ? 'Active Workout Session' : todayRoutine?.name || 'Push Split'}
              </h2>
              <p className="text-sm text-neutral-400 mt-1.5">
                {session
                  ? `${session.exercises.length} exercises selected`
                  : todayRoutine
                  ? `${todayRoutine.exerciseIds.length} exercises planned for today`
                  : 'Start your session to keep your streak alive'}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
            {session ? (
              <button
                onClick={() => pushRoute('session')}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-[#140D09] font-black text-sm flex items-center gap-2 shadow-xl transition-transform active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume Session
              </button>
            ) : (
              <>
                {todayRoutine && (
                  <button
                    onClick={() => startWorkoutFromRoutine(todayRoutine.id)}
                    className="px-6 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-[#140D09] font-black text-sm flex items-center gap-2 shadow-xl transition-transform active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start workout
                  </button>
                )}
                <button
                  onClick={() => setRoute('train')}
                  className="px-5 py-3.5 rounded-full bg-[#262422] hover:bg-[#33302C] text-neutral-200 font-bold text-sm flex items-center gap-2 border border-[#3E3A35] transition-transform active:scale-98"
                >
                  <Dumbbell className="w-4 h-4 text-[#D9A184]" />
                  Body Map
                </button>
              </>
            )}
          </div>
        </div>

        {/* Week Calendar Row (As seen in 01-home.png) */}
        <div className="lg:col-span-5 bg-[#161514] border border-[#262422] rounded-[28px] p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 px-1 font-bold uppercase tracking-wider">
              <span>Weekly Consistency</span>
              <span className="text-[#D9A184]">{weekWorkouts} of 7 Completed</span>
            </div>

            {/* Week Circles with checkmarks */}
            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => {
                const dayNum = idx + 1;
                const isToday = todayDay === dayNum;
                const hasWorkout = weekSessions.some((s) => {
                  const d = new Date(s.date).getDay() || 7;
                  return d === dayNum;
                });

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center py-3 rounded-2xl transition-all ${
                      isToday
                        ? 'bg-[#28221D] border border-[#D9A184]/50'
                        : 'bg-[#1C1A18] border border-[#242220]'
                    }`}
                  >
                    <span className="text-xs font-black text-neutral-400 mb-2">{dayName}</span>
                    <div>
                      {hasWorkout ? (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                          <span className="text-[10px] text-[#140D09] font-black">✓</span>
                        </div>
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday ? 'bg-[#D9A184]/30 border border-[#D9A184]' : 'bg-[#22201E]'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-[#D9A184]' : 'bg-[#2E2C2A]'}`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Streak Callout */}
          <div className="mt-4 pt-3 border-t border-[#242220] flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Training Habit</span>
            <div className="flex items-center gap-1.5 font-bold text-white font-mono">
              <Flame className="w-4 h-4 text-[#FF7A00] fill-[#FF7A00]" />
              {streak}-day streak active
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stoic & Marine Discipline Wisdom Card */}
      <QuoteCard />

      {/* Today Mission Timeline & Nutrition Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Today's Mission Timeline */}
        <div className="lg:col-span-7 bg-[#161514] border border-[#262422] rounded-[28px] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                onClick={() => setRoute('schedule')}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Open Daily Schedule & 14-Day Calendar"
              >
                <div className="w-8 h-8 rounded-full bg-[#D9A184]/15 border border-[#D9A184]/30 flex items-center justify-center group-hover:bg-[#D9A184]/30 transition-colors">
                  <Calendar className="w-4 h-4 text-[#D9A184]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#D9A184] transition-colors flex items-center gap-1.5">
                    Today's Mission Timeline
                    <ArrowRight className="w-3.5 h-3.5 text-[#D9A184] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {completedEventsCount} of {totalEventsCount} milestones executed ({eventsProgressPct}%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoute('schedule')}
                className="text-xs text-[#D9A184] hover:underline font-bold flex items-center gap-1 group"
              >
                14-Day Calendar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#242220] h-1.5 rounded-full overflow-hidden mb-4">
              <div
                className="bg-[#D9A184] h-full transition-all duration-500 rounded-full"
                style={{ width: `${eventsProgressPct}%` }}
              />
            </div>

            {/* Event list */}
            <div className="space-y-2.5">
              {todayEvents.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-[#1C1A18] border border-[#242220]">
                  <p className="text-sm text-neutral-400 mb-2">No mission events scheduled for today.</p>
                  <button
                    onClick={() => setRoute('schedule')}
                    className="px-4 py-2 rounded-xl bg-[#262422] text-xs font-bold text-[#D9A184] hover:bg-[#322E2B]"
                  >
                    Open Schedule & Load Protocol
                  </button>
                </div>
              ) : (
                todayEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    data-event-id={evt.id}
                    data-event-category={evt.category}
                    onClick={() => handleEventDirectNavigation(evt)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group select-none ${
                      evt.completed
                        ? 'bg-[#181615] border-[#22201E] opacity-60 hover:opacity-100 hover:border-[#38332E]'
                        : 'bg-[#1C1A18] border-[#262422] hover:border-[#D9A184]/50 hover:bg-[#22201E]'
                    }`}
                    title={`Open ${
                      evt.category === 'workout'
                        ? 'Workout Session'
                        : evt.category === 'meal'
                        ? 'Meals & Nutrition'
                        : evt.category === 'sleep'
                        ? 'Sleep Protocol'
                        : 'Daily Schedule'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleScheduledEvent(evt.id);
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                          evt.completed
                            ? 'bg-[#D9A184] text-[#140D09]'
                            : 'border border-[#3E3A35] hover:border-[#D9A184]'
                        }`}
                        title={evt.completed ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {evt.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-neutral-300">
                            {evt.time}
                          </span>
                          <span
                            className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full border ${
                              evt.category === 'workout'
                                ? 'bg-[#D9A184]/15 text-[#D9A184] border-[#D9A184]/30'
                                : evt.category === 'meal'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : evt.category === 'task'
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : evt.category === 'sleep'
                                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {evt.category}
                          </span>
                        </div>
                        <p
                          className={`text-xs font-bold truncate mt-0.5 ${
                            evt.completed
                              ? 'line-through text-neutral-500'
                              : 'text-white group-hover:text-[#D9A184] transition-colors'
                          }`}
                        >
                          {evt.title}
                        </p>
                      </div>
                    </div>

                    {/* Right Action Trigger */}
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      {evt.category === 'workout' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventDirectNavigation(evt);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#D9A184] text-[#140D09] hover:bg-white text-xs font-black transition-colors flex items-center gap-1 active:scale-95 shadow"
                        >
                          {session ? 'Resume' : 'Start'}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : evt.category === 'meal' ? (
                        <span className="text-[10px] text-emerald-400/90 font-bold hidden sm:flex items-center gap-0.5 group-hover:underline">
                          Meals <ArrowRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-bold hidden sm:flex items-center gap-0.5 group-hover:underline">
                          Plan <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors sm:hidden" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {todayEvents.length > 4 && (
            <div className="pt-3 border-t border-[#242220] mt-3 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">
                +{todayEvents.length - 4} more scheduled milestones today
              </span>
              <button
                onClick={() => setRoute('schedule')}
                className="text-xs text-[#D9A184] font-bold hover:underline"
              >
                View Full Timeline
              </button>
            </div>
          )}
        </div>

        {/* Right: Nutrition & Fasting Snapshot */}
        <div className="lg:col-span-5 bg-[#161514] border border-[#262422] rounded-[28px] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                onClick={() => setRoute('nutrition')}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="Open Meals & Nutrition Ledger"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    Nutrition & Fasting
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {nutritionTargets.fastingProtocol || '23:1 OMAD Fasting Protocol'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoute('nutrition')}
                className="text-xs text-[#D9A184] hover:underline font-bold flex items-center gap-1 group"
              >
                Food Ledger <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Macro Bars */}
            <div className="space-y-3 mb-5">
              {/* Calories */}
              <div className="bg-[#1C1A18] border border-[#262422] rounded-2xl p-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-neutral-400 font-extrabold uppercase tracking-wider text-[10px]">
                    ENERGY BALANCE
                  </span>
                  <span className="font-mono font-bold text-white">
                    {consumedCalories} / <span className="text-neutral-500">{nutritionTargets.calories} kcal</span>
                  </span>
                </div>
                <div className="w-full bg-[#242220] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D9A184] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((consumedCalories / (nutritionTargets.calories || 2000)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Protein & Carbs/Fat mini row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1C1A18] border border-[#262422] rounded-2xl p-2.5">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">PROTEIN</span>
                  <div className="font-mono text-sm font-black text-white">{consumedProtein}g</div>
                  <span className="text-[10px] text-neutral-500 font-mono">/ {nutritionTargets.protein}g</span>
                </div>
                <div className="bg-[#1C1A18] border border-[#262422] rounded-2xl p-2.5">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">CARBS</span>
                  <div className="font-mono text-sm font-black text-white">{consumedCarbs}g</div>
                  <span className="text-[10px] text-neutral-500 font-mono">/ {nutritionTargets.carbs}g</span>
                </div>
                <div className="bg-[#1C1A18] border border-[#262422] rounded-2xl p-2.5">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">FATS</span>
                  <div className="font-mono text-sm font-black text-white">{consumedFat}g</div>
                  <span className="text-[10px] text-neutral-500 font-mono">/ {nutritionTargets.fat}g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hydration quick log */}
          <div className="pt-3 border-t border-[#242220] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <div className="text-xs">
                <span className="text-neutral-400">Hydration: </span>
                <span className="font-mono font-bold text-white">{waterMl} ml</span>
                <span className="text-neutral-500 text-[10px] font-mono"> / {nutritionTargets.waterMl} ml</span>
              </div>
            </div>
            <button
              onClick={() => addWater(250)}
              className="px-2.5 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3 h-3" /> 250ml
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: "This Week" Stats & Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* This Week Stats (As in 01-home.png) */}
        <div className="lg:col-span-5 bg-[#161514] border border-[#262422] rounded-[28px] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">This week</h3>
            <button
              onClick={() => setRoute('progress')}
              className="text-xs text-[#D9A184] hover:underline font-bold flex items-center gap-0.5"
            >
              Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#1C1A18] rounded-2xl">
              <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block mb-1">
                VOLUME
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {formatVolume(weekVolume)}
              </div>
            </div>

            <div className="p-3 bg-[#1C1A18] rounded-2xl">
              <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block mb-1">
                SETS TODAY
              </span>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">{weekSets}</div>
            </div>

            <div className="p-3 bg-[#1C1A18] rounded-2xl">
              <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block mb-1">
                SESSIONS
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#D9A184] font-mono">
                {weekWorkouts}
              </div>
            </div>
          </div>
        </div>

        {/* 84-Day Activity Heatmap (As in 01-home.png) */}
        <div className="lg:col-span-7 bg-[#161514] border border-[#262422] rounded-[28px] p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Activity</h3>
            </div>
            <button
              onClick={() => setRoute('progress')}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-bold"
            >
              History <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Golden/Amber Heatmap Grid */}
          <div className="bg-[#121110] border border-[#22201E] rounded-2xl p-4 overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-between min-w-[500px]">
              {heatmapDays.map((day, idx) => {
                const colors = [
                  'bg-[#22201E]',
                  'bg-[#7A4028]',
                  'bg-[#B4632C]',
                  'bg-[#E38B3A]',
                  'bg-[#FFC168]',
                ];
                return (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-[3px] ${colors[day.level]} hover:ring-2 hover:ring-white transition-all`}
                    title={`${day.date}: ${day.count} sessions, ${day.volume} kg volume`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Companion Folders (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-neutral-300 tracking-wider uppercase">
            Gym Companions & Tools
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => pushRoute('routines')}
            className="bg-[#161514] hover:bg-[#1E1C1A] border border-[#262422] hover:border-[#D9A184]/40 rounded-3xl p-5 cursor-pointer transition-all active:scale-98 shadow-md group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#26221E] text-[#D9A184] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Routines & Splits</h4>
            <p className="text-xs text-neutral-400 mt-1">{routines.length} Saved Plans</p>
          </div>

          <div
            onClick={() => pushRoute('tools')}
            className="bg-[#161514] hover:bg-[#1E1C1A] border border-[#262422] hover:border-[#8FA377]/40 rounded-3xl p-5 cursor-pointer transition-all active:scale-98 shadow-md group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1E2620] text-[#8FA377] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Calculators</h4>
            <p className="text-xs text-neutral-400 mt-1">6 Tools (1RM, Plates, Warmup)</p>
          </div>

          <div
            onClick={() => pushRoute('measures')}
            className="bg-[#161514] hover:bg-[#1E1C1A] border border-[#262422] hover:border-[#A38FB9]/40 rounded-3xl p-5 cursor-pointer transition-all active:scale-98 shadow-md group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#221E26] text-[#A38FB9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Measurements</h4>
            <p className="text-xs text-neutral-400 mt-1">Weight & Body Circumferences</p>
          </div>

          <div
            onClick={() => pushRoute('notes')}
            className="bg-[#161514] hover:bg-[#1E1C1A] border border-[#262422] hover:border-[#7FA8C9]/40 rounded-3xl p-5 cursor-pointer transition-all active:scale-98 shadow-md group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1E2226] text-[#7FA8C9] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Gym Journal</h4>
            <p className="text-xs text-neutral-400 mt-1">Training Log Cues & Thoughts</p>
          </div>
        </div>
      </div>

      {/* Fourth Row: Recommended Exercises Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-neutral-300 tracking-wider uppercase">
            Exercise Catalog Highlights
          </h3>
          <button
            onClick={() => setRoute('exercises')}
            className="text-xs text-[#D9A184] hover:underline flex items-center gap-0.5 font-bold"
          >
            View all 552 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recommended.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                setActiveExerciseId(ex.id);
                pushRoute('exercise-detail');
              }}
              className="bg-[#161514] hover:bg-[#1E1C1A] border border-[#262422] hover:border-[#D9A184]/40 rounded-3xl p-3.5 cursor-pointer transition-all active:scale-98 flex flex-col justify-between shadow-md"
            >
              <div className="h-32 rounded-2xl overflow-hidden bg-[#100F0E] mb-3 flex items-center justify-center p-0">
                <ExerciseArt
                  slug={ex.art || ex.id}
                  exerciseName={ex.name}
                  primaryMuscle={ex.primary}
                  height={128}
                  loop={false}
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#D9A184] uppercase tracking-wider block">
                  {ex.primary}
                </span>
                <span className="text-sm font-bold text-white line-clamp-1 mt-0.5">{ex.name}</span>
                <span className="text-xs text-neutral-400 block mt-0.5">{ex.equipment}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
