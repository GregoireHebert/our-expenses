import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

import { Block, Text, Icon, Input, Button } from '../components/';
import materialTheme from '../constants/Theme';
import People from '../utils/db';

const { width } = Dimensions.get('screen');

export default function Settings() {
  const [people, setPeople] = useState([]);
  const [personName, setPersonName] = useState('');
  const [personIncomes, setPersonIncomes] = useState('');

  useEffect(() => {
    People.all(loaded => setPeople(loaded || []));
  }, []);

  const addPerson = () => {
    const notEmptyName = personName.trim().length > 0;
    const notEmptyIncomes = personIncomes.trim().length > 0;

    if (notEmptyName && notEmptyIncomes) {
      const updated = [...people, { name: personName, incomes: personIncomes }];
      setPeople(updated);
      People.save(updated);
      setPersonName('');
      setPersonIncomes('');
    }
  };

  const deletePerson = (index) => {
    const updated = people.filter((_, i) => i !== index);
    setPeople(updated);
    People.save(updated);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.settings}
    >
      <Block style={styles.title}>
        <Text bold center size={materialTheme.SIZES.BASE} style={{ paddingBottom: 5 }}>
          Settings
        </Text>
        <Text center muted size={12}>
          People and incomes
        </Text>
      </Block>

      {people.map((item, index) => (
        <Block key={`${item.name}-${index}`} flex center style={styles.rows}>
          <TouchableOpacity onPress={() => deletePerson(index)}>
            <Block row middle space="between" style={{ paddingTop: 7 }}>
              <Icon size={16} color={materialTheme.COLORS.ICON} name="trash" family="font-awesome" />
              <Text bold size={18}> {item.name} {item.incomes}</Text>
            </Block>
          </TouchableOpacity>
        </Block>
      ))}

      <Block style={styles.title}>
        <Text center muted size={12}>
          Add people
        </Text>
      </Block>

      <Block flex center style={styles.rows}>
        <Input
          placeholder="Name"
          value={personName}
          onChangeText={setPersonName}
          placeholderTextColor={materialTheme.COLORS.DEFAULT}
          style={styles.input}
        />
      </Block>
      <Block flex center style={styles.rows}>
        <Input
          value={personIncomes}
          placeholder="Income"
          onChangeText={setPersonIncomes}
          placeholderTextColor={materialTheme.COLORS.DEFAULT}
          style={styles.input}
        />
      </Block>
      <Block style={styles.buttonRow}>
        <Button onPress={addPerson}>Add</Button>
      </Block>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: materialTheme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: materialTheme.SIZES.BASE,
    paddingBottom: materialTheme.SIZES.BASE / 2,
  },
  rows: {
    paddingHorizontal: materialTheme.SIZES.BASE,
    marginBottom: materialTheme.SIZES.BASE,
  },
  buttonRow: {
    paddingHorizontal: materialTheme.SIZES.BASE,
    marginBottom: materialTheme.SIZES.BASE,
  },
  input: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
});
