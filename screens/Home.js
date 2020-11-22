import React, {useState} from 'react';
import {StyleSheet, Dimensions, FlatList, TouchableOpacity} from 'react-native';
import {Block, Text, theme, Input, Icon, Button} from 'galio-framework';

const { width } = Dimensions.get('screen');
const sumIncome = (accumulator, currentValue) => accumulator + parseFloat(currentValue.incomes);

import materialTheme from '../constants/Theme';
import People from '../utils/db';

export default class Home extends React.Component {
  state = {
    people: [],
    expense: 0,
    total: 0
  };

  updatePeople = () => {
    People.all(people => {
      const total = people.reduce(sumIncome, 0);

      const reparted = people
          .sort((a, b) => a.incomes > b.incomes)
          .map(person => {
            person.repartition = Math.round((person.incomes/total)*100*100)/100;
            person.value = 0;
            return person;
          });
      this.setState({ people: reparted || [] })
    });
  }

  componentDidMount() {
    this.updatePeople();
  }

  onChange = e => {
    const {people} = this.state;
    const withValue  = people.map(person => {
      person.value = ((person.repartition*e.nativeEvent.text.replace(',','.'))/100).toFixed(3);
      return person;
    });
    this.setState({ people: withValue});
  };

  renderItem = ({ item }) => {
    return (
        <Block key={item.name} style={item.id%2 ? [styles.percent, styles.higher] : [styles.percent, styles.lower]}>
          <Text center size={18} color="white">{item.name} {item.value}€</Text>
        </Block>
    );
  }

  render() {
    const { people } = this.state;
    if (people.length < 2) {
      return (
        <Block flex center style={styles.home}>
          <Block row style={styles.people}>
            <Block style={[styles.error]}>
              <Icon size={16} color={theme.COLORS.ICON} name="exclamation-triangle" family="font-awesome" />
              <Text center size={18} color="black">You need to set at least 2 persons in the Settings</Text>
              <TouchableOpacity>
                <Button onPress={this.updatePeople}>Force Update</Button>
              </TouchableOpacity>
            </Block>
          </Block>
        </Block>
      );
    }

    return (
      <Block flex center style={styles.home}>
        <Block row style={styles.people}>
          {people.map((person, k) => {
            return (
              <Block key={person.name} style={k%2 ? [styles.percent, styles.higher] : [styles.percent, styles.lower]}>
                <Text center size={18} color="white">{person.name} {person.repartition}%</Text>
              </Block>
            )
          })}
        </Block>
        <Input
            right
            name="expense"
            color="black"
            style={styles.search}
            placeholder="How much did you spend?"
            onChange={this.onChange}
        />
        <FlatList
            data={people}
            keyExtractor={(item, index) => item.name}
            renderItem={this.renderItem}
            ListHeaderComponent={
              <Block style={styles.title}>
                <Text bold center size={theme.SIZES.BASE} style={{ paddingBottom: 5 }}>
                  Repartition:
                </Text>
              </Block>
            }
        />
        <TouchableOpacity>
          <Button onPress={this.updatePeople}>Force Update Repartition</Button>
        </TouchableOpacity>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  summary: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  header: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 4,
    zIndex: 2,
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.50,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  tabTitle: {
    lineHeight: 19,
    fontWeight: '300'
  },
  divider: {
    borderRightWidth: 0.3,
    borderRightColor: theme.COLORS.MUTED,
  },
  expenses: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  expense: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE/2,
    borderWidth: 0,
    minHeight: 28,
  },
  percent: {
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 8,
    marginTop: theme.SIZES.BASE / 2,
    marginBottom: theme.SIZES.BASE / 2,
    borderRadius: 4,
    height: 25,
  },
  error: {
    paddingLeft: 5,
    paddingRight: 5,
    marginLeft: 8,
    marginTop: theme.SIZES.BASE / 2,
    marginBottom: theme.SIZES.BASE / 2,
    height: 85,
  },
  higher: {
    backgroundColor: materialTheme.COLORS.INFO,
  },
  lower: {
    backgroundColor: materialTheme.COLORS.LABEL,
  },
  people: {
    marginTop: 10
  }
});
