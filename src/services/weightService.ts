import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { WeightLog } from '../types/auth';

const LOCAL_WEIGHT_KEY = '@foodie_fit_weight_logs';

export function validateWeight(weightKg: number): boolean {
  return typeof weightKg === 'number' && !isNaN(weightKg) && weightKg >= 25 && weightKg <= 400;
}

export async function fetchWeightLogs(userId?: string): Promise<WeightLog[]> {
  if (!userId || userId === 'guest' || userId === 'local_user') {
    const raw = await AsyncStorage.getItem(LOCAL_WEIGHT_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: true });

    if (error) throw error;
    const logs: WeightLog[] = (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      weightKg: Number(row.weight_kg),
      notes: row.notes,
      loggedAt: row.logged_at,
    }));
    await AsyncStorage.setItem(LOCAL_WEIGHT_KEY, JSON.stringify(logs));
    return logs;
  } catch (err) {
    console.warn('Failed to fetch remote weight logs, reading local cache:', err);
    const raw = await AsyncStorage.getItem(LOCAL_WEIGHT_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

export async function logWeightEntry(
  weightKg: number,
  notes?: string,
  userId?: string
): Promise<WeightLog> {
  if (!validateWeight(weightKg)) {
    throw new Error('Please enter a valid weight between 25kg and 400kg.');
  }

  const newEntry: WeightLog = {
    id: `local_${Date.now()}`,
    userId: userId || 'local_user',
    weightKg: Math.round(weightKg * 10) / 10,
    notes: notes?.trim() || null,
    loggedAt: new Date().toISOString(),
  };

  const localList = await fetchWeightLogs();
  const updatedList = [...localList, newEntry].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );
  await AsyncStorage.setItem(LOCAL_WEIGHT_KEY, JSON.stringify(updatedList));

  if (userId && userId !== 'guest' && userId !== 'local_user') {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          weight_kg: newEntry.weightKg,
          notes: newEntry.notes,
          logged_at: newEntry.loggedAt,
        })
        .select()
        .single();

      if (!error && data) {
        newEntry.id = data.id;
      }
    } catch (err) {
      console.warn('Queued weight log locally (network offline):', err);
    }
  }

  return newEntry;
}
