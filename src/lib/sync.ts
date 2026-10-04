import crypto from "node:crypto";

export interface ScheduledTaskInput {
  id: string;
  title: string;
  time?: string;
  durationMinutes: number;
  tier?: number;
  isAnchor?: boolean;
}

export interface ScheduleConflict {
  taskA: ScheduledTaskInput;
  taskB: ScheduledTaskInput;
  overlapMinutes: number;
}

export interface SyncPayload {
  syncId: string;
  deviceId: string;
  timestamp: string;
  totalXp: number;
  dataHash: string;
  payload: any;
}

/**
 * Calculates transition buffer: Bi = max(15m, 0.20 * duration)
 */
export function calculateBufferMinutes(durationMinutes: number): number {
  return Math.max(15, Math.round(0.2 * (durationMinutes || 0)));
}

/**
 * Parses "HH:MM" into minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Detects overlapping time intervals between scheduled tasks
 */
export function detectScheduleConflicts(tasks: ScheduledTaskInput[]): ScheduleConflict[] {
  const timedTasks = tasks.filter((t) => !!t.time);
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < timedTasks.length; i++) {
    const a = timedTasks[i];
    const startA = timeToMinutes(a.time!);
    const endA = startA + a.durationMinutes;

    for (let j = i + 1; j < timedTasks.length; j++) {
      const b = timedTasks[j];
      const startB = timeToMinutes(b.time!);
      const endB = startB + b.durationMinutes;

      // Overlap condition: startA < endB && startB < endA
      if (startA < endB && startB < endA) {
        const overlapStart = Math.max(startA, startB);
        const overlapEnd = Math.min(endA, endB);
        const overlapMinutes = overlapEnd - overlapStart;

        conflicts.push({
          taskA: a,
          taskB: b,
          overlapMinutes: Math.max(1, overlapMinutes),
        });
      }
    }
  }

  return conflicts;
}

/**
 * Minimum Viable Day (MVD) Filter:
 * In crisis, illness, or severe fatigue, reduce day to essential anchors without streak loss.
 */
export function filterMinimumViableDay(tasks: any[]): any[] {
  return tasks.filter((task) => {
    if (task.isAnchor) return true;
    if (task.tier === 1) return true;
    const lower = (task.title || "").toLowerCase();
    if (lower.includes("hydrate") || lower.includes("calisthenics") || lower.includes("omad")) {
      return true;
    }
    return false;
  });
}

/**
 * Generates cryptographic data hash for snapshot payload
 */
export function generateDataHash(data: any): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return crypto.createHash("sha256").update(str).digest("hex");
}

/**
 * Creates a versioned sync payload for cross-device synchronization
 */
export function generateSyncPayload(state: any, deviceId: string): SyncPayload {
  const timestamp = new Date().toISOString();
  const syncId = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const dataHash = generateDataHash(state);

  return {
    syncId,
    deviceId: deviceId || "founder-sovereign-node",
    timestamp,
    totalXp: state.totalXp ?? 0,
    dataHash,
    payload: state,
  };
}

/**
 * Validates integrity and schema of an incoming sync payload
 */
export function validateSyncPayload(payload: any): { valid: boolean; error?: string } {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Sync payload must be an object" };
  }
  if (!payload.syncId || !payload.syncId.startsWith("sync-")) {
    return { valid: false, error: "Invalid syncId format" };
  }
  if (!payload.deviceId) {
    return { valid: false, error: "Missing deviceId identifier" };
  }
  if (typeof payload.totalXp !== "number" || payload.totalXp < 0) {
    return { valid: false, error: "Invalid totalXp value" };
  }
  if (!payload.dataHash || payload.dataHash.length < 8) {
    return { valid: false, error: "Missing or invalid dataHash" };
  }
  return { valid: true };
}

/**
 * Reconciles two snapshots:
 * - Prioritizes the latest timestamp for task items
 * - Enforces monotonic totalXp (never decreases due to an older device state)
 */
export function reconcileSnapshots(local: any, remote: any): any {
  if (!local) return remote;
  if (!remote) return local;

  const localTime = new Date(local.updatedAt || 0).getTime();
  const remoteTime = new Date(remote.updatedAt || 0).getTime();

  const base = remoteTime >= localTime ? { ...remote } : { ...local };

  // Monotonic XP rule: take maximum earned XP to prevent progress loss
  base.totalXp = Math.max(local.totalXp || 0, remote.totalXp || 0);

  return base;
}
