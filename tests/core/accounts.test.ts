import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreRepository } from '../../src/core/repository';
import { AccountStore } from '../../src/core/accounts';
const password = 'test passphrase with fifteen characters';

test('an in-flight login cannot accept credentials invalidated during password hashing', async () => {
  const repo = new CoreRepository(':memory:'), auth = new AccountStore(repo.database);
  try {
    await auth.register({username:'alice',displayName:'Alice',password});
    const pending = auth.login({username:'alice',password});
    // Model a password rotation committing while the asynchronous hash is running.
    repo.database.prepare('UPDATE app_accounts SET password_hash=? WHERE username=?').run('0'.repeat(128),'alice');
    await assert.rejects(pending, /Sign-in details/);
  } finally { repo.close(); }
});
test('accounts use unique salted hashes and never claim an existing local owner', async () => {
  const repo = new CoreRepository(':memory:'); repo.createOwner('local-owner'); const auth = new AccountStore(repo.database);
  try {
    const a = await auth.register({ username:'alice', displayName:'Alice', password }), b = await auth.register({ username:'bob', displayName:'Bob', password });
    assert.notEqual(a.account.id, 'local-owner'); assert.notEqual(a.account.id, b.account.id);
    const rows = repo.database.prepare('SELECT password_hash,salt FROM app_accounts').all();
    assert.notEqual(rows[0].password_hash, rows[1].password_hash); assert.notEqual(rows[0].salt, rows[1].salt);
    assert.equal(JSON.stringify(rows).includes(password), false);
    assert.equal((await auth.login({username:'ALICE',password})).id,a.account.id);
    await assert.rejects(auth.login({username:'alice',password:'wrong password phrase'}), /Sign-in details/);
    await assert.rejects(auth.register({username:'alice',displayName:'Duplicate',password}), /unavailable/);
    await assert.rejects(auth.register({username:'bad',displayName:'Short',password:'short'}), /15/);
  } finally {repo.close();}
});
test('sessions expire and revoke; recovery rotates its key and invalidates previous sessions', async () => {
  const repo = new CoreRepository(':memory:'); let now=1000; const auth = new AccountStore(repo.database,()=>now);
  try {
    const a=await auth.register({username:'alice',displayName:'Alice',password}), s=auth.createSession(a.account.id);
    assert.equal(auth.authenticate(s.key)?.account.id,a.account.id);
    assert.equal(auth.authenticate('not a session'),null);
    now+=31*60_000; assert.equal(auth.authenticate(s.key),null);
    const s2=auth.createSession(a.account.id); auth.logout(s2.key); assert.equal(auth.authenticate(s2.key),null);
    const s3=auth.createSession(a.account.id);
    const recovered=await auth.recover({username:'alice', recoveryKey:a.recoveryKey,password:'a different strong passphrase'});
    assert.equal(auth.authenticate(s3.key),null); assert.notEqual(recovered.recoveryKey,a.recoveryKey);
    await assert.rejects(auth.recover({username:'alice',recoveryKey:a.recoveryKey,password}),/Recovery details/);
    assert.equal((await auth.login({username:'alice',password:'a different strong passphrase'})).id,a.account.id);
  } finally {repo.close();}
});
test('guide state is owner scoped, validates steps, detects conflicts and replays same state', async () => {
  const repo=new CoreRepository(':memory:'); const auth=new AccountStore(repo.database);
  try {
    const a=await auth.register({username:'alice',displayName:'Alice',password}), b=await auth.register({username:'bob',displayName:'Bob',password});
    const saved=auth.saveGuide(a.account.id,{baseRevision:0,state:{stage:'questions',question:4,tourStep:0,tourDone:false}});
    assert.equal(saved.revision,1); assert.equal(auth.readGuide(b.account.id).state.stage,'welcome');
    assert.deepEqual(auth.saveGuide(a.account.id,{baseRevision:0,state:saved.state}),saved);
    assert.throws(()=>auth.saveGuide(a.account.id,{baseRevision:0,state:{...saved.state,question:5}}),/changed/);
    assert.throws(()=>auth.saveGuide(a.account.id,{baseRevision:1,state:{...saved.state,question:99}}));
  } finally {repo.close();}
});
test('login throttles persist and later expire without leaking whether an account exists', async () => {
  const repo=new CoreRepository(':memory:'); let now=0; const auth=new AccountStore(repo.database,()=>now);
  try {
    for(let i=0;i<5;i++) await assert.rejects(auth.login({username:'absent',password}),/Sign-in details/);
    await assert.rejects(new AccountStore(repo.database,()=>now).login({username:'absent',password}),/Too many/);
    now=16*60_000; await assert.rejects(auth.login({username:'absent',password}),/Sign-in details/);
  } finally {repo.close();}
});
