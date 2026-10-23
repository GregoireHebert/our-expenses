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

Route order: `Splash` → `Start` → `People` → `Expense`. `Splash` jumps straight to `Expense` when
two or more people are already stored. The `People` CTA resets the stack to `Expense`, so `Expense`
is the stack root: no back arrow, no swipe-back. Its header pill pushes `People` for editing.

The `People` back arrow follows the history when there is one. With none, it resets to `Expense`,
and it hides while fewer than two people are saved, since nothing is reachable yet.

`Expense` pushes `History`, which lists every saved expense.

**Screens** (`screens/`):
- `Splash.js` — Animated brand intro with floating expense chips and "ours." wordmark. Auto-advances after 2.4s, to `Expense` if people are stored, to `Start` otherwise.
- `Start.js` — Welcome screen with hero illustration and "Let's go" CTA.
- `Settings.js` — People management (add/remove people with incomes). Persists to AsyncStorage.
- `Home.js` — Expense calculator: big amount input, receipt-style split, a save button, and the
  most recent saved expenses. The recent list is capped to what fits: the screen measures its own
  height and the list's offset, then divides the leftover room by a fixed row height. A receipt
  tall enough to fill the screen leaves no rows, which is intended.
- `History.js` — Every saved expense, newest first. Tapping a row selects it, and the one delete
  button arms on the first tap and commits on the second. There is no single-tap removal
  anywhere: one, several or all go through that same armed button.

**Data persistence**: Callback-based AsyncStorage wrappers, one store per key, same shape
(`all(callback)` / `save(list)`).
- `utils/db.js` — people under `@people`. Model: `{ name: string, incomes: number }`.
- `utils/expenses.js` — saved expenses under `@expenses`, newest first. Model:
  `{ id, label, amount, savedAt, split: [{ name, owes, pct }] }`. The split is a snapshot, so an
  expense keeps what each person owed even after incomes change.
- `utils/format.js` — `shortDate` and `fullDate`, shared by the two lists.

**Design system** (`constants/Theme.js`):
- `palette` — sage color tokens (bg, surface, ink, inkSoft, accent, line)
- `personColor(idx)` — 6-hue rotation for per-person colors (fill, deep, ink, soft)
- `fonts` — font family constants (display = Bricolage Grotesque, ui = Geist, mono = Geist Mono)
- `radii` / `space` / `tokens` — spacing and radius tokens, plus `danger` for destructive actions

**Shared components** (`components/`):
- `PrimaryButton.js` — Full-width CTA with accent color and shadow
- `Avatar.js` — Colored initial avatar with per-person hue
- `TextField.js` — `TextInput` that draws its own placeholder, because iOS squeezes the native one
  into overlapping letters when the input carries a custom `fontFamily`. Use it for every input with
  a placeholder.

**Fonts**: Loaded in `App.js` via `expo-font` + `@expo-google-fonts/*`. All screens reference font family names from `constants/Theme.fonts`.
