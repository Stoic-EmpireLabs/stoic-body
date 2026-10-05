import { createHash } from 'node:crypto';
import type { Snapshot } from './repository';
import { selected, validateSetup, areaOptions, type SetupState } from './setup-schema';
import { proposeSchedule, type Placement, type PlanningTask, type ScheduleInput } from './scheduler';
import { resolveWallTime } from './time';
import { canonical, zone } from './validation';
import { buildRoutine, type Routine } from './training';
import { courses } from './learning-content';
import { mealCatalog, previewMeal } from './meals';
import type { ActionKind } from './xp';

export interface LifeTask {id:string;goalId:string|null;title:string;kind:ActionKind;minutes:number;detail:string;reason:string;courseId?:string;url?:string;routine?:Routine;priority:number;day:number}
export interface PlanBlock {id:string;title:string;startAt:string;endAt:string;kind:'sleep'|'fixed'|'family'|'meal'}
export interface LifePlanDraft {fingerprint:string;startDate:string;timezone:string;pace:'normal'|'lighter';profileRevision:number;goals:{id:string;title:string;why:string}[];tasks:LifeTask[];blocks:PlanBlock[];placements:Placement[];unplaced:{taskId:string;reason:string}[];missing:{questionId:string;message:string}[];warnings:string[];milestones:string[];meals:ReturnType<typeof previewMeal>[];assumptions:string[]}
const addDays=(d:string,n:number)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
const hash=(v:unknown)=>createHash('sha256').update(canonical(v)).digest('hex');
export function buildLifePlan(input:{setup:SetupState;snapshot:Snapshot;startDate:string;timezone:string;pace:'normal'|'lighter'}):LifePlanDraft{
 const s=validateSetup(input.setup),snap=input.snapshot,date=input.startDate,tz=zone(input.timezone);
 if(!/^\d{4}-\d\d-\d\d$/.test(date)||!Number.isFinite(Date.parse(date))||addDays(date,0)!==date)throw new Error('Choose a valid start date.');
 if(!['normal','lighter'].includes(input.pace))throw new Error('Choose a valid pace.');
 const fingerprint=hash({s,date,tz,pace:input.pace,revision:snap.profileRevision,tasks:snap.tasks,occurrences:snap.occurrences,goals:snap.goals});
 const prefix='w'+fingerprint.slice(0,15),areas=selected(s,'areas'),one=(key:string,fallback='')=>selected(s,key)[0]||fallback;
 const plan:LifePlanDraft={fingerprint,startDate:date,timezone:tz,pace:input.pace,profileRevision:snap.profileRevision,goals:[],tasks:[],blocks:[],placements:[],unplaced:[],missing:[],warnings:[],milestones:[],meals:[],assumptions:['This is a first-week starting plan. Review the timing, meal portions and exercise suitability before accepting.','Long-term milestones are checkpoints, not guaranteed results or completion dates.']};
 const missing=(questionId:string,message:string)=>plan.missing.push({questionId,message});
 if(!areas.length)missing('areas','Choose at least one area you want help with.');
 const intervals=s.answers.availability?.state==='answered'?s.answers.availability.intervals||[]:[];
 if(!intervals.some(i=>i.kind==='free'))missing('availability','Add at least one free-time window so your schedule has somewhere to go.');
 const sleep=s.answers.sleep?.state==='answered'?s.answers.sleep.values:{};
 if(!sleep?.start||!sleep.end||sleep.start===sleep.end)missing('sleep','Confirm bedtime and wake-up time so we can protect your sleep.');
 const start=resolveWallTime(date+'T00:00',tz,{source:'user'}).startAt!,end=resolveWallTime(addDays(date,7)+'T00:00',tz,{source:'user'}).startAt!;
 const previous=snap.answers.lifePlan?.value?JSON.parse(String(snap.answers.lifePlan.value)):null;
 if(previous&&snap.scheduleBatches.some(b=>b.id===previous.batchId&&b.status==='accepted')&&date<addDays(previous.startDate,7)&&addDays(date,7)>previous.startDate)missing('availability','You already have an accepted plan for this week. Choose a later start date, or undo the untouched plan in Calendar before replacing it.');
 const at=(d:string,t:string)=>{const r=resolveWallTime(d+'T'+t,tz,{source:'user',ambiguous:'earlier'});if(r.status!=='exact'&&!plan.warnings.includes(r.explanation))plan.warnings.push(r.explanation);if(!r.startAt)throw new Error(r.explanation);return r.startAt;};
 const available:{startAt:string;endAt:string}[]=[];
 function block(title:string,a:string,b:string,kind:PlanBlock['kind']){const from=new Date(Math.max(Date.parse(a),Date.parse(start))).toISOString(),to=new Date(Math.min(Date.parse(b),Date.parse(end))).toISOString();if(to>from)plan.blocks.push({id:`${prefix}-b${plan.blocks.length}`,title,startAt:from,endAt:to,kind});}
 for(let n=-1;n<7;n++){
  const d=addDays(date,n),weekday=new Date(d+'T12:00:00Z').getUTCDay()||7;
  if(sleep?.start&&sleep.end&&sleep.start!==sleep.end)block('Sleep',at(d,sleep.start),at(addDays(d,sleep.end<=sleep.start?1:0),sleep.end),'sleep');
  if(n>=0&&areas.includes('food')&&s.answers.mealTimes?.state==='answered')for(const t of Object.values(s.answers.mealTimes.values||{}).filter(Boolean)){const a=at(d,t);block('Meal time',a,new Date(Date.parse(a)+30*60000).toISOString(),'meal');}
  for(const i of intervals.filter(i=>i.days.includes(weekday))){const a=at(d,i.start),b=at(addDays(d,i.end<=i.start?1:0),i.end);if(i.kind==='fixed')block(i.title||'Fixed commitment',a,b,'fixed');else if(n>=0)available.push({startAt:a,endAt:b});}
  if(n>=0&&areas.includes('family')){
   if(selected(s,'family').includes('weekends')&&weekday>=6)block('Family time',at(d,'00:00'),at(addDays(d,1),'00:00'),'family');
   else if(selected(s,'family').includes('evenings'))block('Family time',at(d,'18:00'),at(addDays(d,1),'00:00'),'family');
  }
 }
 const overlap=(a:{startAt:string;endAt:string},b:{startAt:string;endAt:string})=>a.startAt<b.endAt&&b.startAt<a.endAt;
 if(plan.blocks.some(a=>a.kind==='meal'&&plan.blocks.some(b=>['sleep','fixed'].includes(b.kind)&&overlap(a,b))))missing('mealTimes','A meal overlaps sleep or a fixed commitment. Adjust its time before accepting.');
 if(plan.blocks.some(a=>a.kind==='sleep'&&plan.blocks.some(b=>b.kind==='fixed'&&overlap(a,b))))missing('availability','A fixed commitment overlaps sleep. Review those times before accepting.');
 if(snap.occurrences.some(o=>plan.blocks.some(b=>overlap(o,b))))missing('availability','An existing calendar session overlaps protected time in this proposal. Move that session in Plan, or adjust your setup, before accepting.');
 for(const area of areas){const existing=snap.goals.find(g=>g.id===`setup-goal-${area}`&&!g.archived);const goal={id:existing?.id||`setup-goal-${area}`,title:existing?.title||areaOptions.find(a=>a[0]===area)![1],why:(existing?.why||s.answers[area]?.custom||s.answers.areas?.custom||'Chosen during setup.').slice(0,1000)};plan.goals.push(goal);}
 const light=input.pace==='lighter'||one('pace')==='light'||selected(s,'habits').includes('overload');
 const focus=Math.min(Number(one('sessionLength','30')),light?20:60),priority=one('priority',areas[0]);
 function task(area:string,title:string,minutes:number,day:number,detail:string,extra:Partial<LifeTask>={}){const t:LifeTask={id:`${prefix}-t${plan.tasks.length}`,goalId:plan.goals.find(g=>g.id.endsWith('-'+area))?.id||null,title:title.slice(0,160),kind:'focus',minutes,day,detail,reason:`Fits your ${area} goal and selected availability.`,priority:area===priority?8:4,...extra};plan.tasks.push(t);}
 const openDays=Array.from({length:7},(_,n)=>n).filter(n=>{const day=new Date(addDays(date,n)+'T12:00:00Z').getUTCDay()||7;return intervals.some(i=>i.kind==='free'&&i.days.includes(day))&&!(areas.includes('family')&&selected(s,'family').includes('weekends')&&day>=6);});
 if(areas.includes('fitness')){
  const adult=s.answers.age?.state==='answered'&&Number(s.answers.age?.values?.value)>=18,clear=selected(s,'health').length===1&&one('health')==='none';
  if(!adult||!clear){plan.warnings.push('Exercise sessions need confirmed adult age and no relevant restrictions, or a professionally supplied plan.');task('fitness','Review a suitable exercise plan',15,openDays[0]??0,'Confirm age and restrictions in setup, or discuss a suitable plan with a qualified professional.');}
  else{
   if(!selected(s,'trainingDays').length)missing('trainingDays','Choose which days you can exercise.');
   if(!selected(s,'equipment').length)missing('equipment','Confirm your equipment, including bodyweight only if appropriate.');
   const choices=selected(s,'fitnessGoals'),equipment=selected(s,'equipment').filter(v=>v!=='none');let lastStrength=-3;
   for(const n of openDays){const weekday=new Date(addDays(date,n)+'T12:00:00Z').getUTCDay()||7;if(!selected(s,'trainingDays').includes(String(weekday)))continue;
    const strength=n-lastStrength>=2;let style=strength?(choices.includes('calisthenics')?'calisthenics':'full-body'):choices.includes('boxing')?'boxing':equipment.includes('treadmill')?'walk':'recovery';
    if(!choices.some(v=>['strength','definition','calisthenics'].includes(v)))style=choices.includes('boxing')?'boxing':equipment.includes('treadmill')?'walk':'recovery';
    if(['full-body','calisthenics'].includes(style))lastStrength=n;
    const minutes=light?30:Number(one('trainingTime','30')),routine=buildRoutine({adult:true,restrictions:'none',equipment,style,minutes,preference:one('reps','balanced')});
    if(!routine.eligible){plan.warnings.push(...routine.reasons);continue;}
    task('fitness',routine.title,routine.minutes,n,[routine.warmup,...routine.exercises.map(e=>`${e.name}: ${e.prescription} ${e.cue}`),routine.cooldown,routine.intensity,routine.progression,routine.stop].join('\n'),{kind:routine.kind,routine,priority:9,reason:routine.rationale});
   }
  }
  plan.milestones.push('Fitness: complete a manageable week; review effort and recovery after three comparable sessions before changing difficulty.');
 }
 if(areas.includes('learning')){
  const map:Record<string,string>={ai:'ai-roadmap',web:'design',coding:'software',automation:'automation',antigravity:'antigravity'},subjects=selected(s,'subjects');
  if(!subjects.length)missing('subjects','Choose a subject so we can select your first lessons.');
  for(const [i,n] of openDays.slice(0,light?3:5).entries()){const course=courses.find(c=>c.id===map[subjects[i%subjects.length]]);if(!course)continue;const step=course.checkpoints[Math.floor(i/subjects.length)%course.checkpoints.length];task('learning',step.title,focus,n,`${one('learningLevel')==='experienced'?'Apply this to a small project and test the result.':one('learningLevel')==='some'?'Review what you know, then complete the practical checkpoint.':'Start with the introduction and work through the checkpoint at your own pace.'}\n${step.deliverable}\nPrerequisites: ${course.prerequisite}\n${course.cost}`,{courseId:course.id,url:step.url,reason:`You chose ${course.title}. Estimated resource time: ${step.minutes} minutes; continue in another session if needed.`});}
  plan.milestones.push('Learning: complete the first practical checkpoint, save what you built, then review the next prerequisite.');
 }
 const actions:Record<string,Record<string,[string,string]>>={business:{offer:['Define one service and its scope','Write the customer problem, deliverables, limits and starting price.'],portfolio:['Build a portfolio example','Choose one synthetic business problem, build a small demo and record how you tested it.'],fiverr:['Improve one Fiverr service','Review the title, scope, pricing and sample work. Draft edits for your review.'],outreach:['Prepare local business outreach','Choose a relevant business, research its needs, and draft a specific introduction. You decide whether to send it.'],delivery:['Work on a client deliverable','Choose the next agreed deliverable and its acceptance checks.']},school:{research:['Work on research','Choose one research question, review a credible source and record citations and notes.'],assignment:['Work on an assignment','Read the rubric, outline the next section and draft it.'],resubmit:['Improve an earlier assignment','Review instructor feedback, identify the scoring gaps and revise one section.'],study:['Study and review','Review one topic and test your recall without notes.']},home:{oil:['Prepare for an oil change','Confirm the exact vehicle and consult its owner/service manual for oil specification, capacity and safe lifting instructions. Gather tools before hands-on work.'],tv:['Prepare the TV wall mount','Confirm the TV/mount ratings, wall structure and hidden utilities. Read the mount instructions and arrange help before lifting.'],bed:['Work on the bed project','Review assembly instructions, check parts and tools, then complete one safe assembly step.'],garage:['Organize one garage section','Choose a small area. Sort and label items; set aside anything needing a disposal decision.'],files:['Organize photos and files','Choose one folder, back up important files, then group and label a small batch. Do not delete originals without review.']}};
 for(const area of ['business','school','home'])if(areas.includes(area)){const picked=selected(s,area);if(!picked.length)missing(area,`Choose the ${area} work you want scheduled.`);picked.forEach((key,i)=>{const a=actions[area][key];if(a)task(area,a[0],area==='home'?30:focus,openDays[i%Math.max(1,openDays.length)]??0,`${a[1]}${s.answers[area]?.custom?'\nYour notes: '+s.answers[area].custom:''}`,{kind:area==='home'?'task':'focus'});});plan.milestones.push(`${area}: finish the first scheduled step, estimate remaining work, and review the next week's scope.`);}
 if(areas.includes('food')){
  if(s.answers.mealTimes?.state!=='answered'||!Object.values(s.answers.mealTimes.values||{}).some(Boolean))missing('mealTimes','Choose meal times so they can be included in your week.');
  const foods=selected(s,'foods'),unsafe=one('health')!=='none'||selected(s,'health').length!==1||Boolean(s.answers.foods?.custom);
  if(!foods.length)missing('foods','Choose your preferred foods.');
  if(unsafe)plan.warnings.push('Review food restrictions and allergy notes before using recipes. Meal quantities are not personalized while restrictions are unresolved.');
  else for(const food of foods.filter(f=>f!=='plant'))plan.meals.push(previewMeal({id:food+'-bowl'}));
  if(foods.includes('plant'))plan.warnings.push('A nutritionally reviewed plant-based recipe is still needed; no meat recipe has been substituted.');
  if(['omad','window'].includes(one('eating')))plan.warnings.push('Your eating-window preference is saved. Recipe portions are examples for one meal, not a complete OMAD day; daily nutritional adequacy needs review before treating them as your full intake.');
  plan.assumptions.push(...mealCatalog.guidance.slice(0,2));
  for(const n of openDays)task('food','Prepare and plan your meals',one('cooking')==='15'?15:30,n,'Choose from the recipe details in this plan. Review total daily intake and allergies. Plain water or unsweetened tea are simple drink options. Use Health to log what you actually eat.',{kind:'task'});
  if(openDays.length)task('food','Plan groceries for the week',20,openDays[0],'Use your selected recipes to list ingredients and quantities. Check what you already have before shopping.',{kind:'task'});
 }
 if(areas.includes('routine'))for(const n of openDays)task('routine','Evening reflection',5,n,'What went well? What needs to change tomorrow? Choose one manageable next step.',{kind:'reflection',priority:1});
 if(one('deadlines')==='known'){const deadline=s.answers.deadlines?.values?.date;if(!deadline)missing('deadlines','Enter the deadline date you selected.');else plan.warnings.push(`Deadline ${deadline}${s.answers.deadlines?.custom?' — '+s.answers.deadlines.custom:''}: remaining work has not been estimated. This starter week does not guarantee completion by that date.`);}
 if(s.answers.areas?.custom)plan.assumptions.push('Your goal notes: '+s.answers.areas.custom);
 if(plan.missing.length)return plan;
 // Existing accepted sessions and their preparation/buffers remain reserved.
 const reserved:ScheduleInput['reserved']=snap.occurrences.map(o=>{const t=snap.tasks.find(t=>t.id===o.taskId)!;return {id:o.id,startAt:new Date(Date.parse(o.startAt)-(t.prepMinutes+t.travelMinutes)*60000).toISOString(),endAt:new Date(Date.parse(o.endAt)+t.bufferMinutes*60000).toISOString(),revision:o.revision,kind:'accepted'};});
 // Overlapping protected time is unioned for the scheduling engine, while labels remain visible.
 const raw=plan.blocks.map(b=>({start:Date.parse(b.startAt),end:Date.parse(b.endAt)})).sort((a,b)=>a.start-b.start),merged:{start:number;end:number}[]=[];
 for(const slot of raw){const prev=merged[merged.length-1];if(prev&&slot.start<=prev.end)prev.end=Math.max(prev.end,slot.end);else merged.push({...slot});}
 merged.forEach((b,i)=>reserved.push({id:`${prefix}-reserved${i}`,startAt:new Date(b.start).toISOString(),endAt:new Date(b.end).toISOString(),revision:1,kind:'fixed'}));
 const tasks:PlanningTask[]=plan.tasks.map(t=>({id:t.id,revision:1,priority:t.priority,durationMinutes:t.minutes,prepMinutes:0,travelMinutes:0,bufferMinutes:5,dependencies:[],earliestAt:at(addDays(date,t.day),t.kind==='reflection'?'18:00':'00:00'),deadlineAt:at(addDays(date,t.day+1),'00:00')}));
 const proposal=proposeSchedule({horizonStart:start,horizonEnd:end,timezone:tz,policyVersion:1,availability:available,reserved,tasks,completedDependencyIds:[]});
 plan.placements=proposal.placements;plan.unplaced=proposal.unplaced;plan.warnings.push(...proposal.violations.map(v=>v.message));
 return plan;
}
