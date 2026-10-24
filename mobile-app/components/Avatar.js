import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { personColor, fonts } from '../constants/Theme';

export default function Avatar({ person, idx = 0, size = 44 }) {
  const c = personColor(idx);
  const initial = (person.name || '?').trim().charAt(0).toUpperCase();
  const isCircle = idx % 5 === 0;
  const borderRadius = isCircle ? size / 2 : size * 0.32;

  return (
    <View style={[styles.container, {
      width: size,
      height: size,
      borderRadius,
      backgroundColor: c.fill,
      borderBottomWidth: 3,
      borderBottomColor: c.deep + '33',
    }]}>
      <Text style={[styles.initial, {
        color: c.ink,
        fontSize: size * 0.46,
      }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fonts.displaySemiBold,
  },
});
