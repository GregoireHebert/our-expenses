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
- `Settings.js` — People management (add/remove/edit people with incomes), capped at `MAX_PEOPLE`.
  Removing someone swaps the row into a confirm state built like the inline edit state, red ✓ to
  go through with it and × to back out, so no single tap drops a person. It rewrites `@people`
  only: this screen never touches the expense store, and saved receipts carry their own split.
  The add form sits above the list, and at the cap it gives way to a note instead of a dead form.
  Persists to AsyncStorage.
- `Home.js` — Expense calculator: big amount input, receipt-style split, a save button, and the
  most recent saved expenses. The recent list is capped to what fits: the screen measures its own
  height and the list's offset, then divides the leftover room by a fixed row height. A receipt
  tall enough to fill the screen leaves no rows, which is intended. The screen never asks the store
  for more than `RECENT_PAGE` rows, since no phone can show more.
- `History.js` — Saved expenses, newest first, in a `FlatList` holding at most `WINDOW` rows. It
  pages forward when the list runs out and backward when you return to the top, dropping the far
  side each time, so memory stays flat however far you scroll. `maintainVisibleContentPosition`
  keeps the rows under your thumb still while the window slides.
  Tapping a row selects it, and the one delete button arms on the first tap and commits on the
  second. There is no single-tap removal anywhere: one, several or all go through that same armed
  button. A selection is a list of ids, never a flag on a row, so it survives both the window
  dropping a row and leaving the screen; `session` at the top of the file holds it until it is
  cleared, deleted, or the app restarts.
  `Select all` means the whole history rather than the loaded rows, and unticking a row under it
  records an exclusion instead of collapsing the selection to what is on screen, which keeps the
  counter honest about pages nobody has scrolled to.
  A row has two targets: the checkbox selects, the rest opens the receipt. Opening measures the
  row with `measureInWindow` and grows a card from that frame to `OPEN_FRAME`, cross-fading the
  row's own text out and the receipt in; closing runs it backwards and unmounts on arrival.
  Position and size have no native-driver equivalent, so the animation runs in JS; moving it to
  Reanimated would put it on the UI thread at the cost of a native rebuild. Paging is suspended
  while a card is open, so the row cannot slide out from under the frame it has to return to.

**Data persistence**: Callback-based AsyncStorage wrappers, one module per concern.
- `utils/db.js` — people under `@people`. Model: `{ name: string, incomes: number }`.
- `utils/expenses.js` — one record per key, `@expense:<id>`, plus `@expenses:index`, an array of
  `{ id, amount }` newest first. Model: `{ id, label, amount, savedAt, split: [{ name, owes, pct }] }`.
  The split is a snapshot, so an expense keeps what each person owed even after incomes change.
  Reading a page parses the index and that page's records only, so opening a screen costs the
  same whether five expenses are stored or five thousand; `stats()` reads the index alone, which
  is why the count and total never touch a record. `page(cursor, limit, cb)` walks the index from
  the entry after `cursor`, `pageBefore` the entries before it. `keepOnly(ids)` deletes everything
  else without reading a record, which is how `Select all` minus a few commits. `clear()` sweeps
  every `@expense:` key rather than the index, so a record the index lost track of goes too.
  A history written as one `@expenses` array migrates on first read.
- `utils/format.js` — `shortDate` and `fullDate`, shared by the two lists.

**Design system** (`constants/Theme.js`):
- `palette` — sage color tokens (bg, surface, ink, inkSoft, accent, line)
- `personColor(idx)` — 6-hue rotation for per-person colors (fill, deep, ink, soft)
- `fonts` — font family constants (display = Bricolage Grotesque, ui = Geist, mono = Geist Mono)
- `radii` / `space` / `tokens` — spacing and radius tokens, plus `danger` for destructive actions

**Shared components** (`components/`):
- `PrimaryButton.js` — Full-width CTA with accent color and shadow
- `Avatar.js` — Colored initial avatar with per-person hue
- `Receipt.js` — the receipt block. The expense screen draws it live, history replays it from a
  saved snapshot, so both read from one source. Rows need `{ name, pct, owes, idx }`.
- `TextField.js` — `TextInput` that draws its own placeholder, because iOS squeezes the native one
  into overlapping letters when the input carries a custom `fontFamily`. Use it for every input with
  a placeholder.

**Fonts**: Loaded in `App.js` via `expo-font` + `@expo-google-fonts/*`. All screens reference font family names from `constants/Theme.fonts`.
