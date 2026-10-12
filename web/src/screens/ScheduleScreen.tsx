import React, { useState } from 'react';
import { useGymStore } from '../store/useGymStore';
import {
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  Utensils,
  Zap,
  Moon,
  Check,
  Plus,
  Trash2,
  Play,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import type { EventCategory, ScheduledEvent } from '../types';
import { getLocalDateString } from '../data/defaultSchedule';
import { ExerciseArt } from '../components/ExerciseArt';
import { DAY_NAMES } from '../utils/planGenerator';

export const ScheduleScreen: React.FC = () => {
  const {
    scheduledEvents,
    addScheduledEvent,
    toggleScheduledEvent,
    deleteScheduledEvent,
    injectDayPlanTemplate,
    getEventsForDate,
    startEmptyWorkout,
    startWorkoutFromRoutine,
    routines,
    pushRoute,
    getExerciseById,
    weeklyPlan,
    settings,
  } = useGymStore();

  const [viewMode, setViewMode] = useState<'picture' | 'timeline'>('picture');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('06:00');
  const [newDuration, setNewDuration] = useState<string | number>(45);
  const [newCategory, setNewCategory] = useState<EventCategory>('workout');
  const [newCitation, setNewCitation] = useState('');
  const [newTier, setNewTier] = useState<1 | 2 | 3 | 4 | 5>(2);

  // Calculate current week Monday to Sunday
  const today = new Date();
  const currentDayOfWeek = today.getDay() || 7; // 1 = Mon .. 7 = Sun
  const mondayOffset = 1 - currentDayOfWeek;

  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() + mondayOffset + idx);
    const dateStr = getLocalDateString(d);
    const dayOfWeek = idx + 1; // 1 = Mon .. 7 = Sun
    const routineId = weeklyPlan[dayOfWeek];
    const routine = routines.find((r) => r.id === routineId);
    const events = getEventsForDate(dateStr);
    const isToday = dateStr === getLocalDateString();

    return {
      dateStr,
      dayNum: d.getDate(),
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek]?.full || 'Day',
      shortDay: DAY_NAMES[dayOfWeek]?.short || 'Day',
      isToday,
      routine,
      events,
    };
  });

  // 14-day horizontal strip
  const dayStrip = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - 2 + idx);
    const dateStr = getLocalDateString(d);
    return {
      dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: dateStr === getLocalDateString(),
      isSelected: dateStr === selectedDate,
      hasEvents: true,
    };
  });

  const selectedDateEvents = getEventsForDate(selectedDate);
  const totalEvents = selectedDateEvents.length;
  const completedEvents = selectedDateEvents.filter((e) => e.completed).length;
  const completionPct = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
  const totalWorkoutMinutes = selectedDateEvents
    .filter((e) => e.category === 'workout')
    .reduce((acc, e) => acc + e.durationMinutes, 0);

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addScheduledEvent({
      date: selectedDate,
      time: newTime,
      durationMinutes: Number(newDuration) || 45,
      title: newTitle.trim(),
      category: newCategory,
      citation: newCitation.trim() || undefined,
      tier: newTier,
      completed: false,
    });

    setNewTitle('');
    setNewCitation('');
    setShowAddModal(false);
  };

  const getCategoryMeta = (cat: EventCategory) => {
    switch (cat) {
      case 'workout':
        return {
          label: 'WORKOUT',
          icon: Dumbbell,
          color: 'text-[#D9A184]',
          border: 'border-[#D9A184]/40',
          bg: 'bg-[#2A221C]',
          ring: 'bg-[#D9A184]',
        };
      case 'meal':
        return {
          label: 'NUTRITION',
          icon: Utensils,
          color: 'text-[#8FA377]',
          border: 'border-[#8FA377]/40',
          bg: 'bg-[#1C2618]',
          ring: 'bg-[#8FA377]',
        };
      case 'task':
        return {
          label: 'MISSION TASK',
          icon: Zap,
          color: 'text-[#7FA8C9]',
          border: 'border-[#7FA8C9]/40',
          bg: 'bg-[#18222A]',
          ring: 'bg-[#7FA8C9]',
        };
      case 'recovery':
      default:
        return {
          label: 'RECOVERY',
          icon: Moon,
          color: 'text-purple-300',
          border: 'border-purple-800/40',
          bg: 'bg-[#22182A]',
          ring: 'bg-purple-400',
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-[#D9A184]" />
              Visual Picture Schedule
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D9A184]/15 text-[#D9A184] border border-[#D9A184]/30 font-mono">
              7-Day Plan
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Visual workout calendar with exercise illustrations and rest day periodization
          </p>
        </div>

        {/* View Mode Toggle: Picture Schedule vs Daily Timeline */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-[#141214] border border-[#2B2428] rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('picture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'picture'
                  ? 'bg-[#D9A184] text-[#140D09] shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Picture Schedule</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#D9A184] text-[#140D09] shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Timeline Log</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#201D1F] hover:bg-[#2A2529] border border-[#302B2E] text-xs font-bold text-white flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Add Event
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: VISUAL PICTURE SCHEDULE (DEFAULT) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'picture' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {weekDays.map((day) => {
              const isWorkout = Boolean(day.routine);
              const workoutEvent = day.events.find((e) => e.category === 'workout');

              return (
                <div
                  key={day.dateStr}
                  className={`rounded-3xl border transition-all overflow-hidden shadow-lg ${
                    day.isToday
                      ? 'bg-gradient-to-br from-[#201A18] via-[#161413] to-[#121110] border-[#D9A184]/50 shadow-[#D9A184]/10'
                      : 'bg-[#141214] border-[#242024] hover:border-[#383036]'
                  }`}
                >
                  {/* Day Header Bar */}
                  <div className="p-4 sm:p-5 border-b border-[#221E22] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-mono border ${
                          day.isToday
                            ? 'bg-[#D9A184] border-[#D9A184] text-[#140D09] font-black'
                            : isWorkout
                            ? 'bg-[#1C181B] border-[#E0A899]/30 text-white font-bold'
                            : 'bg-[#121012] border-[#262024] text-neutral-500'
                        }`}
                      >
                        <span className="text-[10px] uppercase leading-none">{day.shortDay}</span>
                        <span className="text-sm font-black leading-tight">{day.dayNum}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white">{day.dayName}</h3>
                          {day.isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono bg-[#D9A184] text-[#140D09]">
                              TODAY
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400 font-mono">
                          {isWorkout
                            ? `${day.routine?.name} · ${workoutEvent?.time || '07:30 AM'}`
                            : 'Active Recovery & Parasympathetic Reset'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isWorkout ? (
                        <button
                          onClick={() => {
                            if (day.routine) startWorkoutFromRoutine(day.routine.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Session
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-[#1C1820] text-purple-300 border border-purple-800/30 text-xs font-mono font-bold">
                          Rest & Recovery
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content: Picture Grid or Recovery Walk */}
                  <div className="p-4 sm:p-5">
                    {isWorkout && day.routine ? (
                      <div>
                        <div className="text-[10px] font-mono uppercase text-neutral-400 font-bold mb-2.5 flex items-center justify-between">
                          <span>Exercise Sequence ({day.routine.exerciseIds.length} Movements)</span>
                          <span className="text-[#D9A184] font-bold">
                            {workoutEvent?.durationMinutes || 45} Min Planned
                          </span>
                        </div>

                        {/* Visual Exercise Pictures Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                          {day.routine.exerciseIds.map((exId, idx) => {
                            const ex = getExerciseById(exId);
                            if (!ex) return null;
                            const isAbsFinisher =
                              ex.primary.toLowerCase() === 'abdomen' ||
                              ex.primary.toLowerCase() === 'core' ||
                              idx === day.routine!.exerciseIds.length - 1;

                            return (
                              <div
                                key={exId}
                                className="p-2.5 rounded-2xl bg-[#100E10] border border-[#242024] hover:border-[#3E343A] flex flex-col justify-between transition-all group"
                              >
                                {/* Exercise Illustration Thumbnail */}
                                <div className="w-full h-16 sm:h-20 rounded-xl bg-[#0A090A] border border-[#1A181A] flex items-center justify-center overflow-hidden mb-2 relative">
                                  <ExerciseArt
                                    slug={ex.art}
                                    exerciseName={ex.name}
                                    primaryMuscle={ex.primary}
                                    height={56}
                                  />
                                  {isAbsFinisher && (
                                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono bg-[#E0A899]/20 text-[#E0A899] border border-[#E0A899]/40">
                                      CORE
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <div className="text-xs font-bold text-white line-clamp-1 leading-snug">
                                    {ex.name}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                                    <span className="capitalize">{ex.primary}</span>
                                    <span>
                                      {(day.routine?.setsCount && day.routine.setsCount[exId]) || (day.routine?.plannedSets && day.routine.plannedSets[exId]?.length) || 3} Sets
                                      {day.routine?.plannedSets && day.routine.plannedSets[exId]?.[0]
                                        ? ` · ${day.routine.plannedSets[exId][0].reps}r`
                                        : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#141018] border border-purple-900/20 text-xs text-purple-200">
                        <Moon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-white">Active Recovery Walk & Joint Mobility</div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Low-intensity parasympathetic walk to clear fatigue metabolites and restore central nervous system drive.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: CHRONOLOGICAL MISSION TIMELINE */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'timeline' && (
        <div className="space-y-5">
          {/* 14-Day Horizontal Calendar Strip */}
          <div className="bg-[#161514] border border-[#262422] rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1 text-xs">
              <span className="font-extrabold text-neutral-400 uppercase tracking-wider text-[11px]">
                Timeline Horizon
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDate(getLocalDateString())}
                  className="px-2.5 py-0.5 rounded-lg bg-[#221F1C] border border-[#3E3832] text-[10px] font-bold text-[#D9A184] hover:text-white"
                >
                  Today
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#100F0E] border border-[#282624] text-[11px] font-mono text-neutral-300 rounded-lg px-2 py-0.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {dayStrip.map((item) => (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[58px] py-2.5 px-2 rounded-2xl border transition-all active:scale-95 relative ${
                    item.isSelected
                      ? 'bg-[#D9A184] border-[#D9A184] text-[#140D09] shadow-lg shadow-[#D9A184]/20 scale-105 font-black'
                      : item.isToday
                      ? 'bg-[#221D1A] border-[#D9A184]/50 text-white'
                      : 'bg-[#121110] border-[#22201E] text-neutral-400 hover:text-white hover:border-[#333]'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider block mb-0.5">
                    {item.dayName}
                  </span>
                  <span className="text-base font-black font-mono leading-none">{item.dayNum}</span>

                  {item.hasEvents && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        item.isSelected ? 'bg-[#140D09]' : 'bg-[#D9A184]'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date Summary */}
          <div className="bg-[#161514] border border-[#262422] rounded-3xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#D9A184] font-black">
                {selectedDate === getLocalDateString() ? 'ACTIVE TODAY' : 'SCHEDULED DAY'}
              </span>
              <h3 className="text-xl font-black text-white">{formattedSelectedDate}</h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-neutral-400 block">{totalEvents} Events</span>
              <span className="text-sm font-bold text-[#8FA377]">{completedEvents} Done</span>
            </div>
          </div>

          {/* Chronological List */}
          <div className="space-y-3">
            {selectedDateEvents.map((event) => {
              const meta = getCategoryMeta(event.category);
              const routine = event.routineId ? routines.find((r) => r.id === event.routineId) : null;

              return (
                <div
                  key={event.id}
                  className={`bg-[#161514] border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all ${
                    event.completed
                      ? 'border-[#22201E] opacity-75 bg-[#121110]'
                      : 'border-[#262422] hover:border-[#383430]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleScheduledEvent(event.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                          event.completed
                            ? 'bg-[#8FA377] text-[#140D09]'
                            : 'bg-[#100F0E] border border-[#332E2A] text-transparent hover:border-[#D9A184]'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono border ${meta.border} ${meta.bg} ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">{event.time}</span>
                        </div>
                        <h4
                          className={`text-sm font-black ${
                            event.completed ? 'text-neutral-400 line-through' : 'text-white'
                          }`}
                        >
                          {event.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {event.category === 'workout' && !event.completed && (
                        <button
                          onClick={() => {
                            if (event.routineId) startWorkoutFromRoutine(event.routineId);
                            else if (routines.length > 0) startWorkoutFromRoutine(routines[0].id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => deleteScheduledEvent(event.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* If workout, show exercise thumbnails */}
                  {routine && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2 border-t border-[#22201E]">
                      {routine.exerciseIds.slice(0, 5).map((exId) => {
                        const ex = getExerciseById(exId);
                        if (!ex) return null;
                        return (
                          <div
                            key={exId}
                            className="p-2 rounded-xl bg-[#100E10] border border-[#201E20] flex items-center gap-2"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#0C0B0C] flex items-center justify-center overflow-hidden flex-shrink-0">
                              <ExerciseArt slug={ex.art} exerciseName={ex.name} height={30} />
                            </div>
                            <span className="text-[11px] font-bold text-neutral-200 line-clamp-1">
                              {ex.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Scheduled Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181615] border border-[#2B2724] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#262422] pb-3">
              <h3 className="text-base font-black text-white">Schedule Mission Block</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tactical Pull-up Overload"
                  className="w-full bg-[#121110] border border-[#2A2724] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A184]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#121110] border border-[#2A2724] rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="45"
                    className="w-full bg-[#121110] border border-[#2A2724] rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#22201E] text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D9A184] text-[#140D09] text-xs font-black"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
