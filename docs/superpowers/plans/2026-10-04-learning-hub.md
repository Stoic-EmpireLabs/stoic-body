# Lightweight learning hub implementation plan

> For agentic workers: use superpowers:executing-plans inline with TDD; include this slice in the health workspace's one fresh final review.

**Goal:** Provide free external courses, original practice checkpoints, durable progress and scheduled practice without embedding a learning platform.

**Architecture:** A curated local catalog links to verified providers. An owner-scoped SQLite enrollment stores checkpoint completion/notes and one linked practice task per checkpoint. Existing calendar completion awards focus XP; opening links or checking course progress does not award XP.

**Tech stack:** Existing Node/SQLite/TypeScript/browser JS. No added packages, remote scripts, course downloads or runtime AI dependency.

**Spec:** requirements.md learning/game/privacy requirements; user steering 2026-10-04: Brilliant comparison, AI/software/UI/web/frontend/backend/automation/Antigravity/YouTube learning, external free courses, Google AI Ultra.

## Global constraints
- Free learning material is distinguished from optional paid lab services and subscriptions.
- Provider content remains external; progress is self-reported and never a provider certificate.
- Scheduling remains a reviewed proposal. Checkpoints do not replace full course syllabi.
- Public catalog contains no owner health/business data or account identifiers.
- Existing theme, completion reversals, retries and owner boundaries remain intact.

## Review focus
1. Repeated planning clicks, new operation IDs and retries must not create duplicate practice tasks (Task 1).
2. Stale checkpoint edits and unknown course IDs cannot overwrite another state (Task 1).
3. Failed task creation must not leave a checkpoint linked to a missing task (Task 1).
4. Links must not execute code or imply free runtime services; offline progress stays usable (Task 2).
5. Completion of course checkpoints cannot award XP or imply mastery/provider completion (Tasks 1–2).

## Task 1: Catalog and durable course progress
Files: src/core/learning-content.ts, learning-store.ts, repository.ts; tests/core/learning.test.ts; docs/research/phase-6-learning-benchmarks.md.

Interfaces: Course has id/title/provider/url/level/prerequisite/cost/format/checkpoints; each checkpoint has id/title/url/minutes/deliverable. LearningEnrollment has id/revision/checkpoints keyed by checkpoint ID with completed/notes/taskId. Commands learning.enroll (entityId course ID), learning.checkpoint ({checkpointId,completed,notes}), learning.practice ({checkpointId,minutes,goalId}) use enrollment revision. One practice task per checkpoint, kind focus, budget 15. readLearning exposes owned enrollment in Snapshot.learning. Migration 5 is additive. No XP on learning commands.

- [ ] Write RED tests for persistence, isolation, revision conflicts, invalid data, rollback and duplicate practice planning.
- [ ] Implement eight curated paths, strict store and command integration; preserve task identity on repeat planning.
- [ ] Run targeted tests/typecheck/lint and commit.

## Task 2: Lightweight Learn screen and verification
Files: apps/local-pilot/public/learn.js, app.js, index.html, styles.css, server.ts; scripts/test-learning-pilot.ts; docs/phase-6-learning-checkpoint.md.

Interfaces: authenticated GET learning-content; Learn.render/init receives shared DOM/API/command/navigation helpers. Library filters, enrollment, next checkpoint, original practice brief, external link, notes/completion/undo and practice task creation. Metrics: own checkpoint count and XP from linked calendar sessions, never estimated provider mastery.

- [ ] RED browser journey: enroll, open real resource URL, save note/complete/undo, add one practice task, review schedule, earn 15 XP once and retain data after reload.
- [ ] Implement responsive cards/course detail, cost/source labels, explicit full-course links and progress limitations.
- [ ] Run all core and browser checks, typecheck/lint; inspect mobile and desktop evidence.
- [ ] Include in one fresh final review with health; fix material findings RED→GREEN; commit and restart pilot.

## Scope decisions
Direct feature requests authorize this local implementation. No extra design approval round. Course linking replaces the proposed embedded lesson engine as requested. Provider accounts, automatic course completion sync, executing code, cloud quota retrieval and a universal plugin installer are out of this slice. The full Phase 6 quote/import work is still open.
