import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { palette, tokens, fonts, radii } from '../constants/Theme';

export default function PrimaryButton({ children, onPress, disabled = false, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        disabled ? styles.disabled : styles.enabled,
        style,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: radii.cardMedium,
    alignItems: 'center',
  },
  enabled: {
    backgroundColor: palette.accent,
    shadowColor: tokens.accentShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
    elevation: 8,
  },
  disabled: {
    backgroundColor: tokens.disabledBg,
  },
  text: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#fff',
  },
  textDisabled: {
    color: tokens.disabledFg,
  },
});
