/* global window, Health, Setup */
'use strict';
window.Host = (() => {
  let ctx, panel='', saving=false, pending=null, conflict=null, tour=-1, dialog, highlighted, tourEpoch=0;
  const drafts={}, el=(...a)=>ctx.element(...a), button=(...a)=>ctx.action(...a);
  const stops=[
    ['today',null,'#main .pilot-hero','Start with Today','Setup puts your workouts, meal preparation and habits here. Start the next session, follow its instructions, then mark what you completed.'],
    ['goals',null,'#goal-form','Give your effort a purpose','Create a goal and explain why it matters. Add a small task below it, choose a realistic duration and link it to the goal. Nothing is scheduled yet.'],
    ['plan',null,'#plan-form','Make room for real life','Your setup creates the first week automatically. Move sessions when life changes, or add personal tasks such as learning time. Sleep and commitments remain protected.'],
    ['health','meals','#meal-preview','Know what goes on your plate','Choose chicken, turkey, salmon or a drink. Adjust cooked ingredient weights and review estimated nutrition. Use in food log prepares a draft; Save food records what you ate.'],
    ['health','fuel','#food-form','Record your actual day','Food, water, energy and sleep logs help you notice patterns. Unknown nutrients stay unknown. Food logs and eating fewer calories never earn XP.'],
    ['health','train','#main .pilot-columns','Train within your reality','Your setup already adds workouts to Today. Here you can build an extra routine and log actual sets, repetitions and effort. Follow the instructions inside each session.'],
    ['health','progress','#main .pilot-columns','Look at the trend','Record weight or optional measurements with units and method. Trends include uncertainty; a single weigh-in does not decide your next meal or predict an exact goal date.'],
    ['health','evidence','#diet-comparison','Understand your options','Compare diet evidence, risks and sources. Meal timing and food choices are different. Selecting OMAD or another approach does not automatically create a daily prescription.'],
    ['learn',null,'#main','Learn, then put it to work','Choose a path, open its learning resource, keep notes and complete practical checkpoints. Add a practice task to Plan. XP comes from the scheduled practice, not repeated checkboxes.'],
    ['profile',null,'#main','Your context can change','Revisit any questionnaire answer here. Skip or mark unknown when needed. Availability can prefill Plan; all recommendations still need your review.'],
    ['settings',null,'#main','Make this space comfortable','Choose your theme and colors. Download an encrypted backup or review local recovery points in Data & recovery. Device sync and native alarms remain launch work. Help & tour is always available.'],
    ['today',null,'.pilot-level','Progress is what you practice','Complete scheduled actions for XP, or record partial progress. Undo corrects the award. Rest counts. Start with one goal and one manageable session; build from there.'],
  ];
  const guide=()=>ctx.guide();
  const count=()=>ctx.questions.filter(q=>ctx.snapshot().answers[q[0]]).length;
  async function persist(changes) {const g=guide();const r=await ctx.api('guide',{baseRevision:g.revision,state:{...g.state,...changes}});return r.guide;}
  function notice(message){const target=document.querySelector('#host-status')||dialog?.querySelector('.tour-error');if(target)target.textContent=message;}
  async function run(fn){if(saving)return;saving=true;ctx.setBusy(true);try{await fn();notice('');}catch(e){
    if(e.responseStatus===409){pending=null;try{await ctx.api('bootstrap');if(tour>=0)closeTour();ctx.render();notice('Setup changed in another tab. The latest state is loaded; review it before trying again.');}catch(refreshError){notice(refreshError.message);}}
    else notice(e.message);
  }finally{saving=false;ctx.setBusy(false);}}
  function status(parent){const p=el('p','','access-error');p.id='host-status';p.setAttribute('role','alert');parent.append(p);}
  function welcome(root){
    const a=ctx.account();ctx.intro(`Welcome, ${a.displayName}.`,'I’m your Stoic Body guide. Let’s turn the things you care about into a day that fits your life.');
    const hero=el('section',undefined,'pilot-hero host-welcome');hero.append(el('span','YOUR FIRST SMALL STEP','eyebrow'),el('h2','Let’s build a week that works for you.'),el('p','Choose your goals, tell me when you have time, and I’ll put together your schedule. Finish setup and start your first session. You can adjust the plan anytime.'));
    hero.append(button('Build my fitness plan',()=>run(async()=>{await persist({stage:'questions'});ctx.render();}),true),button('Explore first',()=>run(async()=>{await persist({stage:'paused'});ctx.navigate('today');})));root.append(hero);
    const card=ctx.card('Ready when you are');card.append(el('p','Choose cut, bulk, lean out or maintain. Pick the exercise, foods and daily habits that fit your life. Finishing setup saves your first week and opens your next action.'),el('p','Most answers are tap-to-select. Exact measurements and times have editable fields. The app calculates your plan automatically; there is no trainer queue.','muted'));status(card);root.append(card);
  }
  function question(root){
    const index=conflict?.question??guide().state.question,q=ctx.questions[index],saved=ctx.snapshot().answers[q[0]],group=Math.floor(index/5);
    ctx.intro(['Your goals','Your daily routine','Your health and fitness','Your preferences'][group],'Tell us what you can. You can skip any question or come back to it later.');
    const card=ctx.card(q[1].replace(/^\d+\. /,''));card.append(el('span',`Question ${index+1} of 20`,'status-tag'));
    const progress=el('progress');progress.max=20;progress.value=count();progress.setAttribute('aria-label','Questions addressed');card.append(progress,el('p',q[2],'profile-prompt'));
    const form=el('form',undefined,'pilot-form'),label=el('label','Your answer'),input=el(q[3]==='units'?'select':q[3]==='number'?'input':'textarea');input.setAttribute('aria-label','Your answer');input.required=true;
    if(q[3]==='units'){for(const [value,title] of [['','Choose units'],['imperial','Imperial · pounds and inches'],['metric','Metric · kilograms and centimetres']]){const o=el('option',title);o.value=value;input.append(o);}}
    else if(q[3]==='number'){input.type='number';input.min=q[0]==='age'?'0':'1';input.max=q[0]==='age'?'120':'1000';input.step='any';}else input.maxLength=4000;
    input.value=drafts[q[0]]??(saved?.state==='answered'?saved.value:'');input.addEventListener('input',()=>{drafts[q[0]]=input.value;});label.append(input);form.append(label);
    if(conflict)card.append(el('p','This answer changed in another tab. Your draft is kept below. Compare it with the saved answer before replacing it.','warning'),el('p',`Latest saved answer: ${saved?.state==='answered'?saved.value:saved?.state||'Not answered'}`));
    const submit=el('button',conflict?'Review and save my answer':'Save and continue','button primary');submit.type='submit';submit.dataset.save='';form.append(submit);
    const move=async(changes)=>{await persist(changes);pending=null;conflict=null;ctx.render();};
    async function answer(state,pause=false){
      const key=JSON.stringify([q[0],state,input.value,pause]);
      if(!pending||pending.key!==key)pending={key,command:{schemaVersion:1,operationId:crypto.randomUUID(),deviceId:'local-browser',entityId:'profile',baseRevision:ctx.snapshot().profileRevision,type:'profile.answer',payload:{questionId:q[0],state,...(state==='answered'?{value:q[3]==='number'?Number(input.value):input.value}:{})}}};
      try {
        await ctx.api('command',pending.command);
        await move({stage:pause?'paused':index===19?'ready':'questions',question:Math.min(19,index+1)});
        if(pause)ctx.navigate('today');
      } catch(e) {
        if(e.responseStatus && e.responseStatus<500 && e.responseStatus!==403)pending=null;
        if(e.responseStatus!==409)throw e;
        conflict={question:index};await ctx.api('bootstrap');ctx.render();
      }
    }
    form.addEventListener('submit',e=>{e.preventDefault();void run(()=>answer('answered'));});card.append(form);
    const controls=el('div',undefined,'pilot-actions');
    controls.append(button('Skip this question',()=>run(()=>answer('skipped'))),button('I do not know yet',()=>run(()=>answer('unknown'))));
    if(index>0)controls.append(button('Back',()=>run(()=>move({question:index-1}))));
    controls.append(button('Save and finish later',()=>run(async()=>{if(input.value.trim()){if(!form.reportValidity())return;await answer('answered',true);}else{await persist({stage:'paused'});ctx.navigate('today');}})));
    card.append(controls,el('p',`${count()} of 20 questions completed. ${saved?`Previously saved: ${saved.state}.`:''}`,'muted'));
    if(['height','weight'].includes(q[0])&&ctx.snapshot().answers.units?.state!=='answered')card.append(el('p','Choose measurement units before entering numbers. You can skip this measurement or go back to Question 9.','warning'));
    card.append(el('p','We use your answers to help you get started. You will review plans, reminders and calendar changes before they are applied.','muted'));status(card);root.append(card);
  }
  function firstGoal(){
    const answer=ctx.snapshot().answers.goals,title=answer?.state==='answered'?String(answer.value).split('\n')[0].slice(0,160):'';
    ctx.navigate('goals');const form=document.querySelector('#goal-form');if(form){form.elements.title.value=title;form.elements.why.value='';form.elements.title.focus();}
  }
  function checklist(parent,compact=false){
    const s=ctx.snapshot(),card=ctx.card(compact?'Your next small step':'Your starting point');card.id='host-checklist';
    card.append(el('p',s.answers.lifePlan?'Your week is ready. Open Today to start, or update your answers in Profile.':'Finish the multiple-choice setup to create your workouts, meals and habit schedule.','muted'));
    const rows=[
      [Boolean(s.answers.lifePlan),'Build my personal plan',s.answers.lifePlan?'Update my choices':'Continue setup',()=>run(async()=>{panel='';await persist({stage:'questions'});ctx.navigate('setup');})],
      [s.goals.some(g=>!g.archived),'Choose a meaningful goal','Review my first goal',firstGoal],
      [s.tasks.some(t=>!t.archived),'Make one small action','Create an action',()=>ctx.navigate('goals')],
      [s.occurrences.length>0,'Review a realistic day','Open Plan',()=>ctx.navigate('plan')],
      [guide().state.tourDone,'Learn your way around',guide().state.tourDone?'Replay app tour':guide().state.tourStep?'Resume app tour':'Start app tour',()=>startTour(guide().state.tourDone?0:guide().state.tourStep)],
    ];
    for(const [done,title,label,fn] of rows){const row=el('div',undefined,'host-check-row');row.append(el('span',done?'✓':'○','host-checkmark'),el('span',title),button(label,fn));card.append(row);}
    parent.append(card);
  }
  function render(){const root=document.querySelector('#main');
    if(panel==='help'){ctx.intro('You have a guide.','A quick explanation, a clear next step, or another look around.');checklist(root);const c=ctx.card('How this space works');stops.forEach(s=>{const row=el('details');row.append(el('summary',s[3]),el('p',s[4],'muted'));c.append(row);});status(c);root.append(c);return;}
    if(guide().state.stage!=='welcome'){void Setup.render(root);return;}
    if(conflict){question(root);return;}if(guide().state.stage==='welcome'){welcome(root);return;}if(guide().state.stage==='questions'){question(root);return;}
    ctx.intro('A starting point you can shape.','Your answers are saved. Begin with one goal, one action and one reviewed day.');checklist(root);
    const c=ctx.card('Your context at a glance');for(const q of ctx.questions){const a=ctx.snapshot().answers[q[0]];if(a)c.append(el('h3',q[1]),el('p',a.state==='answered'?`${a.value}${a.unit?` ${a.unit}`:''}`:a.state,'muted'));}status(c);root.append(c);
  }
  function highlight(){highlighted?.classList.remove('tour-target');const stop=stops[tour];if(!stop)return;highlighted=document.querySelector(stop[2]);highlighted?.classList.add('tour-target');}
  function closeTour(){tourEpoch++;dialog?.close();dialog?.remove();dialog=null;highlighted?.classList.remove('tour-target');tour=-1;document.querySelector('#help')?.focus();}
  function showStop(){
    const stop=stops[tour];ctx.navigate(stop[0]);if(stop[1])Health.openTab(stop[1]);
    dialog?.remove();dialog=el('dialog',undefined,'host-tour');dialog.setAttribute('aria-label','Your Stoic Body guide');
    dialog.append(el('span',`Stop ${tour+1} of 12`,'eyebrow'),el('h2',stop[3]),el('p',stop[4]));const error=el('p','','tour-error');error.setAttribute('role','alert');dialog.append(error);
    const epoch=tourEpoch, current=tour;
    const controls=el('div',undefined,'pilot-actions');if(tour>0)controls.append(button('Previous stop',()=>run(async()=>{await persist({tourStep:current-1});if(epoch!==tourEpoch)return;tour=current-1;showStop();})));
    controls.append(button(tour===11?'Finish tour':'Next stop',()=>run(async()=>{if(current===11){await persist({tourDone:true,tourStep:0});if(epoch!==tourEpoch)return;closeTour();ctx.navigate('today');}else{await persist({tourStep:current+1});if(epoch!==tourEpoch)return;tour=current+1;showStop();}}),true));
    const pause=button('Pause tour',closeTour);delete pause.dataset.save;controls.append(pause);dialog.append(controls);
    dialog.addEventListener('cancel',e=>{e.preventDefault();closeTour();});document.body.append(dialog);dialog.showModal();highlight();
  }
  function startTour(step){void run(async()=>{await persist({tourStep:step,tourDone:false});tour=step;showStop();});}
  return {init:context=>{ctx=context;},render,help:()=>{panel='help';ctx.navigate('setup');},dashboard:root=>Setup.dashboard(root),afterRender:()=>{if(tour>=0)highlight();},resetPanel:()=>{panel='';}};
})();

