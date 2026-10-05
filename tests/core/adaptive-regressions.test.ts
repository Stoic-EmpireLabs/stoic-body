import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { CoreRepository, type Command } from '../../src/core/repository';
import { validateSetup, legacyCandidates } from '../../src/core/setup-schema';
import { buildLifePlan } from '../../src/core/life-plan';
const state=()=>validateSetup({version:2,cursor:null,answers:{areas:{selections:['learning']},availability:{intervals:[{days:[1,2,3,4,5],start:'08:00',end:'18:00',kind:'free'}]},sleep:{values:{start:'23:00',end:'07:00'}},subjects:{selections:['web']}}});
const command=(type:string,payload:unknown,baseRevision:number,entityId='profile'):Command=>({schemaVersion:1,type,payload,baseRevision,entityId,operationId:randomUUID(),deviceId:'test'});
test('accepting another week retains every earlier lesson instruction and resource',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const s=state();r.apply('a',command('setup.save',{state:s},0));let first='';
 for(const startDate of ['2026-10-05','2026-10-12']){const snap=r.snapshot('a'),req={startDate,timezone:'America/Denver',pace:'normal' as const};const p=buildLifePlan({...req,setup:s,snapshot:snap});if(!first)first=p.tasks[0].id;assert.equal(r.apply('a',command('plan.accept',{...req,fingerprint:p.fingerprint},snap.profileRevision)).status,'accepted');}
 const t=r.snapshot('a').tasks.find(t=>t.id===first)!;assert.ok('instructions' in t);assert.match(JSON.stringify(t),/https:/);r.close();
});
test('undo does not turn sleep and family reservations into unscheduled ordinary tasks',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const s=state();r.apply('a',command('setup.save',{state:s},0));const req={startDate:'2026-10-05',timezone:'America/Denver',pace:'normal' as const},p=buildLifePlan({...req,setup:s,snapshot:r.snapshot('a')});r.apply('a',command('plan.accept',{...req,fingerprint:p.fingerprint},1));const batch=r.snapshot('a').scheduleBatches[0];r.apply('a',command('schedule.undo',{},batch.revision,batch.id));const preview=r.proposeDay('a',{date:'2026-10-05',timezone:'America/Denver',startTime:'07:00',endTime:'23:00'}),snap=r.snapshot('a');assert.ok(preview.proposal.placements.every(p=>snap.tasks.find(t=>t.id===p.taskId)!.kind!=='protected'));r.close();
});
test('lighter weeks never lengthen a chosen session and inactive deadlines cannot block a plan',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const s=state();s.answers.deadlines={selections:['known'],state:'answered',values:{date:''}};assert.equal(buildLifePlan({setup:s,snapshot:r.snapshot('a'),startDate:'2026-10-05',timezone:'America/Denver',pace:'normal'}).missing.length,0);
 const f=validateSetup({...s,answers:{...s.answers,areas:{selections:['fitness']},age:{values:{value:'33'}},health:{selections:['none']},equipment:{selections:['none']},fitnessGoals:{selections:['calisthenics']},trainingDays:{selections:['1']},trainingTime:{selections:['20']}}});const plan=buildLifePlan({setup:f,snapshot:r.snapshot('a'),startDate:'2026-10-05',timezone:'America/Denver',pace:'lighter'});assert.ok(plan.tasks.some(t=>t.routine));assert.ok(plan.tasks.filter(t=>t.routine).every(t=>t.minutes<=20));r.close();
});
test('legacy mixed-unit measurements convert to one explicit unit system before confirmation',()=>{const p=legacyCandidates({height:{state:'answered',value:172.72,unit:'cm'},weight:{state:'answered',value:170,unit:'lb'}}).suggestions.measurements;assert.equal(p.units,'imperial');assert.equal(p.values?.height,'68');});
test('a DST gap that reverses an availability interval asks for a specific correction',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const s=state();s.answers.availability.intervals=[{days:[7],start:'02:30',end:'03:15',kind:'free'}];s.answers.sleep.values={start:'20:00',end:'01:00'};const p=buildLifePlan({setup:s,snapshot:r.snapshot('a'),startDate:'2026-03-02',timezone:'America/Denver',pace:'normal'});assert.ok(p.missing.some(m=>m.questionId==='availability'&&m.message.includes('2026-03-08')));r.close();
});
test('strength recovery is preserved across accepted week boundaries',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');const s=validateSetup({...state(),answers:{...state().answers,areas:{selections:['fitness']},availability:{intervals:[{days:[1,7],start:'08:00',end:'12:00',kind:'free'}]},age:{values:{value:'33'}},health:{selections:['none']},equipment:{selections:['none']},fitnessGoals:{selections:['strength']},trainingDays:{selections:['1','7']},trainingTime:{selections:['30']}}});r.apply('a',command('setup.save',{state:s},0));const req={startDate:'2026-10-05',timezone:'America/Denver',pace:'normal' as const},first=buildLifePlan({...req,setup:s,snapshot:r.snapshot('a')});r.apply('a',command('plan.accept',{...req,fingerprint:first.fingerprint},1));const next=buildLifePlan({...req,startDate:'2026-10-12',setup:s,snapshot:r.snapshot('a')});assert.ok(!next.tasks.some(t=>t.day===0&&t.routine?.style==='full-body'));r.close();
});
