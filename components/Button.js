import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Text from './Text';
import materialTheme from '../constants/Theme';

export default function GaButton({ gradient, children, style, onPress, ...props }) {
  if (gradient) {
    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        locations={[0.2, 1]}
        style={[styles.gradient, style]}
        colors={[materialTheme.COLORS.GRADIENT_START, materialTheme.COLORS.GRADIENT_END]}
      >
        <TouchableOpacity style={[styles.gradient, style]} onPress={onPress} {...props}>
          <Text color="#fff">{children}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} {...props}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderWidth: 0,
    borderRadius: materialTheme.SIZES.BASE * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: materialTheme.SIZES.BASE * 2,
    backgroundColor: materialTheme.COLORS.BUTTON_COLOR,
  },
});
