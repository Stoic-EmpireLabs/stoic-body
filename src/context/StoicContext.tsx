"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateLevelProgress, LevelInfo } from "@/lib/gamification";

export interface Transaction {
  id: string;
  label: string;
  amount: number;
  attribute?: string;
  isReversed?: boolean;
  timestamp: string;
}

export interface CustomTaskItem {
  id: string;
  title: string;
  durationMinutes: number;
  tier: number;
  completed: boolean;
  time?: string;
  attribute?: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  category: "Physical" | "Consulting" | "DBA" | "Recovery" | "Family";
  xpReward: number;
}

export interface LifeGoal {
  id: string;
  title: string;
  category: string;
  targetDate: string;
  milestones: string[];
  completed: boolean;
  xpReward: number;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time: string;
  durationMinutes: number;
  tier: number;
  completed?: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  currentWeight: number;
  targetWeight: number;
  height: string;
  diet: string;
  dailyProtein: number;
}

interface StoicContextType {
  totalXp: number;
  streakDays: number;
  calmMode: boolean;
  levelInfo: LevelInfo;
  transactions: Transaction[];
  dailyTasks: CustomTaskItem[];
  weeklyGoals: WeeklyGoal[];
  lifeGoals: LifeGoal[];
  calendarEvents: CalendarEvent[];
  userProfile: UserProfile;
  mvdActive: boolean;
  toggleMvd: () => void;
  toggleCalmMode: () => void;
  awardXp: (amount: number, label: string, attribute?: string) => void;
  reverseXp: (amount: number, label: string) => void;
  playAnvilChime: () => void;
  playBellSound: () => void;
  playBoxingBell: () => void;
  isFounderMode: boolean;
  addTask: (task: Omit<CustomTaskItem, "id" | "completed">) => void;
  toggleTask: (id: string) => void;
  addWeeklyGoal: (goal: Omit<WeeklyGoal, "id" | "currentCount">) => void;
  incrementWeeklyGoal: (id: string) => void;
  addLifeGoal: (goal: Omit<LifeGoal, "id" | "completed">) => void;
  toggleLifeGoal: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => { success: boolean; error?: string };
}

const StoicContext = createContext<StoicContextType | undefined>(undefined);

