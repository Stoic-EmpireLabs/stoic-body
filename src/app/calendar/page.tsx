"use client";

import React, { useState } from "react";
import { useStoic, CalendarEvent } from "@/context/StoicContext";
import { calculateBufferMinutes, detectScheduleOverflow, ScheduledTask } from "@/lib/scheduling";

export default function CalendarPage() {
  const { calendarEvents, addCalendarEvent } = useStoic();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-04");
  const [mvdActive, setMvdActive] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(selectedDate);
  const [newEventTime, setNewEventTime] = useState("10:00");
  const [newEventDuration, setNewEventDuration] = useState("60");
  const [newEventTier, setNewEventTier] = useState("2");

  // October 2026 Days (31 days)
  // 2026-10-01 was a Thursday
  const daysInMonth = 31;
  const startDayOfWeek = 4; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-10-${dayNum < 10 ? `0${dayNum}` : dayNum}`;
    const dayEvents = calendarEvents.filter((e) => e.date === dateStr);
    return {
      dayNum,
      dateStr,
      events: dayEvents,
    };
  });

  const selectedDateEvents = calendarEvents.filter((e) => e.date === selectedDate);

  // Calculate day audit for selected date
  const dayTasksForAudit: ScheduledTask[] = selectedDateEvents.map((e) => ({
    id: e.id,
    title: e.title,
    durationMinutes: mvdActive ? Math.round(e.durationMinutes * 0.6) : e.durationMinutes,
    priorityTier: e.tier,
  }));

  const audit = detectScheduleOverflow(
    dayTasksForAudit.length > 0
      ? dayTasksForAudit
      : [
          { id: "1", title: "Morning Anchor (Water, Movement)", durationMinutes: 45, priorityTier: 1 },
          { id: "2", title: "23:1 OMAD Feeding Window", durationMinutes: 60, priorityTier: 1 },
        ],
    "05:30",
    "22:00"
  );

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    addCalendarEvent({
      date: newEventDate,
      title: newEventTitle.trim(),
      time: newEventTime,
      durationMinutes: parseInt(newEventDuration) || 45,
      tier: parseInt(newEventTier) || 2,
    });
    setNewEventTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">

      {/* HEADER SECTION WITH VIEW SWITCHER & ADD EVENT CTA */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <span>Unified Temporal Calendar</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              Month &bull; Week &bull; Day Buffers
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full calendar scheduling with automatic transition buffers (Bi = max(15, 0.20 &times; Duration)) and MVD crisis mode.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* VIEW TOGGLES */}
          <div className="flex bg-[#181924] p-1 rounded-lg border border-[#232636] text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                viewMode === "month"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🗓️ Month Grid
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                viewMode === "week"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📆 7-Day Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                viewMode === "day"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏱️ Day Timeline
            </button>
          </div>

          {/* ADD EVENT BUTTON */}
          <button
            onClick={() => {
              setNewEventDate(selectedDate);
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow flex items-center gap-1.5"
          >
            <span>+</span> Schedule Event
          </button>
        </div>
      </section>

      {/* MONTH GRID VIEW */}
      {viewMode === "month" && (
        <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#232636] pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 font-serif">October 2026</h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Selected: {selectedDate}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Click any date to inspect timeline or schedule tasks
            </div>
          </div>

          {/* DAY NAMES */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* 31-DAY MONTH GRID */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset for start day of week */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-24 bg-[#0E0F16]/40 rounded-lg border border-[#1A1C28]/40 opacity-30"></div>
            ))}

            {monthDays.map((d) => {
              const isSelected = d.dateStr === selectedDate;
              const isToday = d.dateStr === "2026-10-04";

              return (
                <div
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`h-24 p-2 rounded-lg border cursor-pointer transition flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                      : isToday
                      ? "bg-[#181924] border-indigo-500/50"
                      : "bg-[#181924] border-[#232636] hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-indigo-500 text-white"
                          : isSelected
                          ? "bg-amber-500 text-black"
                          : "text-slate-300"
                      }`}
                    >
                      {d.dayNum}
                    </span>
                    {d.events.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {d.events.length}
                      </span>
                    )}
                  </div>

                  {/* EVENT BADGES (SHOW UP TO 2) */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {d.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded bg-[#202232] text-slate-300 border border-white/5"
                        title={ev.title}
                      >
                        {ev.time} {ev.title}
                      </div>
                    ))}
                    {d.events.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-mono">
                        +{d.events.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7-DAY WEEK VIEW */}
      {viewMode === "week" && (
        <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#232636] pb-3">
            <h3 className="text-base font-bold text-slate-100 font-serif">
              Week of Oct 4 &ndash; Oct 10, 2026
            </h3>
            <span className="text-xs text-slate-400">7-Day Tactical Horizon</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[
              { day: "Sun", date: "2026-10-04", label: "Oct 4 (Today)" },
              { day: "Mon", date: "2026-10-05", label: "Oct 5" },
              { day: "Tue", date: "2026-10-06", label: "Oct 6" },
              { day: "Wed", date: "2026-10-07", label: "Oct 7" },
              { day: "Thu", date: "2026-10-08", label: "Oct 8" },
              { day: "Fri", date: "2026-10-09", label: "Oct 9" },
              { day: "Sat", date: "2026-10-10", label: "Oct 10 (Family)" },
            ].map((col) => {
              const colEvents = calendarEvents.filter((e) => e.date === col.date);
              const isSelected = selectedDate === col.date;
              return (
                <div
                  key={col.date}
                  onClick={() => setSelectedDate(col.date)}
                  className={`p-3 rounded-lg border cursor-pointer transition min-h-[220px] flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500"
                      : "bg-[#181924] border-[#232636] hover:border-slate-500"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#2B2E42] pb-1.5 mb-2">
                      <span className="font-bold text-xs text-slate-200">{col.day}</span>
                      <span className="font-mono text-[11px] text-slate-400">{col.label}</span>
                    </div>

                    <div className="space-y-1.5">
                      {colEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-1.5 rounded bg-[#1F2130] border border-white/5 text-[11px]"
                        >
                          <div className="font-mono text-[10px] text-amber-400 font-semibold">{ev.time}</div>
                          <div className="text-slate-200 font-medium leading-tight mt-0.5">{ev.title}</div>
                        </div>
                      ))}
                      {colEvents.length === 0 && (
                        <div className="text-[11px] text-slate-600 italic py-2">Open schedule</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewEventDate(col.date);
                      setShowAddModal(true);
                    }}
                    className="mt-2 text-[10px] text-slate-400 hover:text-amber-400 py-1 border border-dashed border-[#2B2E42] rounded text-center transition"
                  >
                    + Add to {col.day}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SELECTED DATE TIMELINE & SCHEDULE AUDIT */}
      <section className="bg-[#13141C] border border-[#232636] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#232636] pb-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Timeline for {selectedDate}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {selectedDateEvents.length} Scheduled Blocks
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological sequence with dynamic protective transition buffers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMvdActive(!mvdActive)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition border ${
                mvdActive
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 text-slate-300 border-[#232636] hover:bg-slate-700"
              }`}
            >
              {mvdActive ? "⚡ MVD ACTIVE (COMPRESSED)" : "Activate Minimum Viable Day"}
            </button>
          </div>
        </div>

        {/* SCHEDULE AUDIT METRICS */}
        <div className="bg-[#181924] border border-[#232636] rounded-lg p-3 flex flex-wrap items-center justify-between text-xs gap-2">
          <div>
            <span className="text-slate-400">Total Commitment (Tasks + Buffers): </span>
            <strong className="text-slate-100 font-mono">{audit.totalCommitmentMinutes} mins</strong>
            <span className="text-slate-500 mx-2">&bull;</span>
            <span className="text-slate-400">Available Waking: </span>
            <strong className="text-emerald-400 font-mono">{audit.availableWakingMinutes} mins</strong>
          </div>
          <span
            className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[11px] ${
              audit.hasOverflow
                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {audit.hasOverflow ? `Overflow: +${audit.overflowMinutes}m` : "Conflict-Free Balance"}
          </span>
        </div>

        {/* TIME BLOCKS WITH BUFFERS */}
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#232636] pt-2">
          {selectedDateEvents.map((task, idx) => {
            const buffer = calculateBufferMinutes(task.durationMinutes);
            return (
              <React.Fragment key={task.id}>
                {/* Task Block */}
                <div className="relative pl-8">
                  <span className="absolute left-2 top-3 w-2.5 h-2.5 rounded-full bg-amber-500 -translate-x-1/2 ring-4 ring-[#13141C]"></span>
                  <div className="bg-[#1C1E2B] border border-[#232636] p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono font-semibold text-amber-400">
                        {task.time} &middot; {task.durationMinutes} Minutes
                      </div>
                      <h4 className="text-sm font-medium text-slate-100">{task.title}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      Tier {task.tier}
                    </span>
                  </div>
                </div>

                {/* Transition Buffer */}
                {idx < selectedDateEvents.length - 1 && (
                  <div className="relative pl-8">
                    <span className="absolute left-2 top-2 w-1.5 h-1.5 rounded-full bg-slate-600 -translate-x-1/2"></span>
                    <div className="bg-slate-900/50 border border-dashed border-slate-700/50 px-3 py-1.5 rounded text-[11px] text-slate-400 flex items-center justify-between">
                      <span>&cudarrr; {buffer}-Min Protective Transition Buffer</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        Bi = max(15, 0.20 &times; {task.durationMinutes})
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {selectedDateEvents.length === 0 && (
            <div className="pl-8 text-xs text-slate-500 italic py-4">
              No tasks scheduled for {selectedDate}. Click &ldquo;+ Schedule Event&rdquo; to add blocks.
            </div>
          )}
        </div>
      </section>

      {/* SCHEDULE EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13141C] border border-[#232636] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#232636] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Schedule New Calendar Event
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2015 Mustang Oil Change / Boxing 5 Rounds"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                    Duration (Minutes)
                  </label>
                  <select
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(e.target.value)}
                    className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min (1 hr)</option>
                    <option value="90">90 min (1.5 hr)</option>
                    <option value="120">120 min (2 hr)</option>
                    <option value="180">180 min (3 hr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[11px]">
                    Friction / XP Tier
                  </label>
                  <select
                    value={newEventTier}
                    onChange={(e) => setNewEventTier(e.target.value)}
                    className="w-full bg-[#181924] border border-[#232636] rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="1">Tier 1: Micro (+100 XP)</option>
                    <option value="2">Tier 2: Routine (+300 XP)</option>
                    <option value="3">Tier 3: Labor (+750 XP)</option>
                    <option value="4">Tier 4: Boss (+1,500 XP)</option>
                    <option value="5">Tier 5: Legendary (+3,500 XP)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#232636]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider transition"
                >
                  Schedule Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
