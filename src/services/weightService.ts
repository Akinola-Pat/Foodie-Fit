import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { WeightLog } from '../types/auth';

const LOCAL_WEIGHT_KEY = '@foodie_fit_weight_logs';

export async function fetchWeightLogs(userId?: string, isGuest: boolean = false): Promise<WeightLog[]> {
  if (isGuest || !userId) {
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
    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      weightKg: Number(row.weight_kg),
      notes: row.notes,
      loggedAt: row.logged_at,
    }));
  } catch (err) {
    console.warn('Failed to fetch remote weight logs, reading local cache:', err);
    const raw = await AsyncStorage.getItem(LOCAL_WEIGHT_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

export async function logWeightEntry(
  weightKg: number,
  notes?: string,
  userId?: string,
  isGuest: boolean = false
): Promise<WeightLog> {
  const newEntry: WeightLog = {
    id: `local_${Date.now()}`,
    userId: userId || 'guest',
    weightKg,
    notes: notes || null,
    loggedAt: new Date().toISOString(),
  };

  // Always update local cache for instant UI response and guest support
  const localList = await fetchWeightLogs(userId, true);
  const updatedList = [...localList, newEntry].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );
  await AsyncStorage.setItem(LOCAL_WEIGHT_KEY, JSON.stringify(updatedList));

  if (!isGuest && userId) {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          weight_kg: weightKg,
          notes: notes || null,
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
