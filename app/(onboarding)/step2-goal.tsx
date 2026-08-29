import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/useUserStore';
import { FitnessGoal } from '../../src/services/nutritionEngine';
import { Flame, Dumbbell, Sparkles } from 'lucide-react-native';

const GOALS: { id: FitnessGoal; title: string; subtitle: string; icon: any }[] = [
  {
    id: 'lose_weight',
    title: 'Fat Loss & Definition',
    subtitle: 'Healthy -500 kcal deficit targeting gradual fat loss while preserving lean muscle.',
    icon: Flame,
  },
  {
    id: 'build_muscle',
    title: 'Muscle Hypertrophy & Strength',
    subtitle: 'Clean +300 kcal surplus to fuel progressive overload and lean mass growth.',
    icon: Dumbbell,
  },
  {
    id: 'maintain',
    title: 'Maintain & Energize',
    subtitle: 'Balanced baseline calories for sustaining current weight and peak athletic energy.',
    icon: Sparkles,
  },
];

export default function Step2Goal() {
  const router = useRouter();
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>('lose_weight');

  const handleNext = () => {
    updateProfilePartial({ goal: selectedGoal });
    router.push('/(onboarding)/step3-activity');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar currentStep={2} totalSteps={6} />
        <Text style={styles.stepCounter}>Step 2 of 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What is your primary goal?</Text>
        <Text style={styles.subtitle}>
          This defines your targeted caloric pacing and protein distribution.
        </Text>

        {GOALS.map((g) => {
          const Icon = g.icon;
          const isSelected = selectedGoal === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalCard, isSelected && styles.goalCardActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedGoal(g.id)}
            >
              <View style={[styles.iconWrap, isSelected && styles.iconWrapActive]}>
                <Icon size={24} color={isSelected ? Colors.primary : Colors.textSecondary} />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.goalTitle, isSelected && styles.goalTitleActive]}>{g.title}</Text>
                <Text style={styles.goalSubtitle}>{g.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" variant="primary" size="large" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
  },
  goalCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconWrapActive: {
    backgroundColor: '#DCFCE7',
  },
  textWrap: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalTitleActive: {
    color: Colors.primary,
  },
  goalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
});
