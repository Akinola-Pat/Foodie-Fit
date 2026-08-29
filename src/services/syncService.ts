import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { UserProfile, WeightLog } from '../types/auth';
import { WorkoutLogEntry } from '../types/workout';
import { WeeklyMealPlan } from '../types/nutrition';

const LOCAL_WEIGHT_KEY = '@foodie_fit_weight_logs';
const LOCAL_WORKOUT_KEY = '@foodie_fit_workout_logs';
const LOCAL_PROFILE_KEY = '@foodie_fit_user_profile';
const LOCAL_MEAL_PLAN_KEY = '@foodie_fit_meal_plan';

export async function migrateGuestDataToSupabase(authenticatedUserId: string): Promise<{ success: boolean; migratedCounts: { weights: number; workouts: number } }> {
  let weightsMigrated = 0;
  let workoutsMigrated = 0;

  try {
    // 1. Sync Profile
    const rawProfile = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
    if (rawProfile) {
      const profile: UserProfile = JSON.parse(rawProfile);
      await supabase.from('profiles').upsert({
        id: authenticatedUserId,
        email: profile.email,
        full_name: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.heightCm,
        current_weight_kg: profile.currentWeightKg,
        target_weight_kg: profile.targetWeightKg,
        goal: profile.goal,
        activity_level: profile.activityLevel,
        dietary_preference: profile.dietaryPreference,
        region_preference: profile.regionPreference,
        equipment_access: profile.equipmentAccess,
        target_calories: profile.targetCalories,
        target_protein_g: profile.targetProteinG,
        target_carbs_g: profile.targetCarbsG,
        target_fat_g: profile.targetFatG,
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Sync Weight Logs
    const rawWeights = await AsyncStorage.getItem(LOCAL_WEIGHT_KEY);
    if (rawWeights) {
      const logs: WeightLog[] = JSON.parse(rawWeights);
      if (logs.length > 0) {
        const rows = logs.map((w) => ({
          user_id: authenticatedUserId,
          weight_kg: w.weightKg,
          notes: w.notes || null,
          logged_at: w.loggedAt,
        }));
        await supabase.from('weight_logs').insert(rows);
        weightsMigrated = rows.length;
      }
    }

    // 3. Sync Workout Completions
    const rawWorkouts = await AsyncStorage.getItem(LOCAL_WORKOUT_KEY);
    if (rawWorkouts) {
      const workouts: WorkoutLogEntry[] = JSON.parse(rawWorkouts);
      if (workouts.length > 0) {
        const rows = workouts.map((wo) => ({
          user_id: authenticatedUserId,
          workout_id: wo.workoutId,
          workout_title: wo.workoutTitle,
          duration_minutes: wo.durationMinutes,
          calories_burned: wo.caloriesBurned || null,
          completed_at: wo.completedAt,
        }));
        await supabase.from('workout_completions').insert(rows);
        workoutsMigrated = rows.length;
      }
    }

    // 4. Sync Meal Plan
    const rawPlan = await AsyncStorage.getItem(LOCAL_MEAL_PLAN_KEY);
    if (rawPlan) {
      const plan: WeeklyMealPlan = JSON.parse(rawPlan);
      await supabase.from('meal_plans').upsert({
        user_id: authenticatedUserId,
        week_start_date: new Date().toISOString().split('T')[0],
        daily_plan: plan as any,
      });
    }

    return {
      success: true,
      migratedCounts: { weights: weightsMigrated, workouts: workoutsMigrated },
    };
  } catch (err) {
    console.warn('Error during guest data migration:', err);
    return {
      success: false,
      migratedCounts: { weights: weightsMigrated, workouts: workoutsMigrated },
    };
  }
}
