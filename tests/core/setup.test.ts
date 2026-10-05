import test from 'node:test';
import assert from 'node:assert/strict';
import { activeQuestions, validateSetup, readSetup, legacyCandidates } from '../../src/core/setup-schema';
import { CoreRepository } from '../../src/core/repository';

test('selected areas determine follow-ups and multiple choices survive',()=>{
 const s=validateSetup({version:2,cursor:'areas',answers:{areas:{selections:['learning','business']}}});
 const ids=activeQuestions(s).map(q=>q.id);
 assert.ok(!ids.includes('subjects')&&ids.includes('business'));assert.ok(!ids.includes('equipment'));
 assert.deepEqual(s.answers.areas.selections,['learning','business']);
 assert.throws(()=>validateSetup({...s,answers:{...s.answers,priority:{selections:['fitness','learning']}}}));
 assert.throws(()=>validateSetup({...s,answers:{...s.answers,equipment:{selections:['none','barbell']}}}));
});
test('legacy answers remain intact and candidates require confirmation',()=>{
 const r=new CoreRepository(':memory:');r.createOwner('a');
 r.apply('a',{schemaVersion:1,operationId:'old',deviceId:'test',entityId:'profile',baseRevision:0,type:'profile.answer',payload:{questionId:'goals',state:'answered',value:'Learn coding and build my business'}});
 const snap=r.snapshot('a');const candidates=legacyCandidates(snap.answers);
 assert.ok(candidates.areas.includes('learning'));assert.equal(readSetup(snap).answers.areas,undefined);
 const state=validateSetup({version:2,cursor:'subjects',answers:{areas:{selections:['learning']},subjects:{selections:['web']}}});
 r.apply('a',{schemaVersion:1,operationId:'new',deviceId:'test',entityId:'profile',baseRevision:1,type:'setup.save',payload:{state}});
 assert.equal(r.snapshot('a').answers.goals.value,'Learn coding and build my business');
 assert.deepEqual(readSetup(r.snapshot('a')).answers.subjects.selections,['web']);r.close();
});
test('availability validation rejects invalid days, times and ambiguous empty data',()=>{
 assert.throws(()=>validateSetup({version:2,cursor:null,answers:{availability:{intervals:[{days:[8],start:'08:00',end:'09:00',kind:'free'}]}}}));
 assert.throws(()=>validateSetup({version:2,cursor:null,answers:{availability:{intervals:[{days:[1],start:'99:00',end:'09:00',kind:'free'}]}}}));
});
test('existing numeric answers and recognizable equipment produce reviewable suggestions',()=>{
 const candidates=legacyCandidates({age:{state:'answered',value:33},units:{state:'answered',value:'imperial'},height:{state:'answered',value:68,unit:'in'},weight:{state:'answered',value:170,unit:'lb'},equipment:{state:'answered',value:'cables, bench and pull-up bar'}});
 assert.equal(candidates.suggestions.age.values?.value,'33');assert.equal(candidates.suggestions.measurements.values?.weight,'170');assert.deepEqual(candidates.suggestions.equipment.selections,['cables','bench','pullup']);
});
