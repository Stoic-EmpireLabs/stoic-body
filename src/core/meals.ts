import { keys, number, object, text } from './validation';
import type { HealthSource } from './health-content';

type Nutrients = { calories: number; protein: number; carbs: number; fat: number; fiber: number };
interface Ingredient { id: string; name: string; referenceGrams: number; nutrients: Nutrients; source: HealthSource }
interface Portion { ingredient: string; grams: number; min: number; max: number; hint: string }
interface Recipe { id: string; title: string; kind: 'meal' | 'drink'; minutes: number; waterMl?: number; portions: Portion[]; steps: string[]; guidance: string; allergens: string[] }
const reviewed = '2026-10-04';
const nutrients = (calories: number, protein: number, carbs: number, fat: number, fiber: number): Nutrients => ({ calories, protein, carbs, fat, fiber });
const source = (title: string, url: string, published: string | null = null): HealthSource => ({ title, url, published });
function food(id: string, name: string, fdcId: number, referenceGrams: number, values: Nutrients, primary = false): Ingredient {
  return { id, name, referenceGrams, nutrients: values, source: {
    title: `${primary ? 'USDA FDC' : 'MyFoodData • USDA-derived display'} ${fdcId}: ${name}`,
    url: primary ? `https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients` : `https://tools.myfooddata.com/nutrition-facts/${fdcId}/${id === 'salmon' ? '100g' : 'wt1'}`,
    published: primary ? '2019-04-01' : null,
    access: primary ? 'Primary API record verified; browser detail page may be unavailable' : `Rounded displayed values per ${referenceGrams} g; primary record not independently retrieved`,
  } };
}
// Preserve each retrieved reference weight. Rounded secondary values are estimates,
// not silently substituted with higher-precision numbers from unverified sources.
export const mealIngredients: Ingredient[] = [
  food('chicken', 'Skinless chicken breast, cooked / roasted', 171477, 100, nutrients(165, 31.02, 0, 3.57, 0), true),
  food('turkey', 'Turkey breast, meat only, cooked / roasted', 171496, 100, nutrients(147, 30.13, 0, 2.08, 0), true),
  food('salmon', 'Atlantic farmed salmon, cooked / dry heat', 175168, 100, nutrients(206, 22.1, 0, 12.4, 0)),
  food('rice', 'White long-grain rice, cooked', 168878, 158, nutrients(205, 4.3, 44.5, 0.44, 0.63)),
  food('broccoli', 'Broccoli, cooked / drained, without added salt', 169967, 78, nutrients(27, 1.9, 5.6, 0.32, 2.6)),
  food('oil', 'Olive oil', 171413, 14, nutrients(119, 0, 0, 13.5, 0)),
  food('lemon', 'Lemon juice, raw', 167747, 244, nutrients(54, 0.85, 16.8, 0.59, 0.73)),
  food('chia', 'Chia seeds, weighed dry before soaking', 170554, 28, nutrients(138, 4.7, 12, 8.7, 9.8)),
];
const bowl = (protein: string, title: string): Recipe => ({
  id: `${protein}-bowl`, title, kind: 'meal', minutes: 35,
  portions: [
    { ingredient: protein, grams: 170, min: 25, max: 350, hint: 'Default ≈ 6 oz cooked; weigh after cooking' },
    { ingredient: 'rice', grams: 150, min: 25, max: 400, hint: 'Default ≈ 1 cup cooked; never 150 g dry rice' },
    { ingredient: 'broccoli', grams: 200, min: 25, max: 500, hint: 'Default ≈ 1¼ cups cooked, chopped; weight is more reliable' },
    { ingredient: 'oil', grams: 5, min: 0, max: 30, hint: 'Default ≈ 1 teaspoon; include oil used in cooking' },
    { ingredient: 'lemon', grams: 15, min: 0, max: 60, hint: 'Default ≈ 1 tablespoon juice' },
  ],
  steps: [
    'Cook rice according to its package. Steam or boil broccoli until tender; drain. Weigh rice and vegetables after cooking.',
    protein === 'salmon' ? 'Bake or pan-cook salmon. Check the thickest part with a food thermometer: 145°F / 63°C. Remove bones and weigh the cooked portion.' : 'Roast or pan-cook skinless breast meat. Check the thickest part with a food thermometer: 165°F / 74°C. Weigh the cooked portion.',
    'Serve the measured protein, rice and broccoli. Use the listed total oil for cooking or dressing, and add the lemon juice. Record additional sauces, oils or toppings separately.',
    'Keep raw meat separate from ready-to-eat food. Refrigerate leftovers promptly and follow the linked food-safety guidance; reheat leftovers to 165°F / 74°C.',
  ],
  guidance: `A practical protein, carbohydrate and vegetable meal to pair with strength practice and walking. ${protein === 'salmon' ? 'Salmon has more fat and different calories than lean poultry; it is not a nutritionally identical swap.' : 'Breast meat is the reference: ground meat, skin-on cuts and deli products have different nutrition.'} Cooking yield and brands vary. Choose variety across the rest of your day.`,
  allergens: protein === 'salmon' ? ['Fish'] : [],
});
const recipes: Recipe[] = [
  bowl('chicken', 'Lemon chicken, rice & broccoli'),
  bowl('turkey', 'Turkey breast, rice & broccoli'),
  bowl('salmon', 'Salmon, rice & broccoli'),
  { id: 'lemon-water', title: 'Lemon water', kind: 'drink', minutes: 2, waterMl: 350,
    portions: [{ ingredient: 'lemon', grams: 15, min: 0, max: 60, hint: 'Default ≈ 1 tablespoon juice' }],
    steps: ['Stir the measured juice into 350 ml water. Serve chilled or at room temperature. Add no sugar unless you also log it.'],
    guidance: 'An optional way to flavor water. It has a small amount of calories; lemon does not create a fat-burning or detox effect.', allergens: [] },
  { id: 'lemon-chia', title: 'Lemon & soaked chia water', kind: 'drink', minutes: 20, waterMl: 350,
    portions: [
      { ingredient: 'chia', grams: 5, min: 1, max: 12, hint: 'A small starting portion, about 1 teaspoon; weigh dry, then soak' },
      { ingredient: 'lemon', grams: 15, min: 0, max: 60, hint: 'Default ≈ 1 tablespoon juice' },
    ],
    steps: ['Stir the measured chia into 350 ml water. Let it soak until fully gelled, stirring again to break up clumps; allow about 15–20 minutes.', 'Add the lemon juice. Start with the small portion and assess digestive tolerance. Do not swallow a spoonful of dry seeds.'],
    guidance: 'Soak chia fully before drinking. This optional fiber-containing drink is not a meal replacement. Chia adds calories and does not fit a zero-calorie fast. Avoid this drink if you have swallowing difficulty unless a qualified clinician has advised it; it is not a detox or weight-loss shortcut.', allergens: ['Check individual seed allergies and package warnings'],
  },
];
export const mealCatalog = {
  reviewed, recipes, ingredients: mealIngredients,
  guidance: [
    'These are starter portions for one meal, not a full day of food or an OMAD prescription. Do not use one bowl as your whole day’s intake.',
    'Daily calorie and protein targets are not set here. They need confirmed weight units, physiological inputs, activity and health context. Goals and weight trends guide later adjustments; smaller is not automatically better.',
    'Review allergies, medications and clinician restrictions before using a recipe. Fasting with diabetes or glucose-lowering medication needs professional guidance.',
    'Protein supports training, rice provides carbohydrate, and vegetables add variety and fiber. These ingredients alone do not establish a nutritionally complete day or guarantee visible abs.',
    'Grams are authoritative; cup, spoon and ounce equivalents are approximate. All meat, rice and broccoli quantities are COOKED weights. Nutrition estimates include the listed oil and juice; substitutions require recalculation.',
  ],
  drinks: [
    'Plain still or unsweetened sparkling water is a simple everyday option. Log the amount you actually drink; fluid needs vary with heat, activity and health restrictions.',
    'Unsweetened tea or coffee can also fit. Log milk, sugar and other additions; choose caffeine timing that does not interfere with sleep.',
    'Electrolyte products are optional and context dependent, not a required daily addition for every walk. Consider sweat, duration and medical advice; check sodium, potassium and sugar on the label. Do not add a default salt or potassium dose.',
  ],
  sources: [
    source('NIH ODS: exercise, protein and total nutrition', 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/'),
    source('NIDDK: Body Weight Planner inputs', 'https://www.niddk.nih.gov/bwp'),
    source('NIDDK: fasting safely with diabetes', 'https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/fasting-safely-with-diabetes'),
    source('NHS: healthy eating when trying to lose weight', 'https://www.nhs.uk/better-health/lose-weight/healthy-eating-when-trying-to-lose-weight/'),
    source('CDC: water and healthier drinks', 'https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html'),
    source('FDA: fish choices and mercury guidance', 'https://www.fda.gov/food/consumers/advice-about-eating-fish'),
    source('FoodSafety.gov: safe cooking temperatures', 'https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures'),
    source('Cleveland Clinic: chia water, tolerance and limits', 'https://health.clevelandclinic.org/chia-seed-water', '2021-09-29'),
  ],
};

/** Read-only recipe calculation; no target prescription, health entry or XP. */
export function previewMeal(input: unknown) {
  const p = object(input); keys(p, ['id', 'amounts']);
  const recipe = recipes.find(r => r.id === text(p.id)); if (!recipe) throw new Error('Choose an available recipe.');
  const amounts = p.amounts === undefined ? {} : object(p.amounts); keys(amounts, recipe.portions.map(i => i.ingredient));
  const ingredients = recipe.portions.map(portion => {
    const item = mealIngredients.find(i => i.id === portion.ingredient)!;
    const grams = number(amounts[item.id] ?? portion.grams, portion.min, portion.max);
    if (Object.hasOwn(amounts, item.id) && amounts[item.id] === null) throw new Error('Enter an ingredient weight.');
    return { ...item, grams, min: portion.min, max: portion.max, hint: portion.hint };
  });
  const total = nutrients(0, 0, 0, 0, 0);
  for (const ingredient of ingredients) for (const key of Object.keys(total) as (keyof Nutrients)[]) total[key] += ingredient.nutrients[key] * ingredient.grams / ingredient.referenceGrams;
  for (const key of Object.keys(total) as (keyof Nutrients)[]) total[key] = Math.round(total[key] * (key === 'calories' ? 1 : 10)) / (key === 'calories' ? 1 : 10);
  const notes = [
    `Recipe ${recipe.id}; reviewed ${reviewed}. Estimated from USDA FDC / rounded USDA-derived MyFoodData values. Cooked weights except oil, juice and dry chia.`,
    ...ingredients.map(i => `${i.grams} g ${i.name}; reference ${i.referenceGrams} g: ${i.source.url}`),
    ...(recipe.waterMl ? [`${recipe.waterMl} ml water included in recipe; log water separately in Hydration if desired. This food entry does not add water totals.`] : []),
    'Changed ingredients, cuts, brands or sauces need updated estimates. One serving is not a daily diet plan.',
  ].join('\n');
  return { id: recipe.id, title: recipe.title, ingredients, nutrients: total, waterMl: recipe.waterMl || 0,
    food: { title: recipe.title, portion: recipe.waterMl ? `1 drink, ${recipe.waterMl} ml water + measured ingredients` : '1 bowl, cooked ingredient weights in notes', source: 'estimate' as const, ...total, notes } };
}
