import type {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {canonical,keys,object,id,instant,zone,text} from './validation';
import type {Command,CoreRepository} from './repository';
import type {AccountBundle} from './account-bundle';
export type SyncResult={operationId:string;status:'accepted'|'duplicate'|'conflict'|'rejected';reason?:string};
export interface WireOperation {command:Command;preview?:{id:string;stateHash:string;proposal:unknown;createdAt:string}}
export interface Exchange {protocol:1;instanceId:string;account:{id:string;username:string;displayName:string};epoch:string;fingerprint:string;bundle:AccountBundle;results:SyncResult[]}
export function hash(value:unknown){return createHash('sha256').update(canonical(value)).digest('hex');}
export function tokenHash(value:unknown){if(typeof value!=='string'||!/^[a-f0-9]{64}$/.test(value))throw new Error('Invalid device secret.');return createHash('sha256').update(value).digest('hex');}
export function transaction<T>(db:DatabaseSync,fn:()=>T):T {const own=!db.isTransaction;if(own)db.exec('BEGIN IMMEDIATE');try{const result=fn();if(own)db.exec('COMMIT');return result;}catch(e){if(own&&db.isTransaction)db.exec('ROLLBACK');throw e;}}
export function wireOperation(repo:CoreRepository,owner:string,command:Command):WireOperation {
 if(command.type!=='schedule.accept')return {command};
 const r=repo.database.prepare('SELECT * FROM core_schedule_batches WHERE owner_id=? AND id=?').get(owner,command.entityId);
 if(!r)throw new Error('The original schedule preview is unavailable.');
 return {command,preview:{id:String(r.id),stateHash:String(r.state_hash),proposal:JSON.parse(String(r.proposal_json)),createdAt:String(r.created_at)}};
}
export function prepareWire(repo:CoreRepository,owner:string,input:unknown):Command {
 const w=object(input);keys(w,['command','preview']);const c=object(w.command);id(c.operationId);
 if(w.preview!==undefined){
  if(c.type!=='schedule.accept')throw new Error('Unexpected schedule metadata.');
  const p=object(w.preview);keys(p,['id','stateHash','proposal','createdAt']);id(p.id);if(p.id!==c.entityId||typeof p.stateHash!=='string'||!/^[a-f0-9]{64}$/.test(p.stateHash))throw new Error('Invalid schedule identity.');instant(p.createdAt);
  const proposal=object(p.proposal);zone(proposal.timezone);instant(proposal.horizonStart);instant(proposal.horizonEnd);
  if(proposal.policyVersion!==1||!Array.isArray(proposal.placements)||proposal.placements.length>1000||!Array.isArray(proposal.violations)||!Array.isArray(proposal.unplaced))throw new Error('Invalid schedule metadata.');
  for(const raw of proposal.placements){const item=object(raw);id(item.taskId);for(const k of ['startAt','endAt','occupiedStartAt','occupiedEndAt'])instant(item[k]);text(item.reason,4000);}
  const db=repo.database,existing=db.prepare('SELECT state_hash,proposal_json FROM core_schedule_batches WHERE owner_id=? AND id=?').get(owner,String(p.id));
  if(existing){if(existing.state_hash!==p.stateHash||canonical(JSON.parse(String(existing.proposal_json)))!==canonical(proposal))throw new Error('Schedule metadata changed.');}
  else db.prepare("INSERT INTO core_schedule_batches VALUES (?,?,?,?,'preview',1,?)").run(owner,String(p.id),String(p.stateHash),JSON.stringify(proposal),String(p.createdAt));
 }
 return c as unknown as Command;
}
