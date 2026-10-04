import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository, type Command } from '../../src/core/repository';
const cmd = (type: string, payload = {}, baseRevision = 0, entityId = 'antigravity'): Command => ({ schemaVersion: 1, operationId: crypto.randomUUID(), deviceId: 'test', entityId, type, payload, baseRevision });
function setup() { const r = new CoreRepository(':memory:'); r.createOwner('one'); r.createOwner('two'); return r; }
test('learning enrollment is owned, revisioned and cannot generate XP', () => {
  const r = setup(); try {
    const enroll = cmd('learning.enroll'); r.apply('one', enroll); assert.equal(r.apply('one', enroll).status, 'duplicate');
    assert.equal(r.snapshot('one').learning.length, 1); assert.deepEqual(r.snapshot('two').learning, []);
    r.apply('one', cmd('learning.checkpoint', { checkpointId: 'scope', completed: true, notes: 'Built my first specification.' }, 1));
    assert.equal(r.snapshot('one').learning[0].checkpoints.scope.completed, true); assert.equal(r.snapshot('one').totalXp, 0);
    assert.equal(r.apply('one', cmd('learning.checkpoint', { checkpointId: 'scope', completed: false, notes: '' }, 1)).status, 'conflict');
    r.apply('one', cmd('learning.checkpoint', { checkpointId: 'scope', completed: false, notes: '' }, 2));
    assert.equal(r.snapshot('one').learning[0].checkpoints.scope.completed, false);
    assert.throws(() => r.apply('two', cmd('learning.checkpoint', { checkpointId: 'scope', completed: true, notes: '' }, 0)), /Enroll/);
    assert.throws(() => r.apply('one', cmd('learning.enroll', {}, 0, 'unknown-course')), /course/);
    assert.throws(() => r.apply('one', cmd('learning.checkpoint', { checkpointId: 'fake', completed: true, notes: '' }, 3)), /checkpoint/);
  } finally { r.close(); }
});
test('one practice task per checkpoint survives new operation IDs and rolls back atomically', () => {
  const r = setup(); try {
    r.apply('one', cmd('learning.enroll'));
    const p = { checkpointId: 'scope', minutes: 25, goalId: null }; const plan = cmd('learning.practice', p, 1);
    r.apply('one', plan); r.apply('one', plan); r.apply('one', cmd('learning.practice', p, 2));
    let s = r.snapshot('one'); assert.equal(s.tasks.length, 1); assert.equal(s.tasks[0].kind, 'focus'); assert.equal(s.tasks[0].budget, 15);
    assert.equal(s.learning[0].checkpoints.scope.taskId, s.tasks[0].id); assert.equal(s.totalXp, 0);
    assert.throws(() => r.apply('one', cmd('learning.practice', { ...p, checkpointId: 'build', minutes: 0 }, 2)), /number/);
    r.database.exec("CREATE TRIGGER fail_learning BEFORE UPDATE ON core_learning BEGIN SELECT RAISE(ABORT,'test rollback'); END;");
    assert.throws(() => r.apply('one', cmd('learning.practice', { ...p, checkpointId: 'build' }, 2)), /rollback/);
    s = r.snapshot('one'); assert.equal(s.tasks.length, 1); assert.equal(s.learning[0].checkpoints.build.taskId, null);
  } finally { r.close(); }
});
