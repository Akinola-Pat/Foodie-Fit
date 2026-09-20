import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Droplet, Plus, Minus } from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { GuestBanner } from '../../src/components/common/GuestBanner';
import { MealCard } from '../../src/components/meals/MealCard';
import { WeightTrendChart } from '../../src/components/charts/WeightTrendChart';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLogStore } from '../../src/store/useLogStore';
import { DayPlan } from '../../src/types/nutrition';

const WEEKDAY_NAMES: DayPlan['day'][] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function Dashboard() {
  const router = useRouter();
  const { profile, nutritionPlan } = useUserStore();
  const isGuest = useAuthStore((state) => state.isGuest);
  const { weightLogs, currentMealPlan, dailyWaterMl, addWater } = useLogStore();

  const todayName = WEEKDAY_NAMES[new Date().getDay()];
  const todayPlan = currentMealPlan?.days.find((d) => d.day === todayName) ?? currentMealPlan?.days[0];

  const waterGoalMl = 2500;
  const waterProgress = Math.min(1, dailyWaterMl / waterGoalMl);

  if (!profile || !nutritionPlan) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          Your profile has not loaded yet. If this persists, restart onboarding.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {isGuest && (
        <GuestBanner onPressSaveAccount={() => router.push('/(onboarding)/plan-summary')} />
      )}

      <Text style={styles.greeting}>
        {profile.fullName ? `Hi, ${profile.fullName.split(' ')[0]}` : 'Welcome back'}
      </Text>
      <Text style={styles.dateLabel}>{todayName}</Text>

      <Card variant="elevated" style={styles.calorieCard}>
        <View style={styles.calorieRow}>
          <Flame size={20} color={Colors.accent} />
          <Text style={styles.calorieValue}>{nutritionPlan.targetCalories}</Text>
          <Text style={styles.calorieUnit}>kcal target today</Text>
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
        </View>
      </Card>

      <Card variant="cream" style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View style={styles.waterTitleRow}>
            <Droplet size={16} color={Colors.info} />
            <Text style={styles.waterTitle}>Water</Text>
          </View>
          <Text style={styles.waterAmount}>{(dailyWaterMl / 1000).toFixed(1)}L / {(waterGoalMl / 1000).toFixed(1)}L</Text>
        </View>
        <View style={styles.waterTrack}>
          <View style={[styles.waterFill, { width: `${waterProgress * 100}%` }]} />
        </View>
        <View style={styles.waterButtons}>
          <Minus
            size={18}
            color={Colors.textSecondary}
            onPress={() => addWater(-250)}
            style={styles.waterBtn}
          />
          <Plus
            size={18}
            color={Colors.primary}
            onPress={() => addWater(250)}
            style={styles.waterBtn}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Weight Trend</Text>
      <WeightTrendChart logs={weightLogs} targetWeightKg={profile.targetWeightKg} />

      <Text style={styles.sectionTitle}>Today's Meals</Text>
      {todayPlan ? (
        <>
          <MealCard meal={todayPlan.breakfast} />
          <MealCard meal={todayPlan.lunch} />
          <MealCard meal={todayPlan.dinner} />
          <MealCard meal={todayPlan.snack} />
        </>
      ) : (
        <Card variant="outlined">
          <Text style={styles.emptyMealText}>No meal plan loaded yet.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  calorieCard: {
    marginBottom: 12,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  calorieUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  waterCard: {
    marginBottom: 20,
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
    marginBottom: 10,
  },
  waterFill: {
    height: '100%',
    backgroundColor: Colors.info,
    borderRadius: 4,
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  waterBtn: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 4,
  },
  emptyMealText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
