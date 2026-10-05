import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startPilot } from '../../apps/local-pilot/server';
import { authenticatePage } from './helpers';

test('fitness client completes choices and immediately receives a saved workout diet and habit schedule',async()=>{
 const server=await startPilot({databasePath:':memory:',port:0}),browser=await chromium.launch();
 const context=await browser.newContext({timezoneId:'America/Denver',viewport:{width:1365,height:950}}),page=await context.newPage();page.setDefaultTimeout(5000);
 const options:Record<string,string[]>={areas:['fitness','food','routine'],bodyGoal:['cut'],bodyReference:['female'],bodyShape:['average'],priority:['fitness'],pace:['steady'],fitnessGoals:['strength','walking','boxing'],experience:['some'],equipment:['cables','treadmill'],trainingDays:['1','3','5'],trainingTime:['20'],reps:['higher-reps'],health:['none'],units:['imperial'],physiology:['male'],activity:['light'],diet:['balanced'],foods:['chicken','turkey','salmon'],eating:['omad'],cooking:['30'],dailyHabits:['planning','reflection']};
 try{
  await page.clock.install({time:new Date('2026-10-05T13:00:00Z')});await authenticatePage(page,server.url);await page.goto(server.url+'/?view=setup');await mkdir('docs/evidence/self-service',{recursive:true});
  const seen:string[]=[];
  for(let step=0;step<40;step++){
   const card=page.locator('#adaptive-question');await card.waitFor();const key=(await card.getAttribute('data-question'))!;seen.push(key);
   assert.ok(!['subjects','learningLevel'].includes(key));
   for(const value of options[key]||[])await page.locator(`#adaptive-form input[name="choice"][value="${value}"]`).check();
   if(key==='availability')await page.getByRole('button',{name:'Flexible daytime',exact:true}).click();
   if(key==='sleep')await page.getByRole('button',{name:'11 PM – 7 AM',exact:true}).click();
   if(key==='age')await page.getByLabel('Age in years',{exact:true}).fill('33');
   if(key==='measurements'){await page.getByLabel('Height (inches)',{exact:true}).fill('68');await page.getByLabel('Current weight (lb)',{exact:true}).fill('170');await page.getByLabel('Goal weight, optional (lb)',{exact:true}).fill('155');}
   if(key==='mealTimes')await page.getByRole('button',{name:'Dinner at 6:30 PM',exact:true}).click();
   if(key==='bodyShape'){
    assert.match(await page.locator('.body-reference').first().evaluate(e=>getComputedStyle(e).backgroundPosition),/100%/);
    assert.equal((await page.request.get(server.url+'/body-references.webp')).status(),200);
    await page.screenshot({path:'docs/evidence/self-service/body-choices-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'docs/evidence/self-service/body-choices-mobile.png',fullPage:true});await page.setViewportSize({width:1365,height:950});
   }
   if(key==='diet'){await page.getByText(/About \d+ calories · \d+ g protein per day/).waitFor();await page.screenshot({path:'docs/evidence/self-service/diet-options-desktop.png',fullPage:true});}
   await page.locator('#adaptive-form button[type=submit]').click();
   await page.waitForFunction(previous=>document.querySelector('#main')?.getAttribute('data-view')==='today'||document.querySelector('#adaptive-question')?.getAttribute('data-question')!==previous,key);
   if(await page.locator('#main').getAttribute('data-view')==='today')break;
  }
  await page.getByRole('heading',{name:'Let’s get started.',exact:true}).waitFor();
  const saved=await(await page.request.get(server.url+'/api/bootstrap')).json(),plan=JSON.parse(saved.snapshot.answers.lifePlan.value);
  assert.equal(plan.nutrition.goal,'cut');assert.equal(plan.nutrition.targets.protein,123);assert.equal(plan.nutrition.timingName,'OMAD');assert.ok(plan.meals.length===3);
  assert.ok(plan.tasks.some((t:{kind:string})=>t.kind==='workout'));assert.ok(plan.tasks.some((t:{title:string})=>t.title==='Plan my day'));assert.ok(plan.tasks.some((t:{title:string})=>t.title.startsWith('Prepare ')));
  assert.ok(plan.placements.every((p:{startAt:string})=>p.startAt>='2026-10-05T13:00:00.000Z'));assert.equal(plan.missing.length,0);assert.ok(!seen.includes('liquidType'));assert.equal(saved.snapshot.totalXp,0);
  await page.getByRole('button',{name:'Start this session',exact:true}).click();await page.screenshot({path:'docs/evidence/self-service/fitness-today-desktop.png',fullPage:true});
  await page.reload();const again=await(await page.request.get(server.url+'/api/bootstrap')).json();assert.equal(again.snapshot.occurrences.length,saved.snapshot.occurrences.length);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'docs/evidence/self-service/fitness-today-mobile.png',fullPage:true});
 }finally{await browser.close();await server.close();}
});
