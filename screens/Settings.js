import React from 'react';
import {StyleSheet, Switch, FlatList, Platform, TouchableOpacity, ScrollView, Dimensions} from 'react-native';
import {Block, Text, theme, Icon, Input, Button} from 'galio-framework';

import materialTheme from '../constants/Theme';
import People from '../utils/db';

const { width } = Dimensions.get('screen');

export default class Settings extends React.Component {
  state = {
    people: [],
    personName: "",
    personIncomes: ""
  };

  changeNameHandler = name => {
    console.log('updateIncomes');
    this.setState({ personName: name });
  };

  changeIncomesHandler = incomes => {
    console.log('updateIncomes');
    this.setState({ personIncomes: incomes });
  };

  addPerson = () => {
    let notEmptyName = this.state.personName.trim().length > 0;
    let notEmptyIncomes = this.state.personIncomes.trim().length > 0;

    if (notEmptyName && notEmptyIncomes) {
      this.setState(
          prevState => {
            let { people, personName, personIncomes } = prevState;
            return {
              people: people.concat({ name: personName, incomes: personIncomes }),
              personName: "",
              personIncomes: ""
            };
          },
          () => People.save(this.state.people)
      );
    }
  };

  deletePerson = i => {
    this.setState(
        prevState => {
          let people = prevState.people.slice();
          people.splice(i, 1);
          return { people: people };
        },
        () => People.save(this.state.people)
    );
  };

  componentDidMount() {
    People.all(people => this.setState({ people: people || [] }));
  }

  renderSocial = () => {
    return (
        <Block flex style={styles.group}>
          <Block style={{ paddingHorizontal: theme.SIZES.BASE }}>
            <Block row center space="between">
              <Block flex middle right>
                <TouchableOpacity onPress={() => navigate('https://www.github.com/gregoirehebert')}>
                  <Button
                    round
                    onlyIcon
                    shadowless
                    icon="github"
                    iconFamily="font-awesome"
                    iconColor={theme.COLORS.WHITE}
                    iconSize={theme.SIZES.BASE * 1.625}
                    color={theme.COLORS.FACEBOOK}
                    style={[styles.social, styles.shadow]}
                  />
                </TouchableOpacity>
              </Block>
              <Block flex middle center>
                <TouchableOpacity onPress={() => navigate('https://www.twitter.com/gheb_dev')}>
                  <Button
                    round
                    onlyIcon
                    shadowless
                    icon="twitter"
                    iconFamily="font-awesome"
                    iconColor={theme.COLORS.WHITE}
                    iconSize={theme.SIZES.BASE * 1.625}
                    color={theme.COLORS.TWITTER}
                    style={[styles.social, styles.shadow]}
                  />
                </TouchableOpacity>
              </Block>
              <Block flex middle left>
                <TouchableOpacity onPress={() => navigate('https://knot.gheb.dev')}>
                  <Button
                      round
                      onlyIcon
                      shadowless
                      icon="link"
                      iconFamily="font-awesome"
                      iconColor={theme.COLORS.WHITE}
                      iconSize={theme.SIZES.BASE * 1.625}
                      color={theme.COLORS.DRIBBBLE}
                      style={[styles.social, styles.shadow]}
                  />
                </TouchableOpacity>
              </Block>
            </Block>
          </Block>
        </Block>
    )
  }

  renderItem = ({ item, index }) => {
    const {navigate} = this.props.navigation;

    switch((item.type)) {
      case 'inputName':
        return (
          <Block flex center style={styles.rows}>
            <Input
                right
                placeholder={item.title}
                value={this.state.personName}
                onChangeText={this.changeNameHandler}
                placeholderTextColor={materialTheme.COLORS.DEFAULT}
                style={ styles.input }
            />
          </Block>
        );
      case 'inputIncome':
        return (
          <Block flex center style={styles.rows}>
            <Input
                right
                value={this.state.personIncomes}
                placeholder={item.title}
                onChangeText={this.changeIncomesHandler}
                placeholderTextColor={materialTheme.COLORS.DEFAULT}
                style={ styles.input }
            />
          </Block>
        );
      case 'buttonAdd':
        return (
          <Block style={styles.rows}>
            <TouchableOpacity>
              <Button onPress={this.addPerson}>Add</Button>
            </TouchableOpacity>
          </Block>);
      default:
        break;
    }
  }

  render() {
    const addPeople = [
      { title: "Name", id: "name", type: "inputName" },
      { title: "Income", id: "income", type: "inputIncome" },
      { title: "Add", id: "addPeople", type: "buttonAdd" },
    ];

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        <FlatList
            data={this.state.people}
            renderItem={({item, index}) =>
                <Block flex center style={styles.rows}>
                  <TouchableOpacity>
                    <Block row middle space="between" style={{ paddingTop: 7 }}>
                      <Icon size={16} color={theme.COLORS.ICON} onPress={() => this.deletePerson(index)} name="trash" family="font-awesome" />
                      <Text bold size={18}> {item.name} {item.incomes}€</Text>
                    </Block>
                  </TouchableOpacity>
                </Block>
            }
            ListHeaderComponent={
              <Block style={styles.title}>
                <Text bold center size={theme.SIZES.BASE} style={{ paddingBottom: 5 }}>
                  Settings
                </Text>
                <Text center muted size={12}>
                  People and incomes
                </Text>
              </Block>
            }
        />
        <FlatList
          data={addPeople}
          keyExtractor={(item, index) => item.id}
          renderItem={this.renderItem}
          ListHeaderComponent={
            <Block style={styles.title}>
              <Text center muted size={12}>
                Add people
              </Text>
            </Block>
          }
        />
        <Block style={styles.title}>
          <Text center muted size={12}>
            Social
          </Text>
        </Block>
        { this.renderSocial() }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3,
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE*2,
  },
  input: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
  social: {
    width: theme.SIZES.BASE * 3.5,
    height: theme.SIZES.BASE * 3.5,
    borderRadius: theme.SIZES.BASE * 1.75,
    justifyContent: 'center',
  },
});
