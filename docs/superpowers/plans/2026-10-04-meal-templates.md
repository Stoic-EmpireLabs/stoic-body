# Researched meals and drinks

Spec: the user's October 4 request for actual chicken, turkey or fish meals with rice, vegetables, portions and researched drinks, within the existing Health phase. The original project requirements remain authoritative.

Goal: let a person choose a concrete recipe, inspect and adjust ingredient weights, understand its approximate nutrition, and explicitly log what they ate. Include preparation tasks through the existing reviewed scheduler.

Architecture: static sourced ingredient catalog and pure server calculator; authenticated preview endpoint; Health Meals view; existing health.save and task.create persistence. No dependencies or database migration.

Global constraints: work only in the phase4 worktree; protect owner data; all weights clearly cooked or as served; no automatic calorie prescription or OMAD daily menu with missing units, physiological inputs and health screening; no calorie/fasting XP; no fabricated precision, citations, rankings or retention. Existing sync and notification limitations remain. No public deployment.

## Task 1: Ingredient catalog and portion calculation

Produces: mealCatalog and previewMeal({id, amounts?}); ingredients in grams, optional waterMl for drinks; estimated nutrients and a food-log draft. Amount overrides are bounded and validated, recipe-only ingredient keys. Reference nutrient weights and provenance retained. No persistence in preview.

Files: src/core/meals.ts; tests/core/meals.test.ts; docs/research/meal-portions-and-drinks.md; docs/research/meal-food-data.json.

1. Write failing tests for chicken/turkey/salmon estimates, individual portion changes, chia calories/fiber, provenance, invalid values and unknown IDs.
2. Run node --import tsx --test tests/core/meals.test.ts. Expected: missing implementation failure.
3. Implement recipes, drink options, evidence, food safety, suitability boundary and pure calculation. Source data includes rounded secondary USDA displays where primary retrieval was unavailable; label estimates.
4. Run the same tests. Expected: pass. Run typecheck and lint. Expected: pass.
5. Commit this logical task.

Completion command: node --import tsx --test tests/core/meals.test.ts

## Task 2: Meals interface and existing schedule/log integration

Consumes: Task 1 mealCatalog, previewMeal and food draft; existing Health ctx and command interfaces.
Produces: Health Meals tab, per-ingredient portion controls, preparation and source details, explicit review-to-log workflow, meal preparation task for Plan, browser evidence.

Files: apps/local-pilot/server.ts; apps/local-pilot/public/health.js; apps/local-pilot/public/styles.css; tests/pilot/meals.test.ts; project trackers and checkpoint.

1. Write failing browser tests for catalog and adjustment, preview not recording food, explicit save, reload persistence, zero food XP, drink nutrition, recipe task deduplication, invalid API input and mobile layout.
2. Run node --import tsx --test tests/pilot/meals.test.ts. Expected: missing Meals control/endpoint failure.
3. Implement authenticated endpoint and Health UI. Reject stale preview responses after input or navigation changes. Preserve recipe source notes in logs. Water logging is separate and clearly labeled. Preparation tasks go to Plan without silently occupying a time slot.
4. Run browser tests plus npm test, npm run typecheck, npm run lint and existing test:health. Expected: pass.
5. Save screenshots from synthetic fixtures. Commit and record checkpoint. Restart live local service; read-only smoke of actual meal view, without adding owner data.

Completion command: node --import tsx --test tests/pilot/meals.test.ts

## Review Focus

Check that cooked/raw distinctions, per-meal versus daily needs, fish/poultry differences, reference-weight conversions, chia calories, allergens, stale UI responses, keyboard access and log confirmation remain correct. Look for duplicate prep tasks or food logs, draft loss during edits, hidden calorie prescriptions, and accidental writes to the owner database. Review the entire meal change from b1afae9, with prior core as the existing boundary.

## Phase boundary

This is an authorized nutrition correction, not authorization to finish unrelated phases. Personal daily targets still require missing inputs. Grocery purchase quantities, nutrient adequacy across a full day, cloud sync, native reminders and deployment remain outside this slice.
