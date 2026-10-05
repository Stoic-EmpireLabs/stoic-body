import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CoreRepository} from '../../src/core/repository';
import {AccountStore} from '../../src/core/accounts';
import {captureBundle,validateBundle} from '../../src/core/account-bundle';
import {RecoveryStore} from '../../src/core/recovery';
import {richFixture} from './account-fixture';
test('capture stays on one SQLite snapshot while another connection commits',async()=>{
 const file=join(mkdtempSync(join(tmpdir(),'stoic-capture-')),'snapshot.sqlite'),reader=new CoreRepository(file);reader.database.exec('PRAGMA journal_mode=WAL');const writer=new CoreRepository(file);
 try{
  const auth=new AccountStore(reader.database),owner=await richFixture(reader,auth),read=auth.readGuide.bind(auth);let interleaved=false;
  auth.readGuide=(id:string)=>{if(!interleaved){interleaved=true;writer.apply(owner,{schemaVersion:1,operationId:'external-edit',deviceId:'external',entityId:'goal',type:'goal.update',baseRevision:1,payload:{title:'Concurrent edit',why:'Another connection'}});}return read(id);};
  const bundle=validateBundle(captureBundle(reader,auth,owner));assert.equal(bundle.tables.core_goals[0][1],'Build a useful app');assert.equal(writer.snapshot(owner).goals[0].title,'Concurrent edit');
 }finally{writer.close();reader.close();}
});
test('restore validation rejects hidden completed sessions and inconsistent batch membership',async()=>{
 const repo=new CoreRepository(':memory:');try{const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth),b=captureBundle(repo,auth,owner);
  const cancelled=structuredClone(b);cancelled.tables.core_cancelled_occurrences.push([b.tables.core_occurrences[0][0]]);assert.throws(()=>validateBundle(cancelled),/cancel|batch/i);
  const missing=structuredClone(b);missing.tables.core_batch_occurrences=[];assert.throws(()=>validateBundle(missing),/batch/i);
  const undone=structuredClone(b);undone.tables.core_schedule_batches[0][3]='undone';assert.throws(()=>validateBundle(undone),/cancel|batch/i);
  repo.apply(owner,{schemaVersion:1,operationId:'new-task',deviceId:'test',entityId:'second',type:'task.create',baseRevision:0,payload:{title:'Later task',kind:'task',durationMinutes:15}});
  const next=repo.proposeDay(owner,{date:'2026-10-06',timezone:'America/Denver',startTime:'08:00',endTime:'10:00'});
  repo.apply(owner,{schemaVersion:1,operationId:'accept-next',deviceId:'test',entityId:next.proposalId,type:'schedule.accept',baseRevision:1,payload:{}});
  repo.apply(owner,{schemaVersion:1,operationId:'undo-next',deviceId:'test',entityId:next.proposalId,type:'schedule.undo',baseRevision:2,payload:{}});
  assert.doesNotThrow(()=>validateBundle(captureBundle(repo,auth,owner)));
 }finally{repo.close();}
});
test('an uncertain restore retry reconciles its receipt after retention removes its source',async()=>{
 const repo=new CoreRepository(':memory:');try{const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth);let now=1000000000000;const r=new RecoveryStore(repo,auth,()=>now);for(let i=0;i<7;i++){r.captureBeforeEdit(owner);now+=3600001;}
  const source={pointId:r.list(owner).at(-1)!.id},p=await r.preview(owner,source),request={source,expectedFingerprint:p.fingerprint,digest:p.digest,operationId:'oldest'};
  assert.equal((await r.restore(owner,request)).duplicate,false);assert.equal(r.list(owner).some(x=>x.id===source.pointId),false);assert.equal((await r.restore(owner,request)).duplicate,true);
  await assert.rejects(r.restore(owner,{...request,digest:'a'.repeat(64)}),/identifier/);
 }finally{repo.close();}
});
