'use strict';
window.Learn = (() => {
  let ctx, catalog, selected = null, selectedCheckpoint = null, filter = 'all', loading = false, loadError = '';
  const enrollment = id => ctx.snapshot().learning.find(e => e.id === id);
  const el = (...args) => ctx.element(...args);
  function link(label, url) { const a = el('a', `${label} ↗`, 'button ghost'); a.setAttribute('aria-label', label); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
  function open(course) { selected = course.id; const saved = enrollment(course.id); selectedCheckpoint = course.checkpoints.find(s => !saved?.checkpoints[s.id]?.completed)?.id || course.checkpoints[0].id; ctx.render(); }
  function progress(course, saved) {
    const done = course.checkpoints.filter(s => saved?.checkpoints[s.id]?.completed).length;
    const wrap = el('div', undefined, 'learn-progress'); const bar = el('progress'); bar.max = course.checkpoints.length; bar.value = done; bar.setAttribute('aria-label', `${course.title} checkpoint progress`);
    wrap.append(el('span', `${done} / ${course.checkpoints.length} checkpoints`), bar); return wrap;
  }
  function stats(root) {
    const s = ctx.snapshot(), states = s.learning.flatMap(e => Object.values(e.checkpoints)), taskIds = new Set(states.map(e => e.taskId));
    const xp = s.occurrences.filter(o => taskIds.has(o.taskId)).reduce((n, o) => n + Math.floor((s.tasks.find(t => t.id === o.taskId)?.budget || 0) * o.fraction), 0);
    const row = el('div', undefined, 'learn-stats');
    for (const text of [`${s.learning.length} active paths`, `${states.filter(s => s.completed).length} checkpoints completed`, `${xp} practice XP`]) row.append(el('span', text, 'status-tag'));
    root.append(row);
  }
  function render() {
    ctx.intro('Build what you learn.', 'Pick a path. Practice something real. Let the next small win lead you forward.');
    const root = el('div'); root.id = 'learn-root'; document.querySelector('#main').append(root);
    if (!catalog) {
      root.append(el('p', loadError || 'Opening your learning library…', 'muted'));
      if (loadError) root.append(ctx.action('Retry course library', () => { loadError = ''; ctx.render(); }));
      if (!loading && !loadError) { loading = true; void ctx.api('learning-content').then(result => { catalog = result.courses; }).catch(() => { loadError = 'The course library could not load. Reconnect the local app and try again.'; }).finally(() => { loading = false; if (document.querySelector('#learn-root')) ctx.render(); }); }
      return;
    }
    stats(root);
    if (selected) detail(root, catalog.find(c => c.id === selected)); else library(root);
  }
  function library(root) {
    const hero = el('section', undefined, 'pilot-hero learn-hero');
    hero.append(el('span', 'FROM CURIOSITY TO CAPABILITY', 'eyebrow'), el('h2', 'Your next skill has a starting point.'), el('p', 'Free course material from Google, Microsoft, The Odin Project, Exercism and n8n. Learn on their sites; keep your practice and progress here.'));
    root.append(hero);
    const filters = el('div', undefined, 'health-tabs learn-filters'); filters.setAttribute('aria-label', 'Course filters');
    for (const [id, label] of [['all', 'All paths'], ['mine', 'My paths'], ['Beginner', 'Beginner'], ['Intermediate', 'Intermediate']]) { const b = ctx.action(label, () => { filter = id; ctx.render(); }); b.setAttribute('aria-pressed', String(filter === id)); filters.append(b); }
    root.append(filters);
    const grid = el('div', undefined, 'learn-grid');
    const visible = catalog.filter(c => filter === 'all' || (filter === 'mine' ? enrollment(c.id) : c.level === filter));
    for (const c of visible) {
      const saved = enrollment(c.id), card = ctx.card(); card.classList.add('learn-course');
      card.append(el('span', `${c.level} · ${c.format}`, 'eyebrow'), el('h2', c.title), el('p', c.outcome), el('p', c.provider, 'muted'), progress(c, saved));
      const b = ctx.action(saved ? 'Continue path' : 'Explore path', () => open(c), true); b.setAttribute('aria-label', `${saved ? 'Continue' : 'Explore'} ${c.title}`); card.append(b); grid.append(card);
    }
    if (!visible.length) grid.append(el('p', 'Choose All paths to find your first learning path.', 'muted'));
    root.append(grid, el('p', 'Checkpoint completion is your own record, not a provider certificate. Courses open in a new tab and need internet access; local notes and scheduling work while this app is running offline. Optional labs may use paid services.', 'muted learn-footnote'));
  }
  function detail(root, course) {
    root.append(ctx.action('Back to learning library', () => { selected = null; ctx.render(); }));
    const saved = enrollment(course.id), header = ctx.card(); header.classList.add('learn-header');
    header.append(el('span', course.provider, 'eyebrow'), el('h2', course.title), el('p', course.outcome), progress(course, saved));
    const links = el('div', undefined, 'pilot-actions'); links.append(link('Open full learning resource', course.url));
    if (!saved) links.append(ctx.action('Start this path', () => ctx.command('learning.enroll', course.id, {}, 0, 'Learning path started.'), true));
    header.append(links, el('p', `Before you start: ${course.prerequisite}`, 'muted'), el('p', course.cost, 'learn-cost'), el('p', `Links reviewed ${course.reviewed}. The checkpoints below are original starter exercises. Complete the full provider syllabus on its site; these timeboxes are for practice, not the entire course.`, 'muted'));
    root.append(header);
    const columns = el('div', undefined, 'learn-layout'), roadmap = ctx.card('Your practice route');
    course.checkpoints.forEach((s, i) => {
      const b = ctx.action(`${saved?.checkpoints[s.id]?.completed ? '✓' : String(i + 1).padStart(2, '0')}  ${s.title}`, () => { selectedCheckpoint = s.id; ctx.render(); });
      b.classList.add('learn-step'); b.setAttribute('aria-pressed', String(selectedCheckpoint === s.id)); roadmap.append(b);
    });
    roadmap.append(el('p', 'Suggested order. Revisit any step at your own pace.', 'muted'));
    const s = course.checkpoints.find(s => s.id === selectedCheckpoint) || course.checkpoints[0], state = saved?.checkpoints[s.id];
    const work = ctx.card(s.title); work.append(el('span', `${s.minutes}-minute suggested practice`, 'eyebrow'), el('h3', 'Make this tangible'), el('p', s.deliverable), link('Open lesson or reference', s.url));
    if (saved) {
      const form = el('form', undefined, 'pilot-form learn-notes');
      const label = el('label', 'Practice notes'), notes = el('textarea'); notes.setAttribute('aria-label', 'Practice notes'); notes.maxLength = 4000; notes.value = state.notes; label.append(notes); form.append(label);
      form.addEventListener('submit', event => event.preventDefault());
      const save = completed => ctx.command('learning.checkpoint', course.id, { checkpointId: s.id, completed, notes: notes.value }, saved.revision, 'Checkpoint saved.');
      const actions = el('div', undefined, 'pilot-actions'); actions.append(ctx.action('Save notes', () => save(state.completed)), ctx.action(state.completed ? 'Reopen checkpoint' : 'Mark checkpoint complete', () => save(!state.completed), true));
      form.append(actions, el('p', 'Your self-reported progress. Notes and checkmarks earn no XP; complete a scheduled practice session in Today to earn up to 15 XP.', 'muted')); work.append(form);
      if (state.taskId) {
        const task = ctx.snapshot().tasks.find(t => t.id === state.taskId);
        work.append(el('p', task?.archived ? 'Practice task is archived. Restore it in Goals to schedule it.' : `Practice task saved · ${task?.durationMinutes || 0} minutes. Its completion is tracked in Today.`, 'saved-state'), ctx.action('Review schedule', () => ctx.navigate('plan')), ctx.action('Manage practice task', () => ctx.navigate('goals')));
      } else {
        const plan = el('form', undefined, 'pilot-form learn-plan');
        const minutesLabel = el('label', 'Practice minutes'), minutes = el('input'); minutes.type = 'number'; minutes.min = '10'; minutes.max = '120'; minutes.step = '1'; minutes.required = true; minutes.value = String(s.minutes); minutes.setAttribute('aria-label', 'Practice minutes'); minutesLabel.append(minutes);
        const goalLabel = el('label', 'Supporting goal'), goal = el('select'); goal.setAttribute('aria-label', 'Supporting goal');
        for (const g of [{ id: '', title: 'Choose later' }, ...ctx.snapshot().goals.filter(g => !g.archived)]) { const o = el('option', g.title); o.value = g.id; goal.append(o); } goalLabel.append(goal);
        const button = el('button', 'Add practice task', 'button primary'); button.type = 'submit'; button.dataset.save = '';
        plan.append(minutesLabel, goalLabel, button, el('p', 'Adds one task for this checkpoint. Review its place in Plan before it enters your calendar.', 'muted'));
        plan.addEventListener('submit', event => { event.preventDefault(); void ctx.command('learning.practice', course.id, { checkpointId: s.id, minutes: Number(minutes.value), goalId: goal.value || null }, saved.revision, 'Practice task added. Review its time in Plan.'); }); work.append(plan);
      }
      const next = course.checkpoints.find(step => !saved.checkpoints[step.id].completed && step.id !== s.id);
      if (state.completed && next) work.append(ctx.action(`Next: ${next.title}`, () => { selectedCheckpoint = next.id; ctx.render(); }));
    } else work.append(el('p', 'Start this path to save notes, track checkpoints and add practice to your schedule.', 'muted'));
    columns.append(roadmap, work); root.append(columns);
  }
  return { init: value => { ctx = value; }, render };
})();
