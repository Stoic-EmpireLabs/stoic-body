import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {startPilot,type PilotServer} from '../../apps/local-pilot/server';
async function account(p:PilotServer,name:string){const r=await fetch(p.url+'/api/auth/register',{method:'POST',headers:{Origin:p.url,'Content-Type':'application/json'},body:JSON.stringify({username:name,displayName:name,password:'synthetic long passphrase'})}),data=await r.json();assert.equal(r.status,200);const cookie=r.headers.get('set-cookie')!.split(';')[0];return async(path:string,input?:unknown)=>{const response=await fetch(p.url+'/api/'+path,{method:input===undefined?'GET':'POST',headers:{Origin:p.url,'Content-Type':'application/json',Cookie:cookie,'X-Stoic-Token':data.token},...(input===undefined?{}:{body:JSON.stringify(input)})});return {status:response.status,data:await response.json()};};}
test('two HTTP installations pair, sync, isolate accounts and reject revoked grants',async()=>{
 const hub=await startPilot({databasePath:':memory:',port:0,allowTestSyncLoopback:true}),replica=await startPilot({databasePath:':memory:',port:0,allowTestSyncLoopback:true});
 try{
  const host=await account(hub,'host'),other=await account(hub,'other'),client=await account(replica,'client'),code=await host('sync/code',{});assert.equal(code.status,200);
  const preview=await client('sync/link-preview',{endpoint:hub.url,code:code.data.code,name:'Test laptop'});assert.equal(preview.status,200,JSON.stringify(preview));assert.equal((await client('sync/link-confirm',{previewId:preview.data.previewId})).status,200);
  const create={schemaVersion:1,operationId:randomUUID(),deviceId:'local-browser',type:'goal.create',entityId:'shared',baseRevision:0,payload:{title:'Build software',why:'Practice'}};assert.equal((await client('command',create)).status,200);await client('sync/now',{});assert.equal((await host('snapshot')).data.snapshot.goals.length,1);assert.equal((await other('snapshot')).data.snapshot.goals.length,0);
  const status=await host('sync/status');assert.equal(status.data.devices.length,1);assert.equal(JSON.stringify(status.data).includes('secret'),false);await host('sync/revoke',{deviceId:status.data.devices[0].id});await client('sync/now',{});assert.equal((await client('sync/status')).data.state,'blocked');assert.equal((await client('snapshot')).data.snapshot.goals.length,1);
  const rejected=await fetch(replica.url+'/api/sync/code',{method:'POST',headers:{'Content-Type':'application/json',Origin:replica.url},body:'{}'});assert.equal(rejected.status,401);
 }finally{await replica.close();await hub.close();}
});
