import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/useUserStore';
import { RegionCode } from '../../src/types/nutrition';
import { EquipmentType } from '../../src/types/workout';
import { REGIONAL_METADATA } from '../../src/constants/regionalDiets';
import { Check } from 'lucide-react-native';

const EQUIPMENT_OPTIONS: { id: EquipmentType; title: string; icon: string }[] = [
  { id: 'bodyweight', title: 'Bodyweight (No Equipment)', icon: '🤸' },
  { id: 'dumbbells', title: 'Dumbbells', icon: '🏋️' },
  { id: 'resistance_bands', title: 'Resistance Bands', icon: '🎗️' },
  { id: 'full_gym', title: 'Full Gym Access', icon: '🏢' },
];

export default function Step5RegionAndEquipment() {
  const router = useRouter();
  const { setRegionPreference, setEquipmentAccess } = useUserStore();

  const [selectedRegion, setSelectedRegion] = useState<RegionCode>('north_america_western');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(['bodyweight']);

  const toggleEquipment = (eq: EquipmentType) => {
    if (eq === 'bodyweight') {
      setSelectedEquipment(['bodyweight']);
      return;
    }
    const filtered = selectedEquipment.filter((item) => item !== 'bodyweight');
    if (filtered.includes(eq)) {
      const next = filtered.filter((item) => item !== eq);
      setSelectedEquipment(next.length === 0 ? ['bodyweight'] : next);
    } else {
      setSelectedEquipment([...filtered, eq]);
    }
  };

  const handleNext = () => {
    setRegionPreference(selectedRegion, true);
    setEquipmentAccess(selectedEquipment, true);
    router.push('/(onboarding)/step6-reminders');
  };

  const handleSkipEquipment = () => {
    setRegionPreference(selectedRegion, true);
    setEquipmentAccess(['bodyweight'], true);
    router.push('/(onboarding)/step6-reminders');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar currentStep={5} totalSteps={6} />
        <Text style={styles.stepCounter}>Step 5 of 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Regional Cuisine */}
        <Text style={styles.title}>Cuisine & Equipment</Text>
        <Text style={styles.sectionHeader}>1. Choose Your Preferred Cuisine Palette</Text>
        <Text style={styles.subtitle}>
          Your weekly meal plan will feature authentic staple ingredients from your selected culture.
        </Text>

        <View style={styles.regionList}>
          {(Object.keys(REGIONAL_METADATA) as RegionCode[]).map((r) => {
            const meta = REGIONAL_METADATA[r];
            const isSelected = selectedRegion === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.regionCard, isSelected && styles.regionCardActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedRegion(r)}
              >
                <Text style={styles.regionIcon}>{meta.icon}</Text>
                <View style={styles.textWrap}>
                  <Text style={[styles.regionTitle, isSelected && styles.regionTitleActive]}>{meta.name}</Text>
                  <Text style={styles.regionSubtitle}>{meta.subtitle}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 2: Workout Equipment (Skippable) */}
        <View style={styles.equipHeaderRow}>
          <Text style={styles.sectionHeader}>2. Available Equipment</Text>
          <TouchableOpacity onPress={handleSkipEquipment} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Select whatever you have access to. You can customize this in Settings anytime.
        </Text>

        <View style={styles.equipGrid}>
          {EQUIPMENT_OPTIONS.map((eq) => {
            const isSelected = selectedEquipment.includes(eq.id);
            return (
              <TouchableOpacity
                key={eq.id}
                style={[styles.equipCard, isSelected && styles.equipCardActive]}
                activeOpacity={0.8}
                onPress={() => toggleEquipment(eq.id)}
              >
                <Text style={styles.equipIcon}>{eq.icon}</Text>
                <Text style={[styles.equipText, isSelected && styles.equipTextActive]}>{eq.title}</Text>
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
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  regionList: {
    gap: 10,
    marginBottom: 26,
  },
  regionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
  },
  regionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  regionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  regionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  regionTitleActive: {
    color: Colors.primary,
  },
  regionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  equipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  equipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipCard: {
    width: '48%',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  equipCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  equipIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  equipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  equipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
});
