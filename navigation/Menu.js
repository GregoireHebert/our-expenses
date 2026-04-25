import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

const { width } = Dimensions.get('screen');

export default function Menu(props) {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

export const drawerConfig = {
  drawerStyle: {
    backgroundColor: 'white',
    width: width * 0.8,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
