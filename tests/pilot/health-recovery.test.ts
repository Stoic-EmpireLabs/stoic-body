import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium, type Page } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import type { Snapshot, Command } from '../../src/core/repository';
async function fixture(run: (page: Page, state: () => Promise<Snapshot>, command: (type: string, entityId: string, payload: unknown) => Promise<void>) => Promise<void>) {
  const pilot = await startPilot({ databasePath: ':memory:', port: 0 }), browser = await chromium.launch({ headless: true });
  const page = await browser.newPage(); page.setDefaultTimeout(3000);
  try {
    await page.goto(pilot.url); await page.getByText('Nothing scheduled yet.', { exact: true }).waitFor();
    const bootstrap = await (await page.request.get(`${pilot.url}/api/bootstrap`)).json(), headers = { 'X-Stoic-Token': bootstrap.token, Origin: pilot.url };
    const state = async (): Promise<Snapshot> => (await (await page.request.get(`${pilot.url}/api/snapshot`, { headers })).json()).snapshot;
    const command = async (type: string, entityId: string, payload: unknown) => {
      const data: Command = { schemaVersion: 1, operationId: crypto.randomUUID(), deviceId: 'test', type, entityId, payload, baseRevision: 0 };
      const r = await page.request.post(`${pilot.url}/api/command`, { headers, data }); assert.equal(r.status(), 200, await r.text());
    };
    await run(page, state, command);
  } finally { await browser.close(); await pilot.close(); }
}
test('latest logs sort by date and insertion order and older entries remain accessible', async () => fixture(async (page, _state, command) => {
  for (let i = 0; i < 21; i++) await command('health.save', `z${String(i).padStart(2, '0')}`, { kind: 'food', data: { date: '2026-10-03', title: `Earlier meal ${i}`, portion: '1 serving', source: 'estimate' } });
  await command('health.save', 'a-new', { kind: 'food', data: { date: '2026-10-04', title: 'Newest meal', portion: '1 serving', source: 'estimate' } });
  await page.reload(); await page.getByRole('button', { name: 'Health', exact: true }).click();
  await page.getByRole('heading', { name: 'Recent meals', exact: true }).waitFor();
  const list = page.getByRole('heading', { name: 'Recent meals', exact: true }).locator('..');
  assert.equal(await list.locator('article h3').first().textContent(), 'Newest meal');
  await page.getByRole('button', { name: 'Show more food entries' }).click();
  await page.getByRole('heading', { name: 'Earlier meal 0', exact: true }).waitFor();
  assert.equal(await list.locator('article').count(), 22);
}));
test('a delayed training response cannot revert changed suitability or permit stale saving', async () => fixture(async page => {
  await page.getByRole('button', { name: 'Health', exact: true }).click(); await page.getByRole('button', { name: 'Train', exact: true }).click();
  await page.getByLabel('I am 18 or older', { exact: true }).check(); await page.getByLabel('Relevant restrictions').selectOption('none');
  let release!: () => void, intercepted!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), arrived = new Promise<void>(resolve => { intercepted = resolve; });
  await page.route('**/api/training-preview', async route => { intercepted(); await gate; await route.continue(); });
  await page.getByRole('button', { name: 'Preview routine', exact: true }).click(); await arrived;
  await page.getByLabel('Relevant restrictions').selectOption('yes'); release();
  await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('#reload')?.disabled);
  assert.equal(await page.getByLabel('Relevant restrictions').inputValue(), 'yes');
  assert.equal(await page.getByRole('button', { name: 'Save routine to tasks', exact: true }).count(), 0);
}));
test('editing notes preserves heterogeneous workout set values', async () => fixture(async (page, state, command) => {
  await command('training.create', 'routine', { adult: true, restrictions: 'none', equipment: ['cables'], style: 'full-body', minutes: 30, preference: 'higher-reps' });
  const sets = [{ reps: 12, load: 20, unit: 'lb' }, { reps: 10, load: 10, unit: 'kg' }];
  await command('health.save', 'log', { kind: 'workout', data: { date: '2026-10-04', routineId: 'routine', exercise: 'Cable row', sets, duration: 6, effort: 6, pain: false, notes: 'Original' } });
  await page.reload(); await page.getByRole('button', { name: 'Health', exact: true }).click(); await page.getByRole('button', { name: 'Train', exact: true }).click();
  await page.getByRole('button', { name: 'Edit workout', exact: true }).click(); await page.getByLabel('Exercise notes').fill('Corrected note');
  await page.getByRole('button', { name: 'Save exercise log', exact: true }).click(); await page.getByText('Health entry saved.', { exact: true }).waitFor();
  const log = (await state()).health.find(r => r.id === 'log')!; assert.equal(log.data.notes, 'Corrected note'); assert.deepEqual(log.data.sets, sets);
}));
