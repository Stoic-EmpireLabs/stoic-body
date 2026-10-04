import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository, type Command } from '../../src/core/repository';
import { summarizeHealth } from '../../src/core/health-metrics';
import { diets } from '../../src/core/health-content';
const command = (entityId: string, kind: string, data: unknown, baseRevision = 0): Command => ({ schemaVersion: 1, deviceId: 'test', operationId: crypto.randomUUID(), entityId, baseRevision, type: 'health.save', payload: { kind, data } });
const food = { date: '2026-10-04', title: 'Meal', portion: '1 plate', source: 'estimate', calories: null, protein: 20, carbs: null, fat: null, fiber: null, notes: '' };
function fixture(run: (r: CoreRepository) => void) { const r = new CoreRepository(':memory:'); r.createOwner('one'); r.createOwner('two'); try { run(r); } finally { r.close(); } }

test('health data uses replay, revision, owner boundaries and no XP', () => fixture(r => {
  const c = command('meal', 'food', food); r.apply('one', c); r.apply('one', c);
  assert.equal(r.snapshot('one').health.length, 1); assert.equal(r.snapshot('two').health.length, 0);
  assert.equal(r.apply('one', command('meal', 'food', { ...food, title: 'Edited' }, 1)).status, 'accepted');
  assert.equal(r.apply('one', command('meal', 'food', food, 1)).status, 'conflict');
  assert.equal(r.snapshot('one').health[0].data.title, 'Edited');
  assert.equal(r.snapshot('one').totalXp, 0);
}));
test('unknown nutrients remain unknown while known values and water are summed', () => fixture(r => {
  r.apply('one', command('a', 'food', food)); r.apply('one', command('b', 'food', { ...food, calories: 300, protein: 10 }));
  r.apply('one', command('w', 'water', { date: food.date, ml: 250, notes: '' }));
  const summary = summarizeHealth(r.snapshot('one').health, food.date, 'kg');
  assert.deepEqual(summary.nutrients.calories, { total: 300, known: 1, entries: 2 });
  assert.equal(summary.nutrients.protein.total, 30); assert.equal(summary.waterMl, 250);
}));
test('malformed dates, nonfinite/negative nutrients and mismatched units are rejected', () => fixture(r => {
  for (const data of [{ ...food, date: '2026-02-30' }, { ...food, calories: -1 }, { ...food, calories: '' }, { ...food, protein: Infinity }]) assert.throws(() => r.apply('one', command('bad', 'food', data)));
  assert.throws(() => r.apply('one', command('bad', 'measurement', { date: food.date, metric: 'weight', value: 70, unit: 'cm', method: 'scale', notes: '' })));
  assert.throws(() => r.apply('one', command('bad', 'routine', {})));
  assert.equal(r.snapshot('one').health.length, 0);
}));
test('archiving health entries preserves revision history and excludes totals', () => fixture(r => {
  r.apply('one', command('meal', 'food', food));
  r.apply('one', { ...command('meal', 'food', food, 1), type: 'health.archive', payload: { archived: true } });
  assert.equal(r.snapshot('one').health[0].archived, true);
  assert.equal(summarizeHealth(r.snapshot('one').health, food.date, 'kg').nutrients.protein.entries, 0);
}));
test('health writes roll back if their outbox cannot be recorded', () => fixture(r => {
  r.database.exec("CREATE TRIGGER fail_health BEFORE INSERT ON core_outbox BEGIN SELECT RAISE(ABORT,'test failure'); END;");
  assert.throws(() => r.apply('one', command('meal', 'food', food)), /test failure/);
  assert.equal(r.snapshot('one').health.length, 0);
}));
test('weight trends normalize units and give each measured day equal weight without fabricating days', () => fixture(r => {
  for (const [id, date, value, unit] of [['a', '2026-10-01', 70, 'kg'], ['b', '2026-10-01', 70 / .45359237, 'lb'], ['c', '2026-10-02', 71, 'kg'], ['d', '2026-10-03', 72, 'kg']] as const) r.apply('one', command(id, 'measurement', { date, metric: 'weight', value, unit, method: 'scale', notes: '' }));
  const summary = summarizeHealth(r.snapshot('one').health, '2026-10-04', 'kg');
  assert.equal(summary.weight.days, 3); assert.equal(summary.weight.mean, 71);
  assert.equal(summary.weight.change, null); assert.equal(summary.weight.points.length, 3);
}));
test('diet catalog covers all requested approaches and retains source/evidence limits', () => {
  assert.equal(diets.length, 14); assert.equal(new Set(diets.map(d => d.id)).size, 14);
  for (const d of diets) { assert.ok(d.sources.length); assert.ok(d.evidence && d.risks && d.practical && d.training && d.adequacy && d.guidance); assert.equal(d.reviewed, '2026-10-04'); }
  assert.equal(diets.find(d => d.id === 'omad')?.recommendation, 'education');
  assert.equal(diets.find(d => d.id === 'clear-liquid')?.recommendation, 'clinician');
});
