import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function Input({ color, style, ...rest }) {
  return (
    <TextInput
      style={[styles.input, color && { color }, style]}
      placeholderTextColor="#9FA5AA"
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
});
