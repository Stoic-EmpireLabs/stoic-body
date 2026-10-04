import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository, type Command } from '../../src/core/repository';

let serial = 0;
const cmd = (type: string, entityId: string, payload: unknown, baseRevision = 0): Command => ({
  schemaVersion: 1, operationId: `plan-${++serial}`, deviceId: 'test-device', type, entityId, payload, baseRevision,
});
const setup = () => { const r = new CoreRepository(':memory:'); r.createOwner('alice'); return r; };
const goal = (r: CoreRepository) => r.apply('alice', cmd('goal.create', 'learn', { title: 'Learn a skill', why: 'Build confidence' }));
const task = (r: CoreRepository, id = 'practice', patch = {}) => r.apply('alice', cmd('task.create', id, { title: 'Practice', kind: 'focus', durationMinutes: 30, ...patch }));

test('goals and linked tasks support revisioned edits and reversible archive', () => {
  const r = setup(); try {
    goal(r); task(r, 'practice', { goalId: 'learn', priority: 3 });
    assert.equal(r.snapshot('alice').tasks[0].goalId, 'learn');
    assert.equal(r.apply('alice', cmd('goal.update', 'learn', { title: 'Learn steadily', why: 'Grow' }, 1)).status, 'accepted');
    assert.equal(r.apply('alice', cmd('goal.update', 'learn', { title: 'Stale', why: 'Wrong' }, 1)).status, 'conflict');
    r.apply('alice', cmd('task.update', 'practice', { title: 'Practice daily', durationMinutes: 40 }, 1));
    assert.equal(r.snapshot('alice').tasks[0].durationMinutes, 40);
    r.apply('alice', cmd('task.archive', 'practice', { archived: true }, 2));
    assert.equal(r.snapshot('alice').tasks[0].archived, true);
    r.apply('alice', cmd('task.archive', 'practice', { archived: false }, 3));
    r.apply('alice', cmd('goal.archive', 'learn', { archived: true }, 2));
    assert.equal(r.snapshot('alice').goals[0].archived, true);
    assert.equal(r.snapshot('alice').tasks[0].archived, false);
  } finally { r.close(); }
});

test('goal links and prerequisites cannot cross owners, disappear or form cycles', () => {
  const r = setup(); try {
    goal(r); task(r, 'a'); task(r, 'b', { dependencies: ['a'] }); r.createOwner('bob');
    assert.throws(() => r.apply('bob', cmd('task.create', 'bad', { title: 'Bad', kind: 'task', durationMinutes: 10, goalId: 'learn' })), /goal/i);
    assert.throws(() => task(r, 'bad', { dependencies: ['missing'] }), /prerequisite/i);
    assert.throws(() => r.apply('alice', cmd('task.update', 'a', { dependencies: ['b'] }, 1)), /cycle/i);
    assert.deepEqual(r.snapshot('alice').tasks.find(t => t.id === 'a')?.dependencies, []);
  } finally { r.close(); }
});

test('editing scheduled timing is explicit and archived tasks retain completion history', () => {
  const r = setup(); try {
    task(r);
    r.apply('alice', cmd('occurrence.create', 'today', { taskId: 'practice', startAt: '2026-10-05T13:00:00.000Z', timezone: 'America/Denver', locked: false }));
    assert.throws(() => r.apply('alice', cmd('task.update', 'practice', { durationMinutes: 60 }, 1)), /scheduled/i);
    r.apply('alice', cmd('completion.set', 'today', { fraction: 1 }, 1));
    r.apply('alice', cmd('task.archive', 'practice', { archived: true }, 1));
    assert.equal(r.snapshot('alice').totalXp, 15);
    assert.equal(r.snapshot('alice').occurrences.length, 1);
    assert.throws(() => r.apply('alice', cmd('occurrence.create', 'next', { taskId: 'practice', startAt: '2026-10-06T13:00:00.000Z', timezone: 'America/Denver', locked: false })), /archived/i);
  } finally { r.close(); }
});
