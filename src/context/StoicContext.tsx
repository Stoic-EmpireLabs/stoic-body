"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateLevelProgress, LevelInfo } from "@/lib/gamification";

interface Transaction {
  id: string;
  label: string;
  amount: number;
  attribute?: string;
  isReversed?: boolean;
  timestamp: string;
}

interface StoicContextType {
  totalXp: number;
  streakDays: number;
  calmMode: boolean;
  levelInfo: LevelInfo;
  transactions: Transaction[];
  toggleCalmMode: () => void;
  awardXp: (amount: number, label: string, attribute?: string) => void;
  reverseXp: (amount: number, label: string) => void;
  playAnvilChime: () => void;
  playBellSound: () => void;
  isFounderMode: boolean;
}

const StoicContext = createContext<StoicContextType | undefined>(undefined);

export function StoicProvider({ children }: { children: React.ReactNode }) {
  const [totalXp, setTotalXp] = useState<number>(26450);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [calmMode, setCalmMode] = useState<boolean>(false);
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
  const isFounderMode = true; // Permanent Founder Sovereign Mode

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedXp = localStorage.getItem("stoic_total_xp");
      if (savedXp) setTotalXp(Number(savedXp));
      const savedCalm = localStorage.getItem("stoic_calm_mode");
      if (savedCalm) setCalmMode(savedCalm === "true");
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

  return (
    <StoicContext.Provider
      value={{
        totalXp,
        streakDays,
        calmMode,
        levelInfo,
        transactions,
        toggleCalmMode,
        awardXp,
        reverseXp,
        playAnvilChime,
        playBellSound,
        isFounderMode,
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
