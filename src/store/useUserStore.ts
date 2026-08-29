import { create } from 'zustand';
import { UserProfile, NotificationPreferences } from '../types/auth';
import { NutritionPlan, generateNutritionPlan } from '../services/nutritionEngine';
import { saveProfile } from '../services/userService';
import { RegionCode } from '../types/nutrition';
import { EquipmentType } from '../types/workout';

interface UserState {
  profile: UserProfile | null;
  nutritionPlan: NutritionPlan | null;
  notificationPrefs: NotificationPreferences;
  setProfile: (profile: UserProfile, isGuest?: boolean) => void;
  updateProfilePartial: (updates: Partial<UserProfile>, isGuest?: boolean) => void;
  setRegionPreference: (region: RegionCode, isGuest?: boolean) => void;
  setEquipmentAccess: (equipment: EquipmentType[], isGuest?: boolean) => void;
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

  setProfile: (profile: UserProfile, isGuest = true) => {
    const plan = generateNutritionPlan({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.currentWeightKg,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    });

    set({ profile, nutritionPlan: plan });
    saveProfile(profile, isGuest);
  },

  updateProfilePartial: (updates: Partial<UserProfile>, isGuest = true) => {
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

    set({ profile: updated, nutritionPlan: plan });
    saveProfile(updated, isGuest);
  },

  setRegionPreference: (region: RegionCode, isGuest = true) => {
    get().updateProfilePartial({ regionPreference: region }, isGuest);
  },

  setEquipmentAccess: (equipment: EquipmentType[], isGuest = true) => {
    get().updateProfilePartial({ equipmentAccess: equipment }, isGuest);
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
