import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import { testCredentials } from './helpers';
async function fixture(run:(page:Page)=>Promise<void>) {
  const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1365,height:950}}),page=await context.newPage(); page.setDefaultTimeout(5000);
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

test('a restored signed-in page clears private screens after inactivity without needing a first click',async()=>fixture(async page=>{
  await signup(page);
  await page.clock.install();
  await page.reload();
  await page.getByRole('heading',{name:/Welcome, Test client/}).waitFor();
  await page.clock.fastForward(30*60*1000+1000);
  await page.getByRole('heading',{name:'A life, intentionally lived.',exact:true}).waitFor();
  assert.equal(await page.locator('.pilot-shell').isVisible(),false);
}));

test('a changed account cannot adopt or retry the previous account private draft',async()=>fixture(async page=>{
  await signup(page); await page.getByRole('button',{name:'Explore first',exact:true}).click();
  await page.getByRole('button',{name:'Goals',exact:true}).click();
  await page.getByLabel('Goal title',{exact:true}).fill('ALICE PRIVATE DRAFT');
  await page.getByLabel('Why it matters',{exact:true}).fill('Alice confidential reason');
  const url=new URL(page.url()).origin;
  const b=await page.request.post(url+'/api/auth/register',{headers:{Origin:url},data:{username:'bob',displayName:'Bob',password:testCredentials.password}});
  assert.equal(b.status(),200);
  await page.getByRole('button',{name:'Save goal',exact:true}).click();
  await page.getByRole('heading',{name:/Welcome, Bob/}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Retry save',exact:true}).isVisible(),false);
  assert.equal(await page.getByText('ALICE PRIVATE DRAFT',{exact:true}).count(),0);
  const fresh=await (await page.request.get(url+'/api/bootstrap')).json();
  assert.equal(fresh.snapshot.goals.length,0);
}));

test('signing out in another tab clears private screens in the original tab',async()=>fixture(async page=>{
  await signup(page); await page.getByRole('button',{name:'Explore first',exact:true}).click();
  const other=await page.context().newPage(); other.setDefaultTimeout(5000); await other.goto(page.url());
  await other.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('heading',{name:'A life, intentionally lived.',exact:true}).waitFor();
  assert.equal(await page.locator('.pilot-shell').isVisible(),false);
}));

test('reconnect discards an uncertain save when the current account has changed',async()=>fixture(async page=>{
  await signup(page); await page.getByRole('button',{name:'Explore first',exact:true}).click();
  await page.getByRole('button',{name:'Goals',exact:true}).click();
  await page.getByLabel('Goal title',{exact:true}).fill('PRIVATE UNSENT GOAL');
  await page.getByLabel('Why it matters',{exact:true}).fill('Private reason');
  await page.route('**/api/command',route=>route.abort());
  await page.getByRole('button',{name:'Save goal',exact:true}).click();
  await page.getByRole('button',{name:'Retry save',exact:true}).waitFor();
  await page.unroute('**/api/command');
  const url=new URL(page.url()).origin;
  assert.equal((await page.request.post(url+'/api/auth/register',{headers:{Origin:url},data:{username:'bob',displayName:'Bob',password:testCredentials.password}})).status(),200);
  await page.getByRole('button',{name:'Reconnect',exact:true}).click();
  await page.getByRole('heading',{name:/Welcome, Bob/}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Retry save',exact:true}).isVisible(),false);
  const fresh=await(await page.request.get(url+'/api/bootstrap')).json();assert.equal(fresh.snapshot.goals.length,0);
}));

test('conflicting questionnaire answers retain a draft and explicitly review before retrying',async()=>fixture(async page=>{
  await signup(page); await page.getByRole('button',{name:'Build my fitness plan',exact:true}).click();
  const other=await page.context().newPage(); other.setDefaultTimeout(5000); await other.goto(page.url());
  await other.getByRole('checkbox',{name:'Make time for family',exact:true}).check();
  await other.getByText('Add a note (optional)',{exact:true}).click();await other.getByLabel('Your note',{exact:true}).fill('Second tab draft');
  await page.getByRole('checkbox',{name:'Build a daily routine',exact:true}).check();
  await page.getByRole('button',{name:'Save and continue',exact:true}).click();
  await page.getByRole('heading',{name:'When do you have time for your goals?',exact:true}).waitFor();
  await other.getByRole('button',{name:'Save and continue',exact:true}).click();
  await other.getByText('What would you like help with? Saved: Build a daily routine',{exact:true}).waitFor();
  assert.equal(await other.getByLabel('Your note',{exact:true}).inputValue(),'Second tab draft');
  await other.getByRole('button',{name:'Keep my changes',exact:true}).click();
  await other.getByRole('heading',{name:'When do you have time for your goals?',exact:true}).waitFor();
  const fresh=await(await other.request.get(new URL(other.url()).origin+'/api/bootstrap')).json();
  const answer=JSON.parse(fresh.snapshot.answers.setupV2.value).answers.areas;
  assert.equal(answer.custom,'Second tab draft'); assert.deepEqual(answer.selections,['family']);
}));
test('new client resumes adaptive setup and accepts a whole week without manually creating tasks',async()=>fixture(async page=>{
  await page.getByRole('heading',{name:'A life, intentionally lived.',exact:true}).waitFor();
  await mkdir('docs/evidence/self-service',{recursive:true}); await page.screenshot({path:'docs/evidence/self-service/welcome-desktop.png',fullPage:true});
  assert.equal(await page.locator('.pilot-shell').isVisible(),false);
  await signup(page); await page.getByRole('button',{name:'Build my fitness plan',exact:true}).click();
  await page.getByRole('checkbox',{name:'Build a daily routine',exact:true}).check();
  await page.getByRole('button',{name:'Save and continue',exact:true}).click();
  await page.getByRole('heading',{name:'When do you have time for your goals?',exact:true}).waitFor();
  await page.screenshot({path:'docs/evidence/self-service/questionnaire-desktop.png',fullPage:true});
  await page.getByRole('heading',{name:'When do you have time for your goals?',exact:true}).waitFor();
  await page.getByRole('button',{name:'Save for later',exact:true}).click();
  await page.getByRole('button',{name:'Continue setup',exact:true}).waitFor();
  await page.reload(); await page.getByRole('button',{name:'Continue setup',exact:true}).click();
  await page.getByRole('heading',{name:'When do you have time for your goals?',exact:true}).waitFor();
  await page.getByRole('button',{name:'Add a time window',exact:true}).click();
  await page.getByLabel('From',{exact:true}).fill('18:00'); await page.getByLabel('Until',{exact:true}).fill('22:00');
  await page.getByRole('button',{name:'Save and continue',exact:true}).click();
  await page.getByLabel('Bedtime',{exact:true}).fill('23:00'); await page.getByLabel('Wake-up time',{exact:true}).fill('07:00');
  await page.getByRole('button',{name:'Save and continue',exact:true}).click();
  for(const title of ['How much would you like to take on?','Which daily habits do you want to build?']){
    await page.getByRole('heading',{name:title,exact:true}).waitFor(); await page.getByRole('button',{name:'Skip',exact:true}).click();
  }
  await page.getByRole('heading',{name:'Let’s get started.',exact:true}).waitFor();
  await mkdir('docs/evidence/self-service',{recursive:true});await page.screenshot({path:'docs/evidence/self-service/ready-week-desktop.png',fullPage:true});

  await page.getByRole('button',{name:'Today',exact:true}).waitFor();
  const saved=await(await page.request.get(new URL(page.url()).origin+'/api/bootstrap')).json();
  assert.ok(saved.snapshot.occurrences.length>5); assert.equal(saved.snapshot.goals.length,1); assert.ok(saved.snapshot.answers.lifePlan);
  if(await page.getByRole('button',{name:'Start this session',exact:true}).count())await page.getByRole('button',{name:'Start this session',exact:true}).click();await page.screenshot({path:'docs/evidence/self-service/today-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:'docs/evidence/self-service/today-mobile.png',fullPage:true});await page.setViewportSize({width:1365,height:950});
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await page.getByRole('heading',{name:'A life, intentionally lived.',exact:true}).waitFor();
  assert.equal(await page.locator('.pilot-shell').isVisible(),false);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.getByLabel('Username',{exact:true}).fill(testCredentials.username); await page.getByLabel('Passphrase',{exact:true}).fill(testCredentials.password);
  await page.getByRole('button',{name:'Sign in to my space',exact:true}).click();
  await page.getByRole('button',{name:'Goals',exact:true}).click(); await page.getByRole('heading',{name:'Build a daily routine',exact:true}).waitFor();
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
  await mkdir('docs/evidence/self-service',{recursive:true}); await page.screenshot({path:'docs/evidence/self-service/tour-desktop.png',fullPage:true});
  for(let step=2;step<12;step++) {await page.getByRole('button',{name:'Next stop',exact:true}).click(); await page.getByText(`Stop ${step+1} of 12`,{exact:true}).waitFor();}
  await page.getByRole('button',{name:'Finish tour',exact:true}).click(); await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Help & tour',exact:true}).click(); await page.getByRole('button',{name:'Replay app tour',exact:true}).waitFor();
  await page.setViewportSize({width:390,height:844}); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:'docs/evidence/self-service/host-mobile.png',fullPage:true});
}));
