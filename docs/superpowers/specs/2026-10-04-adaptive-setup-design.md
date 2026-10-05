# Stoic Body: adaptive setup that produces a usable plan

Status: core redesign approved by the user on 2026-10-04; optional goal visualization added by direct user request. Implementation plans pending review. Not implemented. Review date: 2026-10-04, America/Denver.

## What must change

The user finished all 20 questions and expected a configured app, complete plan and schedule. Instead, setup mostly collects free text and hands off manual goal/task forms. Rewording those forms does not solve the problem.

Success means: select answers, receive relevant follow-ups, review a complete proposed week, accept it once, and see the next scheduled action immediately. Existing answers and progress must survive the change.

The user specifically requests multiple-choice questions with multiple selections, adaptive questions, a complete generated plan and schedule, and a friendly, enjoyable daily experience.

## Observed implementation gaps

- `apps/local-pilot/public/app.js` defines a fixed list of 20 questions. Most render as text areas.
- `apps/local-pilot/public/host.js` advances by a fixed index and ends with a checklist pointing to manual forms.
- `firstGoal()` copies only the first line of the goals answer into an unsaved form.
- `renderPlan()` only consumes a narrowly formatted time answer; other answers do not configure a complete week.
- Profile editing uses a second, separate question renderer. Both must use the same structured question definitions.
- Existing storage can hold answer arrays, but backup validation and sync must remain compatible with any new fields.
- Current scheduling already supports previews, conflicts, accepted batches and undo. Reuse these protections rather than bypassing them.

## Recommended approach

Build a local, deterministic setup and planning system with transparent rules. It remains usable without network access, requires no paid model, and can be tested with known inputs. Optional AI assistance may later interpret free text, but it must not be required to obtain a plan.

Alternatives considered:

1. Choice buttons over the current fixed form: simplest, but still fails the requirement that answers change the next question and produce a plan.
2. Adaptive questionnaire plus local planning rules: recommended; reproducible, private, reviewable and offline.
3. An AI-only interview and planning agent: flexible, but requires separately disclosed access, adds cost and failure modes, and makes scheduling correctness harder to guarantee.

## The new first-use experience

### 1. Pick what you want help with

Large selectable cards: Fitness, Food, Learning, Business, School, Home projects, Family, Daily routine. Select any number; display “Choose all that apply.” Include “Something else” with optional text and “Not sure yet.”

### 2. Ask relevant follow-ups

Ask one clear question per screen. Examples:

- Fitness selected → goals, current experience, available equipment, realistic training days, injuries/restrictions.
- Learning selected → subjects, current level, practical outcome, session length, preferred resource formats.
- Business selected → offer, current stage, channels, weekly time and deadlines.
- School selected → assignment list, deadlines and schedule import or manual entry.
- Home projects selected → project choices/custom project, materials, dependencies and target date.
- Family selected → days/time to protect; default to keeping weekends free if chosen.
- Food selected → foods, allergies, cooking time, budget and preferred eating pattern.

Multi-select chips/checkbox cards are the default. Single-value items such as primary priority, units or coaching tone use clearly labeled single selection. For exact age, weight, height, deadlines and times, offer preset choices plus “Enter my own” with an exact input. Never force a person to choose an inaccurate measurement just to satisfy a multiple-choice layout.

Show why each question matters in one short sentence. Provide Back, Skip and Save for later. Save after each screen. Preserve unsubmitted drafts across navigation. Recompute the remaining path if an earlier choice changes; retained answers from inactive branches remain saved, but stop influencing recommendations.

Display progress against the current relevant path rather than claiming everyone must answer exactly 20 questions. Aim for approximately 20 relevant screens when all modules are selected, with shorter paths for narrower goals.

### 3. Show what the app understood

Editable summary cards: selected goals, top priority, available time, fixed commitments, fitness setup, eating preferences, learning level and reward preferences. Distinguish confirmed facts, assumptions and missing information. Conflicting choices such as “no equipment” plus “barbell” require clarification.

### 4. Generate the full proposed plan

Generate automatically when setup is finished. Do not require the user to recreate goals or manually enter every task. Show:

- All selected goals, milestones, starter projects and concrete next actions.
- A complete first-week calendar, with dated tasks inside confirmed free time.
- Workout sessions matching equipment, experience and recovery, with exercise detail and alternatives.
- Meal options with quantities and estimated nutrition where necessary inputs and reliable ingredient data support them; meal times, preparation and grocery tasks.
- Learning sessions tied to a path, actual resources and a practical checkpoint.
- Business, school and home-project sessions with dependencies and deadlines.
- Protected sleep, work, family, appointments, travel and buffers.
- A minimum-effort alternative for busy days.
- Longer-term milestone roadmap and completion ranges, clearly separate from the first week's exact calendar.

Ask only targeted follow-ups if essential planning inputs are missing. Unknown work hours must not be treated as free time. If dates or schedule imports are missing, show the available plan and label affected items “Needs a date” instead of inventing a deadline. No algorithm can make a correct complete calendar from unknown availability; the UI should explain the missing input in plain language and finish planning immediately after it is supplied.

