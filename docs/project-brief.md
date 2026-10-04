# Stoic Body project brief

Date: 2026-10-04
State: Phase 0 approved; Phase 1 research packet ready for review. Product specifications and implementation await later approvals.

## Purpose and understood outcome

Build a commercial life-and-health game that turns meaningful goals into a feasible daily schedule. Meals, workouts, learning, obligations, sleep, recovery and leisure share the same planning model. Completing meaningful actions earns rewards; measured outcomes remain distinct from game points.

The complete structured build request in this chat is authoritative. The original message is retained verbatim in source-original.md. Requirements.md maps that request to proposed components and acceptance evidence.

## Confirmed user priorities

- Brand: Stoic Body.
- The owner will be the first user, with a commercial product intended for sale, marketing and distribution on Apple App Store, Google Play and Microsoft Store.
- Confirmed first-release devices: iPhone/iPad and Windows PCs. Android release timing is pending; Google Play remains a distribution target.
- Integrate all requested life, nutrition, exercise, learning, media, schedule and game functions.
- Use researched information and realistic, revisable projections.
- Approximately 20 thoughtful onboarding areas, direct respectful coaching, manageable question groups.
- Plan first, evaluate every available skill, then use applicable skills in dependency order.
- Review and explicitly approve every phase.
- Discovery answer: “That its easy to use and addicting”.

Interpretation proposed for review: fast everyday actions and enjoyable reasons to return. The product should help finish worthwhile actions and then return to life. Rewards, streaks, reminders and motion remain configurable as required in the source request.

## Proposed daily experience

Open Today → see the next useful action and relevant Stoic reflection → start or complete it → log only needed details → receive immediate progress/XP feedback → see the next feasible step.

When circumstances change, offer a smaller day or a reviewed reschedule. Preserve fixed commitments and recovery time.

## Proposed success criteria, not yet approved

- A first-time tester identifies the next action within 5 seconds on Today.
- A routine already-planned task takes at most two taps to complete.
- A common saved-meal or workout check-in can be completed in roughly 10 seconds, excluding entry of genuinely new details.
- User can explain why an activity was scheduled and change it without assistance.
- Core records survive offline use and restart.
- A voluntary 14-day pilot measures helpfulness, time saved, friction and return use; a retention target will be agreed after discovery.
- Completion, XP and outcomes remain internally consistent.

These are proposed usability targets, not measured results or promises.

## Scope areas

1. Discovery and resumable onboarding.
2. Goals, milestones, projects and unified scheduling.
3. Nutrition evidence, comparison and tracking.
4. Training programs, workout logs and body measurements.
5. Learning pathways and verified resources.
6. Game rules, achievements and personal rewards.
7. Progress, uncertainty and completion estimates.
8. Attributed Stoic quotations and contextual reflections.
9. Accessible responsive design and reviewed photo/file imports.
10. Privacy, offline operation, dependable platform-appropriate reminders and optional integrations.
11. Commercial packaging, monetization decisions, store submissions, customer support, marketing and release operations.

All requested diets and exercise modes stay in scope; including a comparison entry does not establish that a method is appropriate for a particular user.

Later additions include home shadowboxing, footwork and fitness, with bag work conditional on equipment, and a parent learning pathway for coach-led cheer basing/spotting. Their requirements are F11 and L05; personal details remain in the private intake.

## Existing workspace constraints

Read from C:/Users/stoic/AGENTS.md and C:/Users/stoic/AntigravityWorkspace/AGENTS.md:

- Windows and PowerShell.
- Self-contained project under AntigravityWorkspace/projects.
- Zero paid services or external database accounts; local embedded storage.
- Prefer native headless Playwright for browser verification.
- TDD for core logic; typecheck and lint before reporting code complete.
- Never commit secrets.

The current user request controls phase approvals and approval before purchasing, publication, accounts or irreversible actions. A general workspace deployment instruction does not override that boundary. The planning and research work has created no repository, deployment or account.

## Open choices

- Minimum supported iOS/iPadOS and Windows versions; first-release device classes are confirmed.
- Android at first release versus a later Google Play release.
- Multi-customer product architecture and optional accounts/sync; owner is the first pilot user.
- Must alarms work with the app closed, device locked or device offline?
- Which features must work across multiple devices, and what sync model is acceptable?
- Whether any AI is needed in the first release; provider and personal-data sharing must be explicit.
- Exact optional integrations and import/export formats.
- Commercial model, pricing, free/paid boundaries, store-specific requirements and costs; none is selected or authorized yet.
- Visual direction and reward tone.
- Adult-only scope versus support for minors; do not collect or infer an age before asking.
- Personal goals and a partial baseline are captured in the owner's local private profile. Units, health constraints, training details, fixed hours and deadlines still need clarification before personalization.

## Architecture boundary

No stack is selected. The likely responsibility boundaries are profile, goals/calendar, nutrition, training, learning/resources, rewards, progress, imports and notifications. Their interfaces, persistence and deployment choices belong to Phase 2 after discovery and research.

No clinical assessment, health prescription or body-fat inference has been performed.

## Competitor-informed development — added October 4, 2026

The owner requested research of competitor interfaces, operations and top commercial performers at every step. The [research expansion](research/competitors/README.md) compares 24 products, separates performance measures, and maps 26 journey steps to requirements. Adaptation choices remain proposals. At each later phase, refresh material sources and verify the chosen experience before claiming it works. Public screenshots and research scripts are review artifacts, not app implementation.

