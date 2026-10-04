export function calculateMacroCalories(
  protein_g: number,
  carbs_g: number,
  fat_g: number
): number {
  return protein_g * 4 + carbs_g * 4 + fat_g * 9;
}

export interface AdherenceEvaluation {
  status: "optimal" | "surplus" | "deficit";
  message: string;
  isNeutral: boolean;
}

export function calculateAdherenceStatus(
  proteinActual: number,
  proteinTarget: number,
  calorieActual: number,
  calorieTarget: number
): AdherenceEvaluation {
  const calorieDiffPercent = (calorieActual - calorieTarget) / calorieTarget;

  if (Math.abs(calorieDiffPercent) <= 0.1) {
    return {
      status: "optimal",
      message: "Nutritional intake is aligned with body recomposition goals.",
      isNeutral: true,
    };
  }

  if (calorieDiffPercent > 0.1) {
    return {
      status: "surplus",
      message: "Energy surplus logged. Factually recorded without penalty; next meal resumes standard deficit.",
      isNeutral: true,
    };
  }

  return {
    status: "deficit",
    message: "Deeper deficit logged. Ensure water and electrolytes remain prioritized.",
    isNeutral: true,
  };
}

export function calculateRolling7DayAverage(weights: number[]): number {
  if (weights.length === 0) return 0;
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return sum / weights.length;
}

export function recommendDeload(recentRPEs: number[]): boolean {
  if (recentRPEs.length === 0) return false;
  const avg = recentRPEs.reduce((acc, r) => acc + r, 0) / recentRPEs.length;
  return avg >= 9.0;
}

export type ProteinSourceType = "Fish" | "Turkey" | "Chicken";

export interface MealIngredient {
  item: string;
  portion: string;
  weightGramsOrOz: string;
  role: "Main Protein" | "Secondary Protein" | "Complex Carb" | "Micronutrient Vegetable" | "Healthy Fat" | "Hydration & Fiber";
}

export interface SovereignMealBlueprint {
  id: string;
  proteinSource: ProteinSourceType;
  title: string;
  subtitle: string;
  description: string;
  portionSummary: string;
  ingredients: MealIngredient[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodiumMg: number;
  };
  cookingInstructions: string[];
  fastingIntegration: string;
  drinkPairingId: string;
}

export interface HealthyDrinkRecipe {
  id: string;
  name: string;
  category: "Fasting Satiety" | "Mineral Hydration" | "Fat Oxidation" | "Digestive Primer" | "Deep Sleep & Recovery";
  timing: string;
  fastingSafe: boolean; // True if zero calories or safe for fasting window
  calories: number;
  hydrationOz: number;
  ingredients: { item: string; amount: string; purpose: string }[];
  preparation: string[];
  scientificBenefits: string[];
}

/**
 * Three Core High-Protein / Low-Inflammation 23:1 OMAD Blueprints
 * Tailored for 170 lbs -> 155 lbs body recomp: ~140g protein, ~1,800 kcal
 */
