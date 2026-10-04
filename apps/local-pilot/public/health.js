/* global window */
'use strict';
window.Health = (() => {
  let ctx, catalog, tab = 'fuel', generation = 0, preview = null, selectedRoutine = '', selectedExercise = '', weightUnit = 'lb';
  let compare = ['balanced', 'omad'];
  let trainingDraft = { adult: false, restrictions: 'unknown', equipment: [], style: 'full-body', minutes: 30, preference: 'higher-reps', goalId: null };
  const edits = {};
  const historyLimits = {};
  const el = (...a) => ctx.element(...a), button = (...a) => ctx.action(...a), records = () => ctx.snapshot().health || [];
  function field(form, name, label, type = 'text', value = '', options = [], required = true) {
    const wrapper = el('label', label), input = el(type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : 'input'); input.name = name; input.setAttribute('aria-label', label);
    if (type === 'select') for (const [key, label] of options) { const option = el('option', label); option.value = key; input.append(option); }
    else if (type !== 'textarea') input.type = type;
    if (type === 'checkbox') { input.checked = Boolean(value); wrapper.className = 'checkbox-label'; }
    else { input.value = value ?? ''; input.required = required; }
    if (type === 'number') { input.min = '0'; input.step = 'any'; }
    if (['text', 'textarea'].includes(type)) input.maxLength = type === 'text' ? 300 : 2000;
    wrapper.append(input); form.append(wrapper); return input;
  }
  const value = (form, name) => form.elements[name].value;
  const numeric = (form, name) => value(form, name) === '' ? null : Number(value(form, name));
  function submit(form, label, handler) { const b = el('button', label, 'button primary'); b.type = 'submit'; b.dataset.save = ''; form.append(b); form.addEventListener('submit', e => { e.preventDefault(); handler(); }); }
  function editor(kind, title) { const c = ctx.card(edits[kind] ? `Edit ${title.toLowerCase()}` : title), form = el('form', undefined, 'pilot-form'); form.id = `${kind}-form`; c.append(form); return [c, form, edits[kind]?.data || {}]; }
  function save(kind, data) { const edit = edits[kind]; void ctx.command('health.save', edit?.id || crypto.randomUUID(), { kind, data: { ...data, date: data.date || ctx.date() } }, edit?.revision || 0, 'Health entry saved.'); }
  function link(parent, source) { const a = el('a', source.title); a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a, el('small', ` · ${source.published || 'Publication date not verified'}${source.access ? ` · ${source.access}` : ''}`, 'muted')); }
  function list(kind, parent, title) {
    const list = ctx.card(title), all = records().filter(r => r.kind === kind).slice().reverse().sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));
    const limit = historyLimits[kind] || 20, entries = all.slice(0, limit);
    if (!entries.length) list.append(el('p', 'Your entries will appear here.', 'muted'));
    for (const r of entries) {
      const row = el('article', undefined, 'pilot-row'), d = r.data;
      row.append(el('h3', String(d.title || d.exercise || (kind === 'water' ? `${d.ml} ml` : kind === 'measurement' ? `${d.metric}: ${d.value} ${d.unit}` : 'Daily check-in'))));
      row.append(el('p', `${d.date}${d.portion ? ` · ${d.portion} · ${d.source}` : ''}${r.archived ? ' · Archived' : ''}`, 'muted'));
      if (kind === 'workout') row.append(el('p', `${d.sets.map(s => `${s.reps} reps × ${s.load} ${s.unit}`).join('; ') || 'Timed practice'} · ${d.duration} min${d.effort === null ? '' : ` · effort ${d.effort}/10`}${d.pain ? ' · discomfort reported' : ''}`, 'muted'));
      const controls = el('div', undefined, 'pilot-actions');
      if (!r.archived) controls.append(button(`Edit ${kind === 'checkin' ? 'check-in' : kind}`, () => { edits[kind] = r; if (kind === 'workout') { selectedRoutine = String(d.routineId); selectedExercise = String(d.exercise); } ctx.render(); }));
      controls.append(button(r.archived ? 'Restore entry' : 'Archive entry', () => ctx.command('health.archive', r.id, { archived: !r.archived }, r.revision, 'Entry updated.')));
      if (kind === 'food' && !r.archived) controls.append(button('Use again', () => { edits.food = { data: { ...r.data, date: ctx.date() } }; ctx.render(); }));
      row.append(controls); list.append(row);
    }
    if (all.length > entries.length) list.append(button(`Show more ${kind} entries`, () => { historyLimits[kind] = limit + 20; ctx.render(); }));
    parent.append(list);
  }
  async function summary(parent, currentGeneration, progress = false) {
    try {
      const result = await ctx.api('health-summary', { date: ctx.date(), unit: weightUnit });
      if (generation !== currentGeneration || !parent.isConnected) return;
      parent.replaceChildren();
      if (!progress) {
        for (const [key, label] of [['calories', 'Calories'], ['protein', 'Protein'], ['carbs', 'Carbohydrate'], ['fat', 'Fat'], ['fiber', 'Fiber']]) {
          const n = result.summary.nutrients[key];
          const text = n.known ? `${label}: ${Number(n.total.toFixed(1))}${key === 'calories' ? '' : ' g'}${n.known < n.entries ? ` · partial (${n.known}/${n.entries} entries)` : ''}` : `${label}: unknown`;
          parent.append(el('p', text, key === 'calories' ? 'health-primary-metric' : 'muted'));
        }
        parent.append(el('p', `Water logged: ${result.summary.waterMl} ml`, 'health-primary-metric'), el('p', 'Logged amounts only. Missing foods and nutrients are not counted; this is not a calorie or hydration prescription.', 'muted'));
      } else {
        const w = result.summary.weight;
        parent.append(el('p', w.mean === null ? 'No weight measurements in this window.' : `7-day measured mean: ${w.mean.toFixed(1)} ${w.unit} · ${w.days} measured days`, 'health-primary-metric'));
        parent.append(el('p', w.change === null ? 'Week comparison: more measured days are needed.' : `Change from previous window: ${w.change > 0 ? '+' : ''}${w.change.toFixed(1)} ${w.unit}`, 'muted'), el('p', w.explanation, 'muted'));
        if (w.points.length) {
          const table = el('table', undefined, 'health-table'); table.append(el('caption', 'Daily measured averages'));
          for (const p of w.points.slice(-14)) { const row = el('tr'); row.append(el('th', p.date), el('td', `${p.value.toFixed(1)} ${w.unit}`)); table.append(row); } parent.append(table);
        }
      }
    } catch (e) { if (generation === currentGeneration && parent.isConnected) parent.textContent = `Summary unavailable: ${e.message}`; }
  }
  function fuel(root, currentGeneration) {
    const columns = el('div', undefined, 'pilot-columns'), left = el('div', undefined, 'pilot-stack'), right = el('div', undefined, 'pilot-stack');
    const totals = ctx.card('What you recorded'); totals.append(el('p', 'Loading your day…', 'muted')); right.append(totals);
    const [food, f, d] = editor('food', 'Log a meal');
    field(f, 'title', 'Food name', 'text', d.title); field(f, 'portion', 'Portion', 'text', d.portion);
    field(f, 'source', 'Nutrition source', 'select', d.source || 'estimate', [['estimate', 'My estimate'], ['label', 'Food label'], ['database', 'Database — identify it in notes']]);
    const detail = el('details'); detail.append(el('summary', 'Optional nutrients')); f.append(detail);
    for (const [key, label] of [['calories', 'Calories (optional)'], ['protein', 'Protein g (optional)'], ['carbs', 'Carbohydrate g (optional)'], ['fat', 'Fat g (optional)'], ['fiber', 'Fiber g (optional)']]) field(detail, key, label, 'number', d[key], [], false);
    field(f, 'notes', 'Food notes / source details', 'textarea', d.notes, [], false);
    submit(f, 'Save food', () => save('food', { date: d.date, title: value(f, 'title'), portion: value(f, 'portion'), source: value(f, 'source'), notes: value(f, 'notes'), ...Object.fromEntries(['calories', 'protein', 'carbs', 'fat', 'fiber'].map(k => [k, numeric(f, k)])) })); left.append(food);
    const [water, wf, wd] = editor('water', 'Water and hydration'); field(wf, 'ml', 'Water (ml)', 'number', wd.ml); field(wf, 'notes', 'Hydration notes', 'text', wd.notes, [], false);
    submit(wf, 'Save water', () => save('water', { date: wd.date, ml: numeric(wf, 'ml'), notes: value(wf, 'notes') })); left.append(water);
    const [checkin, cf, cd] = editor('checkin', 'How you feel');
    for (const [key, label] of [['hunger', 'Hunger (0–10, optional)'], ['energy', 'Energy (0–10, optional)'], ['sleepHours', 'Sleep hours (optional)']]) field(cf, key, label, 'number', cd[key], [], false);
    field(cf, 'digestion', 'Digestion / symptoms', 'text', cd.digestion, [], false); field(cf, 'eatingWindow', 'Eating window, if you track one', 'text', cd.eatingWindow, [], false); field(cf, 'notes', 'Check-in notes', 'textarea', cd.notes, [], false);
    submit(cf, 'Save check-in', () => save('checkin', { date: cd.date, hunger: numeric(cf, 'hunger'), energy: numeric(cf, 'energy'), sleepHours: numeric(cf, 'sleepHours'), digestion: value(cf, 'digestion'), eatingWindow: value(cf, 'eatingWindow'), notes: value(cf, 'notes') })); left.append(checkin);
    list('food', right, 'Recent meals'); list('water', right, 'Recent hydration'); list('checkin', right, 'Recent check-ins'); columns.append(left, right); root.append(columns); void summary(totals, currentGeneration);
  }
  function progress(root, currentGeneration) {
    const columns = el('div', undefined, 'pilot-columns'), [c, f, d] = editor('measurement', 'Record a measurement');
    field(f, 'metric', 'Measurement type', 'select', d.metric || 'weight', [['weight', 'Weight'], ['waist', 'Waist'], ['bodyFat', 'Body-fat estimate']]);
    field(f, 'value', 'Measurement value', 'number', d.value); const unit = field(f, 'unit', 'Measurement unit', 'select', d.unit || 'lb', [['lb', 'lb'], ['kg', 'kg'], ['in', 'in'], ['cm', 'cm'], ['percent', '%']]);
    f.elements.metric.addEventListener('change', () => { unit.value = value(f, 'metric') === 'weight' ? 'lb' : value(f, 'metric') === 'waist' ? 'in' : 'percent'; });
    field(f, 'method', 'Measurement method', 'text', d.method); field(f, 'notes', 'Measurement notes / uncertainty', 'textarea', d.notes, [], false);
    submit(f, 'Save measurement', () => save('measurement', { date: d.date, metric: value(f, 'metric'), value: numeric(f, 'value'), unit: value(f, 'unit'), method: value(f, 'method'), notes: value(f, 'notes') }));
    c.append(el('p', 'Choose a weighing frequency that works for you. Photos and scale readings cannot precisely establish body fat or an exact goal date.', 'muted'));
    const right = el('div', undefined, 'pilot-stack'), trend = ctx.card('The trend, with context'); const units = el('form', undefined, 'pilot-form'); const picker = field(units, 'trend-unit', 'Trend unit', 'select', weightUnit, [['lb', 'lb'], ['kg', 'kg']]); picker.addEventListener('change', () => { weightUnit = picker.value; ctx.render(); }); right.append(units, trend);
    list('measurement', right, 'Measurement history'); columns.append(c, right); root.append(columns); void summary(trend, currentGeneration, true);
  }
  function evidence(root) {
    const chooser = el('div', undefined, 'pilot-form form-pair');
    for (let i = 0; i < 2; i++) { const select = field(chooser, `compare-${i}`, i ? 'Second approach' : 'First approach', 'select', compare[i], catalog.diets.map(d => [d.id, d.name])); select.addEventListener('change', () => { compare[i] = select.value; ctx.render(); }); } root.append(chooser);
    root.append(el('p', 'Food selection, meal timing and energy intake are different choices. These comparisons are education; selecting one does not create a restrictive diet plan.', 'muted'));
    const grid = el('div', undefined, 'pilot-columns'); grid.id = 'diet-comparison';
    for (const id of compare) {
      const d = catalog.diets.find(d => d.id === id), c = ctx.card(d.name); c.append(el('span', `${d.dimension} · ${d.recommendation === 'clinician' ? 'Professional direction' : d.recommendation === 'education' ? 'Education and logging' : 'Comparison option'}`, 'status-tag'));
      for (const [key, label] of [['description', 'What it involves'], ['evidence', 'Evidence and limits'], ['benefits', 'Potential benefits'], ['risks', 'Risks'], ['adequacy', 'Nutrient adequacy'], ['training', 'Training fit'], ['practical', 'Practical considerations'], ['guidance', 'Suitability']]) { c.append(el('h3', label), el('p', d[key], 'muted')); }
      c.append(el('p', `Reviewed ${d.reviewed}. Evidence descriptions are not formal GRADE ratings.`, 'muted'));
      for (const s of d.sources) { const p = el('p', undefined, 'health-source'); link(p, s); c.append(p); } grid.append(c);
    } root.append(grid);
  }
  function routineCard(routine, title) {
    const c = ctx.card(title || routine.title);
    if (!routine.eligible) { routine.reasons.forEach(r => c.append(el('p', r, 'warning'))); return c; }
    c.append(el('p', `${routine.minutes} minutes · ${routine.kind === 'recovery' ? 15 : 25} XP only when the scheduled session is completed`, 'status-tag'), el('p', routine.rationale, 'muted'));
    for (const [label, key] of [['Warm-up', 'warmup'], ['Intensity', 'intensity']]) c.append(el('h3', label), el('p', routine[key], 'muted'));
    for (const exercise of routine.exercises) { const row = el('article', undefined, 'pilot-row'); row.append(el('h3', exercise.name), el('p', exercise.prescription), el('p', exercise.cue, 'muted'), el('p', `Alternative: ${exercise.alternative}`, 'muted')); c.append(row); }
    for (const [label, key] of [['Cooldown', 'cooldown'], ['Progression', 'progression'], ['Recovery and shorter days', 'recovery'], ['When to stop', 'stop']]) c.append(el('h3', label), el('p', routine[key], 'muted'));
    routine.sources.forEach(s => { const p = el('p', undefined, 'health-source'); link(p, s); c.append(p); }); return c;
  }
  function train(root) {
    const columns = el('div', undefined, 'pilot-columns'), left = el('div', undefined, 'pilot-stack'), right = el('div', undefined, 'pilot-stack'), c = ctx.card('Build a starter session'), f = el('form', undefined, 'pilot-form'); c.append(f);
    field(f, 'adult', 'I am 18 or older', 'checkbox', trainingDraft.adult, [], false);
    field(f, 'restrictions', 'Relevant restrictions', 'select', trainingDraft.restrictions, [['unknown', 'Unknown / not reviewed'], ['yes', 'Health, injury, pregnancy or exercise restrictions to review'], ['none', 'No known relevant restrictions']]);
    field(f, 'style', 'Session style', 'select', trainingDraft.style, Object.entries(catalog.trainingStyles));
    field(f, 'minutes', 'Session minutes', 'number', trainingDraft.minutes); field(f, 'preference', 'Repetition preference', 'select', trainingDraft.preference, [['higher-reps', 'Lighter resistance, more repetitions'], ['balanced', 'Moderate repetition range']]);
    const gear = el('fieldset'); gear.append(el('legend', 'Available equipment (bodyweight is always available)'));
    for (const [key, label] of [['cables', 'Cables'], ['bench', 'Bench'], ['barbell', 'Barbell'], ['pullup', 'Pull-up bar'], ['treadmill', 'Treadmill'], ['bag', 'Boxing bag']]) field(gear, key, label, 'checkbox', trainingDraft.equipment.includes(key), [], false); f.append(gear);
    field(f, 'goal', 'Routine goal', 'select', trainingDraft.goalId || '', [['', 'Health / deliberate practice'], ...ctx.snapshot().goals.filter(g => !g.archived).map(g => [g.id, g.title])], false);
    const readDraft = () => ({ adult: f.elements.adult.checked, restrictions: value(f, 'restrictions'), style: value(f, 'style'), minutes: numeric(f, 'minutes'), preference: value(f, 'preference'), equipment: ['cables', 'bench', 'barbell', 'pullup', 'treadmill', 'bag'].filter(k => f.elements[k].checked), goalId: value(f, 'goal') || null });
    submit(f, 'Preview routine', () => { trainingDraft = readDraft(); void ctx.send('training-preview', trainingDraft, 'Routine preview ready. Review before saving.'); });
    c.append(el('p', 'Starter examples use conservative bodyweight/cable movements. A bench, barbell, pull-up bar or bag selection does not automatically prescribe advanced work. A checkbox is not medical clearance.', 'muted')); left.append(c);
    let previewPanel;
    if (preview) { const review = routineCard(preview, 'Review your starter session'); previewPanel = review; if (preview.eligible) review.append(button('Save routine to tasks', () => ctx.command('training.create', crypto.randomUUID(), preview.input, 0, 'Routine saved. Review its place in Plan.'), true)); left.append(review); }
    f.addEventListener('input', () => { trainingDraft = readDraft(); preview = null; previewPanel?.remove(); });
    const routines = records().filter(r => r.kind === 'routine' && !r.archived);
    if (routines.length) {
      if (!routines.some(r => r.id === selectedRoutine)) selectedRoutine = routines[0].id;
      const picker = el('form', undefined, 'pilot-form'), select = field(picker, 'routine', 'Saved routine', 'select', selectedRoutine, routines.map(r => [r.id, r.data.title])); select.addEventListener('change', () => { selectedRoutine = select.value; selectedExercise = ''; edits.workout = null; ctx.render(); }); right.append(picker);
      const routine = routines.find(r => r.id === selectedRoutine), [log, lf, ld] = editor('workout', 'Record actual practice');
      if (!routine.data.exercises.some(e => e.name === selectedExercise)) selectedExercise = routine.data.exercises[0].name;
      const exercise = field(lf, 'exercise', 'Exercise', 'select', selectedExercise, routine.data.exercises.map(e => [e.name, e.name])); exercise.addEventListener('change', () => { selectedExercise = exercise.value; loadAdvice(); });
      const firstSet = ld.sets?.[0], mixedSets = ld.sets?.some(s => s.reps !== firstSet.reps || s.load !== firstSet.load || s.unit !== firstSet.unit);
      if (mixedSets) {
        lf.append(el('p', 'This entry contains different sets. Each recorded set is preserved and can be edited below.', 'muted'));
        ld.sets.forEach((s, i) => { const group = el('fieldset'); group.append(el('legend', `Set ${i + 1}`)); field(group, `reps${i}`, `Set ${i + 1} repetitions`, 'number', s.reps); field(group, `load${i}`, `Set ${i + 1} load`, 'number', s.load); field(group, `unit${i}`, `Set ${i + 1} unit`, 'select', s.unit, [['lb', 'lb'], ['kg', 'kg']]); lf.append(group); });
      } else {
        field(lf, 'count', 'Number of matching sets', 'number', ld.sets?.length ?? 2); field(lf, 'reps', 'Repetitions per set', 'number', firstSet?.reps ?? 12); field(lf, 'load', 'Load per set', 'number', firstSet?.load ?? 0); field(lf, 'unit', 'Load unit', 'select', firstSet?.unit || 'lb', [['lb', 'lb'], ['kg', 'kg']]);
        lf.append(el('p', 'Use zero load for bodyweight. Use zero sets for a timed-only practice. This entry records matching sets; log another entry for sets with different reps or loads.', 'muted'));
      }
      field(lf, 'duration', 'Exercise duration (minutes)', 'number', ld.duration || 5); field(lf, 'effort', 'Effort (0–10, optional)', 'number', ld.effort, [], false); field(lf, 'pain', 'Discomfort or pain occurred', 'checkbox', ld.pain || false, [], false); field(lf, 'notes', 'Exercise notes', 'textarea', ld.notes, [], false);
      submit(lf, 'Save exercise log', () => {
        let sets;
        if (mixedSets) sets = ld.sets.map((_, i) => ({ reps: numeric(lf, `reps${i}`), load: numeric(lf, `load${i}`), unit: value(lf, `unit${i}`) }));
        else { const count = numeric(lf, 'count'); if (!Number.isInteger(count) || count < 0 || count > 30) { lf.elements.count.setCustomValidity('Choose 0–30 matching sets.'); lf.elements.count.reportValidity(); return; } lf.elements.count.setCustomValidity(''); sets = Array.from({ length: count }, () => ({ reps: numeric(lf, 'reps'), load: numeric(lf, 'load'), unit: value(lf, 'unit') })); }
        save('workout', { date: ld.date, routineId: selectedRoutine, exercise: value(lf, 'exercise'), sets, duration: numeric(lf, 'duration'), effort: numeric(lf, 'effort'), pain: lf.elements.pain.checked, notes: value(lf, 'notes') });
      });
      lf.elements.count?.addEventListener('input', () => lf.elements.count.setCustomValidity(''));
      right.append(log); const details = el('details'); details.append(el('summary', 'View saved session instructions'), routineCard(routine.data)); right.append(details);
      const advice = ctx.card('Progression review'); advice.append(el('p', 'Loading your practice history…', 'muted')); right.append(advice); const current = generation;
      let adviceRequest = 0;
      function loadAdvice() {
        const request = ++adviceRequest; advice.replaceChildren(el('h2', 'Progression review'), el('p', 'Loading your practice history…', 'muted'));
        void ctx.api('training-advice', { routineId: selectedRoutine, exercise: selectedExercise }).then(result => { if (request === adviceRequest && current === generation && advice.isConnected) { advice.replaceChildren(el('h2', 'Progression review'), el('p', result.text, 'muted')); } }).catch(e => { if (request === adviceRequest && advice.isConnected) advice.textContent = e.message; });
      }
      loadAdvice();
      list('workout', right, 'Recent exercise logs');
    } else right.append(el('p', 'Save a reviewed routine to unlock exercise logging. Its task will appear in Plan; you choose when it belongs in your day.', 'empty'));
    columns.append(left, right); root.append(columns);
  }
  function render() {
    const current = ++generation;
    ctx.intro('Build your health practice.', 'Fuel, movement and measured progress, connected to the rest of your life.');
    const root = document.querySelector('#main'), toolbar = el('div', undefined, 'health-toolbar'), dateForm = el('div', undefined, 'pilot-form');
    const date = field(dateForm, 'health-date', 'Health date', 'date', ctx.date()); date.addEventListener('change', () => { if (date.value) { ctx.setDate(date.value); ctx.render(); } }); toolbar.append(dateForm);
    const tabs = el('nav', undefined, 'health-tabs'); tabs.setAttribute('aria-label', 'Health views');
    for (const [key, label] of [['fuel', 'Fuel'], ['train', 'Train'], ['progress', 'Progress'], ['evidence', 'Evidence']]) { const b = button(label, () => { tab = key; ctx.render(); }); if (tab === key) b.setAttribute('aria-current', 'page'); tabs.append(b); } toolbar.append(tabs); root.append(toolbar);
    if (!catalog) { root.append(el('p', 'Opening the evidence library…', 'muted')); void ctx.api('health-content').then(data => { catalog = data; if (current === generation) ctx.render(); }).catch(e => { if (current === generation) root.append(el('p', e.message, 'warning')); }); return; }
    ({ fuel, train, progress, evidence })[tab](root, current);
  }
  function onResult(path, data, result) {
    if (path === 'training-preview') { if (JSON.stringify(data) !== JSON.stringify(trainingDraft)) return false; preview = result; }
    if (path === 'command' && data.type === 'health.save') edits[data.payload.kind] = null;
    if (path === 'command' && data.type === 'training.create') { selectedRoutine = data.entityId; selectedExercise = ''; preview = null; }
  }
  return { init: context => { ctx = context; }, render, onResult };
})();
