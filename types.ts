
export interface User {
  id: string;
  email: string;
  dailyCalorieGoal: number;
}

export interface Food {
  id: string;
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
  isCustom?: boolean;
}

export interface FoodEntry {
  id: string;
  foodId: string;
  date: string; // YYYY-MM-DD
  grams: number;
}

export interface MacroNutrients {
    protein: number;
    carbs: number;
    fat: number;
}
