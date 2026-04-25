// Sage palette — oklch values converted to hex
export const palette = {
  bg:        '#e9f6e9',
  surface:   '#f7fef7',
  ink:       '#121e12',
  inkSoft:   '#4c5d4c',
  accent:    '#10ae65',
  accentInk: '#042107',
  line:      '#cfdccf',
};

// Derived tokens
export const tokens = {
  disabledBg: '#d3ccc7',
  disabledFg: '#76706c',
  receiptBg:  '#fffbf4',
  accentShadow: '#007c36',
  accentShadowLight: 'rgba(0,124,54,0.35)',
};

// Per-person palette — 6 hues cycling by index
const PERSON_COLORS = [
  { fill: '#ffc3b0', deep: '#bc4527', ink: '#48160a', soft: '#ffe6dd' }, // hue 35  warm
  { fill: '#fbd094', deep: '#a65f00', ink: '#3f2100', soft: '#ffebd2' }, // hue 75  gold
  { fill: '#b3e8b3', deep: '#1c882d', ink: '#06320c', soft: '#dff6de' }, // hue 145 green
  { fill: '#8ceaef', deep: '#008a96', ink: '#003338', soft: '#d0f7f9' }, // hue 200 teal
  { fill: '#cbd2ff', deep: '#6262cc', ink: '#22224f', soft: '#e9ecff' }, // hue 280 purple
  { fill: '#ffc1ea', deep: '#ab448e', ink: '#411635', soft: '#ffe5f7' }, // hue 340 pink
];

export const personColor = (idx) => PERSON_COLORS[idx % PERSON_COLORS.length];

// Typography
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_800ExtraBold',
  displaySemiBold: 'BricolageGrotesque_700Bold',
  ui: 'Geist_400Regular',
  uiMedium: 'Geist_500Medium',
  uiSemiBold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoSemiBold: 'GeistMono_600SemiBold',
};

// Radii
export const radii = {
  pill: 999,
  card: 28,
  cardMedium: 22,
  input: 14,
  chipSmall: 6,
};

// Spacing ramp
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 40,
  huge: 60,
};

// Legacy compat — keep SIZES.BASE for constants/utils.js
const SIZES = { BASE: 16 };
const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  MUTED: palette.inkSoft,
  ICON: palette.ink,
  TRANSPARENT: 'transparent',
  DEFAULT: palette.line,
  PRIMARY: palette.accent,
  LABEL: palette.accent,
  INFO: '#008a96',
  ERROR: '#bc4527',
  SUCCESS: palette.accent,
  WARNING: '#a65f00',
  INPUT: palette.line,
  ACTIVE: palette.accent,
  BUTTON_COLOR: palette.accent,
  PLACEHOLDER: palette.inkSoft,
};

export default { COLORS, SIZES };
