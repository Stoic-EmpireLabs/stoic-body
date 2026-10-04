# Stoic Body phase and approval plan

**Goal:** Create an easy-to-use, enjoyable commercial app connecting goals, schedules, nutrition, fitness, learning and rewards.

**Architecture:** Not selected. Candidate responsibility boundaries appear in the project brief. Decide platform, local storage, alarms, customer identity/sync and monetization after discovery; do not scaffold first.

**Tech stack:** Deferred until Phase 2. Existing constraints are Windows development, zero paid services/external database accounts and local embedded storage unless explicitly revised.

**Source brief:** [Project brief](../../project-brief.md), [original message](../../source-original.md), [requirements](../../requirements.md), and the complete structured user message in this chat.

This is the Phase 0 roadmap, not an executable implementation plan. Exact code paths, interfaces, chosen libraries and test commands belong to approved subsystem implementation plans in Phase 2. The writing-plans skill's decomposition and verification principles are applied without inventing a stack.

For later agentic workers: use executing-plans or a selected subagent-driven-development approach only after the written specification and implementation plan are approved. No implementation execution is authorized by this document alone.

## Global constraints

- Every phase ends with a concrete review packet and explicit user approval.
- Preserve all source requirements and record later steering separately.
- Favor easy daily use and satisfying, user-controlled return experiences.
- Owner-first pilot; commercial targets are Apple App Store, Google Play and Microsoft Store.
- First-release devices are iPhone/iPad and Windows PCs; Android release timing remains pending.
- Existing local-storage/zero-paid infrastructure guidance remains until explicitly changed.
- No purchases, accounts, public publication or irreversible actions without approval.
- No unsupported health personalization, fabricated sources or generated historical attributions.
- Core scheduling, logging and XP remain useful offline and without AI.
- At each phase, refresh material competitor/technical/health evidence and map selected experience patterns from docs/research/competitors/experience-patterns.md to actual acceptance checks. Public competitor screens do not prove native execution behavior.
- Typecheck and lint before claiming code complete; TDD for core logic.
- A skill or connector listed as available is not proof of integration.

## Phase 0 — Planning and inventory

Prerequisite: current user request.

- [x] Read planning skill and applicable workspace guidance.
- [x] Inventory all 121 skill entries and evaluate fit, duplicates and dependencies.
- [x] Preserve original message and initial direct answers.
- [x] Map requirements to proposed design, phase and verification.
- [x] Write brief, discovery record, decisions, roadmap, research agenda and progress tracker.
- [x] Finish document integrity verification and attach its result.
- [x] Obtain explicit Phase 0 approval: user said “Great. continue throguh phases” on 2026-10-04.

Exit: reviewed documentation packet. No product scaffold or dependency installation.

## Phase 1 — Discovery, evidence and commercial context

Prerequisite: Phase 0 approval.

- [x] Record available first-group answers and explicitly retain unresolved Android/OS/build-host decisions.
- [x] Capture user-supplied personal and product inputs; preserve unanswered questions for subsequent specification or personalization.
- [x] Separate developer decisions from the roughly 20 future onboarding areas.
- [x] Research initial nutrition/training evidence and source-quality limits; production content remains later work.
- [x] Research current official device/alarm/store constraints.
- [x] Compare business models and expected costs; launch markets and final model remain decisions.
- [x] Propose measurable usability and pilot success criteria for review; agreement pending.
- [x] Present evidence review, confirmed constraints, assumptions and unresolved choices.
- [x] Obtain Phase 1 approval: direct user “carry on,” 2026-10-04.

Exit: approved discovery brief and research register. Health or platform conclusions need actual sources.

## Phase 2 — Specification, architecture and implementation plans

Prerequisite: Phase 1 approval.

- [x] Compare feasible platform/storage/notification/AI options within budget constraints.
- [x] Define shared goal/calendar model and module contracts.
- [x] Specify capacity, recurrence, timezone/DST, rescheduling and undo behavior.
- [x] Define XP ledger, partial completion, levels and correction behavior.
- [x] Define metric formulas, units, uncertainty and missing-data rules.
- [x] Specify consent, imports, local access, required customer account sync and data lifecycle.
- [x] Define commercial options and store verification gates; final monetization remains unapproved.
- [x] Create proposed product trust-boundary/privacy design and acceptance criteria; no repository security scan is claimed.
- [x] Write separate implementation plans for core, health modules, content/imports and commercial packaging.
- [ ] Review written specification, then written implementation plans and execution method.
- [x] Obtain provisional Phase 2 approval: direct user “for now yes,” 2026-10-04.

Exit: concrete reviewable spec and plans. No unapproved stack assumptions.

## Phase 3 — Visual prototype

Prerequisite: Phase 2 approval.

- [x] Propose multiple directions including purple/charcoal/gold.
- [x] Show onboarding, Today, calendar, goals, nutrition, workout and progress screens.
- [x] Demonstrate fast daily loop, simple navigation, completion reward, staged import and simulated sync states, plus calm mode; full offline engine remains Phase 4.
- [ ] Commercial paywall deferred: no approved business model yet.
- [x] Evaluate layout/readability and scoped keyboard/reduced-motion behavior. Full accessibility and user usability review remain pending.
- [x] Label prototype/simulated behavior.
- [ ] Obtain Phase 3 approval.

