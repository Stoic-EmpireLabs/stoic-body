export interface NotebookMeal {
  romanNumeral: string;
  name: string;
  timing?: string;
  items: string[];
  approxCalories: number;
  approxProteinG: number;
}

export interface NotebookDietPlan {
  title: string;
  goal: string;
  notebookImageUrl: string;
  meals: NotebookMeal[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
}

export function getNutritionNotebook(goal: string, targetCalories: number = 1750): NotebookDietPlan {
  const protein = Math.round((targetCalories * 0.38) / 4);
  const carbs = Math.round((targetCalories * 0.35) / 4);
  const fats = Math.round((targetCalories * 0.27) / 9);
  const fiber = 32;

  return {
    title: "Stoic Sovereign Cutting Diet",
    goal,
    notebookImageUrl: "/assets/blueprints/notebook-diet.jpg",
    macros: {
      calories: targetCalories,
      protein,
      carbs,
      fats,
      fiber,
    },
    meals: [
      {
        romanNumeral: "I",
        name: "Breakfast",
        timing: "08:00 AM",
        items: ["2 whole eggs + 5 egg whites", "Black coffee (single-origin)", "Pinch of pink salt"],
        approxCalories: 260,
        approxProteinG: 34,
      },
      {
        romanNumeral: "II",
        name: "Afternoon Fuel",
        timing: "11:30 AM",
        items: ["50g protein oats or dry soya chunks", "200g low-fat Greek yogurt", "Fresh organic berries"],
        approxCalories: 310,
        approxProteinG: 30,
      },
      {
        romanNumeral: "III",
        name: "Sovereign Feast",
        timing: "02:30 PM",
        items: ["200g grilled chicken breast", "150g steamed jasmine rice", "Steamed broccoli & green asparagus"],
        approxCalories: 480,
        approxProteinG: 48,
      },
      {
        romanNumeral: "IV",
        name: "Pre-Workout Primer",
        timing: "1-1.5 hr before training",
        items: ["1-2 slices whole grain or sourdough toast", "Black coffee (espresso)", "500ml water + pinch of pink salt (5m before)"],
        approxCalories: 150,
        approxProteinG: 6,
      },
      {
        romanNumeral: "V",
        name: "Post-Workout Refuel",
        timing: "Within 45 min post-training",
        items: ["1 scoop whey protein isolate (30g)", "1 medium banana", "5g pure creatine monohydrate"],
        approxCalories: 240,
        approxProteinG: 28,
      },
      {
        romanNumeral: "VI",
        name: "Evening Dinner",
        timing: "07:30 PM",
        items: ["2 whole pasture-raised eggs", "25g raw sprouted almonds", "Mixed leaf salad with olive oil spritz"],
        approxCalories: 280,
        approxProteinG: 16,
      },
      {
        romanNumeral: "VII",
        name: "Night-Recovery",
        timing: "30-45 min before sleep",
        items: ["150g low-fat cottage cheese or micellar casein", "200ml chamomile elixir"],
        approxCalories: 130,
        approxProteinG: 18,
      },
    ],
  };
}
