import React from 'react';
import { ImageBackground, StyleSheet, StatusBar, Dimensions } from 'react-native';

import { Block, Text, Button } from '../components/';
import materialTheme from '../constants/Theme';
import Images from '../constants/Images';

const { height, width } = Dimensions.get('screen');

export default function Onboarding({ navigation }) {
  return (
    <Block flex style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Block flex center>
        <ImageBackground
          source={{ uri: Images.Onboarding }}
          style={{ height: height, width: width, marginTop: '-55%', zIndex: 1 }}
        />
      </Block>
      <Block flex space="between" style={styles.padded}>
        <Block flex space="around" style={{ zIndex: 2 }}>
          <Block>
            <Block>
              <Text color="white" size={60} center>Our Expenses</Text>
            </Block>
            <Block row center>
              <Text size={14} color='rgba(255,255,255,0.6)'>
                Repart your expenses
              </Text>
            </Block>
            <Block row center>
              <Text size={14} color='rgba(255,255,255,0.6)'>
                according to your incomes.
              </Text>
            </Block>
          </Block>
          <Block center>
            <Button
              style={styles.button}
              onPress={() => navigation.navigate('HomeDrawer')}>
              GET STARTED
            </Button>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  padded: {
    paddingHorizontal: materialTheme.SIZES.BASE * 2,
    position: 'relative',
    bottom: materialTheme.SIZES.BASE,
  },
  button: {
    width: width - materialTheme.SIZES.BASE * 4,
    height: materialTheme.SIZES.BASE * 3,
    backgroundColor: materialTheme.COLORS.BUTTON_COLOR,
  },
});
