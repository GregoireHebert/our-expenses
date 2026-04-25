import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from './Text';
import Icon from './Icon';
import materialTheme from '../constants/Theme';

export default function Header({ back, title, white, transparent, navigation }) {
  const insets = useSafeAreaInsets();

  const handleLeftPress = () => {
    return back ? navigation.goBack() : navigation.openDrawer();
  };

  const headerStyles = [
    styles.container,
    transparent ? { backgroundColor: 'rgba(0,0,0,0)' } : styles.shadow,
  ];

  return (
    <View style={headerStyles}>
      <View style={[styles.navbar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.leftButton} onPress={handleLeftPress}>
          <Icon
            name={back ? 'chevron-left' : 'navicon'}
            family="font-awesome"
            size={back ? 16 : 20}
            color={white ? '#fff' : materialTheme.COLORS.ICON}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            bold
            size={16}
            color={white ? '#fff' : materialTheme.COLORS.ICON}
          >
            {title}
          </Text>
        </View>
        <View style={styles.rightButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: materialTheme.SIZES.BASE * 1.5,
    paddingHorizontal: materialTheme.SIZES.BASE,
    zIndex: 5,
  },
  leftButton: {
    flex: 0.3,
    paddingTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  rightButton: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  shadow: {
    backgroundColor: '#fff',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
});
