import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../../constants/colors';
import { Button } from './Button';
import { X, Scale } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (weightKg: number, notes?: string) => Promise<void>;
  defaultWeightKg?: number;
}

export const WeightLogModal: React.FC<Props> = ({ visible, onClose, onSave, defaultWeightKg }) => {
  const [weightText, setWeightText] = useState(defaultWeightKg ? defaultWeightKg.toString() : '');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = parseFloat(weightText.replace(',', '.'));
    if (isNaN(parsed) || parsed < 25 || parsed > 400) {
      setErrorMsg('Please enter a valid weight between 25 kg and 400 kg.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave(parsed, notes.trim() || undefined);
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save weight.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Scale size={20} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Log Your Weight</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.label}>Current Weight (kg)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.weightInput}
              keyboardType="decimal-pad"
              placeholder="e.g. 74.5"
              placeholderTextColor={Colors.textMuted}
              value={weightText}
              onChangeText={(t) => {
                setWeightText(t);
                setErrorMsg(null);
              }}
              autoFocus
            />
            <Text style={styles.unitText}>kg</Text>
          </View>

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Morning weigh-in, post-fasting, etc."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            maxLength={120}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Save Entry"
              variant="primary"
              size="medium"
              loading={saving}
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  weightInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
