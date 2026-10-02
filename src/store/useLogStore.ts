import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightLog, JournalEntry, EnergyLevel, AdherenceScore, WorkoutDayStatus } from '../types/auth';
import { WorkoutLogEntry } from '../types/workout';
import { WeeklyMealPlan, MealItem, MealSlot, RegionCode, DietaryPreference } from '../types/nutrition';
import { fetchWeightLogs, logWeightEntry } from '../services/weightService';
import { fetchWorkoutLogs, logWorkoutCompletion } from '../services/workoutService';
import { loadMealPlan, saveMealPlan, generateWeeklyPlan, recordMealSwap } from '../services/mealService';
import { fetchJournalEntries, saveJournalEntry, getTodayJournalEntry } from '../services/journalService';

const LOCAL_WATER_KEY = '@foodie_fit_water_log';

interface WaterRecord {
  date: string; // YYYY-MM-DD
  amountMl: number;
}

interface LogState {
  weightLogs: WeightLog[];
  workoutLogs: WorkoutLogEntry[];
  currentMealPlan: WeeklyMealPlan | null;
  journalEntries: JournalEntry[];
  todayJournalEntry: JournalEntry | null;
  dailyWaterMl: number;
  waterGoalMl: number;
  isLoading: boolean;
  loadInitialData: (userId?: string, region?: RegionCode, targetCalories?: number, diet?: DietaryPreference) => Promise<void>;
  addWeightLog: (weightKg: number, notes?: string, userId?: string) => Promise<void>;
  addWorkoutLog: (workoutId: string, title: string, duration: number, calories?: number, userId?: string) => Promise<void>;
  swapMealInPlan: (day: string, slot: MealSlot, newMeal: MealItem, userId?: string) => Promise<void>;
  setWeeklyMealPlan: (plan: WeeklyMealPlan, userId?: string) => Promise<void>;
  addJournalEntry: (
    entry: {
      energyLevel: EnergyLevel;
      adherenceScore: AdherenceScore;
      workoutStatus: WorkoutDayStatus;
      notes?: string | null;
    },
    userId?: string
  ) => Promise<void>;
  addWater: (amountMl: number) => Promise<void>;
  setWaterGoal: (goalMl: number) => void;
  reset: () => void;
}

export const useLogStore = create<LogState>((set, get) => ({
  weightLogs: [],
  workoutLogs: [],
  currentMealPlan: null,
  journalEntries: [],
  todayJournalEntry: null,
  dailyWaterMl: 0,
  waterGoalMl: 2500,
  isLoading: false,

  loadInitialData: async (userId?: string, region = 'north_america_western', targetCalories = 2000, diet = 'omnivore') => {
    set({ isLoading: true });
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Load water record with day reset
      let currentWater = 0;
      try {
        const rawWater = await AsyncStorage.getItem(LOCAL_WATER_KEY);
        if (rawWater) {
          const parsed: WaterRecord = JSON.parse(rawWater);
          if (parsed.date === todayStr) {
            currentWater = parsed.amountMl || 0;
          } else {
            // New day: reset to 0
            await AsyncStorage.setItem(LOCAL_WATER_KEY, JSON.stringify({ date: todayStr, amountMl: 0 }));
          }
        }
      } catch (e) {
        console.warn('Error reading water log:', e);
      }

      // 2. Fetch parallel logs
      const [weights, workouts, savedPlan, journals] = await Promise.all([
        fetchWeightLogs(userId),
        fetchWorkoutLogs(userId),
        loadMealPlan(),
        fetchJournalEntries(userId),
      ]);

      const activePlan = savedPlan || generateWeeklyPlan(region, targetCalories, diet);
      const todayJournal = journals.find((j) => j.entryDate === todayStr) || null;

      set({
        weightLogs: weights,
        workoutLogs: workouts,
        currentMealPlan: activePlan,
        journalEntries: journals,
        todayJournalEntry: todayJournal,
        dailyWaterMl: currentWater,
        isLoading: false,
      });
    } catch (err) {
      console.warn('Error loading initial logs:', err);
      set({ isLoading: false });
    }
  },

  addWeightLog: async (weightKg, notes, userId) => {
    const entry = await logWeightEntry(weightKg, notes, userId);
    set((state) => ({
      weightLogs: [...state.weightLogs, entry].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
      ),
    }));
  },

  addWorkoutLog: async (workoutId, title, duration, calories, userId) => {
    const entry = await logWorkoutCompletion(workoutId, title, duration, calories, userId);
    set((state) => ({
      workoutLogs: [entry, ...state.workoutLogs],
    }));
  },

  swapMealInPlan: async (day, slot, newMeal, userId) => {
    const current = get().currentMealPlan;
    if (!current) return;

    let originalMealId = '';

    const updatedDays = current.days.map((d) => {
      if (d.day === day) {
        originalMealId = d[slot].id;
        const updatedDay = { ...d, [slot]: newMeal };
        const b = updatedDay.breakfast;
        const l = updatedDay.lunch;
        const din = updatedDay.dinner;
        const s = updatedDay.snack;
        return {
          ...updatedDay,
          totalCalories: b.calories + l.calories + din.calories + s.calories,
          totalProtein: b.proteinGrams + l.proteinGrams + din.proteinGrams + s.proteinGrams,
          totalCarbs: b.carbsGrams + l.carbsGrams + din.carbsGrams + s.carbsGrams,
          totalFat: b.fatGrams + l.fatGrams + din.fatGrams + s.fatGrams,
        };
      }
      return d;
    });

    const updatedPlan: WeeklyMealPlan = { ...current, days: updatedDays };
    set({ currentMealPlan: updatedPlan });

    // Persist plan change locally and to Supabase
    await saveMealPlan(updatedPlan, userId);

    // Audit log the swap
    if (originalMealId) {
      await recordMealSwap(originalMealId, newMeal.id, slot, userId);
    }
  },

  setWeeklyMealPlan: async (plan, userId) => {
    set({ currentMealPlan: plan });
    await saveMealPlan(plan, userId);
  },

  addJournalEntry: async (entryInput, userId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = await saveJournalEntry(
      {
        entryDate: todayStr,
        energyLevel: entryInput.energyLevel,
        adherenceScore: entryInput.adherenceScore,
        workoutStatus: entryInput.workoutStatus,
        notes: entryInput.notes,
      },
      userId
    );

    set((state) => {
      const filtered = state.journalEntries.filter((j) => j.entryDate !== todayStr);
      return {
        journalEntries: [saved, ...filtered],
        todayJournalEntry: saved,
      };
    });
  },

  addWater: async (amountMl) => {
    const current = get().dailyWaterMl;
    const goal = get().waterGoalMl;
    const nextAmount = Math.max(0, Math.min(goal, current + amountMl));
    set({ dailyWaterMl: nextAmount });

    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await AsyncStorage.setItem(
        LOCAL_WATER_KEY,
        JSON.stringify({ date: todayStr, amountMl: nextAmount })
      );
    } catch (e) {
      console.warn('Error saving water log:', e);
    }
  },

  setWaterGoal: (goalMl) => set({ waterGoalMl: Math.max(1000, goalMl) }),

  reset: () =>
    set({
      weightLogs: [],
      workoutLogs: [],
      currentMealPlan: null,
      journalEntries: [],
      todayJournalEntry: null,
      dailyWaterMl: 0,
      isLoading: false,
    }),
}));
