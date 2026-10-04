import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { CoreRepository, type Command } from '../../src/core/repository';
let seq = 0;
function removeFixture(dir: string) { const target = resolve(dir); assert.equal(dirname(target), resolve(tmpdir())); assert.ok(basename(target).startsWith('stoic-core-')); rmSync(target, { recursive: true, force: true }); }
function command(type: string, entityId: string, payload: unknown, baseRevision = 0): Command { return { schemaVersion: 1, operationId: `op-${++seq}`, deviceId: 'device-a', entityId, baseRevision, type, payload } as Command; }
function seed(db: CoreRepository, owner = 'alice') {
    db.createOwner(owner);
    db.apply(owner, command('task.create', 'workout', { title: 'Movement practice', kind: 'workout', durationMinutes: 25, prepMinutes: 5, travelMinutes: 0, bufferMinutes: 5 }));
    db.apply(owner, command('occurrence.create', 'monday', { taskId: 'workout', startAt: '2026-10-05T13:30:00.000Z', timezone: 'America/Denver', locked: false }));
}
test('startup is empty and data survives closing and reopening a real file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stoic-core-')), file = join(dir, 'core.sqlite');
    let db = new CoreRepository(file);
    try {
        assert.equal(db.ownerCount(), 0);
        seed(db);
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'units', state: 'unknown' }));
        db.close();
        db = new CoreRepository(file);
        const s = db.snapshot('alice');
        assert.equal(s.tasks.length, 1);
        assert.equal(s.answers.units.state, 'unknown');
        assert.equal(s.totalXp, 0);
        assert.equal(s.pending.length, 3);
    }
    finally {
        db.close();
        removeFixture(dir);
    }
});
test('completion retries, partial progress and correction produce one durable ledger', () => {
    const db = new CoreRepository(':memory:');
    try {
        seed(db);
        const half = command('completion.set', 'monday', { fraction: .5 }, 1);
        for (let i = 0; i < 100; i++)
            db.apply('alice', half);
        assert.equal(db.snapshot('alice').totalXp, 12);
        db.apply('alice', command('completion.set', 'monday', { fraction: 1 }, 2));
        let s = db.snapshot('alice');
        assert.equal(s.totalXp, 25);
        assert.deepEqual(s.xpEvents.map(x => x.delta), [12, 13]);
        const secondDevice = command('completion.set', 'monday', { fraction: 1 }, 1);
        secondDevice.deviceId = 'device-b';
        assert.equal(db.apply('alice', secondDevice).status, 'duplicate');
        assert.equal(db.snapshot('alice').totalXp, 25);
        const undo = command('completion.set', 'monday', { fraction: 0 }, 3);
        db.apply('alice', undo);
        db.apply('alice', undo);
        s = db.snapshot('alice');
        assert.equal(s.totalXp, 0);
        assert.deepEqual(s.xpEvents.map(x => x.delta), [12, 13, -25]);
        assert.equal(s.occurrences[0].fraction, 0);
    }
    finally {
        db.close();
    }
});
test('stale partial or undo requests conflict, and reused operation ids cannot change meaning', () => {
    const db = new CoreRepository(':memory:');
    try {
        seed(db);
        const full = command('completion.set', 'monday', { fraction: 1 }, 1);
        db.apply('alice', full);
        assert.equal(db.apply('alice', command('completion.set', 'monday', { fraction: 0 }, 1)).status, 'conflict');
        assert.equal(db.apply('alice', command('completion.set', 'monday', { fraction: .5 }, 1)).status, 'conflict');
        assert.throws(() => db.apply('alice', { ...full, payload: { fraction: 0 } }), /operation/i);
        assert.equal(db.snapshot('alice').totalXp, 25);
    }
    finally {
        db.close();
    }
});
test('owners cannot read or mutate each other through guessed entity ids', () => {
    const db = new CoreRepository(':memory:');
    try {
        seed(db);
        db.createOwner('bob');
        assert.equal(db.snapshot('bob').tasks.length, 0);
        assert.throws(() => db.apply('bob', command('completion.set', 'monday', { fraction: 1 }, 1)), /not found/i);
        assert.throws(() => db.apply('bob', command('occurrence.create', 'stolen', { taskId: 'workout', startAt: '2026-10-05T16:00:00.000Z', timezone: 'America/Denver', locked: false })), /not found/i);
        assert.equal(db.snapshot('alice').totalXp, 0);
    }
    finally {
        db.close();
    }
});
test('a failed write rolls back completion, reward and outbox together', () => {
    const db = new CoreRepository(':memory:');
    try {
        seed(db);
        const before = db.snapshot('alice');
        db.database.exec("CREATE TRIGGER simulate_disk_failure BEFORE INSERT ON core_xp_events BEGIN SELECT RAISE(ABORT,'simulated write failure'); END;");
        assert.throws(() => db.apply('alice', command('completion.set', 'monday', { fraction: 1 }, 1)), /simulated write failure/);
        assert.deepEqual(db.snapshot('alice'), before);
    }
    finally {
        db.close();
    }
});
test('server-assigned rewards reject manipulated budgets and invalid input', () => {
    const db = new CoreRepository(':memory:');
    try {
        seed(db);
        assert.throws(() => db.apply('alice', command('task.create', 'bad', { title: 'Too much', kind: 'workout', durationMinutes: 20, budget: 9999 })), /unexpected|budget/i);
        assert.throws(() => db.apply('alice', command('completion.set', 'monday', { fraction: 1.1 }, 1)));
        assert.throws(() => db.apply('alice', command('profile.answer', 'profile', { questionId: 'units', state: 'answered', value: 'guessed' })));
        assert.equal(db.snapshot('alice').totalXp, 0);
    }
    finally {
        db.close();
    }
});
test('onboarding preserves skipped answers and settings, and confirms units before weight inputs', () => {
    const db = new CoreRepository(':memory:');
    try {
        db.createOwner('alice');
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'health', state: 'skipped' }));
        assert.throws(() => db.apply('alice', command('profile.answer', 'profile', { questionId: 'weight', state: 'answered', value: 170 }, 1)), /units/i);
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'units', state: 'answered', value: 'imperial' }, 1));
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'weight', state: 'answered', value: 170 }, 2));
        assert.equal(db.snapshot('alice').answers.health.state, 'skipped');
        assert.equal(db.snapshot('alice').answers.weight.value, 170);
    }
    finally {
        db.close();
    }
});
test('body measurements retain original units when display preferences change', () => {
    const db = new CoreRepository(':memory:');
    try {
        db.createOwner('alice');
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'units', state: 'answered', value: 'imperial' }));
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'weight', state: 'answered', value: 170 }, 1));
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'height', state: 'answered', value: 68 }, 2));
        db.apply('alice', command('profile.answer', 'profile', { questionId: 'units', state: 'answered', value: 'metric' }, 3));
        const s = db.snapshot('alice');
        assert.equal(s.answers.weight.unit, 'lb');
        assert.equal(s.answers.height.unit, 'in');
        assert.equal(s.answers.weight.value, 170);
    }
    finally {
        db.close();
    }
});
test('restarting preserves replay receipts and correction history', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stoic-core-')), file = join(dir, 'core.sqlite');
    let db = new CoreRepository(file);
    try {
        seed(db);
        const completion = command('completion.set', 'monday', { fraction: 1 }, 1);
        db.apply('alice', completion);
        const before = db.snapshot('alice');
        db.close();
        db = new CoreRepository(file);
        assert.equal(db.apply('alice', completion).status, 'duplicate');
        assert.deepEqual(db.snapshot('alice'), before);
        db.apply('alice', command('completion.set', 'monday', { fraction: 0 }, 2));
        db.close();
        db = new CoreRepository(file);
        assert.equal(db.snapshot('alice').totalXp, 0);
        assert.deepEqual(db.snapshot('alice').xpEvents.map(x => x.delta), [25, -25]);
    }
    finally {
        db.close();
        removeFixture(dir);
    }
});
test('an outbox failure rolls back the reward, completion and operation receipt', () => {
    const db = new CoreRepository(':memory:');
    try {
        seed(db);
        const before = db.snapshot('alice');
        const completion = command('completion.set', 'monday', { fraction: 1 }, 1);
        db.database.exec("CREATE TRIGGER fail_outbox BEFORE INSERT ON core_outbox BEGIN SELECT RAISE(ABORT,'outbox unavailable'); END;");
        assert.throws(() => db.apply('alice', completion), /outbox unavailable/);
        assert.deepEqual(db.snapshot('alice'), before);
        db.database.exec('DROP TRIGGER fail_outbox');
        assert.equal(db.apply('alice', completion).status, 'accepted');
        assert.equal(db.snapshot('alice').totalXp, 25);
    }
    finally {
        db.close();
    }
});
test('database foreign keys reject cross-owner relations and a future schema remains intact', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stoic-core-')), file = join(dir, 'core.sqlite');
    const db = new CoreRepository(file);
    try {
        seed(db);
        db.createOwner('bob');
        assert.throws(() => db.database.prepare('INSERT INTO core_occurrences VALUES (?,?,?,?,?,?,?,?,?)')
            .run('bob', 'bad', 'workout', '2026-10-05T00:00:00.000Z', '2026-10-05T01:00:00.000Z', 'America/Denver', 0, 0, 1), /foreign key/i);
        db.database.exec('PRAGMA user_version=999');
        assert.throws(() => new CoreRepository(file), /newer application/);
        assert.equal(db.snapshot('alice').tasks.length, 1);
        assert.equal(db.database.prepare('PRAGMA user_version').get()?.user_version, 999);
    }
    finally {
        db.close();
        removeFixture(dir);
    }
});

