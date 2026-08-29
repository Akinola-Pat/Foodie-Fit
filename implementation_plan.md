# Foodie Fit — Architecture & Implementation Plan (Final Pre-Scaffold Verification)

## Executive Summary & Architecture Overview

**Foodie Fit** is an AI-inspired fitness, nutrition, and habit tracking mobile application built with **React Native (Expo SDK 51+)**, **TypeScript**, and **Supabase (PostgreSQL + Auth + Row Level Security)**.

All verification checks have been executed against live runtime environments (Node.js Jest suite and full PostgreSQL 16 database engine).

---

## 1. Nutrition Engine & Caloric Safety Floor

### 1.1 Source-Verified Implementation in [`src/services/nutritionEngine.ts`](file:///c:/Users/PC/Desktop/Foodie%20Fit/src/services/nutritionEngine.ts)

```typescript
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
  other: 1200,
};

export const SAFETY_NOTICE_MESSAGE = 
  'Your goal pace has been adjusted to stay within a safe daily calorie range.';

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
   * Balanced Macronutrient Distribution & Invariant Preservation:
   * 1. Baseline Protein: 2.0g per kg of bodyweight, capped at 35% of total calories
   *    to ensure adequate room for essential fats and complex carbohydrates.
   * 2. Fat: 28% of total calories (9 kcal/g).
   * 3. Carbohydrates: Remaining calories (4 kcal/g).
   */
  const maxProteinCalories = targetCalories * 0.35;
  const rawProteinCalories = input.weightKg * 2.0 * 4;
  const proteinCalories = Math.min(rawProteinCalories, maxProteinCalories);
  const proteinGrams = Math.round(proteinCalories / 4);

  const fatCalories = targetCalories * 0.28;
  const fatGrams = Math.round(fatCalories / 9);

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
```

---

## 2. In-App Account Deletion (Apple Guideline 5.1.1(v))

### 2.1 Database Function with Elevated Privilege in [`supabase/schema.sql`](file:///c:/Users/PC/Desktop/Foodie%20Fit/supabase/schema.sql)

```sql
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users (cascades to public.profiles and all 6 dependent tables)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;
```

---

## 3. Real Verification Results

### 3.1 Real PostgreSQL 16 Database Engine Cascade Test (`scripts/verifyDatabaseCascade.ts`)
```
================================================================
   FOODIE FIT — REAL POSTGRESQL ACCOUNT DELETION CASCADE TEST   
================================================================

1. Applying Supabase Auth & Public Schema with Foreign Key Cascades...
   ✓ Schema & RPC created successfully.

2. Creating throwaway auth user in auth.users...
   ✓ Created Auth User [ID: 099ca70f-07ae-48c6-9b81-76683a6ea0ca, Email: test-user@foodiefit.app]

3. Inserting records across profiles, weight_logs, workout_completions, meal_plans, meal_swaps, and notification_preferences...
   ✓ Records inserted across all tables.

4. Querying row counts BEFORE deletion:
   - auth.users                      : 1 row(s)
   - public.profiles                 : 1 row(s)
   - public.weight_logs              : 1 row(s)
   - public.workout_completions      : 1 row(s)
   - public.meal_plans               : 1 row(s)
   - public.meal_swaps               : 1 row(s)
   - public.notification_preferences : 1 row(s)

5. Executing delete_user_account(user_id) RPC...
   ✓ RPC execution complete.

6. Querying literal table contents AFTER deletion:
   - SELECT * FROM auth.users                     WHERE id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []
   - SELECT * FROM public.profiles                WHERE id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []
   - SELECT * FROM public.weight_logs             WHERE user_id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []
   - SELECT * FROM public.workout_completions     WHERE user_id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []
   - SELECT * FROM public.meal_plans              WHERE user_id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []
   - SELECT * FROM public.meal_swaps              WHERE user_id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []
   - SELECT * FROM public.notification_preferences WHERE user_id = '099ca70f-07ae-48c6-9b81-76683a6ea0ca' -> 0 rows returned: []

================================================================
   ✓ RESULT: CASCADE DELETION VERIFIED ACROSS ALL 7 TABLES      
================================================================
```

### 3.2 Jest Test Suite Output (`npm test -- --verbose`)
```
PASS __tests__/nutritionEngine.test.ts
  Foodie Fit Nutrition Engine
    BMR & TDEE Calculations (Mifflin-St Jeor)
      √ calculates BMR accurately for standard male baseline (6 ms)
      √ calculates BMR accurately for standard female baseline
      √ calculates TDEE with correct activity multipliers (1 ms)
    Standard User Profiles (Unclamped)
      √ generates standard fat loss plan without clamping for high-TDEE user (2 ms)
      √ generates muscle gain plan with 300 kcal surplus (1 ms)
    Low-TDEE Profiles & Safe Minimum Floor Clamping (Harvard Guidance)
      √ clamps low-TDEE female user to 1200 kcal floor and returns safety notice (1 ms)
      √ clamps low-TDEE male user to 1500 kcal floor and returns safety notice (1 ms)
    Macro-Sum Invariant Tests Across Extreme & Clamped Inputs
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "moderate", "age": 30, "gender": "male", "goal": "lose_weight", "heightCm": 180, "weightKg": 80}
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "light", "age": 28, "gender": "female", "goal": "maintain", "heightCm": 165, "weightKg": 60} (1 ms)
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "sedentary", "age": 50, "gender": "female", "goal": "lose_weight", "heightCm": 148, "weightKg": 48}
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "sedentary", "age": 55, "gender": "female", "goal": "lose_weight", "heightCm": 150, "weightKg": 95} (1 ms)
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "sedentary", "age": 60, "gender": "female", "goal": "lose_weight", "heightCm": 152, "weightKg": 120}
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "sedentary", "age": 65, "gender": "male", "goal": "lose_weight", "heightCm": 160, "weightKg": 110}
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "very_active", "age": 24, "gender": "male", "goal": "build_muscle", "heightCm": 190, "weightKg": 100} (1 ms)
      √ asserts macro sum invariant (P*4 + F*9 + C*4 ≈ Target) for profile: {"activityLevel": "very_active", "age": 22, "gender": "female", "goal": "maintain", "heightCm": 170, "weightKg": 55}

PASS __tests__/authService.test.ts
  Foodie Fit Auth Service — In-App Account Deletion (Apple 5.1.1(v))
    √ successfully invokes delete_user_account RPC, signs out, clears storage, and resets stores (11 ms)
    √ returns error if the Supabase RPC fails without clearing local state prematurely (2 ms)

Test Suites: 2 passed, 2 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        3.223 s
Ran all test suites.
```
