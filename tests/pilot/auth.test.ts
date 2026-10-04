import assert from 'node:assert/strict';
import test from 'node:test';
import { startPilot } from '../../apps/local-pilot/server';
const password='a synthetic long passphrase';
test('guest bootstrap exposes no data; registered clients are isolated and logout revokes access',async()=>{
  const pilot=await startPilot({databasePath:':memory:',port:0});
  try{
    const guest=await(await fetch(pilot.url+'/api/bootstrap')).json(); assert.equal(guest.authenticated,false); assert.equal(guest.snapshot,undefined);
    const register=async(username:string)=>{
      const r=await fetch(pilot.url+'/api/auth/register',{method:'POST',headers:{Origin:pilot.url,'Content-Type':'application/json'},body:JSON.stringify({username,displayName:username,password})});
      assert.equal(r.status,200); const value=await r.json(); return {value,headers:{Origin:pilot.url,'Content-Type':'application/json','X-Stoic-Token':value.token,Cookie:r.headers.get('set-cookie')!.split(';')[0]}};
    };
    const a=await register('alice'), b=await register('bob');
    const save=await fetch(pilot.url+'/api/command',{method:'POST',headers:a.headers,body:JSON.stringify({schemaVersion:1,operationId:'first',deviceId:'test',entityId:'goal',baseRevision:0,type:'goal.create',payload:{title:'Alice only',why:'Private'}})}); assert.equal(save.status,200);
    const other=await(await fetch(pilot.url+'/api/snapshot',{headers:b.headers})).json(); assert.equal(other.snapshot.goals.length,0);
    const forged=await fetch(pilot.url+'/api/snapshot',{headers:{...b.headers,'X-Stoic-Token':a.value.token}}); assert.equal(forged.status,403);
    assert.equal((await fetch(pilot.url+'/api/auth/logout',{method:'POST',headers:a.headers,body:'{}'})).status,200);
    assert.equal((await fetch(pilot.url+'/api/snapshot',{headers:a.headers})).status,401);
    const cross=await fetch(pilot.url+'/api/auth/login',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:JSON.stringify({username:'bob',password})}); assert.equal(cross.status,403);
  }finally{await pilot.close();}
});