test('commands must survive JSON transport unchanged and reject unbounded payloads', () => {
    const db = new CoreRepository(':memory:');
    try {
        db.createOwner('alice');
        const invalid = command('task.create', 'a', { title: 'Read', kind: 'focus', durationMinutes: 20, prepMinutes: undefined });
        assert.throws(() => db.apply('alice', invalid), /JSON/i);
        const huge = command('task.create', 'a', { title: 'a'.repeat(1_048_577), kind: 'focus', durationMinutes: 20 });
        assert.throws(() => db.apply('alice', huge), /size|large/i);
        let nested: unknown = {};
        for (let i = 0; i < 40; i++) nested = { nested };
        assert.throws(() => db.apply('alice', command('task.create', 'a', nested)), /depth/i);
        assert.equal(db.snapshot('alice').pending.length, 0);
    } finally { db.close(); }
});

test('snapshot is consistent when a second connection commits during its reads', () => {
    const dir = mkdtempSync(join(tmpdir(), 'stoic-core-')), file = join(dir, 'core.sqlite');
    const reader = new CoreRepository(file);
    reader.database.exec('PRAGMA journal_mode=WAL');
    const writer = new CoreRepository(file);
    const prepare = reader.database.prepare.bind(reader.database);
    try {
        seed(reader);
        const before = reader.snapshot('alice');
        let interleaved = false;
        reader.database.prepare = sql => {
            if (!interleaved && sql.startsWith('SELECT operation_id AS operationId')) {
                interleaved = true;
                writer.apply('alice', command('completion.set', 'monday', { fraction: 1 }, 1));
            }
            return prepare(sql);
        };
        const during = reader.snapshot('alice');
        assert.equal(interleaved, true);
        assert.equal(writer.snapshot('alice').totalXp, 25);
        assert.deepEqual(during, before);
        assert.equal(reader.snapshot('alice').totalXp, 25);
    } finally {
        reader.database.prepare = prepare;
        writer.close();reader.close();removeFixture(dir);
    }
});

