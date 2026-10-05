/* global Setup, GoalVisual, Appearance, Health, Learn, Access, Host, Recovery, DeviceSync */
'use strict';
const $ = selector => document.querySelector(selector);
const labels = { today: 'Today', goals: 'Goals', plan: 'Plan', health: 'Health', learn: 'Learn', profile: 'Profile', settings: 'Settings', setup: 'Your guide' };
const kinds = { task: 'Small task · 5 XP', focus: 'Focus / learning · 15 XP', workout: 'Workout · 25 XP', recovery: 'Recovery · 15 XP', reflection: 'Reflection · 10 XP', weeklyReview: 'Weekly review · 30 XP' };
let snapshot, token, currentView = 'today', busy = false, pendingRequest = null, preview = null, editTask = null, editGoal = null;
let account, guide;
let identityEpoch = 0, resettingIdentity = false;
const accountChannel = 'BroadcastChannel' in window ? new BroadcastChannel('stoic-local-account') : null;
function clearChangedIdentity() {
  if (resettingIdentity) return;
  resettingIdentity = true; identityEpoch++; snapshot = null; token = null; pendingRequest = null;
  document.querySelector('.pilot-shell').hidden = true; $('#main').replaceChildren();
  document.querySelectorAll('dialog').forEach(d => d.remove());
  $('#access').replaceChildren(element('p', 'Your sign-in changed. Opening your current workspace…')); $('#access').hidden = false;
  location.replace('/');
}
if (accountChannel) accountChannel.onmessage = clearChangedIdentity;
function announceAccountChange() { accountChannel?.postMessage('changed'); }
const requestedView = new URLSearchParams(location.search).get('view');
if (Object.hasOwn(labels, requestedView)) currentView = requestedView;
let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let selectedDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
let questionId = 'goals';
let movingSession = null, manualDraft = null, manualPreview = null;
const questions = [
  ['goals', '1. Your main goals', 'What are your three main goals? If you cannot work on all three, which is most important? For example: get fit, grow my business, and spend more time with family. Family comes first.'],
  ['success', '2. What success looks like', 'What would you like to achieve in 3, 6 and 12 months? Include a number or a clear result if you can.'],
  ['learning', '3. Learning and creating', 'What do you want to learn, teach, build or create? What can you do already?'],
  ['deadlines', '4. Deadlines', 'What needs to be finished, and by when? Tell us which dates cannot change. It is okay if you do not know a date yet.'],
  ['obligations', '5. Your commitments', 'What time do you need for work, classes, family, caregiving or travel? Add these commitments to your calendar before approving a schedule.'],
  ['sleep', '6. Sleep and routine', 'What time would you like to go to bed and wake up? What makes that difficult?'],
  ['time', '7. Time for your schedule', 'What hours should we use when planning your day? For example: 07:00–18:00 (7 AM to 6 PM). These hours will appear in Plan, where you can review and change them.'],
  ['habits', '8. Habits and obstacles', 'What makes it hard to follow your plans? For example: not enough time, low energy or distractions.'],
  ['units', '9. Measurement units', 'Choose units before entering weight or height. Existing measurements keep their original units.', 'units'],
  ['age', '10. Age', 'How old are you? This is optional and helps provide context for fitness guidance. It does not create a medical plan.', 'number'],
  ['height', '11. Height', 'How tall are you? Enter your height in inches or centimetres, based on your chosen units. You can skip this question.', 'number'],
  ['weight', '12. Current weight', 'What is your current weight? Enter pounds or kilograms, based on your chosen units. You can skip this question.', 'number'],
  ['health', '13. Health and restrictions', 'Are there injuries, health conditions, medications or instructions from your clinician that we should know about? Share only what you are comfortable sharing.'],
  ['foodRelationship', '14. Food and tracking', 'How has dieting or tracking affected you? Would competition or frequent weigh-ins be unhelpful?'],
  ['bodyGoals', '15. Fitness goals', 'What would you like to change about your fitness or appearance? For example: get stronger, walk farther or build visible abs. Besides weight, how would you notice progress?'],
  ['training', '16. Exercise experience', 'What exercise do you enjoy? What have you done before, and how many days a week can you exercise?'],
  ['equipment', '17. Your exercise equipment', 'What equipment and space can you use? For example: cables, a bench, a barbell, a pull-up bar, a treadmill or boxing equipment.'],
  ['foodPreferences', '18. Food preferences', 'What foods do you like or avoid? Include any allergies, your food budget and how much time you have to cook. Is there an eating schedule you want to try?'],
  ['tracking', '19. Tracking and devices', 'Which measurements or files are you comfortable using? What reminders and privacy controls do you need?'],
  ['style', '20. Coaching and rewards', 'How would you like us to coach you: gently, directly or with challenging questions? What rewards would help you stick with your goals?'],
];
function element(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
function action(text, callback, primary = false) { const b = element('button', text, `button ${primary ? 'primary' : 'ghost'}`); b.type = 'button'; b.dataset.save = ''; b.addEventListener('click', callback); return b; }
function message(text) { $('#notice').textContent = text; $('#notice').hidden = !text; }
function errorMessage(text) { $('#error-message').textContent = text; $('#error-panel').hidden = !text; $('#retry').hidden = !pendingRequest; }
function setBusy(value) { busy = value; document.querySelectorAll('[data-save]').forEach(b => { b.disabled = value || Boolean(pendingRequest); }); $('#retry').disabled = value; $('#reload').disabled = value; }
async function api(path, data, adopt=true) {
  const epoch = identityEpoch, owner = account?.id;
  let response;
  try { response = await fetch(`/api/${path}`, { method: data === undefined ? 'GET' : 'POST', headers: { 'X-Stoic-Token': token || '', 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }); }
  catch { throw new Error('Could not reach the local app. Check that it is running, then retry.'); }
  const result = await response.json();
  if (resettingIdentity || epoch !== identityEpoch) throw Object.assign(new Error('Your sign-in changed.'), {responseStatus:401});
  if (response.status === 403 && !path.startsWith('auth/') && path !== 'bootstrap') {
    // A cookie can change in another tab even when this page's CSRF token has not.
    // Never let a retained operation cross that owner boundary after reconnect.
    let fresh;
    try { const check = await fetch('/api/bootstrap'); if(check.ok) fresh = await check.json(); } catch { /* Clear when identity cannot be verified. */ }
    if (!fresh?.authenticated || fresh.account.id !== owner) { clearChangedIdentity(); throw Object.assign(new Error('Your sign-in changed.'),{responseStatus:401}); }
  }
  if (owner && ((path === 'bootstrap' && result.account?.id !== owner) || (result.snapshot && result.snapshot.ownerId !== owner) || (result.account && result.account.id !== owner))) {
    clearChangedIdentity(); throw Object.assign(new Error('Your sign-in changed.'),{responseStatus:401});
  }
  if (response.status === 401 && !path.startsWith('auth/')) { snapshot = null; token = null; document.querySelector('.pilot-shell').hidden = true; location.replace('/'); throw new Error('Please sign in again.'); }
  if (result.snapshot && adopt) {snapshot = result.snapshot;$('#sync-update').hidden=true;}
  if (result.guide) guide = result.guide;
  if (result.account) account = result.account;
  if (!response.ok) { const e = new Error(result.error || 'This change could not be saved.'); e.responseStatus = response.status; throw e; }
  return result;
}
async function send(path, data, success) {
  if (busy) return;
  setBusy(true); errorMessage('');
  try {
    const result = await api(path, data); pendingRequest = null;
    if (Health.onResult(path, data, result) === false) { message('Inputs changed while the routine preview was loading. Request a fresh preview.'); return; }
    if (path === 'propose') { preview = result; timezone = result.proposal.timezone; selectedDate = data.date; }
    if (path === 'time') manualPreview = result;
    if (path === 'command') {
      if (data.type === 'goal.create' || data.type === 'goal.update') editGoal = null;
      if (data.type === 'task.create' || data.type === 'task.update') editTask = null;
      if (data.type === 'occurrence.move' || data.type === 'occurrence.create') {
        movingSession = null; manualPreview = null; manualDraft = null;
        timezone = data.payload.timezone; selectedDate = dayOf(data.payload.startAt);
      }
    }
    render(); message(success);
  } catch (error) {
    if (resettingIdentity) return;
    pendingRequest = !error.responseStatus || error.responseStatus >= 500 || error.responseStatus === 403 ? { path, data, success } : null;
    if (error.responseStatus === 409) { preview = null; manualPreview = null; render(); }
    errorMessage(error.message);
  } finally { setBusy(false); }
}
function command(type, entityId, payload, baseRevision = 0, success = 'Saved on this computer.') {
  return send('command', { schemaVersion: 1, operationId: crypto.randomUUID(), deviceId: 'local-browser', type, entityId, payload, baseRevision }, success);
}
function time(instant) { return new Intl.DateTimeFormat(undefined, { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(instant)); }
function dayOf(instant) { return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(instant)); }
function level(total) { let rank = 1, remaining = total, cost = 100; while (remaining >= cost) { remaining -= cost; rank++; cost += 25; } return { rank, remaining, cost }; }
function intro(title, subtitle) { const box = element('div', undefined, 'intro'); const text = element('div'); text.append(element('span', 'THE DAILY PRACTICE', 'eyebrow'), element('h1', title), element('p', subtitle)); box.append(text); $('#main').append(box); return box; }
function card(title) { const e = element('section', undefined, 'pilot-card'); if (title) e.append(element('h2', title)); return e; }
function empty(parent, heading, details) { const e = element('div', undefined, 'empty'); e.append(element('h3', heading), element('p', details)); parent.append(e); }
function option(select, value, text) { const o = element('option', text); o.value = value; select.append(o); }
function navigate(view) { if (!Object.hasOwn(labels, view)) return; currentView = view; message(''); render(); $('#main').focus({ preventScroll: true }); }
function render() {
  if (!snapshot) return;
  $('#view-label').textContent = labels[currentView]; $('#total-xp').textContent = `${snapshot.totalXp} XP`;
  const l = level(snapshot.totalXp); $('#level-label').textContent = `Level ${l.rank}`;
  document.querySelectorAll('#navigation button').forEach(b => { if (b.dataset.view === currentView) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  $('#main').replaceChildren();
  $('#main').dataset.view=currentView;
  ({ today: renderToday, goals: renderGoals, plan: renderPlan, health: Health.render, learn: Learn.render, profile: renderProfile, settings: renderSettings, setup: Host.render })[currentView]();
  Host.afterRender();
  setBusy(busy);
}
function renderToday() {
  const heading = intro('Let’s get started.', 'Your workouts, meals and daily practice.');
  Host.dashboard($('#main'));
  const date = element('label', 'Selected date', 'date-field'); const input = element('input'); input.type = 'date'; input.value = selectedDate; input.addEventListener('change', () => { selectedDate = input.value; render(); }); date.append(input); heading.append(date);
  const sessions = snapshot.occurrences.filter(o => dayOf(o.startAt) === selectedDate && snapshot.tasks.find(t=>t.id===o.taskId)?.kind !== 'protected').sort((a,b)=>a.startAt.localeCompare(b.startAt));
  const next = sessions.find(o => o.fraction < 1);
  const upcoming=!next?snapshot.occurrences.filter(o=>o.fraction<1&&dayOf(o.startAt)>selectedDate&&snapshot.tasks.find(t=>t.id===o.taskId)?.kind!=='protected').sort((a,b)=>a.startAt.localeCompare(b.startAt))[0]:null;
  const hero = element('section', undefined, 'pilot-hero'); hero.append(element('span', 'ONE INTENTIONAL STEP', 'eyebrow'));
  hero.append(element('h2', next ? snapshot.tasks.find(t => t.id === next.taskId).title : upcoming ? 'Your next session is ready.' : sessions.length ? 'Leave room to recover.' : 'Make room for your next step.'));
  hero.append(element('p', next ? `${time(next.startAt)}–${time(next.endAt)} · ${timezone}. Your accepted plan stays in your hands.` : upcoming ? `${dayOf(upcoming.startAt)} · ${time(upcoming.startAt)} · ${snapshot.tasks.find(t=>t.id===upcoming.taskId).title}` : 'Open your setup to build or adjust your week.'));
  hero.append(action(next ? 'Start this session' : upcoming ? 'Open next session' : 'See your week', () => {if(next){const detail=document.querySelector(`[data-session="${next.id}"]`);if(detail){detail.open=true;detail.scrollIntoView({behavior:'auto',block:'center'});detail.querySelector('summary').focus();}}else if(upcoming){selectedDate=dayOf(upcoming.startAt);render();}else navigate('plan');}, true)); $('#main').append(hero);
  const metrics = element('div', undefined, 'pilot-metrics');
  for (const [count, label] of [[sessions.filter(o => o.fraction === 1).length, 'sessions completed'], [sessions.reduce((sum, o) => sum + Math.floor(snapshot.tasks.find(t => t.id === o.taskId).budget * o.fraction), 0), 'XP this day'], [snapshot.goals.filter(g => !g.archived).length, 'active goals']]) {
    const m = element('div', undefined, 'metric'); m.append(element('strong', String(count)), element('span', label)); metrics.append(m);
  } $('#main').append(metrics);
  const columns = element('div', undefined, 'pilot-columns'), list = card('Your schedule'), right = card('Today’s Stoic practice');
  const reflections=['Put your effort into the next action you can control. Let the results take time.','A difficult day can still hold one useful choice. Make that choice small enough to begin.','Keep your promises realistic. A steady practice grows through repetition, not punishment.','Rest deliberately. Protect the energy you need for tomorrow’s work.','Notice what interrupted you without judging yourself. Adjust the plan and return to it.','Practice patience with progress. Record what happened, learn from it, and continue.','Make room for the people who matter. Discipline should support the life you want to live.'];
  right.append(element('p',reflections[new Date(selectedDate+'T12:00Z').getUTCDay()]),element('small','Original Stoic-inspired reflection · Stoic Body','muted'));
  if (!sessions.length) empty(list, 'Nothing scheduled yet.', 'Add a goal and a task, then review a proposed day.');
  for (const occurrence of sessions) {
    const t = snapshot.tasks.find(t => t.id === occurrence.taskId), row = element('article', undefined, 'pilot-row'), head = element('div', undefined, 'row-head');
    head.append(element('h3', t.title), element('span', `${Math.floor(t.budget * occurrence.fraction)} / ${t.budget} XP`, 'xp-mark')); row.append(head);
    row.append(element('p', `${time(occurrence.startAt)}–${time(occurrence.endAt)} · ${Math.round(occurrence.fraction * 100)}% complete${occurrence.locked ? ' · Protected' : ''}`));
    const detail=element('details');detail.dataset.session=occurrence.id;detail.append(element('summary','What to do'));Setup.taskDetails(detail,t.id);row.append(detail);
    const controls = element('div', undefined, 'pilot-actions');
    if (occurrence.fraction < 1) {
      if (occurrence.fraction !== .5) controls.append(action('Half done', () => command('completion.set', occurrence.id, { fraction: .5 }, occurrence.revision)));
      controls.append(action('Complete', () => command('completion.set', occurrence.id, { fraction: 1 }, occurrence.revision, `Done. +${t.budget-Math.floor(t.budget*occurrence.fraction)} XP — your progress is saved.`), true));
    }
    if (occurrence.fraction > 0) controls.append(action('Undo completion', () => command('completion.set', occurrence.id, { fraction: 0 }, occurrence.revision, 'Completion corrected. Only its award was reversed.')));
    if (occurrence.fraction === 0) {
      controls.append(action(occurrence.locked ? 'Unlock session' : 'Protect session', () => command('occurrence.lock', occurrence.id, { locked: !occurrence.locked }, occurrence.revision)));
      if (!occurrence.locked) controls.append(action('Move session', () => { movingSession = occurrence; manualPreview = null; navigate('plan'); }));
    }
    row.append(controls); list.append(row);
  }
  const l = level(snapshot.totalXp); right.append(element('p', 'XP reflects follow-through. It does not measure health or compare you with anyone else.', 'muted'));
  right.append(element('div', `${l.remaining} / ${l.cost} XP to Level ${l.rank + 1}`, 'progress-label'));
  const track = element('div', undefined, 'progress-track'), fill = element('span'); fill.style.width = `${l.remaining / l.cost * 100}%`; track.append(fill); right.append(track);
  right.append(element('p', 'A planned recovery session earns 15 XP. Missing a task does not take away your earned progress.', 'muted'));
  right.append(action('Explore your goals', () => navigate('goals'))); columns.append(list, right); $('#main').append(columns);
  const protectedTime=snapshot.occurrences.filter(o=>dayOf(o.startAt)===selectedDate&&snapshot.tasks.find(t=>t.id===o.taskId)?.kind==='protected');if(protectedTime.length){const d=element('details',undefined,'pilot-card');d.append(element('summary','Sleep, family and other commitments'));for(const o of protectedTime)d.append(element('p',`${time(o.startAt)}–${time(o.endAt)} · ${snapshot.tasks.find(t=>t.id===o.taskId).title}`));$('#main').append(d);}
}
function renderGoals() {
  intro('Give your effort a purpose.', 'Create a goal, then define the small actions that move it forward.');
  const columns = element('div', undefined, 'pilot-columns'), list = card('Your goals'); list.id = 'goal-list';
  if (!snapshot.goals.length) empty(list, 'Start with what matters.', 'One clear goal is enough to begin.');
  for (const g of snapshot.goals) {
    const row = element('article', undefined, 'pilot-row'); row.append(element('h3', g.title), element('p', g.why));
    const tasks = snapshot.tasks.filter(t => t.goalId === g.id), ids = tasks.map(t => t.id), sessions = snapshot.occurrences.filter(o => ids.includes(o.taskId));
    row.append(element('span', `${g.archived ? 'Archived · ' : ''}${tasks.length} tasks · ${sessions.filter(o => o.fraction === 1).length} completed sessions`, 'status-tag'));
    const buttons = element('div', undefined, 'pilot-actions'); buttons.append(action('Edit goal', () => { editGoal = g; render(); }), action(g.archived ? 'Restore goal' : 'Archive goal', () => command('goal.archive', g.id, { archived: !g.archived }, g.revision))); row.append(buttons); list.append(row);
  }
  const forms = element('div', undefined, 'pilot-stack'), goalCard = card(editGoal ? 'Edit your goal' : 'A new direction');
  goalCard.insertAdjacentHTML('beforeend', '<form id="goal-form" class="pilot-form"><label>Goal title<input name="title" required maxlength="160"></label><label>Why it matters<textarea name="why" required maxlength="1000"></textarea></label><button class="button primary" data-save type="submit">Save goal</button></form>');
  const gf = goalCard.querySelector('form'); if (editGoal) { gf.elements.title.value = editGoal.title; gf.elements.why.value = editGoal.why; goalCard.append(action('Cancel edit', () => { editGoal = null; render(); })); }
  gf.addEventListener('submit', event => { event.preventDefault(); const g = editGoal; const payload = { title: gf.elements.title.value, why: gf.elements.why.value }; void command(g ? 'goal.update' : 'goal.create', g?.id || crypto.randomUUID(), payload, g?.revision || 0); });
  const taskCard = card(editTask ? 'Edit your action' : 'Make it actionable');
  taskCard.insertAdjacentHTML('beforeend', '<form id="task-form" class="pilot-form"><label>Task title<input name="title" required maxlength="160"></label><label>Action type<select name="kind"></select></label><label>Linked goal<select name="goal"></select></label><div class="form-pair"><label>Duration (minutes)<input name="duration" type="number" min="1" max="1440" value="30" required></label><label>Priority<select name="priority"><option value="1">Normal</option><option value="3">High</option><option value="5">Highest</option></select></label></div><div class="form-pair"><label>Preparation (minutes)<input name="prep" type="number" min="0" max="1440" value="0" required></label><label>Buffer (minutes)<input name="buffer" type="number" min="0" max="1440" value="0" required></label></div><button class="button primary" data-save type="submit">Save task</button></form>');
  const tf = taskCard.querySelector('form'); Object.entries(kinds).forEach(([key, label]) => option(tf.elements.kind, key, label)); option(tf.elements.goal, '', 'Obligation, health or recreation'); snapshot.goals.filter(g => !g.archived).forEach(g => option(tf.elements.goal, g.id, g.title));
  if (editTask) {
    const t = editTask; tf.elements.title.value = t.title; tf.elements.kind.value = t.kind; tf.elements.kind.disabled = true; tf.elements.goal.value = t.goalId || ''; tf.elements.duration.value = t.durationMinutes; tf.elements.priority.value = String(t.priority); tf.elements.prep.value = t.prepMinutes; tf.elements.buffer.value = t.bufferMinutes;
    if (snapshot.occurrences.some(o => o.taskId === t.id)) ['duration', 'prep', 'buffer'].forEach(key => { tf.elements[key].disabled = true; });
    taskCard.append(action('Cancel edit', () => { editTask = null; render(); }));
  }
  tf.addEventListener('submit', event => {
    event.preventDefault(); const t = editTask; const payload = { title: tf.elements.title.value, goalId: tf.elements.goal.value || null, durationMinutes: Number(tf.elements.duration.value), priority: Number(tf.elements.priority.value), prepMinutes: Number(tf.elements.prep.value), bufferMinutes: Number(tf.elements.buffer.value) };
    if (!t) payload.kind = tf.elements.kind.value; void command(t ? 'task.update' : 'task.create', t?.id || crypto.randomUUID(), payload, t?.revision || 0);
  });
  forms.append(goalCard, taskCard); columns.append(list, forms); $('#main').append(columns);
  const tasks = card('Your action library'); tasks.classList.add('task-list');
  if (!snapshot.tasks.length) empty(tasks, 'No actions yet.', 'Keep the first one small enough to fit a real day.');
  for (const t of snapshot.tasks.filter(t=>t.kind!=='protected')) { const row = element('article', undefined, 'pilot-row'); row.append(element('h3', t.title), element('p', `${t.durationMinutes} min + ${t.prepMinutes + t.travelMinutes + t.bufferMinutes} min preparation, travel and buffer · ${t.budget} XP${t.archived ? ' · Archived' : ''}`)); const controls = element('div', undefined, 'pilot-actions'); controls.append(action('Edit task', () => { editTask = t; render(); $('#task-form input').focus(); }), action(t.archived ? 'Restore task' : 'Archive task', () => command('task.archive', t.id, { archived: !t.archived }, t.revision))); row.append(controls); tasks.append(row); }
  $('#main').append(tasks);
}
function renderPlan() {
  intro('Make room for what matters.', 'Choose an available window. Review every proposed session before saving.');
  Setup.calendar($('#main'));
  const formCard = card('Your available time');
  formCard.insertAdjacentHTML('beforeend', '<form id="plan-form" class="pilot-form"><div class="form-pair"><label>Planning date<input name="date" type="date" required></label><label>Timezone<input name="zone" required></label></div><div class="form-pair"><label>Available from<input name="start" type="time" value="07:00" required></label><label>Available until<input name="end" type="time" value="18:00" required></label></div><p class="muted">Choose time outside sleep, work and protected family commitments. Existing sessions stay in place. Only unscheduled actions are proposed.</p><button class="button primary" data-save type="submit">Preview schedule</button></form>');
  const form = formCard.querySelector('form'); form.elements.date.value = selectedDate; form.elements.zone.value = timezone;
  const window = snapshot.answers.time?.state === 'answered' && String(snapshot.answers.time.value).match(/^(\d\d:\d\d)\s*[–-]\s*(\d\d:\d\d)$/);
  if (window) { form.elements.start.value = window[1]; form.elements.end.value = window[2]; formCard.append(element('p', 'Your saved availability prefilled this window. Review it for this day.', 'saved-state')); }
  form.addEventListener('submit', event => { event.preventDefault(); void send('propose', { date: form.elements.date.value, timezone: form.elements.zone.value, startTime: form.elements.start.value, endTime: form.elements.end.value }, 'Preview ready. Nothing has been added to your calendar.'); });
  $('#main').append(formCard);
  const manual = card(movingSession ? 'Move an existing session' : 'Protect a fixed session'); manual.classList.add('pilot-review');
  manual.insertAdjacentHTML('beforeend', '<form id="manual-form" class="pilot-form"><label>Session task<select name="task" required></select></label><div class="form-pair"><label>Session date and time<input name="when" type="datetime-local" required></label><label>Session timezone<input name="timezone" required></label></div><label class="checkbox-label"><input name="locked" type="checkbox" checked>Protect this session</label><p class="muted">Add family time, appointments or obligations as tasks in Goals first. Preview the exact time before saving.</p><button type="submit" class="button ghost" data-save>Preview session time</button></form>');
  const mf = manual.querySelector('form'); snapshot.tasks.filter(t => !t.archived && t.kind!=='protected').forEach(t => option(mf.elements.task, t.id, t.title));
  mf.elements.when.value = `${selectedDate}T09:00`; mf.elements.timezone.value = timezone;
  if (movingSession) { mf.elements.task.value = movingSession.taskId; mf.elements.task.disabled = true; mf.elements.locked.checked = false; mf.elements.locked.disabled = true; manual.append(action('Cancel move', () => { movingSession = null; manualPreview = null; render(); })); }
  mf.addEventListener('submit', event => { event.preventDefault(); manualDraft = { taskId: mf.elements.task.value, locked: mf.elements.locked.checked, moving: movingSession }; void send('time', { local: mf.elements.when.value, timezone: mf.elements.timezone.value }, 'Review the time, then confirm.'); });
  if (manualPreview && manualDraft) {
    const resolution = manualPreview, draft = manualDraft;
    manual.append(element('p', `${resolution.resolvedLocal.replace('T', ' ')} · ${resolution.timezone}. ${resolution.explanation}`, 'warning'));
    manual.append(action('Confirm session time', () => {
      const payload = { startAt: resolution.startAt, timezone: resolution.timezone };
      if (!draft.moving) { payload.taskId = draft.taskId; payload.locked = draft.locked; }
      void command(draft.moving ? 'occurrence.move' : 'occurrence.create', draft.moving?.id || crypto.randomUUID(), payload, draft.moving?.revision || 0, 'Session time saved.');
    }, true));
  }
  $('#main').append(manual);
  if (preview) {
    const review = card('Review your day'); review.classList.add('pilot-review');
    for (const warning of preview.warnings) review.append(element('p', warning, 'warning'));
    for (const p of preview.proposal.placements) { const row = element('div', undefined, 'preview-item'); row.append(element('h3', snapshot.tasks.find(t => t.id === p.taskId)?.title || 'Task'), element('p', `${time(p.startAt)}–${time(p.endAt)} · Occupies ${time(p.occupiedStartAt)}–${time(p.occupiedEndAt)}`), element('p', p.reason)); review.append(row); }
    for (const p of preview.proposal.unplaced) review.append(element('p', `${snapshot.tasks.find(t => t.id === p.taskId)?.title || 'Task'} stays unplaced: ${p.requiredMinutes} minutes needed, largest gap ${p.largestGapMinutes} minutes. ${p.alternatives.join(' · ')}.`, 'warning'));
    for (const v of preview.proposal.violations) review.append(element('p', v.message, 'warning'));
    if (!preview.proposal.placements.length) empty(review, 'No new sessions fit.', 'Add unscheduled tasks or review the available window.');
    if (preview.proposal.placements.length && !preview.proposal.violations.length) review.append(action('Accept schedule', () => { const id = preview.proposalId; preview = null; void command('schedule.accept', id, {}, 1, 'Schedule saved. Your accepted sessions are ready in Today.'); }, true));
    $('#main').append(review);
  }
  const history = card('Recent plans'); history.classList.add('pilot-review');
  if (!snapshot.scheduleBatches.length) empty(history, 'No accepted plans yet.', 'Preview first, then choose whether to accept.');
  for (const batch of snapshot.scheduleBatches.slice(0, 5)) { const row = element('div', undefined, 'pilot-row'); row.append(element('h3', batch.status === 'accepted' ? 'Accepted schedule' : 'Schedule undone'), element('p', 'Undo is available while all sessions in the plan remain untouched.')); if (batch.status === 'accepted') row.append(action('Undo schedule', () => command('schedule.undo', batch.id, {}, batch.revision, 'Schedule undone. Tasks remain available to plan again.'))); history.append(row); } $('#main').append(history);
}
function renderProfile() {
  if(snapshot.answers.setupV2){void Setup.render($('#main'));return;}
  intro('Know yourself. Plan honestly.', 'One question at a time. Skip, leave unknown, or edit later.');
  const c = card('Your context'), question = questions.find(q => q[0] === questionId);
  c.insertAdjacentHTML('beforeend', '<div class="pilot-form"><label>Question<select id="question-picker"></select></label></div>');
  const picker = c.querySelector('select'); questions.forEach(q => option(picker, q[0], q[1])); picker.value = questionId; picker.addEventListener('change', () => { questionId = picker.value; render(); });
  c.append(element('p', question[2], 'profile-prompt'));
  const form = element('form', undefined, 'pilot-form'), label = element('label', 'Your answer');
  const input = element(question[3] === 'units' ? 'select' : question[3] === 'number' ? 'input' : 'textarea'); input.name = 'answer';
  if (question[3] === 'units') { option(input, '', 'Choose units'); option(input, 'imperial', 'Imperial · pounds and inches'); option(input, 'metric', 'Metric · kilograms and centimetres'); }
  if (question[3] === 'number') { input.type = 'number'; input.step = 'any'; input.min = questionId === 'age' ? '0' : '1'; input.max = questionId === 'age' ? '120' : '1000'; }
  const answer = snapshot.answers[questionId]; if (answer?.state === 'answered') input.value = answer.value;
  input.required = true; label.append(input); form.append(label);
  const save = element('button', 'Save answer', 'button primary'); save.type = 'submit'; save.dataset.save = ''; form.append(save);
  form.addEventListener('submit', event => { event.preventDefault(); void command('profile.answer', 'profile', { questionId, state: 'answered', value: question[3] === 'number' ? Number(input.value) : input.value }, snapshot.profileRevision); }); c.append(form);
  const controls = element('div', undefined, 'pilot-actions'); for (const [state, label] of [['skipped', 'Skip this question'], ['unknown', 'I do not know yet']]) controls.append(action(label, () => command('profile.answer', 'profile', { questionId, state }, snapshot.profileRevision)));
  c.append(controls, element('p', answer ? `Saved: ${answer.state}${answer.unit ? ` (${answer.unit})` : ''}` : 'Not answered yet', 'saved-state'));
  c.append(element('p', `${questions.filter(q => snapshot.answers[q[0]]).length} of ${questions.length} questions addressed. Answers stay in your local account. Health contains meal templates and starter sessions; full personalization remains under development.`, 'muted')); $('#main').append(c);
}
function renderSettings() {
  intro('Make this space yours.', 'Choose the light, the colors and the mood of your daily practice.');
  const appearance = element('div'); appearance.innerHTML = Appearance.markup(); $('#main').append(appearance);
  const storage = card('Your account'); storage.append(element('p', `Signed in as ${account.displayName} (@${account.username}). Your goals, profile, calendar and XP are saved on this computer. A reload does not erase your progress.`, 'muted'), element('p', 'Sign-in protects access through this app; it does not encrypt the database or device credentials against someone with access to your Windows files. Private Windows sync is available below. Native alarms remain in development. This pilot does not send entries to an AI service.', 'muted'),action('Open my guide',Host.help)); $('#main').append(storage);DeviceSync.render($('#main'));Recovery.render($('#main'));
}
document.addEventListener('click', event => { const b = event.target.closest('button[data-view]'); if (b) navigate(b.dataset.view); });
$('#retry').addEventListener('click', () => { if (pendingRequest) { const p = pendingRequest; void send(p.path, p.data, p.success); } });
$('#reload').addEventListener('click', () => { void boot(); });
$('#help').addEventListener('click', () => { if (!busy && !pendingRequest) Host.help(); });
$('#signout').addEventListener('click', () => { if (busy || pendingRequest) { message('Finish or retry your pending save before signing out.'); return; } void Access.signOut(); });
async function boot() {
  if (busy) return;
  setBusy(true);
  try {
    const result = await api('bootstrap'); token = result.token;
    if (!result.authenticated) { snapshot = null; pendingRequest = null; Access.show(); return; }
    $('#access').hidden = true; document.querySelector('.pilot-shell').hidden = false; resetIdle();
    if (['welcome','questions'].includes(guide.state.stage)) { currentView = 'setup'; Host.resetPanel(); }
    if(Recovery.hasPending(account.id))currentView='settings';
    errorMessage(pendingRequest ? 'Reconnected. Your earlier save still needs a retry.' : ''); render();
    if(Recovery.takeConfirmed(account.id))message('Your previous restore completed successfully.');
  } catch (error) { if (!snapshot) Access.show(error.message); else errorMessage(error.message); }
  finally { setBusy(false); }
}
Health.init({ element, action, card, intro, snapshot: () => snapshot, date: () => selectedDate, setDate: d => { selectedDate = d; }, api, command, send, render });
Learn.init({ element, action, card, intro, snapshot: () => snapshot, api, command, render, navigate });
Access.init({element,card,api,announceAccountChange});
Recovery.init({element,card,api,announceAccountChange,account:()=>account,refreshSession:async()=>{const fresh=await api('bootstrap');token=fresh.token;}});
DeviceSync.init({element,card,api,updated:()=>{message('Workspace updated. Open Today, Goals or Plan to see your current records.');}});
Setup.init({element,action,card,intro,snapshot:()=>snapshot,account:()=>account,guide:()=>guide,api,render,navigate,setBusy,setDate:value=>{selectedDate=value;}});
GoalVisual.init({element,action,card,snapshot:()=>snapshot,api,render,navigate});
Host.init({element,action,card,intro,questions,snapshot:()=>snapshot,account:()=>account,guide:()=>guide,api,render,navigate,setBusy});
let idleTimer;
function resetIdle() { clearTimeout(idleTimer); if (account) idleTimer = setTimeout(() => { void Access.signOut(); }, 30 * 60 * 1000); }
document.addEventListener('pointerdown',resetIdle);document.addEventListener('keydown',resetIdle);
let checkingUpdates=false;
async function checkUpdates(){if(checkingUpdates||busy||pendingRequest||!snapshot||resettingIdentity||document.hidden)return;checkingUpdates=true;try{const result=await api('snapshot',undefined,false);if(snapshot&&JSON.stringify(result.snapshot)!==JSON.stringify(snapshot))$('#sync-update').hidden=false;}catch{/* Existing identity guard handles session changes; local work stays visible on network failure. */}finally{checkingUpdates=false;}}
$('#sync-refresh').addEventListener('click',async()=>{if(busy||pendingRequest)return;try{await api('snapshot');preview=null;manualPreview=null;editGoal=null;editTask=null;render();message('Showing the latest saved workspace.');}catch(e){errorMessage(e.message);}});
setInterval(()=>void checkUpdates(),15000);window.addEventListener('focus',()=>void checkUpdates());
void boot();
