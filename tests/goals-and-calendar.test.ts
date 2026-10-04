import test from "node:test";
import assert from "node:assert/strict";

interface WeeklyGoal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  category: string;
  xpReward: number;
}

interface CalendarDateEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time: string;
  durationMinutes: number;
  tier: number;
}

test("Stoic Body — Weekly Goals Progress & Increments", () => {
  const initialGoals: WeeklyGoal[] = [
    { id: "wg-1", title: "Complete 4 Calisthenics Sessions", targetCount: 4, currentCount: 2, category: "Physical", xpReward: 1000 },
    { id: "wg-2", title: "Drink 24oz Water + Electrolytes (7/7 Days)", targetCount: 7, currentCount: 5, category: "Recovery", xpReward: 700 },
    { id: "wg-3", title: "12 Boxing Rounds", targetCount: 12, currentCount: 6, category: "Physical", xpReward: 900 },
  ];

  // Helper function to increment goal
  function incrementGoal(goals: WeeklyGoal[], id: string): WeeklyGoal[] {
    return goals.map((g) => {
      if (g.id !== id) return g;
      const nextCount = Math.min(g.targetCount, g.currentCount + 1);
      return { ...g, currentCount: nextCount };
    });
  }

  const updated = incrementGoal(initialGoals, "wg-1");
  assert.equal(updated.find((g) => g.id === "wg-1")?.currentCount, 3);

  // Helper to add new goal
  function addWeeklyGoal(goals: WeeklyGoal[], newGoal: Omit<WeeklyGoal, "id" | "currentCount">): WeeklyGoal[] {
    const goal: WeeklyGoal = {
      ...newGoal,
      id: `wg-${Date.now()}`,
      currentCount: 0,
    };
    return [...goals, goal];
  }

  const withNew = addWeeklyGoal(updated, {
    title: "Pitch 5 Local Business Clients in Town",
    targetCount: 5,
    category: "Consulting",
    xpReward: 1500,
  });

  assert.equal(withNew.length, 4);
  assert.equal(withNew[3].title, "Pitch 5 Local Business Clients in Town");
  assert.equal(withNew[3].currentCount, 0);
});

test("Stoic Body — Calendar Event Scheduling Across Dates", () => {
  const events: CalendarDateEvent[] = [
    { id: "e-1", date: "2026-10-04", title: "Morning Anchor", time: "05:30", durationMinutes: 65, tier: 1 },
    { id: "e-2", date: "2026-10-04", title: "Mustang Oil Change", time: "14:00", durationMinutes: 60, tier: 3 },
    { id: "e-3", date: "2026-10-05", title: "Stoic Consulting Client Call", time: "10:00", durationMinutes: 45, tier: 2 },
  ];

  // Filter events for specific date
  const oct4Events = events.filter((e) => e.date === "2026-10-04");
  assert.equal(oct4Events.length, 2);

  const oct5Events = events.filter((e) => e.date === "2026-10-05");
  assert.equal(oct5Events.length, 1);

  // Add event for October 10 (Weekend Family Time)
  const newEvent: CalendarDateEvent = {
    id: "e-4",
    date: "2026-10-10",
    title: "Family Sanctuary Weekend (Cheer Stunting & Outing)",
    time: "09:00",
    durationMinutes: 180,
    tier: 4,
  };
  const updatedEvents = [...events, newEvent];
  assert.equal(updatedEvents.filter((e) => e.date === "2026-10-10").length, 1);
});
