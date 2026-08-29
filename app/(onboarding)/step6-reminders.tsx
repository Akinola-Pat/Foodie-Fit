import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { Button } from '../../src/components/common/Button';
import { useUserStore } from '../../src/store/useUserStore';
import { requestNotificationPermission, scheduleReminders } from '../../src/services/notificationService';
import { Bell, Dumbbell, Utensils, Scale } from 'lucide-react-native';

export default function Step6Reminders() {
  const router = useRouter();
  const { notificationPrefs, setNotificationPrefs } = useUserStore();

  const [workoutReminders, setWorkoutReminders] = useState(notificationPrefs.workoutReminders);
  const [mealReminders, setMealReminders] = useState(notificationPrefs.mealReminders);
  const [weighinReminders, setWeighinReminders] = useState(notificationPrefs.weighinReminders);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleFinishOnboarding = async () => {
    setIsRequesting(true);
    const updatedPrefs = {
      ...notificationPrefs,
      workoutReminders,
      mealReminders,
      weighinReminders,
    };
    setNotificationPrefs(updatedPrefs);

    // Request native permission only if user enabled at least one reminder
    if (workoutReminders || mealReminders || weighinReminders) {
      await requestNotificationPermission();
      await scheduleReminders(updatedPrefs);
    }

    setIsRequesting(false);
    router.push('/(onboarding)/plan-summary');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar currentStep={6} totalSteps={6} />
        <Text style={styles.stepCounter}>Step 6 of 6</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bellBadge}>
          <Bell size={28} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Stay on Track with Smart Reminders</Text>
        <Text style={styles.subtitle}>
          Consistency is 90% of the battle. We’ll send gentle nudges at key moments to keep your momentum strong.
        </Text>

        {/* Reminder Toggles */}
        <View style={styles.cardList}>
          <View style={styles.reminderCard}>
            <View style={styles.iconWrap}>
              <Dumbbell size={20} color={Colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.cardTitle}>Daily Workout Reminders</Text>
              <Text style={styles.cardSubtitle}>Nudge at 07:00 AM for today's routine</Text>
            </View>
            <Switch
              value={workoutReminders}
              onValueChange={setWorkoutReminders}
              trackColor={{ false: '#D1D5DB', true: Colors.primaryLight }}
              thumbColor={workoutReminders ? Colors.primary : '#F3F4F6'}
            />
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.iconWrap}>
              <Utensils size={20} color={Colors.accent} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.cardTitle}>Meal Prep & Fuel Alerts</Text>
              <Text style={styles.cardSubtitle}>Daily reminders for lunch & dinner prep</Text>
            </View>
            <Switch
              value={mealReminders}
              onValueChange={setMealReminders}
              trackColor={{ false: '#D1D5DB', true: Colors.accent }}
              thumbColor={mealReminders ? Colors.accent : '#F3F4F6'}
            />
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.iconWrap}>
              <Scale size={20} color={Colors.accentWarm} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.cardTitle}>Weekly Progress Weigh-In</Text>
              <Text style={styles.cardSubtitle}>Every Sunday morning at 08:00 AM</Text>
            </View>
            <Switch
              value={weighinReminders}
              onValueChange={setWeighinReminders}
              trackColor={{ false: '#D1D5DB', true: Colors.accentWarm }}
              thumbColor={weighinReminders ? Colors.accentWarm : '#F3F4F6'}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Generate My Custom Plan"
          variant="primary"
          size="large"
          loading={isRequesting}
          onPress={handleFinishOnboarding}
        />
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
    alignItems: 'center',
  },
  bellBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  cardList: {
    width: '100%',
    gap: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
});
