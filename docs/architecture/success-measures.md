# Ease of use and useful return: measurement plan

Phase 2 proposal using the design-kpis skill. Evidence: the user's stated ease/return priorities, [competitor journey research](../research/competitors/experience-patterns.md), and [current source assessment](baseline-assessment.md). There is no customer analytics dataset or measured product baseline. These are definitions and proposed tests, not reported business performance.

## Candidates considered

Time to next action, task-success rate, logging time, plan usefulness, voluntary weekly return, daily screen time, streak length, XP volume and subscription conversion were considered. Screen time, XP volume and longest streak are weak primary outcomes because they can rise while the product becomes burdensome. Conversion becomes useful after the offer and audience are established.

| Primary metric | Definition and source | Decision supported | Limit |
|---|---|---|---|
| Core task success | Number of first-time testers who independently complete each assigned workflow / testers attempting that workflow; observed sessions with consent | Simplify navigation/onboarding/logging when failures cluster | Small pilot, moderator and familiarity effects; report counts alongside percentages |
| Useful-plan rate | Weekly-review respondents answering “this plan helped me do what mattered” 4 or 5 on a 5-point scale / respondents; also report response rate | Improve prioritization, capacity and recovery choices | Self-report/response bias; does not prove health improvement |
| Week-two useful return | Activated, consenting pilot users who complete a meaningful plan/log/review action on ≥2 distinct days in days 8–14 / activated users whose full window elapsed | Assess whether the daily loop deserves wider pilot rollout | Return is a proxy; exclude mere app opens and XP retries; no claim of clinical benefit |

Activation means a user accepts a personal day plan and records one meaningful action; synthetic demo actions do not qualify. Cohort windows use enrollment timezone consistently and exclude internal test accounts. Report denominator, missingness, cohort dates and definition version. The owner pilot is n=1 and cannot establish market demand.

## Diagnostic measures and guardrails

- Task-success drivers: time to identify the next action and time/taps to record an ordinary completion or saved meal. Distinguish first-use from repeated-use sessions.
- Useful-plan drivers: rejected scheduling proposals and unresolved capacity conflicts; low rejection alone could mean weak user control, so pair it with usefulness responses.
- Return drivers: activation completion and weekly-review completion, counted once per person/period.
- Trust guardrail: zero unresolved data-loss, cross-account disclosure or duplicate-XP defects in release acceptance fixtures. A test passing is not proof no production incident is possible.
- Wellbeing guardrail: users can pause reminders/streaks and recover from a missed day; do not optimize return by increasing fasting, exercise or notification pressure. Collect optional burden feedback separately from completion rates.

## Proposed usability targets

For five consented pilot participants, aim for at least four to find the next action without help, with a median identification time ≤5 seconds after Today is visible. Routine completion should require ≤2 taps from Today, and a saved-meal log should have median completion time ≤10 seconds after its entry point. These targets are product hypotheses from the owner's ease-of-use priority, not industry benchmark facts. Report each participant's outcome and range; a five-person test is not statistical proof.

Do not set a retention percentage, revenue target or clinically meaningful body-change threshold without audience, baseline and relevant evidence. First gather two complete pilot weeks and qualitative failure notes, then set an explicit next decision criterion.

## Instrumentation and operating cadence

First pilot: local opt-in event log plus moderated observations; export only with consent. Minimal event fields are random participant ID, event type, app/build version, UTC timestamp, enrollment zone, flow ID, success/failure category and duration. Never collect meal details, body measures, calendar titles, photos, document text or authentication tokens in analytics. Do not install a tracking service by default.

Engineering reviews correctness incidents per build; product owner reviews usability and usefulness weekly. Compare the same definitions before/after a change. Missing events stay missing. Purchase funnel, refunds/support costs and store conversion join commercial analysis only after the offer is approved and measured.

Sources receipt: direct owner answers define intent; competitor material motivates testable design hypotheses; local source inspection establishes current gaps. No external user-count or ranking is used as Stoic Body's own performance baseline.
