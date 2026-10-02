import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { WorkoutLogEntry, WorkoutRoutine, EquipmentType } from '../types/workout';
import { WORKOUT_ROUTINES, getWorkoutsByEquipment } from '../constants/workoutPlans';

const LOCAL_WORKOUT_KEY = '@foodie_fit_workout_logs';

export interface WorkoutScheduleDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  routine: WorkoutRoutine | null;
  focus: string;
  isRestDay: boolean;
}

export function generateWeeklyWorkoutSchedule(
  equipment: EquipmentType[] = ['bodyweight'],
  goal: string = 'lose_weight'
): WorkoutScheduleDay[] {
  const matchingRoutines = getWorkoutsByEquipment(equipment);
  const hiitOrCardio = matchingRoutines.find((r) => r.category === 'hiit') || matchingRoutines[0];
  const strengthUpper = matchingRoutines.find((r) => r.title.includes('Upper') || r.category === 'strength') || matchingRoutines[0];
  const strengthLower = matchingRoutines.find((r) => r.title.includes('Leg') || r.title.includes('Power')) || matchingRoutines[0];
  const coreMobility = matchingRoutines.find((r) => r.category === 'core') || matchingRoutines[0];

  const isMuscleBuild = goal === 'build_muscle';

  return [
    {
      day: 'Monday',
      routine: isMuscleBuild ? strengthUpper : hiitOrCardio,
      focus: isMuscleBuild ? 'Upper Body Strength' : 'Full Body Conditioning',
      isRestDay: false,
    },
    {
      day: 'Tuesday',
      routine: coreMobility,
      focus: 'Core Stability & Mobility Flow',
      isRestDay: false,
    },
    {
      day: 'Wednesday',
      routine: isMuscleBuild ? strengthLower : strengthUpper,
      focus: isMuscleBuild ? 'Glute & Leg Power' : 'Upper Body Tone',
      isRestDay: false,
    },
    {
      day: 'Thursday',
      routine: null,
      focus: 'Active Rest & Recovery (Light Walk)',
      isRestDay: true,
    },
    {
      day: 'Friday',
      routine: isMuscleBuild ? hiitOrCardio : strengthLower,
      focus: isMuscleBuild ? 'Conditioning Circuit' : 'Lower Body Strength',
      isRestDay: false,
    },
    {
      day: 'Saturday',
      routine: coreMobility,
      focus: 'Mobility, Flexibility & Stretch',
      isRestDay: false,
    },
    {
      day: 'Sunday',
      routine: null,
      focus: 'Full Rest & Weekly Check-In',
      isRestDay: true,
    },
  ];
}

export async function fetchWorkoutLogs(userId?: string): Promise<WorkoutLogEntry[]> {
  if (!userId || userId === 'guest' || userId === 'local_user') {
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
    const list: WorkoutLogEntry[] = (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      workoutId: row.workout_id,
      workoutTitle: row.workout_title,
      durationMinutes: row.duration_minutes,
      caloriesBurned: row.calories_burned ?? undefined,
      completedAt: row.completed_at,
    }));
    await AsyncStorage.setItem(LOCAL_WORKOUT_KEY, JSON.stringify(list));
    return list;
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
  userId?: string
): Promise<WorkoutLogEntry> {
  const newEntry: WorkoutLogEntry = {
    id: `local_wo_${Date.now()}`,
    userId: userId || 'local_user',
    workoutId,
    workoutTitle,
    durationMinutes,
    caloriesBurned,
    completedAt: new Date().toISOString(),
  };

  const localList = await fetchWorkoutLogs();
  const updatedList = [newEntry, ...localList];
  await AsyncStorage.setItem(LOCAL_WORKOUT_KEY, JSON.stringify(updatedList));

  if (userId && userId !== 'guest' && userId !== 'local_user') {
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
