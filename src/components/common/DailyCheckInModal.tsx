import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Button } from './Button';
import { X, Sparkles, Check, Battery, Flame, Dumbbell } from 'lucide-react-native';
import { EnergyLevel, AdherenceScore, WorkoutDayStatus, JournalEntry } from '../../types/auth';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: {
    energyLevel: EnergyLevel;
    adherenceScore: AdherenceScore;
    workoutStatus: WorkoutDayStatus;
    notes?: string | null;
  }) => void;
  existingEntry?: JournalEntry | null;
}

export const DailyCheckInModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  existingEntry,
}) => {
  const [energy, setEnergy] = useState<EnergyLevel>(existingEntry?.energyLevel || 'moderate');
  const [adherence, setAdherence] = useState<AdherenceScore>(existingEntry?.adherenceScore || 'on_track');
  const [workoutStatus, setWorkoutStatus] = useState<WorkoutDayStatus>(existingEntry?.workoutStatus || 'completed');
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  useEffect(() => {
    if (existingEntry) {
      setEnergy(existingEntry.energyLevel);
      setAdherence(existingEntry.adherenceScore);
      setWorkoutStatus(existingEntry.workoutStatus);
      setNotes(existingEntry.notes || '');
    } else {
      setEnergy('moderate');
      setAdherence('on_track');
      setWorkoutStatus('completed');
      setNotes('');
    }
  }, [existingEntry, visible]);

  const handleSave = () => {
    onSave({
      energyLevel: energy,
      adherenceScore: adherence,
      workoutStatus,
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daily Reflection</Text>
              <Text style={styles.subtitle}>A quick 30-second check-in for your momentum</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Energy Level */}
            <Text style={styles.sectionLabel}>Energy Level Today</Text>
            <View style={styles.optionRow}>
              {(['low', 'moderate', 'high'] as EnergyLevel[]).map((level) => {
                const isSelected = energy === level;
                const labels: Record<EnergyLevel, string> = {
                  low: 'Low 🔋',
                  moderate: 'Steady ⚡',
                  high: 'Peak 🚀',
                };
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => setEnergy(level)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {labels[level]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nutrition Adherence */}
            <Text style={styles.sectionLabel}>Nutrition Adherence</Text>
            <View style={styles.optionRow}>
              {(['on_track', 'mostly', 'struggled'] as AdherenceScore[]).map((score) => {
                const isSelected = adherence === score;
                const labels: Record<AdherenceScore, string> = {
                  on_track: 'On Track 🎯',
                  mostly: 'Mostly 🥗',
                  struggled: 'Off Track 💭',
                };
                return (
                  <TouchableOpacity
                    key={score}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => setAdherence(score)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {labels[score]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Workout Status */}
            <Text style={styles.sectionLabel}>Physical Activity / Workout</Text>
            <View style={styles.optionRow}>
              {(['completed', 'rest_day', 'skipped'] as WorkoutDayStatus[]).map((status) => {
                const isSelected = workoutStatus === status;
                const labels: Record<WorkoutDayStatus, string> = {
                  completed: 'Done 💪',
                  rest_day: 'Rest Day 🛋️',
                  skipped: 'Skipped ⏭️',
                };
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => setWorkoutStatus(status)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {labels[status]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Reflection Note */}
            <Text style={styles.sectionLabel}>Optional Note</Text>
            <TextInput
              style={styles.textInput}
              placeholder="How are you feeling? Any wins or challenges today?"
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={240}
            />

            <View style={styles.btnWrap}>
              <Button
                title={existingEntry ? 'Update Check-In' : 'Save Reflection'}
                variant="primary"
                size="large"
                onPress={handleSave}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  optionCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.primary,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    height: 75,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  btnWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
});
