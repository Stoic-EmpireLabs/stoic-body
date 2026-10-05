import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { CoreRepository, type Command } from '../../src/core/repository';
import { buildLifePlan } from '../../src/core/life-plan';
import { validateSetup } from '../../src/core/setup-schema';
export const fixture=()=>validateSetup({version:2,cursor:null,answers:{areas:{selections:['learning','business','family']},priority:{selections:['learning']},availability:{intervals:[{days:[1,2,3,4,5],start:'08:00',end:'18:00',kind:'free'},{days:[1,2,3,4,5],start:'09:00',end:'12:00',kind:'fixed',title:'Work'}]},sleep:{values:{start:'23:00',end:'07:00'}},subjects:{selections:['web','automation']},learningLevel:{selections:['new']},sessionLength:{selections:['30']},business:{selections:['portfolio','fiverr']},family:{selections:['weekends']}}});
const command=(type:string,payload:unknown,revision=0):Command=>({schemaVersion:1,operationId:randomUUID(),deviceId:'test',entityId:'profile',baseRevision:revision,type,payload});
test('complete weekly plan respects fixed time, sleep, selected content and family weekends',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const plan=buildLifePlan({setup:fixture(),snapshot:r.snapshot('a'),startDate:'2026-10-05',timezone:'America/Denver',pace:'normal'});
 assert.equal(plan.missing.length,0);assert.ok(plan.tasks.some(t=>t.title.includes('Fiverr')));assert.ok(plan.tasks.some(t=>t.courseId));assert.equal(plan.goals.length,3);
 assert.ok(plan.placements.length>=5);const occupied=plan.placements.map(p=>[Date.parse(p.occupiedStartAt),Date.parse(p.occupiedEndAt)]);
 for(let i=0;i<occupied.length;i++)for(let j=i+1;j<occupied.length;j++)assert.ok(occupied[i][1]<=occupied[j][0]||occupied[j][1]<=occupied[i][0]);
 assert.ok(plan.placements.every(p=>new Intl.DateTimeFormat('en',{timeZone:'America/Denver',weekday:'short'}).format(new Date(p.startAt))!=='Sat'));
 r.close();
});
test('missing availability produces a focused follow-up and no fictitious schedule',()=>{const r=new CoreRepository(':memory:');r.createOwner('a');const s=fixture();delete s.answers.availability;const plan=buildLifePlan({setup:s,snapshot:r.snapshot('a'),startDate:'2026-10-05',timezone:'America/Denver',pace:'normal'});assert.ok(plan.missing.some(m=>m.questionId==='availability'));assert.equal(plan.placements.length,0);r.close();});

test('food selection creates real measured recipes and reserved meal times, with honest OMAD limits',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const setup=validateSetup({version:2,cursor:null,answers:{...fixture().answers,areas:{selections:['food']},health:{selections:['none']},foods:{selections:['chicken','turkey','salmon']},eating:{selections:['omad']},mealTimes:{values:{first:'18:30'}}}});
 const plan=buildLifePlan({setup,snapshot:r.snapshot('a'),startDate:'2026-10-05',timezone:'America/Denver',pace:'normal'});assert.equal(plan.missing.length,0);assert.equal(plan.meals.length,3);assert.ok(plan.meals.every(m=>m.ingredients.every(i=>i.grams>0)));assert.equal(plan.blocks.filter(b=>b.kind==='meal').length,7);assert.ok(plan.warnings.some(w=>w.includes('not a complete OMAD day')));r.close();
});
test('plan acceptance persists one week exactly once and rejects stale proposals',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');r.apply('a',command('setup.save',{state:fixture()}));
 const input={startDate:'2026-10-05',timezone:'America/Denver',pace:'normal' as const};const plan=buildLifePlan({...input,setup:fixture(),snapshot:r.snapshot('a')});
 const c=command('plan.accept',{...input,fingerprint:plan.fingerprint},1);assert.equal(r.apply('a',c).status,'accepted');
 const total=r.snapshot('a').occurrences.length;assert.ok(total>=5);assert.equal(r.apply('a',c).status,'duplicate');assert.equal(r.snapshot('a').occurrences.length,total);
 assert.equal(r.apply('a',command('plan.accept',{...input,fingerprint:plan.fingerprint},1)).status,'conflict');r.close();
});
test('elapsed training windows do not replace the next available strength workout with recovery',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');
 const setup=validateSetup({version:2,cursor:null,answers:{areas:{selections:['fitness']},availability:{intervals:[{days:[1,2],start:'08:00',end:'09:00',kind:'free'}]},sleep:{values:{start:'23:00',end:'07:00'}},age:{values:{value:'33'}},health:{selections:['none']},fitnessGoals:{selections:['strength']},equipment:{selections:['cables']},trainingDays:{selections:['1','2']},trainingTime:{selections:['30']}}});
 const input={setup,snapshot:r.snapshot('a'),startDate:'2026-10-05',timezone:'America/Denver',pace:'normal' as const,notBefore:'2026-10-06T02:00:00.000Z'},plan=buildLifePlan(input);
 assert.equal(plan.missing.length,0);assert.ok(plan.placements.some(p=>plan.tasks.find(t=>t.id===p.taskId)?.routine?.style==='full-body'));assert.ok(plan.placements.every(p=>p.startAt>=input.notBefore));r.close();
});
