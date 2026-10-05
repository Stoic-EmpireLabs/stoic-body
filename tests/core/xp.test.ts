import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_XP, thresholdForLevel, levelProgress, earnedXp, splitBudget } from '../../src/core/xp';
test('approved actions use sustainable fixed rewards', () => {
    assert.deepEqual(BASE_XP, { task: 5, focus: 15, workout: 25, recovery: 15, reflection: 10, weeklyReview: 30, protected: 0 });
});
test('level boundaries match the approved increasing costs', () => {
    assert.deepEqual([1, 2, 3, 4].map(thresholdForLevel), [0, 100, 225, 375]);
    for (const [xp, level, within, cost] of [[0, 1, 0, 100], [99, 1, 99, 100], [100, 2, 0, 125], [224, 2, 124, 125], [225, 3, 0, 150], [375, 4, 0, 175]]) {
        const p = levelProgress(xp);
        assert.equal(p.level, level);
        assert.equal(p.xpWithinLevel, within);
        assert.equal(p.costToNextLevel, cost);
    }
});
test('partial completion and correction never inflate the original budget', () => {
    const totals = [0, .5, 1, 0].map(f => earnedXp(25, f));
    assert.deepEqual(totals, [0, 12, 25, 0]);
    assert.deepEqual(totals.map((n, i) => n - (totals[i - 1] || 0)), [0, 12, 13, -25]);
});
test('splitting reserves a single parent budget including remainders', () => {
    assert.deepEqual(splitBudget(25, 3), [9, 8, 8]);
    assert.deepEqual(splitBudget(5, 8), [1, 1, 1, 1, 1, 0, 0, 0]);
    for (let n = 1; n <= 100; n++)
        assert.equal(splitBudget(150, n).reduce((a, b) => a + b, 0), 150);
});
test('invalid numbers are rejected rather than silently granting rewards', () => {
    for (const x of [-1, NaN, Infinity, 1.5])
        assert.throws(() => levelProgress(x));
    for (const x of [-.1, 1.1, NaN, Infinity])
        assert.throws(() => earnedXp(25, x));
    for (const x of [0, -1, 1.1, NaN])
        assert.throws(() => thresholdForLevel(x));
    assert.throws(() => earnedXp(1000, 1));
    assert.throws(() => splitBudget(25, 0));
});
test('large safe totals retain exact integer boundaries', () => {
    const n = 1000000, t = thresholdForLevel(n);
    assert.equal(levelProgress(t).level, n);
    assert.equal(levelProgress(t - 1).level, n - 1);
});
