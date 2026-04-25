import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { palette, fonts, personColor } from '../constants/Theme';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('screen');

function MiniWordmark() {
  return (
    <View style={styles.miniRow}>
      <Text style={styles.miniText}>ours</Text>
      <View style={styles.miniDot} />
    </View>
  );
}

function HeroIllustration() {
  const people = [
    { name: 'Mo',  idx: 0, offsetX: -70, offsetY: 0,   size: 110, rotate: '-8deg', pct: '40%' },
    { name: 'Sky', idx: 1, offsetX: 30,  offsetY: -10, size: 130, rotate: '6deg',  pct: '60%' },
  ];

  return (
    <View style={styles.hero}>
      {people.map((p) => {
        const c = personColor(p.idx);
        return (
          <View key={p.name} style={[styles.heroCircle, {
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: c.fill,
            transform: [
              { translateX: p.offsetX },
              { translateY: p.offsetY },
              { rotate: p.rotate },
            ],
          }]}>
            <Text style={[styles.heroName, { color: c.ink }]}>{p.name}</Text>
            <Text style={[styles.heroPct, { color: c.ink }]}>{p.pct}</Text>
          </View>
        );
      })}
      <View style={styles.divideCircle}>
        <Text style={styles.divideSymbol}>{'\u00F7'}</Text>
      </View>
    </View>
  );
}

export default function Start({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Decorative blob */}
      <View style={styles.blob} />

      <MiniWordmark />

      <HeroIllustration />

      <View style={styles.copyBlock}>
        <Text style={styles.headline}>
          Split bills the{' '}
          <Text style={styles.headlineFair}>fair</Text>
          {' '}way.
        </Text>
        <Text style={styles.subCopy}>
          Each person pays in proportion to what they earn — no spreadsheets, no awkward maths.
        </Text>
      </View>

      <View style={styles.ctaBlock}>
        <PrimaryButton onPress={() => navigation.navigate('People')}>
          Let's go {'\u2192'}
        </PrimaryButton>
        <Text style={styles.footnote}>takes about 30 seconds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  blob: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: palette.accent + '33',
    opacity: 0.5,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  miniText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: palette.ink,
    letterSpacing: -22 * 0.03,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
    marginLeft: 2,
    marginBottom: 5,
  },
  hero: {
    height: 200,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 36,
    lineHeight: 40,
  },
  heroPct: {
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
    letterSpacing: 11 * 0.05,
  },
  divideCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.surface,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  divideSymbol: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: palette.ink,
  },
  copyBlock: {
    flex: 1,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 46,
    color: palette.ink,
    letterSpacing: -46 * 0.035,
    marginBottom: 18,
  },
  headlineFair: {
    fontStyle: 'italic',
  },
  subCopy: {
    fontFamily: fonts.ui,
    fontSize: 17,
    lineHeight: 17 * 1.45,
    color: palette.inkSoft,
    maxWidth: 320,
  },
  ctaBlock: {
    marginTop: 'auto',
  },
  footnote: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 11 * 0.14,
    textTransform: 'uppercase',
    color: palette.inkSoft,
    textAlign: 'center',
    marginTop: 14,
  },
});
