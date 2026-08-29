import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Exercise } from '../../types/workout';
import { Dumbbell } from 'lucide-react-native';

interface Props {
  exercise: Exercise;
  index: number;
}

export const ExerciseItem: React.FC<Props> = ({ exercise, index }) => {
  return (
    <View style={styles.container}>
      <View style={styles.indexCircle}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      <View style={styles.infoWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={styles.setTag}>
            <Text style={styles.setText}>
              {exercise.sets} sets × {exercise.repsOrDuration}
            </Text>
          </View>
        </View>

        <Text style={styles.targetMuscle}>Target: {exercise.targetMuscle}</Text>
        <Text style={styles.instructions} numberOfLines={3}>
          {exercise.instructions}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  indexText: {
    color: Colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  infoWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  setTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  setText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  targetMuscle: {
    fontSize: 12,
    color: Colors.accentWarm,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
