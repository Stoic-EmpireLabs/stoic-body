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

const day = { date: '2026-10-05', timezone: 'America/Denver', startTime: '07:00', endTime: '11:00' };
test('schedule preview requires acceptance, acceptance replays once, and undo preserves the proposal history', () => {
  const r = setup(); try {
    task(r, 'a', { prepMinutes: 10, bufferMinutes: 10 }); task(r, 'b');
    const preview = r.proposeDay('alice', day);
    assert.equal(r.snapshot('alice').occurrences.length, 0);
    assert.equal(preview.proposal.placements.length, 2);
    const accept = cmd('schedule.accept', preview.proposalId, {}, 1);
    r.apply('alice', accept); r.apply('alice', accept);
    assert.equal(r.snapshot('alice').occurrences.length, 2);
    assert.equal(r.apply('alice', cmd('schedule.accept', preview.proposalId, {}, 1)).status, 'duplicate');
    r.apply('alice', cmd('schedule.undo', preview.proposalId, {}, 2));
    assert.equal(r.snapshot('alice').occurrences.length, 0);
    assert.equal(r.snapshot('alice').scheduleBatches[0].status, 'undone');
    assert.equal(r.snapshot('alice').totalXp, 0);
  } finally { r.close(); }
});

test('stale previews and undo after completion cannot silently change the calendar', () => {
  const r = setup(); try {
    task(r, 'a'); const stale = r.proposeDay('alice', day);
    task(r, 'b');
    assert.equal(r.apply('alice', cmd('schedule.accept', stale.proposalId, {}, 1)).status, 'conflict');
    assert.equal(r.snapshot('alice').occurrences.length, 0);
    const fresh = r.proposeDay('alice', day);
    r.apply('alice', cmd('schedule.accept', fresh.proposalId, {}, 1));
    const occurrence = r.snapshot('alice').occurrences[0];
    r.apply('alice', cmd('completion.set', occurrence.id, { fraction: .5 }, 1));
    assert.equal(r.apply('alice', cmd('schedule.undo', fresh.proposalId, {}, 2)).status, 'conflict');
    assert.equal(r.snapshot('alice').occurrences.length, 2);
  } finally { r.close(); }
});

test('manual sessions use occupied buffers, preserve locks and require a current revision to move', () => {
  const r = setup(); try {
    task(r, 'a', { bufferMinutes: 15 }); task(r, 'b');
    r.apply('alice', cmd('occurrence.create', 'first', { taskId: 'a', startAt: '2026-10-05T13:00:00.000Z', timezone: 'America/Denver', locked: true }));
    assert.throws(() => r.apply('alice', cmd('occurrence.create', 'overlap', { taskId: 'b', startAt: '2026-10-05T13:40:00.000Z', timezone: 'America/Denver', locked: false })), /overlap/i);
    assert.throws(() => r.apply('alice', cmd('occurrence.move', 'first', { startAt: '2026-10-05T15:00:00.000Z', timezone: 'America/Denver' }, 1)), /locked/i);
    r.apply('alice', cmd('occurrence.create', 'second', { taskId: 'b', startAt: '2026-10-05T13:45:00.000Z', timezone: 'America/Denver', locked: false }));
    r.apply('alice', cmd('occurrence.move', 'second', { startAt: '2026-10-05T14:30:00.000Z', timezone: 'America/Denver' }, 1));
    assert.equal(r.apply('alice', cmd('occurrence.move', 'second', { startAt: '2026-10-05T15:00:00.000Z', timezone: 'America/Denver' }, 1)).status, 'conflict');
  } finally { r.close(); }
});

test('late failure during proposal acceptance rolls back the entire batch and can be retried', () => {
  const r = setup(); try {
    task(r, 'a'); task(r, 'b'); const p = r.proposeDay('alice', day);
    r.database.exec("CREATE TRIGGER fail_second BEFORE INSERT ON core_occurrences WHEN NEW.task_id='b' BEGIN SELECT RAISE(ABORT,'simulated full disk'); END;");
    const accept = cmd('schedule.accept', p.proposalId, {}, 1);
    assert.throws(() => r.apply('alice', accept), /simulated/);
    assert.equal(r.snapshot('alice').occurrences.length, 0);
    r.database.exec('DROP TRIGGER fail_second');
    assert.equal(r.apply('alice', accept).status, 'accepted');
    assert.equal(r.snapshot('alice').occurrences.length, 2);
  } finally { r.close(); }
});

test('locking and unlocking sessions is revisioned and does not change completion or XP', () => {
  const r = setup(); try {
    task(r); r.apply('alice', cmd('occurrence.create', 's', { taskId: 'practice', startAt: '2026-10-05T13:00:00.000Z', timezone: 'America/Denver', locked: false }));
    r.apply('alice', cmd('occurrence.lock', 's', { locked: true }, 1));
    assert.equal(r.snapshot('alice').occurrences[0].locked, 1);
    assert.equal(r.apply('alice', cmd('occurrence.lock', 's', { locked: false }, 1)).status, 'conflict');
    r.apply('alice', cmd('occurrence.lock', 's', { locked: false }, 2));
    assert.equal(r.snapshot('alice').occurrences[0].locked, 0);
    assert.equal(r.snapshot('alice').totalXp, 0);
  } finally { r.close(); }
});
