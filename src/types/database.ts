export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Relationships: [];
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          age: number;
          gender: 'male' | 'female' | 'other';
          height_cm: number;
          current_weight_kg: number;
          target_weight_kg: number;
          goal: 'lose_weight' | 'build_muscle' | 'maintain';
          activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active';
          dietary_preference: string;
          region_preference: string;
          equipment_access: string[];
          target_calories: number;
          target_protein_g: number;
          target_carbs_g: number;
          target_fat_g: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          age: number;
          gender: 'male' | 'female' | 'other';
          height_cm: number;
          current_weight_kg: number;
          target_weight_kg: number;
          goal: 'lose_weight' | 'build_muscle' | 'maintain';
          activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active';
          dietary_preference: string;
          region_preference: string;
          equipment_access?: string[];
          target_calories: number;
          target_protein_g: number;
          target_carbs_g: number;
          target_fat_g: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      weight_logs: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          notes?: string | null;
          logged_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weight_logs']['Insert']>;
      };
      workout_completions: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          workout_title: string;
          duration_minutes: number;
          calories_burned: number | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          workout_title: string;
          duration_minutes: number;
          calories_burned?: number | null;
          completed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workout_completions']['Insert']>;
      };
      meal_plans: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          daily_plan: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          daily_plan: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['meal_plans']['Insert']>;
      };
      meal_swaps: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          original_meal_id: string;
          swapped_meal_id: string;
          meal_slot: string;
          swapped_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_meal_id: string;
          swapped_meal_id: string;
          meal_slot: string;
          swapped_at?: string;
        };
        Update: Partial<Database['public']['Tables']['meal_swaps']['Insert']>;
      };
      notification_preferences: {
        Relationships: [];
        Row: {
          user_id: string;
          workout_reminders: boolean;
          meal_reminders: boolean;
          weighin_reminders: boolean;
          workout_time: string;
          weighin_day: string;
          weighin_time: string;
          push_token: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          workout_reminders?: boolean;
          meal_reminders?: boolean;
          weighin_reminders?: boolean;
          workout_time?: string;
          weighin_day?: string;
          weighin_time?: string;
          push_token?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
