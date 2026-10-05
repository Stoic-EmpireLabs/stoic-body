import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import { authenticatePage } from './helpers';
test('photo UI saves a client source, persists visual preference and honestly shows unavailable generation',async()=>{
 const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:950}});page.setDefaultTimeout(5000);
 try{await authenticatePage(page,server.url);await page.goto(server.url+'/?view=health');await page.getByRole('button',{name:'Photos & goal',exact:true}).click();
  await page.getByRole('radio',{name:'Female',exact:true}).check();await page.getByRole('button',{name:'Save visual preference',exact:true}).click();
  await page.getByText('Visual preference saved.',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'Add your photo',exact:true}).waitFor();
  const image=await sharp({create:{width:200,height:300,channels:3,background:'#6650aa'}}).png().toBuffer();
  await page.getByLabel('Choose a photo',{exact:true}).setInputFiles({name:'synthetic-fixture.png',mimeType:'image/png',buffer:image});
  await page.getByAltText('Your selected photo',{exact:true}).waitFor();await page.getByRole('checkbox',{name:'This is my photo and I agree to store it in my private local account.',exact:true}).check();await page.getByRole('button',{name:'Save this photo',exact:true}).click();
  await page.getByAltText('Your starting photo',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Generate illustration',exact:true}).isDisabled(),true);
  await page.reload();await page.getByRole('button',{name:'Photos & goal',exact:true}).click();await page.getByAltText('Your starting photo',{exact:true}).waitFor();assert.equal(await page.getByRole('radio',{name:'Female',exact:true}).isChecked(),true);
  await mkdir('docs/evidence/adaptive-setup',{recursive:true});await page.screenshot({path:'docs/evidence/adaptive-setup/photos-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:'docs/evidence/adaptive-setup/photos-mobile.png',fullPage:true});
 }finally{await browser.close();await server.close();}
});
