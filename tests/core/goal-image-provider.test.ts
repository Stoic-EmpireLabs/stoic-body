import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGoalVisualBrief, UnavailableGoalImageProvider } from '../../src/core/goal-image-provider';
test('unconfigured image editor fails honestly and never substitutes a stock picture',async()=>{
 const p=new UnavailableGoalImageProvider();assert.equal((await p.status()).available,false);await assert.rejects(p.generate(),/not installed/i);
});
test('visual brief needs confirmed adult, current measurements and suitable goals without guessing body fat',()=>{
 const input={profileRevision:3,age:33,restrictions:'none',heightCm:173,weightKg:77,targetKg:70,experience:'new',availableMinutesPerWeek:150,goals:['definition'],visualGender:'female' as const};
 const b=buildGoalVisualBrief(input);assert.equal(b.eligible,true);assert.match(b.prompt,/same person/i);assert.match(b.prompt,/female/i);assert.equal(b.bodyFat,null);
 assert.equal(buildGoalVisualBrief({...input,age:0}).eligible,false);assert.equal(buildGoalVisualBrief({...input,targetKg:40}).eligible,false);assert.equal(buildGoalVisualBrief({...input,restrictions:'unknown'}).eligible,false);
});
