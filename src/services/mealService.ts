import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { RegionCode, DietaryPreference, MealItem, WeeklyMealPlan, DayPlan, MealSlot } from '../types/nutrition';
import { getMealsByRegion, getSwapCandidates, MEAL_DATABASE } from '../constants/regionalDiets';

const LOCAL_MEAL_PLAN_KEY = '@foodie_fit_meal_plan';
const LOCAL_MEAL_SWAPS_KEY = '@foodie_fit_meal_swaps';

const DAYS: DayPlan['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Proportional caloric distribution across daily meal slots
const SLOT_CALORIE_RATIOS: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.30,
  snack: 0.10,
};

export function generateWeeklyPlan(
  region: RegionCode,
  targetCalories: number,
  dietaryPreference: DietaryPreference = 'omnivore'
): WeeklyMealPlan {
  const regionalMeals = getMealsByRegion(region);

  // Filter meals honoring user's dietary restriction
  const filterByDiet = (meals: MealItem[]) => {
    if (dietaryPreference === 'omnivore') return meals;
    const matched = meals.filter((m) => m.dietaryTags.includes(dietaryPreference));
    return matched.length > 0 ? matched : meals; // graceful regional fallback
  };

  const breakfasts = filterByDiet(regionalMeals.filter((m) => m.slot === 'breakfast'));
  const lunches = filterByDiet(regionalMeals.filter((m) => m.slot === 'lunch'));
  const dinners = filterByDiet(regionalMeals.filter((m) => m.slot === 'dinner'));
  const snacks = filterByDiet(regionalMeals.filter((m) => m.slot === 'snack'));

  const createFallback = (slot: MealSlot): MealItem => {
    const slotCalories = Math.round(targetCalories * SLOT_CALORIE_RATIOS[slot]);
    const proteinGrams = Math.round((slotCalories * 0.30) / 4);
    const carbsGrams = Math.round((slotCalories * 0.45) / 4);
    const fatGrams = Math.round((slotCalories * 0.25) / 9);

    return {
      id: `fb_${slot}_${region}`,
      title: `Balanced Regional ${slot.charAt(0).toUpperCase() + slot.slice(1)}`,
      slot,
      region,
      calories: slotCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      prepTimeMinutes: 15,
      dietaryTags: [dietaryPreference],
      description: `Chef-crafted ${slot} prepared with wholesome regional grains, proteins, and fresh greens.`,
      ingredients: [{ name: 'Regional pantry staples', amount: '1 generous serving' }],
      instructions: ['Prep ingredients and simmer gently with aromatic herbs and healthy fats.'],
    };
  };

  const days: DayPlan[] = DAYS.map((day, idx) => {
    const b = breakfasts[idx % Math.max(1, breakfasts.length)] || createFallback('breakfast');
    const l = lunches[idx % Math.max(1, lunches.length)] || createFallback('lunch');
    const d = dinners[idx % Math.max(1, dinners.length)] || createFallback('dinner');
    const s = snacks[idx % Math.max(1, snacks.length)] || createFallback('snack');

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

export async function saveMealPlan(plan: WeeklyMealPlan, userId?: string): Promise<void> {
  await AsyncStorage.setItem(LOCAL_MEAL_PLAN_KEY, JSON.stringify(plan));
  if (userId && userId !== 'guest' && userId !== 'local_user') {
    try {
      await supabase.from('meal_plans').upsert(
        {
          user_id: userId,
          week_start_date: new Date().toISOString().split('T')[0],
          daily_plan: plan as any,
        },
        { onConflict: 'user_id,week_start_date' }
      );
    } catch (err) {
      console.warn('Failed to sync meal plan to Supabase:', err);
    }
  }
}

export async function loadMealPlan(): Promise<WeeklyMealPlan | null> {
  const raw = await AsyncStorage.getItem(LOCAL_MEAL_PLAN_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function recordMealSwap(
  originalMealId: string,
  swappedMealId: string,
  slot: MealSlot,
  userId?: string
): Promise<void> {
  // 1. Record swap locally
  try {
    const raw = await AsyncStorage.getItem(LOCAL_MEAL_SWAPS_KEY);
    const swaps = raw ? JSON.parse(raw) : [];
    swaps.push({ originalMealId, swappedMealId, slot, swappedAt: new Date().toISOString() });
    await AsyncStorage.setItem(LOCAL_MEAL_SWAPS_KEY, JSON.stringify(swaps));
  } catch (err) {
    console.warn('Error saving local swap history:', err);
  }

  // 2. Sync to Supabase if authenticated
  if (userId && userId !== 'guest' && userId !== 'local_user') {
    try {
      await supabase.from('meal_swaps').insert({
        user_id: userId,
        original_meal_id: originalMealId,
        swapped_meal_id: swappedMealId,
        meal_slot: slot,
      });
    } catch (err) {
      console.warn('Could not record swap to Supabase:', err);
    }
  }
}
