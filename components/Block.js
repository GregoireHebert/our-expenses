import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';

export default function Block({
  flex,
  row,
  center,
  middle,
  space,
  shadow,
  safe,
  style,
  children,
  ...rest
}) {
  const blockStyles = [
    flex === true ? styles.flex : (typeof flex === 'number' ? { flex } : null),
    row && styles.row,
    center && styles.center,
    middle && styles.middle,
    space && { justifyContent: `space-${space}` },
    shadow && styles.shadow,
    style,
  ];

  if (safe) {
    return <SafeAreaView style={blockStyles} {...rest}>{children}</SafeAreaView>;
  }

  return <View style={blockStyles} {...rest}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row' },
  center: { alignItems: 'center' },
  middle: { justifyContent: 'center' },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});
