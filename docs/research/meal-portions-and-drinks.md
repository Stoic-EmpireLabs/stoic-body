# Actual meals, portions and drinks — reviewed 2026-10-04

Scope: the owner's requested fish, turkey or chicken with rice and vegetables, plus drink choices. These are weighed recipe templates, not a daily calorie prescription. Screening questions were sent; unanswered fields do not imply medical clearance. No private profile values are embedded in public code.

## Competitive research applied

| Primary source | Observed operation | Applied pattern | Boundary |
| --- | --- | --- | --- |
| [Cronometer recipe creation](https://support.cronometer.com/hc/en-us/articles/360018510311-Create-Custom-Recipe) | Ingredient amounts, recipe servings and cooked yield affect recipe logging | Ingredient-level grams, explicit cooked weights, estimate recalculation and retained source notes | No scraped recipes or cloned interface; no claim about retention or revenue |
| [MyFitnessPal Meal Planner](https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner) | Meal choices and portion editing connect planning to meals | Three protein choices, editable portions, review before logging, preparation task in existing Plan | No claim to reproduce paid planner, full grocery engine or quantified engagement |

These are established comparison products, not a verified sales ranking. Only accessible first-party feature documentation was evaluated in this refresh. No proprietary retention, scoring or internal metrics were available.

## Nutrition and preparation decisions

- [NIH ODS](https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/) describes protein and adequate overall energy in training. A protein-containing meal supports the user's training goal; a single meal is not proof of an adequate day. Its athlete protein range is not assigned to an unscreened user.
- [NIDDK's planner](https://www.niddk.nih.gov/bwp) requires age, sex, height, weight and activity. Missing inputs prevent a defensible daily calorie target. [NIDDK fasting guidance](https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/fasting-safely-with-diabetes) supports medication/glucose screening before fasting plans.
- [NHS](https://www.nhs.uk/better-health/lose-weight/healthy-eating-when-trying-to-lose-weight/) supports vegetables, protein and considered portions. The starter bowl contains 170 g cooked breast meat or salmon, 150 g cooked rice, 200 g cooked broccoli, 5 g oil and 15 g lemon juice. This recipe design is an estimate, not a trial-tested personalized prescription. White rice matches the requested food; whole-grain substitutions need their own nutrient values.
- [FDA fish guidance](https://www.fda.gov/food/consumers/advice-about-eating-fish) identifies salmon among lower-mercury choices. Specific pregnancy/child serving advice is not generalized into a universal adult dose. Salmon's higher fat content is calculated instead of treated as equivalent to poultry.
- [FoodSafety.gov](https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures) supports poultry 165°F / 74°C, fish 145°F / 63°C, and reheated leftovers 165°F / 74°C. No claim that a fixed cooking time guarantees safety.
- [CDC drinks guidance](https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html) supports water and unsweetened alternatives. No rigid fluid or electrolyte dose is assigned. The electrolyte note is a conservative design boundary, not an individualized medical assessment.
- [Cleveland Clinic chia-water discussion](https://health.clevelandclinic.org/chia-seed-water) (2021-09-29) supports soaking, gradual tolerance and rejecting miracle weight-loss claims. Our small 5 g starter portion is a recipe choice. Chia/juice calories are counted; it is not a zero-calorie fast or a meal replacement. Use USDA-derived nutrient data rather than the article's inconsistent ounce-calorie example.

## Nutrient provenance

The public USDA FDC API returned primary SR Legacy records 171477 (cooked chicken breast) and 171496 (cooked turkey breast), preserved in `meal-food-data.json`, before the demo-key limit was reached. The limit was respected; no keys were obtained or installed. Direct FDC browser detail pages did not render in the research reader. For remaining ingredients, the following publicly accessible MyFoodData displays explicitly identify USDA Standard Release as their source:

| Ingredient / reference quantity | kcal | Protein g | Carbs g | Fat g | Fiber g | Source |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Chicken / 100 g | 165 | 31.02 | 0 | 3.57 | 0 | USDA API 171477, saved record |
| Turkey breast / 100 g | 147 | 30.13 | 0 | 2.08 | 0 | USDA API 171496, saved record |
| Salmon / 100 g | 206 | 22.1 | 0 | 12.4 | 0 | [175168](https://tools.myfooddata.com/nutrition-facts/175168/100g) |
| Cooked rice / 158 g | 205 | 4.3 | 44.5 | 0.44 | 0.63 | [168878](https://tools.myfooddata.com/nutrition-facts/168878/wt1) |
| Cooked broccoli / 78 g | 27 | 1.9 | 5.6 | 0.32 | 2.6 | [169967](https://tools.myfooddata.com/nutrition-facts/169967/wt1) |
| Olive oil / displayed 14 g | 119 | 0 | 0 | 13.5 | 0 | [171413](https://tools.myfooddata.com/nutrition-facts/171413/wt1) |
| Lemon juice / 244 g | 54 | 0.85 | 16.8 | 0.59 | 0.73 | [167747](https://tools.myfooddata.com/nutrition-facts/167747/wt1) |
| Chia / displayed 28 g | 138 | 4.7 | 12 | 8.7 | 9.8 | [170554](https://tools.myfooddata.com/nutrition-facts/170554/wt1) |

Secondary reference weights and values are rounded, especially tablespoon/ounce displays. They are retained as retrieved and transparently labeled estimates; the app does not imply laboratory precision. Do not import that site's blood-sugar, inflammation or PRAL scores as health advice. Unretrieved original records are not claimed to have been independently verified. Date of source publication is unknown unless stated; review date is separate.

Calculation: sum each reference nutrient × (ingredient grams / reference grams), then round the sum (whole kcal, one decimal gram). Oil and lemon are counted. Cups and spoons are convenience approximations; cooked grams control calculations. Raw grocery purchase weights are not inferred from cooked weights. No additional food data service or network is required to use the saved catalog.
