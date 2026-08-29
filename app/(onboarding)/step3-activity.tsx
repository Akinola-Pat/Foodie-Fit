import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/useUserStore';
import { ActivityLevel } from '../../src/services/nutritionEngine';

const ACTIVITIES: { id: ActivityLevel; title: string; subtitle: string; multiplier: string }[] = [
  {
    id: 'sedentary',
    title: 'Sedentary (Desk Job)',
    subtitle: 'Little to no structured exercise. Mostly sitting during daily routines.',
    multiplier: '1.2× BMR',
  },
  {
    id: 'light',
    title: 'Lightly Active',
    subtitle: 'Light workouts or recreational walks 1 to 3 days per week.',
    multiplier: '1.375× BMR',
  },
  {
    id: 'moderate',
    title: 'Moderately Active',
    subtitle: 'Moderate gym sessions, running, or sports 3 to 5 days per week.',
    multiplier: '1.55× BMR',
  },
  {
    id: 'very_active',
    title: 'Very Active / Athlete',
    subtitle: 'Intense training, heavy lifting, or physical job 6 to 7 days per week.',
    multiplier: '1.725× BMR',
  },
];

export default function Step3Activity() {
  const router = useRouter();
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>('moderate');

  const handleNext = () => {
    updateProfilePartial({ activityLevel: selectedActivity });
    router.push('/(onboarding)/step4-diet');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar currentStep={3} totalSteps={6} />
        <Text style={styles.stepCounter}>Step 3 of 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What is your activity level?</Text>
        <Text style={styles.subtitle}>
          This determines your Total Daily Energy Expenditure (TDEE).
        </Text>

        {ACTIVITIES.map((act) => {
          const isSelected = selectedActivity === act.id;
          return (
            <TouchableOpacity
              key={act.id}
              style={[styles.card, isSelected && styles.cardActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedActivity(act.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleActive]}>{act.title}</Text>
                <View style={styles.multBadge}>
                  <Text style={styles.multText}>{act.multiplier}</Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>{act.subtitle}</Text>
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
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  cardTitleActive: {
    color: Colors.primary,
  },
  multBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  multText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textOnCream,
  },
  cardSubtitle: {
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
