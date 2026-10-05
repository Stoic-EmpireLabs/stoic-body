import {randomUUID,randomBytes} from 'node:crypto';
import {AccountStore,AccountError} from './accounts';
import {captureBundle,installBundle,validateBundle,bundleDigest,type AccountBundle} from './account-bundle';
import {CoreRepository,type Command} from './repository';
import {RecoveryStore} from './recovery';
import {object,keys,id,text} from './validation';
import {hash,transaction,wireOperation,prepareWire,type Exchange,type WireOperation} from './sync-protocol';
import {syncEndpoint,type SyncTransport} from './sync-transport';
type Link={endpoint:string;secret:string;deviceId:string;instanceId:string;remoteOwner:string;remoteName:string;epoch:string;generation:string;credential:string;previewId:string;state:string;lastSuccess:number|null;error:string|null};
type Candidate={previewId:string;inputHash:string;endpoint:string;code:string;name:string;secret:string;deviceId:string;credential:string;created:number};
type Preview={exchange:Exchange;fingerprint:string};
type Queued={operation_id:string;wire_json:string;state:string;reason:string|null};
const counts=(b:AccountBundle)=>({goals:b.tables.core_goals.length,tasks:b.tables.core_tasks.length,sessions:b.tables.core_occurrences.length,healthEntries:b.tables.core_health.length,courses:b.tables.core_learning.length});
const coreDigest=(b:AccountBundle)=>hash({profile:b.profile,tables:b.tables});
export class SyncClient {
 private runs=new Map<string,Promise<void>>();private controllers=new Set<AbortController>();private closed=false;private timer:ReturnType<typeof setInterval>|undefined;private retry=new Map<string,{at:number;delay:number}>();
 constructor(private repo:CoreRepository,private accounts:AccountStore,private recovery:RecoveryStore,private transport:SyncTransport,private instanceId:string,private allowTestLoopback=false){
  repo.database.exec(`CREATE TABLE IF NOT EXISTS app_sync_links(owner_id TEXT PRIMARY KEY REFERENCES core_owners(id),link_json TEXT NOT NULL) STRICT;
   CREATE TABLE IF NOT EXISTS app_sync_pairing(owner_id TEXT PRIMARY KEY REFERENCES core_owners(id),candidate_json TEXT NOT NULL,preview_json TEXT) STRICT;
   CREATE TABLE IF NOT EXISTS app_sync_queue(sequence INTEGER PRIMARY KEY AUTOINCREMENT,owner_id TEXT NOT NULL REFERENCES core_owners(id),operation_id TEXT NOT NULL,wire_json TEXT NOT NULL,state TEXT NOT NULL,reason TEXT,UNIQUE(owner_id,operation_id)) STRICT;`);
 }
 private credential(owner:string){const row=this.repo.database.prepare('SELECT password_hash FROM app_accounts WHERE owner_id=?').get(owner);if(!row)throw new AccountError(401,'Account unavailable.');return String(row.password_hash);}
 private link(owner:string):Link|undefined{const row=this.repo.database.prepare('SELECT link_json FROM app_sync_links WHERE owner_id=?').get(owner);return row?JSON.parse(String(row.link_json)):undefined;}
 private saveLink(owner:string,link:Link){this.repo.database.prepare('INSERT INTO app_sync_links VALUES (?,?) ON CONFLICT(owner_id) DO UPDATE SET link_json=excluded.link_json').run(owner,JSON.stringify(link));}
 private queue(owner:string):Queued[]{return this.repo.database.prepare('SELECT operation_id,wire_json,state,reason FROM app_sync_queue WHERE owner_id=? ORDER BY sequence').all(owner) as unknown as Queued[];}
 private fingerprint(owner:string){return hash({bundle:bundleDigest(captureBundle(this.repo,this.accounts,owner)),guideRevision:this.accounts.readGuide(owner).revision});}
 private current(owner:string,link:Link){const live=this.link(owner);return !this.closed&&live?.generation===link.generation&&link.credential===this.credential(owner);}
 private async request(endpoint:string,path:'claim'|'exchange',data:unknown,secret?:string){if(this.closed)throw new Error('Sync is closed.');const c=new AbortController();this.controllers.add(c);try{return await this.transport(endpoint,path,data,secret,c.signal);}finally{this.controllers.delete(c);}}
 private exchange(raw:unknown):Exchange {
  const r=object(raw);keys(r,['protocol','instanceId','account','epoch','fingerprint','bundle','results']);if(r.protocol!==1)throw new Error('Unsupported sync protocol.');id(r.instanceId);id(r.epoch);const a=object(r.account);keys(a,['id','username','displayName']);id(a.id);text(a.username,40);text(a.displayName,80);
  const bundle=validateBundle(r.bundle);if(bundleDigest(bundle)!==r.fingerprint)throw new Error('Incomplete sync snapshot.');if(!Array.isArray(r.results)||r.results.length>100)throw new Error('Invalid sync receipts.');
  for(const result of r.results){const x=object(result);keys(x,['operationId','status','reason']);id(x.operationId);if(!['accepted','duplicate','conflict','rejected'].includes(String(x.status)))throw new Error('Invalid sync result.');if(x.reason!==undefined)text(x.reason,4000);}
  return r as unknown as Exchange;
 }
 private candidate(owner:string){const row=this.repo.database.prepare('SELECT * FROM app_sync_pairing WHERE owner_id=?').get(owner);return row?{candidate:JSON.parse(String(row.candidate_json)) as Candidate,preview:row.preview_json?JSON.parse(String(row.preview_json)) as Preview:undefined}:undefined;}
 private canPair(owner:string){if(this.link(owner))throw new Error('Disconnect this device before pairing to another host.');if(this.queue(owner).length)throw new Error('Review retained changes before pairing again.');const host=this.repo.database.prepare("SELECT name FROM sqlite_master WHERE name='app_sync_devices'").get();if(host&&this.repo.database.prepare('SELECT 1 FROM app_sync_devices WHERE owner_id=? AND revoked=0').get(owner))throw new Error('This account is hosting other devices. Disconnect those devices before using another host.');}
 async previewLink(owner:string,input:unknown,guard=()=>{}){
  const p=object(input);keys(p,['endpoint','code','name']);const endpoint=syncEndpoint(p.endpoint,this.allowTestLoopback),code=text(p.code,64),name=text(p.name,60);if(!/^[a-f0-9]{64}$/.test(code))throw new Error('Paste the full pairing code from the host.');guard();this.canPair(owner);
  const inputHash=hash({endpoint,code,name}),previous=this.candidate(owner)?.candidate;
  const c:Candidate=previous?.inputHash===inputHash&&previous.credential===this.credential(owner)?previous:{previewId:randomUUID(),inputHash,endpoint,code,name,secret:randomBytes(32).toString('hex'),deviceId:randomUUID(),credential:this.credential(owner),created:Date.now()};
  this.repo.database.prepare('INSERT INTO app_sync_pairing VALUES (?,?,NULL) ON CONFLICT(owner_id) DO UPDATE SET candidate_json=excluded.candidate_json,preview_json=NULL').run(owner,JSON.stringify(c));
  const claim=object(await this.request(endpoint,'claim',{code,deviceId:c.deviceId,name,secret:c.secret}));guard();id(claim.instanceId);id(claim.epoch);if(claim.instanceId===this.instanceId)throw new Error('This is the same installation. Choose another computer as your host.');
  const response=this.exchange(await this.request(endpoint,'exchange',{protocol:1,epoch:claim.epoch,operations:[]},c.secret));guard();this.canPair(owner);
  if(this.candidate(owner)?.candidate.previewId!==c.previewId||this.credential(owner)!==c.credential)throw new Error('Pairing changed. Preview again.');if(response.instanceId!==claim.instanceId||response.epoch!==claim.epoch)throw new Error('Host identity changed.');
  const fingerprint=this.fingerprint(owner);this.repo.database.prepare('UPDATE app_sync_pairing SET preview_json=? WHERE owner_id=?').run(JSON.stringify({exchange:response,fingerprint}),owner);
  return {previewId:c.previewId,hostAccount:response.account,endpoint,incoming:counts(response.bundle),current:counts(captureBundle(this.repo,this.accounts,owner))};
 }
 async confirmLink(owner:string,input:unknown,guard=()=>{}){
  const p=object(input);keys(p,['previewId']);const previewId=id(p.previewId);guard();if(this.link(owner)?.previewId===previewId)return {linked:true,duplicate:true};this.canPair(owner);
  const pair=this.candidate(owner);if(!pair?.preview||pair.candidate.previewId!==previewId||Date.now()-pair.candidate.created>600000)throw new Error('Pairing preview expired. Preview again.');const {candidate:c,preview}=pair;
  const r=this.exchange(await this.request(c.endpoint,'exchange',{protocol:1,epoch:preview.exchange.epoch,operations:[]},c.secret));guard();
  return transaction(this.repo.database,()=>{this.canPair(owner);if(this.candidate(owner)?.candidate.previewId!==previewId||c.credential!==this.credential(owner)||this.fingerprint(owner)!==preview.fingerprint||r.fingerprint!==preview.exchange.fingerprint||r.instanceId!==preview.exchange.instanceId||r.account.id!==preview.exchange.account.id)throw new AccountError(409,'A workspace changed after the preview. Preview again before replacing data.');
   this.recovery.point(owner,'Before device pairing');installBundle(this.repo,owner,r.bundle,true);
   this.saveLink(owner,{endpoint:c.endpoint,secret:c.secret,deviceId:c.deviceId,instanceId:r.instanceId,remoteOwner:r.account.id,remoteName:r.account.displayName,epoch:r.epoch,generation:randomUUID(),credential:c.credential,previewId,state:'synced',lastSuccess:Date.now(),error:null});this.repo.database.prepare('DELETE FROM app_sync_pairing WHERE owner_id=?').run(owner);return {linked:true,duplicate:false};});
 }
 apply(owner:string,command:Command){return transaction(this.repo.database,()=>{
  id(object(command).operationId);
  const known=this.repo.database.prepare('SELECT 1 FROM core_operations WHERE owner_id=? AND operation_id=?').get(owner,command.operationId),receipt=this.repo.apply(owner,command);
  if(this.link(owner)&&!known&&receipt.status!=='conflict'){
   const wire=JSON.stringify(wireOperation(this.repo,owner,command));if(Buffer.byteLength(wire)>900000)throw new Error('This change is too large for device sync. Split it into smaller changes.');
   this.repo.database.prepare("INSERT INTO app_sync_queue(owner_id,operation_id,wire_json,state) VALUES (?,?,?,'queued')").run(owner,command.operationId,wire);
  }return receipt;
 });}
 status(owner:string){const link=this.link(owner),queue=this.queue(owner);return {linked:Boolean(link),state:link?.state??'local',endpoint:link?.endpoint??null,remoteName:link?.remoteName??null,lastSuccess:link?.lastSuccess??null,error:link?.error??null,queued:queue.filter(r=>r.state==='queued').length,conflicts:queue.filter(r=>r.state==='conflict').map(r=>({operationId:r.operation_id,reason:r.reason,command:JSON.parse(r.wire_json).command}))};}
 resolve(owner:string,input:unknown){const p=object(input);keys(p,['operationId']);const op=id(p.operationId);this.repo.database.prepare("DELETE FROM app_sync_queue WHERE owner_id=? AND operation_id=? AND state='conflict'").run(owner,op);}
 disconnect(owner:string){transaction(this.repo.database,()=>{this.repo.database.prepare('DELETE FROM app_sync_links WHERE owner_id=?').run(owner);this.repo.database.prepare('DELETE FROM app_sync_pairing WHERE owner_id=?').run(owner);this.repo.database.prepare("UPDATE app_sync_queue SET state='conflict',reason='Disconnected: this saved proposal has not been merged. Export a backup or copy its contents before dismissing.' WHERE owner_id=?").run(owner);});this.retry.delete(owner);}
 start(){if(this.timer||this.closed)return;const tick=()=>{for(const row of this.repo.database.prepare('SELECT owner_id FROM app_sync_links').all()){const owner=String(row.owner_id),retry=this.retry.get(owner);if(!retry||retry.at<=Date.now())void this.run(owner);}};this.timer=setInterval(tick,15000);this.timer.unref();tick();}
 run(owner:string):Promise<void>{const existing=this.runs.get(owner);if(existing)return existing;const promise=this.exchangePending(owner).finally(()=>this.runs.delete(owner));this.runs.set(owner,promise);return promise;}
 private async exchangePending(owner:string){
  const link=this.link(owner);if(!link||this.closed||link.state==='blocked')return;if(link.credential!==this.credential(owner)){this.disconnect(owner);return;}
  const pending=this.queue(owner).filter(r=>r.state==='queued'),batch:WireOperation[]=[];let bytes=0;
  for(const row of pending){const size=Buffer.byteLength(row.wire_json);if(batch.length===100||bytes+size>950000)break;bytes+=size;batch.push(JSON.parse(row.wire_json));}
  try{
   const r=this.exchange(await this.request(link.endpoint,'exchange',{protocol:1,epoch:link.epoch,operations:batch},link.secret));if(!this.current(owner,link))return;
   if(r.instanceId!==link.instanceId||r.account.id!==link.remoteOwner||r.epoch!==link.epoch)throw new AccountError(401,'Host identity changed. Pair again.');
   const wanted=new Set(batch.map(w=>w.command.operationId));if(r.results.length!==wanted.size||new Set(r.results.map(x=>x.operationId)).size!==wanted.size||r.results.some(x=>!wanted.has(x.operationId)))throw new Error('The host did not acknowledge the full sync batch.');
   transaction(this.repo.database,()=>{
    if(!this.current(owner,link))return;
    if(r.results.some(x=>x.status==='conflict'||x.status==='rejected'))this.recovery.point(owner,'Before sync conflict reconciliation');
    for(const result of r.results){if(result.status==='accepted'||result.status==='duplicate')this.repo.database.prepare('DELETE FROM app_sync_queue WHERE owner_id=? AND operation_id=?').run(owner,result.operationId);else this.repo.database.prepare("UPDATE app_sync_queue SET state='conflict',reason=? WHERE owner_id=? AND operation_id=?").run(result.reason??'Review this change against the host version.',owner,result.operationId);}
    if(coreDigest(captureBundle(this.repo,this.accounts,owner))!==coreDigest(r.bundle))installBundle(this.repo,owner,r.bundle,true);
    for(const row of this.queue(owner).filter(q=>q.state==='queued')){
     const db=this.repo.database;db.exec('SAVEPOINT rebase_command');try{const c=prepareWire(this.repo,owner,JSON.parse(row.wire_json)),receipt=this.repo.apply(owner,c,{enqueue:false});if(receipt.status==='conflict')throw new Error(receipt.safeReason??'A newer edit needs review.');db.exec('RELEASE rebase_command');}
     catch(e){db.exec('ROLLBACK TO rebase_command; RELEASE rebase_command');if(e&&typeof e==='object'&&'code' in e)throw e;db.prepare("UPDATE app_sync_queue SET state='conflict',reason=? WHERE owner_id=? AND operation_id=?").run(e instanceof Error?e.message:'Review this saved proposal.',owner,row.operation_id);}
    }
    this.saveLink(owner,{...link,state:'synced',lastSuccess:Date.now(),error:null});
   });this.retry.delete(owner);
  }catch(e){if(!this.current(owner,link))return;const blocked=e instanceof AccountError&&e.status===401,delay=Math.min(60000,(this.retry.get(owner)?.delay??7500)*2);this.retry.set(owner,{at:Date.now()+delay,delay});this.saveLink(owner,{...link,state:blocked?'blocked':'offline',error:blocked?'Device access changed. Disconnect and pair again.':'Host unavailable or sync could not finish. Local changes are saved; retry when the host app and private connection are available.'});}
 }
 async close(){this.closed=true;if(this.timer)clearInterval(this.timer);for(const c of this.controllers)c.abort();await Promise.allSettled(this.runs.values());}
}
