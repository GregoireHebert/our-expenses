import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { palette, fonts, radii, tokens } from '../constants/Theme';
import Expenses from '../utils/expenses';
import { fullDate } from '../utils/format';

function Checkbox({ checked }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxOn]}>
      {checked && <Text style={styles.checkboxMark}>{'✓'}</Text>}
    </View>
  );
}

function ExpenseRow({ expense, checked, onToggle }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={[styles.row, checked && styles.rowChecked]}
    >
      <Checkbox checked={checked} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel} numberOfLines={1}>
          {expense.label || 'untitled expense'}
        </Text>
        <Text style={styles.rowDate}>{fullDate(expense.savedAt)}</Text>
      </View>
      <Text style={styles.rowAmount}>{expense.amount.toFixed(2)}{'€'}</Text>
    </TouchableOpacity>
  );
}

export default function HistoryScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    Expenses.all(loaded => setExpenses(loaded || []));
  }, []);

  const persist = (updated) => {
    setExpenses(updated);
    Expenses.save(updated);
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const allSelected = expenses.length > 0 && selected.length === expenses.length;

  const toggle = (id) => {
    setArmed(false);
    setSelected(current => current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id]);
  };

  const toggleAll = () => {
    setArmed(false);
    setSelected(allSelected ? [] : expenses.map(e => e.id));
  };

  // Deleting cannot be undone, so every removal goes through here: the button arms itself on the
  // first tap and commits on the second.
  const removeSelected = () => {
    if (selected.length === 0) return;
    if (!armed) {
      setArmed(true);
      return;
    }
    persist(expenses.filter(e => !selected.includes(e.id)));
    setSelected([]);
    setArmed(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.stepLabel}>what you spent</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Title */}
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          {expenses.length > 0
            ? `${expenses.length} expense${expenses.length > 1 ? 's' : ''}, ${total.toFixed(2)}€ all together.`
            : 'Every expense you save lands here.'}
        </Text>

        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              checked={selected.includes(expense.id)}
              onToggle={() => toggle(expense.id)}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nothing saved yet. Type an amount on the expense screen and save it.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Selection bar */}
      {expenses.length > 0 && (
        <View style={styles.actionWrap}>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={toggleAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.selectAll}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>{selected.length} selected</Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, selected.length === 0 && styles.deleteButtonOff]}
            onPress={removeSelected}
            disabled={selected.length === 0}
          >
            <Text style={[styles.deleteText, selected.length === 0 && styles.deleteTextOff]}>
              {armed
                ? `Tap again to delete ${selected.length}`
                : `Delete${selected.length > 0 ? ` ${selected.length}` : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
  headerSpacer: {
    width: 40,
  },
  stepLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.16,
    textTransform: 'uppercase',
    color: palette.inkSoft,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 38 * 0.98,
    color: palette.ink,
    letterSpacing: -38 * 0.035,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 15 * 1.4,
    color: palette.inkSoft,
    marginBottom: 22,
  },
  // Expense row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: radii.cardMedium,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderBottomWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowChecked: {
    borderColor: palette.accent,
    backgroundColor: tokens.receiptBg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  checkboxMark: {
    fontSize: 13,
    lineHeight: 16,
    color: '#fff',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    color: palette.ink,
  },
  rowDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: palette.inkSoft,
    marginTop: 2,
  },
  rowAmount: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 15,
    color: palette.ink,
  },
  // Empty state
  emptyCard: {
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderStyle: 'dashed',
    borderRadius: radii.cardMedium,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: palette.inkSoft,
    textAlign: 'center',
  },
  // Selection bar
  actionWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: palette.bg,
    borderTopWidth: 1.5,
    borderTopColor: palette.line,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectAll: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: palette.ink,
  },
  selectedCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.14,
    textTransform: 'uppercase',
    color: palette.inkSoft,
  },
  deleteButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: radii.cardMedium,
    alignItems: 'center',
    backgroundColor: tokens.danger,
  },
  deleteButtonOff: {
    backgroundColor: tokens.disabledBg,
  },
  deleteText: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: '#fff',
  },
  deleteTextOff: {
    color: tokens.disabledFg,
  },
});
