import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';
import { palette, fonts, radii, personColor, tokens } from '../constants/Theme';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/PrimaryButton';
import People from '../utils/db';

function PersonRow({ person, idx, total, isLast, onSave, onRemove }) {
  const c = personColor(idx);
  const pct = total > 0 ? ((Number(person.incomes) / total) * 100) : 0;

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(person.name);
  const [draftIncome, setDraftIncome] = useState(String(person.incomes));
  const [nameFocused, setNameFocused] = useState(false);
  const [incomeFocused, setIncomeFocused] = useState(false);
  const editNameRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setDraftName(person.name);
      setDraftIncome(String(person.incomes));
      setTimeout(() => editNameRef.current?.focus(), 30);
    }
  }, [editing]);

  const cancel = () => setEditing(false);

  const save = () => {
    const n = draftName.trim();
    const inc = Number(draftIncome);
    if (!n || !inc) { setEditing(false); return; }
    onSave({ name: n, incomes: String(inc) });
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={[
        styles.personRow,
        { backgroundColor: c.soft, borderRadius: 16 },
        !isLast && styles.personRowBorder,
      ]}>
        <Avatar person={{ name: draftName || person.name }} idx={idx} />
        <View style={styles.editFields}>
          <TextInput
            ref={editNameRef}
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Name"
            placeholderTextColor={palette.inkSoft}
            style={[styles.editInput, styles.editNameInput, nameFocused && styles.inputFocused]}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            onSubmitEditing={save}
          />
          <View style={styles.editIncomeWrap}>
            <TextInput
              value={draftIncome}
              onChangeText={(v) => setDraftIncome(v.replace(/[^\d.]/g, ''))}
              placeholder="Income"
              placeholderTextColor={palette.inkSoft}
              keyboardType="decimal-pad"
              style={[styles.editInput, styles.editIncomeInput, incomeFocused && styles.inputFocused]}
              onFocus={() => setIncomeFocused(true)}
              onBlur={() => setIncomeFocused(false)}
              onSubmitEditing={save}
            />
            <View style={styles.editEuroSuffix} pointerEvents="none">
              <Text style={styles.editEuroText}>{'\u20AC'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.editActions}>
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>{'\u2713'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancel}>
            <Text style={styles.cancelBtnText}>{'\u00D7'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setEditing(true)}
      style={[styles.personRow, !isLast && styles.personRowBorder]}
    >
      <Avatar person={person} idx={idx} />
      <View style={styles.personInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.personName} numberOfLines={1}>{person.name}</Text>
          <Text style={styles.editHint}>edit</Text>
        </View>
        <View style={styles.incomeRow}>
          <Text style={styles.incomeMono}>
            {Number(person.incomes).toLocaleString()}{'\u20AC'}/mo
          </Text>
          <View style={[styles.pctChip, { backgroundColor: c.soft }]}>
            <Text style={[styles.pctText, { color: c.ink }]}>
              {pct.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={(e) => { e.stopPropagation?.(); onRemove(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.removeX}>{'\u00D7'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function PeopleScreen({ navigation }) {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [incomeFocused, setIncomeFocused] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    People.all(loaded => setPeople(loaded || []));
  }, []);

  const total = people.reduce((s, p) => s + Number(p.incomes || 0), 0);
  const canAdd = name.trim().length > 0 && Number(income) > 0;
  const canContinue = people.length >= 2;

  const addPerson = () => {
    if (!canAdd) return;
    const updated = [...people, { name: name.trim(), incomes: income }];
    setPeople(updated);
    People.save(updated);
    setName('');
    setIncome('');
    nameRef.current?.focus();
  };

  const removePerson = (index) => {
    const updated = people.filter((_, i) => i !== index);
    setPeople(updated);
    People.save(updated);
  };

  const updatePerson = (index, patch) => {
    const updated = people.map((p, i) => i === index ? { ...p, ...patch } : p);
    setPeople(updated);
    People.save(updated);
  };

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
          <Text style={styles.stepLabel}>step 1 of 2</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Who's in?</Text>
        <Text style={styles.subtitle}>
          Add everyone splitting the bills, plus what they earn each month.
        </Text>

        {/* People list */}
        {people.length > 0 ? (
          <View style={styles.listCard}>
            {people.map((person, i) => (
              <PersonRow
                key={`${person.name}-${i}`}
                person={person}
                idx={i}
                total={total}
                isLast={i === people.length - 1}
                onSave={(patch) => updatePerson(i, patch)}
                onRemove={() => removePerson(i)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No-one yet. Add your first person below {'\u{1F447}'}
            </Text>
          </View>
        )}

        {/* Add form */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>add someone</Text>
          <TextInput
            ref={nameRef}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={palette.inkSoft}
            style={[styles.input, nameFocused && styles.inputFocused]}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
          <View style={styles.incomeInputWrap}>
            <TextInput
              value={income}
              onChangeText={(v) => setIncome(v.replace(/[^\d.]/g, ''))}
              placeholder="Monthly income"
              placeholderTextColor={palette.inkSoft}
              keyboardType="decimal-pad"
              style={[styles.input, styles.incomeInput, incomeFocused && styles.inputFocused]}
              onFocus={() => setIncomeFocused(true)}
              onBlur={() => setIncomeFocused(false)}
            />
            <View style={styles.euroSuffix} pointerEvents="none">
              <Text style={styles.euroText}>{'\u20AC'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.addButton, canAdd ? styles.addButtonActive : styles.addButtonDisabled]}
            onPress={addPerson}
            disabled={!canAdd}
          >
            <Text style={[styles.addButtonText, canAdd ? styles.addButtonTextActive : styles.addButtonTextDisabled]}>
              + Add to the gang
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ minHeight: 12, flex: 1 }} />
      </ScrollView>

      {/* Fixed CTA at bottom */}
      <View style={styles.ctaWrap}>
        <PrimaryButton onPress={() => navigation.navigate('Expense')} disabled={!canContinue}>
          {canContinue ? `Continue with ${people.length} \u2192` : 'Add at least 2 people'}
        </PrimaryButton>
      </View>
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
    paddingBottom: 100,
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
  // People list card
  listCard: {
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderRadius: radii.cardMedium,
    padding: 6,
    marginBottom: 18,
  },
  // Person row — shared between view and edit modes
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  personRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    borderStyle: 'dashed',
  },
  // View mode
  personInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  personName: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    color: palette.ink,
  },
  editHint: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: palette.inkSoft,
    opacity: 0.6,
    letterSpacing: 10 * 0.08,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  incomeMono: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: palette.inkSoft,
  },
  pctChip: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radii.chipSmall,
  },
  pctText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
  },
  removeBtn: {
    padding: 8,
  },
  removeX: {
    fontSize: 18,
    color: palette.inkSoft,
  },
  // Edit mode
  editFields: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  editInput: {
    borderWidth: 1.5,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    color: palette.ink,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  editNameInput: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
  },
  editIncomeWrap: {
    position: 'relative',
  },
  editIncomeInput: {
    fontFamily: fonts.ui,
    fontSize: 14,
    paddingRight: 28,
  },
  editEuroSuffix: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  editEuroText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: palette.inkSoft,
  },
  inputFocused: {
    borderColor: palette.accent,
  },
  editActions: {
    gap: 6,
  },
  saveBtn: {
    width: 36,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    color: '#fff',
  },
  cancelBtn: {
    width: 36,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: palette.inkSoft,
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
    marginBottom: 18,
  },
  emptyText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: palette.inkSoft,
    textAlign: 'center',
  },
  // Add form
  formCard: {
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderRadius: radii.cardMedium,
    padding: 16,
    marginBottom: 18,
  },
  formLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 10 * 0.16,
    textTransform: 'uppercase',
    color: palette.inkSoft,
    marginBottom: 10,
  },
  input: {
    fontFamily: fonts.ui,
    fontSize: 16,
    color: palette.ink,
    backgroundColor: palette.bg,
    borderWidth: 1.5,
    borderColor: palette.line,
    borderRadius: radii.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  incomeInputWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  incomeInput: {
    paddingRight: 36,
    marginBottom: 0,
  },
  euroSuffix: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  euroText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: palette.inkSoft,
  },
  addButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: radii.input,
    alignItems: 'center',
  },
  addButtonActive: {
    backgroundColor: palette.ink,
  },
  addButtonDisabled: {
    backgroundColor: tokens.disabledBg,
  },
  addButtonText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
  },
  addButtonTextActive: {
    color: '#fff',
  },
  addButtonTextDisabled: {
    color: tokens.disabledFg,
  },
  // CTA
  ctaWrap: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    backgroundColor: palette.bg,
  },
});
