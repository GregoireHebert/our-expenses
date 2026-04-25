import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { Image, Platform, StatusBar, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

import AppContainer from './navigation/Screens';
import { Images } from './constants/';

SplashScreen.preventAutoHideAsync();

const assetImages = [Images.Onboarding];

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all(cacheImages(assetImages));
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
      {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
      <AppContainer />
    </View>
  );
}
