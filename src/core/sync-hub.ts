import {randomBytes,randomUUID} from 'node:crypto';
import type {CoreRepository} from './repository';
import {AccountStore,AccountError} from './accounts';
import {captureBundle,bundleDigest,MAX_BUNDLE_BYTES} from './account-bundle';
import {object,keys,id,text,canonical} from './validation';
import {hash,tokenHash,transaction,prepareWire,type Exchange,type SyncResult} from './sync-protocol';
export class SyncHub {
 readonly instanceId:string;
 constructor(private repo:CoreRepository,private accounts:AccountStore,private now=()=>Date.now()){
  const db=repo.database;db.exec(`CREATE TABLE IF NOT EXISTS app_sync_meta(id INTEGER PRIMARY KEY CHECK(id=1),instance_id TEXT NOT NULL) STRICT;
   CREATE TABLE IF NOT EXISTS app_sync_hosts(owner_id TEXT PRIMARY KEY REFERENCES core_owners(id),epoch TEXT NOT NULL) STRICT;
   CREATE TABLE IF NOT EXISTS app_sync_codes(code_hash TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES core_owners(id),expires INTEGER NOT NULL,device_id TEXT,secret_hash TEXT) STRICT;
   CREATE TABLE IF NOT EXISTS app_sync_devices(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES core_owners(id),name TEXT NOT NULL,secret_hash TEXT UNIQUE NOT NULL,credential TEXT NOT NULL,epoch TEXT NOT NULL,revoked INTEGER NOT NULL DEFAULT 0) STRICT;
   CREATE TABLE IF NOT EXISTS app_sync_results(owner_id TEXT NOT NULL REFERENCES core_owners(id),operation_id TEXT NOT NULL,request_hash TEXT NOT NULL,result_json TEXT NOT NULL,PRIMARY KEY(owner_id,operation_id)) STRICT;`);
  db.prepare('INSERT OR IGNORE INTO app_sync_meta VALUES (1,?)').run(randomUUID());this.instanceId=String(db.prepare('SELECT instance_id FROM app_sync_meta WHERE id=1').get()!.instance_id);
 }
 private credential(owner:string){const r=this.repo.database.prepare('SELECT password_hash FROM app_accounts WHERE owner_id=?').get(owner);if(!r)throw new AccountError(401,'Account is unavailable.');return String(r.password_hash);}
 private requireHost(owner:string){const db=this.repo.database;if(db.prepare("SELECT 1 FROM sqlite_master WHERE name='app_sync_links'").get()&&db.prepare('SELECT 1 FROM app_sync_links WHERE owner_id=?').get(owner))throw new AccountError(409,'This account uses another host. Create the pairing code on that host.');}
 private epoch(owner:string){const db=this.repo.database;db.prepare('INSERT OR IGNORE INTO app_sync_hosts VALUES (?,?)').run(owner,randomUUID());return String(db.prepare('SELECT epoch FROM app_sync_hosts WHERE owner_id=?').get(owner)!.epoch);}
 issueCode(owner:string){this.credential(owner);this.requireHost(owner);const db=this.repo.database;db.prepare('DELETE FROM app_sync_codes WHERE expires<? OR owner_id=?').run(this.now(),owner);const code=randomBytes(32).toString('hex');db.prepare('INSERT INTO app_sync_codes VALUES (?,?,?,NULL,NULL)').run(tokenHash(code),owner,this.now()+600000);return {code,expiresAt:this.now()+600000,instanceId:this.instanceId};}
 claim(input:unknown){
  const p=object(input);keys(p,['code','deviceId','name','secret']);const deviceId=id(p.deviceId),name=text(p.name,60),secret=tokenHash(p.secret),code=tokenHash(p.code),db=this.repo.database;
  return transaction(db,()=>{const c=db.prepare('SELECT * FROM app_sync_codes WHERE code_hash=?').get(code);if(!c||Number(c.expires)<this.now())throw new AccountError(401,'Pairing code expired or unavailable.');
   const owner=String(c.owner_id),epoch=this.epoch(owner);this.requireHost(owner);
   if(c.device_id){if(c.device_id!==deviceId||c.secret_hash!==secret)throw new AccountError(401,'Pairing code was already used.');this.authenticate(String(p.secret));return {instanceId:this.instanceId,epoch};}
   db.prepare('INSERT INTO app_sync_devices VALUES (?,?,?,?,?,?,0)').run(deviceId,owner,name,secret,this.credential(owner),epoch);
   db.prepare('UPDATE app_sync_codes SET device_id=?,secret_hash=? WHERE code_hash=?').run(deviceId,secret,code);return {instanceId:this.instanceId,epoch};
  });
 }
 authenticate(secret:string){let hashed;try{hashed=tokenHash(secret);}catch{throw new AccountError(401,'Device authorization is unavailable.');}const r=this.repo.database.prepare('SELECT * FROM app_sync_devices WHERE secret_hash=? AND revoked=0').get(hashed);
  if(!r||r.credential!==this.credential(String(r.owner_id))||r.epoch!==this.epoch(String(r.owner_id)))throw new AccountError(401,'This device was disconnected or the account credentials changed. Pair again.');return {owner:String(r.owner_id),deviceId:String(r.id),epoch:String(r.epoch)};
 }
 devices(owner:string){return this.repo.database.prepare('SELECT id,name,revoked FROM app_sync_devices WHERE owner_id=? ORDER BY rowid DESC').all(owner);}
 revoke(owner:string,deviceId:string){this.repo.database.prepare('UPDATE app_sync_devices SET revoked=1 WHERE owner_id=? AND id=?').run(owner,id(deviceId));}
 reset(owner:string){const db=this.repo.database;db.prepare('UPDATE app_sync_hosts SET epoch=? WHERE owner_id=?').run(randomUUID(),owner);db.prepare('UPDATE app_sync_devices SET revoked=1 WHERE owner_id=?').run(owner);db.prepare('DELETE FROM app_sync_codes WHERE owner_id=?').run(owner);}
 exchange(secret:string,input:unknown):Exchange {
  const p=object(input);keys(p,['protocol','epoch','operations']);if(p.protocol!==1||!Array.isArray(p.operations)||p.operations.length>100||Buffer.byteLength(canonical(p))>1048576)throw new Error('Unsupported or oversized sync request.');
  const operations=p.operations;const db=this.repo.database;return transaction(db,()=>{
   const grant=this.authenticate(secret);if(p.epoch!==grant.epoch)throw new AccountError(401,'Sync generation changed. Pair again.');const results:SyncResult[]=[];
   for(const wire of operations){const operationId=id(object(object(wire).command).operationId),requestHash=hash(wire),previous=db.prepare('SELECT * FROM app_sync_results WHERE owner_id=? AND operation_id=?').get(grant.owner,operationId);
    if(previous){if(previous.request_hash!==requestHash)throw new AccountError(409,'An operation identifier was reused with different contents.');results.push(JSON.parse(String(previous.result_json)));continue;}
    let result:SyncResult;db.exec('SAVEPOINT sync_command');
    try{const c=prepareWire(this.repo,grant.owner,wire),r=this.repo.apply(grant.owner,c,{enqueue:false});result={operationId,status:r.status,...(r.safeReason?{reason:r.safeReason}:{})};db.exec('RELEASE sync_command');}
    catch(error){db.exec('ROLLBACK TO sync_command; RELEASE sync_command');if(error&&typeof error==='object'&&'code' in error)throw error;result={operationId,status:'rejected',reason:error instanceof Error?error.message:'Review this change before trying again.'};}
    db.prepare('INSERT INTO app_sync_results VALUES (?,?,?,?)').run(grant.owner,operationId,requestHash,JSON.stringify(result));results.push(result);
   }
   const bundle=captureBundle(this.repo,this.accounts,grant.owner);if(Buffer.byteLength(JSON.stringify(bundle))>MAX_BUNDLE_BYTES)throw new Error('This account exceeds the current 16 MiB sync limit.');
   const a=db.prepare('SELECT owner_id,username,display_name FROM app_accounts WHERE owner_id=?').get(grant.owner)!;
   return {protocol:1,instanceId:this.instanceId,epoch:grant.epoch,account:{id:String(a.owner_id),username:String(a.username),displayName:String(a.display_name)},fingerprint:bundleDigest(bundle),bundle,results};
  });
 }
}
