# Phase 5 research gate — nutrition and fitness

Reviewed 2026-10-04. The user explicitly requested the next phase and competitor research at every phase. This refresh informs the approved product specification; it does not certify health outcomes or sales rankings. Public product pages and help-center interfaces were inspected; paid/native accounts were not tested.

## Performance evidence and interface decisions

| Product and signal | Observed workflow/interface | Apply to Stoic Body | Verification |
|---|---|---|---|
| [MyFitnessPal](https://www.myfitnesspal.com/): vendor reports 280M people and 5.5M five-star reviews; cumulative, not active users or revenue | Diary-first tracking, several entry methods, saved foods | A quick daily food log and reuse of a previous meal; estimates remain editable | Save, copy, edit and reload food without duplicate XP |
| [Cronometer](https://cronometer.com/blog/media/): same page says over 15M and over 18M users; inconsistency retained | [Food entry](https://support.cronometer.com/hc/en-us/articles/360018193011-Add-a-Food) displays source and nutrient coverage | Per-entry source/estimate label; unknown nutrients are missing, not zero | Mixed known/unknown daily totals show coverage |
| [Hevy](https://www.hevyapp.com/about-us/): vendor reports 17M+ community | [Routine versus workout](https://help.hevyapp.com/hc/en-us/articles/33703513582871-Workouts-vs-Routines-in-Hevy-What-They-Mean-and-How-to-Use-Them): template first, then actual performance logging | Saved routine separate from dated exercise logs; sets/reps/load/effort | Routines create schedulable tasks; performance history persists independently |
| [Fitbod](https://fitbod.me/): vendor reports 15M+ downloads, 120M+ workouts, rating 4.8; rating scope unspecified | [Creation inputs](https://help.fitbod.me/hc/en-us/sections/360001078993-Understanding-Fitbod-How-It-Works): equipment, goal, split and duration | Explicit equipment and time inputs, visible rationale, reviewed save to shared schedule | No cable/bar exercises without selected equipment; duration respected |
| [MacroFactor](https://help.macrofactorapp.com/en/articles/21-weight-trend): specialist reference, no comparable sales rank established here | Trend alongside scale readings; [neutral coaching](https://macrofactor.com/adherence-neutral/) | Measured points plus simple disclosed seven-day means; no invented readings, guaranteed dates or punitive scoring | Unit conversion, same-day averaging and sparse-window cases |

These are strong relevant benchmarks, not a claim that these five lead every store's revenue chart. No comparable audited revenue table was available from these primary sources. Adapt interaction principles into the existing original design; do not copy their artwork, branded screens or proprietary algorithms.

## Health evidence and resulting decisions

- [ACSM 2026 resistance-training summary](https://www.acsm.org/wp-content/uploads/2026/03/Resistance-Training-Position-Stand-infographic.pdf) supports accessible home/bodyweight training and gradual progression; training to failure is not a universal requirement. Exact starter templates are conservative product choices, not copied clinical protocols or personalized prescriptions.
- [ISSN protein position stand, 2017](https://pubmed.ncbi.nlm.nih.gov/28642676/) informs the higher-protein comparison. No universal protein target is generated without reviewed personal suitability.
- [DIETFITS, 2018](https://pubmed.ncbi.nlm.nih.gov/29466592/) did not show a significant 12-month weight difference between the tested healthy low-fat and low-carbohydrate programs. This does not establish all diets as equivalent.
- [Time-restricted eating trial, 2022](https://www.nejm.org/doi/pdf/10.1056/NEJMoa2114833) did not find added weight-loss benefit from its eating window over calorie restriction alone. Meal timing stays separate from food selection and energy intake.
- [OMAD pilot, 2007](https://pubmed.ncbi.nlm.nih.gov/17413096/) was small and short; [carnivore survey, 2021](https://pubmed.ncbi.nlm.nih.gov/34934897/) was uncontrolled and self-selected. Neither establishes an optimal long-term physique strategy.
- [NIH B12 fact sheet](https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/) identifies adequacy concerns with little/no animal food. Vegetarian and vegan cards include nutrient planning.
- [MedlinePlus clear liquids](https://www.medlineplus.gov/ency/patientinstructions/000205.htm) and [full liquids](https://www.medlineplus.gov/ency/patientinstructions/000206.htm) are distinct medical diets. The clear-liquid page lists a 2024-07-24 review date; a source's publication date is left unknown when unavailable. Neither is a default weight-loss routine.
- [NIDDK weight-management guidance](https://www.niddk.nih.gov/health-information/weight-management/choosing-a-safe-successful-weight-loss-program) supports sustainable individualized programs; [fasting and diabetes](https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/fasting-safely-with-diabetes) requires attention to medication and glucose risks. No medication changes are generated.
- Prior Phase 1 Mediterranean and meal-replacement references remain in the content catalog, with access limitations labeled. NICE returned a retrieval error during this refresh; no claim of freshly verifying its full text.

## Chosen implementation

Add a Health workspace with Fuel, Train, Progress and Evidence views. Keep the local service, explicit schedule review and existing appearance. Education and manual tracking work without a personal prescription. Adult/restriction/equipment screening is required before saving a starter training routine; uncertainty preserves education/logging and requests appropriate review. No health record grants XP. A scheduled workout uses the existing 25-XP completion transaction exactly once.

Do not adopt automatic calorie escalation, inferred image nutrients, maximal-effort tests, social comparison pressure or a blanket recommendation for restrictive diets. Health data stays private/local. No external food/AI account or fee is introduced.

## Alternatives considered

1. Integrate a commercial nutrition/workout API: larger catalog, but licensing/cost/privacy decisions unresolved.
2. Build an AI diet/workout generator immediately: flexible output, but suitability and factual validation would be weaker with incomplete screening.
3. **Selected:** curated evidence, explicit manual data and transparent starter rules. This yields auditable behavior now; richer recommendations and external databases need separate validation.

Phase 4 sync/alarms/backup acceptance remains open. Phase 5 is authorized, not declared finished by this research packet.
