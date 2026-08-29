import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/useUserStore';
import { DietaryPreference } from '../../src/types/nutrition';

const DIETS: { id: DietaryPreference; title: string; subtitle: string; icon: string }[] = [
  { id: 'omnivore', title: 'Omnivore', subtitle: 'Poultry, meat, seafood, dairy, grains & plants', icon: '🥩' },
  { id: 'pescatarian', title: 'Pescatarian', subtitle: 'Seafood, eggs, dairy, grains & plants (no red meat/poultry)', icon: '🐟' },
  { id: 'vegetarian', title: 'Vegetarian', subtitle: 'Plant-based with dairy and eggs', icon: '🥚' },
  { id: 'vegan', title: '100% Plant-Based / Vegan', subtitle: 'Exclusively plants, legumes, nuts, seeds & grains', icon: '🌱' },
  { id: 'halal', title: 'Halal', subtitle: '100% Halal-certified meats and ingredients', icon: '🌙' },
  { id: 'kosher', title: 'Kosher', subtitle: 'Kosher-certified compliant meal preparations', icon: '✡️' },
];

export default function Step4Diet() {
  const router = useRouter();
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);
  const [selectedDiet, setSelectedDiet] = useState<DietaryPreference>('omnivore');

  const handleNext = () => {
    updateProfilePartial({ dietaryPreference: selectedDiet });
    router.push('/(onboarding)/step5-region-equip');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar currentStep={4} totalSteps={6} />
        <Text style={styles.stepCounter}>Step 4 of 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Dietary Preferences</Text>
        <Text style={styles.subtitle}>
          We filter recipes to guarantee alignment with your dietary rules and lifestyle.
        </Text>

        <View style={styles.grid}>
          {DIETS.map((d) => {
            const isSelected = selectedDiet === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.dietCard, isSelected && styles.dietCardActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedDiet(d.id)}
              >
                <Text style={styles.dietIcon}>{d.icon}</Text>
                <View style={styles.textWrap}>
                  <Text style={[styles.dietTitle, isSelected && styles.dietTitleActive]}>{d.title}</Text>
                  <Text style={styles.dietSubtitle}>{d.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  grid: {
    gap: 10,
  },
  dietCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
  },
  dietCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  dietIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  dietTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  dietTitleActive: {
    color: Colors.primary,
  },
  dietSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
});
