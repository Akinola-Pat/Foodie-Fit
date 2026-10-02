import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { MealCard } from '../../src/components/meals/MealCard';
import { MealDetailModal } from '../../src/components/meals/MealDetailModal';
import { MealSwapSheet } from '../../src/components/meals/MealSwapSheet';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLogStore } from '../../src/store/useLogStore';
import { DayPlan, MealItem, MealSlot } from '../../src/types/nutrition';
import { generateWeeklyPlan } from '../../src/services/mealService';
import { REGIONAL_METADATA } from '../../src/constants/regionalDiets';
import { Flame, RefreshCw, Info, Sparkles } from 'lucide-react-native';

const DAYS: DayPlan['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealsScreen() {
  const { profile, nutritionPlan } = useUserStore();
  const userId = useAuthStore((state) => state.userId);
  const { currentMealPlan, swapMealInPlan, setWeeklyMealPlan } = useLogStore();

  const [selectedDay, setSelectedDay] = useState<DayPlan['day']>('Monday');
  const [detailMeal, setDetailMeal] = useState<MealItem | null>(null);
  const [swappingMeal, setSwappingMeal] = useState<MealItem | null>(null);

  const regionInfo = profile ? REGIONAL_METADATA[profile.regionPreference] : null;

  // Active day plan
  const activeDayPlan = currentMealPlan?.days.find((d) => d.day === selectedDay) ?? currentMealPlan?.days[0];

  const handleRegenerate = async () => {
    if (!profile || !nutritionPlan) return;
    const newPlan = generateWeeklyPlan(
      profile.regionPreference,
      nutritionPlan.targetCalories,
      profile.dietaryPreference
    );
    await setWeeklyMealPlan(newPlan, userId || undefined);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Nutrition Plan</Text>
          <Text style={styles.subtitle}>
            {regionInfo ? `${regionInfo.icon} ${regionInfo.name}` : 'Curated Regional Plan'}
          </Text>
        </View>
        <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate} activeOpacity={0.7}>
          <RefreshCw size={14} color={Colors.primary} />
          <Text style={styles.regenText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Horizontal Day Selector Tabs */}
      <View style={styles.daySelectorWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {DAYS.map((day) => {
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayTab, isSelected && styles.dayTabActive]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayShortText, isSelected && styles.dayShortTextActive]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 3. Day Macro Summary Card */}
        {activeDayPlan && (
          <Card variant="cream" style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <Text style={styles.summaryDayTitle}>{selectedDay}'s Target</Text>
              <View style={styles.calorieRow}>
                <Flame size={16} color={Colors.accent} />
                <Text style={styles.calorieTotal}>{activeDayPlan.totalCalories}</Text>
                <Text style={styles.calorieUnit}>
                  / {nutritionPlan?.targetCalories || 2000} kcal
                </Text>
              </View>
            </View>

            <View style={styles.macroPillRow}>
              <View style={styles.macroStat}>
                <Text style={[styles.macroVal, { color: Colors.protein }]}>{activeDayPlan.totalProtein}g</Text>
                <Text style={styles.macroLbl}>Protein</Text>
              </View>
              <View style={styles.macroStat}>
                <Text style={[styles.macroVal, { color: Colors.carbs }]}>{activeDayPlan.totalCarbs}g</Text>
                <Text style={styles.macroLbl}>Carbs</Text>
              </View>
              <View style={styles.macroStat}>
                <Text style={[styles.macroVal, { color: Colors.fat }]}>{activeDayPlan.totalFat}g</Text>
                <Text style={styles.macroLbl}>Fat</Text>
              </View>
            </View>
          </Card>
        )}

        {/* 4. Honest Estimates Disclaimer Banner */}
        <View style={styles.disclaimerBanner}>
          <Info size={16} color={Colors.textSecondary} style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.disclaimerText}>
            Nutrition values are honest regional estimates. Tap any recipe to see exact ingredients, or tap Swap to substitute with an alternative that preserves your macros.
          </Text>
        </View>

        {/* 5. Four Meal Slots */}
        {activeDayPlan ? (
          <View style={styles.slotList}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => {
              const meal = activeDayPlan[slot];
              return (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onPressDetails={() => setDetailMeal(meal)}
                  onSwapPress={() => setSwappingMeal(meal)}
                />
              );
            })}
          </View>
        ) : (
          <Card variant="outlined">
            <Text style={styles.emptyText}>No meal plan found. Tap Reset to generate one.</Text>
          </Card>
        )}
      </ScrollView>

      {/* Modals */}
      <MealDetailModal
        visible={!!detailMeal}
        meal={detailMeal}
        onClose={() => setDetailMeal(null)}
        onSwapPress={() => {
          const m = detailMeal;
          setDetailMeal(null);
          setSwappingMeal(m);
        }}
      />

      <MealSwapSheet
        visible={!!swappingMeal}
        currentMeal={swappingMeal}
        onClose={() => setSwappingMeal(null)}
        onSelectSwap={(newMeal) => {
          if (swappingMeal) {
            swapMealInPlan(selectedDay, swappingMeal.slot, newMeal, userId || undefined);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  regenText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  daySelectorWrap: {
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingBottom: 10,
    marginBottom: 8,
  },
  dayScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  dayTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayShortText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  dayShortTextActive: {
    color: Colors.textOnPrimary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 6,
  },
  summaryCard: {
    marginBottom: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryDayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textOnCream,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  calorieTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  calorieUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  macroPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  macroStat: {
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  macroLbl: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF5EA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE3C8',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textOnCream,
    lineHeight: 16,
  },
  slotList: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
