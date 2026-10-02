import { create } from 'zustand';
import { UserProfile, NotificationPreferences } from '../types/auth';
import { NutritionPlan, generateNutritionPlan } from '../services/nutritionEngine';
import { saveProfile, loadLocalProfile } from '../services/userService';
import { RegionCode, DietaryPreference } from '../types/nutrition';
import { EquipmentType } from '../types/workout';

interface UserState {
  profile: UserProfile | null;
  nutritionPlan: NutritionPlan | null;
  notificationPrefs: NotificationPreferences;
  initProfile: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  updateProfilePartial: (updates: Partial<UserProfile>) => void;
  setRegionPreference: (region: RegionCode) => void;
  setDietaryPreference: (diet: DietaryPreference) => void;
  setEquipmentAccess: (equipment: EquipmentType[]) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
  calculateAndSetNutrition: () => void;
  reset: () => void;
}

const DEFAULT_NOTIFS: NotificationPreferences = {
  workoutReminders: true,
  mealReminders: true,
  weighinReminders: true,
  workoutTime: '07:00',
  weighinDay: 'Sunday',
  weighinTime: '08:00',
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  nutritionPlan: null,
  notificationPrefs: DEFAULT_NOTIFS,

  initProfile: async () => {
    const cached = await loadLocalProfile();
    if (cached) {
      const plan = generateNutritionPlan({
        age: cached.age,
        gender: cached.gender,
        heightCm: cached.heightCm,
        weightKg: cached.currentWeightKg,
        activityLevel: cached.activityLevel,
        goal: cached.goal,
      });
      set({ profile: cached, nutritionPlan: plan });
    }
  },

  setProfile: (profile: UserProfile) => {
    const plan = generateNutritionPlan({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.currentWeightKg,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    });

    const fullProfile: UserProfile = {
      ...profile,
      targetCalories: plan.targetCalories,
      targetProteinG: plan.proteinGrams,
      targetCarbsG: plan.carbsGrams,
      targetFatG: plan.fatGrams,
    };

    set({ profile: fullProfile, nutritionPlan: plan });
    saveProfile(fullProfile);
  },

  updateProfilePartial: (updates: Partial<UserProfile>) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };

    const plan = generateNutritionPlan({
      age: updated.age,
      gender: updated.gender,
      heightCm: updated.heightCm,
      weightKg: updated.currentWeightKg,
      activityLevel: updated.activityLevel,
      goal: updated.goal,
    });

    const refreshedProfile: UserProfile = {
      ...updated,
      targetCalories: plan.targetCalories,
      targetProteinG: plan.proteinGrams,
      targetCarbsG: plan.carbsGrams,
      targetFatG: plan.fatGrams,
    };

    set({ profile: refreshedProfile, nutritionPlan: plan });
    saveProfile(refreshedProfile);
  },

  setRegionPreference: (region: RegionCode) => {
    get().updateProfilePartial({ regionPreference: region });
  },

  setDietaryPreference: (diet: DietaryPreference) => {
    get().updateProfilePartial({ dietaryPreference: diet });
  },

  setEquipmentAccess: (equipment: EquipmentType[]) => {
    get().updateProfilePartial({ equipmentAccess: equipment });
  },

  setNotificationPrefs: (prefs) => {
    set((state) => ({
      notificationPrefs: { ...state.notificationPrefs, ...prefs },
    }));
  },

  calculateAndSetNutrition: () => {
    const profile = get().profile;
    if (!profile) return;
    const plan = generateNutritionPlan({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.currentWeightKg,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    });
    set({ nutritionPlan: plan });
  },

  reset: () =>
    set({
      profile: null,
      nutritionPlan: null,
      notificationPrefs: DEFAULT_NOTIFS,
    }),
}));