Exit: approved visual system and interaction flows.

## Phase 4 — Working core

Prerequisite: approved visual prototype and core implementation plan.

- [ ] Implement resumable onboarding, goals, shared calendar, checklist lifecycle and editable records.
- [ ] Implement persistent, idempotent XP and level logic with undo.
- [ ] Implement capacity checks, recurrence, rescheduling proposals and selected basic notifications.
- [ ] Verify offline/restart behavior and basic device workflows.
- [ ] Run required typecheck, lint and meaningful core tests.
- [ ] Demonstrate the integrated core and obtain Phase 4 approval.

Exit: usable persistent core; disclose any notification limits actually observed.

## Phase 5 — Nutrition and fitness

Prerequisite: working core approval and approved evidence/calculation specifications.

- [ ] Implement required diet comparisons and suitable personalization rules.
- [ ] Implement nutrition logs, recipes, grocery lists and meal-preparation scheduling.
- [ ] Implement all requested training options, suitable selection, exercise resources, logging and adaptation.
- [ ] Implement measurements, trends and uncertainty-aware progress.
- [ ] Coordinate the modules with existing schedule and recovery.
- [ ] Verify calculations, source accuracy, restrictions and persistence.
- [ ] Obtain Phase 5 approval.

Exit: integrated health-related functions with actual evidence and limitations.

## Phase 6A — Learning, coaching and imports

Prerequisite: Phase 5 approval.

- [ ] Implement learning pathways, verified resources and review scheduling.
- [ ] Implement sourced quotes, labeled original reflections, favorites and coaching tone.
- [ ] Implement approved photo/file imports with staging, validation, consent and confirmation.
- [ ] Refine rewards and interaction polish.
- [ ] Test failures, untrusted file content and source attribution.
- [ ] Obtain Phase 6A approval.

Exit: connected content and reference workflows.

## Phase 6B — Commercial readiness (proposed split)

Prerequisite: Phase 6A approval and approved business/platform choices.

- [ ] Implement approved paid/free boundaries and platform-appropriate entitlement handling.
- [ ] Verify purchase/restore and other selected billing states in approved sandboxes.
- [ ] Prepare store packages and signing workflow with verified prerequisites.
- [ ] Prepare listing copy, screenshots, privacy disclosures, age-rating inputs and support information.
- [ ] Prepare marketing assets, rollout/update plan and optional privacy-conscious analytics.
- [ ] Present actual costs, required accounts/credentials and unresolved store requirements.
- [ ] Obtain Phase 6B approval.

Exit: reviewable release candidates and submissions. This does not authorize live purchases, enrollment or public publication.

## Phase 7 — Verification and refinement

Prerequisite: all in-scope release functions complete.

- [ ] Verify onboarding affects plans, integrated schedule feasibility, completion/XP persistence and undo.
- [ ] Test sparse/noisy inputs, unit conversions, DST and recurrence, duplicate sync and missed-task handling.
- [ ] Verify sources, quotations, imports, privacy and customer isolation where applicable.
- [ ] Test export/deletion/restore and offline failure recovery.
- [ ] Test notifications on actual selected devices in foreground/background/closed-app states.
- [ ] Review security, accessibility, performance and commercial entitlement behavior.
- [ ] Run required typecheck/lint/tests and record evidence by requirement.
- [ ] Fix failures within approved scope; disclose unsupported behavior.
- [ ] Conduct the user's usability review and obtain Phase 7 approval.

Exit: acceptance evidence, documented coverage and remaining limitations.

## Phase 8 — Delivery and approved launch

Prerequisite: Phase 7 approval.

- [ ] Provide source, reproducible setup/build instructions and verified local or packaged app.
- [ ] Provide user guide, maintenance, backup, support and update procedures.
- [ ] Reconcile every requirement to evidence, explicitly deferred scope or an unresolved issue.
- [ ] Present store submissions and marketing assets for final review.
- [ ] Publish only after explicit approval for each real external release; record each store's actual submission/review status.
- [ ] Obtain delivery acceptance.

Exit: verified deliverable; approval/submission/availability are recorded separately for each store.

## Review focus

1. Offline completion followed by retry or synchronization must not duplicate rewards.
2. DST, cross-zone travel and recurrence edits must preserve the user's intended appointment semantics.
3. Sparse measurements, inconsistent units and outliers must not create precise false progress claims.
4. Denied notification permission, closed app, reboot and battery restrictions must have visible tested behavior.
5. Untrusted imports and optional external AI must not silently mutate plans or disclose private data.
6. Commercial purchase/restore, data isolation and deletion must remain correct across the selected platforms.

Every future implementation plan must assign these cases to owning tasks and meaningful checks.

## Phase checkpoint format

Completed work → concrete artifact/demo → covered requirement IDs → actual verification → limitations/open decisions → next phase scope → explicit approval request.

Do not equate a discovery reply with phase approval.


Phase 3 packet: [review](../../phase-3-review.md). Three visual directions are available locally and on the user-authorized Vercel preview. User style selection and Phase 3 approval remain pending.

Phase 2 packet: [review](../../phase-2-review.md). Four subsystem plans and architecture contracts are proposed for review; automatic sync is required at launch. Existing app source is separately assessed rather than treated as approved Phase 4/5 completion.
