import type { DatabaseSync } from 'node:sqlite';
import type { Command, Receipt } from './repository';
import { courses } from './learning-content';
import { executePlanning } from './planning-store';
import { object, keys, id, integer } from './validation';
export interface LearningCheckpoint { completed: boolean; notes: string; taskId: string | null }
export interface LearningEnrollment { id: string; revision: number; checkpoints: Record<string, LearningCheckpoint> }
export function migrateLearning(db: DatabaseSync) {
  if (Number(db.prepare('PRAGMA user_version').get()?.user_version) >= 5) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('CREATE TABLE core_learning(owner_id TEXT NOT NULL,id TEXT NOT NULL,revision INTEGER NOT NULL,checkpoints_json TEXT NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id) REFERENCES core_owners(id)) STRICT; PRAGMA user_version=5;');
    db.exec('COMMIT');
  } catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); throw error; }
}
export function readLearning(db: DatabaseSync, owner: string): LearningEnrollment[] {
  return db.prepare('SELECT id,revision,checkpoints_json FROM core_learning WHERE owner_id=? ORDER BY id').all(owner).map(r => ({ id: String(r.id), revision: Number(r.revision), checkpoints: JSON.parse(String(r.checkpoints_json)) }));
}
export function executeLearning(db: DatabaseSync, owner: string, c: Command): Receipt | undefined {
  if (!['learning.enroll', 'learning.checkpoint', 'learning.practice'].includes(c.type)) return;
  const course = courses.find(course => course.id === c.entityId); if (!course) throw new Error('Choose a listed course.');
  const p = object(c.payload), existing = readLearning(db, owner).find(e => e.id === c.entityId);
  const receipt = (status: Receipt['status'], revision: number): Receipt => ({ operationId: c.operationId, status, canonicalRevision: revision, ...(status === 'conflict' ? { safeReason: 'Learning progress changed. Review the current version and retry.' } : {}) });
  if (c.type === 'learning.enroll') {
    keys(p, []);
    if (existing || c.baseRevision !== 0) return receipt('conflict', existing?.revision ?? 0);
    const checkpoints = Object.fromEntries(course.checkpoints.map(s => [s.id, { completed: false, notes: '', taskId: null }]));
    db.prepare('INSERT INTO core_learning VALUES (?,?,1,?)').run(owner, c.entityId, JSON.stringify(checkpoints)); return receipt('accepted', 1);
  }
  if (!existing) throw new Error('Enroll before saving progress.');
  if (existing.revision !== c.baseRevision) return receipt('conflict', existing.revision);
  const checkpointId = id(p.checkpointId), checkpoint = course.checkpoints.find(s => s.id === checkpointId);
  if (!checkpoint) throw new Error('Choose a listed checkpoint.');
  const state = existing.checkpoints[checkpointId];
  if (c.type === 'learning.checkpoint') {
    keys(p, ['checkpointId', 'completed', 'notes']);
    if (typeof p.completed !== 'boolean' || typeof p.notes !== 'string' || p.notes.length > 4000) throw new Error('Use a completion choice and notes up to 4000 characters.');
    if (state.completed === p.completed && state.notes === p.notes.trim()) return receipt('duplicate', existing.revision);
    state.completed = p.completed; state.notes = p.notes.trim();
  } else {
    keys(p, ['checkpointId', 'minutes', 'goalId']);
    const minutes = integer(p.minutes, 10, 120), goalId = p.goalId === null || p.goalId === undefined ? null : id(p.goalId);
    if (state.taskId) return receipt('duplicate', existing.revision);
    const taskId = id(`learn-${course.id}-${checkpoint.id}`);
    const result = executePlanning(db, owner, { ...c, entityId: taskId, type: 'task.create', baseRevision: 0, payload: { title: `${course.title}: ${checkpoint.title}`, kind: 'focus', durationMinutes: minutes, bufferMinutes: 5, goalId } })!;
    if (result.status !== 'accepted') throw new Error('A task with this learning identifier already exists. Review it in Goals.');
    state.taskId = taskId;
  }
  db.prepare('UPDATE core_learning SET revision=revision+1,checkpoints_json=? WHERE owner_id=? AND id=?').run(JSON.stringify(existing.checkpoints), owner, c.entityId);
  return receipt('accepted', existing.revision + 1);
}
