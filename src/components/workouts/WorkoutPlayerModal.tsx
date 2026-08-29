import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { WorkoutRoutine } from '../../types/workout';
import { X, Play, Pause, CheckCircle2, ChevronRight, ChevronLeft, Flame, Timer } from 'lucide-react-native';
import { Button } from '../common/Button';

interface Props {
  visible: boolean;
  workout: WorkoutRoutine | null;
  onClose: () => void;
  onComplete: (durationMinutes: number, caloriesBurned: number) => void;
}

export const WorkoutPlayerModal: React.FC<Props> = ({ visible, workout, onClose, onComplete }) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (visible && isActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [visible, isActive]);

  useEffect(() => {
    if (visible) {
      setCurrentExerciseIdx(0);
      setSecondsElapsed(0);
      setIsActive(true);
    }
  }, [visible]);

  if (!workout) return null;

  const currentEx = workout.exercises[currentExerciseIdx];
  const isLastExercise = currentExerciseIdx === workout.exercises.length - 1;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    const duration = Math.max(1, Math.round(secondsElapsed / 60));
    onComplete(duration, workout.estimatedCaloriesBurned);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.timerBadge}>
            <Timer size={16} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.timerText}>{formatTime(secondsElapsed)}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsActive(!isActive)} style={styles.playPauseBtn}>
            {isActive ? <Pause size={18} color={Colors.textOnCream} /> : <Play size={18} color={Colors.textOnCream} />}
          </TouchableOpacity>
        </View>

        {/* Workout Subheader */}
        <View style={styles.titleWrap}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.progressCounter}>
            Exercise {currentExerciseIdx + 1} of {workout.exercises.length}
          </Text>
        </View>

        {/* Active Exercise Card */}
        <View style={styles.activeCard}>
          <View style={styles.badgeRow}>
            <View style={styles.targetBadge}>
              <Text style={styles.targetText}>{currentEx.targetMuscle}</Text>
            </View>
            <View style={styles.setsBadge}>
              <Text style={styles.setsText}>{currentEx.sets} Sets × {currentEx.repsOrDuration}</Text>
            </View>
          </View>

          <Text style={styles.exName}>{currentEx.name}</Text>
          <ScrollView style={styles.instScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.instHeader}>Form & Cues:</Text>
            <Text style={styles.instText}>{currentEx.instructions}</Text>
            <Text style={styles.restText}>Rest between sets: {currentEx.restSeconds}s</Text>
          </ScrollView>
        </View>

        {/* Stepper Controls */}
        <View style={styles.footer}>
          <View style={styles.navRow}>
            <Button
              title="Previous"
              variant="outline"
              size="medium"
              disabled={currentExerciseIdx === 0}
              onPress={() => setCurrentExerciseIdx((prev) => Math.max(0, prev - 1))}
              style={{ flex: 1, marginRight: 10 }}
              icon={<ChevronLeft size={18} color={currentExerciseIdx === 0 ? '#9CA3AF' : Colors.primary} />}
            />
            {isLastExercise ? (
              <Button
                title="Complete Workout"
                variant="primary"
                size="medium"
                onPress={handleFinish}
                style={{ flex: 1.4 }}
                icon={<CheckCircle2 size={18} color={Colors.textOnPrimary} />}
              />
            ) : (
              <Button
                title="Next Exercise"
                variant="primary"
                size="medium"
                onPress={() => setCurrentExerciseIdx((prev) => Math.min(workout.exercises.length - 1, prev + 1))}
                style={{ flex: 1.4 }}
                icon={<ChevronRight size={18} color={Colors.textOnPrimary} />}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: {
    padding: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnCream,
  },
  playPauseBtn: {
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  titleWrap: {
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressCounter: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeCard: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  targetBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  targetText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  setsBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  setsText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  exName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  instScroll: {
    flex: 1,
  },
  instHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  instText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  restText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  footer: {
    paddingBottom: 30,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
