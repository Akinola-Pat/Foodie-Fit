import { create } from 'zustand';
import { WeightLog } from '../types/auth';
import { WorkoutLogEntry } from '../types/workout';
import { WeeklyMealPlan, MealItem, MealSlot } from '../types/nutrition';
import { fetchWeightLogs, logWeightEntry } from '../services/weightService';
import { fetchWorkoutLogs, logWorkoutCompletion } from '../services/workoutService';
import { loadMealPlan, saveMealPlan, generateWeeklyPlan } from '../services/mealService';

interface LogState {
  weightLogs: WeightLog[];
  workoutLogs: WorkoutLogEntry[];
  currentMealPlan: WeeklyMealPlan | null;
  dailyWaterMl: number;
  isLoading: boolean;
  loadInitialData: (userId?: string, isGuest?: boolean) => Promise<void>;
  addWeightLog: (weightKg: number, notes?: string, userId?: string, isGuest?: boolean) => Promise<void>;
  addWorkoutLog: (workoutId: string, title: string, duration: number, calories?: number, userId?: string, isGuest?: boolean) => Promise<void>;
  swapMealInPlan: (day: string, slot: MealSlot, newMeal: MealItem, userId?: string, isGuest?: boolean) => Promise<void>;
  setWeeklyMealPlan: (plan: WeeklyMealPlan, userId?: string, isGuest?: boolean) => Promise<void>;
  addWater: (amountMl: number) => void;
  reset: () => void;
}

export const useLogStore = create<LogState>((set, get) => ({
  weightLogs: [],
  workoutLogs: [],
  currentMealPlan: null,
  dailyWaterMl: 1500,
  isLoading: false,

  loadInitialData: async (userId?: string, isGuest = true) => {
    set({ isLoading: true });
    try {
      const [weights, workouts, savedPlan] = await Promise.all([
        fetchWeightLogs(userId, isGuest),
        fetchWorkoutLogs(userId, isGuest),
        loadMealPlan(),
      ]);

      const activePlan = savedPlan || generateWeeklyPlan('north_america_western', 2000);
      set({
        weightLogs: weights,
        workoutLogs: workouts,
        currentMealPlan: activePlan,
        isLoading: false,
      });
    } catch (err) {
      console.warn('Error loading initial logs:', err);
      set({ isLoading: false });
    }
  },

  addWeightLog: async (weightKg, notes, userId, isGuest = true) => {
    const entry = await logWeightEntry(weightKg, notes, userId, isGuest);
    set((state) => ({
      weightLogs: [...state.weightLogs, entry].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
      ),
    }));
  },

  addWorkoutLog: async (workoutId, title, duration, calories, userId, isGuest = true) => {
    const entry = await logWorkoutCompletion(workoutId, title, duration, calories, userId, isGuest);
    set((state) => ({
      workoutLogs: [entry, ...state.workoutLogs],
    }));
  },

  swapMealInPlan: async (day, slot, newMeal, userId, isGuest = true) => {
    const current = get().currentMealPlan;
    if (!current) return;

    const updatedDays = current.days.map((d) => {
      if (d.day === day) {
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
    await saveMealPlan(updatedPlan, userId, isGuest);
  },

  setWeeklyMealPlan: async (plan, userId, isGuest = true) => {
    set({ currentMealPlan: plan });
    await saveMealPlan(plan, userId, isGuest);
  },

  addWater: (amountMl) =>
    set((state) => ({ dailyWaterMl: Math.max(0, state.dailyWaterMl + amountMl) })),

  reset: () =>
    set({
      weightLogs: [],
      workoutLogs: [],
      currentMealPlan: null,
      dailyWaterMl: 0,
      isLoading: false,
    }),
}));
