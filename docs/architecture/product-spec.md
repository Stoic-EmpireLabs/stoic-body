# Stoic Body — product specification

Phase 2 proposal • 2026-10-04 • Review required before Phase 3. This specification describes intended behavior, not completed app features.

## Purpose and boundaries

Help adults turn competing goals, health routines, learning and obligations into a feasible day, then enjoy following through. The owner's priorities are ease of use and wanting to return. The first release targets iPhone, iPad and Windows PCs. Automatic cross-device sync is now required at launch; Android remains a later distribution target unless the owner changes its timing. Selling and publishing remain goals with separate approval gates.

One shared system connects **goal → milestone → project → task → scheduled occurrence → completion → progress**. Obligations, health needs and deliberate recreation may exist without an aspirational goal. XP measures follow-through; measured outcomes and deadline forecasts have separate evidence.

The owner's private intake is an optional, reviewed import. It is not a shipped starter profile. Missing weight units, health screening, fixed obligations and academic dates remain unknown. Selecting a diet or reference physique expresses a preference; it does not establish suitability or guarantee a result.

## Product map

| Destination | Primary job | Detail screens |
|---|---|---|
| Today | Know what to do next; act and log quickly | Next action, timeline, quests, quick capture, daily reflection, minimum viable day |
| Plan | Make time for what matters | Day/week/month, campaigns, projects, goal detail, capacity review, scheduling proposals, imports |
| Train | Follow a suitable session and record it | Program, exercise details, set logger, substitutions, boxing timer, recovery |
| Fuel | Choose an informed eating approach and log simply | Diet library, comparison, meals, saved meals, recipes, groceries, preparation |
| Growth | Understand progress and decide what changes | Goal trends, learning, weekly review, attributes, rewards, resource library |

Profile, privacy, devices/sync, notifications, accessibility and backup live in Settings, reached consistently from every destination. Phone uses five labeled tabs; iPad/Windows use a sidebar and optional detail pane. No separate navigation item for each diet, personal weight goal or game statistic.

## Screen inventory and journeys

| Screen ID | Required behavior | Important failure/empty state |
|---|---|---|
| SC01 Welcome | Explain the coordinated-day promise; try a clearly labeled synthetic example or begin personal setup | No forced health disclosure or purchase |
| SC02 Onboarding | About 20 branching areas, groups of 3–5, direct respectful coaching; save each answer, skip/unknown/edit/resume | Missing inputs shown beside affected recommendations |
| SC03 Profile review | Confirm assumptions, units, equipment, sleep preferences, permissions and top priorities | Contradictory goals/time lead to a capacity discussion |
| SC04 Account and devices | Create/sign into sync account, connect another device, show last synced time and revoke access | Offline setup can continue locally; unavailable sync is explicit |
| SC05 Today | Next action, realistic available time, scheduled blocks, completion/partial/skip, quick capture | No tasks: suggest one meaningful action; no invented schedule |
| SC06 Plan/calendar | Day/week/month, locks, recurrence, dependencies, preparation/travel and drag or keyboard move | Overlaps are visible; unplaced tasks stay in backlog |
| SC07 Goal/campaign | Outcome, reason, baseline, milestones, estimated effort, deadline and next action | Impossible deadline offers scope/date/priority alternatives |
| SC08 Change preview | Before/after schedule, moved blocks, conflicts and reasons; accept selected changes or cancel | Stale proposal refreshes instead of overwriting newer edits |
| SC09 Training program | Choose suitable structure from history, equipment, time and screened limitations | Unknown suitability: educational examples and manual logging |
| SC10 Active workout | Previous versus current sets, reps/load/effort, cues, alternative, rest timer and short version | Save interruption; substitution cannot silently increase load |
| SC11 Boxing | Shadowboxing/footwork/fitness with configurable rounds and rest; bag option only if available | Pause/resume/restart and a clear end after the last round |
| SC12 Fuel overview/log | Saved meals, portions, optional nutrients, water, hunger/energy/symptoms and eating-window log | Missing food data stays unknown; no fake precision |
| SC13 Diet comparison | Compare timing, food selection and energy strategy separately, with evidence and review dates | Limited evidence and suitability restrictions visible |
| SC14 Recipes/groceries | Scale servings, substitutions, combine grocery quantities, schedule preparation | Allergens and unavailable ingredients require review |
| SC15 Growth/measurements | Trends, baseline/current state, remaining work, assumptions and forecast range | Sparse/noisy data: no unsupported arrival date |
| SC16 Learning/resources | Prerequisites, practice, review, application, trustworthy links and saved resources | Broken/unverified resources labeled with a text alternative |
| SC17 Daily/weekly review | Contextual Stoic reflection, useful accomplishments, difficulties and proposed adjustments | Missed day leads to recovery options without punishment |
| SC18 Rewards/character | Five configurable attributes, XP ledger, levels, optional streaks and personal rewards | Calm mode; correction is explained without a failure animation |
| SC19 Import review | Preview original, extracted facts, source locations, ambiguous dates and proposed changes | Nothing affects a plan until confirmed; duplicate detection |
| SC20 Settings/recovery | Privacy, AI consent, devices, notifications, export/restore/delete, costs and help | Permission denied, session expired, restore invalid, sync conflict |

