import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { CoreRepository } from '../../src/core/repository';

test('a version-1 file upgrades additively and retains saved answers, task, occurrence and XP', () => {
  const dir = mkdtempSync(join(tmpdir(), 'stoic-migrate-')), file = join(dir, 'old.sqlite');
  const old = new DatabaseSync(file);
  old.exec(`
    CREATE TABLE core_owners(id TEXT PRIMARY KEY,profile_revision INTEGER NOT NULL DEFAULT 0,answers_json TEXT NOT NULL DEFAULT '{}') STRICT;
    CREATE TABLE core_tasks(owner_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,kind TEXT NOT NULL,duration_minutes INTEGER NOT NULL,prep_minutes INTEGER NOT NULL,travel_minutes INTEGER NOT NULL,buffer_minutes INTEGER NOT NULL,budget INTEGER NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(owner_id,id)) STRICT;
    CREATE TABLE core_occurrences(owner_id TEXT NOT NULL,id TEXT NOT NULL,task_id TEXT NOT NULL,start_at TEXT NOT NULL,end_at TEXT NOT NULL,timezone TEXT NOT NULL,locked INTEGER NOT NULL,fraction REAL NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(owner_id,id)) STRICT;
    CREATE TABLE core_operations(owner_id TEXT NOT NULL,operation_id TEXT NOT NULL,request_hash TEXT NOT NULL,receipt_json TEXT NOT NULL,PRIMARY KEY(owner_id,operation_id)) STRICT;
    CREATE TABLE core_xp_events(sequence INTEGER PRIMARY KEY AUTOINCREMENT,owner_id TEXT NOT NULL,operation_id TEXT NOT NULL,occurrence_id TEXT NOT NULL,delta INTEGER NOT NULL,revision INTEGER NOT NULL,UNIQUE(owner_id,operation_id)) STRICT;
    CREATE TABLE core_outbox(sequence INTEGER PRIMARY KEY AUTOINCREMENT,owner_id TEXT NOT NULL,operation_id TEXT NOT NULL,command_json TEXT NOT NULL,UNIQUE(owner_id,operation_id)) STRICT;
    INSERT INTO core_owners VALUES ('legacy',1,'{"health":{"state":"skipped"}}');
    INSERT INTO core_tasks VALUES ('legacy','read','Read','focus',30,0,0,0,15,1);
    INSERT INTO core_occurrences VALUES ('legacy','first','read','2026-10-05T13:00:00.000Z','2026-10-05T13:30:00.000Z','America/Denver',0,1,2);
    INSERT INTO core_xp_events(owner_id,operation_id,occurrence_id,delta,revision) VALUES ('legacy','done','first',15,2);
    PRAGMA user_version=1;
  `);
  old.close();
  const upgraded = new CoreRepository(file);
  try {
    assert.equal(upgraded.snapshot('legacy').totalXp, 15);
    assert.equal(upgraded.snapshot('legacy').answers.health.state, 'skipped');
    assert.equal(upgraded.snapshot('legacy').tasks[0].goalId, null);
    assert.deepEqual(upgraded.snapshot('legacy').tasks[0].dependencies, []);
    assert.equal(upgraded.snapshot('legacy').occurrences[0].fraction, 1);
  } finally {
    upgraded.close();
    const target = resolve(dir); assert.equal(dirname(target), resolve(tmpdir())); assert.ok(basename(target).startsWith('stoic-migrate-'));
    rmSync(target, { recursive: true, force: true });
  }
});