export function StoicProvider({ children }: { children: React.ReactNode }) {
  const [totalXp, setTotalXp] = useState<number>(26450);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [calmMode, setCalmMode] = useState<boolean>(false);
  const [mvdActive, setMvdActive] = useState<boolean>(false);
  const isFounderMode = true; // Permanent Founder Sovereign Mode

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Stoic",
    age: 33,
    currentWeight: 170.0,
    targetWeight: 155.0,
    height: "5'10\"",
    diet: "23:1 OMAD",
    dailyProtein: 140,
  });

  const [dailyTasks, setDailyTasks] = useState<CustomTaskItem[]>([
    {
      id: "task-1",
      title: "Morning 24oz Filtered Water + Electrolytes (Sodium, Potassium, Magnesium)",
      durationMinutes: 10,
      tier: 1,
      completed: true,
      time: "05:30",
      attribute: "Recovery",
    },
    {
      id: "task-2",
      title: "Dumbbell-Free Calisthenics: Push-ups, Strict Chin-ups & Hollow Hold",
      durationMinutes: 25,
      tier: 2,
      completed: true,
      time: "05:45",
      attribute: "Physical",
    },
    {
      id: "task-3",
      title: "12% Incline Treadmill Walk at 3.0 MPH (Zone 2 Heart Rate)",
      durationMinutes: 30,
      tier: 2,
      completed: false,
      time: "06:15",
      attribute: "Physical",
    },
    {
      id: "task-4",
      title: "Stoic Business Consulting: High-Margin Fiverr AI Automation Retainers",
      durationMinutes: 120,
      tier: 3,
      completed: false,
      time: "09:00",
      attribute: "Dominion",
    },
    {
      id: "task-5",
      title: "Doctoral DBA Research: Literature Gap Analysis & Resubmission",
      durationMinutes: 90,
      tier: 3,
      completed: false,
      time: "14:00",
      attribute: "Intellect",
    },
    {
      id: "task-6",
      title: "Ultron Private LLM: Quantized GPU Offload & Skill Vector Embeddings",
      durationMinutes: 60,
      tier: 3,
      completed: false,
      time: "16:00",
      attribute: "Intellect",
    },
  ]);

  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([
    {
      id: "wg-1",
      title: "Complete 5 Dumbbell-Free Calisthenics Sessions",
      targetCount: 5,
      currentCount: 3,
      category: "Physical",
      xpReward: 1200,
    },
    {
      id: "wg-2",
      title: "Daily Morning Hydration & Electrolytes (7/7 Days)",
      targetCount: 7,
      currentCount: 5,
      category: "Recovery",
      xpReward: 700,
    },
    {
      id: "wg-3",
      title: "Execute 15 Boxing Interval Rounds (3m Work / 1m Rest)",
      targetCount: 15,
      currentCount: 8,
      category: "Physical",
      xpReward: 1500,
    },
    {
      id: "wg-4",
      title: "Pitch 5 Local Commercial Businesses for AI Consulting in Town",
      targetCount: 5,
      currentCount: 2,
      category: "Consulting",
      xpReward: 2500,
    },
    {
      id: "wg-5",
      title: "Resubmit 2 Doctoral DBA Research Assignments for Higher Grades",
      targetCount: 2,
      currentCount: 1,
      category: "DBA",
      xpReward: 2000,
    },
    {
      id: "wg-6",
      title: "Weekend Dedicated Family Sanctuary Time (Cheer Stunting Outing)",
      targetCount: 2,
      currentCount: 1,
      category: "Family",
      xpReward: 1000,
    },
  ]);

  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([
    {
      id: "lg-1",
      title: "Reach 155 lbs Baseline with Visible Abs via 23:1 OMAD",
      category: "Physical",
      targetDate: "2026-12-15",
      milestones: ["170 -> 165 lbs (Phase 1)", "165 -> 160 lbs (Phase 2)", "160 -> 155 lbs (Visible Abs)"],
      completed: false,
      xpReward: 5000,
    },
    {
      id: "lg-2",
      title: "Scale Stoic Business Consulting Firm to $15,000/mo Retainers",
      category: "Consulting",
      targetDate: "2027-01-31",
      milestones: ["3 High-Converting Fiverr Gigs", "First 3 Local Town SMB Retainers", "$10k MRR Milestone"],
      completed: false,
      xpReward: 7500,
    },
    {
      id: "lg-3",
      title: "Defend Doctoral DBA Dissertation with Distinction",
      category: "DBA",
      targetDate: "2027-06-01",
      milestones: ["Resubmit All Historical Assignments for A-grades", "Quantitative Methodology Synthesis", "Final Defense Presentation"],
      completed: false,
      xpReward: 10000,
    },
    {
      id: "lg-4",
      title: "Master Father & Daughter Cheerleading Flyer Stunting",
      category: "Family",
      targetDate: "2026-11-20",
      milestones: ["Hollow Body Balance", "Thigh Stand Lockout", "Elevator Extension & Cradle Catch"],
      completed: false,
      xpReward: 3500,
    },
  ]);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: "ce-1", date: "2026-10-04", title: "Morning Anchor (Water, Calisthenics, Incline Walk)", time: "05:30", durationMinutes: 65, tier: 1, completed: true },
    { id: "ce-2", date: "2026-10-04", title: "Stoic Consulting Client Acquisition & Outreach", time: "09:00", durationMinutes: 120, tier: 3, completed: false },
    { id: "ce-3", date: "2026-10-04", title: "2015 Ford Mustang V6 3.7L Oil Change Execution", time: "14:00", durationMinutes: 60, tier: 4, completed: false },
    { id: "ce-4", date: "2026-10-04", title: "23:1 OMAD Feeding Window (140g Protein)", time: "18:00", durationMinutes: 60, tier: 1, completed: false },
    { id: "ce-5", date: "2026-10-05", title: "Doctoral DBA Research Resubmission Prep", time: "08:30", durationMinutes: 90, tier: 3, completed: false },
    { id: "ce-6", date: "2026-10-05", title: "Home Boxing 5 Rounds & Shadow Mechanics", time: "16:00", durationMinutes: 30, tier: 2, completed: false },
    { id: "ce-7", date: "2026-10-06", title: "Local Town SMB In-Person Executive AI Pitches", time: "10:00", durationMinutes: 120, tier: 4, completed: false },
    { id: "ce-8", date: "2026-10-07", title: "Ultron Private LLM Embeddings Indexing", time: "13:00", durationMinutes: 60, tier: 3, completed: false },
    { id: "ce-9", date: "2026-10-10", title: "Weekend Family Sanctuary & Cheer Flyer Park Practice", time: "10:00", durationMinutes: 180, tier: 4, completed: false },
    { id: "ce-10", date: "2026-10-11", title: "King Bed Frame Structural Completion & Leveling", time: "13:00", durationMinutes: 120, tier: 3, completed: false },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      label: "Morning Calisthenics Core & Boxing",
      amount: 750,
      attribute: "Strength",
      timestamp: "Today 06:15 AM",
    },
    {
      id: "tx-2",
      label: "Hydrate: 24oz Water + Electrolytes",
      amount: 100,
      attribute: "Recovery",
      timestamp: "Today 05:35 AM",
    },
    {
      id: "tx-3",
      label: "14-Day Consistency Multiplier (1.25x)",
      amount: 125,
      attribute: "Discipline",
      timestamp: "Today 05:30 AM",
    },
  ]);

  const levelInfo = calculateLevelProgress(totalXp);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedXp = localStorage.getItem("stoic_total_xp");
      if (savedXp) setTotalXp(Number(savedXp));
      const savedCalm = localStorage.getItem("stoic_calm_mode");
      if (savedCalm) setCalmMode(savedCalm === "true");
      const savedMvd = localStorage.getItem("stoic_mvd_mode");
      if (savedMvd) setMvdActive(savedMvd === "true");

      const savedTasks = localStorage.getItem("stoic_daily_tasks");
      if (savedTasks) try { setDailyTasks(JSON.parse(savedTasks)); } catch (e) {}
      const savedWg = localStorage.getItem("stoic_weekly_goals");
      if (savedWg) try { setWeeklyGoals(JSON.parse(savedWg)); } catch (e) {}
      const savedLg = localStorage.getItem("stoic_life_goals");
      if (savedLg) try { setLifeGoals(JSON.parse(savedLg)); } catch (e) {}
      const savedCe = localStorage.getItem("stoic_calendar_events");
      if (savedCe) try { setCalendarEvents(JSON.parse(savedCe)); } catch (e) {}
      const savedProf = localStorage.getItem("stoic_user_profile");
      if (savedProf) try { setUserProfile(JSON.parse(savedProf)); } catch (e) {}
      const savedTx = localStorage.getItem("stoic_transactions");
      if (savedTx) try { setTransactions(JSON.parse(savedTx)); } catch (e) {}
    }
  }, []);

  const playAnvilChime = () => {
    if (calmMode || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const playBellSound = () => {
    if (calmMode || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  const playBoxingBell = () => {
    if (calmMode || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      [0, 0.18].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + delay + 0.3);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.35);
      });
    } catch (e) {}
  };

  const toggleMvd = () => {
    setMvdActive((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_mvd_mode", String(next));
      }
      return next;
    });
  };

  const toggleCalmMode = () => {
    setCalmMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_calm_mode", String(next));
      }
      return next;
    });
  };

  const awardXp = (amount: number, label: string, attribute: string = "Discipline") => {
    setTotalXp((prev) => {
      const next = prev + amount;
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_total_xp", String(next));
      }
      return next;
    });
    playAnvilChime();
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        label,
        amount,
        attribute,
        timestamp: "Just now",
      },
      ...prev,
    ]);
  };

  const reverseXp = (amount: number, label: string) => {
    setTotalXp((prev) => {
      const next = Math.max(0, prev - amount);
      if (typeof window !== "undefined") {
        localStorage.setItem("stoic_total_xp", String(next));
      }
      return next;
    });
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        label: `[REVERSED] ${label}`,
        amount: -amount,
        isReversed: true,
        timestamp: "Just now",
      },
      ...prev,
    ]);
  };

  // ADD TASK
  const addTask = (task: Omit<CustomTaskItem, "id" | "completed">) => {
    const newTask: CustomTaskItem = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setDailyTasks((prev) => [newTask, ...prev]);
    awardXp(100, `Task Created: ${task.title}`, "Discipline");
  };

  // TOGGLE TASK
  const toggleTask = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nowCompleted = !t.completed;
        const xpMap: Record<number, number> = { 1: 100, 2: 300, 3: 750, 4: 1500, 5: 3500 };
        const xp = xpMap[t.tier] || 250;
        if (nowCompleted) {
          awardXp(xp, `Completed: ${t.title}`, t.attribute || "Discipline");
        } else {
          reverseXp(xp, `Unchecked: ${t.title}`);
        }
        return { ...t, completed: nowCompleted };
      })
    );
  };

  // ADD WEEKLY GOAL
  const addWeeklyGoal = (goal: Omit<WeeklyGoal, "id" | "currentCount">) => {
    const newGoal: WeeklyGoal = {
      ...goal,
      id: `wg-${Date.now()}`,
      currentCount: 0,
    };
    setWeeklyGoals((prev) => [newGoal, ...prev]);
    awardXp(200, `Weekly Target Declared: ${goal.title}`, "Dominion");
  };

  // INCREMENT WEEKLY GOAL
  const incrementWeeklyGoal = (id: string) => {
    setWeeklyGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nextCount = Math.min(g.targetCount, g.currentCount + 1);
        const reachedTarget = nextCount === g.targetCount && g.currentCount < g.targetCount;
        if (reachedTarget) {
          awardXp(g.xpReward, `🏆 Weekly Target Conquered: ${g.title}`, "Dominion");
          playBellSound();
        } else {
          awardXp(100, `Weekly Goal Progress (+1): ${g.title}`, "Discipline");
        }
        return { ...g, currentCount: nextCount };
      })
    );
  };

  // ADD LIFE GOAL
  const addLifeGoal = (goal: Omit<LifeGoal, "id" | "completed">) => {
    const newLifeGoal: LifeGoal = {
      ...goal,
      id: `lg-${Date.now()}`,
      completed: false,
    };
    setLifeGoals((prev) => [newLifeGoal, ...prev]);
    awardXp(500, `Strategic Milestone Initialized: ${goal.title}`, "Dominion");
  };

  // TOGGLE LIFE GOAL
  const toggleLifeGoal = (id: string) => {
    setLifeGoals((prev) =>
      prev.map((lg) => {
        if (lg.id !== id) return lg;
        const nowCompleted = !lg.completed;
        if (nowCompleted) {
          awardXp(lg.xpReward, `🌟 Strategic Milestone Conquered: ${lg.title}`, "Dominion");
          playBellSound();
        } else {
          reverseXp(lg.xpReward, `Milestone Reopened: ${lg.title}`);
        }
        return { ...lg, completed: nowCompleted };
      })
    );
  };

  // ADD CALENDAR EVENT
  const addCalendarEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `ce-${Date.now()}`,
      completed: false,
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    awardXp(150, `Scheduled Event on ${event.date}: ${event.title}`, "Discipline");
  };

  // UPDATE PROFILE
  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    awardXp(100, "Biometrics & Profile Baseline Updated", "Discipline");
  };

  // EXPORT BACKUP
  const exportBackup = () => {
    const backupData = {
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      founderId: "founder",
      totalXp,
      streakDays,
      userProfile,
      dailyTasks,
      weeklyGoals,
      lifeGoals,
      calendarEvents,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stoic-body-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    awardXp(100, "Full System Backup Exported", "Knowledge");
  };

  // IMPORT BACKUP
  const importBackup = (jsonData: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== "object") return { success: false, error: "Invalid backup format" };
      if (typeof parsed.totalXp === "number") setTotalXp(parsed.totalXp);
      if (parsed.userProfile) setUserProfile(parsed.userProfile);
      if (parsed.dailyTasks) setDailyTasks(parsed.dailyTasks);
      if (parsed.weeklyGoals) setWeeklyGoals(parsed.weeklyGoals);
      if (parsed.lifeGoals) setLifeGoals(parsed.lifeGoals);
      if (parsed.calendarEvents) setCalendarEvents(parsed.calendarEvents);
      if (parsed.transactions) setTransactions(parsed.transactions);

      if (typeof window !== "undefined") {
        if (parsed.totalXp) localStorage.setItem("stoic_total_xp", String(parsed.totalXp));
        if (parsed.userProfile) localStorage.setItem("stoic_user_profile", JSON.stringify(parsed.userProfile));
        if (parsed.dailyTasks) localStorage.setItem("stoic_daily_tasks", JSON.stringify(parsed.dailyTasks));
        if (parsed.weeklyGoals) localStorage.setItem("stoic_weekly_goals", JSON.stringify(parsed.weeklyGoals));
        if (parsed.lifeGoals) localStorage.setItem("stoic_life_goals", JSON.stringify(parsed.lifeGoals));
        if (parsed.calendarEvents) localStorage.setItem("stoic_calendar_events", JSON.stringify(parsed.calendarEvents));
        if (parsed.transactions) localStorage.setItem("stoic_transactions", JSON.stringify(parsed.transactions));
      }
      playBellSound();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to parse JSON backup" };
    }
  };

  return (
    <StoicContext.Provider
      value={{
        totalXp,
        streakDays,
        calmMode,
        levelInfo,
        transactions,
        dailyTasks,
        weeklyGoals,
        lifeGoals,
        calendarEvents,
        userProfile,
        mvdActive,
        toggleMvd,
        toggleCalmMode,
        awardXp,
        reverseXp,
        playAnvilChime,
        playBellSound,
        playBoxingBell,
        isFounderMode,
        addTask,
        toggleTask,
        addWeeklyGoal,
        incrementWeeklyGoal,
        addLifeGoal,
        toggleLifeGoal,
        addCalendarEvent,
        updateProfile,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </StoicContext.Provider>
  );
}

export function useStoic() {
  const context = useContext(StoicContext);
  if (!context) {
    throw new Error("useStoic must be used within a StoicProvider");
  }
  return context;
}
