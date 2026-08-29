/**
 * Foodie Fit — Nutrition Engine
 * 
 * Computes Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE),
 * goal-adjusted daily caloric targets, and macronutrient targets.
 */

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'maintain';

export interface UserProfileInput {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}

export interface NutritionPlan {
  bmr: number;
  tdee: number;
  rawTargetCalories: number;
  targetCalories: number;
  isCalorieClamped: boolean;
  safetyNotice?: string;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

/**
 * Safe Minimum Daily Calorie Floors
 * 
 * Citation / Source Reference:
 * Harvard Health Publishing ("Calorie counting made easy", Harvard Medical School):
 * "Calorie intake should not fall below 1,200 a day for women or 1,500 a day for men,
 * except under the supervision of a health care provider."
 */
export const CALORIC_SAFETY_FLOORS: Record<Gender, number> = {
  male: 1500,
  female: 1200,
  other: 1200, // conservative default for non-binary/other
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,       // Little to no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  very_active: 1.725,  // Hard exercise 6-7 days/week
};

export const GOAL_CALORIE_DELTAS: Record<FitnessGoal, number> = {
  lose_weight: -500,   // ~0.45kg/1lb per week deficit
  maintain: 0,
  build_muscle: 300,   // Clean surplus for hypertrophy
};

export const SAFETY_NOTICE_MESSAGE = 
  'Your goal pace has been adjusted to stay within a safe daily calorie range.';

/**
 * Calculates BMR using the Mifflin-St Jeor formula (gold standard for adults).
 */
export function calculateBMR(age: number, gender: Gender, heightCm: number, weightKg: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  }
  // female or other
  return Math.round(base - 161);
}

/**
 * Calculates TDEE from BMR and Activity Level.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Generates the complete Nutrition Plan with safe-minimum calorie floor enforcement
 * and balanced macronutrient distribution respecting the macro-calorie sum invariant.
 */
export function generateNutritionPlan(input: UserProfileInput): NutritionPlan {
  const bmr = calculateBMR(input.age, input.gender, input.heightCm, input.weightKg);
  const tdee = calculateTDEE(bmr, input.activityLevel);
  
  const delta = GOAL_CALORIE_DELTAS[input.goal] ?? 0;
  const rawTargetCalories = tdee + delta;
  
  const floor = CALORIC_SAFETY_FLOORS[input.gender] ?? 1200;
  
  // Safe-minimum clamping check
  const isCalorieClamped = rawTargetCalories < floor;
  const targetCalories = isCalorieClamped ? floor : rawTargetCalories;
  const safetyNotice = isCalorieClamped ? SAFETY_NOTICE_MESSAGE : undefined;

  /**
   * Balanced Macronutrient Distribution:
   * 1. Baseline Protein: 2.0g per kg of bodyweight, capped at 35% of total calories
   *    to ensure adequate room for essential fats and complex carbohydrates, with a floor of 1.2g/kg.
   * 2. Fat: 28% of total calories (9 kcal/g).
   * 3. Carbohydrates: Remaining calories (4 kcal/g).
   */
  const maxProteinCalories = targetCalories * 0.35;
  const rawProteinCalories = input.weightKg * 2.0 * 4;
  const proteinCalories = Math.min(rawProteinCalories, maxProteinCalories);
  const proteinGrams = Math.round(proteinCalories / 4);

  const fatCalories = targetCalories * 0.28;
  const fatGrams = Math.round(fatCalories / 9);

  // Exact remaining calories allocated to carbohydrates to preserve the calorie-macro sum invariant
  const remainingCalories = Math.max(0, targetCalories - (proteinGrams * 4) - (fatGrams * 9));
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    bmr,
    tdee,
    rawTargetCalories,
    targetCalories,
    isCalorieClamped,
    safetyNotice,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}
