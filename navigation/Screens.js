import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/Splash';
import StartScreen from '../screens/Start';
import PeopleScreen from '../screens/Settings';
import ExpenseScreen from '../screens/Home';
import HistoryScreen from '../screens/History';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="People" component={PeopleScreen} />
        <Stack.Screen name="Expense" component={ExpenseScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