export const SOVEREIGN_MEAL_BLUEPRINTS: SovereignMealBlueprint[] = [
  // 1. FISH OPTION (Wild Salmon / Pacific Cod / Halibut)
  {
    id: "blueprint-fish",
    proteinSource: "Fish",
    title: "Wild Alaskan Salmon & Cod Sovereign Feast",
    subtitle: "Omega-3 EPA/DHA Heavy · Anti-Inflammatory · Fasting Re-feed",
    description:
      "Wild-caught salmon baked with fresh lemon and herbs, paired with fluffy jasmine rice, steamed broccoli florets, asparagus spears, and a pre-meal lemon chia seed hydration elixir.",
    portionSummary: "14 oz Wild Salmon (or 16 oz Cod + EVOO) · 2.5 cups Cooked Jasmine Rice · 2 cups Steamed Greens",
    ingredients: [
      {
        item: "Wild Alaskan Sockeye/Coho Salmon (or Pacific Cod/Halibut)",
        portion: "14 oz (396g raw fillet)",
        weightGramsOrOz: "400g raw",
        role: "Main Protein",
      },
      {
        item: "Steamed Jumbo Shrimp or 3 Pasture-Raised Boiled Eggs",
        portion: "6 oz Shrimp (or 3 whole eggs)",
        weightGramsOrOz: "170g",
        role: "Secondary Protein",
      },
      {
        item: "Organic Jasmine Rice (steamed with pinch of sea salt)",
        portion: "2.5 cups cooked (~375g cooked / 1.25 cups dry)",
        weightGramsOrOz: "375g cooked",
        role: "Complex Carb",
      },
      {
        item: "Steamed Broccoli Florets & Grilled Asparagus",
        portion: "2 cups broccoli + 8 asparagus spears",
        weightGramsOrOz: "250g",
        role: "Micronutrient Vegetable",
      },
      {
        item: "Extra Virgin Olive Oil (cold-pressed) + 1/2 Hass Avocado",
        portion: "1 tbsp EVOO drizzle + 1/2 sliced avocado",
        weightGramsOrOz: "80g total",
        role: "Healthy Fat",
      },
      {
        item: "Sovereign Lemon Water with Soaked Chia Seeds",
        portion: "24 oz water + 2 tbsp soaked chia seeds + 1/2 fresh lemon",
        weightGramsOrOz: "25g chia",
        role: "Hydration & Fiber",
      },
    ],
    macros: {
      calories: 1810,
      protein: 141,
      carbs: 155,
      fat: 65,
      fiber: 21,
      sodiumMg: 960,
    },
    cookingInstructions: [
      "1. Season salmon with sea salt, black pepper, dill, garlic powder, and fresh lemon slices.",
      "2. Bake at 400°F (200°C) for 14-16 minutes until flaky, or sear in a hot cast-iron skillet for 4 min per side.",
      "3. Steam jasmine rice with 1:1.5 water ratio and a pinch of pink salt.",
      "4. Steam broccoli and asparagus for 4-5 minutes until tender-crisp bright green; drizzle with 1 tbsp EVOO.",
      "5. Plate the feast and drink the pre-soaked Lemon Chia Elixir 15 minutes before the first bite.",
    ],
    fastingIntegration:
      "Ideal for post-workout OMAD on calisthenics & boxing days. High Omega-3 fatty acids blunt exercise-induced DOMS while keeping insulin sensitivity peaked.",
    drinkPairingId: "drink-lemon-chia",
  },

  // 2. TURKEY OPTION (Lean 93/7 Ground Turkey or Turkey Breast)
  {
    id: "blueprint-turkey",
    proteinSource: "Turkey",
    title: "Lean Ground Turkey & Basmati Rice Power Bowl",
    subtitle: "High Leucine Density · Ultra-Low Saturated Fat · Pure Recovery",
    description:
      "One full pound of lean ground turkey seasoned with cumin, smoked paprika, and garlic, over fluffy basmati rice, sautéed rainbow bell peppers, zucchini, baby spinach, and fresh sliced avocado.",
    portionSummary: "16 oz (1 lb) 93/7 Ground Turkey · 2.5 cups Cooked Basmati Rice · 2.5 cups Roasted Peppers & Spinach",
    ingredients: [
      {
        item: "Lean Ground Turkey (93% Lean / 7% Fat) or Sliced Turkey Breast",
        portion: "16 oz (454g / 1 lb)",
        weightGramsOrOz: "454g cooked weight",
        role: "Main Protein",
      },
      {
        item: "Organic Pastured Eggs (Scrambled or Soft-Boiled)",
        portion: "3 Whole Pasture-Raised Eggs",
        weightGramsOrOz: "150g",
        role: "Secondary Protein",
      },
      {
        item: "Aromatic White Basmati Rice",
        portion: "2.5 cups cooked (~375g cooked)",
        weightGramsOrOz: "375g cooked",
        role: "Complex Carb",
      },
      {
        item: "Sautéed Bell Peppers, Zucchini & Baby Spinach",
        portion: "1.5 cups peppers/zucchini + 2 packed cups spinach",
        weightGramsOrOz: "280g",
        role: "Micronutrient Vegetable",
      },
      {
        item: "Cold-Pressed Avocado Oil (for skillet) + 1/2 Hass Avocado",
        portion: "1 tbsp avocado oil + 1/2 sliced avocado",
        weightGramsOrOz: "85g total",
        role: "Healthy Fat",
      },
      {
        item: "Sovereign Lemon Water with Soaked Chia Seeds",
        portion: "24 oz water + 1.5 tbsp soaked chia seeds + lemon juice",
        weightGramsOrOz: "20g chia",
        role: "Hydration & Fiber",
      },
    ],
    macros: {
      calories: 1825,
      protein: 142,
      carbs: 148,
      fat: 67,
      fiber: 19,
      sodiumMg: 1080,
    },
    cookingInstructions: [
      "1. Brown 16 oz lean ground turkey in a large stainless or cast-iron skillet with 1 tbsp avocado oil.",
      "2. Season generously with smoked paprika, ground cumin, onion powder, granulated garlic, and sea salt.",
      "3. In the final 3 minutes, toss in sliced bell peppers, diced zucchini, and fold in 2 cups of fresh baby spinach until wilted.",
      "4. Steam basmati rice with a cinnamon stick and a pinch of turmeric for golden aroma.",
      "5. Assemble into a giant sovereign power bowl, top with sliced avocado and soft-boiled eggs.",
    ],
    fastingIntegration:
      "Tryptophan and zinc in lean turkey promote post-meal serotonin conversion and evening relaxation, preventing restless sleep after a large OMAD feeding window.",
    drinkPairingId: "drink-lemon-chia",
  },

  // 3. CHICKEN OPTION (Boneless Skinless Chicken Breast or Tenderloins)
  {
    id: "blueprint-chicken",
    proteinSource: "Chicken",
    title: "Grilled Chicken Breast & Jasmine Rice Clean Plate",
    subtitle: "Maximum Protein Efficiency · Pure Muscle Glycogen Replenishment",
    description:
      "One full pound of grilled herb-seasoned chicken breast fillets, served with fragrant white jasmine rice, steamed broccoli crowns, tender green beans, cold-pressed olive oil, and sliced avocado.",
    portionSummary: "16 oz (1 lb) Chicken Breast · 2.75 cups Cooked Jasmine Rice · 2 cups Steamed Broccoli & Green Beans",
    ingredients: [
      {
        item: "Boneless Skinless Chicken Breast or Tenderloins",
        portion: "16 oz (454g / 1 lb raw)",
        weightGramsOrOz: "454g raw (~350g cooked)",
        role: "Main Protein",
      },
      {
        item: "Low-Fat Greek Yogurt or Organic Bone Broth Cup",
        portion: "1 cup 2% Plain Greek Yogurt or 12 oz Bone Broth + 2 eggs",
        weightGramsOrOz: "225g",
        role: "Secondary Protein",
      },
      {
        item: "Steamed White Jasmine Rice",
        portion: "2.75 cups cooked (~400g cooked)",
        weightGramsOrOz: "400g cooked",
        role: "Complex Carb",
      },
      {
        item: "Steamed Broccoli Crowns & Green Beans",
        portion: "1.5 cups broccoli + 1 cup green beans",
        weightGramsOrOz: "240g",
        role: "Micronutrient Vegetable",
      },
      {
        item: "Extra Virgin Olive Oil (EVOO) & 1/2 Sliced Avocado",
        portion: "1.5 tbsp EVOO (over rice & veg) + 1/2 avocado",
        weightGramsOrOz: "90g total",
        role: "Healthy Fat",
      },
      {
        item: "Sovereign Lemon Water with Soaked Chia Seeds",
        portion: "24 oz water + 1.5 tbsp soaked chia seeds + 1/2 fresh lemon",
        weightGramsOrOz: "20g chia",
        role: "Hydration & Fiber",
      },
    ],
    macros: {
      calories: 1785,
      protein: 141,
      carbs: 162,
      fat: 51,
      fiber: 20,
      sodiumMg: 890,
    },
    cookingInstructions: [
      "1. Slice chicken breast horizontally into cutlets for even cooking; pound lightly.",
      "2. Season with Italian herbs (oregano, thyme, rosemary), garlic powder, cracked black pepper, and sea salt.",
      "3. Grill at medium-high heat (375°F) for 5-6 minutes per side until internal temperature reaches exactly 165°F (74°C). Rest for 5 min before slicing.",
      "4. Steam broccoli crowns and green beans for 4 minutes until crisp-tender; toss with 1.5 tbsp cold-pressed EVOO.",
      "5. Plate alongside warm jasmine rice and enjoy with your chilled Lemon Chia Elixir.",
    ],
    fastingIntegration:
      "The cleanest protein-to-calorie ratio available. Perfect on rest days or heavy calisthenics days when fat adaptation and rapid glycogen replenishment are prioritized.",
    drinkPairingId: "drink-lemon-chia",
  },
];

