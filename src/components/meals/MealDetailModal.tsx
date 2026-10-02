import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { MealItem } from '../../types/nutrition';
import { X, Flame, Clock, RefreshCw, ChefHat, Check } from 'lucide-react-native';

interface Props {
  visible: boolean;
  meal: MealItem | null;
  onClose: () => void;
  onSwapPress?: () => void;
}

export const MealDetailModal: React.FC<Props> = ({ visible, meal, onClose, onSwapPress }) => {
  if (!meal) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{meal.slot.toUpperCase()}</Text>
          {onSwapPress ? (
            <TouchableOpacity onPress={onSwapPress} style={styles.swapBtn}>
              <RefreshCw size={15} color={Colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.swapText}>Swap</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title & Description */}
          <Text style={styles.title}>{meal.title}</Text>
          <Text style={styles.description}>{meal.description}</Text>

          {/* Macro Pills */}
          <View style={styles.macroRow}>
            <View style={[styles.macroPill, { backgroundColor: '#FEE2E2' }]}>
              <Flame size={14} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={[styles.macroText, { color: '#991B1B' }]}>{meal.calories} kcal</Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: '#FFEDD5' }]}>
              <Text style={[styles.macroText, { color: '#9A3412' }]}>🥩 {meal.proteinGrams}g Protein</Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.macroText, { color: '#92400E' }]}>🌾 {meal.carbsGrams}g Carbs</Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.macroText, { color: '#0369A1' }]}>🥑 {meal.fatGrams}g Fat</Text>
            </View>
            <View style={styles.timePill}>
              <Clock size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.timeText}>{meal.prepTimeMinutes} mins prep</Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              💡 Nutrition values are curated estimates based on standard regional ingredient preparations.
            </Text>
          </View>

          {/* Ingredients */}
          <View style={styles.sectionHeaderRow}>
            <ChefHat size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          <View style={styles.cardList}>
            {meal.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientName}>{ing.name}</Text>
                <Text style={styles.ingredientAmount}>{ing.amount}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Preparation Instructions</Text>
          <View style={styles.instructionsList}>
            {meal.instructions.map((inst, i) => (
              <View key={i} style={styles.instructionStep}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{inst}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  swapText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  macroText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  disclaimerBox: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE3C8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textOnCream,
    lineHeight: 17,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardList: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  ingredientAmount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  instructionsList: {
    marginTop: 12,
    gap: 14,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    color: Colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
