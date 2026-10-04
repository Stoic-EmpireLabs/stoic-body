/** Local fixture journey. Uses synthetic records, no credentials and no network. */
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { CoreRepository, type Command } from '../src/core/repository';
import { proposeSchedule, type PlanningTask } from '../src/core/scheduler';
import { resolveWallTime } from '../src/core/time';
import { levelProgress } from '../src/core/xp';

const directory = mkdtempSync(join(tmpdir(), 'stoic-core-proof-'));
const file = join(directory, 'fixture.sqlite');
let repository = new CoreRepository(file);
let sequence = 0;
const command = (type: string, entityId: string, payload: unknown, baseRevision = 0): Command => ({
  schemaVersion: 1, deviceId: 'fixture-device', operationId: `fixture-op-${++sequence}`, type, entityId, payload, baseRevision,
});
const task = (id: string, patch: Partial<PlanningTask> = {}): PlanningTask => ({
  id, revision: 1, priority: 1, durationMinutes: 30, prepMinutes: 0, travelMinutes: 0,
  bufferMinutes: 0, dependencies: [], ...patch,
});

try {
  assert.equal(repository.ownerCount(), 0);
  repository.createOwner('fixture-owner');
  repository.apply('fixture-owner', command('profile.answer', 'profile', { questionId: 'units', state: 'unknown' }));
  repository.apply('fixture-owner', command('profile.answer', 'profile', { questionId: 'health', state: 'skipped' }, 1));
  repository.apply('fixture-owner', command('task.create', 'practice', { title: 'Movement practice', kind: 'workout', durationMinutes: 30 }));
  repository.apply('fixture-owner', command('occurrence.create', 'practice-today', {
    taskId: 'practice', startAt: '2026-10-05T13:00:00.000Z', timezone: 'America/Denver', locked: false,
  }));
  const balances = [repository.snapshot('fixture-owner').totalXp];
  const half = command('completion.set', 'practice-today', { fraction: .5 }, 1);
  for (let attempt = 0; attempt < 100; attempt++) repository.apply('fixture-owner', half);
  balances.push(repository.snapshot('fixture-owner').totalXp);
  const full = command('completion.set', 'practice-today', { fraction: 1 }, 2);
  repository.apply('fixture-owner', full);
  balances.push(repository.snapshot('fixture-owner').totalXp);
  repository.close();
  repository = new CoreRepository(file);
  assert.equal(repository.apply('fixture-owner', full).status, 'duplicate');
  const afterRestart = repository.snapshot('fixture-owner');
  assert.equal(afterRestart.answers.health.state, 'skipped');
  assert.equal(afterRestart.totalXp, 25);
  repository.apply('fixture-owner', command('completion.set', 'practice-today', { fraction: 0 }, 3));
  balances.push(repository.snapshot('fixture-owner').totalXp);
  assert.deepEqual(balances, [0, 12, 25, 0]);

  // Independent scheduling fixture. Proposal is not automatically applied to the repository.
  const proposal = proposeSchedule({
    horizonStart: '2026-10-05T13:00:00.000Z', horizonEnd: '2026-10-05T23:00:00.000Z',
    timezone: 'America/Denver', policyVersion: 1, completedDependencyIds: [],
    availability: [{ startAt: '2026-10-05T13:00:00.000Z', endAt: '2026-10-05T17:00:00.000Z' }],
    reserved: [{ id: 'protected-family', kind: 'family', revision: 1, startAt: '2026-10-05T15:00:00.000Z', endAt: '2026-10-05T16:00:00.000Z' }],
    tasks: [task('movement', { priority: 3, durationMinutes: 45, prepMinutes: 10, bufferMinutes: 10 }),
      task('study', { priority: 2, durationMinutes: 45, prepMinutes: 5, bufferMinutes: 10 }),
      task('home-task'), task('large-project', { durationMinutes: 120 })],
  });
  assert.equal(proposal.placements.length, 3);
  assert.equal(proposal.unplaced[0].taskId, 'large-project');
  console.log(JSON.stringify({
    recordedAt: new Date().toISOString(), runtime: process.version,
    status: 'EXECUTION-VERIFIED local foundation; synthetic fixture; not an integrated app or sync test',
    completion: { balances, repeatAttempts: 100, afterRestartXp: afterRestart.totalXp,
      afterCorrection: levelProgress(repository.snapshot('fixture-owner').totalXp), pendingCommands: repository.snapshot('fixture-owner').pending.length },
    proposal,
    dst: {
      spring: resolveWallTime('2026-03-08T02:30', 'America/Denver', { source: 'user' }),
      fall: resolveWallTime('2026-11-01T01:30', 'America/Denver', { source: 'user' }),
    },
  }, null, 2));
} finally {
  repository.close();
  const target = resolve(directory);
  assert.equal(dirname(target), resolve(tmpdir()));
  assert.ok(basename(target).startsWith('stoic-core-proof-'));
  rmSync(target, { recursive: true, force: true });
}
