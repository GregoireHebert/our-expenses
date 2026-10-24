import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, fonts, radii, personColor, tokens } from '../constants/Theme';

// The receipt the expense screen draws live, and the one history replays from a saved snapshot.
// Each row needs { name, pct, owes, idx }, idx picking the person's hue.
export default function Receipt({ split, total, label }) {
  return (
    <View style={styles.receipt}>
      <Text style={styles.receiptTitle}>OURS {'\u00B7'} RECEIPT</Text>
      <Text style={styles.receiptSub}>{label || 'untitled expense'}</Text>

      <View style={styles.receiptItems}>
        {split.map((s) => {
          const c = personColor(s.idx);
          return (
            <View key={s.name} style={styles.receiptRow}>
              <View style={styles.receiptLeft}>
                <View style={[styles.receiptDot, { backgroundColor: c.fill }]} />
                <Text style={styles.receiptName}>
                  {s.name} <Text style={styles.receiptPct}>{'\u00D7'}{s.pct.toFixed(1)}%</Text>
                </Text>
              </View>
              <Text style={styles.receiptAmount}>{s.owes.toFixed(2)}{'\u20AC'}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.receiptTotal}>
        <Text style={styles.receiptTotalLabel}>TOTAL</Text>
        <Text style={styles.receiptTotalAmount}>{total.toFixed(2)}{'\u20AC'}</Text>
      </View>
      <Text style={styles.receiptFooter}>{'\u2605'} thanks for splitting fairly {'\u2605'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  receipt: {
    fontFamily: fonts.mono,
    backgroundColor: tokens.receiptBg,
    borderRadius: radii.input,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: palette.line,
    borderStyle: 'dashed',
  },
  receiptTitle: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 2,
  },
  receiptSub: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: palette.ink,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  receiptItems: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line,
    borderStyle: 'dashed',
    paddingVertical: 10,
    marginVertical: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 8,
  },
  receiptName: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: palette.ink,
  },
  receiptPct: {
    opacity: 0.55,
  },
  receiptAmount: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: palette.ink,
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  receiptTotalLabel: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: palette.ink,
  },
  receiptTotalAmount: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: palette.ink,
  },
  receiptFooter: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: palette.ink,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 10 * 0.1,
  },
});
