import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { JournalEntry, EnergyLevel, AdherenceScore, WorkoutDayStatus } from '../types/auth';

const LOCAL_JOURNAL_KEY = '@foodie_fit_journal_entries';

export async function fetchJournalEntries(userId?: string): Promise<JournalEntry[]> {
  if (!userId || userId === 'guest') {
    const raw = await AsyncStorage.getItem(LOCAL_JOURNAL_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) throw error;

    const entries: JournalEntry[] = (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      entryDate: row.entry_date,
      energyLevel: row.energy_level as EnergyLevel,
      adherenceScore: row.adherence_score as AdherenceScore,
      workoutStatus: row.workout_status as WorkoutDayStatus,
      notes: row.notes,
      createdAt: row.created_at,
    }));

    await AsyncStorage.setItem(LOCAL_JOURNAL_KEY, JSON.stringify(entries));
    return entries;
  } catch (err) {
    console.warn('Failed to fetch remote journal entries, loading local cache:', err);
    const raw = await AsyncStorage.getItem(LOCAL_JOURNAL_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

export async function saveJournalEntry(
  entryData: {
    entryDate: string;
    energyLevel: EnergyLevel;
    adherenceScore: AdherenceScore;
    workoutStatus: WorkoutDayStatus;
    notes?: string | null;
  },
  userId?: string
): Promise<JournalEntry> {
  const newEntry: JournalEntry = {
    id: `local_j_${Date.now()}`,
    userId: userId || 'local_user',
    entryDate: entryData.entryDate,
    energyLevel: entryData.energyLevel,
    adherenceScore: entryData.adherenceScore,
    workoutStatus: entryData.workoutStatus,
    notes: entryData.notes ?? null,
    createdAt: new Date().toISOString(),
  };

  // 1. Update local storage (upsert by entryDate)
  const existing = await fetchJournalEntries();
  const filtered = existing.filter((e) => e.entryDate !== entryData.entryDate);
  const updated = [newEntry, ...filtered].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  );
  await AsyncStorage.setItem(LOCAL_JOURNAL_KEY, JSON.stringify(updated));

  // 2. Sync to Supabase if authenticated
  if (userId && userId !== 'guest' && userId !== 'local_user') {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .upsert(
          {
            user_id: userId,
            entry_date: entryData.entryDate,
            energy_level: entryData.energyLevel,
            adherence_score: entryData.adherenceScore,
            workout_status: entryData.workoutStatus,
            notes: entryData.notes ?? null,
            created_at: newEntry.createdAt,
          },
          { onConflict: 'user_id,entry_date' }
        )
        .select()
        .single();

      if (!error && data) {
        newEntry.id = data.id;
      }
    } catch (err) {
      console.warn('Queued journal entry locally (offline or unauthenticated):', err);
    }
  }

  return newEntry;
}

export async function getTodayJournalEntry(userId?: string): Promise<JournalEntry | null> {
  const today = new Date().toISOString().split('T')[0];
  const entries = await fetchJournalEntries(userId);
  return entries.find((e) => e.entryDate === today) || null;
}
