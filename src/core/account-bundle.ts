import { createHash } from 'node:crypto';
import { CoreRepository } from './repository';
import { AccountStore, type GuideState } from './accounts';
import { canonical, id, instant, integer, keys, object, text, zone, number } from './validation';
import { BASE_XP, earnedXp, type ActionKind } from './xp';
import { courses } from './learning-content';
import { normalizeHealth } from './health-store';
import { buildRoutine } from './training';

export const MAX_BUNDLE_BYTES = 16 * 1024 * 1024;
// Only application-owned identifiers enter SQL. Uploaded column/table names never do.
const columns = {
  core_goals: ['id','title','why','archived','revision'],
  core_tasks: ['id','title','kind','duration_minutes','prep_minutes','travel_minutes','buffer_minutes','budget','revision'],
  core_task_details: ['task_id','goal_id','priority','archived'],
  core_dependencies: ['task_id','dependency_id'],
  core_occurrences: ['id','task_id','start_at','end_at','timezone','locked','fraction','revision'],
  core_operations: ['operation_id','request_hash','receipt_json'],
  core_schedule_batches: ['id','state_hash','proposal_json','status','revision','created_at'],
  core_batch_occurrences: ['batch_id','occurrence_id','accepted_revision'],
  core_cancelled_occurrences: ['occurrence_id'],
  core_xp_events: ['operation_id','occurrence_id','delta','revision'],
  core_outbox: ['operation_id','command_json'],
  core_health: ['id','kind','revision','archived','data_json'],
  core_learning: ['id','revision','checkpoints_json'],
} as const;
type Cell = string | number | null;
type Table = keyof typeof columns;
export interface AccountBundle { format: 'stoic-body-account'; version: 1; createdAt: string; profile: [number,string]; guide: GuideState; tables: Record<Table,Cell[][]> }
const tables = Object.keys(columns) as Table[];
const hash = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex');
export function bundleDigest(bundle: AccountBundle) { return hash({profile:bundle.profile,guide:bundle.guide,tables:bundle.tables}); }
export function captureBundle(repo: CoreRepository, accounts: AccountStore, owner: string): AccountBundle {
  const db=repo.database, row=db.prepare('SELECT profile_revision,answers_json FROM core_owners WHERE id=?').get(owner);
  if(!row) throw new Error('Account not found.');
  return {format:'stoic-body-account',version:1,createdAt:new Date().toISOString(),profile:[Number(row.profile_revision),String(row.answers_json)],guide:accounts.readGuide(owner).state,
    tables:Object.fromEntries(tables.map(table=>[table,db.prepare(`SELECT ${columns[table].join(',')} FROM ${table} WHERE owner_id=? ORDER BY rowid`).all(owner).map(r=>columns[table].map(c=>r[c] as Cell))])) as AccountBundle['tables']};
}
/** Caller owns the transaction. Credentials and other accounts are never replaced. */
export function installBundle(repo: CoreRepository, owner: string, bundle: AccountBundle) {
  const db=repo.database;
  if(!db.isTransaction) throw new Error('Restore requires a transaction.');
  for(const table of [...tables].reverse()) db.prepare(`DELETE FROM ${table} WHERE owner_id=?`).run(owner);
  db.prepare('UPDATE core_owners SET profile_revision=?,answers_json=? WHERE id=?').run(...bundle.profile,owner);
  for(const table of tables) {
    const insert=db.prepare(`INSERT INTO ${table}(owner_id,${columns[table].join(',')}) VALUES (${Array(columns[table].length+1).fill('?').join(',')})`);
    for(const row of bundle.tables[table]) insert.run(owner,...row);
  }
  db.prepare('UPDATE app_accounts SET guide_json=?,guide_revision=guide_revision+1 WHERE owner_id=?').run(JSON.stringify(bundle.guide),owner);
}
function jsonObject(v: unknown) { return object(JSON.parse(text(v,MAX_BUNDLE_BYTES))); }
function guide(v:unknown): GuideState {
  const g=object(v);keys(g,['stage','question','tourStep','tourDone']);
  if(!['welcome','questions','paused','ready'].includes(String(g.stage))||typeof g.tourDone!=='boolean') throw new Error('Invalid setup state.');
  integer(g.question,0,19);integer(g.tourStep,0,11);return g as unknown as GuideState;
}
export function validateBundle(input: unknown): AccountBundle {
  if(Buffer.byteLength(JSON.stringify(input)??'')>MAX_BUNDLE_BYTES) throw new Error('Backup exceeds 16 MiB.');
  canonical(input); const b=object(input);keys(b,['format','version','createdAt','profile','guide','tables']);
  if(b.format!=='stoic-body-account'||b.version!==1) throw new Error('Unsupported backup version.');
  instant(b.createdAt);guide(b.guide);
  if(!Array.isArray(b.profile)||b.profile.length!==2) throw new Error('Invalid profile.');
  integer(b.profile[0],0);const answers=jsonObject(b.profile[1]);
  const known=['goals','success','priorities','learning','deadlines','obligations','sleep','time','habits','age','height','units','weight','health','foodRelationship','bodyGoals','training','equipment','foodPreferences','dietInterest','tracking','devices','style'];
  keys(answers,known);
  for(const [question,value] of Object.entries(answers)) {
    const a=object(value); keys(a,['state','value','unit']);
    if(!['answered','unknown','skipped'].includes(String(a.state))) throw new Error('Invalid answer state.');
    if(a.state!=='answered') {keys(a,['state']);continue;}
    if(['age','height','weight'].includes(question)) {number(a.value,question==='age'?0:1,question==='age'?120:1000);if(question!=='age'&&!['lb','kg','in','cm'].includes(String(a.unit))) throw new Error('Missing measurement unit.');}
    else if(question==='units') {if(!['imperial','metric'].includes(String(a.value)))throw new Error('Invalid units.');}
    else if(Array.isArray(a.value)) {if(a.value.length>50)throw new Error('Too many answers.');a.value.forEach(v=>text(v,200));} else text(a.value,4000);
  }
  const raw=object(b.tables); keys(raw,tables);let count=0;
  for(const table of tables) {
    const rows=raw[table];if(!Array.isArray(rows))throw new Error('Missing backup records.');count+=rows.length;
    if(count>100000)throw new Error('Backup has too many records.');
    for(const row of rows) {
      if(!Array.isArray(row)||row.length!==columns[table].length||row.some(c=>c!==null&&typeof c!=='string'&&typeof c!=='number'))throw new Error('Invalid backup row.');
      columns[table].forEach((col,i)=>{const v=row[i];if(col==='id'||col.endsWith('_id')){if(v!==null)id(v);}if(col.includes('revision'))integer(v,1);if(col.endsWith('_json')){canonical(JSON.parse(text(v,MAX_BUNDLE_BYTES)));}if(col.endsWith('_hash')&&(typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v)))throw new Error('Invalid record hash.');});
    }
  }
  const bundle=structuredClone(input) as AccountBundle, sandbox=new CoreRepository(':memory:');
  try {
    const auth=new AccountStore(sandbox.database);void auth;sandbox.createOwner('validation');
    sandbox.database.exec('BEGIN IMMEDIATE');installBundle(sandbox,'validation',bundle);sandbox.database.exec('COMMIT');
    const s=sandbox.snapshot('validation'), taskMap=new Map(s.tasks.map(t=>[t.id,t]));
    if(bundle.tables.core_task_details.length!==s.tasks.length)throw new Error('Missing task details.');
    for(const g of s.goals){text(g.title);text(g.why,1000);}
    for(const t of s.tasks){text(t.title);integer(t.durationMinutes,1,1440);[t.prepMinutes,t.travelMinutes,t.bufferMinutes].forEach(v=>integer(v,0,1440));if(!Object.hasOwn(BASE_XP,t.kind)||t.budget!==BASE_XP[t.kind as ActionKind])throw new Error('Invalid XP budget.');}
    const done=new Set<string>(), visiting=new Set<string>();
    const visit=(key:string)=>{if(visiting.has(key))throw new Error('Dependency cycle.');if(done.has(key))return;visiting.add(key);for(const dep of taskMap.get(key)!.dependencies)visit(dep);visiting.delete(key);done.add(key);};s.tasks.forEach(t=>visit(t.id));
    const earned=new Map<string,number>();
    for(const e of s.xpEvents){integer(e.delta,-150,150);earned.set(e.occurrenceId,(earned.get(e.occurrenceId)??0)+e.delta);}
    for(const row of bundle.tables.core_occurrences) {
      const [oid,tid,start,end,tz,,fraction]=row,task=taskMap.get(String(tid))!;instant(start);instant(end);zone(tz);
      if(Date.parse(String(end))-Date.parse(String(start))!==task.durationMinutes*60000||(earned.get(String(oid))??0)!==earnedXp(task.budget,Number(fraction)))throw new Error('Invalid schedule or XP ledger.');
    }
    const slots=s.occurrences.map(o=>{const t=taskMap.get(o.taskId)!;return {start:Date.parse(o.startAt)-(t.prepMinutes+t.travelMinutes)*60000,end:Date.parse(o.endAt)+t.bufferMinutes*60000};}).sort((a,b)=>a.start-b.start);
    for(let i=1;i<slots.length;i++)if(slots[i].start<slots[i-1].end)throw new Error('Overlapping schedule.');
    for(const r of s.health){object(r.data);if(r.kind==='routine'){
      const expected=buildRoutine(r.data.input);if(!expected.eligible||canonical(expected)!==canonical(r.data))throw new Error('Routine requires regeneration in this app version.');
    }else normalizeHealth(sandbox.database,'validation',r.kind,r.data,true);}
    for(const e of s.learning){const c=courses.find(c=>c.id===e.id);if(!c)throw new Error('This course requires another app version.');keys(object(e.checkpoints),c.checkpoints.map(c=>c.id));if(Object.keys(e.checkpoints).length!==c.checkpoints.length)throw new Error('Missing checkpoints.');for(const p of Object.values(e.checkpoints)){keys(object(p),['completed','notes','taskId']);if(typeof p.completed!=='boolean'||typeof p.notes!=='string'||p.notes.length>4000||(p.taskId!==null&&!taskMap.has(p.taskId)))throw new Error('Invalid learning record.');}}
    for(const row of bundle.tables.core_operations){const receipt=jsonObject(row[2]);if(receipt.operationId!==row[0]||!['accepted','conflict','duplicate'].includes(String(receipt.status)))throw new Error('Invalid operation receipt.');integer(receipt.canonicalRevision,0);}
    for(const row of bundle.tables.core_outbox){const c=jsonObject(row[1]);if(c.operationId!==row[0]||c.schemaVersion!==1)throw new Error('Invalid operation.');const original=bundle.tables.core_operations.find(r=>r[0]===row[0]);if(original?.[1]!==hash(c))throw new Error('Operation integrity mismatch.');}
    for(const row of bundle.tables.core_schedule_batches){instant(row[5]);const p=jsonObject(row[2]);if(!Array.isArray(p.placements)||!Array.isArray(p.unplaced)||!Array.isArray(p.violations))throw new Error('Invalid schedule proposal.');zone(p.timezone);instant(p.horizonStart);instant(p.horizonEnd);for(const raw of p.placements){const x=object(raw);id(x.taskId);if(!taskMap.has(String(x.taskId)))throw new Error('Unknown scheduled task.');for(const k of ['startAt','endAt','occupiedStartAt','occupiedEndAt'])instant(x[k]);text(x.reason,4000);}}
    return bundle;
  } finally {sandbox.close();}
}
