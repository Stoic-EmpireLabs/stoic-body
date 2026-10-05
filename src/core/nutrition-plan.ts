import { selected, type SetupState } from './setup-schema';
import { diets } from './health-content';

export function nutritionPlan(s:SetupState) {
 const one=(k:string)=>selected(s,k)[0], values=(k:string)=>s.answers[k]?.state==='answered'?s.answers[k].values||{}:{};
 const goal=one('bodyGoal')||'maintain', diet=one('diet')||'balanced', timing=one('eating')||'regular';
 const dietCard=diets.find(d=>d.id===diet), dietName=diet==='liquid'?'Liquid diet':dietCard?.name||'Balanced eating';
 const timingName:Record<string,string>={regular:'Regular meals',two:'Two meals',window:'Intermittent fasting',omad:'OMAD',unsure:'Regular meals'};
 const notes:string[]=[];
 const sources=[{title:'Energy equation: Mifflin et al. (1990)',url:'https://pubmed.ncbi.nlm.nih.gov/2305711/'},{title:'Protein and exercise: ISSN (2017)',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/'},...(dietCard?.sources||[])];
 const result:{goal:string;dietName:string;timingName:string;recommendation:string;targets:null|{calories:number;protein:number;proteinRange:number[];carbs:number;fat:number;maintenanceCalories:number;restingCalories:number;activityMultiplier:number;adjustment:number};notes:string[];sources:typeof sources;reviewed:string}={goal,dietName,timingName:timingName[timing]||'Regular meals',recommendation:goal==='bulk'?'Spread enough food and protein across your day to support gradual muscle gain.':goal==='cut'?'Use a modest energy deficit with strength training to help retain muscle.':goal==='recomp'?'Start near maintenance, train progressively, and watch strength and waist trends.':'Start near maintenance and build a repeatable routine.',targets:null,notes,sources,reviewed:'2026-10-05'};
 const withhold=(message:string)=>{result.recommendation=message;notes.push(message);return result;};
 if(timing==='omad')notes.push('OMAD concentrates your daily food into one meal; it does not reduce your daily calorie or protein needs. Research is limited. One small recipe is not a complete OMAD day. Switch to two or three meals if energy, recovery or food volume makes it difficult.');
 if(timing==='window')notes.push('Intermittent fasting is a timing preference, not an extra calorie deficit. Choose an eating window that fits your meals and training; do not extend fasting to earn points.');
 if(dietCard)notes.push(dietCard.evidence,dietCard.adequacy);
 if(diet==='carnivore'||diet==='keto')notes.push('Preference saved for comparison and logging. This version does not generate a restrictive '+diet+' menu; balanced starter recipes are not labeled as compliant.');
 if(diet==='liquid'){
  sources.push({title:'NICE NG246: restrictive diets',url:'https://www.nice.org.uk/guidance/ng246/chapter/Physical-activity-and-diet'});
  if(one('liquidType')!=='partial')return withhold('Use your clinician’s prescribed liquid plan. Clear/full liquids are medical diets; total replacement programs need nutritional completeness and clinical support. Other goals and your schedule can still start.');
  notes.push('For occasional meal replacement, use a nutritionally complete product and its actual label. A protein shake, juice or lemon water is not automatically a complete meal. Keep varied food in the rest of your day.');
 }
 const age=Number(values('age').value),m=values('measurements'),unit=s.answers.measurements?.units||one('units'),sex=one('physiology'),activity=one('activity');
 const weight=Number(m.weight)*(unit==='imperial'?.45359237:1),height=Number(m.height)*(unit==='imperial'?2.54:1),target=Number(m.target)*(unit==='imperial'?.45359237:1);
 const restrictions=selected(s,'health');
 if(!restrictions.length)return withhold('Your goal is saved. Your health answers and measurements will let us calculate a starting target.');
 if(restrictions.length!==1||restrictions[0]!=='none'||s.answers.health?.custom?.trim())return withhold('Calorie targets are off while health or food-tracking restrictions are unresolved. You can still use your schedule and log the foods you choose.');
 if(!(age>=18&&age<=78)||!['metric','imperial'].includes(unit)||!(height>=120&&height<=230&&weight>=35&&weight<=300)||!['male','female'].includes(sex)||!activity)return withhold('Add adult age, height, weight, units, a calorie equation and activity level to calculate a starting target. You can continue without calorie tracking.');
 const bmi=weight/((height/100)**2),targetBmi=target/((height/100)**2);
 if(bmi<18.5||(goal==='cut'&&target>0&&targetBmi<18.5))return withhold('Automatic dieting targets are off because the current or requested weight is below this adult screening range. This is a screening check, not a diagnosis.');
 const multiplier:Record<string,number>={seated:1.2,light:1.375,active:1.55,'very-active':1.725};
 const resting=10*weight+6.25*height-5*age+(sex==='male'?5:-161),maintenance=resting*multiplier[activity];
 const adjustment=goal==='cut'?-Math.min(350,maintenance*.15):goal==='bulk'?Math.min(250,maintenance*.08):0;
 const calories=Math.round((maintenance+adjustment)/50)*50;
 if(calories<1500)return withhold('The estimate falls below this app’s conservative 1,500-calorie automatic-planning floor. Numerical targets are withheld; that floor is a product guardrail, not a universal calorie requirement.');
 const protein=Math.round(weight*(selected(s,'areas').includes('fitness')?1.6:1.2)),fat=Math.round(calories*.3/9),carbs=Math.round((calories-4*protein-9*fat)/4);
 result.targets={calories,protein,proteinRange:selected(s,'areas').includes('fitness')?[Math.round(weight*1.4),Math.round(weight*2)]:[protein,protein],carbs,fat,maintenanceCalories:Math.round(maintenance),restingCalories:Math.round(resting),activityMultiplier:multiplier[activity],adjustment:Math.round(adjustment)};
 notes.push('Calculated starting estimate, not a measured metabolism. Activity factors and the modest cut/bulk adjustment are app defaults. No workout calories are added a second time. Reassess using 2–3 weeks of intake, weight trend, energy and performance; no guaranteed goal date.');
 if(diet==='keto'||diet==='low-carb'||diet==='carnivore')notes.push('Displayed carbohydrates and fats are a balanced baseline, not a ketogenic or carnivore prescription.');
 return result;
}
