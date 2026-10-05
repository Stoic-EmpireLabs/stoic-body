import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {CoreRepository} from '../../src/core/repository';
import {AccountStore} from '../../src/core/accounts';
import {SyncHub} from '../../src/core/sync-hub';
import {wireOperation,transaction} from '../../src/core/sync-protocol';
import {richFixture} from './account-fixture';
const secret=()=>randomBytes(32).toString('hex');
test('pair codes are scoped, expire, allow exact retry and invalidate on revoke or password reset',async()=>{
 const repo=new CoreRepository(':memory:');try{const auth=new AccountStore(repo.database);const a=await auth.register({username:'alice',displayName:'Alice',password:'synthetic long passphrase'});let now=1000000000000;const hub=new SyncHub(repo,auth,()=>now),code=hub.issueCode(a.account.id).code,token=secret(),claim={code,deviceId:'device-a',name:'Laptop',secret:token};
  assert.equal(hub.claim(claim).instanceId,hub.claim(claim).instanceId);assert.throws(()=>hub.claim({...claim,secret:secret()}));assert.equal(hub.authenticate(token).owner,a.account.id);hub.revoke(a.account.id,'device-a');assert.throws(()=>hub.authenticate(token));
  const expired=hub.issueCode(a.account.id).code;now+=600001;assert.throws(()=>hub.claim({...claim,deviceId:'device-expired',code:expired}));
  const next=secret();hub.claim({...claim,code:hub.issueCode(a.account.id).code,secret:next,deviceId:'device-b'});await auth.recover({username:'alice',recoveryKey:a.recoveryKey,password:'replacement long passphrase'});assert.throws(()=>hub.authenticate(next));
 }finally{repo.close();}
});
test('hub preserves semantic XP and original edit conflicts; grant owner overrides submitted owner fields',async()=>{
 const repo=new CoreRepository(':memory:');try{const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth),hub=new SyncHub(repo,auth),token=secret();hub.claim({code:hub.issueCode(owner).code,deviceId:'device',name:'Laptop',secret:token});const epoch=hub.authenticate(token).epoch,occ=repo.snapshot(owner).occurrences[0];
  const command={schemaVersion:1 as const,operationId:'remote-complete',deviceId:'browser',entityId:occ.id,type:'completion.set',baseRevision:1,payload:{fraction:1}},request={protocol:1,epoch,operations:[{command}]};assert.equal(hub.exchange(token,request).results[0].status,'duplicate');assert.equal(hub.exchange(token,request).bundle.tables.core_xp_events.length,1);assert.equal(repo.snapshot(owner).totalXp,25);
  const stale={...command,operationId:'stale',entityId:'goal',type:'goal.update',baseRevision:0,payload:{title:'My edit',why:'Keep it'}};assert.equal(hub.exchange(token,{...request,operations:[{command:stale}]}).results[0].status,'conflict');assert.throws(()=>hub.exchange(token,{...request,ownerId:'another'}));
 }finally{repo.close();}
});
test('schedule metadata travels with offline acceptance and outer rollback includes domain receipts',async()=>{
 const a=new CoreRepository(':memory:'),b=new CoreRepository(':memory:');try{
  const aa=new AccountStore(a.database),ba=new AccountStore(b.database),owner=await richFixture(a,aa),dest=await richFixture(b,ba),hub=new SyncHub(b,ba),token=secret();hub.claim({code:hub.issueCode(dest).code,deviceId:'device',name:'Laptop',secret:token});
  // Use clean owners so schedules have identical canonical state on both ends.
  const source=(await aa.register({username:'source',displayName:'Source',password:'synthetic long passphrase'})).account.id,target=(await ba.register({username:'target',displayName:'Target',password:'synthetic long passphrase'})).account.id;
  const task={schemaVersion:1 as const,operationId:'create-task',deviceId:'device',entityId:'task',type:'task.create',baseRevision:0,payload:{title:'Practice',kind:'workout',durationMinutes:30}};a.apply(source,task);b.apply(target,task);
  const p=a.proposeDay(source,{date:'2026-10-05',timezone:'America/Denver',startTime:'08:00',endTime:'10:00'}),accept={...task,operationId:'accept',entityId:p.proposalId,type:'schedule.accept',baseRevision:1,payload:{}};a.apply(source,accept);const wire=wireOperation(a,source,accept),targetToken=secret();hub.claim({code:hub.issueCode(target).code,deviceId:'target-device',name:'Target laptop',secret:targetToken});const response=hub.exchange(targetToken,{protocol:1,epoch:hub.authenticate(targetToken).epoch,operations:[wire]});assert.equal(response.results[0].status,'accepted');assert.equal(b.snapshot(target).occurrences.length,1);
  const malformed={...wire,command:{...accept,operationId:'bad-preview',entityId:'malformed'},preview:{...wire.preview!,id:'malformed',proposal:{...wire.preview!.proposal as object,placements:[{taskId:'task',startAt:'not-a-date'}]}}};
  assert.equal(hub.exchange(targetToken,{protocol:1,epoch:hub.authenticate(targetToken).epoch,operations:[malformed]}).results[0].status,'rejected');assert.equal(b.database.prepare('SELECT 1 FROM core_schedule_batches WHERE owner_id=? AND id=?').get(target,'malformed'),undefined);
  assert.throws(()=>transaction(a.database,()=>{a.apply(owner,{...task,operationId:'rolled-back',entityId:'rolled-task'});throw new Error('rollback');}));assert.equal(a.snapshot(owner).tasks.some(t=>t.id==='rolled-task'),false);
 }finally{a.close();b.close();}
});
