import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { MealItem } from '../../types/nutrition';
import { Clock, RefreshCw, Flame, ChevronRight } from 'lucide-react-native';

interface Props {
  meal: MealItem;
  onSwapPress?: () => void;
  onPressDetails?: () => void;
}

export const MealCard: React.FC<Props> = ({ meal, onSwapPress, onPressDetails }) => {
  const slotLabels: Record<MealItem['slot'], { name: string; icon: string }> = {
    breakfast: { name: 'Breakfast', icon: '🌅' },
    lunch: { name: 'Lunch', icon: '☀️' },
    dinner: { name: 'Dinner', icon: '🌙' },
    snack: { name: 'Snack', icon: '🍎' },
  };

  const slotInfo = slotLabels[meal.slot];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPressDetails}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.slotBadge}>
          <Text style={styles.slotIcon}>{slotInfo.icon}</Text>
          <Text style={styles.slotName}>{slotInfo.name}</Text>
        </View>

        {onSwapPress && (
          <TouchableOpacity style={styles.swapBtn} onPress={onSwapPress} activeOpacity={0.7}>
            <RefreshCw size={13} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.swapText}>Swap</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Meal Title & Description */}
      <Text style={styles.title}>{meal.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {meal.description}
      </Text>

      {/* Macro Pills */}
      <View style={styles.macroRow}>
        <View style={[styles.macroPill, { backgroundColor: '#FEE2E2' }]}>
          <Flame size={12} color="#DC2626" style={{ marginRight: 2 }} />
          <Text style={[styles.macroText, { color: '#991B1B' }]}>{meal.calories} kcal</Text>
        </View>

        <View style={[styles.macroPill, { backgroundColor: '#FFEDD5' }]}>
          <Text style={[styles.macroText, { color: '#9A3412' }]}>🥩 {meal.proteinGrams}g P</Text>
        </View>

        <View style={[styles.macroPill, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.macroText, { color: '#92400E' }]}>🌾 {meal.carbsGrams}g C</Text>
        </View>

        <View style={[styles.macroPill, { backgroundColor: '#E0F2FE' }]}>
          <Text style={[styles.macroText, { color: '#0369A1' }]}>🥑 {meal.fatGrams}g F</Text>
        </View>

        <View style={styles.timePill}>
          <Clock size={12} color={Colors.textSecondary} style={{ marginRight: 2 }} />
          <Text style={styles.timeText}>{meal.prepTimeMinutes}m</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  slotName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textOnCream,
    textTransform: 'uppercase',
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  swapText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  macroText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
