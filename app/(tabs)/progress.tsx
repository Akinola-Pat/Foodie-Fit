import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { WeightTrendChart } from '../../src/components/charts/WeightTrendChart';
import { WeightLogModal } from '../../src/components/common/WeightLogModal';
import { DailyCheckInModal } from '../../src/components/common/DailyCheckInModal';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLogStore } from '../../src/store/useLogStore';
import { Scale, Plus, Dumbbell, Sparkles, TrendingDown, TrendingUp, Calendar } from 'lucide-react-native';

export default function ProgressScreen() {
  const { profile } = useUserStore();
  const userId = useAuthStore((state) => state.userId);
  const {
    weightLogs,
    workoutLogs,
    journalEntries,
    todayJournalEntry,
    addWeightLog,
    addJournalEntry,
  } = useLogStore();

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);

  // Compute weight milestones
  const startingWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : profile?.currentWeightKg || 70;
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : profile?.currentWeightKg || 70;
  const targetWeight = profile?.targetWeightKg || 68;

  const totalDelta = Math.round((currentWeight - startingWeight) * 10) / 10;
  const remainingDelta = Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10;
  const isLossGoal = profile?.goal === 'lose_weight';

  // Weekly consistency count (workouts in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const workoutsThisWeek = workoutLogs.filter((w) => w.completedAt >= sevenDaysAgo).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Progress & Consistency</Text>
          <Text style={styles.subtitle}>Where you started → where you are → your goal</Text>
        </View>
        <Button
          title="Log Wt"
          variant="primary"
          size="small"
          icon={<Plus size={14} color={Colors.textOnPrimary} />}
          onPress={() => setWeightModalVisible(true)}
        />
      </View>

      {/* 2. Three-Point Milestone Journey Card */}
      <Card variant="elevated" style={styles.milestoneCard}>
        <View style={styles.milestoneRow}>
          <View style={styles.milestoneCol}>
            <Text style={styles.milestoneLabel}>Started</Text>
            <Text style={styles.milestoneValue}>{startingWeight}</Text>
            <Text style={styles.milestoneUnit}>kg</Text>
          </View>

          <View style={styles.arrowCol}>
            {totalDelta < 0 ? (
              <TrendingDown size={20} color={isLossGoal ? '#15803D' : Colors.accent} />
            ) : totalDelta > 0 ? (
              <TrendingUp size={20} color={!isLossGoal ? '#15803D' : Colors.accent} />
            ) : (
              <Text style={{ fontSize: 16 }}>➡️</Text>
            )}
            <Text style={[styles.deltaText, totalDelta < 0 && isLossGoal && { color: '#15803D' }]}>
              {totalDelta > 0 ? `+${totalDelta}` : `${totalDelta}`} kg
            </Text>
          </View>

          <View style={[styles.milestoneCol, styles.milestoneCurrent]}>
            <Text style={[styles.milestoneLabel, { color: Colors.primary }]}>Current</Text>
            <Text style={[styles.milestoneValue, { color: Colors.primary }]}>{currentWeight}</Text>
            <Text style={styles.milestoneUnit}>kg</Text>
          </View>

          <View style={styles.arrowCol}>
            <Text style={{ fontSize: 16 }}>🎯</Text>
            <Text style={styles.deltaText}>{remainingDelta} kg to go</Text>
          </View>

          <View style={styles.milestoneCol}>
            <Text style={styles.milestoneLabel}>Target</Text>
            <Text style={styles.milestoneValue}>{targetWeight}</Text>
            <Text style={styles.milestoneUnit}>kg</Text>
          </View>
        </View>
      </Card>

      {/* 3. Consistency Badges */}
      <View style={styles.consistencyRow}>
        <Card variant="cream" style={styles.consistencyCard}>
          <View style={styles.consistIcon}>
            <Dumbbell size={16} color={Colors.primary} />
          </View>
          <Text style={styles.consistNum}>{workoutsThisWeek} sessions</Text>
          <Text style={styles.consistLbl}>Completed this week</Text>
        </Card>

        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setCheckInModalVisible(true)}
          activeOpacity={0.8}
        >
          <Card variant="cream" style={styles.consistencyCard}>
            <View style={styles.consistIcon}>
              <Sparkles size={16} color={Colors.accentWarm} />
            </View>
            <Text style={styles.consistNum}>{journalEntries.length} check-ins</Text>
            <Text style={styles.consistLbl}>
              {todayJournalEntry ? 'Done today ✓' : 'Tap to reflect today'}
            </Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* 4. Weight Trend Chart */}
      <Text style={styles.sectionTitle}>Weight Trend</Text>
      <Card variant="outlined" style={styles.chartCard}>
        <WeightTrendChart logs={weightLogs} targetWeightKg={targetWeight} />
      </Card>

      {/* 5. Recent Weight Entries List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Weigh-Ins</Text>
        <TouchableOpacity onPress={() => setWeightModalVisible(true)}>
          <Text style={styles.sectionActionText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyList}>
        {weightLogs.length > 0 ? (
          [...weightLogs]
            .reverse()
            .slice(0, 5)
            .map((entry) => (
              <View key={entry.id} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Scale size={16} color={Colors.primary} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={styles.historyWeight}>{entry.weightKg} kg</Text>
                    {entry.notes && <Text style={styles.historyNotes}>{entry.notes}</Text>}
                  </View>
                </View>
                <Text style={styles.historyDate}>
                  {new Date(entry.loggedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            ))
        ) : (
          <Card variant="outlined">
            <Text style={styles.emptyText}>No weigh-in records yet. Log your weight to see your progress curve.</Text>
          </Card>
        )}
      </View>

      {/* 6. Recent Daily Reflections */}
      {journalEntries.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Reflections</Text>
          <View style={styles.historyList}>
            {journalEntries.slice(0, 3).map((entry) => (
              <View key={entry.id} style={styles.reflectionRow}>
                <View style={styles.reflectionHeader}>
                  <Text style={styles.reflectionDate}>
                    {new Date(entry.entryDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={styles.reflectionTags}>
                    <Text style={styles.tagPill}>Energy: {entry.energyLevel}</Text>
                    <Text style={styles.tagPill}>Habits: {entry.adherenceScore.replace('_', ' ')}</Text>
                  </View>
                </View>
                {entry.notes && <Text style={styles.reflectionNoteText}>"{entry.notes}"</Text>}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Modals */}
      <WeightLogModal
        visible={weightModalVisible}
        onClose={() => setWeightModalVisible(false)}
        onSave={async (w, notes) => addWeightLog(w, notes, userId || undefined)}
        defaultWeightKg={currentWeight}
      />

      <DailyCheckInModal
        visible={checkInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        onSave={(data) => addJournalEntry(data, userId || undefined)}
        existingEntry={todayJournalEntry}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  milestoneCard: {
    marginBottom: 14,
    paddingVertical: 18,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneCol: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneCurrent: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  milestoneValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  milestoneUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  arrowCol: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  consistencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  consistencyCard: {
    flex: 1,
    padding: 12,
  },
  consistIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  consistNum: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  consistLbl: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  chartCard: {
    marginBottom: 14,
    padding: 10,
    alignItems: 'center',
  },
  historyList: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyWeight: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyNotes: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  reflectionRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reflectionDate: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reflectionTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPill: {
    fontSize: 10,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  reflectionNoteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
