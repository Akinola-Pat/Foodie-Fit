import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { GuestBanner } from '../../src/components/common/GuestBanner';
import { DeleteAccountModal } from '../../src/components/common/DeleteAccountModal';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLogStore } from '../../src/store/useLogStore';
import { scheduleReminders } from '../../src/services/notificationService';
import { User, Target, Flame, Dumbbell, Utensils, Scale, RotateCcw, Trash2, ChevronRight, Globe, Activity } from 'lucide-react-native';
import { REGIONAL_METADATA } from '../../src/constants/regionalDiets';

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  maintain: 'Maintain Weight',
  build_muscle: 'Build Muscle',
  improve_fitness: 'Improve Fitness',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, nutritionPlan, notificationPrefs, setNotificationPrefs, reset: resetUserStore } = useUserStore();
  const { isGuest, userId, reset: resetAuthStore } = useAuthStore();
  const { reset: resetLogStore } = useLogStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const regionInfo = profile ? REGIONAL_METADATA[profile.regionPreference] : null;

  const handleToggleReminder = async (key: 'workoutReminders' | 'mealReminders' | 'weighinReminders') => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(updated);
    await scheduleReminders(updated);
  };

  const handleResetPlan = () => {
    Alert.alert('Reset Your Plan', 'This will clear all saved data and return you to onboarding.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset Everything',
        style: 'destructive',
        onPress: () => {
          resetUserStore();
          resetLogStore();
          resetAuthStore();
          router.replace('/(onboarding)/step1-basics');
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    resetUserStore();
    resetLogStore();
    resetAuthStore();
    router.replace('/(onboarding)/step1-basics');
  };

  if (!profile || !nutritionPlan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Profile Yet</Text>
        <Text style={styles.emptySubtitle}>Complete onboarding to see your profile.</Text>
        <Button title="Start Onboarding" variant="primary" size="large" onPress={() => router.replace('/(onboarding)/step1-basics')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Your plan and preferences</Text>
      </View>

      {isGuest && <GuestBanner onPressSaveAccount={() => router.push('/(onboarding)/plan-summary')} />}

      <Card variant="elevated" style={styles.identityCard}>
        <View style={styles.avatarWrap}>
          <User size={28} color={Colors.primary} />
        </View>
        <View style={styles.identityText}>
          <Text style={styles.userName}>{profile.fullName || 'Foodie Fit User'}</Text>
          <Text style={styles.userEmail}>{isGuest ? 'Guest Mode — data stored locally' : (profile.email || userId || '')}</Text>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Calorie and Macro Targets</Text>
      <Card variant="cream" style={styles.nutritionCard}>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Flame size={16} color={Colors.accent} />
            <Text style={styles.nutritionValue}>{nutritionPlan.targetCalories}</Text>
            <Text style={styles.nutritionLabel}>kcal/day</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: Colors.protein }]}>{nutritionPlan.proteinGrams}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: Colors.carbs }]}>{nutritionPlan.carbsGrams}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: Colors.fat }]}>{nutritionPlan.fatGrams}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Profile Details</Text>
      <Card variant="outlined" style={styles.detailsCard}>
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Target size={16} color={Colors.primary} />
            <Text style={styles.profileRowLabel}>Goal</Text>
          </View>
          <Text style={styles.profileRowValue}>{GOAL_LABELS[profile.goal] || profile.goal}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Activity size={16} color={Colors.primary} />
            <Text style={styles.profileRowLabel}>Activity Level</Text>
          </View>
          <Text style={styles.profileRowValue}>{ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Globe size={16} color={Colors.primary} />
            <Text style={styles.profileRowLabel}>Region</Text>
          </View>
          <Text style={styles.profileRowValue}>{regionInfo ? (regionInfo.icon + ' ' + regionInfo.name) : profile.regionPreference}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Utensils size={16} color={Colors.primary} />
            <Text style={styles.profileRowLabel}>Diet</Text>
          </View>
          <Text style={styles.profileRowValue}>{profile.dietaryPreference.charAt(0).toUpperCase() + profile.dietaryPreference.slice(1)}</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Scale size={16} color={Colors.primary} />
            <Text style={styles.profileRowLabel}>Current Weight</Text>
          </View>
          <Text style={styles.profileRowValue}>{profile.currentWeightKg} kg</Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.profileRow}>
          <View style={styles.profileRowLeft}>
            <Target size={16} color={Colors.primary} />
            <Text style={styles.profileRowLabel}>Target Weight</Text>
          </View>
          <Text style={styles.profileRowValue}>{profile.targetWeightKg} kg</Text>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Reminder Notifications</Text>
      <Card variant="outlined" style={styles.detailsCard}>
        <View style={styles.reminderRow}>
          <View style={styles.reminderIconWrap}>
            <Dumbbell size={16} color={Colors.primary} />
          </View>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Daily Workout Reminder</Text>
            <Text style={styles.reminderSublabel}>07:00 AM every day</Text>
          </View>
          <Switch value={notificationPrefs.workoutReminders} onValueChange={() => handleToggleReminder('workoutReminders')} trackColor={{ false: '#D1D5DB', true: Colors.primaryLight }} thumbColor={notificationPrefs.workoutReminders ? Colors.primary : '#F3F4F6'} />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.reminderRow}>
          <View style={styles.reminderIconWrap}>
            <Utensils size={16} color={Colors.accent} />
          </View>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Meal Prep Alerts</Text>
            <Text style={styles.reminderSublabel}>Lunch 12:30 and Dinner 18:30</Text>
          </View>
          <Switch value={notificationPrefs.mealReminders} onValueChange={() => handleToggleReminder('mealReminders')} trackColor={{ false: '#D1D5DB', true: Colors.accent }} thumbColor={notificationPrefs.mealReminders ? Colors.accent : '#F3F4F6'} />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.reminderRow}>
          <View style={styles.reminderIconWrap}>
            <Scale size={16} color={Colors.accentWarm} />
          </View>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Weekly Weigh-In</Text>
            <Text style={styles.reminderSublabel}>Every Sunday at 08:00 AM</Text>
          </View>
          <Switch value={notificationPrefs.weighinReminders} onValueChange={() => handleToggleReminder('weighinReminders')} trackColor={{ false: '#D1D5DB', true: Colors.accentWarm }} thumbColor={notificationPrefs.weighinReminders ? Colors.accentWarm : '#F3F4F6'} />
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Account</Text>
      <Card variant="outlined" style={styles.detailsCard}>
        <TouchableOpacity style={styles.actionRow} onPress={handleResetPlan} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: '#FFF5EB' }]}>
            <RotateCcw size={16} color={Colors.accent} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Reset My Plan</Text>
            <Text style={styles.actionSubtitle}>Start onboarding over with a new profile</Text>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.rowDivider} />
        <TouchableOpacity style={styles.actionRow} onPress={() => setDeleteModalVisible(true)} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
            <Trash2 size={16} color={Colors.error} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={[styles.actionTitle, { color: Colors.error }]}>Delete Account</Text>
            <Text style={styles.actionSubtitle}>Permanently erase all data</Text>
          </View>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <Text style={styles.versionText}>Foodie Fit v1.0.0 - Regional Nutrition and Training</Text>

      <DeleteAccountModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)} onConfirmDelete={handleDeleteAccount} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  identityCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 },
  avatarWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  identityText: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  nutritionCard: { marginBottom: 20 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nutritionItem: { alignItems: 'center', gap: 3 },
  nutritionValue: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  nutritionLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600' },
  detailsCard: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 16 },
  profileRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileRowLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  profileRowValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  rowDivider: { height: 1, backgroundColor: Colors.surfaceBorder, marginHorizontal: 16 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  reminderIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  reminderTextWrap: { flex: 1 },
  reminderLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  reminderSublabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionTextWrap: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  actionSubtitle: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  versionText: { textAlign: 'center', fontSize: 11, color: Colors.textMuted, marginTop: 8, marginBottom: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.background },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
});
