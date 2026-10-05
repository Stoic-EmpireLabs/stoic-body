# Self-service setup correction

Reviewed 2026-10-05 (America/Denver). Implements the user's existing approved questionnaire-to-plan flow and latest correction: no trainer service, named diet choices, cut/bulk/maintain, automatic setup completion. Preserve existing answers, themes, local accounts and offline operation.

## Primary sources and decisions

- [Fitbod: how workouts are created](https://help.fitbod.me/hc/en-us/sections/360001078993-Understanding-Fitbod-How-It-Works): adopt goal, equipment, experience and duration as actual generation inputs. Product documentation is workflow evidence, not proof of a best-selling rank or our effectiveness.
- [Freeletics: getting started](https://www.freeletics.com/en/blog/posts/getting-started-with-freeletics/): adopt questionnaire → generated calendar → start workout, with editable settings. Do not imply a human trainer is available.
- [CSEP: Get Active Questionnaire](https://csep.ca/2021/01/20/pre-screening-for-physical-activity/): self-administered screening supports targeted follow-up. Our questions are original, not a validated reproduction of its questionnaire. Do not make every user obtain trainer approval; keep medical restrictions meaningful.
- [Mifflin et al., 1990](https://pubmed.ncbi.nlm.nih.gov/2305711/): estimate resting energy from confirmed age, height, weight and equation sex. Activity multipliers and starting goal adjustments below are transparent product heuristics, not this study's validated outcome predictions.
- [ISSN protein position, 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/): healthy exercising adults can use 1.4–2.0 g/kg/day as an evidence-informed range. Use 1.6 as an editable starting point; do not issue this target when relevant health restrictions are unresolved.
- [NIDDK Body Weight Planner](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner): adult estimates have physiological limits. We do not implement or claim its dynamic model, and do not calculate targets for pregnancy/breastfeeding or minors.
- [CDC weight management](https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html): gradual change and real-life goals. A goal timeframe is a planning range, never a prediction of visible abs.
- [OMAD trial, 2022](https://pubmed.ncbi.nlm.nih.gov/35087416/): small crossover study (11 people, 11 days per condition); insufficient for long-term superiority claims. Save an adult user's preference without silently increasing a deficit or treating a small bowl as a full day's nutrition.
- [NIDDK fasting and diabetes](https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/fasting-safely-with-diabetes): flag glucose-lowering medication and medical constraints; never change medication or fasting duration automatically.
- [NICE NG246](https://www.nice.org.uk/guidance/ng246/chapter/Physical-activity-and-diet): restrictive low-energy and total liquid-replacement programs require appropriate clinical support; do not generate a self-directed crash diet.
- [NHS clear/full fluids](https://www.stgeorges.nhs.uk/wp-content/uploads/2025/05/NDI_CFF_LP.pdf): distinguish medical liquid diets from ordinary food choices and nutritionally complete replacements.

## Correction and verification contract

1. Named cut/bulk/maintain/recomposition choices and named eating patterns, with adaptive follow-ups and easy scheduling presets.
2. Real equation-based starting energy/protein targets where sufficient inputs permit them. No guessed sex or units. Unknown/unsafe inputs suppress only affected numerical targets.
3. Keep original recipe portions honest; show daily targets separately, including explicit OMAD adequacy limitations. No recipe pretending to be a nutritionally complete medical diet.
4. Final **Build my plan and start** saves the first week and opens Today. No second approval or trainer queue. Later changes do not silently replace an accepted week.
5. Optional preferences do not delay first value. Existing users retain answers and can update only what is missing. No duplicated XP or calendar sessions on retry.
6. Test calculations, different goals and units, clinical exclusions, adaptive paths, multi-select behavior, first-use completion, saved schedules/reload and responsive keyboard-accessible UI.

The automatic planner is a local rules-and-calculation engine. No external AI API, generative AI model or paid service is being connected by this correction. Learning generation, goal-photo rendering and other unfinished launch requirements retain their previous status.
