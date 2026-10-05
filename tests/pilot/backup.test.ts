import test from 'node:test';
import assert from 'node:assert/strict';
import {startPilot} from '../../apps/local-pilot/server';
test('backup endpoints require the current session and CSRF; restore preserves credentials and revokes stale sessions',async()=>{
 const app=await startPilot({databasePath:':memory:',port:0});try{
  const request=async(path:string,data:unknown,cookie='',token='')=>fetch(app.url+path,{method:'POST',headers:{Origin:app.url,'Content-Type':'application/json',Cookie:cookie,'X-Stoic-Token':token},body:JSON.stringify(data)});
  const register=await request('/api/auth/register',{username:'alice',displayName:'Alice',password:'synthetic backup passphrase'}),signed=await register.json(),cookie=register.headers.get('set-cookie')!.split(';')[0],token=signed.token;
  assert.equal((await request('/api/recovery/export',{},'',token)).status,401);
  assert.equal((await request('/api/recovery/export',{},cookie,'wrong')).status,403);
  const exported=await request('/api/recovery/export',{passphrase:'encrypted backup passphrase'},cookie,token);assert.equal(exported.status,200);const file=(await exported.json()).file;
  const preview=await request('/api/recovery/preview',{source:{file},passphrase:'encrypted backup passphrase'},cookie,token);assert.equal(preview.status,200);const p=await preview.json();
  const restored=await request('/api/recovery/restore',{source:{file},passphrase:'encrypted backup passphrase',expectedFingerprint:p.fingerprint,digest:p.digest,operationId:'restore-1'},cookie,token);assert.equal(restored.status,200);assert.match(restored.headers.get('set-cookie')??'',/HttpOnly/);
  const second=await request('/api/auth/register',{username:'bobby',displayName:'Bobby',password:'synthetic backup passphrase'}),b=await second.json();
  const foreign=await request('/api/recovery/status',{operationId:'restore-1',expectedFingerprint:p.fingerprint,digest:p.digest},second.headers.get('set-cookie')!.split(';')[0],b.token);assert.deepEqual(await foreign.json(),{completed:false});
  assert.equal((await request('/api/guide',{baseRevision:0,state:{stage:'ready',question:0,tourStep:0,tourDone:false}},cookie,token)).status,401);
  assert.equal((await request('/api/auth/login',{username:'alice',password:'synthetic backup passphrase'})).status,200);
 }finally{await app.close();}
});
