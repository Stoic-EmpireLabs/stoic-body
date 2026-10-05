import type { Answer, Snapshot } from './repository';
import { object, keys, text, integer } from './validation';
export interface AvailabilityInput { days:number[]; start:string; end:string; kind:'free'|'fixed'; title?:string }
export interface SetupAnswer { selections:string[]; custom?:string; values?:Record<string,string>; intervals?:AvailabilityInput[]; units?:'imperial'|'metric'; state?:'answered'|'skipped'|'unknown' }
export interface SetupState { version:2; cursor:string|null; answers:Record<string,SetupAnswer> }
export interface QuestionDefinition { id:string; title:string; why:string; type:'multi'|'single'|'hours'|'availability'|'measurement'; options:[string,string][]; areas?:string[]; fields?:[string,string,string][] }
export const areaOptions:[string,string][]=[['fitness','Get fitter'],['food','Eat well'],['learning','Learn new skills'],['business','Grow my business'],['school','Keep up with school'],['home','Finish home projects'],['family','Make time for family'],['routine','Build a daily routine']];
const q=(id:string,title:string,why:string,type:QuestionDefinition['type'],options:[string,string][]=[],areas?:string[],fields?:[string,string,string][]):QuestionDefinition=>({id,title,why,type,options,areas,fields});
export const setupQuestions:QuestionDefinition[]=[
 q('areas','What would you like help with?','Choose all that apply. We will ask only relevant follow-ups.','multi',areaOptions),
 q('bodyGoal','Are you bulking, cutting, or leaning out?','This sets the direction for food and training. You can change it later.','single',[['bulk','Bulk — build muscle and gain weight gradually'],['cut','Cut — lose weight while keeping muscle'],['recomp','Lean out — build strength, with weight roughly steady'],['maintain','Maintain — stay fit at my current weight']],['fitness','food']),
 q('bodyReference','Which pictures would you like to see?','Optional visual examples to help describe your starting point.','single',[['male','Male examples'],['female','Female examples'],['none','Skip pictures']],['fitness']),
 q('bodyShape','Which looks closest to your starting point?','Choose the closest example, or skip. This is not a body-fat measurement.','single',[['slender','Slender build'],['average','Average build'],['fuller','Fuller build'],['athletic','More muscular build']],['fitness']),
 q('priority','Which comes first when time is tight?','This helps us prioritize a busy day.','single',areaOptions),
 q('availability','When do you have time for your goals?','Add free time and fixed commitments. We will plan around them.','availability'),
 q('sleep','When do you want to sleep?','We will keep this time free every day.','hours',[],undefined,[['start','Bedtime','time'],['end','Wake-up time','time']]),
 q('pace','How much would you like to take on?','Start with a week that feels doable.','single',[['light','A little each day'],['steady','A steady routine'],['full','More time for my goals']]),
 q('fitnessGoals','What do you want from exercise?','Choose the changes that matter to you.','multi',[['strength','Get stronger'],['definition','More muscle definition'],['calisthenics','Learn calisthenics'],['walking','Treadmill walking'],['boxing','Boxing and footwork'],['endurance','Improve endurance']],['fitness']),
 q('experience','How much exercise do you do now?','We will start at your current level.','single',[['new','Starting or returning'],['some','Some regular exercise'],['regular','Training consistently']],['fitness']),
 q('equipment','What can you use?','Choose all the equipment you have.','multi',[['none','Bodyweight only'],['cables','Cable machine'],['bench','Bench'],['barbell','Barbell'],['pullup','Pull-up bar'],['treadmill','Treadmill'],['bag','Punching bag']],['fitness']),
 q('trainingDays','Which days work for exercise?','We will leave recovery between demanding sessions.','multi',[['1','Monday'],['2','Tuesday'],['3','Wednesday'],['4','Thursday'],['5','Friday'],['6','Saturday'],['7','Sunday']],['fitness']),
 q('trainingTime','How long can you exercise?','Sessions include warm-up and cooldown.','single',[['20','20 minutes'],['30','30 minutes'],['45','45 minutes'],['60','60 minutes']],['fitness']),
 q('reps','Which style do you prefer?','Equipment and experience also shape the session.','single',[['balanced','Balanced strength training'],['higher-reps','Lighter weights, more repetitions']],['fitness']),
 q('health','Anything that affects exercise or dieting?','This helps us avoid unsuitable starter suggestions.','multi',[['none','No known restrictions'],['injury','Injury or pain'],['medical','Medical condition, medication or a prescribed diet'],['pregnancy','Pregnant, breastfeeding or postpartum'],['food-tracking','Food or weight tracking can be difficult'],['unknown','I am not sure']],['fitness','food']),
 q('age','How old are you?','Age helps us choose appropriate guidance. You may skip it.','measurement',[],['fitness','food'],[['value','Age in years','number']]),
 q('units','Which measurements do you use?','Your measurements keep their own units.','single',[['imperial','Pounds and inches'],['metric','Kilograms and centimetres']],['fitness','food']),
 q('measurements','What is your starting point?','Optional measurements for tracking progress.','measurement',[],['fitness','food'],[['height','Height (inches or cm)','number'],['weight','Current weight (lb or kg)','number'],['target','Goal weight, optional (lb or kg)','number']]),
 q('physiology','Which calorie equation should we use?','The calorie estimate uses a sex-based constant. Your picture preference is separate. Skip if neither equation fits.','single',[['male','Male equation'],['female','Female equation'],['skip','Skip calorie targets']],['food']),
 q('activity','How active is a typical day?','Include your normal work, walking and exercise. Do not count planned workouts twice.','single',[['seated','Mostly sitting, little exercise'],['light','Some walking or light exercise'],['active','On my feet or exercising regularly'],['very-active','Physical work and frequent exercise']],['food']),
 q('diet','Which eating style do you prefer?','We will explain how it fits your goal. Meal timing comes next.','single',[['balanced','Balanced — a variety of foods'],['protein','Higher protein'],['mediterranean','Mediterranean'],['vegetarian','Vegetarian'],['vegan','Vegan'],['low-carb','Low carb'],['keto','Keto'],['carnivore','Carnivore'],['liquid','Liquid diet']],['food']),
 q('liquidType','What do you mean by a liquid diet?','These approaches have very different purposes.','single',[['partial','Replace an occasional meal with a complete meal replacement'],['total','Replace all meals with a liquid program'],['clear','A clinician prescribed clear liquids'],['full','A clinician prescribed full liquids']],['food']),
 q('foods','Which foods would you like?','Choose several. Add allergies or foods to avoid below.','multi',[['chicken','Chicken'],['turkey','Turkey'],['salmon','Fish'],['plant','Plant-based options']],['food']),
 q('eating','When would you like to eat?','Timing does not change how much fuel your body needs.','single',[['regular','Regular meals — breakfast, lunch and dinner'],['two','Two meals a day'],['window','Intermittent fasting — meals within an eating window'],['omad','OMAD — one meal a day'],['unsure','Choose the simplest option for me']],['food']),
 q('cooking','How much time can you spend preparing food?','We will include preparation and grocery time.','single',[['15','About 15 minutes'],['30','About 30 minutes'],['batch','Prepare several meals at once']],['food']),
 q('mealTimes','When would you like to eat?','Enter each meal time you want to protect. Leave unused times blank. These reserve 30 minutes; recipe portions still need a daily-intake review.','hours',[],['food'],[['first','First meal','time'],['second','Second meal, optional','time'],['third','Third meal, optional','time']]),
 q('subjects','What would you like to learn?','Choose your interests. We will rotate focused sessions.','multi',[['ai','AI foundations and agents'],['web','Web and UI design'],['coding','Software development'],['automation','Business automation'],['antigravity','Google Antigravity']],['learning']),
 q('learningLevel','Where are you starting?','We will match practice to your experience.','single',[['new','I am a beginner'],['some','I know the basics'],['experienced','I already build things']],['learning']),
 q('sessionLength','How long should a focus session be?','Choose a length you can repeat.','single',[['15','15 minutes'],['30','30 minutes'],['45','45 minutes'],['60','60 minutes']],['learning','business','school']),
 q('business','What does your business need next?','Choose the work you want time for. Add its name below.','multi',[['offer','Define my service and pricing'],['portfolio','Build a portfolio project'],['fiverr','Improve my Fiverr services'],['outreach','Find and contact potential clients'],['delivery','Work on a client project']],['business']),
 q('school','What schoolwork do you need to do?','Add assignment names below.','multi',[['research','Research'],['assignment','Complete an assignment'],['resubmit','Improve an earlier assignment'],['study','Study and review']],['school']),
 q('home','What would you like to finish at home?','We will begin with preparation and manageable steps.','multi',[['oil','Learn to change my car oil'],['tv','Mount a TV'],['bed','Finish building a bed'],['garage','Clean and organize the garage'],['files','Organize photos and files']],['home']),
 q('deadlines','Do you have a deadline?','Add the project name and exact date if known.','single',[['none','No fixed deadline'],['known','I have a deadline'],['later','I will add it later']],['business','school','home'],[['date','Deadline date','date']]),
 q('family','Which time should stay free for family?','These periods will be kept out of the goal schedule.','multi',[['weekends','All weekend'],['evenings','Evenings after 6 PM'],['custom','I added specific times under availability']],['family']),
 q('dailyHabits','Which daily habits do you want to build?','Choose a few you can repeat. Small steps count.','multi',[['planning','Plan my day'],['reflection','Evening Stoic reflection'],['journal','Write a short journal entry'],['tidy','A five-minute tidy-up'],['pause','A quiet screen-free break']],['routine']),
 q('habits','What gets in your way?','Your plan can be lighter when you need it.','multi',[['time','Too little time'],['energy','Low energy'],['distraction','Distractions'],['overload','Taking on too much'],['consistency','Keeping a routine']]),
 q('style','How would you like your guide to sound?','You can change this anytime.','single',[['gentle','Gentle and encouraging'],['direct','Clear and direct'],['challenge','Challenge me respectfully']]),
 q('rewards','What makes progress feel rewarding?','Streaks and celebrations are optional.','multi',[['xp','Points and levels'],['celebrate','Small celebrations'],['streak','A flexible weekly streak'],['calm','Keep it calm'],['personal','A reward I choose']]),
 q('visual','Would you like a picture of your fitness goal?','An optional illustration from your own photo. Actual results may differ.','single',[['male','Yes — male'],['female','Yes — female'],['later','Maybe later'],['no','No thanks']],['fitness']),
];
export function readSetup(s:Pick<Snapshot,'answers'>):SetupState { const v=s.answers.setupV2;return v?.state==='answered'?validateSetup(JSON.parse(String(v.value))):{version:2,cursor:'areas',answers:{}}; }
export function selected(s:SetupState,key:string):string[]{ const a=s.answers[key];return a?.state==='skipped'||a?.state==='unknown'?[]:a?.selections||[]; }
export const optionalSetupQuestions=['subjects','learningLevel','habits','style','rewards','visual'];
export function activeQuestions(s:SetupState):QuestionDefinition[]{const areas=selected(s,'areas');return setupQuestions.filter(q=>(!q.areas||q.areas.some(a=>areas.includes(a)))&&!optionalSetupQuestions.includes(q.id)&&(q.id!=='liquidType'||selected(s,'diet').includes('liquid'))&&(q.id!=='bodyShape'||['male','female'].includes(selected(s,'bodyReference')[0]))&&(q.id!=='priority'||areas.length>1)&&(q.id!=='sessionLength'||areas.some(a=>['business','school'].includes(a)))).map(q=>q.id==='priority'?{...q,options:q.options.filter(o=>areas.includes(o[0]))}:q);}
export function validTime(v:unknown):v is string{return typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);}
export function validateSetup(input:unknown):SetupState {
 const s=object(input);keys(s,['version','cursor','answers']);if(s.version!==2)throw new Error('Unsupported setup version.');
 if(s.cursor!==null&&!setupQuestions.some(q=>q.id===s.cursor))throw new Error('Unknown setup step.');
 const raw=object(s.answers);keys(raw,setupQuestions.map(q=>q.id));const answers:Record<string,SetupAnswer>={};
 for(const [key,value] of Object.entries(raw)){
  const q=setupQuestions.find(q=>q.id===key)!,a=object(value);keys(a,['selections','custom','values','intervals','state','units']);
  if(a.state!==undefined&&!['answered','skipped','unknown'].includes(String(a.state)))throw new Error('Invalid answer state.');
  const choices=a.selections??[];if(!Array.isArray(choices)||choices.length>q.options.length||choices.some(c=>!q.options.some(o=>o[0]===c))||new Set(choices).size!==choices.length)throw new Error('Choose listed options.');
  if(q.type==='single'&&choices.length>1)throw new Error('Choose one option.');
  if((key==='health'||key==='equipment')&&choices.includes('none')&&choices.length>1)throw new Error('Choose either none or the options that apply.');
  const answer:SetupAnswer={selections:choices as string[],state:(a.state||'answered') as SetupAnswer['state']};
  if(a.units!==undefined){if(key!=='measurements'||!['imperial','metric'].includes(String(a.units)))throw new Error('Invalid measurement units.');answer.units=a.units as 'imperial'|'metric';}
  if(a.custom!==undefined)answer.custom=typeof a.custom==='string'&&a.custom.trim()===''?'':text(a.custom,4000);
  if(a.values!==undefined){const values=object(a.values);keys(values,(q.fields||[]).map(f=>f[0]));answer.values={};for(const [k,v]of Object.entries(values)){if(typeof v!=='string'||v.length>50)throw new Error('Invalid value.');if(v){const field=q.fields!.find(f=>f[0]===k)!;if(field[2]==='number'&&(!Number.isFinite(Number(v))||Number(v)<=0||Number(v)>(key==='age'?120:1000)))throw new Error('Enter a valid measurement.');if(field[2]==='time'&&!validTime(v))throw new Error('Choose a valid time.');if(field[2]==='date'&&(!/^\d{4}-\d\d-\d\d$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v))throw new Error('Choose a valid date.');}answer.values[k]=v;}}
  if(a.intervals!==undefined){if(key!=='availability'||!Array.isArray(a.intervals)||a.intervals.length>30)throw new Error('Invalid availability.');answer.intervals=a.intervals.map(v=>{const i=object(v);keys(i,['days','start','end','kind','title']);if(!Array.isArray(i.days)||!i.days.length||i.days.length>7)throw new Error('Choose days.');i.days.forEach(d=>integer(d,1,7));if(new Set(i.days).size!==i.days.length||!validTime(i.start)||!validTime(i.end)||i.start===i.end||!['free','fixed'].includes(String(i.kind)))throw new Error('Choose valid times and days.');return {days:i.days as number[],start:String(i.start),end:String(i.end),kind:i.kind as 'free'|'fixed',...(i.title?{title:text(i.title,160)}:{})};});}
  answers[key]=answer;
 }
 return {version:2,cursor:s.cursor as string|null,answers};
}
export function legacyCandidates(answers:Record<string,Answer>){
 const originals=Object.entries(answers).filter(([k])=>!['setupV2','lifePlan'].includes(k)).map(([key,a])=>({key,text:a.state==='answered'?String(a.value):a.state}));
 const goals=String(answers.goals?.value||'').toLowerCase(),areas:string[]=[];
 for(const [key,pattern] of [['fitness',/fit|weight|abs|workout|gym|muscle|box/],['food',/diet|meal|food|eat/],['learning',/learn|coding|software|automation|ai/],['business',/business|fiverr|company|consult/],['school',/school|dba|assignment|research/],['home',/garage|oil|bed|mount|organize/],['family',/family|daughter|wife/],['routine',/schedule|routine|stoic/]] as [string,RegExp][])if(pattern.test(goals))areas.push(key);
 const suggestions:Record<string,SetupAnswer>={};
 const suggest=(key:string,selections:string[],custom?:string)=>{if(selections.length)suggestions[key]={selections,state:'answered',...(custom?{custom}:{} )};};
 suggest('areas',areas,String(answers.goals?.value||''));
 for(const key of ['units'])if(answers[key]?.state==='answered')suggest(key,[String(answers[key].value)]);
 if(answers.age?.state==='answered'&&typeof answers.age.value==='number')suggestions.age={selections:[],state:'answered',values:{value:String(answers.age.value)}};
 const unit=answers.weight?.unit||answers.height?.unit,metric=unit==='kg'||unit==='cm';
 const values:Record<string,string>={};for(const key of ['height','weight'])if(answers[key]?.state==='answered'&&typeof answers[key].value==='number'){const a=answers[key];let value=a.value as number;if(key==='height'&&a.unit===(metric?'in':'cm'))value*=metric?2.54:1/2.54;if(key==='weight'&&a.unit===(metric?'lb':'kg'))value*=metric?.45359237:1/.45359237;values[key]=String(Math.round(value*100)/100);}
 if(Object.keys(values).length)suggestions.measurements={selections:[],state:'answered',values,units:metric?'metric':'imperial'};
 const match=(target:string,source:string,pairs:[string,RegExp][])=>{const raw=answers[source]?.state==='answered'?String(answers[source].value):'';suggest(target,pairs.filter(([,p])=>p.test(raw)).map(([v])=>v),raw);};
 match('equipment','equipment',[['cables',/cable/i],['bench',/bench/i],['barbell',/barbell|bench press/i],['pullup',/pull.?up/i],['treadmill',/treadmill/i],['bag',/punching bag|heavy bag/i]]);
 match('subjects','learning',[['ai',/\bai\b|artificial/i],['web',/web|design|frontend/i],['coding',/coding|software|program/i],['automation',/automat/i],['antigravity',/antigravity/i]]);
 match('fitnessGoals','bodyGoals',[['strength',/strong|strength/i],['definition',/abs|definition|muscle/i],['calisthenics',/cal[il]?[is]*then/i],['walking',/walk|treadmill/i],['boxing',/boxing/i]]);
 match('foods','foodPreferences',[['chicken',/chicken/i],['turkey',/turkey/i],['salmon',/fish|salmon/i],['plant',/vegetarian|vegan|plant/i]]);
 match('eating','dietInterest',[['omad',/omad|one meal/i]]);
 return {areas,originals,suggestions};
}
