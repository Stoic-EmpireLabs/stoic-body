/** Rewards describe follow-through; they never measure health outcomes. */
export const BASE_XP = Object.freeze({ task: 5, focus: 15, workout: 25, recovery: 15, reflection: 10, weeklyReview: 30, protected: 0 });
export type ActionKind = keyof typeof BASE_XP;
function integer(value: number, min: number, max = Number.MAX_SAFE_INTEGER): void {
    if (!Number.isSafeInteger(value) || value < min || value > max)
        throw new RangeError('Expected a supported whole number.');
}
function threshold(level: bigint): bigint { const n = level - 1n; return 100n * n + 25n * n * (n - 1n) / 2n; }
export function thresholdForLevel(level: number): number {
    integer(level, 1);
    const value = threshold(BigInt(level));
    if (value > BigInt(Number.MAX_SAFE_INTEGER))
        throw new RangeError('Level threshold exceeds supported range.');
    return Number(value);
}
export function levelProgress(totalXp: number) {
    integer(totalXp, 0);
    const total = BigInt(totalXp);
    let low = 1n, high = total / 100n + 2n;
    while (low + 1n < high) {
        const mid = (low + high) / 2n;
        if (threshold(mid) <= total)
            low = mid;
        else
            high = mid;
    }
    const level = Number(low), xpWithinLevel = Number(total - threshold(low)), costToNextLevel = 100 + 25 * (level - 1);
    return { level, totalXp, xpWithinLevel, costToNextLevel, progressFraction: xpWithinLevel / costToNextLevel };
}
export function earnedXp(budget: number, fraction: number): number {
    integer(budget, 0, 150);
    if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1)
        throw new RangeError('Completion must be between zero and one.');
    return Math.floor(budget * fraction);
}
export function splitBudget(budget: number, count: number): number[] {
    integer(budget, 0, 150);
    integer(count, 1, 1000);
    const each = Math.floor(budget / count), extra = budget % count;
    return Array.from({ length: count }, (_, i) => each + (i < extra ? 1 : 0));
}
