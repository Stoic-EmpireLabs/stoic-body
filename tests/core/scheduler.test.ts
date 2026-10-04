import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeSchedule, type ScheduleInput, type PlanningTask } from '../../src/core/scheduler';
const at = (hour: number, minute = 0) => `2026-10-05T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
const task = (id: string, patch: Partial<PlanningTask> = {}): PlanningTask => ({
    id, revision: 1, priority: 1, durationMinutes: 30, prepMinutes: 0, travelMinutes: 0,
    bufferMinutes: 0, dependencies: [], ...patch,
});
const input = (patch: Partial<ScheduleInput> = {}): ScheduleInput => ({
    horizonStart: at(8), horizonEnd: at(18), timezone: 'America/Denver', policyVersion: 1,
    availability: [{ startAt: at(9), endAt: at(12) }], reserved: [], tasks: [],
    completedDependencyIds: [], ...patch,
});
test('adjacent sessions fit and proposal generation does not mutate input', () => {
    const source = input({ tasks: [task('a'), task('b')], availability: [{ startAt: at(9), endAt: at(10) }] });
    const before = structuredClone(source);
    const p = proposeSchedule(source);
    assert.deepEqual(p.placements.map(x => [x.startAt, x.endAt]), [[at(9), at(9, 30)], [at(9, 30), at(10)]]);
    assert.deepEqual(source, before);
    assert.equal(p.unplaced.length, 0);
});
test('preparation, travel and buffers consume capacity and unsplittable work stays whole', () => {
    const p = proposeSchedule(input({ availability: [{ startAt: at(9), endAt: at(10) }],
        tasks: [task('workout', { durationMinutes: 45, prepMinutes: 10, bufferMinutes: 10 })] }));
    assert.equal(p.placements.length, 0);
    assert.equal(p.unplaced[0].requiredMinutes, 65);
    assert.equal(p.unplaced[0].largestGapMinutes, 60);
    assert.ok(p.unplaced[0].alternatives.includes('Revise the deadline'));
    const q = proposeSchedule(input({ tasks: [task('visit', { prepMinutes: 5, travelMinutes: 10, bufferMinutes: 5 })] }));
    assert.deepEqual([q.placements[0].occupiedStartAt, q.placements[0].startAt, q.placements[0].endAt, q.placements[0].occupiedEndAt], [at(9), at(9, 15), at(9, 45), at(9, 50)]);
});
test('sleep, locked appointments and family time are protected and existing overlap is disclosed', () => {
    const reserved: ScheduleInput['reserved'] = [
        { id: 'sleep', startAt: at(8), endAt: at(9, 30), revision: 1, kind: 'sleep' },
        { id: 'meeting', startAt: at(9), endAt: at(10), revision: 2, kind: 'locked' },
        { id: 'family', startAt: at(10, 30), endAt: at(12), revision: 3, kind: 'family' },
    ];
    const p = proposeSchedule(input({ reserved, tasks: [task('a'), task('b')] }));
    assert.deepEqual(p.violations[0].entityIds, ['sleep', 'meeting']);
    assert.equal(p.placements[0].startAt, at(10));
    assert.equal(p.unplaced[0].taskId, 'b');
    assert.equal(p.baseRevisions.reserved.meeting, 2);
    assert.deepEqual(p.baseRevisions.tasks, { a: 1, b: 1 });
});
test('dependencies precede dependents while priority, deadline and stable id break ties', () => {
    const p = proposeSchedule(input({ tasks: [task('z'), task('b', { deadlineAt: at(10, 30) }), task('a'),
            task('final', { priority: 5, dependencies: ['setup'] }), task('setup', { priority: 4 })] }));
    assert.deepEqual(p.placements.map(x => x.taskId), ['setup', 'final', 'b', 'a', 'z']);
    assert.equal(p.placements[1].startAt, p.placements[0].occupiedEndAt);
});
test('invalid and cyclic dependencies fail explicitly', () => {
    assert.throws(() => proposeSchedule(input({ tasks: [task('a', { dependencies: ['missing'] })] })), /dependency/i);
    assert.throws(() => proposeSchedule(input({ tasks: [task('a', { dependencies: ['b'] }), task('b', { dependencies: ['a'] })] })), /cycle/i);
    assert.equal(proposeSchedule(input({ tasks: [task('a', { dependencies: ['finished'] })], completedDependencyIds: ['finished'] })).placements.length, 1);
});
test('infeasible deadlines and unplaced dependencies never spill into another day', () => {
    const p = proposeSchedule(input({ tasks: [task('a', { durationMinutes: 90, deadlineAt: at(10) }), task('b', { dependencies: ['a'] })] }));
    assert.equal(p.placements.length, 0);
    assert.equal(p.unplaced[0].reason, 'insufficient-capacity');
    assert.equal(p.unplaced[1].reason, 'dependency-unplaced');
});
test('overlapping availability is merged, not counted twice', () => {
    const p = proposeSchedule(input({ availability: [{ startAt: at(9), endAt: at(10) }, { startAt: at(9, 30), endAt: at(10, 30) }],
        tasks: [task('a', { durationMinutes: 90 }), task('b')] }));
    assert.equal(p.placements.length, 1);
    assert.equal(p.placements[0].endAt, at(10, 30));
    assert.equal(p.unplaced.length, 1);
});
test('explicit instants support cross-midnight sessions without truncation', () => {
    const start = '2026-10-05T23:30:00.000Z', end = '2026-10-06T00:30:00.000Z';
    const p = proposeSchedule(input({ horizonStart: start, horizonEnd: end,
        availability: [{ startAt: start, endAt: end }], tasks: [task('a', { durationMinutes: 60 })] }));
    assert.equal(p.placements[0].endAt, end);
});
test('unknown zones, nonfinite durations and excessive horizons cannot silently schedule', () => {
    assert.throws(() => proposeSchedule(input({ timezone: 'Unknown/Place' })), /timezone/i);
    assert.throws(() => proposeSchedule(input({ tasks: [task('a', { durationMinutes: NaN })] })), /duration/i);
    assert.throws(() => proposeSchedule(input({ horizonEnd: '2026-11-05T18:00:00.000Z' })), /horizon/i);
});
