import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Platform, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono/600SemiBold';

import AppNavigator from './navigation/Screens';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          BricolageGrotesque_700Bold,
          BricolageGrotesque_800ExtraBold,
          Geist_400Regular,
          Geist_500Medium,
          Geist_600SemiBold,
          GeistMono_400Regular,
          GeistMono_600SemiBold,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
      <AppNavigator />
    </View>
  );
}