### First useful day

Welcome → initial priorities/time preferences → profile review → proposed day → accept → Today. Deeper health questions appear before health personalization, not before a person can plan a work task. Account setup enables automatic device sync; the local core remains usable during an outage. Onboarding answers change the proposed day and available training choices. A demo remains visibly separate from real records.

### Missed session

Today → partial/skip/missed → retain actual history → offer a short version, defer or drop → show capacity impact → accept proposal. Never automatically compress work, displace family time, or move unfinished tasks into tomorrow.

### Connected health day

A workout, its preparation/recovery, meal preparation and an optional preferred meal window use the same calendar as work and study. The system flags clashes and lets the person revise them. It does not force a fasting window around an unsafe training recommendation. Boxing counts toward session time and conditioning load; it is not an extra automatic daily requirement.

### Academic import

User selects a file inside the app → extracts candidate classes/deadlines → reviews original locations and timezone → resolves ambiguity → sees conflicts → commits selected facts and a schedule proposal. Resubmission permission and missing deadlines are never inferred. Reimport uses source IDs and content hashes to detect duplicates.

## Nutrition content contract

The library must include balanced, Mediterranean, higher-protein, vegetarian, vegan, low-carbohydrate, ketogenic, intermittent fasting/time-restricted eating, OMAD and carnivore entries. Separate liquid entries cover medically prescribed clear liquids, medically prescribed full liquids, nutritionally complete meal replacements and commercial liquid weight-loss programs. An entry is not an endorsement.

Each entry records: what it involves; timing/selection/energy dimensions; evidence quality and uncertainty; benefits/risks; adequacy concerns; training relevance; practical cost/preparation/adherence; exclusions/professional guidance; real sources, publication dates where available and review date. Missing source dates remain missing. See the [health evidence review](../research/health-and-training.md).

Screening gates distinguish education/logging from a personalized recommendation. Unknown units or relevant health restrictions prevent target calculations. Clinician instructions override generic suggestions. No universal calorie, protein, fluid or electrolyte target is prefilled from the owner's intake. Personalized energy and nutrient formulas require a separate Phase 5 evidence sheet, eligibility checks and numerical fixtures before activation.

Daily logs support portions, optional calories/macros, reliable fiber/nutrients, hydration, optional eating windows, hunger, energy, digestion, adherence, symptoms and notes. Food records carry quantity/unit, source and estimate status. A photo produces reviewable suggestions, never precise unconfirmed nutrients. Barcode lookup is optional and must have an approved data source and correction path. Manual logging remains available.

## Training and body progress contract

Support full-body, upper/lower, push/pull/legs and five-day templates; heavy strength work, lighter higher repetitions and hypertrophy; high-intensity resistance work separately from HIIT; walking, treadmill, steady cardio, appropriate sprints, at-home/bodyweight, mobility and recovery. Select one suitable structure rather than combine every method.

Every published session includes purpose, duration, exercise alternatives, sets/reps/rest/intensity, technique cues, warm-up/cooldown, progression, deload/recovery considerations, time/equipment fallback and concerning-symptom guidance. Log actual sets, load, repetitions, effort, duration and notes. Do not treat a single poor session as evidence for aggressive changes.

