import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { startPilot } from '../../apps/local-pilot/server';
import { get } from 'node:http';

test('local HTTP pilot starts empty, saves via a protected command and survives service restart', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'stoic-pilot-test-'));
  let pilot = await startPilot({ databasePath: join(dir, 'pilot.sqlite'), port: 0 });
  try {
    const bootstrap = await fetch(`${pilot.url}/api/bootstrap`);
    const cookie = bootstrap.headers.get('set-cookie')!.split(';')[0];
    const state = await bootstrap.json(); assert.equal(state.snapshot.goals.length, 0);
    const headers = { Origin: pilot.url, Cookie: cookie, 'X-Stoic-Token': state.token, 'Content-Type': 'application/json' };
    const command = { schemaVersion: 1, operationId: 'test-goal', deviceId: 'browser', entityId: 'goal', baseRevision: 0, type: 'goal.create', payload: { title: 'Learn', why: 'Curiosity' } };
    const saved = await fetch(`${pilot.url}/api/command`, { method: 'POST', headers, body: JSON.stringify(command) });
    assert.equal(saved.status, 200); assert.equal((await saved.json()).snapshot.goals.length, 1);
    const duplicate = await fetch(`${pilot.url}/api/command`, { method: 'POST', headers, body: JSON.stringify(command) });
    assert.equal((await duplicate.json()).snapshot.goals.length, 1);
    await pilot.close(); pilot = await startPilot({ databasePath: join(dir, 'pilot.sqlite'), port: 0 });
    const reopened = await (await fetch(`${pilot.url}/api/bootstrap`)).json();
    assert.equal(reopened.snapshot.goals[0].title, 'Learn');
  } finally {
    await pilot.close(); const target = resolve(dir); assert.equal(dirname(target), resolve(tmpdir())); assert.ok(basename(target).startsWith('stoic-pilot-test-'));
    rmSync(target, { recursive: true, force: true });
  }
});

test('local service rejects cross-origin, forged hosts, missing tokens and unknown assets', async () => {
  const pilot = await startPilot({ databasePath: ':memory:', port: 0 });
  try {
    assert.equal((await fetch(`${pilot.url}/api/bootstrap`, { headers: { Origin: 'https://evil.example' } })).status, 403);
    const forgedHostStatus = await new Promise<number | undefined>((accept, reject) => {
      get(`${pilot.url}/api/bootstrap`, { headers: { Host: 'evil.example' } }, response => { response.resume(); accept(response.statusCode); }).on('error', reject);
    });
    assert.equal(forgedHostStatus, 403);
    assert.equal((await fetch(`${pilot.url}/api/snapshot`)).status, 403);
    assert.equal((await fetch(`${pilot.url}/api/command`, { method: 'POST', body: '{}' })).status, 403);
    assert.equal((await fetch(`${pilot.url}/.env`)).status, 404);
    const init = await fetch(`${pilot.url}/api/bootstrap`), data = await init.json();
    const headers = { Origin: pilot.url, Cookie: init.headers.get('set-cookie')!.split(';')[0], 'X-Stoic-Token': data.token, 'Content-Type': 'application/json' };
    assert.equal((await fetch(`${pilot.url}/api/command`, { method: 'POST', headers, body: 'x'.repeat(1_048_577) })).status, 413);
    const invalid = await fetch(`${pilot.url}/api/command`, { method: 'POST', headers, body: '{' });
    assert.equal(invalid.status, 400); assert.equal((await invalid.json()).error, 'The request could not be read.');
    assert.equal((await fetch(`${pilot.url}/api/command`, { method: 'POST', headers, body: JSON.stringify({ ownerId: 'another' }) })).status, 400);
  } finally { await pilot.close(); }
});
