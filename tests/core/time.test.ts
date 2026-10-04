import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveWallTime } from '../../src/core/time';

test('Denver spring-forward gap is a visible proposed shift for a user routine', () => {
  const result = resolveWallTime('2026-03-08T02:30', 'America/Denver', { source: 'user' });
  assert.equal(result.status, 'shifted-gap');
  assert.equal(result.startAt, '2026-03-08T09:30:00.000Z');
  assert.equal(result.resolvedLocal, '2026-03-08T03:30');
  assert.equal(result.requestedLocal, '2026-03-08T02:30');
});

test('an imported recurrence skips a nonexistent generated local time', () => {
  const result = resolveWallTime('2026-03-08T02:30', 'America/Denver', { source: 'imported' });
  assert.equal(result.status, 'skipped-gap');
  assert.equal(result.startAt, null);
});

test('Denver fall-back defaults earlier and permits an explicit later user choice', () => {
  const early = resolveWallTime('2026-11-01T01:30', 'America/Denver', { source: 'user' });
  const late = resolveWallTime('2026-11-01T01:30', 'America/Denver', { source: 'user', ambiguous: 'later' });
  assert.equal(early.status, 'ambiguous-earlier');
  assert.equal(early.startAt, '2026-11-01T07:30:00.000Z');
  assert.equal(late.status, 'ambiguous-later');
  assert.equal(late.startAt, '2026-11-01T08:30:00.000Z');
  assert.equal(resolveWallTime('2026-11-01T01:30', 'America/Denver', { source: 'imported' }).startAt, early.startAt);
});

test('routine zone changes alter the instant only when the caller explicitly changes zone', () => {
  const home = resolveWallTime('2026-10-05T07:00', 'America/Denver', { source: 'user' });
  const away = resolveWallTime('2026-10-05T07:00', 'America/New_York', { source: 'user' });
  assert.equal(home.startAt, '2026-10-05T13:00:00.000Z');
  assert.equal(away.startAt, '2026-10-05T11:00:00.000Z');
  assert.equal(home.status, 'exact');
});

test('half-hour DST transitions and quarter-hour zones retain their actual offsets', () => {
  const half = resolveWallTime('2026-10-04T02:15', 'Australia/Lord_Howe', { source: 'user' });
  assert.equal(half.resolvedLocal, '2026-10-04T02:45');
  assert.equal(half.startAt, '2026-10-03T15:45:00.000Z');
  const quarter = resolveWallTime('2026-10-05T07:00', 'Asia/Kathmandu', { source: 'user' });
  assert.equal(quarter.startAt, '2026-10-05T01:15:00.000Z');
});

test('unknown imported timezone, invalid date and unsupported policies fail visibly', () => {
  assert.throws(() => resolveWallTime('2026-10-05T07:00', 'Unrecognised/ICS', { source: 'imported' }), /timezone/i);
  assert.throws(() => resolveWallTime('2026-02-30T07:00', 'America/Denver', { source: 'user' }), /date/i);
  assert.throws(() => resolveWallTime('2026-10-05T24:00', 'America/Denver', { source: 'user' }), /date/i);
  assert.throws(() => resolveWallTime('2026-11-01T01:30', 'America/Denver', { source: 'imported', ambiguous: 'later' }), /import/i);
});
