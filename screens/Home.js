import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { palette, fonts, radii, personColor, tokens } from '../constants/Theme';
import People from '../utils/db';

function AvatarDot({ idx, size = 18 }) {
  const c = personColor(idx);
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: c.fill,
      borderWidth: 2,
      borderColor: palette.surface,
    }} />
  );
}

function PeoplePill({ people, onPress }) {
  return (
    <TouchableOpacity style={styles.peoplePill} onPress={onPress}>
      <View style={styles.avatarStack}>
        {people.slice(0, 3).map((_, i) => (
          <View key={i} style={i > 0 ? { marginLeft: -6 } : null}>
            <AvatarDot idx={i} />
          </View>
        ))}
      </View>
      <Text style={styles.peoplePillText}>{people.length} people</Text>
    </TouchableOpacity>
  );
}

function ReceiptViz({ split, total, label }) {
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

export default function ExpenseScreen({ navigation }) {
  const [people, setPeople] = useState([]);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');

  useFocusEffect(
    useCallback(() => {
      People.all(loaded => {
        setPeople(loaded || []);
        if ((loaded || []).length < 2) {
          navigation.navigate('People');
        }
      });
    }, [navigation])
  );

  const num = parseFloat((amount || '0').replace(',', '.')) || 0;
  const totalIncome = people.reduce((s, p) => s + Number(p.incomes || 0), 0);

  const split = people.map((person, i) => {
    const ratio = totalIncome > 0 ? Number(person.incomes) / totalIncome : 0;
    return {
      ...person,
      idx: i,
      ratio,
      pct: ratio * 100,
      owes: num * ratio,
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </TouchableOpacity>
          <PeoplePill people={people} onPress={() => navigation.navigate('People')} />
        </View>

        {/* Expense input card */}
        <View style={styles.expenseCard}>
          <Text style={styles.monoLabel}>this expense</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="What was it?"
            placeholderTextColor={palette.inkSoft}
            style={styles.labelInput}
          />
          <View style={styles.amountRow}>
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^\d.,]/g, ''))}
              placeholder="0"
              placeholderTextColor={palette.inkSoft + '88'}
              keyboardType="decimal-pad"
              style={styles.amountInput}
            />
            <Text style={[styles.euroSign, num > 0 ? styles.euroActive : styles.euroInactive]}>
              {'\u20AC'}
            </Text>
          </View>
        </View>

        {/* Split card */}
        <View style={styles.splitCard}>
          <View style={styles.splitHeader}>
            <Text style={styles.splitTitle}>Each pays</Text>
            <Text style={styles.splitMode}>receipt</Text>
          </View>
          <ReceiptViz split={split} total={num} label={label} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.input,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: palette.line,
  },
  backArrow: {
    fontSize: 18,
    color: palette.ink,
  },
  peoplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: palette.line,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  peoplePillText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: palette.ink,
  },
  // Expense input card
  expenseCard: {
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderRadius: radii.card,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  monoLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.16,
    textTransform: 'uppercase',
    color: palette.inkSoft,
    marginBottom: 6,
  },
  labelInput: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: palette.ink,
    paddingVertical: 0,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 64,
    color: palette.ink,
    letterSpacing: -64 * 0.04,
    paddingVertical: 0,
  },
  euroSign: {
    fontFamily: fonts.display,
    fontSize: 56,
    letterSpacing: -56 * 0.04,
  },
  euroActive: {
    color: palette.ink,
    opacity: 1,
  },
  euroInactive: {
    color: palette.inkSoft,
    opacity: 0.4,
  },
  // Split card
  splitCard: {
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderRadius: radii.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  splitTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
    color: palette.ink,
    letterSpacing: -22 * 0.02,
  },
  splitMode: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.14,
    textTransform: 'uppercase',
    color: palette.inkSoft,
  },
  // Receipt viz
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
