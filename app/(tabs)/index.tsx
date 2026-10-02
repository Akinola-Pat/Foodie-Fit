import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Droplet, Plus, Minus, Dumbbell, CheckCircle2, Play, Sparkles, Scale, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { MealCard } from '../../src/components/meals/MealCard';
import { MealDetailModal } from '../../src/components/meals/MealDetailModal';
import { MealSwapSheet } from '../../src/components/meals/MealSwapSheet';
import { WorkoutPlayerModal } from '../../src/components/workouts/WorkoutPlayerModal';
import { DailyCheckInModal } from '../../src/components/common/DailyCheckInModal';
import { WeightLogModal } from '../../src/components/common/WeightLogModal';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLogStore } from '../../src/store/useLogStore';
import { generateWeeklyWorkoutSchedule } from '../../src/services/workoutService';
import { DayPlan, MealItem, MealSlot } from '../../src/types/nutrition';
import { WorkoutRoutine } from '../../src/types/workout';

const WEEKDAY_NAMES: DayPlan['day'][] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile, nutritionPlan } = useUserStore();
  const userId = useAuthStore((state) => state.userId);
  const {
    weightLogs,
    workoutLogs,
    currentMealPlan,
    todayJournalEntry,
    dailyWaterMl,
    waterGoalMl,
    addWater,
    swapMealInPlan,
    addWorkoutLog,
    addJournalEntry,
    addWeightLog,
  } = useLogStore();

  // Modals state
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [swappingMeal, setSwappingMeal] = useState<MealItem | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);

  const todayIndex = new Date().getDay();
  const todayName = WEEKDAY_NAMES[todayIndex];
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Today's meal plan
  const todayPlan = currentMealPlan?.days.find((d) => d.day === todayName) ?? currentMealPlan?.days[0];

  // Today's workout split
  const weeklyWorkoutSchedule = generateWeeklyWorkoutSchedule(
    profile?.equipmentAccess || ['bodyweight'],
    profile?.goal || 'lose_weight'
  );
  const todayWorkoutDay = weeklyWorkoutSchedule.find((w) => w.day === todayName) ?? weeklyWorkoutSchedule[0];
  const isWorkoutDoneToday = workoutLogs.some(
    (w) => w.completedAt.split('T')[0] === todayDateStr && (todayWorkoutDay.routine ? w.workoutId === todayWorkoutDay.routine.id : true)
  );

  const waterProgress = Math.min(1, dailyWaterMl / Math.max(1, waterGoalMl));

  // Weight summary
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : profile?.currentWeightKg;
  const targetWeight = profile?.targetWeightKg;
  const weightDiff = latestWeight && targetWeight ? Math.abs(Math.round((latestWeight - targetWeight) * 10) / 10) : 0;

  if (!profile || !nutritionPlan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to Foodie Fit</Text>
        <Text style={styles.emptySubtitle}>Let’s build your customized nutrition and workout plan.</Text>
        <Button
          title="Start Onboarding"
          variant="primary"
          size="large"
          onPress={() => router.replace('/(onboarding)/step1-basics')}
        />
      </View>
    );
  }

  const handleWorkoutComplete = async (durationMinutes: number, caloriesBurned: number) => {
    if (todayWorkoutDay.routine) {
      await addWorkoutLog(
        todayWorkoutDay.routine.id,
        todayWorkoutDay.routine.title,
        durationMinutes,
        caloriesBurned,
        userId || undefined
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Header Greeting */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>
            {profile.fullName ? `Hello, ${profile.fullName.split(' ')[0]}` : 'Welcome back'}
          </Text>
          <Text style={styles.dateLabel}>
            {todayName}, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logWeightHeaderBtn}
          onPress={() => setWeightModalVisible(true)}
          activeOpacity={0.8}
        >
          <Scale size={16} color={Colors.primary} />
          <Text style={styles.logWeightText}>
            {latestWeight ? `${latestWeight} kg` : 'Log Wt'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Today's Calorie & Macro Target Card */}
      <Card variant="elevated" style={styles.calorieCard}>
        <View style={styles.calorieHeader}>
          <View style={styles.calorieBadge}>
            <Flame size={18} color={Colors.accent} />
            <Text style={styles.calorieValue}>{nutritionPlan.targetCalories}</Text>
            <Text style={styles.calorieUnit}>kcal target</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/meals')} style={styles.seePlanBtn}>
            <Text style={styles.seePlanText}>Full Week</Text>
            <ChevronRight size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: Colors.protein }]}>{nutritionPlan.proteinGrams}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: Colors.carbs }]}>{nutritionPlan.carbsGrams}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: Colors.fat }]}>{nutritionPlan.fatGrams}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: Colors.textPrimary }]}>{weightDiff} kg</Text>
            <Text style={styles.macroLabel}>To Target</Text>
          </View>
        </View>
      </Card>

      {/* 3. Daily Reflection / Journal Prompt */}
      <TouchableOpacity
        style={styles.reflectionBanner}
        onPress={() => setCheckInVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.reflectionIconWrap}>
          <Sparkles size={18} color={Colors.accentWarm} />
        </View>
        <View style={styles.reflectionTextWrap}>
          <Text style={styles.reflectionTitle}>
            {todayJournalEntry ? 'Daily Check-In Completed' : 'Daily Reflection'}
          </Text>
          <Text style={styles.reflectionSubtitle}>
            {todayJournalEntry
              ? `Energy: ${todayJournalEntry.energyLevel} • Habits: ${todayJournalEntry.adherenceScore.replace('_', ' ')}`
              : 'How are you feeling today? Tap to record your 30s check-in.'}
          </Text>
        </View>
        <ChevronRight size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      {/* 4. Today's Workout Card */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Today's Training</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
          <Text style={styles.sectionLink}>View Split</Text>
        </TouchableOpacity>
      </View>

      <Card variant="outlined" style={styles.workoutCard}>
        {todayWorkoutDay.isRestDay ? (
          <View style={styles.restDayWrap}>
            <View style={styles.restIconWrap}>
              <Text style={{ fontSize: 24 }}>🛋️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.workoutRoutineTitle}>Scheduled Rest & Recovery</Text>
              <Text style={styles.workoutRoutineDesc}>
                Muscles rebuild during rest. Focus on hydration, mobility, and nourishing whole foods.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.activeWorkoutWrap}>
            <View style={styles.workoutTopRow}>
              <View style={styles.workoutBadge}>
                <Dumbbell size={16} color={Colors.primary} />
                <Text style={styles.workoutBadgeText}>{todayWorkoutDay.focus}</Text>
              </View>
              {isWorkoutDoneToday && (
                <View style={styles.completedBadge}>
                  <CheckCircle2 size={14} color="#15803D" />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
            </View>

            <Text style={styles.workoutRoutineTitle}>{todayWorkoutDay.routine?.title}</Text>
            <Text style={styles.workoutRoutineDesc} numberOfLines={2}>
              {todayWorkoutDay.routine?.description}
            </Text>

            <View style={styles.workoutMetaRow}>
              <Text style={styles.workoutMetaText}>⏱️ {todayWorkoutDay.routine?.durationMinutes} mins</Text>
              <Text style={styles.workoutMetaText}>🔥 ~{todayWorkoutDay.routine?.estimatedCaloriesBurned} kcal</Text>
              <Text style={styles.workoutMetaText}>🏋️ {todayWorkoutDay.routine?.exercises.length} movements</Text>
            </View>

            <Button
              title={isWorkoutDoneToday ? 'Repeat Workout' : 'Start Today\'s Session'}
              variant={isWorkoutDoneToday ? 'outline' : 'primary'}
              size="medium"
              onPress={() => setActiveWorkout(todayWorkoutDay.routine)}
              icon={<Play size={16} color={isWorkoutDoneToday ? Colors.primary : Colors.textOnPrimary} />}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </Card>

      {/* 5. Hydration Progress */}
      <Card variant="cream" style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View style={styles.waterTitleRow}>
            <Droplet size={18} color={Colors.info} />
            <Text style={styles.waterTitle}>Daily Hydration</Text>
          </View>
          <Text style={styles.waterAmount}>
            {(dailyWaterMl / 1000).toFixed(1)}L / {(waterGoalMl / 1000).toFixed(1)}L
          </Text>
        </View>
        <View style={styles.waterTrack}>
          <View style={[styles.waterFill, { width: `${waterProgress * 100}%` }]} />
        </View>
        <View style={styles.waterButtons}>
          <TouchableOpacity
            style={styles.waterAdjustBtn}
            onPress={() => addWater(-250)}
            activeOpacity={0.7}
          >
            <Minus size={16} color={Colors.textSecondary} />
            <Text style={styles.waterAdjustText}>-250 ml</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.waterAdjustBtn, styles.waterAdjustBtnPrimary]}
            onPress={() => addWater(250)}
            activeOpacity={0.7}
          >
            <Plus size={16} color={Colors.primary} />
            <Text style={[styles.waterAdjustText, { color: Colors.primary }]}>+250 ml</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 6. Today's Meals Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Today's Nutrition Plan</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/meals')}>
          <Text style={styles.sectionLink}>Customize</Text>
        </TouchableOpacity>
      </View>

      {todayPlan ? (
        <View style={styles.mealList}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => {
            const meal = todayPlan[slot];
            return (
              <MealCard
                key={meal.id}
                meal={meal}
                onPressDetails={() => setSelectedMeal(meal)}
                onSwapPress={() => setSwappingMeal(meal)}
              />
            );
          })}
        </View>
      ) : (
        <Card variant="outlined">
          <Text style={styles.emptyText}>Loading today's meal plan...</Text>
        </Card>
      )}

      {/* Modals */}
      <MealDetailModal
        visible={!!selectedMeal}
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onSwapPress={() => {
          const m = selectedMeal;
          setSelectedMeal(null);
          setSwappingMeal(m);
        }}
      />

      <MealSwapSheet
        visible={!!swappingMeal}
        currentMeal={swappingMeal}
        onClose={() => setSwappingMeal(null)}
        onSelectSwap={(newMeal) => {
          if (swappingMeal) {
            swapMealInPlan(todayName, swappingMeal.slot, newMeal, userId || undefined);
          }
        }}
      />

      <WorkoutPlayerModal
        visible={!!activeWorkout}
        workout={activeWorkout}
        onClose={() => setActiveWorkout(null)}
        onComplete={handleWorkoutComplete}
      />

      <DailyCheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onSave={(data) => addJournalEntry(data, userId || undefined)}
        existingEntry={todayJournalEntry}
      />

      <WeightLogModal
        visible={weightModalVisible}
        onClose={() => setWeightModalVisible(false)}
        onSave={async (w, notes) => addWeightLog(w, notes, userId || undefined)}
        defaultWeightKg={latestWeight}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logWeightHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  logWeightText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  calorieCard: {
    marginBottom: 14,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  calorieUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  seePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seePlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reflectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reflectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDF0CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reflectionTextWrap: {
    flex: 1,
    marginRight: 6,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  reflectionSubtitle: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  workoutCard: {
    marginBottom: 18,
  },
  restDayWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  restIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeWorkoutWrap: {},
  workoutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  workoutBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  workoutRoutineTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  workoutRoutineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  workoutMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 4,
  },
  workoutMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  waterCard: {
    marginBottom: 18,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textOnCream,
  },
  waterAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  waterTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  waterFill: {
    height: '100%',
    backgroundColor: Colors.info,
    borderRadius: 4,
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  waterAdjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  waterAdjustBtnPrimary: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  waterAdjustText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  mealList: {
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
