import { CoreRepository } from '../../src/core/repository';
import { AccountStore } from '../../src/core/accounts';
const pass='synthetic backup passphrase';
export async function richFixture(repo:CoreRepository, auth:AccountStore, username='alice') {
  const owner=(await auth.register({username,displayName:username,password:pass})).account.id;
  let serial=0;
  const apply=(type:string,entityId:string,payload:unknown,baseRevision=0)=>repo.apply(owner,{schemaVersion:1,operationId:`op-${++serial}`,deviceId:'test-device',type,entityId,payload,baseRevision});
  apply('profile.answer','profile',{questionId:'goals',state:'answered',value:'Private goal'});
  apply('goal.create','goal',{title:'Build a useful app',why:'Learn skills'});
  apply('task.create','task',{title:'Practice',kind:'workout',durationMinutes:30,goalId:'goal'});
  const p=repo.proposeDay(owner,{date:'2026-10-05',timezone:'America/Denver',startTime:'08:00',endTime:'10:00'});
  apply('schedule.accept',p.proposalId,{},1);
  apply('completion.set',`${p.proposalId}-0`,{fraction:1},1);
  apply('health.save','water',{kind:'water',data:{date:'2026-10-05',ml:300,notes:'Synthetic'}});
  const course=(await import('../../src/core/learning-content')).courses[0];
  apply('learning.enroll',course.id,{});
  apply('learning.checkpoint',course.id,{checkpointId:course.checkpoints[0].id,completed:true,notes:'Practice notes'},1);
  auth.saveGuide(owner,{baseRevision:0,state:{stage:'paused',question:4,tourStep:2,tourDone:false}});
  return owner;
}


