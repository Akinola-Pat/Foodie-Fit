import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

interface Props {
  notice: string;
}

export const SafetyNoticeBanner: React.FC<Props> = ({ notice }) => {
  return (
    <View style={styles.container}>
      <AlertTriangle size={20} color="#B45309" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Calorie Safety Protection Active</Text>
        <Text style={styles.description}>{notice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
});
