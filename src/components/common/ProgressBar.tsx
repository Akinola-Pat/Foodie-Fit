import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<Props> = ({ currentStep, totalSteps }) => {
  const percentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percentage}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});
