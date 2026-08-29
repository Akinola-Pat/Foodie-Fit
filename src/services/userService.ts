import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { UserProfile } from '../types/auth';

const LOCAL_PROFILE_KEY = '@foodie_fit_user_profile';

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      age: data.age,
      gender: data.gender,
      heightCm: Number(data.height_cm),
      currentWeightKg: Number(data.current_weight_kg),
      targetWeightKg: Number(data.target_weight_kg),
      goal: data.goal,
      activityLevel: data.activity_level,
      dietaryPreference: data.dietary_preference as any,
      regionPreference: data.region_preference as any,
      equipmentAccess: (data.equipment_access || ['bodyweight']) as any,
      targetCalories: data.target_calories,
      targetProteinG: data.target_protein_g,
      targetCarbsG: data.target_carbs_g,
      targetFatG: data.target_fat_g,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (err) {
    console.warn('Failed to fetch remote profile, reading local storage:', err);
    const raw = await AsyncStorage.getItem(LOCAL_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}

export async function saveProfile(profile: UserProfile, isGuest: boolean = false): Promise<void> {
  await AsyncStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));

  if (!isGuest && profile.id && profile.id !== 'guest') {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.heightCm,
        current_weight_kg: profile.currentWeightKg,
        target_weight_kg: profile.targetWeightKg,
        goal: profile.goal,
        activity_level: profile.activityLevel,
        dietary_preference: profile.dietaryPreference,
        region_preference: profile.regionPreference,
        equipment_access: profile.equipmentAccess,
        target_calories: profile.targetCalories,
        target_protein_g: profile.targetProteinG,
        target_carbs_g: profile.targetCarbsG,
        target_fat_g: profile.targetFatG,
        updated_at: new Date().toISOString(),
      });
      if (error) console.warn('Supabase upsert profile warning:', error.message);
    } catch (err) {
      console.warn('Could not sync profile to remote database:', err);
    }
  }
}
