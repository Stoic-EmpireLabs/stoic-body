import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {startPilot} from '../../apps/local-pilot/server';
import {authenticatePage} from './helpers';
test('Settings guides pairing, requires replacement confirmation and keeps unsaved fields during remote updates',async()=>{
 const host=await startPilot({databasePath:':memory:',port:0,allowTestSyncLoopback:true}),client=await startPilot({databasePath:':memory:',port:0,allowTestSyncLoopback:true}),browser=await chromium.launch({headless:true});
 const hp=await browser.newPage(),cp=await browser.newPage({viewport:{width:390,height:844}});hp.setDefaultTimeout(5000);cp.setDefaultTimeout(5000);
 try{
  await authenticatePage(hp,host.url);await authenticatePage(cp,client.url);await hp.goto(host.url+'/?view=settings');await cp.goto(client.url+'/?view=settings');
  await hp.getByRole('button',{name:'Create pairing code',exact:true}).click();const code=await hp.getByLabel('Pairing code', {exact:true}).inputValue();
  await cp.getByLabel('Host address',{exact:true}).fill(host.url);await cp.getByLabel('Code from host',{exact:true}).fill(code);await cp.getByLabel('This device name',{exact:true}).fill('Laptop');const [response]=await Promise.all([cp.waitForResponse(r=>r.url().endsWith('/api/sync/link-preview')),cp.getByRole('button',{name:'Preview connection',exact:true}).click()]);assert.equal(response.status(),200,await response.text());
  await cp.getByRole('heading',{name:'Review this connection',exact:true}).waitFor();await cp.getByRole('button',{name:'Confirm connection',exact:true}).click();await cp.getByText('Check the replacement confirmation first.',{exact:true}).waitFor();
  await cp.getByLabel('Replace this account’s app data with the host account').check();await cp.getByRole('button',{name:'Confirm connection',exact:true}).click();await cp.getByText('Connected · Test client',{exact:true}).waitFor();
  assert.equal(await cp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(process.env.STOIC_CAPTURE_SYNC){const folder=resolve('private/evidence/desktop-sync');await mkdir(folder,{recursive:true});await cp.locator('#device-sync').screenshot({path:resolve(folder,'devices-mobile.png')});await cp.setViewportSize({width:1440,height:1000});await cp.locator('#device-sync').screenshot({path:resolve(folder,'devices-desktop.png')});await cp.setViewportSize({width:390,height:844});}
  await cp.getByRole('button',{name:'Goals',exact:true}).click();await cp.getByLabel('Goal title',{exact:true}).fill('Unsaved private draft');
  const bootstrap=await (await hp.request.get(host.url+'/api/bootstrap')).json();const create=await hp.request.post(host.url+'/api/command',{headers:{Origin:host.url,'X-Stoic-Token':bootstrap.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'ui-test',type:'goal.create',entityId:'remote',baseRevision:0,payload:{title:'Remote goal',why:'Practice'}}});assert.equal(create.status(),200);
  const cb=await (await cp.request.get(client.url+'/api/bootstrap')).json();await cp.request.post(client.url+'/api/sync/now',{headers:{Origin:client.url,'X-Stoic-Token':cb.token},data:{}});
  await cp.evaluate(()=>window.dispatchEvent(new Event('focus')));await cp.getByRole('button',{name:'Refresh view and discard unsaved fields',exact:true}).waitFor();assert.equal(await cp.getByLabel('Goal title',{exact:true}).inputValue(),'Unsaved private draft');
  await cp.getByRole('button',{name:'Refresh view and discard unsaved fields',exact:true}).click();await cp.getByRole('heading',{name:'Remote goal',exact:true}).waitFor();
  await hp.request.post(host.url+'/api/command',{headers:{Origin:host.url,'X-Stoic-Token':bootstrap.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'ui-test',type:'goal.update',entityId:'remote',baseRevision:1,payload:{title:'Host title',why:'Practice'}}});
  await cp.request.post(client.url+'/api/command',{headers:{Origin:client.url,'X-Stoic-Token':cb.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'ui-test',type:'goal.update',entityId:'remote',baseRevision:1,payload:{title:'Retained laptop title',why:'Keep my proposal'}}});
  await cp.getByRole('button',{name:'Settings',exact:true}).click();await cp.getByRole('button',{name:'Sync now',exact:true}).click();await cp.getByRole('heading',{name:'Saved proposals to review'}).waitFor();await cp.locator('summary').filter({hasText:'Retained laptop title'}).click();await cp.getByRole('button',{name:'Keep current version and dismiss proposal'}).click();await cp.getByText('0 changes waiting · 0 to review.',{exact:false}).waitFor();
  await hp.request.post(host.url+'/api/command',{headers:{Origin:host.url,'X-Stoic-Token':bootstrap.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'ui-test',type:'task.create',entityId:'practice',baseRevision:0,payload:{title:'Retained practice',kind:'focus',durationMinutes:30}}});await cp.getByRole('button',{name:'Sync now',exact:true}).click();
  const day=await (await cp.request.post(client.url+'/api/propose',{headers:{Origin:client.url,'X-Stoic-Token':cb.token},data:{date:'2026-10-07',timezone:'America/Denver',startTime:'08:00',endTime:'10:00'}})).json();
  await hp.request.post(host.url+'/api/command',{headers:{Origin:host.url,'X-Stoic-Token':bootstrap.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'ui-test',type:'goal.create',entityId:'context',baseRevision:0,payload:{title:'New context',why:'Review'}}});
  await cp.request.post(client.url+'/api/command',{headers:{Origin:client.url,'X-Stoic-Token':cb.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'ui-test',type:'schedule.accept',entityId:day.proposalId,baseRevision:1,payload:{}}});await cp.getByRole('button',{name:'Sync now',exact:true}).click();
  await cp.locator('summary').filter({hasText:'Day plan'}).click();await cp.getByText('Retained practice',{exact:true}).waitFor();await cp.getByText('America/Denver',{exact:false}).waitFor();assert.ok((await cp.locator('#device-sync').innerText()).includes('Oct 7, 2026'));await cp.getByRole('button',{name:'Keep current version and dismiss proposal'}).click();
  await host.close();await cp.getByRole('button',{name:'Sync now',exact:true}).click();await cp.getByText(/Host unavailable or sync could not finish/).waitFor();
 }finally{await browser.close();await client.close();await host.close();}
});

