import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreRepository } from '../../src/core/repository';
import { AccountStore } from '../../src/core/accounts';
import { captureBundle, validateBundle, installBundle, bundleDigest } from '../../src/core/account-bundle';
import { sealBackup, openBackup } from '../../src/core/backup-crypto';
const pass='synthetic backup passphrase';

import { richFixture } from './account-fixture';

test('account bundle round trip preserves mixed records and XP but excludes credentials and other owners',async()=>{
  const source=new CoreRepository(':memory:'), target=new CoreRepository(':memory:');
  try {
    const aAuth=new AccountStore(source.database),bAuth=new AccountStore(target.database);
    const owner=await richFixture(source,aAuth);
    const other=(await aAuth.register({username:'private-other',displayName:'OTHER SECRET PERSON',password:pass})).account.id;
    source.apply(other,{schemaVersion:1,operationId:'other-secret',deviceId:'test',entityId:'other',type:'goal.create',baseRevision:0,payload:{title:'OTHER SECRET GOAL',why:'Private'}});
    const destination=(await bAuth.register({username:'destination',displayName:'Destination',password:pass})).account.id;
    const bundle=captureBundle(source,aAuth,owner),serialized=JSON.stringify(bundle);
    for(const forbidden of [owner,other,pass,'OTHER SECRET','password_hash','recovery_hash','csrf','app_sessions'])assert.equal(serialized.includes(forbidden),false);
    const checked=validateBundle(bundle);
    target.database.exec('BEGIN IMMEDIATE');installBundle(target,destination,checked);target.database.exec('COMMIT');
    const expected=source.snapshot(owner),actual=target.snapshot(destination);
    assert.deepEqual({...actual,ownerId:'same'},{...expected,ownerId:'same'});
    assert.equal(actual.totalXp,25);
    assert.deepEqual(bAuth.readGuide(destination).state,aAuth.readGuide(owner).state);
    assert.equal(bundleDigest(captureBundle(target,bAuth,destination)),bundleDigest(bundle));
  }finally{source.close();target.close();}
});

test('malformed relationships, XP, JSON, schema and ownership fields are rejected before restore',async()=>{
  const repo=new CoreRepository(':memory:');try{
    const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth),original=captureBundle(repo,auth,owner);
    const broken=structuredClone(original);broken.tables.core_task_details[0][1]='missing-goal';assert.throws(()=>validateBundle(broken));
    const xp=structuredClone(original);xp.tables.core_xp_events[0][2]=10000;assert.throws(()=>validateBundle(xp));
    const json=structuredClone(original);json.tables.core_health[0][4]='null';assert.throws(()=>validateBundle(json));
    assert.throws(()=>validateBundle({...original,version:999}));assert.throws(()=>validateBundle({...original,ownerId:owner}));
    assert.equal(repo.snapshot(owner).totalXp,25);
  }finally{repo.close();}
});

test('encrypted backups authenticate contents, use random salts and reject wrong passphrases and versions',async()=>{
  const repo=new CoreRepository(':memory:');try{
    const auth=new AccountStore(repo.database),owner=await richFixture(repo,auth),bundle=captureBundle(repo,auth,owner);
    const a=await sealBackup(bundle,pass),b=await sealBackup(bundle,pass);
    assert.notEqual(a.salt,b.salt);assert.notEqual(a.data,b.data);assert.equal(JSON.stringify(a).includes('Private goal'),false);
    assert.equal(bundleDigest(await openBackup(a,pass)),bundleDigest(bundle));
    await assert.rejects(openBackup(a,'wrong long passphrase'),/passphrase|damaged/i);
    await assert.rejects(openBackup({...a,data:a.data.slice(0,-4)+'AAAA'},pass));
    await assert.rejects(openBackup({...a,version:99},pass));
    await assert.rejects(sealBackup(bundle,'short'));
  }finally{repo.close();}
});

