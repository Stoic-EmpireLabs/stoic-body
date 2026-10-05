import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {CoreRepository,type Command} from '../../src/core/repository';
import {AccountStore} from '../../src/core/accounts';
import {RecoveryStore} from '../../src/core/recovery';
import {SyncHub} from '../../src/core/sync-hub';
import {SyncClient} from '../../src/core/sync-client';
import {syncEndpoint,type SyncTransport} from '../../src/core/sync-transport';
import {richFixture} from './account-fixture';
const cmd=(type:string,entityId:string,payload:unknown,baseRevision=0):Command=>({schemaVersion:1,operationId:randomUUID(),deviceId:'local-browser',type,entityId,payload,baseRevision});
test('offline replicas survive restart, merge unique logs, deduplicate XP and retain conflicts in either order',async()=>{
 for(const reverse of [false,true]){
  const dir=mkdtempSync(join(tmpdir(),'stoic-sync-')),hubRepo=new CoreRepository(join(dir,'hub.sqlite')),auth=new AccountStore(hubRepo.database),owner=await richFixture(hubRepo,auth),hub=new SyncHub(hubRepo,auth);let online=true;
  const initial=hubRepo.snapshot(owner).occurrences[0];hubRepo.apply(owner,cmd('completion.set',initial.id,{fraction:0},initial.revision));
  const transport:SyncTransport=async(_endpoint,path,data,secret)=>{if(!online)throw new Error('Host offline');return path==='claim'?hub.claim(data):hub.exchange(secret!,data);};
  const replicas=[] as {repo:CoreRepository;client:SyncClient;owner:string;path:string}[];
  try{
   for(const name of ['laptop','tablet']){const path=join(dir,`${name}.sqlite`),repo=new CoreRepository(path),accounts=new AccountStore(repo.database),id=(await accounts.register({username:name,displayName:name,password:'synthetic long passphrase'})).account.id,client=new SyncClient(repo,accounts,new RecoveryStore(repo,accounts),transport,hub.instanceId+'-'+name);
    const preview=await client.previewLink(id,{endpoint:'https://example.ts.net',code:hub.issueCode(owner).code,name});await client.confirmLink(id,{previewId:preview.previewId});replicas.push({repo,client,owner:id,path});
   }
   online=false;
   for(const [index,r] of replicas.entries()){
    r.client.apply(r.owner,cmd('health.save',`water-${index}`,{kind:'water',data:{date:'2026-10-05',ml:500,notes:'Synthetic'}}));
    const occurrence=r.repo.snapshot(r.owner).occurrences[0];r.client.apply(r.owner,cmd('completion.set',occurrence.id,{fraction:1},occurrence.revision));
    r.client.apply(r.owner,cmd('goal.update','goal',{title:`Proposal ${index}`,why:'Saved offline'},1));
    await r.client.run(r.owner);assert.equal(r.client.status(r.owner).state,'offline');await r.client.close();r.repo.close();
    r.repo=new CoreRepository(r.path);const accounts=new AccountStore(r.repo.database);r.client=new SyncClient(r.repo,accounts,new RecoveryStore(r.repo,accounts),transport,hub.instanceId+'-restart');assert.equal(r.client.status(r.owner).queued,3);
   }
   online=true;const order=reverse?[...replicas].reverse():replicas;
   for(const r of order)await r.client.run(r.owner);for(const r of replicas)await r.client.run(r.owner);
   for(const r of replicas){assert.equal(r.repo.snapshot(r.owner).totalXp,25);assert.equal(r.repo.snapshot(r.owner).health.length,3);assert.equal(r.client.status(r.owner).queued,0);}
   assert.equal(order[1].client.status(order[1].owner).conflicts.length,1);assert.equal(order[1].client.status(order[1].owner).conflicts[0].command.payload.title,`Proposal ${reverse?0:1}`);
  }finally{for(const r of replicas){await r.client.close();r.repo.close();}hubRepo.close();rmSync(dir,{recursive:true,force:true});}
 }
});
test('edits during a slow response survive rebasing; disconnect invalidates an in-flight response',async()=>{
 const hubRepo=new CoreRepository(':memory:'),auth=new AccountStore(hubRepo.database),owner=await richFixture(hubRepo,auth),hub=new SyncHub(hubRepo,auth),repo=new CoreRepository(':memory:'),accounts=new AccountStore(repo.database),local=(await accounts.register({username:'local',displayName:'Local',password:'synthetic long passphrase'})).account.id;
 let wait=false,release=()=>{};
 const transport:SyncTransport=async(_endpoint,path,data,secret)=>{const result=path==='claim'?hub.claim(data):hub.exchange(secret!,data);if(wait)await new Promise<void>(resolve=>{release=resolve;});return result;};
 const recovery=new RecoveryStore(repo,accounts),client=new SyncClient(repo,accounts,recovery,transport,'separate-instance');
 try{
  const p=await client.previewLink(local,{endpoint:'https://test.ts.net',code:hub.issueCode(owner).code,name:'Laptop'});await client.confirmLink(local,{previewId:p.previewId});const guideRevision=accounts.readGuide(local).revision;
  repo.database.exec("CREATE TRIGGER fail_queue BEFORE INSERT ON app_sync_queue BEGIN SELECT RAISE(ABORT,'disk failure'); END;");assert.throws(()=>client.apply(local,cmd('goal.create','rollback',{title:'Must not persist',why:'Atomic queue'})));assert.equal(repo.snapshot(local).goals.length,1);repo.database.exec('DROP TRIGGER fail_queue');
  wait=true;const running=client.run(local);client.apply(local,cmd('goal.create','during-request',{title:'Saved while syncing',why:'Do not discard'}));release();await running;assert.equal(repo.snapshot(local).goals.length,2);assert.equal(client.status(local).queued,1);assert.equal(accounts.readGuide(local).revision,guideRevision);
  wait=false;await client.run(local);assert.equal(hubRepo.snapshot(owner).goals.length,2);
  wait=true;const stale=client.run(local);client.disconnect(local);client.apply(local,cmd('goal.create','after-disconnect',{title:'Keep local edit',why:'Private'}));release();await stale;assert.equal(repo.snapshot(local).goals.length,3);assert.equal(client.status(local).linked,false);
 }finally{await client.close();repo.close();hubRepo.close();}
});
test('pair preview detects either workspace changing; restore resets sync before a stale response can apply',async()=>{
 const h=new CoreRepository(':memory:'),ha=new AccountStore(h.database),ho=await richFixture(h,ha),hub=new SyncHub(h,ha),r=new CoreRepository(':memory:'),a=new AccountStore(r.database),owner=(await a.register({username:'local',displayName:'Local',password:'synthetic long passphrase'})).account.id,backup=new RecoveryStore(r,a);
 let wait=false,release=()=>{};const transport:SyncTransport=async(_e,path,data,secret)=>{const result=path==='claim'?hub.claim(data):hub.exchange(secret!,data);if(wait)await new Promise<void>(resolve=>release=resolve);return result;};const client=new SyncClient(r,a,backup,transport,'different');
 try{
  const input={endpoint:'https://test.ts.net',code:hub.issueCode(ho).code,name:'Laptop'},p=await client.previewLink(owner,input);r.apply(owner,cmd('goal.create','local-goal',{title:'Keep',why:'Local'}));await assert.rejects(client.confirmLink(owner,{previewId:p.previewId}),/changed/);
  const next=await client.previewLink(owner,input);h.apply(ho,cmd('goal.create','remote-goal',{title:'Changed',why:'Remote'}));await assert.rejects(client.confirmLink(owner,{previewId:next.previewId}),/changed/);
  const final=await client.previewLink(owner,input);await client.confirmLink(owner,{previewId:final.previewId});assert.equal((await client.confirmLink(owner,{previewId:final.previewId})).duplicate,true);
  const point=backup.list(owner)[0],preview=await backup.preview(owner,{pointId:point.id});wait=true;const running=client.run(owner);
  await backup.restore(owner,{source:{pointId:point.id},expectedFingerprint:preview.fingerprint,digest:preview.digest,operationId:'restore'},()=>{},()=>client.disconnect(owner));release();await running;
  assert.equal(client.status(owner).linked,false);assert.equal(r.snapshot(owner).goals[0].id,'local-goal');
 }finally{await client.close();r.close();h.close();}
});
test('private endpoints reject public HTTP, credentials, paths and redirects to arbitrary services',()=>{
 assert.equal(syncEndpoint('https://desktop.test.ts.net:8443/'),'https://desktop.test.ts.net:8443');
 for(const value of ['http://example.ts.net','https://example.com','https://a.ts.net/path','https://user:secret@a.ts.net','https://a.ts.net/?key=x','http://127.0.0.1:4330'])assert.throws(()=>syncEndpoint(value));
 assert.equal(syncEndpoint('http://127.0.0.1:4330',true),'http://127.0.0.1:4330');
});
