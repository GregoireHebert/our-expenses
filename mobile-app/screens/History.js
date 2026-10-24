import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Easing, Dimensions,
  FlatList, StyleSheet,
} from 'react-native';
import { palette, fonts, radii, tokens } from '../constants/Theme';
import Receipt from '../components/Receipt';
import Expenses from '../utils/expenses';
import { fullDate } from '../utils/format';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Where a row grows to. The insets match the screen's own padding, so the open card lands where a
// screen would start.
const OPEN_FRAME = { x: 24, y: 60, width: SCREEN_W - 48, height: SCREEN_H - 88 };

const OPEN_MS = 340;
const CLOSE_MS = 260;

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

// The checkbox selects; the rest of the row opens the receipt. The row measures itself on the way,
// so the card can grow from exactly where it sat.
function ExpenseRow({ expense, checked, onToggle, onOpen }) {
  const box = useRef(null);

  const open = () => {
    box.current?.measureInWindow((x, y, width, height) => {
      onOpen(expense, { x, y, width, height });
    });
  };

  return (
    <View ref={box} collapsable={false} style={[styles.row, checked && styles.rowChecked]}>
      <TouchableOpacity
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`select ${expense.label || 'untitled expense'}`}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 6 }}
      >
        <Checkbox checked={checked} />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} onPress={open} style={styles.rowBody}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {expense.label || 'untitled expense'}
          </Text>
          <Text style={styles.rowDate}>{fullDate(expense.savedAt)}</Text>
        </View>
        <Text style={styles.rowAmount}>{expense.amount.toFixed(2)}{'€'}</Text>
      </TouchableOpacity>
    </View>
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

  const list = useRef(null);

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
      // The reload starts from the first page again, so an offset into the longer list it
      // replaces points at rows that are no longer there.
      if (afterDelete) list.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, []);

  useEffect(() => { load(false); }, [load]);

  const loadMore = () => {
    if (open || busy || atEnd || !ready || items.length === 0) return;
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
    if (open || busy || atStart || !ready || items.length === 0) return;
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

  // The open receipt. `frame` is where its row sat on screen, which is both where the card grows
  // from and where it shrinks back to.
  const [open, setOpen] = useState(null);
  const grow = useRef(new Animated.Value(0)).current;

  const openExpense = (expense, frame) => {
    setOpen({ expense, frame });
    grow.setValue(0);
    Animated.timing(grow, {
      toValue: 1,
      duration: OPEN_MS,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      // Width, height and position have no native-driver equivalent, so this one runs in JS.
      useNativeDriver: false,
    }).start();
  };

  const closeExpense = () => {
    Animated.timing(grow, {
      toValue: 0,
      duration: CLOSE_MS,
      easing: Easing.bezier(0.4, 0, 0.6, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setOpen(null);
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
        ref={list}
        testID="history-list"
        data={items}
        keyExtractor={(expense) => expense.id}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            checked={isChecked(item.id)}
            onToggle={() => toggle(item.id)}
            onOpen={openExpense}
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
        // Only once earlier pages have been dropped. While the whole history is loaded, deleting
        // a row above the anchor leaves the list scrolled past its own content, and the screen
        // reads as blank until it is remounted.
        maintainVisibleContentPosition={atStart ? undefined : { minIndexForVisible: 1 }}
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

      {open && <ExpandedReceipt expense={open.expense} frame={open.frame} grow={grow} onClose={closeExpense} />}
    </View>
  );
}

function ExpandedReceipt({ expense, frame, grow, onClose }) {
  const between = (from, to) => grow.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  const split = (expense.split || []).map((person, i) => ({ ...person, idx: i }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: grow }]} />

      <Animated.View
        style={[styles.sheet, {
          left: between(frame.x, OPEN_FRAME.x),
          top: between(frame.y, OPEN_FRAME.y),
          width: between(frame.width, OPEN_FRAME.width),
          height: between(frame.height, OPEN_FRAME.height),
        }]}
      >
        {/* What the row looked like, fading out as the card outgrows it */}
        <Animated.View
          pointerEvents="none"
          style={[styles.rowGhost, { opacity: grow.interpolate({ inputRange: [0, 0.35], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
        >
          <View style={styles.rowText}>
            <Text style={styles.rowLabel} numberOfLines={1}>
              {expense.label || 'untitled expense'}
            </Text>
            <Text style={styles.rowDate}>{fullDate(expense.savedAt)}</Text>
          </View>
          <Text style={styles.rowAmount}>{expense.amount.toFixed(2)}{'€'}</Text>
        </Animated.View>

        <Animated.View
          style={[styles.sheetBody, { opacity: grow.interpolate({ inputRange: [0.3, 1], outputRange: [0, 1], extrapolate: 'clamp' }) }]}
        >
          <View style={styles.sheetHead}>
            <View style={styles.sheetHeadText}>
              <Text style={styles.sheetTitle} numberOfLines={2}>
                {expense.label || 'untitled expense'}
              </Text>
              <Text style={styles.sheetDate}>{fullDate(expense.savedAt)}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeMark}>{'×'}</Text>
            </TouchableOpacity>
          </View>

          <Receipt split={split} total={expense.amount} label={expense.label} />

          <Text style={styles.sheetNote}>
            Saved as it stood that day. Changing the gang since leaves this untouched.
          </Text>
        </Animated.View>
      </Animated.View>
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
  rowBody: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  // Expanded receipt
  backdrop: {
    backgroundColor: palette.bg,
  },
  sheet: {
    position: 'absolute',
    backgroundColor: palette.surface,
    borderRadius: radii.cardMedium,
    borderWidth: 1.5,
    borderColor: palette.line,
    overflow: 'hidden',
  },
  rowGhost: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 48,
  },
  sheetBody: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  sheetHeadText: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 32,
    color: palette.ink,
    letterSpacing: -32 * 0.035,
  },
  sheetDate: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: palette.inkSoft,
    marginTop: 6,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radii.input,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: palette.line,
  },
  closeMark: {
    fontSize: 22,
    lineHeight: 26,
    color: palette.ink,
  },
  sheetNote: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 13 * 1.4,
    color: palette.inkSoft,
    textAlign: 'center',
    marginTop: 18,
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
