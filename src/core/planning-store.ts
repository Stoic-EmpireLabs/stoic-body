import type { DatabaseSync } from 'node:sqlite';
import type { Command, Receipt } from './repository';
import { BASE_XP, type ActionKind } from './xp';
import { object, keys, id, integer, text } from './validation';

export interface CoreGoal { id: string; title: string; why: string; archived: boolean; revision: number }
export function migratePlanning(db: DatabaseSync) {
  if (Number(db.prepare('PRAGMA user_version').get()?.user_version) >= 2) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      CREATE TABLE core_goals(owner_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,why TEXT NOT NULL,archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),revision INTEGER NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id) REFERENCES core_owners(id)) STRICT;
      CREATE TABLE core_task_details(owner_id TEXT NOT NULL,task_id TEXT NOT NULL,goal_id TEXT,priority INTEGER NOT NULL DEFAULT 1 CHECK(priority BETWEEN 0 AND 10),archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),PRIMARY KEY(owner_id,task_id),FOREIGN KEY(owner_id,task_id) REFERENCES core_tasks(owner_id,id),FOREIGN KEY(owner_id,goal_id) REFERENCES core_goals(owner_id,id)) STRICT;
      CREATE TABLE core_dependencies(owner_id TEXT NOT NULL,task_id TEXT NOT NULL,dependency_id TEXT NOT NULL,PRIMARY KEY(owner_id,task_id,dependency_id),FOREIGN KEY(owner_id,task_id) REFERENCES core_tasks(owner_id,id),FOREIGN KEY(owner_id,dependency_id) REFERENCES core_tasks(owner_id,id)) STRICT;
      INSERT INTO core_task_details(owner_id,task_id) SELECT owner_id,id FROM core_tasks;
      PRAGMA user_version=2;
    `);
    db.exec('COMMIT');
  } catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); throw error; }
}
export function readGoals(db: DatabaseSync, ownerId: string): CoreGoal[] {
  return db.prepare('SELECT id,title,why,archived,revision FROM core_goals WHERE owner_id=? ORDER BY id').all(ownerId)
    .map(row => ({ ...row, archived: Boolean(row.archived) })) as unknown as CoreGoal[];
}
export function readTaskDetails(db: DatabaseSync, ownerId: string, taskId: string) {
  const row = db.prepare('SELECT goal_id AS goalId,priority,archived FROM core_task_details WHERE owner_id=? AND task_id=?').get(ownerId, taskId);
  const dependencies = db.prepare('SELECT dependency_id FROM core_dependencies WHERE owner_id=? AND task_id=? ORDER BY dependency_id').all(ownerId, taskId).map(r => String(r.dependency_id));
  return { goalId: row?.goalId as string | null ?? null, priority: Number(row?.priority ?? 1), archived: Boolean(row?.archived), dependencies };
}
export function executePlanning(db: DatabaseSync, owner: string, c: Command): Receipt | undefined {
  if (!['goal.create', 'goal.update', 'goal.archive', 'task.create', 'task.update', 'task.archive'].includes(c.type)) return;
  const p = object(c.payload);
  const accepted = (revision: number): Receipt => ({ operationId: c.operationId, status: 'accepted', canonicalRevision: revision });
  const conflict = (revision: number): Receipt => ({ operationId: c.operationId, status: 'conflict', canonicalRevision: revision, safeReason: 'This item changed. Reload it before saving.' });
  if (c.type.startsWith('goal.')) {
    const existing = db.prepare('SELECT revision FROM core_goals WHERE owner_id=? AND id=?').get(owner, c.entityId);
    if (c.type === 'goal.create') {
      keys(p, ['title', 'why']);
      if (existing || c.baseRevision !== 0) return conflict(Number(existing?.revision ?? 0));
      db.prepare('INSERT INTO core_goals(owner_id,id,title,why,revision) VALUES (?,?,?,?,1)').run(owner, c.entityId, text(p.title), text(p.why, 1000));
      return accepted(1);
    }
    if (!existing) throw new Error('Goal not found.');
    const revision = Number(existing.revision);
    if (c.baseRevision !== revision) return conflict(revision);
    if (c.type === 'goal.archive') {
      keys(p, ['archived']); if (typeof p.archived !== 'boolean') throw new Error('Choose archive or restore.');
      db.prepare('UPDATE core_goals SET archived=?,revision=revision+1 WHERE owner_id=? AND id=?').run(Number(p.archived), owner, c.entityId);
    } else {
      keys(p, ['title', 'why']);
      db.prepare('UPDATE core_goals SET title=?,why=?,revision=revision+1 WHERE owner_id=? AND id=?').run(text(p.title), text(p.why, 1000), owner, c.entityId);
    }
    return accepted(revision + 1);
  }
  const existing = db.prepare('SELECT * FROM core_tasks WHERE owner_id=? AND id=?').get(owner, c.entityId);
  const creating = c.type === 'task.create';
  if (creating && (existing || c.baseRevision !== 0)) return conflict(Number(existing?.revision ?? 0));
  if (!creating && !existing) throw new Error('Task not found.');
  if (!creating && c.baseRevision !== existing?.revision) return conflict(Number(existing?.revision));
  if (c.type === 'task.archive') {
    keys(p, ['archived']); if (typeof p.archived !== 'boolean') throw new Error('Choose archive or restore.');
    db.prepare('UPDATE core_task_details SET archived=? WHERE owner_id=? AND task_id=?').run(Number(p.archived), owner, c.entityId);
    db.prepare('UPDATE core_tasks SET revision=revision+1 WHERE owner_id=? AND id=?').run(owner, c.entityId);
    return accepted(c.baseRevision + 1);
  }
  keys(p, creating ? ['title', 'kind', 'durationMinutes', 'prepMinutes', 'travelMinutes', 'bufferMinutes', 'goalId', 'priority', 'dependencies']
    : ['title', 'durationMinutes', 'prepMinutes', 'travelMinutes', 'bufferMinutes', 'goalId', 'priority', 'dependencies']);
  const old = readTaskDetails(db, owner, c.entityId);
  const title = text(p.title ?? existing?.title);
  const kind = creating ? p.kind : existing?.kind;
  if (typeof kind !== 'string' || !Object.hasOwn(BASE_XP, kind)) throw new Error('Unknown action kind.');
  const duration = integer(p.durationMinutes ?? existing?.duration_minutes, 1, 1440);
  const prep = integer(p.prepMinutes ?? existing?.prep_minutes ?? 0, 0, 1440);
  const travel = integer(p.travelMinutes ?? existing?.travel_minutes ?? 0, 0, 1440);
  const buffer = integer(p.bufferMinutes ?? existing?.buffer_minutes ?? 0, 0, 1440);
  if (!creating && (duration !== existing?.duration_minutes || prep !== existing?.prep_minutes || travel !== existing?.travel_minutes || buffer !== existing?.buffer_minutes)
    && db.prepare('SELECT 1 FROM core_occurrences WHERE owner_id=? AND task_id=? LIMIT 1').get(owner, c.entityId)) throw new Error('Timing is already scheduled. Create a new task to change its duration without altering history.');
  const goalId = Object.hasOwn(p, 'goalId') ? p.goalId === null ? null : id(p.goalId) : old.goalId;
  if (goalId && !db.prepare('SELECT 1 FROM core_goals WHERE owner_id=? AND id=? AND archived=0').get(owner, goalId)) throw new Error('Goal not found or archived.');
  const priority = integer(p.priority ?? old.priority, 0, 10);
  const dependencies = p.dependencies ?? old.dependencies;
  if (!Array.isArray(dependencies) || dependencies.length > 100 || new Set(dependencies).size !== dependencies.length) throw new Error('Invalid prerequisites.');
  for (const dep of dependencies) {
    id(dep);
    if (dep === c.entityId) throw new Error('Dependency cycle.');
    if (!db.prepare('SELECT 1 FROM core_tasks WHERE owner_id=? AND id=?').get(owner, dep)) throw new Error('Prerequisite not found.');
    const seen = new Set<string>();
    const queue = [dep];
    while (queue.length) {
      const item = queue.pop()!;
      if (item === c.entityId) throw new Error('Dependency cycle.');
      if (seen.has(item)) continue; seen.add(item);
      queue.push(...readTaskDetails(db, owner, item).dependencies);
    }
  }
  if (creating) {
    db.prepare('INSERT INTO core_tasks VALUES (?,?,?,?,?,?,?,?,?,1)').run(owner, c.entityId, title, kind, duration, prep, travel, buffer, BASE_XP[kind as ActionKind]);
    db.prepare('INSERT INTO core_task_details(owner_id,task_id,goal_id,priority) VALUES (?,?,?,?)').run(owner, c.entityId, goalId, priority);
  } else {
    db.prepare('UPDATE core_tasks SET title=?,duration_minutes=?,prep_minutes=?,travel_minutes=?,buffer_minutes=?,revision=revision+1 WHERE owner_id=? AND id=?').run(title, duration, prep, travel, buffer, owner, c.entityId);
    db.prepare('UPDATE core_task_details SET goal_id=?,priority=? WHERE owner_id=? AND task_id=?').run(goalId, priority, owner, c.entityId);
  }
  db.prepare('DELETE FROM core_dependencies WHERE owner_id=? AND task_id=?').run(owner, c.entityId);
  for (const dep of dependencies) db.prepare('INSERT INTO core_dependencies VALUES (?,?,?)').run(owner, c.entityId, dep);
  return accepted(c.baseRevision + 1);
}
