import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreRepository, type Command } from '../../src/core/repository';
import { buildLifePlan } from '../../src/core/life-plan';
import { validateSetup } from '../../src/core/setup-schema';
import { AccountStore } from '../../src/core/accounts';
import { captureBundle,validateBundle } from '../../src/core/account-bundle';
const state=validateSetup({version:2,cursor:null,answers:{areas:{selections:['routine']},availability:{intervals:[{days:[1,2,3,4,5],start:'17:00',end:'22:00',kind:'free'}]},sleep:{values:{start:'23:00',end:'07:00'}}}});
const command=(type:string,id:string,payload:unknown,baseRevision:number):Command=>({schemaVersion:1,operationId:id,deviceId:'test',entityId:'profile',type,payload,baseRevision});
test('a failed final profile write rolls back the complete accepted plan',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');r.apply('a',command('setup.save','s',{state},0));
 const request={startDate:'2026-10-05',timezone:'America/Denver',pace:'normal' as const};const plan=buildLifePlan({...request,setup:state,snapshot:r.snapshot('a')});
 r.database.exec("CREATE TRIGGER fail_plan BEFORE UPDATE ON core_owners BEGIN SELECT RAISE(ABORT,'disk failure simulation'); END");
 assert.throws(()=>r.apply('a',command('plan.accept','p',{...request,fingerprint:plan.fingerprint},1)),/disk failure/);
 assert.equal(r.snapshot('a').tasks.length,0);assert.equal(r.snapshot('a').goals.length,0);assert.equal(r.snapshot('a').occurrences.length,0);r.close();
});
test('accepted setup and plans survive validated backup and deterministic second-device replay',async()=>{
 const a=new CoreRepository(':memory:'),b=new CoreRepository(':memory:');const aa=new AccountStore(a.database);new AccountStore(b.database);
 await aa.register({username:'test-account',displayName:'Test',password:'a strong test passphrase'});const owner=String(a.database.prepare('SELECT id FROM core_owners').get()!.id);b.createOwner(owner);
 const setup=command('setup.save','s',{state},0);a.apply(owner,setup);b.apply(owner,setup);
 const req={startDate:'2026-10-05',timezone:'America/Denver',pace:'normal' as const},plan=buildLifePlan({...req,setup:state,snapshot:a.snapshot(owner)});const accept=command('plan.accept','p',{...req,fingerprint:plan.fingerprint},1);a.apply(owner,accept);b.apply(owner,accept);
 assert.deepEqual(a.snapshot(owner),b.snapshot(owner));assert.ok(validateBundle(captureBundle(a,aa,owner)).profile[1].includes('setupV2'));
 assert.equal(a.snapshot(owner).totalXp,0);a.close();b.close();
});
