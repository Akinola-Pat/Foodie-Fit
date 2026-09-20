import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Flame, Beef, Wheat, Droplet } from 'lucide-react-native';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { SafetyNoticeBanner } from '../../src/components/common/SafetyNoticeBanner';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function PlanSummary() {
  const router = useRouter();
  const { profile, nutritionPlan } = useUserStore();
  const setOnboardingCompleted = useAuthStore((state) => state.setOnboardingCompleted);

  const handleGetStarted = () => {
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  if (!profile || !nutritionPlan) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          We could not find your plan. Please go back and complete onboarding.
        </Text>
        <Button title="Back to Start" onPress={() => router.replace('/(onboarding)/step1-basics')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <CheckCircle2 size={32} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Your Plan Is Ready</Text>
        <Text style={styles.subtitle}>
          Built from your goals and activity level. You can adjust this anytime in Settings.
        </Text>

        {nutritionPlan.safetyNotice && (
          <SafetyNoticeBanner notice={nutritionPlan.safetyNotice} />
        )}

        <Card variant="elevated" style={styles.calorieCard}>
          <Text style={styles.calorieLabel}>Daily Target</Text>
          <View style={styles.calorieRow}>
            <Flame size={22} color={Colors.accent} />
            <Text style={styles.calorieValue}>{nutritionPlan.targetCalories}</Text>
            <Text style={styles.calorieUnit}>kcal / day</Text>
          </View>
        </Card>

        <View style={styles.macroRow}>
          <Card variant="cream" style={styles.macroCard}>
            <Beef size={18} color={Colors.protein} />
            <Text style={styles.macroValue}>{nutritionPlan.proteinGrams}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </Card>
          <Card variant="cream" style={styles.macroCard}>
            <Wheat size={18} color={Colors.carbs} />
            <Text style={styles.macroValue}>{nutritionPlan.carbsGrams}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </Card>
          <Card variant="cream" style={styles.macroCard}>
            <Droplet size={18} color={Colors.fat} />
            <Text style={styles.macroValue}>{nutritionPlan.fatGrams}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </Card>
        </View>

        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={styles.summaryRow}>Goal: <Text style={styles.summaryValue}>{profile.goal.replace(/_/g, ' ')}</Text></Text>
          <Text style={styles.summaryRow}>Current weight: <Text style={styles.summaryValue}>{profile.currentWeightKg} kg</Text></Text>
          <Text style={styles.summaryRow}>Target weight: <Text style={styles.summaryValue}>{profile.targetWeightKg} kg</Text></Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Get Started" onPress={handleGetStarted} size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 12,
  },
  badge: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  calorieCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  calorieLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  calorieUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    marginTop: 8,
  },
  summaryRow: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
