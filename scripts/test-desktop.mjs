import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:net';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { buildDesktop } from './build-desktop.mjs';

const run = promisify(execFile);
const root = await mkdtemp(resolve(tmpdir(), 'stoic-desktop-test-'));
const { folder } = await buildDesktop({ outputRoot: root, archive: false });
const files = await readdir(folder, { recursive: true });
assert.ok(files.includes('server.cjs') && files.includes('runtime\\node.exe'));
assert.ok(!files.some(file => /sqlite|node_modules|(^|[\\/])private|\.env/i.test(file)));
const manifest = JSON.parse(await readFile(resolve(folder, 'manifest.json'), 'utf8'));
assert.equal(manifest.runtime, 'v24.19.0');
assert.equal(manifest.files.length, 16);
for (const file of manifest.files) assert.equal(createHash('sha256').update(await readFile(resolve(folder, file.path))).digest('hex'), file.sha256);
const listener = createServer();
await new Promise(done => listener.listen(0, '127.0.0.1', done));
const port = listener.address().port;
await new Promise(done => listener.close(done));
const url = `http://127.0.0.1:${port}`;
const env = { ...process.env, STOIC_BODY_DATA_DIR: resolve(root, 'test-data'), STOIC_BODY_PORT: String(port) };
const launch = (...args) => run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', resolve(folder, 'launch.ps1'), ...args], { env, timeout: 30000 });
const browser = await chromium.launch({ headless: true });
try {
  const starts=await Promise.allSettled([launch('-NoBrowser'),launch('-NoBrowser'),launch('-NoBrowser')]);
  assert.deepEqual(starts.map(s=>s.status),['fulfilled','fulfilled','fulfilled'],'simultaneous starts must share one owned server');
  console.log('PASS: bundled launcher starts the local service.');
  assert.equal((await (await fetch(`${url}/api/identity`)).json()).product, 'Stoic Body');
  assert.deepEqual(await (await fetch(`${url}/api/bootstrap`)).json(), { authenticated: false, mode: 'local' });
  const page = await browser.newPage();
  await page.goto(url);
  await page.getByRole('button', { name: 'Create my account', exact: true }).click();
  await page.getByLabel('Your name').fill('New client');
  await page.getByLabel('Username', { exact: true }).fill('new-client');
  await page.getByLabel('Passphrase', { exact: true }).fill('new client test passphrase');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.locator('#recovery-key').waitFor();
  await page.getByRole('button', { name: 'I saved my key — continue' }).click();
  await page.getByRole('heading', { name: /Welcome, New client/ }).waitFor();
  console.log('PASS: clean welcome and new-client signup.');
  await launch('-NoBrowser'); // Re-opening must reuse this installation, not create another server.
  await launch('-Stop');
  await assert.rejects(fetch(`${url}/api/bootstrap`));
  await launch('-NoBrowser');
  const login = await fetch(`${url}/api/auth/login`, { method: 'POST', headers: { Origin: url, 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'new-client', password: 'new client test passphrase' }) });
  assert.equal(login.status, 200);
  const state = await login.json();
  assert.equal(state.account.displayName, 'New client');
  assert.equal(state.snapshot.goals.length, 0);
  assert.equal(Object.keys(state.snapshot.answers).length, 0);
  console.log('PASS: allowlisted Windows bundle, real launcher, fresh account, isolated data, stop and restart.');
} finally {
  await browser.close();
  await launch('-Stop');
  // Only this freshly-created test bundle; clean a failed ownership-race probe too.
  await run('powershell.exe',['-NoProfile','-Command',"Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $env:STOIC_TEST_RUNTIME } | ForEach-Object { Stop-Process -Id $_.ProcessId }"],{env:{...env,STOIC_TEST_RUNTIME:resolve(folder,'runtime/node.exe')}});
}
