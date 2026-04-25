import React from 'react';
import { StyleSheet } from 'react-native';

import Block from './Block';
import Text from './Text';
import Icon from './Icon';
import materialTheme from '../constants/Theme';

export default function DrawerItem({ focused, title }) {
  const renderIcon = () => {
    switch (title) {
      case 'Home':
        return (
          <Icon
            size={16}
            name="shop"
            family="GalioExtra"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      case 'Settings':
        return (
          <Icon
            size={16}
            name="gears"
            family="font-awesome"
            color={focused ? 'white' : materialTheme.COLORS.MUTED}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Block flex row style={[styles.defaultStyle, focused ? [styles.activeStyle, styles.shadow] : null]}>
      <Block middle flex={0.1} style={{ marginRight: 28 }}>
        {renderIcon()}
      </Block>
      <Block row center flex={0.9}>
        <Text size={18} color={focused ? 'white' : 'black'}>
          {title}
        </Text>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  activeStyle: {
    backgroundColor: materialTheme.COLORS.ACTIVE,
    borderRadius: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
  },
});
