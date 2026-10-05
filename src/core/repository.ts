import { DatabaseSync } from 'node:sqlite';
import {migrateSchedules,createDayProposal,executeSchedule,assertSlot,readBatches,type ScheduleBatch,type DayInput} from './schedule-store';
import { createHash } from 'node:crypto';
import {object,keys,id,number,integer,text,canonical,instant,zone} from './validation';
import { migratePlanning, executePlanning, readGoals, readTaskDetails, type CoreGoal } from './planning-store';
import { earnedXp, type ActionKind } from './xp';
import { migrateHealth, executeHealth, readHealth, type HealthRecord } from './health-store';
import { buildRoutine } from './training';
import { validateSetup, readSetup } from './setup-schema';
import { buildLifePlan, validateTaskInstructions } from './life-plan';
import { migrateLearning, executeLearning, readLearning, type LearningEnrollment } from './learning-store';
export interface Command {
    schemaVersion: 1;
    operationId: string;
    deviceId: string;
    entityId: string;
    baseRevision: number;
    type: string;
    payload: unknown;
}
export interface Receipt {
    operationId: string;
    status: 'accepted' | 'duplicate' | 'conflict';
    canonicalRevision: number;
    safeReason?: string;
}
export interface Answer {
    state: 'answered' | 'unknown' | 'skipped';
    value?: string | number | string[];
    unit?: 'lb' | 'kg' | 'in' | 'cm';
}
export interface CoreTask {
    id: string;
    title: string;
    kind: ActionKind;
    durationMinutes: number;
    prepMinutes: number;
    travelMinutes: number;
    bufferMinutes: number;
    budget: number;
    revision: number;
    goalId: string | null;
    priority: number;
    dependencies: string[];
    archived: boolean;
    instructions?:{detail:string;reason:string;url?:string};
}
export interface CoreOccurrence {
    id: string;
    taskId: string;
    startAt: string;
    endAt: string;
    timezone: string;
    locked: number;
    fraction: number;
    revision: number;
}
export interface XpEvent {
    operationId: string;
    occurrenceId: string;
    delta: number;
    revision: number;
}
export interface Snapshot {
    learning: LearningEnrollment[];
    health: HealthRecord[];
    schemaVersion: 1;
    ownerId: string;
    profileRevision: number;
    answers: Record<string, Answer>;
    scheduleBatches: ScheduleBatch[];
    goals: CoreGoal[];
    tasks: CoreTask[];
    occurrences: CoreOccurrence[];
    xpEvents: XpEvent[];
    totalXp: number;
    pending: Command[];
}
const questionIds = new Set(['goals', 'success', 'priorities', 'learning', 'deadlines', 'obligations', 'sleep', 'time', 'habits', 'age', 'height', 'units', 'weight', 'health', 'foodRelationship', 'bodyGoals', 'training', 'equipment', 'foodPreferences', 'dietInterest', 'tracking', 'devices', 'style']);
/** Local transactional foundation. Owner IDs must come from trusted authentication before exposing an API. */
export class CoreRepository {
    readonly database: DatabaseSync;
    constructor(file: string) {
        this.database = new DatabaseSync(file);
        const db = this.database;
        db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA synchronous=FULL;');
        const version = (db.prepare('PRAGMA user_version').get() as {
            user_version: number;
        }).user_version;
        if (version > 5) {
            db.close();
            throw new Error('Database schema requires a newer application.');
        }
        if (version === 0) {
            db.exec('BEGIN IMMEDIATE');
            try {
                db.exec(`
    CREATE TABLE core_owners(id TEXT PRIMARY KEY,profile_revision INTEGER NOT NULL DEFAULT 0,answers_json TEXT NOT NULL DEFAULT '{}') STRICT;
    CREATE TABLE core_tasks(owner_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,kind TEXT NOT NULL,duration_minutes INTEGER NOT NULL CHECK(duration_minutes>0),prep_minutes INTEGER NOT NULL CHECK(prep_minutes>=0),travel_minutes INTEGER NOT NULL CHECK(travel_minutes>=0),buffer_minutes INTEGER NOT NULL CHECK(buffer_minutes>=0),budget INTEGER NOT NULL CHECK(budget BETWEEN 0 AND 150),revision INTEGER NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id) REFERENCES core_owners(id)) STRICT;
    CREATE TABLE core_occurrences(owner_id TEXT NOT NULL,id TEXT NOT NULL,task_id TEXT NOT NULL,start_at TEXT NOT NULL,end_at TEXT NOT NULL,timezone TEXT NOT NULL,locked INTEGER NOT NULL CHECK(locked IN (0,1)),fraction REAL NOT NULL DEFAULT 0 CHECK(fraction BETWEEN 0 AND 1),revision INTEGER NOT NULL,PRIMARY KEY(owner_id,id),FOREIGN KEY(owner_id,task_id) REFERENCES core_tasks(owner_id,id)) STRICT;
    CREATE TABLE core_operations(owner_id TEXT NOT NULL,operation_id TEXT NOT NULL,request_hash TEXT NOT NULL,receipt_json TEXT NOT NULL,PRIMARY KEY(owner_id,operation_id),FOREIGN KEY(owner_id) REFERENCES core_owners(id)) STRICT;
    CREATE TABLE core_xp_events(sequence INTEGER PRIMARY KEY AUTOINCREMENT,owner_id TEXT NOT NULL,operation_id TEXT NOT NULL,occurrence_id TEXT NOT NULL,delta INTEGER NOT NULL,revision INTEGER NOT NULL,UNIQUE(owner_id,operation_id),FOREIGN KEY(owner_id,occurrence_id) REFERENCES core_occurrences(owner_id,id)) STRICT;
    CREATE TABLE core_outbox(sequence INTEGER PRIMARY KEY AUTOINCREMENT,owner_id TEXT NOT NULL,operation_id TEXT NOT NULL,command_json TEXT NOT NULL,UNIQUE(owner_id,operation_id),FOREIGN KEY(owner_id,operation_id) REFERENCES core_operations(owner_id,operation_id)) STRICT;
    PRAGMA user_version=1;
   `);
                db.exec('COMMIT');
            }
            catch (error) {
                if (db.isTransaction) db.exec('ROLLBACK');
                db.close();
                throw error;
            }
        }
        migratePlanning(db);
        migrateSchedules(db);
        migrateHealth(db);
        migrateLearning(db);
    }
    close() { this.database.close(); }
    ownerCount() { return (this.database.prepare('SELECT COUNT(*) AS count FROM core_owners').get() as {
        count: number;
    }).count; }
    createOwner(ownerId: string) { this.database.prepare('INSERT INTO core_owners(id) VALUES (?)').run(id(ownerId)); }
    private owner(ownerId: string) { const owner = this.database.prepare('SELECT profile_revision,answers_json FROM core_owners WHERE id=?').get(id(ownerId)) as {
        profile_revision: number;
        answers_json: string;
    } | undefined; if (!owner)
        throw new Error('Owner not found.'); return owner; }
    apply(ownerId: string, command: Command, { enqueue = true }: {
        enqueue?: boolean;
    } = {}): Receipt {
        const c = object(command);
        keys(c, ['schemaVersion', 'operationId', 'deviceId', 'entityId', 'baseRevision', 'type', 'payload']);
        if (c.schemaVersion !== 1)
            throw new Error('Unsupported command version.');
        id(c.operationId);
        id(c.deviceId);
        id(c.entityId);
        integer(c.baseRevision, 0);
        object(c.payload);
        if (typeof c.type !== 'string' || !['setup.save', 'plan.accept', 'learning.enroll', 'learning.checkpoint', 'learning.practice', 'training.create', 'health.save', 'health.archive', 'task.create', 'task.update', 'task.archive', 'goal.create', 'goal.update', 'goal.archive', 'schedule.accept', 'schedule.undo', 'occurrence.move', 'occurrence.lock', 'occurrence.create', 'completion.set', 'profile.answer'].includes(c.type))
            throw new Error('Unsupported command.');
        const serialized = canonical(c);
        if (Buffer.byteLength(serialized, 'utf8') > 1_048_576) throw new Error('Command size exceeds 1 MiB.');
        const hash = createHash('sha256').update(serialized).digest('hex'), db = this.database;
        const ownTransaction = !db.isTransaction;
        if (ownTransaction) db.exec('BEGIN IMMEDIATE');
        try {
            this.owner(ownerId);
            const previous = db.prepare('SELECT request_hash,receipt_json FROM core_operations WHERE owner_id=? AND operation_id=?').get(ownerId, command.operationId) as {
                request_hash: string;
                receipt_json: string;
            } | undefined;
            if (previous) {
                if (previous.request_hash !== hash)
                    throw new Error('Operation identifier was already used for another command.');
                const r = JSON.parse(previous.receipt_json) as Receipt;
                if (ownTransaction) db.exec('COMMIT');
                return { ...r, status: r.status === 'conflict' ? 'conflict' : 'duplicate' };
            }
            const receipt = this.execute(ownerId, command);
            db.prepare('INSERT INTO core_operations VALUES (?,?,?,?)').run(ownerId, command.operationId, hash, JSON.stringify(receipt));
            if (enqueue && receipt.status !== 'conflict')
                db.prepare('INSERT INTO core_outbox(owner_id,operation_id,command_json) VALUES (?,?,?)').run(ownerId, command.operationId, JSON.stringify(command));
            if (ownTransaction) db.exec('COMMIT');
            return receipt;
        }
        catch (error) {
            if (ownTransaction && db.isTransaction) db.exec('ROLLBACK');
            throw error;
        }
    }
    private execute(ownerId: string, c: Command): Receipt {
        const p = object(c.payload), db = this.database;
        if(c.type==='plan.accept') {
            keys(p,['startDate','timezone','pace','fingerprint','notBefore']);const owner=this.owner(ownerId);
            const conflict:Receipt={operationId:c.operationId,status:'conflict',canonicalRevision:owner.profile_revision,safeReason:'Your profile or calendar changed. Generate a fresh plan preview.'};
            if(c.baseRevision!==owner.profile_revision)return conflict;
            const snapshot=this.readSnapshot(ownerId),plan=buildLifePlan({setup:readSetup(snapshot),snapshot,startDate:text(p.startDate,10),timezone:zone(p.timezone),pace:p.pace as 'normal'|'lighter',...(p.notBefore?{notBefore:text(p.notBefore,30)}:{})});
            if(plan.fingerprint!==p.fingerprint)return conflict;
            if(plan.missing.length||(!plan.placements.length&&!plan.blocks.length))throw new Error('Answer the missing questions or make time before using this plan.');
            const batchId='w'+plan.fingerprint.slice(0,15),created=plan.startDate+'T12:00:00.000Z';
            const nested=(type:string,entityId:string,payload:unknown)=>{const result=executePlanning(db,ownerId,{...c,type,entityId,baseRevision:0,payload});if(result?.status!=='accepted')throw new Error('This plan already exists. Refresh your schedule.');};
            for(const g of plan.goals)if(!snapshot.goals.some(existing=>existing.id===g.id))nested('goal.create',g.id,{title:g.title,why:g.why});
            for(const t of plan.tasks){nested('task.create',t.id,{title:t.title,kind:t.kind,durationMinutes:t.minutes,goalId:t.goalId,priority:t.priority,bufferMinutes:5});if(t.routine)db.prepare("INSERT INTO core_health VALUES (?,?,'routine',1,0,?)").run(ownerId,t.id,JSON.stringify({...t.routine,goalId:t.goalId,input:{...t.routine.input,goalId:t.goalId}}));}
            const placements=[...plan.placements];
            // Protect the union of sleep/family/fixed windows, excluding existing occupied time.
            const boundaries=[...new Set(plan.blocks.flatMap(b=>[Date.parse(b.startAt),Date.parse(b.endAt)]))].sort((a,b)=>a-b);
            let pi=0;
            for(let i=0;i<boundaries.length-1;i++){
                const start=boundaries[i],end=boundaries[i+1],labels=plan.blocks.filter(b=>Date.parse(b.startAt)<=start&&Date.parse(b.endAt)>=end).map(b=>b.title);if(!labels.length)continue;
                let segments=[[start,end]];
                for(const o of snapshot.occurrences){const t=snapshot.tasks.find(t=>t.id===o.taskId)!;const a=Date.parse(o.startAt)-(t.prepMinutes+t.travelMinutes)*60000,b=Date.parse(o.endAt)+t.bufferMinutes*60000;segments=segments.flatMap(([x,y])=>b<=x||a>=y?[[x,y]]:[[x,Math.max(x,a)],[Math.min(y,b),y]].filter(([l,r])=>r>l));}
                for(const [a,b]of segments)for(let from=a;from<b;from+=86400000){const to=Math.min(b,from+86400000),taskId=`${batchId}-p${pi++}`,startAt=new Date(from).toISOString(),endAt=new Date(to).toISOString();nested('task.create',taskId,{title:[...new Set(labels)].join(' / ').slice(0,160),kind:'protected',durationMinutes:(to-from)/60000});placements.push({taskId,startAt,endAt,occupiedStartAt:startAt,occupiedEndAt:endAt,reason:'Protected time from your setup.'});}
            }
            const proposal={policyVersion:1,timezone:plan.timezone,horizonStart:placements.reduce((v,p)=>p.startAt<v?p.startAt:v,placements[0].startAt),horizonEnd:placements.reduce((v,p)=>p.endAt>v?p.endAt:v,placements[0].endAt),placements,unplaced:plan.unplaced,violations:[],baseRevisions:{tasks:{},reserved:{}},taskInstructions:plan.tasks.map(t=>validateTaskInstructions({id:t.id,detail:t.detail,reason:t.reason,...(t.url?{url:t.url}:{})}))};
            db.prepare("INSERT INTO core_schedule_batches VALUES (?,?,?,?,'accepted',2,?)").run(ownerId,batchId,plan.fingerprint,JSON.stringify(proposal),created);
            for(const [i,p]of placements.entries()){const time=assertSlot(db,ownerId,p.taskId,p.startAt);db.prepare('INSERT INTO core_occurrences VALUES (?,?,?,?,?,?,0,0,1)').run(ownerId,`${batchId}-${i}`,p.taskId,time.startAt,time.endAt,plan.timezone);db.prepare('INSERT INTO core_batch_occurrences VALUES (?,?,?,1)').run(ownerId,batchId,`${batchId}-${i}`);}
            const answers=JSON.parse(owner.answers_json);answers.lifePlan={state:'answered',value:JSON.stringify({...plan,batchId})};
            db.prepare('UPDATE core_owners SET answers_json=?,profile_revision=profile_revision+1 WHERE id=?').run(JSON.stringify(answers),ownerId);
            return {operationId:c.operationId,status:'accepted',canonicalRevision:owner.profile_revision+1};
        }
        if (c.type === 'setup.save') {
            keys(p,['state']); const owner=this.owner(ownerId);
            if(c.baseRevision!==owner.profile_revision) return {operationId:c.operationId,status:'conflict',canonicalRevision:owner.profile_revision,safeReason:'Your answers changed. Reload before saving.'};
            const state=validateSetup(p.state),answers=JSON.parse(owner.answers_json);
            answers.setupV2={state:'answered',value:JSON.stringify(state)};
            db.prepare('UPDATE core_owners SET answers_json=?,profile_revision=profile_revision+1 WHERE id=?').run(JSON.stringify(answers),ownerId);
            return {operationId:c.operationId,status:'accepted',canonicalRevision:owner.profile_revision+1};
        }
        const learning = executeLearning(db, ownerId, c);
        if (learning) return learning;
        if (c.type === 'training.create') {
            const routine = buildRoutine(p);
            if (!routine.eligible) throw new Error(routine.reasons.join(' '));
            const receipt = executePlanning(db, ownerId, { ...c, type: 'task.create', payload: { title: routine.title, kind: routine.kind, durationMinutes: routine.minutes, goalId: routine.goalId, bufferMinutes: 5 } })!;
            if (receipt.status === 'accepted') db.prepare("INSERT INTO core_health VALUES (?,?,'routine',1,0,?)").run(ownerId, c.entityId, JSON.stringify(routine));
            return receipt;
        }
        const health = executeHealth(db, ownerId, c);
        if (health) return health;
        const accepted = (revision: number): Receipt => ({ operationId: c.operationId, status: 'accepted', canonicalRevision: revision });
        const conflict = (revision: number): Receipt => ({ operationId: c.operationId, status: 'conflict', canonicalRevision: revision, safeReason: 'This record changed. Review the current version before applying your edit.' });
        const schedule = executeSchedule(db, ownerId, c, () => this.readSnapshot(ownerId));
        if (schedule) return schedule;
        const planning = executePlanning(db, ownerId, c);
        if (planning) return planning;
        if (c.type === 'occurrence.create') {
            keys(p, ['taskId', 'startAt', 'timezone', 'locked']);
            const taskId = id(p.taskId);
            if (readTaskDetails(db, ownerId, taskId).archived) throw new Error('Task is archived. Restore it before scheduling.');
            const task = db.prepare('SELECT duration_minutes FROM core_tasks WHERE owner_id=? AND id=?').get(ownerId, taskId) as {
                duration_minutes: number;
            } | undefined;
            if (!task)
                throw new Error('Task not found.');
            const existing = db.prepare('SELECT revision FROM core_occurrences WHERE owner_id=? AND id=?').get(ownerId, c.entityId) as {
                revision: number;
            } | undefined;
            if (existing || c.baseRevision !== 0)
                return conflict(existing?.revision || 0);
            const start = instant(p.startAt), timezone = zone(p.timezone);
            if (typeof p.locked !== 'boolean')
                throw new Error('A lock choice is required.');
            const end = assertSlot(db, ownerId, taskId, start).endAt;
            db.prepare('INSERT INTO core_occurrences(owner_id,id,task_id,start_at,end_at,timezone,locked,fraction,revision) VALUES (?,?,?,?,?,?,?,0,1)').run(ownerId, c.entityId, taskId, start, end, timezone, Number(p.locked));
            return accepted(1);
        }
        if (c.type === 'completion.set') {
            keys(p, ['fraction']);
            if (db.prepare('SELECT 1 FROM core_cancelled_occurrences WHERE owner_id=? AND occurrence_id=?').get(ownerId, c.entityId)) throw new Error('Session was cancelled.');
            const fraction = number(p.fraction, 0, 1);
            const row = db.prepare('SELECT o.fraction,o.revision,t.budget FROM core_occurrences o JOIN core_tasks t ON t.owner_id=o.owner_id AND t.id=o.task_id WHERE o.owner_id=? AND o.id=?').get(ownerId, c.entityId) as {
                fraction: number;
                revision: number;
                budget: number;
            } | undefined;
            if (!row)
                throw new Error('Occurrence not found.');
            if (c.baseRevision > row.revision)
                return conflict(row.revision);
            if (row.fraction === fraction)
                return { ...accepted(row.revision), status: 'duplicate' };
            if (c.baseRevision !== row.revision)
                return conflict(row.revision);
            const next = row.revision + 1, delta = earnedXp(row.budget, fraction) - earnedXp(row.budget, row.fraction);
            db.prepare('UPDATE core_occurrences SET fraction=?,revision=? WHERE owner_id=? AND id=?').run(fraction, next, ownerId, c.entityId);
            if (delta !== 0)
                db.prepare('INSERT INTO core_xp_events(owner_id,operation_id,occurrence_id,delta,revision) VALUES (?,?,?,?,?)').run(ownerId, c.operationId, c.entityId, delta, next);
            return accepted(next);
        }
        keys(p, ['questionId', 'state', 'value']);
        const question = text(p.questionId, 40);
        if (!questionIds.has(question))
            throw new Error('Unknown onboarding question.');
        if (typeof p.state !== 'string' || !['answered', 'unknown', 'skipped'].includes(p.state))
            throw new Error('Unknown answer state.');
        if (c.entityId !== 'profile')
            throw new Error('Profile identifier required.');
        const owner = this.owner(ownerId);
        if (c.baseRevision !== owner.profile_revision)
            return conflict(owner.profile_revision);
        const answers = JSON.parse(owner.answers_json) as Record<string, Answer>;
        const answer: Answer = { state: p.state as Answer['state'] };
        if (p.state === 'answered') {
            if (question === 'units') {
                if (typeof p.value !== 'string' || !['metric', 'imperial'].includes(p.value))
                    throw new Error('Choose explicit units.');
                answer.value = String(p.value);
            }
            else if (['age', 'height', 'weight'].includes(question)) {
                if (question !== 'age' && answers.units?.state !== 'answered')
                    throw new Error('Confirm units before numerical body measurements.');
                answer.value = number(p.value, question === 'age' ? 0 : 1, question === 'age' ? 120 : 1000);
                if (question === 'weight')
                    answer.unit = answers.units.value === 'imperial' ? 'lb' : 'kg';
                if (question === 'height')
                    answer.unit = answers.units.value === 'imperial' ? 'in' : 'cm';
            }
            else if (Array.isArray(p.value)) {
                if (p.value.length > 50)
                    throw new Error('Too many answer items.');
                answer.value = p.value.map(v => text(v, 200));
            }
            else
                answer.value = text(p.value, 4000);
        }
        else if (Object.hasOwn(p, 'value'))
            throw new Error('Unknown or skipped answers cannot carry a value.');
        answers[question] = answer;
        db.prepare('UPDATE core_owners SET answers_json=?,profile_revision=profile_revision+1 WHERE id=?').run(JSON.stringify(answers), ownerId);
        return accepted(owner.profile_revision + 1);
    }
    proposeDay(ownerId: string, input: DayInput) {
        const db = this.database; db.exec('BEGIN IMMEDIATE');
        try { const result = createDayProposal(db, ownerId, this.readSnapshot(ownerId), input); db.exec('COMMIT'); return result; }
        catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); throw error; }
    }
    snapshot(ownerId: string): Snapshot {
        const ownTransaction = !this.database.isTransaction;
        if (ownTransaction) this.database.exec('BEGIN');
        try {
            const result = this.readSnapshot(ownerId);
            if (ownTransaction) this.database.exec('COMMIT');
            return result;
        } catch (error) {
            if (ownTransaction && this.database.isTransaction) this.database.exec('ROLLBACK');
            throw error;
        }
    }
    private readSnapshot(ownerId: string): Snapshot {
        const owner = this.owner(ownerId), db = this.database;
        const tasks = db.prepare('SELECT id,title,kind,duration_minutes AS durationMinutes,prep_minutes AS prepMinutes,travel_minutes AS travelMinutes,buffer_minutes AS bufferMinutes,budget,revision FROM core_tasks WHERE owner_id=? ORDER BY id').all(ownerId) as unknown as CoreTask[];
        for (const task of tasks) Object.assign(task, readTaskDetails(db, ownerId, task.id));
        const taskMap=new Map(tasks.map(t=>[t.id,t]));
        for(const row of db.prepare("SELECT proposal_json FROM core_schedule_batches WHERE owner_id=? AND status!='preview'").all(ownerId))for(const raw of JSON.parse(String(row.proposal_json)).taskInstructions||[]){const context=validateTaskInstructions(raw),task=taskMap.get(context.id);if(task)task.instructions={detail:context.detail,reason:context.reason,...(context.url?{url:context.url}:{})};}
        const occurrences = db.prepare('SELECT id,task_id AS taskId,start_at AS startAt,end_at AS endAt,timezone,locked,fraction,revision FROM core_occurrences o WHERE owner_id=? AND NOT EXISTS (SELECT 1 FROM core_cancelled_occurrences c WHERE c.owner_id=o.owner_id AND c.occurrence_id=o.id) ORDER BY start_at,id').all(ownerId) as unknown as CoreOccurrence[];
        const xpEvents = db.prepare('SELECT operation_id AS operationId,occurrence_id AS occurrenceId,delta,revision FROM core_xp_events WHERE owner_id=? ORDER BY sequence').all(ownerId) as unknown as XpEvent[];
        const pending = db.prepare('SELECT command_json FROM core_outbox WHERE owner_id=? ORDER BY sequence').all(ownerId).map(row => JSON.parse(String(row.command_json)) as Command);
        return { schemaVersion: 1, ownerId, health: readHealth(db, ownerId), learning: readLearning(db, ownerId), profileRevision: owner.profile_revision, answers: JSON.parse(owner.answers_json), scheduleBatches: readBatches(db, ownerId), goals: readGoals(db, ownerId), tasks, occurrences, xpEvents, totalXp: xpEvents.reduce((total, e) => total + e.delta, 0), pending };
    }
}
