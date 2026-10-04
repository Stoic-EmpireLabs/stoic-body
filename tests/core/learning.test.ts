import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository, type Command } from '../../src/core/repository';
import { courses } from '../../src/core/learning-content';
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
test('every requested AI concept can enter the shared schedule without awarding checkpoint XP', () => {
  const r = setup(); try {
    const course = courses.find(c => c.id === 'ai-roadmap')!;
    assert.deepEqual(course.checkpoints.map(c => c.id).sort(), ['ai','ml','dl','genai','llms','prompting','rag','multimodal','finetuning','safety','agentic'].sort());
    r.apply('one', cmd('learning.enroll', {}, 0, course.id));
    course.checkpoints.forEach((c, i) => r.apply('one', cmd('learning.practice', { checkpointId: c.id, minutes: c.minutes, goalId: null }, i + 1, course.id)));
    const s = r.snapshot('one'); assert.equal(s.tasks.length, 11); assert.equal(s.totalXp, 0);
    const proposal = r.proposeDay('one', { date: '2026-10-06', timezone: 'America/Denver', startTime: '09:00', endTime: '09:30' });
    assert.ok(proposal.proposal.placements.length <= 1); assert.ok(proposal.proposal.placements.length > 0);
    assert.equal(r.snapshot('one').occurrences.length, 0);
    for (const c of courses) for (const step of c.checkpoints) assert.equal(new URL(step.url).protocol, 'https:');
  } finally { r.close(); }
});
