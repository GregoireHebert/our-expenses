import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, fonts } from '../constants/Theme';
import People from '../utils/db';

const { width, height } = Dimensions.get('screen');

const CHIPS = [
  { txt: 'pizza',      x: 0.08,  y: 0.14, r: -10, hue: 0, delay: 0 },
  { txt: 'rent',       x: 0.62,  y: 0.08, r: 7,   hue: 3, delay: 150 },
  { txt: 'groceries',  x: 0.05,  y: 0.70, r: 6,   hue: 2, delay: 300 },
  { txt: 'beers \u{1F37A}', x: 0.64, y: 0.78, r: -8, hue: 1, delay: 450 },
  { txt: 'uber',       x: 0.70,  y: 0.42, r: 12,  hue: 4, delay: 600 },
  { txt: 'wifi',       x: 0.04,  y: 0.42, r: -6,  hue: 5, delay: 750 },
];

const CHIP_FILLS = ['#ffc3b0', '#fbd094', '#b3e8b3', '#8ceaef', '#cbd2ff', '#ffc1ea'];
const CHIP_INKS  = ['#48160a', '#3f2100', '#06320c', '#003338', '#22224f', '#411635'];

function FloatingChip({ chip, index }) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bobY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        delay: chip.delay,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: chip.delay,
        useNativeDriver: true,
      }),
    ]);

    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, {
          toValue: -6,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    entrance.start(() => bob.start());
  }, []);

  return (
    <Animated.View style={[
      styles.chip,
      {
        left: chip.x * width,
        top: chip.y * height,
        backgroundColor: CHIP_FILLS[chip.hue],
        transform: [
          { rotate: `${chip.r}deg` },
          { scale },
          { translateY: bobY },
        ],
        opacity,
      },
    ]}>
      <Text style={[styles.chipText, { color: CHIP_INKS[chip.hue] }]}>
        {chip.txt}
      </Text>
    </Animated.View>
  );
}

export default function Splash({ navigation }) {
  const [target, setTarget] = useState(null);
  const [introDone, setIntroDone] = useState(false);
  const handedOver = useRef(false);
  const wordY = useRef(new Animated.Value(20)).current;
  const wordScale = useRef(new Animated.Value(0.92)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Wordmark entrance
    Animated.parallel([
      Animated.timing(wordY, {
        toValue: 0,
        duration: 900,
        delay: 300,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(wordScale, {
        toValue: 1,
        duration: 900,
        delay: 300,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(wordOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Dot pulse
    const dotPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.4, duration: 640, delay: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 1, duration: 640, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    dotPulse.start();

    // Auto-advance
    const timer = setTimeout(() => setIntroDone(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    People.all(loaded => setTarget((loaded || []).length >= 2 ? 'Expense' : 'Start'));
  }, []);

  useEffect(() => {
    if (!introDone || !target || handedOver.current) return;
    handedOver.current = true;
    navigation.replace(target);
  }, [introDone, target]);

  return (
    <TouchableWithoutFeedback onPress={() => setIntroDone(true)}>
      <View style={styles.container}>
        <LinearGradient
          colors={[palette.surface, palette.bg]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.35 }}
          end={{ x: 0.5, y: 1 }}
        />

        {CHIPS.map((chip, i) => (
          <FloatingChip key={i} chip={chip} index={i} />
        ))}

        <Animated.View style={[styles.wordmarkWrap, {
          opacity: wordOpacity,
          transform: [{ translateY: wordY }, { scale: wordScale }],
        }]}>
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>ours</Text>
            <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }] }]} />
          </View>
          <Text style={styles.tagline}>
            fair splits {'\u00B7'} for couples & roommates
          </Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    position: 'absolute',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
  },
  wordmarkWrap: {
    alignItems: 'center',
    zIndex: 2,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 92,
    lineHeight: 92,
    color: palette.ink,
    letterSpacing: -92 * 0.04,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.accent,
    marginLeft: 4,
    marginBottom: 14,
  },
  tagline: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 12 * 0.18,
    textTransform: 'uppercase',
    color: palette.inkSoft,
    marginTop: 20,
  },
});
