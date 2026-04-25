import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/Home';
import OnboardingScreen from '../screens/Onboarding';
import SettingsScreen from '../screens/Settings';

import Menu, { drawerConfig } from './Menu';
import Header from '../components/Header';
import { Drawer as DrawerItem } from '../components/';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ navigation }) => <Header title="Home" navigation={navigation} />,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: ({ navigation }) => <Header title="Settings" navigation={navigation} />,
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Onboarding"
        drawerContent={(props) => <Menu {...props} />}
        screenOptions={{
          ...drawerConfig,
          headerShown: false,
        }}
      >
        <Drawer.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="HomeDrawer"
          component={HomeStack}
          options={{
            drawerLabel: ({ focused }) => <DrawerItem focused={focused} title="Home" />,
          }}
        />
        <Drawer.Screen
          name="SettingsDrawer"
          component={SettingsStack}
          options={{
            drawerLabel: ({ focused }) => <DrawerItem focused={focused} title="Settings" />,
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
