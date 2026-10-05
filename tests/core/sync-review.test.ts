import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {CoreRepository,type Command} from '../../src/core/repository';
import {AccountStore} from '../../src/core/accounts';
import {RecoveryStore} from '../../src/core/recovery';
import {SyncHub} from '../../src/core/sync-hub';
import {SyncClient} from '../../src/core/sync-client';
import type {SyncTransport} from '../../src/core/sync-transport';
import type {Exchange} from '../../src/core/sync-protocol';
const command=(type:string,entityId:string,payload:unknown,baseRevision=0):Command=>({schemaVersion:1,operationId:randomUUID(),deviceId:'review',type,entityId,payload,baseRevision});
async function fixture(run:(f:{hub:CoreRepository;remote:string;repo:CoreRepository;owner:string;client:SyncClient;auth:AccountStore;recoveryKey:string;delay:()=>void;release:()=>void;lose:()=>void;substitute:()=>void})=>Promise<void>){
 const hub=new CoreRepository(':memory:'),ha=new AccountStore(hub.database),remote=(await ha.register({username:'host',displayName:'Host',password:'synthetic long passphrase'})).account.id,h=new SyncHub(hub,ha),repo=new CoreRepository(':memory:'),auth=new AccountStore(repo.database),a=await auth.register({username:'local',displayName:'Local',password:'synthetic long passphrase'}),owner=a.account.id;
 hub.apply(remote,command('task.create','practice',{title:'Retained practice',kind:'focus',durationMinutes:30}));
 let delaying=false,release=()=>{},lose=false,substitute=false;
 const transport:SyncTransport=async(_e,path,data,secret)=>{const r=path==='claim'?h.claim(data):h.exchange(secret!,data);if(delaying)await new Promise<void>(done=>release=done);if(lose){lose=false;throw new Error('Lost response');}if(substitute&&'account' in r)(r as Exchange).account.id='other-account';return r;};
 const client=new SyncClient(repo,auth,new RecoveryStore(repo,auth),transport,'replica');
 try{
  const input={endpoint:'https://host.test.ts.net',code:h.issueCode(remote).code,name:'Laptop'};lose=true;await assert.rejects(client.previewLink(owner,input));const p=await client.previewLink(owner,input);assert.equal(h.devices(remote).length,1);await client.confirmLink(owner,{previewId:p.previewId});
  await run({hub,remote,repo,owner,client,auth,recoveryKey:a.recoveryKey,delay:()=>{delaying=true;},release:()=>{delaying=false;release();},lose:()=>{lose=true;},substitute:()=>{substitute=true;}});
 }finally{await client.close();repo.close();hub.close();}
}
const day={date:'2026-10-07',timezone:'America/Denver',startTime:'08:00',endTime:'10:00'};
test('idle sync preserves previews created before and during the request; stale scheduling state still conflicts',async()=>fixture(async f=>{
 const before=f.repo.proposeDay(f.owner,day);await f.client.run(f.owner);assert.ok(f.repo.database.prepare('SELECT 1 FROM core_schedule_batches WHERE id=?').get(before.proposalId),'idle sync must retain a local preview');
 assert.equal(f.client.apply(f.owner,command('schedule.accept',before.proposalId,{},1)).status,'accepted');await f.client.run(f.owner);
 f.hub.apply(f.remote,command('task.create','second',{title:'Second practice',kind:'focus',durationMinutes:20}));await f.client.run(f.owner);
 f.delay();const running=f.client.run(f.owner),during=f.repo.proposeDay(f.owner,day);f.release();await running;assert.ok(f.repo.database.prepare('SELECT 1 FROM core_schedule_batches WHERE id=?').get(during.proposalId));
 f.hub.apply(f.remote,command('goal.create','new-goal',{title:'Changed scheduling context',why:'Review'}));await f.client.run(f.owner);
 assert.ok(f.repo.database.prepare('SELECT 1 FROM core_schedule_batches WHERE id=?').get(during.proposalId));assert.equal(f.client.apply(f.owner,command('schedule.accept',during.proposalId,{},1)).status,'conflict');
}));
test('a conflicted schedule exposes original task names, times and timezone; dismissal leaves other proposals',async()=>fixture(async f=>{
 const p=f.repo.proposeDay(f.owner,day);f.client.apply(f.owner,command('schedule.accept',p.proposalId,{},1));
 f.hub.apply(f.remote,command('goal.create','collision',{title:'Host goal',why:'Host'}));f.client.apply(f.owner,command('goal.create','collision',{title:'Local goal',why:'Keep'}));await f.client.run(f.owner);
 const conflicts=f.client.status(f.owner).conflicts;assert.equal(conflicts.length,2);const schedule=conflicts.find(c=>c.command.type==='schedule.accept')!;
 assert.equal(schedule.details.schedule!.timezone,day.timezone);assert.equal(schedule.details.schedule!.placements[0].title,'Retained practice');assert.equal(schedule.details.schedule!.placements[0].startAt,p.proposal.placements[0].startAt);assert.equal(f.repo.snapshot(f.owner).occurrences.length,0);
 f.client.resolve(f.owner,{operationId:schedule.operationId});assert.equal(f.client.status(f.owner).conflicts.length,1);assert.equal(f.client.status(f.owner).conflicts[0].command.type,'goal.create');
}));
test('lost completion response replays once; substituted owner is blocked without replacing local records',async()=>fixture(async f=>{
 f.client.apply(f.owner,command('occurrence.create','session',{taskId:'practice',startAt:'2026-10-07T14:00:00.000Z',timezone:'America/Denver',locked:false}));await f.client.run(f.owner);
 f.client.apply(f.owner,command('completion.set','session',{fraction:1},1));f.lose();await f.client.run(f.owner);assert.equal(f.client.status(f.owner).queued,1);await f.client.run(f.owner);assert.equal(f.client.status(f.owner).queued,0);assert.equal(f.repo.snapshot(f.owner).totalXp,15);assert.equal(f.hub.snapshot(f.remote).xpEvents.length,1);
 f.substitute();f.hub.apply(f.remote,command('goal.create','not-imported',{title:'Must not import',why:'Identity'}));await f.client.run(f.owner);assert.equal(f.client.status(f.owner).state,'blocked');assert.equal(f.repo.snapshot(f.owner).goals.length,0);
}));
test('local password recovery invalidates an in-flight response and its device link',async()=>fixture(async f=>{
 f.delay();const running=f.client.run(f.owner);await f.auth.recover({username:'local',recoveryKey:f.recoveryKey,password:'replacement long passphrase'});f.client.disconnect(f.owner);f.repo.apply(f.owner,command('goal.create','recovered',{title:'After recovery',why:'Keep'}));f.release();await running;
 assert.equal(f.client.status(f.owner).linked,false);assert.equal(f.repo.snapshot(f.owner).goals[0].id,'recovered');
}));
