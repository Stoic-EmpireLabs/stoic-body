export interface BiohackRemedy {
  id: string;
  symptom: string;
  headline: string;
  subtitle: string;
  protocol: string;
  comicIllustrationUrl: string;
  scientificMechanism: string;
  ingredients: string[];
}

export const BIOHACKS_REGISTRY: Record<string, BiohackRemedy> = {
  bloating: {
    id: "bloating",
    symptom: "Bloating & Heavy Digestive Discomfort",
    headline: "Bloating? Eat Ginger",
    subtitle: "Accelerate gastric emptying and eliminate gut inflammation naturally",
    comicIllustrationUrl: "/assets/blueprints/bloating-ginger.jpg",
    protocol: "Slice 15-20g fresh ginger root thinly. Steep in 300ml simmering hot water for 8 minutes. Add a wedge of fresh lemon. Sip immediately after heavy meals.",
    scientificMechanism: "Gingerols and shogaols stimulate gastrointestinal motility, relax the intestinal tract, and dramatically accelerate gastric emptying time.",
    ingredients: ["15–20g Fresh Raw Ginger Root", "300ml Warm/Hot Water", "1 Lemon Wedge", "Optional: 1/2 tsp Raw Honey"],
  },
  soreness: {
    id: "soreness",
    symptom: "Delayed Onset Muscle Soreness (DOMS)",
    headline: "Crushing Soreness? Tart Cherry & Magnesium",
    subtitle: "Downregulate inflammatory cytokines and relax tight muscle fibers",
    comicIllustrationUrl: "/assets/blueprints/bloating-ginger.jpg",
    protocol: "Drink 8oz pure Tart Cherry juice paired with 400mg Magnesium Glycinate 60 minutes before sleep.",
    scientificMechanism: "Anthocyanins in tart cherry inhibit COX-1 and COX-2 enzymes, reducing lipid peroxidation, while chelated magnesium restores cellular ATP.",
    ingredients: ["8oz Montmorency Tart Cherry Juice", "400mg Magnesium Glycinate", "500ml Electrolyte Water"],
  },
  "energy-crash": {
    id: "energy-crash",
    symptom: "Afternoon 2:00 PM Energy Crash & Brain Fog",
    headline: "Midday Crash? Himalayan Pink Salt & Lemon Elixir",
    subtitle: "Rapid adrenal rehydration and cellular electrolyte restoration",
    comicIllustrationUrl: "/assets/blueprints/bloating-ginger.jpg",
    protocol: "Dissolve 1/4 tsp finely ground Himalayan pink salt with juice of half a fresh lemon into 20oz cold water. Chug across 2 minutes.",
    scientificMechanism: "Restores sodium-potassium ATPase pump action across neural membranes and recharges adrenal cortex volume without blood sugar volatility.",
    ingredients: ["20oz Filtered Ice Cold Water", "1/4 tsp Himalayan Pink Salt (500mg Na)", "Fresh Juice of 1/2 Lemon"],
  },
  cravings: {
    id: "cravings",
    symptom: "Late-Night Sugar & Carb Cravings",
    headline: "Night Cravings? Sparkling Water & Apple Cider Vinegar",
    subtitle: "Blunt ghrelin spikes and stabilize evening blood glucose",
    comicIllustrationUrl: "/assets/blueprints/bloating-ginger.jpg",
    protocol: "Mix 1 tbsp raw unfiltered apple cider vinegar with chilled sparkling mineral water and a dash of ground Ceylon cinnamon.",
    scientificMechanism: "Acetic acid delays gastric emptying and enhances skeletal muscle glucose uptake, shutting down sudden neurological cravings.",
    ingredients: ["12oz Sparkling Mineral Water", "1 tbsp Raw Unfiltered ACV (with the 'mother')", "Dash of Ceylon Cinnamon"],
  },
  sleep: {
    id: "sleep",
    symptom: "High Cortisol & Inability to Fall Asleep",
    headline: "Restless Night? Chamomile + L-Theanine + 10m NSDR",
    subtitle: "Shift autonomic nervous system from sympathetic to parasympathetic",
    comicIllustrationUrl: "/assets/blueprints/bloating-ginger.jpg",
    protocol: "Drink concentrated chamomile tea infused with 200mg L-theanine 45 minutes before lights out. Perform 10 minutes of Non-Sleep Deep Rest (NSDR).",
    scientificMechanism: "Apigenin binds to benzodiazepine receptors in the GABA system, triggering immediate alpha wave brain frequency.",
    ingredients: ["1 Strong Cup Chamomile Tea", "200mg L-Theanine", "10-Minute NSDR Breathing Audio"],
  },
};

export function getBiohackRemedy(symptomId: string): BiohackRemedy | undefined {
  const key = symptomId.toLowerCase().trim();
  return BIOHACKS_REGISTRY[key] || BIOHACKS_REGISTRY.bloating;
}
