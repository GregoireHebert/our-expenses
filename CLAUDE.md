# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Our Expenses" (branded **ours.**) is a React Native (Expo SDK 54) iOS app that splits shared expenses between people proportionally based on their incomes. Uses a sage-green pastel design with Bricolage Grotesque + Geist typography.

## Development Commands

```bash
yarn start          # Start Expo dev server
yarn ios            # Run on iOS simulator
yarn test           # Run Jest tests (watch mode)
```

## Architecture

**Navigation**: Linear stack flow (no drawer) via `@react-navigation/stack` v7. Configured in `navigation/Screens.js`.

Route order: `Splash` → `Start` → `People` → `Expense`

**Screens** (`screens/`):
- `Splash.js` — Animated brand intro with floating expense chips and "ours." wordmark. Auto-advances after 2.4s.
- `Start.js` — Welcome screen with hero illustration and "Let's go" CTA.
- `Settings.js` — People management (add/remove people with incomes). Persists to AsyncStorage.
- `Home.js` — Expense calculator: big amount input + receipt-style split visualization.

**Data persistence** (`utils/db.js`): Callback-based AsyncStorage wrapper. Stores JSON array under `@people` key. Model: `{ name: string, incomes: number }`.

**Design system** (`constants/Theme.js`):
- `palette` — sage color tokens (bg, surface, ink, inkSoft, accent, line)
- `personColor(idx)` — 6-hue rotation for per-person colors (fill, deep, ink, soft)
- `fonts` — font family constants (display = Bricolage Grotesque, ui = Geist, mono = Geist Mono)
- `radii` / `space` / `tokens` — spacing and radius tokens

**Shared components** (`components/`):
- `PrimaryButton.js` — Full-width CTA with accent color and shadow
- `Avatar.js` — Colored initial avatar with per-person hue

**Fonts**: Loaded in `App.js` via `expo-font` + `@expo-google-fonts/*`. All screens reference font family names from `constants/Theme.fonts`.
