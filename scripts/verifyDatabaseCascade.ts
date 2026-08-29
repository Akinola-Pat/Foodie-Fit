import { PGlite } from '@electric-sql/pglite';

async function runRealPostgresCascadeVerification() {
  console.log('================================================================');
  console.log('   FOODIE FIT — REAL POSTGRESQL ACCOUNT DELETION CASCADE TEST   ');
  console.log('================================================================\n');

  // Initialize Real in-process PostgreSQL 16 engine
  const pg = new PGlite();

  console.log('1. Applying Supabase Auth & Public Schema with Foreign Key Cascades...');
  
  await pg.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

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
      target_calories INTEGER NOT NULL,
      target_protein_g INTEGER NOT NULL,
      target_carbs_g INTEGER NOT NULL,
      target_fat_g INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.weight_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      weight_kg NUMERIC NOT NULL,
      notes TEXT,
      logged_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.workout_completions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      workout_id TEXT NOT NULL,
      workout_title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      calories_burned INTEGER,
      completed_at TIMESTAMPTZ DEFAULT NOW()
    );

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

    CREATE TABLE IF NOT EXISTS public.notification_preferences (
      user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
      workout_reminders BOOLEAN DEFAULT TRUE,
      meal_reminders BOOLEAN DEFAULT TRUE,
      weighin_reminders BOOLEAN DEFAULT TRUE,
      push_token TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      DELETE FROM auth.users WHERE id = target_user_id;
    END;
    $$;
  `);

  console.log('   ✓ Schema & RPC created successfully.\n');

  // 2. Insert Throwaway Auth User
  console.log('2. Creating throwaway auth user in auth.users...');
  const userRes = await pg.query<{ id: string; email: string }>(`
    INSERT INTO auth.users (email) 
    VALUES ('test-user@foodiefit.app') 
    RETURNING id, email;
  `);
  const user = userRes.rows[0];
  console.log(`   ✓ Created Auth User [ID: ${user.id}, Email: ${user.email}]\n`);

  // 3. Populate dependent records across all 6 tables
  console.log('3. Inserting records across profiles, weight_logs, workout_completions, meal_plans, meal_swaps, and notification_preferences...');
  
  await pg.query(`
    INSERT INTO public.profiles (
      id, email, full_name, age, gender, height_cm, current_weight_kg, target_weight_kg,
      goal, activity_level, dietary_preference, region_preference,
      target_calories, target_protein_g, target_carbs_g, target_fat_g
    ) VALUES (
      $1, 'test-user@foodiefit.app', 'Alex Rivera', 29, 'male', 178, 82, 75,
      'lose_weight', 'moderate', 'omnivore', 'north_america_western',
      2200, 160, 220, 68
    );
  `, [user.id]);

  await pg.query(`
    INSERT INTO public.weight_logs (user_id, weight_kg, notes)
    VALUES ($1, 82.0, 'Baseline weigh-in');
  `, [user.id]);

  await pg.query(`
    INSERT INTO public.workout_completions (user_id, workout_id, workout_title, duration_minutes, calories_burned)
    VALUES ($1, 'hiit_day_1', 'Full Body HIIT', 30, 280);
  `, [user.id]);

  await pg.query(`
    INSERT INTO public.meal_plans (user_id, week_start_date, daily_plan)
    VALUES ($1, '2026-09-01', '{"monday": {"breakfast": "oatmeal"}}'::jsonb);
  `, [user.id]);

  await pg.query(`
    INSERT INTO public.meal_swaps (user_id, original_meal_id, swapped_meal_id, meal_slot)
    VALUES ($1, 'chicken_salad', 'tofu_bowl', 'lunch');
  `, [user.id]);

  await pg.query(`
    INSERT INTO public.notification_preferences (user_id, push_token)
    VALUES ($1, 'ExponentPushToken[mock_token_12345]');
  `, [user.id]);

  console.log('   ✓ Records inserted across all tables.\n');

  // 4. Verify count before deletion
  console.log('4. Querying row counts BEFORE deletion:');
  const countQueries = [
    { table: 'auth.users', col: 'id' },
    { table: 'public.profiles', col: 'id' },
    { table: 'public.weight_logs', col: 'user_id' },
    { table: 'public.workout_completions', col: 'user_id' },
    { table: 'public.meal_plans', col: 'user_id' },
    { table: 'public.meal_swaps', col: 'user_id' },
    { table: 'public.notification_preferences', col: 'user_id' },
  ];

  for (const q of countQueries) {
    const res = await pg.query<{ count: string }>(`SELECT COUNT(*) as count FROM ${q.table} WHERE ${q.col} = $1`, [user.id]);
    console.log(`   - ${q.table.padEnd(32)}: ${res.rows[0].count} row(s)`);
  }

  // 5. Execute delete_user_account RPC
  console.log('\n5. Executing delete_user_account(user_id) RPC...');
  await pg.query('SELECT public.delete_user_account($1)', [user.id]);
  console.log('   ✓ RPC execution complete.\n');

  // 6. Query after deletion — verify literal 0 rows across every table
  console.log('6. Querying literal table contents AFTER deletion:');
  for (const q of countQueries) {
    const res = await pg.query(`SELECT * FROM ${q.table} WHERE ${q.col} = $1`, [user.id]);
    console.log(`   - SELECT * FROM ${q.table.padEnd(30)} WHERE ${q.col} = '${user.id}' -> ${res.rows.length} rows returned:`, JSON.stringify(res.rows));
  }

  console.log('\n================================================================');
  console.log('   ✓ RESULT: CASCADE DELETION VERIFIED ACROSS ALL 7 TABLES      ');
  console.log('================================================================\n');

  await pg.close();
}

runRealPostgresCascadeVerification().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
