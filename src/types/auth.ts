import { Gender, ActivityLevel, FitnessGoal, NutritionPlan } from '../services/nutritionEngine';
import { RegionCode, DietaryPreference } from './nutrition';
import { EquipmentType } from './workout';

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  age: number;
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  regionPreference: RegionCode;
  equipmentAccess: EquipmentType[];
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weightKg: number;
  notes?: string | null;
  loggedAt: string;
}

export interface NotificationPreferences {
  workoutReminders: boolean;
  mealReminders: boolean;
  weighinReminders: boolean;
  workoutTime: string;
  weighinDay: string;
  weighinTime: string;
  pushToken?: string | null;
}
