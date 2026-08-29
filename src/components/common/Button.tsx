import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textOnPrimary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              disabled && styles.disabledText,
              icon ? { marginLeft: 8 } : {},
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    minHeight: 48,
  },
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D0D0D0',
    shadowOpacity: 0,
    elevation: 0,
  },

  small: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    minHeight: 56,
  },

  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
  },
  secondaryText: {
    color: Colors.textOnCream,
    fontSize: 16,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: 16,
  },
  dangerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  ghostText: {
    color: Colors.primary,
    fontSize: 15,
  },
  disabledText: {
    color: '#8E8E93',
  },

  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
