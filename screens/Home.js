import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Block, Text, Input, Icon, Button } from '../components/';
import materialTheme from '../constants/Theme';
import People from '../utils/db';

const { width } = Dimensions.get('screen');
const sumIncome = (accumulator, currentValue) => accumulator + parseFloat(currentValue.incomes);

export default function Home({ navigation }) {
  const [people, setPeople] = useState([]);

  const updatePeople = useCallback(() => {
    People.all(loaded => {
      const total = loaded.reduce(sumIncome, 0);
      const reparted = loaded
        .sort((a, b) => a.incomes > b.incomes)
        .map(person => ({
          ...person,
          repartition: Math.round((person.incomes / total) * 100 * 100) / 100,
          value: 0,
        }));
      setPeople(reparted || []);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      updatePeople();
    }, [updatePeople])
  );

  const onChange = (text) => {
    const withValue = people.map(person => ({
      ...person,
      value: ((person.repartition * parseFloat(text.replace(',', '.') || 0)) / 100).toFixed(3),
    }));
    setPeople(withValue);
  };

  const renderItem = ({ item, index }) => {
    return (
      <Block key={item.name} style={index % 2 ? [styles.percent, styles.higher] : [styles.percent, styles.lower]}>
        <Text center size={18} color="white">{item.name} {item.value}</Text>
      </Block>
    );
  };

  useEffect(() => {
    if (people.length < 2) {
      navigation.navigate('SettingsDrawer');
    }
  }, [people, navigation]);

  return (
    <Block flex center style={styles.home}>
      <Block row style={styles.people}>
        {people.map((person, k) => (
          <Block key={person.name} style={k % 2 ? [styles.percent, styles.higher] : [styles.percent, styles.lower]}>
            <Text center size={18} color="white">{person.name} {person.repartition}%</Text>
          </Block>
        ))}
      </Block>
      <Input
        color="black"
        style={styles.search}
        placeholder="How much did you spend?"
        onChangeText={onChange}
      />
      <FlatList
        data={people}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        ListHeaderComponent={
          <Block style={styles.title}>
            <Text bold center size={materialTheme.SIZES.BASE} style={{ paddingBottom: 5 }}>
              Repartition:
            </Text>
          </Block>
        }
      />
      <TouchableOpacity onPress={updatePeople}>
        <Button>Force Update Repartition</Button>
      </TouchableOpacity>
    </Block>
  );
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  title: {
    paddingTop: materialTheme.SIZES.BASE,
    paddingBottom: materialTheme.SIZES.BASE / 2,
  },
  percent: {
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 8,
    marginTop: materialTheme.SIZES.BASE / 2,
    marginBottom: materialTheme.SIZES.BASE / 2,
    borderRadius: 4,
    height: 25,
  },
  error: {
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 8,
    marginTop: materialTheme.SIZES.BASE / 2,
    marginBottom: materialTheme.SIZES.BASE / 2,
    height: 85,
  },
  higher: {
    backgroundColor: materialTheme.COLORS.INFO,
  },
  lower: {
    backgroundColor: materialTheme.COLORS.LABEL,
  },
  people: {
    marginTop: 10,
  },
});
