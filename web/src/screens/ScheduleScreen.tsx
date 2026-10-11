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
} from 'lucide-react';
import type { EventCategory, ScheduledEvent } from '../types';
import { getLocalDateString } from '../data/defaultSchedule';

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
  } = useGymStore();

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('06:00');
  const [newDuration, setNewDuration] = useState(45);
  const [newCategory, setNewCategory] = useState<EventCategory>('workout');
  const [newCitation, setNewCitation] = useState('');
  const [newTier, setNewTier] = useState<1 | 2 | 3 | 4 | 5>(2);

  // Generate 14-day horizontal strip starting from 2 days ago
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
      durationMinutes: Number(newDuration),
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
      {/* Header & Quick Date Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-[#D9A184]" />
            Daily Schedule & Mission Planner
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Tactical time-blocking for physical workouts, single-meal windows, and high-gravity tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1C1A18] hover:bg-[#25221F] border border-[#2E2A26] text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition-all active:scale-95 shadow"
          >
            <Layers className="w-3.5 h-3.5 text-[#D9A184]" />
            Protocol Templates
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Schedule Event
          </button>
        </div>
      </div>

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

      {/* Selected Day Mission Banner */}
      <div className="bg-gradient-to-r from-[#1C1815] via-[#161413] to-[#121110] border border-[#2B2724] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D9A184]/20 text-[#D9A184] border border-[#D9A184]/30 font-mono">
                {selectedDate === getLocalDateString() ? 'ACTIVE TODAY' : 'SCHEDULED DAY'}
              </span>
              <span className="text-xs text-neutral-400 font-mono">{selectedDate}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formattedSelectedDate}
            </h3>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-[#141312] border border-[#242220] text-center min-w-[70px]">
              <span className="text-[10px] text-neutral-500 font-bold uppercase block">Planned</span>
              <span className="text-base font-black text-white font-mono">{totalEvents}</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-[#141312] border border-[#242220] text-center min-w-[70px]">
              <span className="text-[10px] text-neutral-500 font-bold uppercase block">Done</span>
              <span className="text-base font-black text-[#8FA377] font-mono">
                {completedEvents}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-[#141312] border border-[#242220] text-center min-w-[80px]">
              <span className="text-[10px] text-neutral-500 font-bold uppercase block">Training</span>
              <span className="text-base font-black text-[#D9A184] font-mono">
                {totalWorkoutMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 font-bold">
            <span>Mission Readiness & Completion</span>
            <span className="text-white font-mono">{completionPct}% Completed</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#100F0E] overflow-hidden border border-[#22201E]">
            <div
              className="h-full bg-gradient-to-r from-[#D9A184] to-[#8FA377] rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chronological Schedule Timeline */}
      <div className="space-y-3 pt-2">
        {selectedDateEvents.length === 0 ? (
          <div className="bg-[#161514] border border-[#262422] rounded-3xl p-10 text-center space-y-4 shadow-xl">
            <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto stroke-1" />
            <div>
              <h4 className="text-base font-black text-white">No scheduled mission blocks</h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                No events or workouts are scheduled for {formattedSelectedDate}. Add a block or inject a calibrated protocol.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => injectDayPlanTemplate(selectedDate, 'marine_tactical')}
                className="px-4 py-2 rounded-xl bg-[#221D1A] hover:bg-[#2C2420] border border-[#3E3832] text-xs font-bold text-[#D9A184] flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Load USMC Tactical Day
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-[#D9A184] text-[#140D09] text-xs font-black flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Schedule Block
              </button>
            </div>
          </div>
        ) : (
          selectedDateEvents.map((event, idx) => {
            const meta = getCategoryMeta(event.category);
            const Icon = meta.icon;

            return (
              <React.Fragment key={event.id}>
                <div
                  className={`bg-[#161514] border rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition-all shadow-md group ${
                    event.completed
                      ? 'border-[#22201E] opacity-75 bg-[#121110]'
                      : 'border-[#262422] hover:border-[#383430]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox button */}
                    <button
                      onClick={() => toggleScheduledEvent(event.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                        event.completed
                          ? 'bg-[#8FA377] text-[#140D09] shadow-md'
                          : 'bg-[#100F0E] border border-[#332E2A] text-transparent hover:border-[#D9A184]'
                      }`}
                      title={event.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="space-y-1">
                      {/* Category & Time Tag */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono border ${meta.border} ${meta.bg} ${meta.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>

                        <span className="text-xs font-mono font-bold text-[#D9A184] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {event.time} ({event.durationMinutes}m)
                        </span>

                        {event.tier && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#100F0E] text-neutral-400 border border-[#242220]">
                            Tier {event.tier}
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h4
                        className={`text-sm sm:text-base font-black tracking-tight ${
                          event.completed ? 'text-neutral-400 line-through' : 'text-white'
                        }`}
                      >
                        {event.title}
                      </h4>

                      {/* Citation or scientific mechanism */}
                      {event.citation && (
                        <p className="text-[11px] text-neutral-400 italic leading-relaxed pt-0.5">
                          💡 {event.citation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {event.category === 'workout' && !event.completed && (
                      <button
                        onClick={() => {
                          if (event.routineId && routines.some((r) => r.id === event.routineId)) {
                            startWorkoutFromRoutine(event.routineId);
                          } else if (routines.length > 0) {
                            startWorkoutFromRoutine(routines[0].id);
                          } else {
                            startEmptyWorkout();
                            pushRoute('session');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] font-black text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">Start</span> Session
                      </button>
                    )}

                    <button
                      onClick={() => deleteScheduledEvent(event.id)}
                      className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-950/20 transition-all opacity-40 group-hover:opacity-100"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Transition Buffer line between events */}
                {idx < selectedDateEvents.length - 1 && (
                  <div className="flex items-center gap-3 px-6 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#383430]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-l border-dashed border-[#2E2A26] pl-3 py-1">
                      ↓ 15m Protective Transition & Hydration Buffer
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* MODAL: ADD EVENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161514] border border-[#2B2724] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#242220]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#D9A184]" />
                <h3 className="text-base font-black text-white">Schedule Day Block</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Block / Mission Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combat Conditioning Push / 23:1 OMAD Feast"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A184]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D9A184]"
                  >
                    <option value="workout">🏋️ Physical Workout</option>
                    <option value="meal">🥩 Nutrition / Meal</option>
                    <option value="task">⚡ Mission Deep Work</option>
                    <option value="recovery">🛌 Recovery & Sleep</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D9A184]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D9A184]"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 hr)</option>
                    <option value={90}>90 Minutes (1.5 hr)</option>
                    <option value={120}>120 Minutes (2 hr)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">XP / Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(Number(e.target.value) as any)}
                    className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#D9A184]"
                  >
                    <option value={1}>Tier 1: Micro (+100 XP)</option>
                    <option value={2}>Tier 2: Routine (+300 XP)</option>
                    <option value={3}>Tier 3: Heavy Labor (+750 XP)</option>
                    <option value={4}>Tier 4: Boss Battle (+1500 XP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Tactical Notes / Scientific Citation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schoenfeld 2017: Mechanical tension near failure"
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  className="w-full bg-[#100F0E] border border-[#2E2A26] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D9A184]"
                />
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
                  className="px-5 py-2 rounded-xl bg-[#D9A184] hover:bg-[#E5AC8F] text-[#140D09] text-xs font-black shadow"
                >
                  Save Schedule Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROTOCOL TEMPLATES */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161514] border border-[#2B2724] rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#242220]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D9A184]" />
                <h3 className="text-base font-black text-white">Load Protocol Template</h3>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Inject a calibrated daily protocol onto <strong>{formattedSelectedDate}</strong>. Replaces existing events for this date.
            </p>

            <div className="space-y-3 pt-1">
              {[
                {
                  id: 'marine_tactical' as const,
                  name: 'USMC Combat Conditioning Day',
                  badge: 'TACTICAL',
                  desc: '05:30 Mineral Shield, 06:00 Heavy PT, 08:30 Zone 2 Ruck, 11:30 Deep Work, 17:30 23:1 OMAD Lean Beef, 21:30 Sleep Protocol.',
                  icon: Shield,
                  color: 'text-red-400',
                },
                {
                  id: 'omad_conditioning' as const,
                  name: '23:1 OMAD Fasting & Autophagy Day',
                  badge: 'FASTING',
                  desc: 'Fasted boxing intervals, electrolyte shields, midday sunlight walk, 1,500 kcal single evening salmon feast.',
                  icon: Utensils,
                  color: 'text-[#8FA377]',
                },
                {
                  id: 'hypertrophy_split' as const,
                  name: 'Hypertrophic Volume & 3-Meal Split',
                  badge: 'HYPERTROPHY',
                  desc: 'Heavy barbell overload (4-6 RIR), 3 structured high-protein boluses (whey, chicken, beef) every 4 hours.',
                  icon: Dumbbell,
                  color: 'text-[#D9A184]',
                },
              ].map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      injectDayPlanTemplate(selectedDate, template.id);
                      setShowTemplateModal(false);
                    }}
                    className="p-4 rounded-2xl bg-[#100F0E] border border-[#242220] hover:border-[#D9A184]/50 cursor-pointer transition-all active:scale-98 group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${template.color}`} />
                        <span className="text-xs font-black text-white">{template.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#201D1A] text-[#D9A184] border border-[#3E3832]">
                          {template.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed pr-2">
                        {template.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D9A184] transition-colors flex-shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
