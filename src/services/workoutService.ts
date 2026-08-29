import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { WorkoutLogEntry } from '../types/workout';

const LOCAL_WORKOUT_KEY = '@foodie_fit_workout_logs';

export async function fetchWorkoutLogs(userId?: string, isGuest: boolean = false): Promise<WorkoutLogEntry[]> {
  if (isGuest || !userId) {
    const raw = await AsyncStorage.getItem(LOCAL_WORKOUT_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  try {
    const { data, error } = await supabase
      .from('workout_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      workoutId: row.workout_id,
      workoutTitle: row.workout_title,
      durationMinutes: row.duration_minutes,
      caloriesBurned: row.calories_burned ?? undefined,
      completedAt: row.completed_at,
    }));
  } catch (err) {
    console.warn('Failed to fetch remote workout logs, reading local cache:', err);
    const raw = await AsyncStorage.getItem(LOCAL_WORKOUT_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

export async function logWorkoutCompletion(
  workoutId: string,
  workoutTitle: string,
  durationMinutes: number,
  caloriesBurned?: number,
  userId?: string,
  isGuest: boolean = false
): Promise<WorkoutLogEntry> {
  const newEntry: WorkoutLogEntry = {
    id: `local_wo_${Date.now()}`,
    userId: userId || 'guest',
    workoutId,
    workoutTitle,
    durationMinutes,
    caloriesBurned,
    completedAt: new Date().toISOString(),
  };

  const localList = await fetchWorkoutLogs(userId, true);
  const updatedList = [newEntry, ...localList];
  await AsyncStorage.setItem(LOCAL_WORKOUT_KEY, JSON.stringify(updatedList));

  if (!isGuest && userId) {
    try {
      const { data, error } = await supabase
        .from('workout_completions')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          workout_title: workoutTitle,
          duration_minutes: durationMinutes,
          calories_burned: caloriesBurned || null,
          completed_at: newEntry.completedAt,
        })
        .select()
        .single();

      if (!error && data) {
        newEntry.id = data.id;
      }
    } catch (err) {
      console.warn('Saved workout locally (remote sync pending):', err);
    }
  }

  return newEntry;
}
