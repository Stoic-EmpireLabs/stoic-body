export interface ScheduledTask {
  id: string;
  title: string;
  durationMinutes: number;
  priorityTier: number; // 1: Non-negotiable anchor, 2: Core campaign, 3: Makerspace/Home, 4: Leisure
  isCompleted?: boolean;
}

export function calculateBufferMinutes(durationMinutes: number): number {
  return Math.max(15, Math.round(0.2 * durationMinutes));
}

export interface ScheduleAudit {
  availableWakingMinutes: number;
  totalCommitmentMinutes: number;
  hasOverflow: boolean;
  overflowMinutes: number;
  suggestions: string[];
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function detectScheduleOverflow(
  tasks: ScheduledTask[],
  wakeTime: string = "05:30",
  bedTime: string = "22:00"
): ScheduleAudit {
  const wakeM = parseTimeToMinutes(wakeTime);
  const bedM = parseTimeToMinutes(bedTime);
  const availableWakingMinutes = bedM >= wakeM ? bedM - wakeM : 24 * 60 - wakeM + bedM;

  let totalCommitmentMinutes = 0;
  for (const task of tasks) {
    const buffer = calculateBufferMinutes(task.durationMinutes);
    totalCommitmentMinutes += task.durationMinutes + buffer;
  }

  const overflowMinutes = Math.max(0, totalCommitmentMinutes - availableWakingMinutes);
  const hasOverflow = overflowMinutes > 0;
  const suggestions: string[] = [];

  if (hasOverflow) {
    suggestions.push(
      `Schedule exceeds bedtime by ${overflowMinutes} minutes. Activate Minimum Viable Day (MVD) to contract physical sessions to 15 minutes.`
    );
    suggestions.push(
      `Compress Tier 2 deep-work blocks by 20% to absorb transitional delays.`
    );
    suggestions.push(
      `Slide Tier 3/4 home quests into the upcoming weekend project block.`
    );
  }

  return {
    availableWakingMinutes,
    totalCommitmentMinutes,
    hasOverflow,
    overflowMinutes,
    suggestions,
  };
}
