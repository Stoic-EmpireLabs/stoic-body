import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import { testCredentials } from './helpers';
async function fixture(run:(page:Page)=>Promise<void>) {
  const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1365,height:950}}); page.setDefaultTimeout(5000);
  try {await page.goto(server.url); await run(page);} finally {await browser.close();await server.close();}
}
async function signup(page:Page) {
  await page.getByRole('button',{name:'Create my account',exact:true}).click();
  await page.getByLabel('Your name', {exact:true}).fill(testCredentials.displayName);
  await page.getByLabel('Username', {exact:true}).fill(testCredentials.username);
  await page.getByLabel('Passphrase', {exact:true}).fill(testCredentials.password);
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  await page.getByRole('heading',{name:'Keep your recovery key',exact:true}).waitFor();
  const key=await page.locator('#recovery-key').textContent(); assert.equal(key?.length,48);
  await page.getByRole('button',{name:'I saved my key — continue',exact:true}).click();
  await page.getByRole('heading',{name:/Welcome, Test client/}).waitFor(); return key!;
}
test('new client gets a host, resumable questionnaire and an explicit first-goal draft',async()=>fixture(async page=>{
  await page.getByRole('heading',{name:'A life, intentionally lived.',exact:true}).waitFor();
  await mkdir('docs/evidence/guided-entry',{recursive:true}); await page.screenshot({path:'docs/evidence/guided-entry/welcome-desktop.png',fullPage:true});
  assert.equal(await page.locator('.pilot-shell').isVisible(),false);
  await signup(page); await page.getByRole('button',{name:'Let’s set you up',exact:true}).click();
  await page.getByLabel('Your answer',{exact:true}).fill('Build an automation business');
  await page.getByRole('button',{name:'Save and continue',exact:true}).click();
  await page.getByText('Question 2 of 20',{exact:true}).waitFor();
  await page.screenshot({path:'docs/evidence/guided-entry/questionnaire-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'I do not know yet',exact:true}).click();
  await page.getByText('Question 3 of 20',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Save and finish later',exact:true}).click();
  await page.getByText('Your next small step',{exact:true}).waitFor();
  await page.reload(); await page.getByRole('button',{name:'Continue setup',exact:true}).click();
  await page.getByText('Question 3 of 20',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Skip this question',exact:true}).click();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByText('Question 3 of 20',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Save and finish later',exact:true}).click();
  await page.getByRole('button',{name:'Review my first goal',exact:true}).click();
  assert.equal(await page.getByLabel('Goal title',{exact:true}).inputValue(),'Build an automation business');
  assert.equal(await page.getByRole('heading',{name:'Build an automation business',exact:true}).count(),0);
  await page.getByLabel('Why it matters',{exact:true}).fill('Build useful services and support my family.');
  await page.getByRole('button',{name:'Save goal',exact:true}).click();
  await page.getByRole('heading',{name:'Build an automation business',exact:true}).waitFor();
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('heading',{name:'A life, intentionally lived.',exact:true}).waitFor();
  assert.equal(await page.getByRole('heading',{name:'Build an automation business',exact:true}).count(),0);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.getByLabel('Username',{exact:true}).fill(testCredentials.username); await page.getByLabel('Passphrase',{exact:true}).fill(testCredentials.password);
  await page.getByRole('button',{name:'Sign in to my space',exact:true}).click();
  await page.getByRole('button',{name:'Goals',exact:true}).click(); await page.getByRole('heading',{name:'Build an automation business',exact:true}).waitFor();
}));
test('whole-app guide covers every view, pauses with Escape, resumes and fits mobile',async()=>fixture(async page=>{
  await signup(page); await page.getByRole('button',{name:'Explore first',exact:true}).click();
  await page.getByRole('button',{name:'Help & tour',exact:true}).click(); await page.getByRole('button',{name:'Start app tour',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Your Stoic Body guide'}); await dialog.waitFor();
  assert.match(await dialog.innerText(),/1 of 12/i);
  await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>Boolean(document.activeElement?.closest('dialog'))),true);
  await page.getByRole('button',{name:'Next stop',exact:true}).click();
  await page.keyboard.press('Escape'); await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Help & tour',exact:true}).click(); await page.getByRole('button',{name:'Resume app tour',exact:true}).click();
  assert.match(await dialog.innerText(),/2 of 12/i);
  await mkdir('docs/evidence/guided-entry',{recursive:true}); await page.screenshot({path:'docs/evidence/guided-entry/tour-desktop.png',fullPage:true});
  for(let step=2;step<12;step++) {await page.getByRole('button',{name:'Next stop',exact:true}).click(); await page.getByText(`Stop ${step+1} of 12`,{exact:true}).waitFor();}
  await page.getByRole('button',{name:'Finish tour',exact:true}).click(); await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Help & tour',exact:true}).click(); await page.getByRole('button',{name:'Replay app tour',exact:true}).waitFor();
  await page.setViewportSize({width:390,height:844}); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:'docs/evidence/guided-entry/host-mobile.png',fullPage:true});
}));