Show “Why this is here” for each session and connect it to the answer or scheduling rule. Display overload/conflicts with proposed scope or timing changes. Do not quietly overload tomorrow.

Use these actions: **Use this plan**, **Change something**, **Try a lighter week**. Accepting once creates the proposed goals, tasks and schedule together. Retrying, reloading or double clicking cannot duplicate records. Failure cannot leave a half-created plan. Revisions preserve existing completed sessions and XP and show a change preview.

### 5. Begin with a clear Today screen

After acceptance, open Today, not a checklist telling the user to configure more features.

Suggested layout:

> **Your next step**
> Practice your first lesson · 15 minutes
> Learn the basics, then complete one small exercise.
> **Start** · **Move to later**
>
> **Today's quests**
> [ ] Morning session · 25 XP
> [ ] Learning practice · 15 XP
> [ ] Evening reflection · 10 XP
>
> **Your day**
> A readable timeline of accepted sessions and protected commitments.

Primary navigation: Today, Plan, Progress. Keep Health, Learn, Goals and Settings available through clearly named sections without crowding the home screen. Details open when needed; do not bury the first action under setup instructions.

Use a visible completion animation, earned XP, level progress and milestone celebrations. Support reduced motion, calm mode and optional forgiving streaks. Rewards stay tied to real saved activity and never to eating less or exercising while injured. Measure usefulness and voluntary return; do not claim addictive behavior or competitor retention as our result.

## Existing users

Provide **Build my plan from my answers** to people who finished the original questionnaire. Preserve all free-text answers verbatim. Show suggested structured mappings for confirmation rather than silently guessing from prose. Ask only missing or ambiguous follow-ups. Keep the current plan active until a replacement is reviewed and accepted. Never require all 20 questions again.

Export, restore, synchronization and profile editing must preserve structured selections, custom answers, branch state, plan source revision and generation status. Each account remains isolated.

## Optional photo and goal visualization

When a user selects an appearance-related fitness goal, offer **See a picture of your goal** with **Add a photo** and **Skip for now**. Keep the feature optional and available later in Progress. The personalized visualization requires the client's own adult photo, uploaded or captured with explicit camera permission; a clothed, non-sexual photo is sufficient. Do not substitute a stock body, generic avatar or another person's physique for the client. Preview and confirm the captured/uploaded image before use. Do not request a child's photo as input to an appearance transformation.

User addition: tailor goal visuals to the user's selected gender. Offer **Male** and **Female**, with an optional skip, and use that selection for generated example people and goal-image prompts. Let users change the selection later. Do not infer gender from a name, photo or other profile details. With an uploaded personal photo, preserve that person's likeness instead of substituting a generic male/female model. If the choice is skipped, use neutral illustrative placeholders and ask for the visual preference before generating a generic person. Keep this visual preference separate from physiological inputs used in nutrition calculations; gender selection alone must not silently determine calorie targets, strength expectations or program intensity.

Ask which changes they want to visualize using selectable options: more muscle definition, stronger build, improved posture, or a custom description. These are appearance preferences, not a body-type diagnosis. Preserve face, skin tone, height, recognizable features, clothing and background as far as the image editor can; let the user reject or regenerate a poor likeness. Do not manufacture an extreme transformation or claim another person's physique is achievable.

Generate a photorealistic illustration with plausible proportions. Caption the image **Goal illustration — your actual results may look different**. A target weight, date or photo does not establish how someone will actually look. Do not claim clinical validation, exact body-fat percentage, a guaranteed timeline or a guaranteed resemblance. No appearance score, attractiveness ranking or automatic pressure to lower a weight goal.

User clarification: the renderer must use the client's actual photo together with an individually reviewed goal, rather than apply a generic attractiveness filter. Build the goal brief from confirmed height/weight and trends, training experience, available training time, chosen strength/appearance goals, and optional waist/body-composition measurements with their method and uncertainty. Missing body-fat data remains unknown; do not estimate it from the image or equate BMI with body composition. There is no universal "good body composition" image that is appropriate for every man or woman.

The health/planning layer reviews the goal first and records its assumptions and evidence. Only then does the renderer receive the minimum appearance brief needed to illustrate the chosen direction. Preserve the client's skeletal proportions and identity; illustrate restrained changes in muscle definition and fat distribution, subject to likeness review. Do not pretend that an exact target weight or measured body-fat percentage maps to exact pixels. If essential suitability inputs are missing or the goal needs professional review, ask a focused follow-up and retain the source photo without generating a personalized transformation yet. Do not use the generated image to calculate calorie targets, workout intensity or goal deadlines.

Keep a visible summary of what the illustration is based on and when the plan was reviewed. Offer an updated illustration when the user confirms a changed goal or new measurements, preserving the dated original and prior illustrations. Verify prompt provenance and visual plausibility using consented synthetic fixtures across male/female selections and varied starting physiques; human review is required for image quality and does not establish medical predictive accuracy.

