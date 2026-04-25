import React from 'react';
import { Text as RNText } from 'react-native';

export default function Text({ size, color, bold, center, muted, style, children, ...rest }) {
  const textStyles = [
    size && { fontSize: size },
    color && { color },
    bold && { fontWeight: 'bold' },
    center && { textAlign: 'center' },
    muted && { color: '#9FA5AA' },
    style,
  ];

  return <RNText style={textStyles} {...rest}>{children}</RNText>;
}
