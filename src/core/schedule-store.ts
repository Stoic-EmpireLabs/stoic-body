import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { Command, Receipt, Snapshot } from './repository';
import { canonical, instant, keys, object, zone } from './validation';
import { proposeSchedule, type ScheduleProposal } from './scheduler';
import { resolveWallTime } from './time';

export interface DayInput { date: string; timezone: string; startTime: string; endTime: string }
export interface ScheduleBatch { id: string; status: 'preview' | 'accepted' | 'undone'; revision: number; createdAt: string }
export interface DayPreview { proposalId: string; proposal: ScheduleProposal; warnings: string[] }
export function migrateSchedules(db: DatabaseSync) {
  if (Number(db.prepare('PRAGMA user_version').get()?.user_version) >= 3) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      CREATE TABLE core_schedule_batches(owner_id TEXT NOT NULL,id TEXT NOT NULL,state_hash TEXT NOT NULL,proposal_json TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('preview','accepted','undone')),revision INTEGER NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id) REFERENCES core_owners(id)) STRICT;
      CREATE TABLE core_batch_occurrences(owner_id TEXT NOT NULL,batch_id TEXT NOT NULL,occurrence_id TEXT NOT NULL,accepted_revision INTEGER NOT NULL,PRIMARY KEY(owner_id,batch_id,occurrence_id),FOREIGN KEY(owner_id,batch_id) REFERENCES core_schedule_batches(owner_id,id),FOREIGN KEY(owner_id,occurrence_id) REFERENCES core_occurrences(owner_id,id)) STRICT;
      CREATE TABLE core_cancelled_occurrences(owner_id TEXT NOT NULL,occurrence_id TEXT NOT NULL,PRIMARY KEY(owner_id,occurrence_id),FOREIGN KEY(owner_id,occurrence_id) REFERENCES core_occurrences(owner_id,id)) STRICT;
      PRAGMA user_version=3;
    `); db.exec('COMMIT');
  } catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); throw error; }
}
export function readBatches(db: DatabaseSync, owner: string): ScheduleBatch[] {
  return db.prepare("SELECT id,status,revision,created_at AS createdAt FROM core_schedule_batches WHERE owner_id=? AND status!='preview' ORDER BY created_at DESC,id LIMIT 100").all(owner) as unknown as ScheduleBatch[];
}
function stateHash(s: Snapshot) {
  return createHash('sha256').update(canonical({ profileRevision: s.profileRevision, tasks: s.tasks, occurrences: s.occurrences, goals: s.goals })).digest('hex');
}
export function createDayProposal(db: DatabaseSync, owner: string, s: Snapshot, input: DayInput): DayPreview {
  const p = object(input); keys(p, ['date', 'timezone', 'startTime', 'endTime']);
  const timezone = zone(p.timezone);
  if (typeof p.date !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(p.date) || typeof p.startTime !== 'string' || typeof p.endTime !== 'string'
    || !/^\d\d:\d\d$/.test(p.startTime) || !/^\d\d:\d\d$/.test(p.endTime)) throw new Error('Choose a date and start/end times.');
  const start = resolveWallTime(`${p.date}T${p.startTime}`, timezone, { source: 'user' });
  const end = resolveWallTime(`${p.date}T${p.endTime}`, timezone, { source: 'user' });
  const warnings = [start, end].filter(r => r.status !== 'exact').map(r => r.explanation);
  const completed = s.tasks.filter(t => s.occurrences.some(o => o.taskId === t.id && o.fraction === 1)).map(t => t.id);
  const candidates = new Map(s.tasks.filter(t => !t.archived && t.kind!=='protected' && !s.occurrences.some(o => o.taskId === t.id)).map(t => [t.id, t]));
  const blocked = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of candidates.values()) {
      if (t.dependencies.some(d => !candidates.has(d) && !completed.includes(d))) {
        candidates.delete(t.id); blocked.push(t); changed = true;
      }
    }
  }
  const proposal = proposeSchedule({
    horizonStart: start.startAt!, horizonEnd: end.startAt!, timezone, policyVersion: 1,
    availability: [{ startAt: start.startAt!, endAt: end.startAt! }], completedDependencyIds: completed,
    tasks: [...candidates.values()],
    reserved: s.occurrences.map(o => {
      const t = s.tasks.find(t => t.id === o.taskId)!;
      return { id: o.id, revision: o.revision, kind: o.locked ? 'locked' as const : 'accepted' as const,
        startAt: new Date(Date.parse(o.startAt) - (t.prepMinutes + t.travelMinutes) * 60000).toISOString(),
        endAt: new Date(Date.parse(o.endAt) + t.bufferMinutes * 60000).toISOString() };
    }),
  });
  for (const task of blocked) proposal.unplaced.push({ taskId: task.id, reason: 'dependency-unplaced',
    requiredMinutes: task.durationMinutes + task.prepMinutes + task.travelMinutes + task.bufferMinutes, largestGapMinutes: 0,
    alternatives: ['Complete or review the already scheduled prerequisite first'] });
  const proposalId = randomUUID();
  db.prepare("INSERT INTO core_schedule_batches VALUES (?,?,?,?,'preview',1,?)").run(owner, proposalId, stateHash(s), JSON.stringify(proposal), new Date().toISOString());
  return { proposalId, proposal, warnings };
}
export function assertSlot(db: DatabaseSync, owner: string, taskId: string, rawStart: unknown, excludeId = '') {
  const startAt = instant(rawStart);
  const task = db.prepare('SELECT duration_minutes,prep_minutes,travel_minutes,buffer_minutes FROM core_tasks WHERE owner_id=? AND id=?').get(owner, taskId);
  if (!task) throw new Error('Task not found.');
  const start = Date.parse(startAt), end = start + Number(task.duration_minutes) * 60000;
  const occupiedStart = start - (Number(task.prep_minutes) + Number(task.travel_minutes)) * 60000;
  const occupiedEnd = end + Number(task.buffer_minutes) * 60000;
  const existing = db.prepare(`SELECT o.id,o.start_at,o.end_at,t.prep_minutes,t.travel_minutes,t.buffer_minutes
    FROM core_occurrences o JOIN core_tasks t ON t.owner_id=o.owner_id AND t.id=o.task_id
    WHERE o.owner_id=? AND o.id!=? AND NOT EXISTS (SELECT 1 FROM core_cancelled_occurrences c WHERE c.owner_id=o.owner_id AND c.occurrence_id=o.id)`).all(owner, excludeId);
  for (const other of existing) {
    const from = Date.parse(String(other.start_at)) - (Number(other.prep_minutes) + Number(other.travel_minutes)) * 60000;
    const until = Date.parse(String(other.end_at)) + Number(other.buffer_minutes) * 60000;
    if (occupiedStart < until && from < occupiedEnd) throw new Error('This time overlaps another session, including preparation, travel or buffer.');
  }
  return { startAt, endAt: new Date(end).toISOString() };
}
export function executeSchedule(db: DatabaseSync, owner: string, c: Command, snapshot: () => Snapshot): Receipt | undefined {
  if (!['schedule.accept', 'schedule.undo', 'occurrence.move', 'occurrence.lock'].includes(c.type)) return;
  const p = object(c.payload);
  const result = (status: Receipt['status'], revision: number): Receipt => ({ operationId: c.operationId, status, canonicalRevision: revision,
    ...(status === 'conflict' ? { safeReason: 'The calendar changed. Generate a fresh preview or review the updated session.' } : {}) });
  if (c.type === 'occurrence.move' || c.type === 'occurrence.lock') {
    keys(p, c.type === 'occurrence.move' ? ['startAt', 'timezone'] : ['locked']);
    const occurrence = snapshot().occurrences.find(o => o.id === c.entityId);
    if (!occurrence) throw new Error('Session not found.');
    if (occurrence.revision !== c.baseRevision) return result('conflict', occurrence.revision);
    if (c.type === 'occurrence.lock') {
      if (typeof p.locked !== 'boolean') throw new Error('Choose whether this session is protected.');
      db.prepare('UPDATE core_occurrences SET locked=?,revision=revision+1 WHERE owner_id=? AND id=?').run(Number(p.locked), owner, c.entityId);
      return result('accepted', occurrence.revision + 1);
    }
    if (occurrence.locked || occurrence.fraction > 0) throw new Error('Locked or started sessions cannot be moved.');
    const time = assertSlot(db, owner, occurrence.taskId, p.startAt, occurrence.id);
    db.prepare('UPDATE core_occurrences SET start_at=?,end_at=?,timezone=?,revision=revision+1 WHERE owner_id=? AND id=?').run(time.startAt, time.endAt, zone(p.timezone), owner, c.entityId);
    return result('accepted', occurrence.revision + 1);
  }
  keys(p, []);
  const batch = db.prepare('SELECT * FROM core_schedule_batches WHERE owner_id=? AND id=?').get(owner, c.entityId);
  if (!batch) throw new Error('Schedule preview not found.');
  if (c.type === 'schedule.accept' && batch.status === 'accepted') return result('duplicate', Number(batch.revision));
  if (c.type === 'schedule.undo' && batch.status === 'undone') return result('duplicate', Number(batch.revision));
  if (batch.revision !== c.baseRevision) return result('conflict', Number(batch.revision));
  if (c.type === 'schedule.accept') {
    if (batch.status !== 'preview' || batch.state_hash !== stateHash(snapshot())) return result('conflict', Number(batch.revision));
    const proposal = JSON.parse(String(batch.proposal_json)) as ScheduleProposal;
    if (proposal.violations.length || !proposal.placements.length) throw new Error('Review conflicts or add a task before accepting this plan.');
    for (const [index, placement] of proposal.placements.entries()) {
      const occurrenceId = `${c.entityId}-${index}`;
      const time = assertSlot(db, owner, placement.taskId, placement.startAt);
      db.prepare('INSERT INTO core_occurrences VALUES (?,?,?,?,?,?,0,0,1)').run(owner, occurrenceId, placement.taskId, time.startAt, time.endAt, proposal.timezone);
      db.prepare('INSERT INTO core_batch_occurrences VALUES (?,?,?,1)').run(owner, c.entityId, occurrenceId);
    }
    db.prepare("UPDATE core_schedule_batches SET status='accepted',revision=revision+1 WHERE owner_id=? AND id=?").run(owner, c.entityId);
  } else {
    if (batch.status !== 'accepted') return result('conflict', Number(batch.revision));
    const rows = db.prepare('SELECT o.id,o.revision,o.fraction,o.locked,b.accepted_revision FROM core_batch_occurrences b JOIN core_occurrences o ON o.owner_id=b.owner_id AND o.id=b.occurrence_id WHERE b.owner_id=? AND b.batch_id=?').all(owner, c.entityId);
    if (rows.some(r => r.revision !== r.accepted_revision || r.fraction !== 0 || r.locked !== 0)) return result('conflict', Number(batch.revision));
    for (const row of rows) {
      db.prepare('INSERT INTO core_cancelled_occurrences VALUES (?,?)').run(owner, row.id);
      db.prepare('UPDATE core_occurrences SET revision=revision+1 WHERE owner_id=? AND id=?').run(owner, row.id);
    }
    db.prepare("UPDATE core_schedule_batches SET status='undone',revision=revision+1 WHERE owner_id=? AND id=?").run(owner, c.entityId);
  }
  return result('accepted', Number(batch.revision) + 1);
}
