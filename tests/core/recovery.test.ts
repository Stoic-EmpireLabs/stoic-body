import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository } from '../../src/core/repository';
import { AccountStore } from '../../src/core/accounts';
import { RecoveryStore } from '../../src/core/recovery';
import { richFixture } from './account-fixture';
const pass='synthetic backup passphrase';
test('recovery restores a complete account, keeps a before point and detects duplicate and stale confirmations',async()=>{
 const repo=new CoreRepository(':memory:');try{
  const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth),r=new RecoveryStore(repo,auth);
  const source={file:await r.export(owner,pass)},preview=await r.preview(owner,source,pass);
  repo.apply(owner,{schemaVersion:1,operationId:'edit',deviceId:'test',entityId:'goal',type:'goal.update',baseRevision:1,payload:{title:'Changed title',why:'Learn skills'}});
  await assert.rejects(r.restore(owner,{source,passphrase:pass,expectedFingerprint:preview.fingerprint,digest:preview.digest,operationId:'restore'}),/changed/i);
  const current=await r.preview(owner,source,pass),request={source,passphrase:pass,expectedFingerprint:current.fingerprint,digest:current.digest,operationId:'restore'};
  assert.equal((await r.restore(owner,request)).duplicate,false);assert.equal(repo.snapshot(owner).goals[0].title,'Build a useful app');assert.equal(repo.snapshot(owner).totalXp,25);
  assert.equal((await r.restore(owner,request)).duplicate,true);assert.equal(r.list(owner).length,1);
  const back=await r.preview(owner,{pointId:r.list(owner)[0].id});assert.equal(back.incoming.goals,1);
  await r.restore(owner,{source:{pointId:r.list(owner)[0].id},expectedFingerprint:back.fingerprint,digest:back.digest,operationId:'undo-restore'});
  assert.equal(repo.snapshot(owner).goals[0].title,'Changed title');
 }finally{repo.close();}
});
test('local points are owner scoped, hourly and bounded; a storage failure rolls back everything',async()=>{
 const repo=new CoreRepository(':memory:');try{
  const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth),other=await richFixture(repo,auth,'bobby');let now=1000000000000;const r=new RecoveryStore(repo,auth,()=>now);
  for(let i=0;i<9;i++){r.captureBeforeEdit(owner);r.captureBeforeEdit(owner);now+=3600001;}assert.equal(r.list(owner).length,7);assert.equal(r.list(other).length,0);
  await assert.rejects(r.preview(other,{pointId:r.list(owner)[0].id}),/not found/i);
  const source={pointId:r.list(owner)[0].id},p=await r.preview(owner,source),before=repo.snapshot(owner),points=r.list(owner);
  repo.database.exec("CREATE TRIGGER fail_restore BEFORE DELETE ON core_tasks BEGIN SELECT RAISE(ABORT,'synthetic disk failure'); END");
  await assert.rejects(r.restore(owner,{source,expectedFingerprint:p.fingerprint,digest:p.digest,operationId:'fail'}),/synthetic/);
  assert.deepEqual(repo.snapshot(owner),before);assert.deepEqual(r.list(owner),points);
 }finally{repo.close();}
});
