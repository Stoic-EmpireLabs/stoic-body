import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import { authenticatePage } from './helpers';
test('adaptive cards save several choices, show relevant follow-ups and survive reload',async()=>{
 const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch();const page=await browser.newPage();
 try{await authenticatePage(page,server.url);await page.goto(server.url+'/?view=setup');
 await page.getByRole('heading',{name:'What would you like help with?',exact:true}).waitFor();
 await page.getByLabel('Build a daily routine',{exact:true}).check();await page.getByLabel('Make time for family',{exact:true}).check();await page.getByRole('button',{name:'Save and continue',exact:true}).click();
 await page.getByRole('heading',{name:'Which comes first when time is tight?',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Get fitter',{exact:true}).count(),0);await page.reload();
 await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('heading',{name:'What would you like help with?',exact:true}).waitFor();assert.equal(await page.getByLabel('Build a daily routine',{exact:true}).isChecked(),true);
 assert.equal(await page.getByLabel('Make time for family',{exact:true}).isChecked(),true);
 }finally{await browser.close();await server.close();}
});
test('confirmed legacy subjects are not asked again while collecting missing schedule inputs',async()=>{
 const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch();const page=await browser.newPage();page.setDefaultTimeout(5000);
 try{await authenticatePage(page,server.url);const auth=await(await page.request.get(server.url+'/api/bootstrap')).json();let revision=auth.snapshot.profileRevision;
 for(const [questionId,value]of [['goals','Learn software development'],['learning','Web design']]){const r=await page.request.post(server.url+'/api/command',{headers:{Origin:server.url,'X-Stoic-Token':auth.token},data:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'test',entityId:'profile',baseRevision:revision++,type:'profile.answer',payload:{questionId,state:'answered',value}}});assert.equal(r.status(),200);}
 await page.goto(server.url+'/?view=setup');await page.getByText('Reuse my earlier answers',{exact:true}).click();await page.getByRole('button',{name:'Use these confirmed answers',exact:true}).click();
 await page.getByRole('button',{name:'Add a time window',exact:true}).click();await page.getByRole('button',{name:'Save and continue',exact:true}).click();await page.getByLabel('Bedtime',{exact:true}).fill('23:00');await page.getByLabel('Wake-up time',{exact:true}).fill('07:00');await page.getByRole('button',{name:'Save and continue',exact:true}).click();await page.getByRole('heading',{name:'How much would you like to take on?',exact:true}).waitFor();await page.getByRole('button',{name:'Skip',exact:true}).click();await page.getByRole('heading',{name:'Let’s get started.',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'What would you like to learn?',exact:true}).count(),0);
 }finally{await browser.close();await server.close();}
});
