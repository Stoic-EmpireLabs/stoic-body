import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository, type Command } from '../../src/core/repository';
import { buildRoutine, progressionAdvice } from '../../src/core/training';
const input = { adult: true, restrictions: 'none', equipment: ['cables'], style: 'full-body', minutes: 30, preference: 'higher-reps' };
const command = (payload: unknown): Command => ({ schemaVersion: 1, operationId: crypto.randomUUID(), deviceId: 'test', type: 'training.create', entityId: 'routine', baseRevision: 0, payload });
test('routine generation respects screening, equipment and time', () => {
  assert.equal(buildRoutine({ ...input, restrictions: 'unknown' }).eligible, false);
  assert.equal(buildRoutine({ ...input, adult: false }).eligible, false);
  assert.equal(buildRoutine({ ...input, style: 'walk', equipment: [] }).eligible, false);
  assert.equal(buildRoutine({ ...input, style: 'hiit' }).eligible, false);
  assert.throws(() => buildRoutine({ ...input, minutes: 3 }));
  const routine = buildRoutine(input);
  assert.equal(routine.eligible, true); assert.ok(routine.exercises.some(e => e.name === 'Cable row'));
  assert.ok(routine.exercises.every(e => !e.name.includes('Dumbbell')));
  assert.ok(routine.exercises.reduce((s, e) => s + e.minutes, 0) + 8 <= routine.minutes);
  assert.ok(routine.exercises.every(e => e.cue && e.alternative && e.prescription));
  assert.equal(buildRoutine({ ...input, style: 'boxing', equipment: [] }).exercises.some(e => e.name.includes('Bag')), false);
});
test('short full-body requests cannot silently omit all lower-body training', () => {
  const tooShort = buildRoutine({ ...input, minutes: 20 });
  assert.equal(tooShort.eligible, true);
  assert.ok(tooShort.exercises.some(e=>e.name==='Bodyweight squat'));
  assert.ok(tooShort.exercises.some(e=>e.name==='Cable row'));
  assert.ok(tooShort.exercises.every(e=>e.prescription.startsWith('1 set')));
  assert.ok(tooShort.exercises.reduce((n,e)=>n+e.minutes,8)<=20);
  const enough = buildRoutine({ ...input, minutes: 26 });
  assert.equal(enough.eligible, true); assert.ok(enough.exercises.some(e => e.name === 'Bodyweight squat'));
});
test('routine and matching task persist atomically and replay without duplication or XP', () => {
  const r = new CoreRepository(':memory:'); r.createOwner('one');
  try {
    const c = command(input); r.apply('one', c); r.apply('one', c);
    const s = r.snapshot('one'); assert.equal(s.tasks.length, 1); assert.equal(s.health.length, 1); assert.equal(s.tasks[0].budget, 25); assert.equal(s.health[0].id, s.tasks[0].id); assert.equal(s.totalXp, 0);
    const proposal = r.proposeDay('one', { date: '2026-10-05', timezone: 'America/Denver', startTime: '07:00', endTime: '08:00' });
    assert.equal(proposal.proposal.placements[0].taskId, 'routine');
    assert.throws(() => r.apply('one', { ...command({ ...input, restrictions: 'yes' }), entityId: 'blocked' }));
    r.database.exec("CREATE TRIGGER fail_routine BEFORE INSERT ON core_health BEGIN SELECT RAISE(ABORT,'test failure'); END;");
    assert.throws(() => r.apply('one', { ...command(input), entityId: 'rollback' }), /test failure/);
    assert.equal(r.snapshot('one').tasks.length, 1);
  } finally { r.close(); }
});
test('workout logs require an owned routine and real exercise, never award XP', () => {
  const r = new CoreRepository(':memory:'); r.createOwner('one'); r.createOwner('two');
  try {
    r.apply('one', command(input));
    const data = { date: '2026-10-05', routineId: 'routine', exercise: 'Cable row', sets: [{ reps: 12, load: 20, unit: 'lb' }], duration: 5, effort: 6, pain: false, notes: '' };
    const c = { ...command({ kind: 'workout', data }), type: 'health.save', entityId: 'log' };
    r.apply('one', c); assert.equal(r.snapshot('one').totalXp, 0);
    assert.throws(() => r.apply('two', c), /saved routine/);
    assert.throws(() => r.apply('one', { ...c, operationId: crypto.randomUUID(), entityId: 'bad', payload: { kind: 'workout', data: { ...data, exercise: 'Invented' } } }), /exercise/);
  } finally { r.close(); }
});
test('progression waits for separate comparable days and responds conservatively to discomfort', () => {
  const logs = ['2026-10-01', '2026-10-03', '2026-10-05'].map((date, i) => ({ id: String(i), kind: 'workout', revision: 1, archived: false, data: { date, routineId: 'r', exercise: 'Cable row', effort: 6, pain: false, sets: [{ reps: 12, load: 20, unit: 'lb' }] } }));
  assert.equal(progressionAdvice(logs.slice(0, 1), 'r', 'Cable row').action, 'hold');
  assert.equal(progressionAdvice(logs, 'r', 'Cable row').action, 'review');
  logs[2].data.pain = true;
  assert.equal(progressionAdvice(logs, 'r', 'Cable row').action, 'recover');
  logs[2].data.pain = false; logs[2].data.sets[0].load = 40;
  assert.equal(progressionAdvice(logs, 'r', 'Cable row').action, 'hold');
});
