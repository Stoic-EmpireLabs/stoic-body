import test from 'node:test';
import assert from 'node:assert/strict';
import { nutritionPlan } from '../../src/core/nutrition-plan';
import { validateSetup } from '../../src/core/setup-schema';
const profile = (goal = 'cut') => validateSetup({version:2,cursor:null,answers:{areas:{selections:['fitness','food']},bodyGoal:{selections:[goal]},age:{values:{value:'33'}},units:{selections:['metric']},measurements:{units:'metric',values:{height:'172.72',weight:'77.1107029',target:'70.30681735'}},physiology:{selections:['male']},activity:{selections:['light']},health:{selections:['none']},eating:{selections:['omad']},diet:{selections:['balanced']}}});
test('cut bulk and maintain produce different transparent energy targets without changing OMAD needs',()=>{
 const cut=nutritionPlan(profile()),maintain=nutritionPlan(profile('maintain')),bulk=nutritionPlan(profile('bulk'));
 assert.ok(cut.targets && maintain.targets && bulk.targets);
 assert.ok(cut.targets.calories < maintain.targets.calories);assert.ok(bulk.targets.calories > maintain.targets.calories);
 assert.equal(cut.targets.protein,123);assert.ok(cut.targets.restingCalories>1680&&cut.targets.restingCalories<1700);
 const regular=profile();regular.answers.eating.selections=['regular'];assert.deepEqual(nutritionPlan(regular).targets,cut.targets);
 assert.ok(cut.notes.some(n=>n.includes('OMAD')));
});
test('equivalent metric and imperial inputs calculate the same targets',()=>{const metric=profile(),imperial=profile();imperial.answers.measurements={selections:[],state:'answered',units:'imperial',values:{height:'68',weight:'170',target:'155'}};assert.deepEqual(nutritionPlan(metric).targets,nutritionPlan(imperial).targets);});
test('missing physiological input, minors, restrictions and underweight goals do not receive automatic dieting targets',()=>{
 for(const key of ['physiology','activity','age','measurements']){const p=profile();delete p.answers[key];assert.equal(nutritionPlan(p).targets,null);}
 for(const restriction of ['medical','pregnancy','food-tracking','unknown']){const p=profile();p.answers.health.selections=[restriction];assert.equal(nutritionPlan(p).targets,null);}
 const minor=profile();minor.answers.age.values={value:'16'};assert.equal(nutritionPlan(minor).targets,null);
 const low=profile();low.answers.measurements.values!.target='45';assert.equal(nutritionPlan(low).targets,null);
});
test('medical liquid diets never receive a DIY calorie prescription; timing and food choices stay distinct',()=>{
 const p=profile();p.answers.diet={selections:['liquid'],state:'answered'};p.answers.liquidType={selections:['clear'],state:'answered'};
 const result=nutritionPlan(p);assert.equal(result.targets,null);assert.equal(result.dietName,'Liquid diet');assert.ok(result.notes.some(n=>n.includes('clinician')));
});
test('excluded profiles get neither numerical targets nor a cut or bulk recommendation',()=>{
 for(const restriction of ['pregnancy','medical','food-tracking']){const p=profile();p.answers.health.selections=[restriction];const n=nutritionPlan(p);assert.equal(n.targets,null);assert.doesNotMatch(n.recommendation,/deficit|muscle gain/);}
 const note=profile();note.answers.health.custom='I take insulin for type 1 diabetes';assert.equal(nutritionPlan(note).targets,null);
 const liquid=profile();liquid.answers.diet={selections:['liquid'],state:'answered'};liquid.answers.liquidType={selections:['clear'],state:'answered'};assert.doesNotMatch(nutritionPlan(liquid).recommendation,/deficit|muscle gain/);
 const female=profile();female.answers.physiology.selections=['female'];assert.ok(nutritionPlan(female).targets!.restingCalories<nutritionPlan(profile()).targets!.restingCalories);
});
