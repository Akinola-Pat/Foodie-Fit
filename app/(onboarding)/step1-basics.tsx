import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/useUserStore';
import { Gender } from '../../src/services/nutritionEngine';

export default function Step1Basics() {
  const router = useRouter();
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);

  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState('28');
  const [heightCm, setHeightCm] = useState('165');
  const [currentWeightKg, setCurrentWeightKg] = useState('65');
  const [targetWeightKg, setTargetWeightKg] = useState('60');

  const handleNext = () => {
    updateProfilePartial({
      gender,
      age: parseInt(age, 10) || 28,
      heightCm: parseFloat(heightCm) || 165,
      currentWeightKg: parseFloat(currentWeightKg) || 65,
      targetWeightKg: parseFloat(targetWeightKg) || 60,
    });
    router.push('/(onboarding)/step2-goal');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <ProgressBar currentStep={1} totalSteps={6} />
        <Text style={styles.stepCounter}>Step 1 of 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Let's build your baseline</Text>
        <Text style={styles.subtitle}>
          We use the Mifflin-St Jeor equation to calculate your exact Basal Metabolic Rate and caloric needs.
        </Text>

        {/* Gender Selector */}
        <Text style={styles.label}>Biological Sex (for metabolic formula)</Text>
        <View style={styles.genderRow}>
          {(['female', 'male', 'other'] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                {g === 'female' ? '👩 Female' : g === 'male' ? '👨 Male' : '✨ Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Inputs */}
        <View style={styles.inputGrid}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={currentWeightKg}
              onChangeText={setCurrentWeightKg}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Target Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={targetWeightKg}
              onChangeText={setTargetWeightKg}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" variant="primary" size="large" onPress={handleNext} />
      </View>
    </KeyboardAvoidingView>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputBox: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
});