test('answer enum values must be strings and invalid input leaves no record', () => {
    const db = new CoreRepository(':memory:');
    try {
        db.createOwner('alice');
        const before = db.snapshot('alice');
        for (const state of [['answered'], ['skipped'], ['unknown']]) {
            assert.throws(() => db.apply('alice', command('profile.answer', 'profile', { questionId: 'health', state })), /answer state/i);
            assert.deepEqual(db.snapshot('alice'), before);
        }
        assert.throws(() => db.apply('alice', command('profile.answer', 'profile', { questionId: 'units', state: 'answered', value: ['metric'] })), /units/i);
        assert.deepEqual(db.snapshot('alice'), before);
    } finally { db.close(); }
});

test('SQLite automatic rollback preserves the original disk-full error and accepted records', () => {
    const db = new CoreRepository(':memory:');
    try {
        db.createOwner('alice');
        const pages = Number(db.database.prepare('PRAGMA page_count').get()?.page_count);
        db.database.exec(`PRAGMA max_page_count=${pages}`);
        let failure: unknown;
        let previous = db.snapshot('alice');
        for (let i = 0; i < 500; i++) {
            previous = db.snapshot('alice');
            try { db.apply('alice', command('task.create', `task-${i}`, { title: 'x'.repeat(160), kind: 'task', durationMinutes: 30 })); }
            catch (error) { failure = error;break; }
        }
        assert.ok(failure);
        assert.match(String(failure), /full/i);
        assert.deepEqual(db.snapshot('alice'), previous);
        db.database.exec('PRAGMA max_page_count=10000');
        assert.equal(db.apply('alice', command('task.create', 'after-recovery', { title: 'Recovered', kind: 'task', durationMinutes: 30 })).status, 'accepted');
    } finally { db.close(); }
});
