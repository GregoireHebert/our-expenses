import React, { useState, useEffect } from 'react';
import * as Font from 'expo-font';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import GalioConfig from '../assets/fonts/galioExtra';

const GalioExtra = require('../assets/fonts/galioExtra.ttf');
const IconGalioExtra = createIconSetFromIcoMoon(GalioConfig, 'GalioExtra');

export default function IconExtra({ name, family, ...rest }) {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({ GalioExtra: GalioExtra }).then(() => setFontLoaded(true));
  }, []);

  if (!name || !family) return null;

  if (family === 'GalioExtra' && fontLoaded) {
    return <IconGalioExtra name={name} {...rest} />;
  }

  if (family === 'font-awesome') {
    return <FontAwesome name={name} {...rest} />;
  }

  return null;
}
