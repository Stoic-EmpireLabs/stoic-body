# Stoic Body 0.5.0 verification and scope

Updated 2026-10-05. This is a local Windows preview, not completion of the full original app specification.

| Requested behavior | Implementation | Execution evidence |
|---|---|---|
| Adaptive choices and multi-select | Shared schema and setup renderer; inactive answers retained but not applied | setup, adaptive-setup and regression tests |
| Existing twenty answers retained | Originals stay intact; candidate choices require confirmation; confirmed subjects are skipped | legacy core and actual-browser regression tests |
| Save/resume, Back and cross-tab review | Versioned profile state, retained drafts, explicit conflict choices | onboarding browser tests |
| Whole first week after answering | Deterministic goals/tasks/calendar preview; review or lighter alternative; one acceptance | life-plan core tests and new-client browser journey |
| Meals, exercise, learning and life goals together | Existing measured recipes/routines/resources; work and home steps; confirmed meal/sleep/family/fixed windows | meal-selection, scheduling and generated-task tests |
| Instructions survive later weeks | Instructions and URLs stored in each accepted batch and exposed on the task | two-week regression and continuity tests |
| Recovery and realistic available time | Existing strength sessions constrain subsequent weeks; light sessions cannot exceed chosen duration; DST failures identify the window | review regression tests |
| Atomic acceptance and no duplicate XP | Existing command transaction/receipt boundary; zero-XP protected time | rollback, retry, XP and continuity tests |
| Undo and manual replanning | Existing batch undo; protected tasks excluded from ordinary candidates | generated-week undo regression |
| Clear next action | Today opens session instructions and supplies completion/partial/undo actions | desktop/mobile screenshots and browser journey |
| Actual client photos and visual preference | Owner-scoped originals/display copies; optional Male/Female/preserve appearance selection | core isolation and browser upload/preference tests |
| Private photo export and restore | Separate encrypted archive; additive atomic restore; deletion tombstones block stale upload retries | photo-store and photo-backup tests |
| Windows desktop and icon | Packaged runtime, explicit image-decoder allowlist, custom shield shortcut | installation, launch, native decoder and restart test |

Independent read-only review of 5962481..2e43568 found nine enabled-feature defects. All nine were reproduced and corrected: cross-week instructions, protected-task undo, legacy repetition, inactive deadlines, lighter duration, mixed units, photo resurrection, DST window reversal and cross-week recovery. Focused regression/browser tests cover each; the wider suite and packaging checks run after these corrections.

Not delivered in this release:

- Real AI goal-image generation, a verified local model, likeness/anatomy QA, crop controls, generation job cancellation, and labeling generated export pixels. The disabled control is an unavailable state, not a simulated completed feature.
- A medically personalized full OMAD day, body-fat diagnosis or guaranteed appearance prediction. Recipe amounts are explicit examples; restrictive daily adequacy needs review.
- Full project dependency/effort forecasting, deadline capacity calculations and advanced long-term outcome ranges.
- Apple offline apps, native alarms or app-store publication.

Photos are excluded from normal account backups and routine sync. Use their separate encrypted archive. Existing standard backups remain readable; older app versions reject new structured state instead of silently removing it. Local Windows files still require the user's normal device-account protections.

Synthetic visual evidence: `docs/evidence/adaptive-setup/`. No client photos or owner account data are included in the release.
