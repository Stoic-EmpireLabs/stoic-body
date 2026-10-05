export class UnavailableGoalImageProvider {
 async status(){return {available:false,reason:'The local image editor is not installed and verified. Your photos stay here; no image will be sent to an external service.'};}
 async generate():Promise<never>{throw new Error('The local image editor is not installed and verified.');}
}
export interface VisualInput {profileRevision:number;age:number;restrictions:string;heightCm:number;weightKg:number;targetKg:number|null;experience:string;availableMinutesPerWeek:number;goals:string[];visualGender:'male'|'female'|null}
export function buildGoalVisualBrief(input:VisualInput){
 const missing:string[]=[],h=input.heightCm/100,currentBmi=input.weightKg/(h*h),targetBmi=input.targetKg===null?null:input.targetKg/(h*h);
 if(!Number.isFinite(input.age)||input.age<18||input.age>120)missing.push('Confirm that you are an adult in setup.');
 if(input.restrictions!=='none')missing.push('Resolve relevant health restrictions with a qualified professional before generating a physique illustration.');
 if(!Number.isFinite(h)||h<1||h>2.5||!Number.isFinite(input.weightKg)||input.weightKg<30||input.weightKg>350)missing.push('Confirm your current height, weight and their units.');
 if(!['new','some','regular'].includes(input.experience)||!Number.isFinite(input.availableMinutesPerWeek)||input.availableMinutesPerWeek<=0)missing.push('Confirm your training experience and available exercise time.');
 if(!input.goals.length)missing.push('Choose your exercise goals.');
 if(input.targetKg!==null&&(!Number.isFinite(input.targetKg)||input.targetKg<=0||targetBmi!<18.5||targetBmi!>40||Math.abs(input.targetKg-input.weightKg)/input.weightKg>.2))missing.push('Review this weight target before using it in a goal illustration.');
 if(currentBmi<18.5||currentBmi>40)missing.push('Get individualized guidance before choosing a visual body-composition target.');
 return {eligible:missing.length===0,profileRevision:input.profileRevision,missingInputs:missing,bodyFat:null,confirmed:input,reviewedAt:new Date().toISOString(),
  assumptions:['A photo cannot establish body-fat percentage or predict your future appearance.','Weight and BMI are screening context only; they do not determine a visual transformation.','The illustration must show moderate, plausible change while preserving your identity and proportions. No guaranteed date or visible abs.'],
  evidenceUrls:['https://www.cdc.gov/bmi/faq/index.html','https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner'],
  prompt:`Edit the uploaded adult client photo. Preserve the same person, recognizable facial features, skin tone, height, skeletal proportions, pose, framing, clothing and background. ${input.visualGender?`The client selected ${input.visualGender} presentation; preserve their own likeness rather than substituting another person.`:'Preserve the uploaded appearance without inferring gender.'} Show only a modest aspirational change in muscle definition consistent with sustainable training. Do not imply an exact body-fat percentage, guaranteed weight-to-appearance mapping, extreme leanness or disproportionate muscle growth. Label: Goal illustration — actual results may look different.`};
}
