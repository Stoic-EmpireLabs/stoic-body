import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import { authenticatePage } from './helpers';
test('adaptive cards save several choices, show relevant follow-ups and survive reload',async()=>{
 const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch();const page=await browser.newPage();
 try{await authenticatePage(page,server.url);await page.goto(server.url+'/?view=setup');
 await page.getByRole('heading',{name:'What would you like help with?',exact:true}).waitFor();
 await page.getByLabel('Learn new skills',{exact:true}).check();await page.getByLabel('Grow my business',{exact:true}).check();await page.getByRole('button',{name:'Save and continue',exact:true}).click();
 await page.getByRole('heading',{name:'Which comes first when time is tight?',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Get fitter',{exact:true}).count(),0);await page.reload();
 await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('heading',{name:'What would you like help with?',exact:true}).waitFor();assert.equal(await page.getByLabel('Learn new skills',{exact:true}).isChecked(),true);
 assert.equal(await page.getByLabel('Grow my business',{exact:true}).isChecked(),true);
 }finally{await browser.close();await server.close();}
});
