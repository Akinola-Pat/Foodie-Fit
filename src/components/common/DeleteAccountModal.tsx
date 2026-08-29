import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { AlertOctagon, X } from 'lucide-react-native';
import { Button } from './Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<Props> = ({ visible, onClose, onConfirmDelete }) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete();
      setConfirmationInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AlertOctagon size={24} color={Colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Delete Account</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.warningText}>
            This action is permanent and cannot be undone. All your data will be permanently deleted from our servers, including:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Your personalized profile & caloric targets</Text>
            <Text style={styles.bulletItem}>• All recorded weigh-ins and weight trend history</Text>
            <Text style={styles.bulletItem}>• Completed workouts, streaks, and exercise history</Text>
            <Text style={styles.bulletItem}>• Customized weekly meal plans and recipe swaps</Text>
          </View>

          {/* Confirmation Input */}
          <Text style={styles.inputLabel}>
            Type <Text style={{ fontWeight: '700', color: Colors.error }}>DELETE</Text> below to confirm:
          </Text>

          <TextInput
            style={styles.textInput}
            value={confirmationInput}
            onChangeText={setConfirmationInput}
            placeholder="Type DELETE"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          {/* Actions */}
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="outline"
              size="medium"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Permanently Delete"
              variant="danger"
              size="medium"
              disabled={!isConfirmed}
              loading={isDeleting}
              onPress={handleDelete}
              style={{ flex: 1.2 }}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.error,
  },
  closeBtn: {
    padding: 4,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  bulletList: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  bulletItem: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
