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

5 core meal tests and 7 browser tests added, with observed failures before implementation and fixes. They cover source-based calculation, independent weight changes, invalid input, chia calories/fiber, preview versus save, reload retention, source notes, no food XP, deduplicated preparation tasks, stale responses, 390px layout, recalculating an existing entry without duplication and preserving unsaved food edits across navigation. Whole suite after fixes: 107/107 passed. TypeScript and scoped ESLint passed. Existing Health journey: 15/15 passed. Screenshots in `docs/evidence/meals/` contain synthetic test data only.

Independent fresh-context review inspected immutable b1afae9..91d8e9f and reproduced two Important editor handoff defects against an isolated in-memory service. Both were fixed in one pass with observed failing-then-passing regressions: recipe recalculation now retains existing entry identity/revision/date and restores ingredient quantities; food-form values survive Meals/Fuel navigation. There were no Critical or Minor findings. The reviewer did not independently rerun the full suite; the implementer did.

The local service restarted successfully at http://127.0.0.1:4330/. Read-only live smoke verified all three bowls: chicken ~590 kcal / 61.7 g protein; turkey ~560 kcal / 60.2 g; salmon ~660 kcal / 46.6 g. Live health entries and tasks remained zero during the smoke. No synthetic food was inserted into the owner's database.

## Execution decisions and review boundaries

1. Continue the explicit meal correction inside existing Health scope without another design approval; cost if wrong is reversible UI revision.
2. Preserve the branch and ignored verification workspace under existing deletion rules; cost is small local disk use.
3. Personalized OMAD/day adequacy remains deferred until remaining formula inputs and context are available. Added diet-preference replies are retained privately; self-report does not establish clinical clearance. Cost: daily portions still require review instead of a guessed target.
4. Public release, sync and native alarms remain acknowledged prior-phase boundaries; cost: this feature remains a local pilot rather than satisfying launch requirements.
5. Clinical suitability and independent revalidation of every source were outside the software review. The implementer reviewed research/provenance and exposes uncertainty; cost: individual suitability and source freshness still require appropriate follow-up. No claim of clinician approval.

No deferred minor review findings.

## Limits / remaining decisions

Personal full-day portions and calories are not assigned while weight units, physiological inputs, activity and diet safety questions remain unanswered. A meal library is not a complete diet. Rounded USDA-derived secondary nutrient displays are identified; original API records were independently retrieved only for chicken and turkey. Raw shopping quantities, groceries, full-day adequacy and automatic dietary adaptation remain open. Local device-only service; launch sync and native alarms remain incomplete.

This closes the requested meal-template correction for review; it does not close all of Phase 5 or authorize later phases.
