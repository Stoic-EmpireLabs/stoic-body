import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {startPilot} from '../../apps/local-pilot/server';
import {authenticatePage,testCredentials} from './helpers';
for(const cookieLost of [false,true])test(`uncertain restore reconciles after ${cookieLost?'cookie loss and sign-in':'body loss with rotated cookie'}`,async()=>{
 const app=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch({headless:true});try{
  const page=await browser.newPage();page.setDefaultTimeout(4000);await authenticatePage(page,app.url);await page.goto(app.url+'/?view=settings');
  await page.getByRole('button',{name:/Preview before edits/}).click();await page.getByLabel('Replace my current app data with this backup').check();
  await page.route('**/api/recovery/restore',async route=>{const response=await route.fetch(),headers=response.headers();if(cookieLost)headers['set-cookie']='stoic_local=lost; HttpOnly; SameSite=Strict; Path=/';await route.fulfill({response,headers,body:'{'});});
  await page.getByRole('button',{name:'Confirm restore'}).click();await page.getByRole('button',{name:'Check last restore result'}).click();
  if(cookieLost){await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByLabel('Username',{exact:true}).fill(testCredentials.username);await page.getByLabel('Passphrase',{exact:true}).fill(testCredentials.password);await page.getByRole('button',{name:'Sign in to my space'}).click();await page.getByRole('button',{name:'Check last restore result'}).click();}
  await page.getByText('Your previous restore completed successfully.',{exact:true}).waitFor();
  const result=await page.evaluate(async()=>{const b=await(await fetch('/api/bootstrap')).json();const points=await(await fetch('/api/recovery/points',{headers:{'X-Stoic-Token':b.token}})).json();return {points:points.points.filter((p:{reason:string})=>p.reason==='Before restore').length,pending:sessionStorage.getItem('stoic-restore-attempt')};});assert.equal(result.points,1);assert.equal(result.pending,null);
 }finally{await browser.close();await app.close();}
});
