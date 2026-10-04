# Health correction — meals and drinks

Implemented locally, reviewed 2026-10-04. User requested actual foods and quantities, not just food logging.

## What works

- Health → Meals: chicken breast, turkey breast and salmon bowls, each with cooked rice, broccoli, measured oil and lemon juice. Ingredient weights are individually editable and estimates recalculate from saved nutrient references.
- Default bowl: 170 g cooked protein food, 150 g cooked rice, 200 g cooked broccoli, 5 g oil and 15 g lemon juice. This is a single-meal template, never an entire OMAD/day prescription.
- Lemon water and lemon/soaked-chia water, preparation directions, ordinary water/unsweetened-drink choices and context for electrolyte use. Chia calories and fiber are counted; no detox/fat-burning claims or fasting rewards.
- Preparation instructions include thermometer temperatures, estimate limitations, allergen context and source links.
- Use in food log prefills an editable draft. Save food explicitly records actual consumption; date, ingredients and source notes persist. Preview creates no data and earns no XP. Water totals are separately confirmed.
- Meal preparation creates one task per recipe/date in the existing Plan, with a 5-minute buffer. The user reviews its actual schedule. Recipe preparation can earn ordinary task XP; calories, weight loss and food logs do not.

## Research and verification

[Dated sources, competitor research, provenance and limitations](research/meal-portions-and-drinks.md). Cronometer informed ingredient/serving handling; MyFitnessPal informed editable meal planning. No proprietary metrics or sales ranking was inferred.

5 core meal tests and 5 browser tests added, with observed failures before implementation. They cover source-based calculation, independent weight changes, invalid input, chia calories/fiber, preview versus save, reload retention, source notes, no food XP, deduplicated preparation tasks, stale responses and 390px layout. Whole suite: 105/105 passed. TypeScript and scoped ESLint passed. Existing Health journey: 15/15 passed. Screenshots in `docs/evidence/meals/` contain synthetic test data only.

Independent final review and live service restart receipts will be appended before handoff.

## Limits / remaining decisions

Personal full-day portions and calories are not assigned while weight units, physiological inputs, activity and diet safety questions remain unanswered. A meal library is not a complete diet. Rounded USDA-derived secondary nutrient displays are identified; original API records were independently retrieved only for chicken and turkey. Raw shopping quantities, groceries, full-day adequacy and automatic dietary adaptation remain open. Local device-only service; launch sync and native alarms remain incomplete.

This closes the requested meal-template correction for review; it does not close all of Phase 5 or authorize later phases.
