import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { palette } from '../constants/Theme';

const MARGINS = [
  'margin', 'marginTop', 'marginBottom', 'marginLeft',
  'marginRight', 'marginHorizontal', 'marginVertical',
];

// iOS tightens a TextInput's native placeholder until its letters overlap as soon as the input
// carries a custom fontFamily, which eats the spaces. Drawing the placeholder as a Text layer
// keeps the font and the spacing. Margins move to the wrapper so the layer covers the input box
// alone, and not the gap below it.
const TextField = forwardRef(function TextField(
  { style, placeholder, placeholderTextColor, value, ...props },
  ref
) {
  const flat = StyleSheet.flatten(style) || {};
  const outer = {};
  const inner = { ...flat };
  for (const key of MARGINS) {
    if (inner[key] !== undefined) {
      outer[key] = inner[key];
      delete inner[key];
    }
  }

  const padLeft = (flat.paddingLeft ?? flat.paddingHorizontal ?? 0)
    + (flat.borderLeftWidth ?? flat.borderWidth ?? 0);
  const padRight = (flat.paddingRight ?? flat.paddingHorizontal ?? 0)
    + (flat.borderRightWidth ?? flat.borderWidth ?? 0);

  return (
    <View style={outer}>
      <TextInput ref={ref} value={value} style={inner} {...props} />
      {placeholder && !value ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.layer,
            { paddingLeft: padLeft, paddingRight: padRight },
          ]}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: flat.fontFamily,
              fontSize: flat.fontSize,
              letterSpacing: flat.letterSpacing,
              color: placeholderTextColor || palette.inkSoft,
            }}
          >
            {placeholder}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  layer: {
    justifyContent: 'center',
  },
});

export default TextField;
