export type RegionCode =
  | 'north_america_western'
  | 'mediterranean'
  | 'west_african'
  | 'east_asian'
  | 'south_asian';

export type DietaryPreference =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Ingredient {
  name: string;
  amount: string;
}

export interface MealItem {
  id: string;
  title: string;
  slot: MealSlot;
  region: RegionCode;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  prepTimeMinutes: number;
  dietaryTags: DietaryPreference[];
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  imageKey?: string;
}

export interface DayPlan {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack: MealItem;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklyMealPlan {
  region: RegionCode;
  days: DayPlan[];
}
