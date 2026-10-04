import { randomUUID, createHash } from 'node:crypto';
import type { CoreRepository } from './repository';
import { AccountStore, AccountError } from './accounts';
import { captureBundle, installBundle, validateBundle, bundleDigest, type AccountBundle } from './account-bundle';
import { openBackup, sealBackup } from './backup-crypto';
import { object, keys, id, text, canonical } from './validation';
function counts(b:AccountBundle) {return {goals:b.tables.core_goals.length,tasks:b.tables.core_tasks.length,sessions:b.tables.core_occurrences.length,healthEntries:b.tables.core_health.length,courses:b.tables.core_learning.length,xp:b.tables.core_xp_events.reduce((n,r)=>n+Number(r[2]),0)};}
export class RecoveryStore {
 constructor(private repo:CoreRepository,private accounts:AccountStore,private now=()=>Date.now()) {
  repo.database.exec(`CREATE TABLE IF NOT EXISTS app_recovery_points(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES core_owners(id),created_at INTEGER NOT NULL,reason TEXT NOT NULL,bundle_json TEXT NOT NULL) STRICT;
   CREATE INDEX IF NOT EXISTS recovery_owner_time ON app_recovery_points(owner_id,created_at);
   CREATE TABLE IF NOT EXISTS app_restore_receipts(owner_id TEXT NOT NULL REFERENCES core_owners(id),operation_id TEXT NOT NULL,request_hash TEXT NOT NULL,PRIMARY KEY(owner_id,operation_id)) STRICT;`);
 }
 private current(owner:string) {return captureBundle(this.repo,this.accounts,owner);}
 private fingerprint(owner:string) {return createHash('sha256').update(canonical({bundle:bundleDigest(this.current(owner)),guideRevision:this.accounts.readGuide(owner).revision})).digest('hex');}
 private point(owner:string,reason:string) {
  const b=this.current(owner),db=this.repo.database;
  db.prepare('INSERT INTO app_recovery_points VALUES (?,?,?,?,?)').run(randomUUID(),owner,this.now(),reason,JSON.stringify(b));
  db.prepare('DELETE FROM app_recovery_points WHERE owner_id=? AND id NOT IN (SELECT id FROM app_recovery_points WHERE owner_id=? ORDER BY created_at DESC,rowid DESC LIMIT 7)').run(owner,owner);
 }
 captureBeforeEdit(owner:string) {
  const row=this.repo.database.prepare('SELECT MAX(created_at) AS time FROM app_recovery_points WHERE owner_id=?').get(owner);
  if(row?.time!==null&&row?.time!==undefined&&this.now()-Number(row.time)<3600000)return;
  this.point(owner,'Before edits');
 }
 list(owner:string) {return this.repo.database.prepare('SELECT id,created_at AS createdAt,reason FROM app_recovery_points WHERE owner_id=? ORDER BY created_at DESC,rowid DESC').all(owner) as unknown as {id:string;createdAt:number;reason:string}[];}
 async export(owner:string,passphrase:unknown) {return sealBackup(this.current(owner),passphrase);}
 private async read(owner:string,source:unknown,passphrase?:unknown):Promise<AccountBundle> {
  const s=object(source);keys(s,['pointId','file']);
  if(Object.hasOwn(s,'pointId')===Object.hasOwn(s,'file'))throw new Error('Choose one backup source.');
  if(s.pointId!==undefined){const r=this.repo.database.prepare('SELECT bundle_json FROM app_recovery_points WHERE owner_id=? AND id=?').get(owner,id(s.pointId));if(!r)throw new Error('Recovery point not found.');return validateBundle(JSON.parse(String(r.bundle_json)));}
  return openBackup(s.file,passphrase);
 }
 async preview(owner:string,source:unknown,passphrase?:unknown) {
  const b=await this.read(owner,source,passphrase);
  return {createdAt:b.createdAt,incoming:counts(b),current:counts(this.current(owner)),fingerprint:this.fingerprint(owner),digest:bundleDigest(b)};
 }
 async restore(owner:string,input:unknown,guard=()=>{}) {
  const p=object(input);keys(p,['source','passphrase','expectedFingerprint','digest','operationId']);id(p.operationId);text(p.expectedFingerprint,64);text(p.digest,64);
  const requestHash=createHash('sha256').update(canonical({fingerprint:p.expectedFingerprint,digest:p.digest})).digest('hex');
  const b=await this.read(owner,p.source,p.passphrase);guard();
  if(bundleDigest(b)!==p.digest)throw new AccountError(409,'Selected backup changed. Preview it again.');
  const db=this.repo.database;db.exec('BEGIN IMMEDIATE');
  try {
   const previous=db.prepare('SELECT request_hash FROM app_restore_receipts WHERE owner_id=? AND operation_id=?').get(owner,String(p.operationId));
   if(previous){if(previous.request_hash!==requestHash)throw new AccountError(409,'Restore identifier was already used.');db.exec('COMMIT');return {duplicate:true};}
   if(this.fingerprint(owner)!==p.expectedFingerprint)throw new AccountError(409,'Your workspace changed after the preview. Preview again before restoring.');
   this.point(owner,'Before restore');installBundle(this.repo,owner,b);
   db.prepare('INSERT INTO app_restore_receipts VALUES (?,?,?)').run(owner,String(p.operationId),requestHash);
   db.exec('COMMIT');return {duplicate:false};
  }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
 }
}
