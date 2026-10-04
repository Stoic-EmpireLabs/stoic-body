import type { DatabaseSync } from 'node:sqlite';
import type { Command, Receipt } from './repository';
import { object, keys, text, number, integer, id } from './validation';
export interface HealthRecord { id: string; kind: string; revision: number; archived: boolean; data: Record<string, unknown> }
export function migrateHealth(db: DatabaseSync) {
  if (Number(db.prepare('PRAGMA user_version').get()?.user_version) >= 4) return;
  db.exec('BEGIN IMMEDIATE');
  try { db.exec(`CREATE TABLE core_health(owner_id TEXT NOT NULL,id TEXT NOT NULL,kind TEXT NOT NULL,revision INTEGER NOT NULL,archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),data_json TEXT NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id) REFERENCES core_owners(id)) STRICT; PRAGMA user_version=4;`); db.exec('COMMIT'); }
  catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); throw error; }
}
export function readHealth(db: DatabaseSync, owner: string): HealthRecord[] {
  return db.prepare('SELECT id,kind,revision,archived,data_json FROM core_health WHERE owner_id=? ORDER BY rowid').all(owner).map(r => ({ id: String(r.id), kind: String(r.kind), revision: Number(r.revision), archived: Boolean(r.archived), data: JSON.parse(String(r.data_json)) }));
}
export function healthDate(v: unknown): string {
  if (typeof v !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(v) || v < '1970-01-01' || v > '2100-12-31' || !Number.isFinite(Date.parse(`${v}T00:00:00Z`)) || new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) !== v) throw new Error('Choose a valid date.');
  return v;
}
function note(v: unknown, max = 2000) { if (v === undefined || v === '') return ''; return text(v, max); }
function optional(v: unknown, max: number) { return v === undefined || v === null ? null : number(v, 0, max); }
function choice(v: unknown, values: string[]) { if (typeof v !== 'string' || !values.includes(v)) throw new Error(`Choose one of: ${values.join(', ')}.`); return v; }
function normalize(db: DatabaseSync, owner: string, kind: string, input: unknown) {
  const p = object(input), data: Record<string, unknown> = { date: healthDate(p.date), notes: note(p.notes) };
  if (kind === 'food') {
    keys(p, ['date', 'title', 'portion', 'source', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'notes']);
    Object.assign(data, { title: text(p.title), portion: text(p.portion), source: choice(p.source, ['label', 'estimate', 'database']) });
    for (const key of ['calories', 'protein', 'carbs', 'fat', 'fiber']) data[key] = optional(p[key], key === 'calories' ? 10000 : 1000);
  } else if (kind === 'water') {
    keys(p, ['date', 'ml', 'notes']); data.ml = number(p.ml, 1, 5000);
  } else if (kind === 'measurement') {
    keys(p, ['date', 'metric', 'value', 'unit', 'method', 'notes']);
    const metric = choice(p.metric, ['weight', 'waist', 'bodyFat']);
    Object.assign(data, { metric, value: number(p.value, .1, metric === 'bodyFat' ? 80 : 1500), unit: choice(p.unit, metric === 'weight' ? ['kg', 'lb'] : metric === 'waist' ? ['cm', 'in'] : ['percent']), method: text(p.method, 300) });
  } else if (kind === 'checkin') {
    keys(p, ['date', 'hunger', 'energy', 'sleepHours', 'digestion', 'eatingWindow', 'notes']);
    Object.assign(data, { hunger: optional(p.hunger, 10), energy: optional(p.energy, 10), sleepHours: optional(p.sleepHours, 24), digestion: note(p.digestion, 500), eatingWindow: note(p.eatingWindow, 100) });
  } else if (kind === 'workout') {
    keys(p, ['date', 'routineId', 'exercise', 'sets', 'duration', 'effort', 'pain', 'notes']);
    const routineId = id(p.routineId), routine = db.prepare("SELECT data_json FROM core_health WHERE owner_id=? AND id=? AND kind='routine' AND archived=0").get(owner, routineId);
    if (!routine) throw new Error('Choose a saved routine.');
    const exercise = text(p.exercise), exercises = JSON.parse(String(routine.data_json)).exercises as { name: string }[];
    if (!exercises.some(e => e.name === exercise)) throw new Error('Choose an exercise in this routine.');
    if (!Array.isArray(p.sets) || p.sets.length > 30 || typeof p.pain !== 'boolean') throw new Error('Check sets and discomfort response.');
    const sets = p.sets.map(s => { const v = object(s); keys(v, ['reps', 'load', 'unit']); return { reps: integer(v.reps, 1, 100), load: number(v.load, 0, 1000), unit: choice(v.unit, ['kg', 'lb']) }; });
    Object.assign(data, { routineId, exercise, sets, duration: number(p.duration, .1, 240), effort: optional(p.effort, 10), pain: p.pain });
  } else throw new Error('Unsupported health record.');
  return data;
}
export function executeHealth(db: DatabaseSync, owner: string, c: Command): Receipt | undefined {
  if (!['health.save', 'health.archive'].includes(c.type)) return;
  const p = object(c.payload), row = db.prepare('SELECT kind,revision FROM core_health WHERE owner_id=? AND id=?').get(owner, c.entityId);
  const revision = Number(row?.revision ?? 0);
  if (revision !== c.baseRevision) return { operationId: c.operationId, status: 'conflict', canonicalRevision: revision, safeReason: 'This health entry changed. Reopen the current version before editing.' };
  if (c.type === 'health.archive') {
    keys(p, ['archived']); if (!row || typeof p.archived !== 'boolean' || row.kind === 'routine') throw new Error('Choose an existing log entry to archive or restore.');
    db.prepare('UPDATE core_health SET archived=?,revision=revision+1 WHERE owner_id=? AND id=?').run(Number(p.archived), owner, c.entityId);
  } else {
    keys(p, ['kind', 'data']); const kind = text(p.kind, 30);
    if (row && row.kind !== kind) throw new Error('An entry cannot change its type.');
    const data = normalize(db, owner, kind, p.data);
    db.prepare('INSERT INTO core_health VALUES (?,?,?,?,0,?) ON CONFLICT(owner_id,id) DO UPDATE SET data_json=excluded.data_json,revision=excluded.revision').run(owner, c.entityId, kind, revision + 1, JSON.stringify(data));
  }
  return { operationId: c.operationId, status: 'accepted', canonicalRevision: revision + 1 };
}
