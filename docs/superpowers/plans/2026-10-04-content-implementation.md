# Stoic Body Learning, Coaching and Imports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute only after the relevant phase approval.

**Goal:** Connect useful learning resources, truthful Stoic reflections and confirmed file imports to the user's plan.

**Architecture:** Versioned content plus private records use core commands; extraction produces staged facts and schedule proposals, never direct mutations.

**Tech Stack:** Approved native/core stack, bounded local file decoders, optional separately consented AI adapters.

**Spec:** [Product](../../architecture/product-spec.md), [domain](../../architecture/domain-contracts.md), [privacy](../../architecture/privacy-and-reliability.md), [resource research](../../research/learning-and-resource-plan.md).

## Global constraints

- No purchases, accounts, public publication or irreversible actions without approval.
- No unsupported health personalization, fabricated sources or generated historical attributions.
- Core scheduling, logging and XP remain useful offline and without AI.
- Automatic cross-device sync is now required at launch.
- Typecheck and lint before claiming code complete; TDD for core logic.

## Review focus

Broken/misleading links (L01); false attribution/repetition (L02); malicious/oversized files (L03); ambiguous academic dates/duplicates (L03); unapproved AI sharing or imported instructions (L04).

All client paths below are under apps/stoic_body/. Persist using core Command/Receipt contracts.

## L01 — Learning pathways and trusted resources

Create lib/features/learning/{pathways,resources,review}.dart, assets/content/resources.json and test/learning_test.dart. Interfaces: `LearningPlan proposeLearningPlan(Goal goal, List<Resource> resources, Availability time)`; `ReviewProposal proposeReview(LearningHistory history)`.

- [ ] Tests cover prerequisite cycles, insufficient capacity, resources without duration/cost/source, broken links and manual completion without duplicate XP.
- [ ] Run failing tests; implement milestones, practice/review/application tasks, saved resources and editable review intervals. Resource checks record date/status; offline cached links are not falsely reverified.
- [ ] Include model-specific DIY source prerequisites and the coach-led cheer pathway; no unsupervised stunt assignment or unverified mechanical values.
- [ ] Run `flutter test test/learning_test.dart`, analyze and service typecheck/lint; demonstrate learning coexisting with a busy week.

## L02 — Quotes, reflections and tone

Create assets/content/quotes.json, lib/features/coaching/reflections.dart and test/reflections_test.dart. Interface: `DailyReflection chooseReflection(DayContext day, List<Quote> library, ReflectionHistory history, CoachingTone tone)`.

- [ ] Tests reject verified quotes without work/location, generated text with historical authors, and repetition within 30 days when alternatives exist; insufficient pool yields a labeled original or disclosed reuse.
- [ ] Run failing tests, implement contextual action prompts, favorites and gentle/direct/grill-me tone. Save reflection text before earning its single daily award.
- [ ] Run tests/analyze; verify historical citations manually against the actual source edition before publishing bundled text.

## L03 — Private attachments and reviewed extraction

Create lib/features/imports/{staging,extractors,review}.dart, lib/data/attachments.dart and test/imports_test.dart. Interfaces: `Future<ImportBatch> stageImport(SelectedFile file)`; `Future<ExtractionResult> extractCandidates(ImportBatch batch)`; `Future<Receipt> acceptFacts(ImportApproval approval)`.

- [ ] Fixtures: valid and corrupted allowed formats; MIME mismatch; over-limit bytes/pages; unsafe archive paths; HEIC decoder availability; unknown timezone/date locale; duplicate timetable; prompt-injection text. Rejected files cannot alter active records.
- [ ] Run failing tests, implement private originals, bounded parsing, inert preview, extraction errors and source-linked fact selection. Keep attachment sync separate from the required core data sync permission.
- [ ] Generate calendar changes only as revision-checked proposals. Resubmission permission and absent due dates remain unanswered.
- [ ] Run targeted tests, analyze and server typecheck/lint; round-trip original hashes and confirmed facts through export/restore and two-device attachment access.

## L04 — Optional AI and integration boundaries

Create lib/services/assistance.dart and test/assistance_test.dart only if an AI provider is selected. Interface: `Future<AssistanceDraft> requestDraft(ConsentApprovedPayload payload)`; output is validated untrusted content.

- [ ] Tests assert zero requests without explicit provider/data consent, no paid fallback, no direct command execution from generated/imported text and useful manual behavior on timeout/offline.
- [ ] Run failing tests, then implement the selected provider within approved budget/access; no provider means keep the deterministic/manual path.
- [ ] Run tests/analyze and inspect actual request payloads with synthetic data. Document configured versus execution-verified capabilities before Phase 6A review.

Contract type definitions: [interface catalog](../../architecture/interface-catalog.md).
