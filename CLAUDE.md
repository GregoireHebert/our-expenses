# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Our Expenses" is a React Native (Expo SDK 52) iOS app that splits shared expenses between people proportionally based on their income.

## Development Commands

```bash
npm start            # Start Expo dev server
npm run ios          # Run on iOS simulator
npm test             # Run Jest tests (watch mode)
```

## Architecture

**Navigation**: React Navigation v7 with a drawer navigator wrapping stack navigators. Configured in `navigation/Screens.js`, custom drawer content in `navigation/Menu.js`.

**Screens** (`screens/`): All functional components with hooks.
- `Onboarding.js` - Welcome/splash screen, entry point
- `Home.js` - Main calculator: displays income-ratio percentages and computes each person's share of an expense
- `Settings.js` - CRUD for people (name + income), persisted to AsyncStorage. Social links use `Linking.openURL()`.

**Data persistence** (`utils/db.js`): Thin callback-based wrapper around AsyncStorage. Stores a JSON array of people objects under the `@people` key. Data model: `{ name: string, incomes: number, repartition: number, value: number }`.

**UI layer**: Thin local wrapper components in `components/` (`Block`, `Text`, `Input`, `Button`, `Icon`, `Header`, `Drawer`) replacing the former galio-framework dependency. These wrap standard React Native primitives with convenience props (e.g., `Block` accepts `flex`, `row`, `center`, `middle`, `space`). Material Design color theme defined in `constants/Theme.js`.

**State management**: Local component state via `useState` hooks. No global store.

## Key Conventions

- Components and screens use PascalCase filenames and are functional components
- `Block` (in `components/Block.js`) is the primary layout container — a thin `View` wrapper with flex shorthand props
- Colors and sizes come from `constants/Theme.js` (`materialTheme.COLORS`, `materialTheme.SIZES`)
- Icons use `@expo/vector-icons` (FontAwesome) + a custom GalioExtra icon font for the "shop" icon
- `babel.config.js` must keep `react-native-reanimated/plugin` as the last plugin (required by drawer navigation)
- iOS bundle identifier: `com.gheb.ourexpenses`
