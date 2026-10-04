import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import type { Snapshot } from '../../src/core/repository';
async function fixture(run: (page: Page, state: () => Promise<Snapshot>, headers: Record<string, string>) => Promise<void>) {
  const pilot = await startPilot({ databasePath: ':memory:', port: 0 }), browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 950 } }); page.setDefaultTimeout(4000);
  try {
    await page.goto(pilot.url + '/?view=health');
    const boot = await (await page.request.get(`${pilot.url}/api/bootstrap`)).json(), headers = { 'X-Stoic-Token': boot.token, Origin: pilot.url };
    const state = async (): Promise<Snapshot> => (await (await page.request.get(`${pilot.url}/api/snapshot`, { headers })).json()).snapshot;
    await run(page, state, headers);
  } finally { await browser.close(); await pilot.close(); }
}
const openMeals = async (page: Page) => { await page.getByRole('button', { name: 'Meals', exact: true }).click(); await page.getByRole('heading', { name: 'Your portion', exact: true }).waitFor(); };

test('meal portions preview without logging, explicit food save persists and earns no XP', async () => fixture(async (page, state) => {
  await openMeals(page);
  assert.equal((await state()).health.length, 0);
  await page.getByLabel('Skinless chicken breast, cooked / roasted (g)', { exact: true }).fill('85');
  assert.equal(await page.getByRole('button', { name: 'Use in food log', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Update portion', exact: true }).click();
  await page.getByRole('button', { name: 'Use in food log', exact: true }).click();
  assert.equal((await state()).health.length, 0);
  assert.match(await page.getByLabel('Food notes / source details').inputValue(), /85 g Skinless chicken/);
  await page.getByRole('button', { name: 'Save food', exact: true }).click(); await page.getByText('Health entry saved.', { exact: true }).waitFor();
  let s = await state(); assert.equal(s.health.length, 1); assert.equal(s.xpEvents.length, 0); assert.ok(Number(s.health[0].data.calories) > 440 && Number(s.health[0].data.calories) < 465);
  await page.reload(); s = await state(); assert.equal(s.health.length, 1); assert.match(String(s.health[0].data.notes), /2026-10-04/);
}));

test('meal prep goes to tasks once and never silently schedules or marks food eaten', async () => fixture(async (page, state) => {
  await openMeals(page); await page.getByRole('button', { name: 'Add preparation to Plan', exact: true }).click();
  await page.getByText('Preparation task added. Choose its time in Plan.', { exact: true }).waitFor();
  const s = await state(); assert.equal(s.tasks.length, 1); assert.equal(s.occurrences.length, 0); assert.equal(s.health.length, 0); assert.equal(s.xpEvents.length, 0);
  assert.equal(await page.getByRole('button', { name: 'Preparation task already exists', exact: true }).isDisabled(), true);
  await page.getByLabel('Meal or drink').selectOption('salmon-bowl'); await page.getByRole('heading', { name: 'Your portion', exact: true }).waitFor();
  assert.match(await page.locator('#meal-preview').textContent() || '', /Fish/);
}));

test('chia estimates, plain water option, sources and mobile layout are usable', async () => fixture(async (page, state) => {
  await openMeals(page); await page.getByLabel('Meal or drink').selectOption('lemon-chia');
  await page.getByRole('heading', { name: 'Your portion', exact: true }).waitFor();
  assert.match(await page.locator('#meal-preview').textContent() || '', /28 kcal/);
  assert.match(await page.locator('#meal-preview').textContent() || '', /350 ml/);
  await page.getByRole('button', { name: 'Use in food log', exact: true }).click();
  assert.match(await page.getByLabel('Food notes / source details').inputValue(), /water separately/);
  await page.getByRole('button', { name: 'Save food', exact: true }).click(); await page.getByText('Health entry saved.', { exact: true }).waitFor();
  assert.equal((await state()).health.filter(r => r.kind === 'water').length, 0);
  await openMeals(page); await page.getByRole('button', { name: 'Use 350 ml in water log', exact: true }).click();
  assert.equal(await page.getByLabel('Water (ml)', { exact: true }).inputValue(), '350');
  assert.equal((await state()).health.length, 1);
  await openMeals(page); await page.getByLabel('Meal or drink').selectOption('chicken-bowl');
  await page.getByRole('heading', { name: 'Your portion', exact: true }).waitFor();
  await mkdir('docs/evidence/meals', { recursive: true });
  await page.screenshot({ path: 'docs/evidence/meals/meals-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
  await page.screenshot({ path: 'docs/evidence/meals/meals-mobile.png', fullPage: true });
}));

test('stale portion responses cannot restore old ingredients or navigate after leaving Meals', async () => fixture(async page => {
  await openMeals(page);
  let release!: () => void, intercepted!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), arrived = new Promise<void>(resolve => { intercepted = resolve; });
  await page.route('**/api/meal-preview', async route => { intercepted(); await gate; await route.continue(); });
  await page.getByRole('button', { name: 'Update portion', exact: true }).click(); await arrived;
  await page.getByLabel('Skinless chicken breast, cooked / roasted (g)', { exact: true }).fill('100'); release();
  await page.waitForResponse('**/api/meal-preview');
  assert.equal(await page.getByRole('button', { name: 'Use in food log', exact: true }).count(), 0);
  assert.equal(await page.getByLabel('Skinless chicken breast, cooked / roasted (g)', { exact: true }).inputValue(), '100');
}));

test('meal endpoint validates amounts and leaves snapshot untouched', async () => fixture(async (page, state, headers) => {
  const before = await state();
  for (const data of [{id:'chicken-bowl',amounts:{rice:-50}}, {id:'salmon-bowl',amounts:{chicken:100}}, {id:'unknown'}]) {
    const response = await page.request.post(new URL('/api/meal-preview', page.url()).href, { headers, data }); assert.equal(response.status(), 400);
  }
  const response = await page.request.post(new URL('/api/meal-preview', page.url()).href, { headers, data: {id:'turkey-bowl'} }); assert.equal(response.status(), 200);
  assert.deepEqual(await state(), before);
}));
