-- Foodie Fit — Supabase Database Schema & Foreign Key Cascades

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  height_cm NUMERIC NOT NULL,
  current_weight_kg NUMERIC NOT NULL,
  target_weight_kg NUMERIC NOT NULL,
  goal TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  dietary_preference TEXT NOT NULL,
  region_preference TEXT NOT NULL,
  equipment_access TEXT[] DEFAULT ARRAY['bodyweight']::TEXT[],
  target_calories INTEGER NOT NULL,
  target_protein_g INTEGER NOT NULL,
  target_carbs_g INTEGER NOT NULL,
  target_fat_g INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WEIGHT LOGS
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKOUT COMPLETIONS
CREATE TABLE IF NOT EXISTS public.workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL,
  workout_title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEAL PLANS & SWAPS
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  daily_plan JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meal_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_meal_id TEXT NOT NULL,
  swapped_meal_id TEXT NOT NULL,
  meal_slot TEXT NOT NULL,
  swapped_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  meal_reminders BOOLEAN DEFAULT TRUE,
  weighin_reminders BOOLEAN DEFAULT TRUE,
  workout_time TIME DEFAULT '07:00:00',
  weighin_day TEXT DEFAULT 'Sunday',
  weighin_time TIME DEFAULT '08:00:00',
  push_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can CRUD own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can CRUD own weight logs" ON public.weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own workout completions" ON public.workout_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own meal swaps" ON public.meal_swaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own notification prefs" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);

/**
 * Account Deletion Database Function (Apple Guideline 5.1.1(v))
 * 
 * SECURITY DEFINER: Runs with elevated privileges of the creator (postgres/superuser),
 * allowing it to delete the row directly from auth.users.
 * 
 * When `DELETE FROM auth.users WHERE id = auth.uid()` executes:
 * The foreign key `profiles(id) REFERENCES auth.users(id) ON DELETE CASCADE` triggers.
 * Because all user-data tables reference `profiles(id) ON DELETE CASCADE`, PostgreSQL
 * atomically deletes all rows across profiles, weight_logs, workout_completions,
 * meal_plans, meal_swaps, and notification_preferences in a single transaction.
 */
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- 1. Identify the authenticated caller
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Delete the user from auth.users (cascades to public.profiles and all dependent tables)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execution permission to authenticated users
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
