import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { RegionCode, MealItem, WeeklyMealPlan, DayPlan } from '../types/nutrition';
import { getMealsByRegion } from '../constants/regionalDiets';

const LOCAL_MEAL_PLAN_KEY = '@foodie_fit_meal_plan';
const LOCAL_MEAL_SWAPS_KEY = '@foodie_fit_meal_swaps';

const DAYS: DayPlan['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function generateWeeklyPlan(region: RegionCode, targetCalories: number): WeeklyMealPlan {
  const regionalMeals = getMealsByRegion(region);
  const breakfasts = regionalMeals.filter((m) => m.slot === 'breakfast');
  const lunches = regionalMeals.filter((m) => m.slot === 'lunch');
  const dinners = regionalMeals.filter((m) => m.slot === 'dinner');
  const snacks = regionalMeals.filter((m) => m.slot === 'snack');

  const fallbackMeal = (slot: MealItem['slot']): MealItem => ({
    id: `fb_${slot}`,
    title: `Healthy Balanced ${slot.toUpperCase()}`,
    slot,
    region,
    calories: Math.round(targetCalories / 4),
    proteinGrams: 30,
    carbsGrams: 40,
    fatGrams: 12,
    prepTimeMinutes: 15,
    dietaryTags: ['omnivore', 'vegetarian'],
    description: `Chef-crafted ${slot} balanced with complex carbohydrates and lean proteins.`,
    ingredients: [{ name: 'Whole food staples', amount: '1 portion' }],
    instructions: ['Prepare ingredients and cook with healthy oils.'],
  });

  const days: DayPlan[] = DAYS.map((day, idx) => {
    const b = breakfasts[idx % Math.max(1, breakfasts.length)] || fallbackMeal('breakfast');
    const l = lunches[idx % Math.max(1, lunches.length)] || fallbackMeal('lunch');
    const d = dinners[idx % Math.max(1, dinners.length)] || fallbackMeal('dinner');
    const s = snacks[idx % Math.max(1, snacks.length)] || fallbackMeal('snack');

    return {
      day,
      breakfast: b,
      lunch: l,
      dinner: d,
      snack: s,
      totalCalories: b.calories + l.calories + d.calories + s.calories,
      totalProtein: b.proteinGrams + l.proteinGrams + d.proteinGrams + s.proteinGrams,
      totalCarbs: b.carbsGrams + l.carbsGrams + d.carbsGrams + s.carbsGrams,
      totalFat: b.fatGrams + l.fatGrams + d.fatGrams + s.fatGrams,
    };
  });

  return { region, days };
}

export async function saveMealPlan(plan: WeeklyMealPlan, userId?: string, isGuest: boolean = false): Promise<void> {
  await AsyncStorage.setItem(LOCAL_MEAL_PLAN_KEY, JSON.stringify(plan));
  if (!isGuest && userId) {
    try {
      await supabase.from('meal_plans').upsert({
        user_id: userId,
        week_start_date: new Date().toISOString().split('T')[0],
        daily_plan: plan as any,
      });
    } catch (err) {
      console.warn('Failed to sync meal plan to Supabase:', err);
    }
  }
}

export async function loadMealPlan(): Promise<WeeklyMealPlan | null> {
  const raw = await AsyncStorage.getItem(LOCAL_MEAL_PLAN_KEY);
  return raw ? JSON.parse(raw) : null;
}
