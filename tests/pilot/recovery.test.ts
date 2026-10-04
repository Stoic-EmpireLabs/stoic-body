import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium, type Page } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import type { Snapshot, Command } from '../../src/core/repository';

async function fixture(run: (page: Page, state: () => Promise<Snapshot>, command: (type: Command['type'], entityId: string, payload: Command['payload'], baseRevision?: number) => Promise<void>) => Promise<void>) {
  const pilot = await startPilot({ databasePath: ':memory:', port: 0 });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ timezoneId: 'America/Denver' });
  page.setDefaultTimeout(4000);
  try {
    await page.goto(pilot.url);
    await page.getByText('Nothing scheduled yet.', { exact: true }).waitFor();
    const bootstrap = await (await page.request.get(`${pilot.url}/api/bootstrap`)).json();
    const headers = { 'X-Stoic-Token': bootstrap.token, Origin: pilot.url };
    const state = async (): Promise<Snapshot> => (await (await page.request.get(`${pilot.url}/api/snapshot`, { headers })).json()).snapshot;
    const command = async (type: Command['type'], entityId: string, payload: Command['payload'], baseRevision = 0) => {
      const response = await page.request.post(`${pilot.url}/api/command`, { headers, data: { schemaVersion: 1, operationId: crypto.randomUUID(), deviceId: 'recovery-test', type, entityId, payload, baseRevision } });
      assert.equal(response.status(), 200, await response.text());
    };
    await run(page, state, command);
  } finally { await browser.close(); await pilot.close(); }
}

async function save(page: Page, name: string) {
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().endsWith('/api/command')),
    page.getByRole('button', { name, exact: true }).click(),
  ]);
  await page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('#retry')?.disabled);
  return response.status();
}

test('a corrected rejected goal edit updates the original record', async () => fixture(async (page, state, command) => {
  await command('goal.create', 'goal-one', { title: 'Original goal', why: 'Purpose' });
  await page.reload(); await page.getByRole('button', { name: 'Goals', exact: true }).click();
  await page.getByRole('button', { name: 'Edit goal', exact: true }).click();
  await page.getByLabel('Goal title', { exact: true }).fill('Revised goal');
  await page.getByLabel('Why it matters').fill('   ');
  assert.equal(await save(page, 'Save goal'), 400);
  await page.getByLabel('Why it matters').fill('Corrected purpose');
  assert.equal(await save(page, 'Save goal'), 200);
  const data = await state();
  assert.equal(data.goals.length, 1);
  assert.equal(data.goals[0].id, 'goal-one');
  assert.equal(data.goals[0].title, 'Revised goal');
}));

test('a corrected rejected task edit updates the original record', async () => fixture(async (page, state, command) => {
  await command('task.create', 'task-one', { title: 'Original task', kind: 'task', durationMinutes: 30 });
  await page.reload(); await page.getByRole('button', { name: 'Goals', exact: true }).click();
  await page.getByRole('button', { name: 'Edit task', exact: true }).click();
  await page.getByLabel('Task title', { exact: true }).fill('   ');
  assert.equal(await save(page, 'Save task'), 400);
  await page.getByLabel('Task title', { exact: true }).fill('Revised task');
  assert.equal(await save(page, 'Save task'), 200);
  const data = await state();
  assert.equal(data.tasks.length, 1);
  assert.equal(data.tasks[0].id, 'task-one');
  assert.equal(data.tasks[0].title, 'Revised task');
}));

