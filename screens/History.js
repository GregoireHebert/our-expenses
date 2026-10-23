import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, StyleSheet,
} from 'react-native';
import { palette, fonts, radii, tokens } from '../constants/Theme';
import Expenses from '../utils/expenses';
import { fullDate } from '../utils/format';

// Two screenfuls to start with, then the same again each time the list runs out.
const PAGE = 20;

// Rows kept in memory. Scrolling past this drops the pages behind, which are read again on the way
// back, so a history of any size costs the same to scroll through.
const WINDOW = 300;

// Selection outlives the screen: walking to the expense screen and back keeps the ticks. It is
// session state rather than stored data, so a cold start begins with nothing selected.
const session = { ids: [], all: false, excluded: [] };

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
  const [items, setItems] = useState([]);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [busy, setBusy] = useState(null);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ count: 0, total: 0 });

  // Two ways to hold a selection. `selected` names the ticked rows one by one. Under `selectAll`
  // the selection is the whole history instead, and `excluded` names the rows unticked since, so
  // the count stays honest about the pages that were never loaded.
  const [selected, setSelected] = useState(session.ids);
  const [selectAll, setSelectAll] = useState(session.all);
  const [excluded, setExcluded] = useState(session.excluded);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    session.ids = selected;
    session.all = selectAll;
    session.excluded = excluded;
  }, [selected, selectAll, excluded]);

  const load = useCallback((afterDelete) => {
    if (afterDelete) {
      setSelected([]);
      setSelectAll(false);
      setExcluded([]);
    }
    setArmed(false);
    Expenses.stats(setStats);
    Expenses.page(null, PAGE, (result) => {
      setItems(result.items);
      setAtStart(true);
      setAtEnd(result.done);
      setReady(true);
    });
  }, []);

  useEffect(() => { load(false); }, [load]);

  const loadMore = () => {
    if (busy || atEnd || !ready || items.length === 0) return;
    setBusy('end');
    Expenses.page(items[items.length - 1].id, PAGE, (result) => {
      const total = items.length + result.items.length;
      setItems(current => {
        const next = [...current, ...result.items];
        return next.length > WINDOW ? next.slice(next.length - WINDOW) : next;
      });
      if (total > WINDOW) setAtStart(false);
      setAtEnd(result.done);
      setBusy(null);
    });
  };

  const loadPrevious = () => {
    if (busy || atStart || !ready || items.length === 0) return;
    setBusy('start');
    Expenses.pageBefore(items[0].id, PAGE, (result) => {
      const total = items.length + result.items.length;
      setItems(current => {
        const next = [...result.items, ...current];
        return next.length > WINDOW ? next.slice(0, WINDOW) : next;
      });
      if (total > WINDOW) setAtEnd(false);
      setAtStart(result.done);
      setBusy(null);
    });
  };

  const selectedCount = selectAll ? stats.count - excluded.length : selected.length;
  const isChecked = (id) => selectAll ? !excluded.includes(id) : selected.includes(id);

  const toggle = (id) => {
    setArmed(false);
    if (selectAll) {
      setExcluded(current => current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id]);
      return;
    }
    setSelected(current => current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id]);
  };

  const selectEverything = () => {
    setArmed(false);
    setSelected([]);
    setExcluded([]);
    setSelectAll(true);
  };

  const clearSelection = () => {
    setArmed(false);
    setSelected([]);
    setExcluded([]);
    setSelectAll(false);
  };

  // Deleting cannot be undone, so every removal goes through here: the button arms itself on the
  // first tap and commits on the second.
  const removeSelected = () => {
    if (selectedCount === 0) return;
    if (!armed) {
      setArmed(true);
      return;
    }
    const after = () => load(true);
    if (selectAll) {
      if (excluded.length === 0) {
        Expenses.clear(after);
      } else {
        Expenses.keepOnly(excluded, after);
      }
      return;
    }
    Expenses.remove(selected, after);
  };


  const header = (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.stepLabel}>what you spent</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>
        {stats.count > 0
          ? `${stats.count} expense${stats.count > 1 ? 's' : ''}, ${stats.total.toFixed(2)}\u20AC all together.`
          : 'Every expense you save lands here.'}
      </Text>
      {busy === 'start' && <Text style={styles.loadingMore}>loading earlier{'\u2026'}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(expense) => expense.id}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            checked={isChecked(item.id)}
            onToggle={() => toggle(item.id)}
          />
        )}
        extraData={`${selectAll}-${selected.length}-${excluded.length}`}
        ListHeaderComponent={header}
        ListEmptyComponent={ready ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nothing saved yet. Type an amount on the expense screen and save it.
            </Text>
          </View>
        ) : null}
        ListFooterComponent={busy === 'end' ? (
          <Text style={styles.loadingMore}>loading more{'\u2026'}</Text>
        ) : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onStartReached={loadPrevious}
        onStartReachedThreshold={0.5}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      />

      {/* Selection bar, always in reach */}
      {stats.count > 0 && (
        <View style={styles.actionWrap}>
          <View style={styles.actionRow}>
            <View style={styles.actionLinks}>
              {!selectAll && (
                <TouchableOpacity onPress={selectEverything} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.linkText}>Select all</Text>
                </TouchableOpacity>
              )}
              {selectedCount > 0 && (
                <TouchableOpacity onPress={clearSelection} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.linkText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.selectedCount}>{selectedCount} selected</Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, selectedCount === 0 && styles.deleteButtonOff]}
            onPress={removeSelected}
            disabled={selectedCount === 0}
          >
            <Text style={[styles.deleteText, selectedCount === 0 && styles.deleteTextOff]}>
              {armed ? 'Tap again to delete' : 'Delete'}
              {selectAll && excluded.length === 0 ? ` all ${stats.count}` : selectedCount > 0 ? ` ${selectedCount}` : ''}
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
  loadingMore: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.14,
    textTransform: 'uppercase',
    color: palette.inkSoft,
    textAlign: 'center',
    paddingVertical: 12,
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
  actionLinks: {
    flexDirection: 'row',
    gap: 18,
  },
  linkText: {
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