/**
 * 5 Science-Backed Fasting & Recovery Drinks
 */
export const HEALTHY_DRINK_RECIPES: HealthyDrinkRecipe[] = [
  // 1. LEMON WATER WITH SOAKED CHIA SEEDS
  {
    id: "drink-lemon-chia",
    name: "Sovereign Lemon Water with Soaked Chia Seeds",
    category: "Fasting Satiety",
    timing: "11:30 AM (Midday Hunger Shield) or 05:15 PM (15m Pre-OMAD Break)",
    fastingSafe: false, // 85-120 kcal from chia fiber & fats; drink near eating window or breaking fast
    calories: 95,
    hydrationOz: 24,
    ingredients: [
      { item: "Cold Filtered Water (or Sparkling Spring Water)", amount: "24-32 oz", purpose: "Cellular hydration base" },
      { item: "Organic Whole Black Chia Seeds", amount: "1.5 to 2 tbsp (20g)", purpose: "Soluble mucilage fiber (holds 12x water) & Omega-3 ALA" },
      { item: "Freshly Squeezed Organic Lemon Juice", amount: "Juice of 1/2 fresh lemon", purpose: "Citric acid for kidney stone defense & Vitamin C" },
      { item: "Pink Himalayan Sea Salt / Redmond Real Salt", amount: "1/8 tsp (pinch)", purpose: "Trace minerals (sodium, magnesium) for cellular uptake" },
    ],
    preparation: [
      "1. Add 1.5 to 2 tablespoons of whole organic chia seeds into a 24-32 oz glass or shaker bottle.",
      "2. Pour in cold filtered water and squeeze in the juice of 1/2 fresh lemon.",
      "3. Stir vigorously for 30 seconds to distribute seeds and prevent clumping at the bottom.",
      "4. Let sit for 15-20 minutes in the refrigerator. A thick, gelatinous soluble mucilage gel will form around each seed.",
      "5. Give a final stir or shake and drink slowly.",
    ],
    scientificBenefits: [
      "Hydrophilic Mucilage Gel: Chia seeds expand 10-12x in liquid, physicalizing fullness in the stomach and blunting ghrelin (hunger hormone) during extended fasts.",
      "Slow-Release Hydration: The gel slowly releases bound water in the small intestine, providing hours of steady hydration.",
      "Omega-3 ALA (4,000mg): Powerful anti-inflammatory plant fatty acids protecting cardiovascular endothelium.",
      "Citric Acid Liver Detox: Lemon citric acid stimulates bile production and prevents calcium oxalate kidney crystallization during prolonged fasting.",
    ],
  },

  // 2. FASTING MINERAL ELECTROLYTE SHIELD
  {
    id: "drink-electrolytes",
    name: "Fasting Mineral Electrolyte Shield (Zero-Calorie)",
    category: "Mineral Hydration",
    timing: "06:00 AM (Upon Waking) & 02:00 PM (Afternoon Brain Fog Defense)",
    fastingSafe: true, // 0 Calories
    calories: 0,
    hydrationOz: 24,
    ingredients: [
      { item: "Filtered Cold Water", amount: "24 oz", purpose: "Base fluid" },
      { item: "Redmond Real Salt / Pink Himalayan Salt (Sodium)", amount: "1/4 tsp (~500mg Sodium)", purpose: "Replaces natriuresis losses from low insulin" },
      { item: "Potassium Chloride (NoSalt / Nu-Salt)", amount: "1/8 tsp (~200mg Potassium)", purpose: "Maintains intracellular sodium-potassium pump" },
      { item: "Elemental Magnesium Glycinate Powder", amount: "100mg", purpose: "Prevents cramps, tension, and smooth muscle spasms" },
    ],
    preparation: [
      "1. Fill a shaker bottle with 24 oz of cold filtered water.",
      "2. Add 1/4 tsp salt, 1/8 tsp potassium, and 100mg magnesium glycinate powder.",
      "3. Shake vigorously until fully dissolved. Sip steadily throughout the morning fasting hours.",
    ],
    scientificBenefits: [
      "Zero-Insulin Protection: 100% fasting safe with 0 calories and 0 glycemic response.",
      "Natriuresis Reversal: During 23-hour fasts, reduced insulin triggers the kidneys to rapidly dump sodium; this elixir prevents the headaches, dizziness, and lethargy of electrolyte depletion.",
      "Athletic Power: Keeps muscular contractions sharp during morning calisthenics and boxing sessions.",
    ],
  },

  // 3. MATCHA & GREEN TEA EGCG CATALYST
  {
    id: "drink-matcha-egcg",
    name: "Ceremonial Matcha & Green Tea EGCG Fat Oxidation Tonic",
    category: "Fat Oxidation",
    timing: "09:00 AM to 11:30 AM (Work & Study Focus Block)",
    fastingSafe: true, // ~5 Calories (negligible)
    calories: 5,
    hydrationOz: 16,
    ingredients: [
      { item: "Hot Filtered Water (175°F / 80°C - not boiling)", amount: "12-16 oz", purpose: "Optimal extraction without scorching delicate catechins" },
      { item: "Ceremonial Grade Organic Japanese Matcha", amount: "1.5g (1 tsp whisked)", purpose: "Potent source of EGCG (epigallocatechin gallate) & L-Theanine" },
      { item: "Fresh Lemon Squeeze", amount: "1 wedge squeezed", purpose: "Increases catechin bioavailability by up to 500% in the bloodstream" },
    ],
    preparation: [
      "1. Sift 1 tsp of ceremonial matcha into a cup or matcha bowl to remove clumps.",
      "2. Add 2 oz of warm water (175°F) and whisk vigorously in a 'W' motion until a frothy emerald crema appears.",
      "3. Top with remaining 12 oz warm water and squeeze in a fresh lemon wedge.",
    ],
    scientificBenefits: [
      "HSL Activation: EGCG inhibits COMT (catechol-O-methyltransferase), prolonging norepinephrine activity to mobilize stubborn visceral fat via hormone-sensitive lipase.",
      "Alpha Brainwaves: High natural concentration of L-Theanine induces calm, alert alpha-wave states for deep coding and DBA research without coffee jitters.",
      "Autophagy Synergy: Green tea polyphenols actively stimulate hepatic and cellular autophagy during fasting.",
    ],
  },

  // 4. APPLE CIDER VINEGAR & GINGER DIGESTIVE TONIC
  {
    id: "drink-acv-digestive",
    name: "Apple Cider Vinegar & Ginger Pre-Meal Digestive Primer",
    category: "Digestive Primer",
    timing: "05:15 PM (15 Minutes Before Breaking 23:1 OMAD Fast)",
    fastingSafe: true, // ~5 Calories
    calories: 5,
    hydrationOz: 10,
    ingredients: [
      { item: "Room Temperature Filtered Water", amount: "8-10 oz", purpose: "Gentle on empty stomach" },
      { item: "Raw Unfiltered Apple Cider Vinegar ('With The Mother')", amount: "1 tbsp (15ml)", purpose: "Acetic acid primes stomach acid (HCl) & digestive enzymes" },
      { item: "Fresh Grated Ginger Root", amount: "1/2 tsp freshly grated or juice", purpose: "Gingerol stimulates digestive motility and eliminates gas/bloat" },
      { item: "Pinch of Ceylon Cinnamon", amount: "Pinch", purpose: "Enhances insulin sensitivity" },
    ],
    preparation: [
      "1. Mix 1 tbsp raw unfiltered ACV and grated ginger into 10 oz room-temperature water.",
      "2. Stir well and drink through a straw to protect tooth enamel 15 minutes before your large OMAD feast.",
    ],
    scientificBenefits: [
      "Digestive Protease Activation: Acetic acid rapidly lowers gastric pH, activating pepsinogen into pepsin so your stomach effortlessly digests 140g of protein without acid reflux.",
      "Glycemic Flattening: Consuming ACV before a carb-dense meal (rice) reduces postprandial glucose spikes by up to 34% and improves insulin sensitivity.",
      "Gastric Motility: Gingerol accelerates gastric emptying, preventing the heavy, sluggish feeling after a large single daily meal.",
    ],
  },

  // 5. EVENING CHAMOMILE & MAGNESIUM SLEEP BREW
  {
    id: "drink-chamomile-sleep",
    name: "Evening Chamomile & Magnesium Glycinate Sleep Sanctuary Brew",
    category: "Deep Sleep & Recovery",
    timing: "08:30 PM (90 Minutes Before 10:00 PM Bedtime)",
    fastingSafe: true, // 0 Calories
    calories: 0,
    hydrationOz: 12,
    ingredients: [
      { item: "Boiling Filtered Water", amount: "12 oz", purpose: "Hot herbal infusion" },
      { item: "Whole Egyptian Chamomile Flowers or Peppermint Tea", amount: "2 tea bags or 2 tbsp loose flowers", purpose: "Apigenin for GABA receptor relaxation" },
      { item: "Elemental Magnesium Glycinate Powder", amount: "200-300mg", purpose: "Lowers resting heart rate and deepens Slow-Wave Sleep (SWS)" },
    ],
    preparation: [
      "1. Steep 2 chamomile tea bags in 12 oz freshly boiled water for 7-10 minutes covered.",
      "2. Stir in 200-300mg magnesium glycinate powder until fully dissolved.",
      "3. Sip slowly in dim warm lighting as you wind down for the night.",
    ],
    scientificBenefits: [
      "Apigenin Binding: Chamomile's apigenin binds directly to GABA-A receptors in the brain, quelling sympathetic nervous system arousal and reducing bedtime cortisol.",
      "Growth Hormone Surge: Deep stage 3 and 4 Slow-Wave Sleep is the primary endocrine window for human growth hormone (HGH) release, essential for muscle protein synthesis and fat loss.",
      "Resting Heart Rate Reduction: Magnesium glycinate relaxes vascular smooth muscle, improving nocturnal Heart Rate Variability (HRV).",
    ],
  },
];

/**
 * Returns blueprint by protein source (Fish, Turkey, Chicken)
 */
export function getMealBlueprintByProtein(source: ProteinSourceType): SovereignMealBlueprint {
  return (
    SOVEREIGN_MEAL_BLUEPRINTS.find((b) => b.proteinSource === source) ||
    SOVEREIGN_MEAL_BLUEPRINTS[0]
  );
}

