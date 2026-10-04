# Stoic Body Nutrition and Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Phase 5 execution requires the working-core checkpoint and this plan's approval.

**Goal:** Add researched nutrition, suitable training and honest progress measurements to the shared planner.

**Architecture:** Feature modules consume the approved core repository and occurrence model. Reviewed content is versioned separately from user records; recommendation results are candidates requiring acceptance.

**Tech Stack:** Approved client/server stack from the core plan, curated versioned JSON content and SQLite records. No external food/AI service assumed.

**Spec:** [Product](../../architecture/product-spec.md), [domain](../../architecture/domain-contracts.md), [health evidence](../../research/health-and-training.md).

## Global constraints

- Core scheduling, logging and XP remain useful offline and without AI.
- No unsupported health personalization, fabricated sources or generated historical attributions.
- Never reward restriction, longer fasting, dehydration or rapid weight loss.
- Automatic cross-device sync is now required at launch.
- Typecheck and lint before claiming code complete; TDD for core logic.

## Review focus

Unknown/mixed units (H01/H04); unsuitable restrictive plans (H01); allergen or unavailable food data (H02); fatigue/equipment changes (H03); noisy data and false ETA precision (H04).

Paths below are under apps/stoic_body/ unless stated otherwise. Reuse Result/Command/Receipt/Occurrence and the core transaction/sync interfaces; do not create independent nutrition or training XP counters.

## H01 — Evidence library and suitability rules

Create assets/content/diets.json, lib/features/nutrition/diet_library.dart, lib/domain/suitability.dart and test/suitability_test.dart. Interfaces: `Suitability evaluateSuitability(Profile profile, Approach approach)` returns educationOnly, needsProfessionalReview or eligibleForReviewedOptions with reasons; none means medical clearance.

- [ ] Refresh sources for every diet entry, distinguishing publication/review dates and unknowns. Write content checks for all requested diets and the four distinct liquid categories; missing citation or evidence limitation fails publication validation.
- [ ] Write tests where unknown units, skipped relevant restrictions and professional-oversight flags prevent target generation while manual logging/education remain available.
- [ ] Run failing tests, implement suitability and comparison screens, then `flutter test test/suitability_test.dart` and `flutter analyze`.
- [ ] Before enabling any personal target calculation, produce a reviewed formula sheet with population/eligibility, units, parameter ranges, uncertainty, primary citations and numerical fixtures. No formula is activated solely because a previous prototype used it.

## H02 — Meals, recipes, hydration and preparation

Create lib/features/nutrition/{meal_log,recipes,groceries}.dart and test/nutrition_log_test.dart. Interfaces: `NutrientSummary summarizeMeal(Meal meal)` preserves unknown nutrient values and estimate flags; `GroceryList combineRecipes(List<RecipePortion> portions)` combines compatible units only. Save through core commands.

- [ ] Tests cover scaling servings, incompatible units, missing fiber values, allergen substitution review, duplicate save/retry, offline restart and second-device sync.
- [ ] Run failing tests, implement manual/saved-meal entry, optional nutrients/eating window, water/symptoms and meal-preparation scheduling proposals.
- [ ] Photo/barcode candidates require source and correction; unavailable lookup falls back to manual entry without invented nutrients. Add these adapters only after data licensing/cost approval.
- [ ] Run targeted app/service tests, `flutter analyze` and server typecheck/lint; demonstrate a meal and its preparation alongside work/training without a conflict.

## H03 — Training programs, sessions and boxing

Create assets/content/exercises.json, assets/content/programs.json, lib/features/training/{program,session,boxing_timer}.dart; tests training_test.dart and boxing_timer_test.dart. Interfaces: `List<ProgramOption> eligiblePrograms(Profile profile, Equipment equipment, Availability time)`; `TrainingChange proposeTrainingChange(TrainingHistory history, RecoveryInput recovery)`.

- [ ] Content checks require every session field from the spec and all requested training families. Equipment fixtures with no dumbbells/bag exclude those exercises; substitutes respect prerequisites and time.
- [ ] Tests ensure one poor session does not automatically raise/lower intensity, discomfort triggers the reviewed guidance path, interrupted sessions persist, and repeated session completion cannot duplicate XP.
- [ ] Timer tests cover pause/resume, elapsed time after suspension, final-round termination and no automatic completion reward from a timer firing.
- [ ] Run failing tests, implement program selection/logging and explicit adjustment proposals. Add written technique resources; refer advanced cheer lifting to the separate coach-led learning path.
- [ ] Run targeted tests and analyze/typecheck/lint; demonstrate a short-session substitution preserving schedule/reward rules.

## H04 — Measurements and forecasts

Create lib/domain/{measurements,forecasts}.dart, lib/features/progress/ and test/{measurements,forecasts}_test.dart. Interfaces: `TrendResult weightTrend(List<Measurement> records, LocalDate end, String zone)`; `Forecast projectForecast(EffortRange effort, CapacityRange capacity)`; optional later `Forecast bodyForecast(ApprovedModel model, List<Measurement> records)`.

- [ ] Tests: original units retained; unknown units rejected for calculations; no data stays unavailable; multiple readings/day use median; fewer than three measured days in seven shows insufficient data; outliers stay visible until reviewed.
- [ ] Assert 12–20 remaining hours and 3–5 weekly hours produces 3–7 weeks; zero lower capacity makes latest unknown. Body ETA stays unavailable without reviewed model and adequate history.
- [ ] Run failing tests, implement measured trends/uncertainty and explanation/override screens. Model output never uses XP as physiological progress.
- [ ] Run full relevant regression suite and numerical fixtures; save source/formula review, snapshot parity across devices and acceptance evidence for Phase 5 review.

Contract type definitions: [interface catalog](../../architecture/interface-catalog.md).
