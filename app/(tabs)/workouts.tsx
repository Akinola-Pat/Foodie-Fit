import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { ExerciseItem } from '../../src/components/workouts/ExerciseItem';
import { WorkoutPlayerModal } from '../../src/components/workouts/WorkoutPlayerModal';
import { useUserStore } from '../../src/store/useUserStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useLogStore } from '../../src/store/useLogStore';
import { generateWeeklyWorkoutSchedule } from '../../src/services/workoutService';
import { WorkoutRoutine } from '../../src/types/workout';
import { WORKOUT_ROUTINES, getWorkoutsByEquipment } from '../../src/constants/workoutPlans';
import { Dumbbell, Play, CheckCircle2, Flame, Clock, Calendar, Check } from 'lucide-react-native';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export default function WorkoutsScreen() {
  const { profile } = useUserStore();
  const userId = useAuthStore((state) => state.userId);
  const { workoutLogs, addWorkoutLog } = useLogStore();

  const [activePlayerWorkout, setActivePlayerWorkout] = useState<WorkoutRoutine | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);

  const equipment = profile?.equipmentAccess || ['bodyweight'];
  const goal = profile?.goal || 'lose_weight';
  const weeklySchedule = generateWeeklyWorkoutSchedule(equipment, goal);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // aligned to Mon-Sun
  const todayScheduleItem = weeklySchedule.find((w) => w.day === todayName) ?? weeklySchedule[0];

  // Default selected routine to today's scheduled routine or first matching
  const currentViewRoutine = selectedRoutine || todayScheduleItem.routine || weeklySchedule[0].routine;

  const handleWorkoutComplete = async (durationMinutes: number, caloriesBurned: number) => {
    if (activePlayerWorkout) {
      await addWorkoutLog(
        activePlayerWorkout.id,
        activePlayerWorkout.title,
        durationMinutes,
        caloriesBurned,
        userId || undefined
      );
    }
  };

  const isWorkoutCompleted = (routineId: string) => {
    return workoutLogs.some((l) => l.workoutId === routineId && l.completedAt.split('T')[0] === todayDateStr);
  };

  const userRoutines = getWorkoutsByEquipment(equipment);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Workout Split</Text>
        <Text style={styles.subtitle}>
          Tailored for {goal.replace(/_/g, ' ')} with {equipment.join(', ').replace(/_/g, ' ')}
        </Text>
      </View>

      {/* 2. 7-Day Weekly Consistency Schedule */}
      <Card variant="cream" style={styles.scheduleCard}>
        <View style={styles.scheduleHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color={Colors.textOnCream} />
            <Text style={styles.scheduleTitle}>7-Day Training Schedule</Text>
          </View>
          <Text style={styles.scheduleSummary}>
            {workoutLogs.length} completed
          </Text>
        </View>

        <View style={styles.scheduleRow}>
          {weeklySchedule.map((item) => {
            const isToday = item.day === todayName;
            const isCompleted = item.routine ? isWorkoutCompleted(item.routine.id) : false;

            return (
              <TouchableOpacity
                key={item.day}
                style={[
                  styles.dayBadge,
                  isToday && styles.dayBadgeToday,
                  currentViewRoutine?.id === item.routine?.id && styles.dayBadgeSelected,
                ]}
                onPress={() => item.routine && setSelectedRoutine(item.routine)}
                activeOpacity={item.routine ? 0.7 : 1}
              >
                <Text style={[styles.dayBadgeText, isToday && styles.dayBadgeTextToday]}>
                  {item.day.slice(0, 3)}
                </Text>
                <View style={styles.indicatorWrap}>
                  {isCompleted ? (
                    <Check size={12} color="#15803D" />
                  ) : item.isRestDay ? (
                    <Text style={{ fontSize: 9 }}>🛋️</Text>
                  ) : (
                    <View style={[styles.dot, isToday && styles.dotToday]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* 3. Featured Active Routine Details */}
      {currentViewRoutine ? (
        <Card variant="elevated" style={styles.featuredCard}>
          <View style={styles.routineTopRow}>
            <View style={styles.categoryBadge}>
              <Dumbbell size={14} color={Colors.primary} />
              <Text style={styles.categoryText}>{currentViewRoutine.category.toUpperCase()}</Text>
            </View>
            {isWorkoutCompleted(currentViewRoutine.id) && (
              <View style={styles.completedBadge}>
                <CheckCircle2 size={14} color="#15803D" />
                <Text style={styles.completedText}>Completed Today</Text>
              </View>
            )}
          </View>

          <Text style={styles.routineTitle}>{currentViewRoutine.title}</Text>
          <Text style={styles.routineDesc}>{currentViewRoutine.description}</Text>

          {/* Quick Metrics */}
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Clock size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{currentViewRoutine.durationMinutes} mins</Text>
            </View>
            <View style={styles.metaPill}>
              <Flame size={13} color={Colors.accent} />
              <Text style={styles.metaText}>~{currentViewRoutine.estimatedCaloriesBurned} kcal</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>
                {currentViewRoutine.difficulty.charAt(0).toUpperCase() + currentViewRoutine.difficulty.slice(1)}
              </Text>
            </View>
          </View>

          {/* Start Workout Button */}
          <Button
            title={isWorkoutCompleted(currentViewRoutine.id) ? 'Repeat Session' : 'Start Workout'}
            variant="primary"
            size="large"
            icon={<Play size={18} color={Colors.textOnPrimary} />}
            onPress={() => setActivePlayerWorkout(currentViewRoutine)}
            style={{ marginVertical: 14 }}
          />

          {/* Exercise List */}
          <Text style={styles.exerciseSectionTitle}>
            Exercises ({currentViewRoutine.exercises.length})
          </Text>
          <View style={styles.exerciseList}>
            {currentViewRoutine.exercises.map((ex, idx) => (
              <ExerciseItem key={ex.id} exercise={ex} index={idx} />
            ))}
          </View>
        </Card>
      ) : (
        <Card variant="outlined">
          <Text style={styles.emptyText}>Rest and recovery day. No workout scheduled.</Text>
        </Card>
      )}

      {/* 4. Alternate Routines in your Program */}
      <Text style={styles.allRoutinesTitle}>All Routines in Your Split</Text>
      <View style={styles.alternateList}>
        {userRoutines.map((routine) => {
          const isSelected = routine.id === currentViewRoutine?.id;
          return (
            <TouchableOpacity
              key={routine.id}
              style={[styles.alternateCard, isSelected && styles.alternateCardSelected]}
              onPress={() => setSelectedRoutine(routine)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.altTitle}>{routine.title}</Text>
                <Text style={styles.altMeta}>
                  ⏱️ {routine.durationMinutes}m • 🔥 {routine.estimatedCaloriesBurned} kcal • {routine.exercises.length} moves
                </Text>
              </View>
              <Button
                title="View"
                variant={isSelected ? 'primary' : 'outline'}
                size="small"
                onPress={() => setSelectedRoutine(routine)}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Workout Player Modal */}
      <WorkoutPlayerModal
        visible={!!activePlayerWorkout}
        workout={activePlayerWorkout}
        onClose={() => setActivePlayerWorkout(null)}
        onComplete={handleWorkoutComplete}
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
    marginBottom: 16,
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
    textTransform: 'capitalize',
  },
  scheduleCard: {
    marginBottom: 16,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textOnCream,
  },
  scheduleSummary: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBadge: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minWidth: 40,
  },
  dayBadgeToday: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  dayBadgeSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayBadgeTextToday: {
    color: Colors.primary,
  },
  indicatorWrap: {
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  dotToday: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  featuredCard: {
    marginBottom: 24,
  },
  routineTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  routineTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  routineDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  exerciseSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  exerciseList: {
    gap: 4,
  },
  allRoutinesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  alternateList: {
    gap: 10,
  },
  alternateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  alternateCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFDF9',
  },
  altTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  altMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
