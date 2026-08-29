import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { ShieldAlert, ArrowRight } from 'lucide-react-native';

interface Props {
  onPressSaveAccount: () => void;
}

export const GuestBanner: React.FC<Props> = ({ onPressSaveAccount }) => {
  return (
    <View style={styles.banner}>
      <View style={styles.leftRow}>
        <ShieldAlert size={20} color={Colors.accent} />
        <View style={styles.textWrap}>
          <Text style={styles.title}>Guest Mode (Local Only)</Text>
          <Text style={styles.subtitle}>Save an account to backup your plan & streak</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionBtn} onPress={onPressSaveAccount} activeOpacity={0.8}>
        <Text style={styles.btnText}>Save</Text>
        <ArrowRight size={14} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF5EB',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  textWrap: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },
  subtitle: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
});