Exercise records have equipment tags and prerequisite ability. Owner-specific equipment preferences are applied only after private intake confirmation. Lighter loads with more repetitions remain a preference, not an automatic optimal-body claim. No appearance-based body-type classifications. Optional body-fat estimates record the measurement method and uncertainty; photos are not precise measurements.

Boxing focuses on the requested home non-contact skills. Rounds and rest are configurable within reviewed templates; bag work requires equipment confirmation. Timers use elapsed-time state and survive interruption without granting automatic XP.

The parent cheer goal is a learning/coaching pathway: find qualified instruction, record coach-approved prerequisites, schedule supervised practice and approved home preparation. No generated lifting/catching drill, video or XP badge grants stunt clearance. The daughter's information is not needed for a child account in the adult-owner pilot.

## Learning, coaching and imports

Learning goals break into prerequisites, milestones and practice/application/review tasks. Resources show level, purpose, time, materials, free/paid status, source and link-check date. Technique guidance includes accessible written instructions. DIY work requires the relevant manufacturer/model/site information before precise mechanical or structural instructions; generic templates must not claim verified specifications.

Daily coaching selects a reflection for the day's context and links it to one practical action. Verified quotes retain author, work and location/edition; paraphrases and original Stoic-inspired text are explicitly labeled. No fabricated historical attribution. Avoid repeats within 30 days where the verified pool allows; otherwise disclose reuse or choose a labeled original. Save favorites and choose gentle/direct/grill-me tone without humiliation.

Proposed first import formats: JPEG/PNG/HEIC photos (20 MB each), PDF (25 MB/100 pages), UTF-8 TXT/MD/CSV and ICS (5 MB each). HEIC decoding must pass device tests before claiming support. No executable files or arbitrary archives. For document formats not supported, preserve the file as a reference only if safely stored and disclose that extraction is unavailable. Limits are product proposals, enforced before processing. Originals remain private; previews strip metadata by default while originals retain it privately.

## Design directions for Phase 3

1. **Stoic Night:** charcoal, dark purple and restrained gold; readable cards, subtle stone/line motifs and brief celebrations. Recommended for exploration based on the requested palette.
2. **Quiet Marble:** warm light background, ink text, muted plum; strongest daylight readability and calmer game treatment.
3. **Training Journal:** neutral slate, one energetic accent, compact metrics and a stronger workout emphasis.

Prototype all three through the same Today/workout/review tasks before selection. Never reproduce a competitor's branded artwork, exact copy or proprietary algorithm. Pattern lineage comes from the [26-step experience map](../research/competitors/experience-patterns.md).

Use WCAG 2.2 AA as the web/prototype acceptance baseline; native equivalents include semantic controls, VoiceOver/Narrator checks, keyboard operation, scalable text and reduced motion. Target 44 logical-unit primary controls, text contrast at least 4.5:1 (3:1 for qualifying large text), non-color status cues, visible focus and no drag-only action. Real-device audits supplement automated checks. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Commercial scope and unresolved inputs

Core local planning/logging remains useful without AI or the network. Automatic sync is a launch dependency, with visible offline queues and conflicts. Privacy/exports must not require buying an upgrade. Business-model options remain free trial plus one-time features, upfront purchase, or a subscription with demonstrable ongoing value. No price or paid entitlement is approved; simulated restoration cannot be described as a purchase test.

Open inputs: hosting route/budget, Mac/Xcode build access, minimum supported OS, Android timing, selling regions, paid/free boundaries and any external AI provider. Proposed device test floor is iOS/iPadOS 18 and Windows 11, with AlarmKit only on supported 26+ devices; this is a proposal, not a claim about the owner's devices. Unknown personal health/schedule details affect personal setup, not this product specification.

## Companion contracts and approval

- [Domain rules and shared data](domain-contracts.md)
- [Platform, sync and costs](platform-and-sync.md)
- [Privacy and failure design](privacy-and-reliability.md)
- [Success measures](success-measures.md)
- [Existing implementation assessment](baseline-assessment.md)
- [Phase 2 review and proposed implementation sequence](../phase-2-review.md)

Phase 2 approval selects a design direction and authorizes Phase 3 prototype work. It does not approve spending, publication, personal prescriptions or subsequent implementation phases.
