import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { MealItem } from '../../types/nutrition';
import { getSwapCandidates } from '../../constants/regionalDiets';
import { X, Check, Flame } from 'lucide-react-native';

interface Props {
  visible: boolean;
  currentMeal: MealItem | null;
  onClose: () => void;
  onSelectSwap: (newMeal: MealItem) => void;
}

export const MealSwapSheet: React.FC<Props> = ({ visible, currentMeal, onClose, onSelectSwap }) => {
  if (!currentMeal) return null;

  const candidates = getSwapCandidates(currentMeal);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Swap {currentMeal.slot.toUpperCase()}</Text>
              <Text style={styles.subtitle}>Choose an authentic alternate recipe with matching macros</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* List of Alternate Meals */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {candidates.map((candidate) => (
              <TouchableOpacity
                key={candidate.id}
                style={styles.candidateCard}
                activeOpacity={0.8}
                onPress={() => {
                  onSelectSwap(candidate);
                  onClose();
                }}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.candidateTitle}>{candidate.title}</Text>
                  <Text style={styles.candidateDesc} numberOfLines={2}>
                    {candidate.description}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.macroPill}>
                      <Flame size={12} color="#DC2626" style={{ marginRight: 2 }} />
                      <Text style={styles.macroText}>{candidate.calories} kcal</Text>
                    </View>
                    <Text style={styles.statText}>🥩 {candidate.proteinGrams}g P</Text>
                    <Text style={styles.statText}>🌾 {candidate.carbsGrams}g C</Text>
                    <Text style={styles.statText}>🥑 {candidate.fatGrams}g F</Text>
                  </View>
                </View>
                <View style={styles.selectBtn}>
                  <Check size={18} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
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
    maxHeight: '80%',
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
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
  scrollContent: {
    paddingBottom: 24,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  candidateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  candidateDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  macroText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