The Progress view provides Starting photo / Goal illustration / Actual progress, with dated real photos, optional side-by-side comparison and a hide option. Keep labels visible in the UI and attach a visible AI-generated label to exported goal illustrations. Measured progress and training recommendations come from confirmed goals, measurements and performance, not similarity to the generated picture. Photo comparisons earn no extra XP for body changes.

Privacy: private by default within the selected account. Show who processes the image before generation. Local processing is the default under the existing zero-paid-services rule. Do not send photos to an external service or include them in routine sync without an explicit choice for that destination. Preserve the source, remove location metadata from derived/exported images, and offer deletion and a clear optional encrypted photo-backup choice. Explain that access to the user's Windows files can expose locally stored media; do not advertise OS-level encryption unless implemented.

Generation needs an execution-verified image-edit backend. The assistant's image tool is not automatically an API available to the shipped app. No local image-edit backend has yet been verified. Inspect existing services and compatible workflows first; new large model downloads, installation or paid services require separate authorization. If unavailable, display that status honestly and retain upload/real-progress comparison; never substitute a fake before/after and call generation complete. The core plan generator must remain usable without the image backend.

Photo-specific acceptance: a consented synthetic adult fixture produces an actual saved image through the configured backend; labels, likeness review, per-account isolation, deletion, metadata handling, upload limits, backup choices, cancellation, provider failures and absence of unauthorized external requests are verified. The shipped UI must distinguish available generation from an unconnected integration.

## Research patterns adopted

Reviewed primary sources on 2026-10-04. These describe vendor features and reported experiments, not independently audited rankings or private retention data.

- [Brilliant FAQ](https://brilliant.org/faq/): learning paths, interest/level-based recommendations, interactive problems and immediate feedback. Adopt paths linked to practical scheduled work and visible progress; reject treating external links alone as a complete interactive lesson.
- [Duolingo's habit-oriented learning path](https://blog.duolingo.com/putting-in-work-the-habit-of-language-learning/): translate a large goal into a clear path and manageable daily practice. Adopt an obvious first action and small daily sessions.
- [Duolingo streak experiments](https://blog.duolingo.com/improving-the-streak/): daily goals and streaks are separate mechanisms with tradeoffs. Keep streaks optional and separate actual goal progress from XP.
- [Hevy progress photos](https://www.hevyapp.com/features/progress-photos/): adopt dated actual-photo comparisons; keep illustrations visibly distinct from observations.
- [Fitbod photo guidance](https://fitbod.me/blog/how-to-take-progress-photos/): adopt consistent lighting, clothing, pose and camera angle for useful progress comparisons. This guidance does not validate generated physique predictions.
- [NIDDK Body Weight Planner](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner): reference for personalized adult weight/activity planning; not an image generator or validation of a future physique image.
- [CDC BMI FAQ](https://www.cdc.gov/bmi/faq/index.html): BMI cannot distinguish fat mass from lean body mass. Do not use a BMI category as a measured composition or a target-image template.

No copied branded assets, invented conversion metrics or promised retention gains.

## Review boundaries

1. Adaptive questionnaire and existing-answer confirmation.
2. Full first-week plan generation, review and atomic acceptance.
3. Today screen and completion experience.
4. End-to-end verification, updated installed desktop and published download.

The approved design must be followed by a concrete implementation plan before coding. Each boundary gets a working demonstration and evidence; do not label unfinished integration as complete.

## Acceptance evidence required

1. Different selections produce genuinely different follow-ups and plans.
2. Multiple choices, custom answers, unknown and skip work with keyboard and screen readers.
3. Back, changed selections, pause/restart and branch changes preserve relevant answers correctly.
4. A fitness-only account is not forced through business questions; a learning-only account is not asked health questions unless opted in.
5. Completing setup creates a complete reviewable week with linked goals, tasks and resources; the user does not have to rebuild it manually.
6. Selected equipment, learning level, available hours and protected commitments visibly affect the plan.
7. Existing completed questionnaire answers are retained and reused after confirmation.
8. Calendar conflicts, sleep, buffers, timezone and daylight saving rules are respected. Missing data and infeasible deadlines are explicit.
9. One acceptance persists all plan records atomically. Double-submit/retry creates no duplicates. Interrupted generation and stale profile revisions recover safely.
10. Completing a quest updates existing XP rules exactly once; undo reverses its award. Schedule revision preserves completions.
11. Backup/restore and private sync retain selections and generated plans; two accounts do not leak data.
12. A first-time user reaches their first action without navigating through manual setup forms. Measure setup duration, abandonment and time to first completed action in consented tests; do not fabricate results.
13. The actual desktop shortcut launches the verified release, and the Vercel download points to that release.

## Scope limitations

This redesign does not itself complete Apple clients, native alarms, Store distribution or all launch requirements. Nutrition and training suggestions remain subject to existing evidence/suitability checks; no guaranteed physique, medical diagnosis, unsafe child stunts or precise body-fat estimates from photos. Scheduling guided instruction with a qualified cheer coach is distinct from teaching unsafe lifts in a generated routine.