test('a rejected overlapping move keeps its identity when corrected', async () => fixture(async (page, state, command) => {
  await command('task.create', 'task-one', { title: 'Movable practice', kind: 'task', durationMinutes: 30 });
  await command('task.create', 'task-two', { title: 'Protected appointment', kind: 'task', durationMinutes: 30 });
  await command('occurrence.create', 'session-one', { taskId: 'task-one', startAt: '2026-10-05T13:00:00.000Z', timezone: 'America/Denver', locked: false });
  await command('occurrence.create', 'session-two', { taskId: 'task-two', startAt: '2026-10-05T15:00:00.000Z', timezone: 'America/Denver', locked: true });
  await page.reload(); await page.getByLabel('Selected date').fill('2026-10-05');
  await page.getByRole('button', { name: 'Move session', exact: true }).click();
  await page.getByLabel('Session date and time').fill('2026-10-05T09:00');
  await page.getByRole('button', { name: 'Preview session time', exact: true }).click();
  assert.equal(await save(page, 'Confirm session time'), 400);
  await page.getByLabel('Session date and time').fill('2026-10-05T10:00');
  await page.getByRole('button', { name: 'Preview session time', exact: true }).click();
  assert.equal(await save(page, 'Confirm session time'), 200);
  const data = await state();
  assert.equal(data.occurrences.length, 2);
  assert.equal(data.occurrences.find(o => o.id === 'session-one')?.startAt, '2026-10-05T16:00:00.000Z');
}));

test('a definitive conflict after an uncertain save releases the UI', async () => fixture(async (page, state, command) => {
  await command('task.create', 'task-one', { title: 'Practice', kind: 'task', durationMinutes: 30 });
  await page.reload(); await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Preview schedule', exact: true }).click();
  await page.getByRole('button', { name: 'Accept schedule', exact: true }).waitFor();
  await page.route('**/api/command', route => route.abort());
  await page.getByRole('button', { name: 'Accept schedule', exact: true }).click();
  await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor();
  await page.unroute('**/api/command');
  const before = await state();
  await command('profile.answer', 'profile', { questionId: 'style', state: 'unknown' }, before.profileRevision);
  assert.equal(await save(page, 'Retry save'), 409);
  assert.equal(await page.getByRole('button', { name: 'Preview schedule', exact: true }).isEnabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Retry save', exact: true }).isVisible(), false);
  await page.getByRole('button', { name: 'Reconnect', exact: true }).click();
  await page.locator('#error-panel').waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('button', { name: 'Preview schedule', exact: true }).isEnabled(), true);
  assert.equal((await state()).occurrences.length, 0);
}));

test('reconnect preserves a visible retry for an uncertain command', async () => fixture(async (page, state) => {
  await page.getByRole('button', { name: 'Goals', exact: true }).click();
  await page.getByLabel('Goal title', { exact: true }).fill('Pending goal');
  await page.getByLabel('Why it matters').fill('Retain intent across reconnect');
  await page.route('**/api/command', route => route.abort());
  await page.getByRole('button', { name: 'Save goal', exact: true }).click();
  await page.getByRole('button', { name: 'Retry save', exact: true }).waitFor();
  await page.unroute('**/api/command');
  await page.route('**/api/command', route => route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: 'Your local session expired. Reconnect.' }) }));
  assert.equal(await save(page, 'Retry save'), 403);
  await page.unroute('**/api/command');
  const response = page.waitForResponse(r => r.url().endsWith('/api/bootstrap'));
  await page.getByRole('button', { name: 'Reconnect', exact: true }).click(); await response;
  await page.waitForTimeout(50);
  assert.equal(await page.getByRole('button', { name: 'Retry save', exact: true }).isVisible(), true);
  assert.equal(await save(page, 'Retry save'), 200);
  assert.equal((await state()).goals.length, 1);
}));

test('a rejected timezone cannot break the accepted Today schedule', async () => fixture(async (page, _state, command) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await command('task.create', 'task-one', { title: 'Accepted practice', kind: 'task', durationMinutes: 30 });
  await command('occurrence.create', 'session-one', { taskId: 'task-one', startAt: '2026-10-05T13:00:00.000Z', timezone: 'America/Denver', locked: false });
  await page.reload(); await page.getByLabel('Selected date').fill('2026-10-05');
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await page.getByLabel('Timezone', { exact: true }).fill('Not/AZone');
  await page.getByRole('button', { name: 'Preview schedule', exact: true }).click();
  await page.getByText('Unknown timezone.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  assert.deepEqual(errors, []);
  assert.equal(await page.getByRole('heading', { name: 'Accepted practice', exact: true }).count(), 2);
}));
