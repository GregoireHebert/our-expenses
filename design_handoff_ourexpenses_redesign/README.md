# Handoff: OurExpenses — playful pastel redesign

## Overview

A redesign of **OurExpenses**, a React Native (Expo SDK 52) iOS app that splits shared expenses between people proportionally based on their incomes. The redesign covers all four screens (Splash, Start, People/Settings, Expense/Home) with a warm, playful, soft-pastel direction — chunky type, rounded shapes, generous spacing, per-person pastel chips, and a single coral/sage accent.

The current app uses a dark splash + green Material Design accent and minimal UI chrome. The new direction is light + sage, with `Bricolage Grotesque` for chunky display type and `Geist` (and `Geist Mono`) for UI/labels.

A new wordmark — **`ours.`** (lowercase, with period and a colored dot) — is used in place of "Our Expenses" inside the product. The full name can stay as the App Store name.

## About the Design Files

The files inside `prototype/` are **design references created in HTML** — a clickable React-in-the-browser prototype showing intended look and behavior. They are **not production code to copy directly**.

Your task is to **recreate these designs in the existing React Native / Expo codebase** at the project root, using the project's established conventions:

- Functional components with hooks
- The `components/` wrapper layer (`Block`, `Text`, `Input`, `Button`, `Icon`) — extend or replace as needed
- `react-navigation/drawer` + `stack` (already wired in `navigation/Screens.js`)
- AsyncStorage via `utils/db.js` for persisting people
- Theme tokens in `constants/Theme.js` (currently Material; this redesign replaces them — see Design Tokens below)

If a feature shown in the prototype doesn't already exist in `screens/`, add it; if a screen exists with a different shape (e.g. `Home.js` is the expense screen), refactor it to match.

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interactions are all decided. Recreate pixel-perfectly using React Native primitives and your existing wrapper components. Substitute fonts (Bricolage Grotesque + Geist) via `expo-font` or `@expo-google-fonts/*`.

## Screens / Views

The product has 4 screens. Names in parentheses match the existing screen file names where applicable. 4 screenshot of the design has been put in the screenshots directory for reference.

---

### 1. Splash (`screens/Onboarding.js` — first half)

**Purpose:** Brand intro on app launch. Auto-advances to Start after ~2.4s (or on tap).

**Layout:**
- Full-bleed pastel-gradient background (radial: surface center → bg edge)
- Centered wordmark + tagline
- 6 floating "expense" pill-chips scattered around the wordmark, each with a different pastel hue, slight rotation, and bobbing animation

**Components:**

- **Floating chips** (6 total): pill-shaped, `padding: 8px 14px`, `borderRadius: 999`, font `Geist 14/600`. Each has a unique hue from `[35, 75, 145, 200, 280, 340]` rendered at `oklch(0.88 0.09 H)` fill, `oklch(0.28 0.08 H)` text, with `inset 0 -2px 0 0 oklch(0.55 0.16 H / 0.2)` lower lip.
  - Labels: `pizza`, `rent`, `groceries`, `beers 🍺`, `uber`, `wifi`
  - Animation: scale-in-with-overshoot entrance (`cubic-bezier(0.34, 1.56, 0.64, 1)`, 0.7s, staggered 150ms), then infinite 3s `translateY(-6px)` bob.

- **Wordmark:** `Bricolage Grotesque 92/800`, color `palette.ink`, letter-spacing `-0.04em`. Text `ours` followed by a 16×16 circle in `palette.accent` (the sage green) with a pulsing scale animation (1 → 1.4 → 1 every 1.6s).

- **Tagline:** `Geist Mono 12`, uppercase, letter-spacing `0.18em`, color `palette.inkSoft`. Text: `fair splits · for couples & roommates`.

---

### 2. Start (new screen — replaces nothing, add as first screen after splash)

**Purpose:** Welcome screen with hero illustration and a CTA into the People screen.

**Layout:** Vertical, padding `70px 28px 40px`. Top→bottom: mini wordmark, hero illustration, big headline + sub, primary CTA, footnote.

**Components:**

- **Mini wordmark:** Same construction as splash but `Bricolage Grotesque 22/800` with a 6×6 accent dot.

- **Decorative blob:** Absolute positioned at top-right, 320×320 circle filled with a radial gradient of `palette.accent + alpha 33` to transparent, blurred 8px.

- **Hero illustration** (200px tall):
  - Two overlapping pastel circles representing two demo people. Sizes 110 and 130, positioned `±70px` from center, rotated `±6°`. Each shows a name (`Bricolage Grotesque 36/700`) plus a percentage label (`Geist Mono 11`, opacity 0.7).
  - A 64×64 circle in the middle (z-index 2) with `border: 3px dashed palette.line`, containing a giant `÷` symbol (`Bricolage Grotesque 28/800`).

- **Headline:** `Bricolage Grotesque 46/800`, line-height 1.0, letter-spacing `-0.035em`. Text: **"Split bills the *fair* way."** — the word *fair* is italic with a horizontal highlight bar (linear-gradient with the accent color at 0.2 alpha across 8%–92% of the word).

- **Sub-copy:** `Geist 17/400/1.45`, color `palette.inkSoft`. Text: "Each person pays in proportion to what they earn — no spreadsheets, no awkward maths."

- **Primary CTA:** "Let's go →" (see PrimaryButton spec below)

- **Footnote:** `Geist Mono 11`, uppercase, letter-spacing `0.14em`. Text: "takes about 30 seconds"

---

### 3. People (`screens/Settings.js`)

**Purpose:** CRUD list of people with monthly incomes. Persist via `utils/db.js`.

**Layout:** Vertical, padding `60px 24px 28px`, scrollable. Top→bottom: header row (back / step indicator), title block, people list card, add-form card, primary CTA.

**Components:**

- **Header row:** 40×40 back button (rounded 14, surface bg, ink fg, `←` glyph) on the left; `Geist Mono 11` step indicator "step 1 of 2" centered.

- **Title block:**
  - H1: `Bricolage Grotesque 38/800/0.98`, letter-spacing `-0.035em`. Text: **"Who's in?"**
  - Sub: `Geist 15/400/1.4`, `palette.inkSoft`. Text: "Add everyone splitting the bills, plus what they earn each month."

- **People list card** (only when `people.length > 0`):
  - Container: `palette.surface` bg, `1.5px solid palette.line`, `borderRadius: 22`, padding 6.
  - Each row: padding `12px 12px`, `1px dashed palette.line` separator (last row none).
    - **Avatar** (44×44): rounded square (radius 14) for most, full circle for `idx % 5 === 0`. Background `oklch(0.88 0.09 H)` where H comes from `[35, 75, 145, 200, 280, 340][idx % 6]`. Initial in `Bricolage Grotesque 700`, sized `44 × 0.46`. Inset bottom shadow `inset 0 -3px 0 0 deepHue/0.2`.
    - **Name:** `Bricolage Grotesque 19/700`, `palette.ink`, ellipsis if too long.
    - **Income line:** `Geist Mono 12`, `palette.inkSoft`. Format: `{income.toLocaleString()}€/mo` followed by a `{percentage}%` chip in `softHue` bg + `inkHue` text, padding `2px 7px`, radius 6, weight 600.
    - **Remove button:** `×` glyph, transparent bg, `palette.inkSoft`, padding 8.
  - Empty state: dashed border card, centered text "No-one yet. Add your first person below 👇"

- **Add form card:**
  - Container: same as list card but always shown.
  - Mono label: "add someone"
  - **Name input:** `Geist 16`, padding `14px 16px`, border `1.5px solid palette.line`, radius 14, bg `palette.bg`. Focus border switches to `palette.accent`.
  - **Income input:** Same input, with `padding-right: 36px` to make room for a euro suffix. **Suffix is positioned absolutely on the RIGHT** (not left): `right: 16px`, `top: 0; bottom: 0`, flex-aligned center. Glyph `€` in `Bricolage Grotesque 18/700`, `palette.inkSoft`, `pointerEvents: none`.
  - **Add button:** Full width, `palette.ink` bg, white text, `Geist 15/600`, padding 13, radius 14. Disabled state: bg `oklch(0.85 0.01 60)`, fg `oklch(0.55 0.01 60)`. Text: "+ Add to the gang"

- **Primary CTA (bottom):** Text: `Continue with {n} →` when `people.length >= 2`, else disabled with "Add at least 2 people".

---

### 4. Expense (`screens/Home.js`)

**Purpose:** Enter an amount; show how much each person owes (proportional to income).

**Layout:** Vertical, padding `60px 24px 28px`, scrollable. Top→bottom: header row, expense input card, split-visualization card.

**Components:**

- **Header row:**
  - Back button: same as People screen.
  - **People pill** (right side): `palette.surface` bg, padding `8px 14px`, radius 14. Inside: an avatar stack (first 3 people, 18×18 circles with 2px surface ring, overlapping by -6px), then text "{N} people" in `Geist 13/600`. Tapping opens the People screen.

- **Expense input card:**
  - Container: `palette.surface` bg, `1.5px solid palette.line`, radius 28, padding `20px 22px`.
  - Mono label: "this expense"
  - **Label input:** transparent borderless input, `Geist 16/500`. Placeholder "What was it?"
  - **Amount row:** flex baseline. `<input>` first (flex 1), `<span>` after with `€`. Input: `Bricolage Grotesque 64/800`, letter-spacing `-0.04em`, color `palette.ink`. Placeholder: "0". Suffix: `Bricolage Grotesque 56/800`, opacity 0.4 when amount is 0, full opacity otherwise. Input strips non-numeric characters: `value.replace(/[^\d.,]/g, '')`. Display amount uses `parseFloat(amount.replace(',', '.'))`.

- **Split card:**
  - Container: same as expense card.
  - Header: H2 "Each pays" (`Bricolage Grotesque 22/700`) + mono label showing current viz mode on the right.
  - **Viz mode `receipt`** (default — primary direction):
    - Container styled like a paper receipt: `Geist Mono 13`, bg `oklch(0.99 0.01 80)`, `1px dashed palette.line` border, radius 14, padding `16px 18px`.
    - Centered title: "OURS · RECEIPT" (`Geist Mono 14/600`)
    - Sub: italic-feeling label e.g. `untitled expense` or the typed label, opacity 0.6, size 11.
    - Dashed-border-top + dashed-border-bottom block listing each person:
      - Left: 8×8 colored square (4px radius, person's hue) + name + ` ×{pct.toFixed(1)}%` in opacity 0.55.
      - Right: `{owes.toFixed(2)}€` in weight 600.
    - Total row: `TOTAL` left, `{num.toFixed(2)}€` right, both weight 700, size 14.
    - Footer (centered, opacity 0.5, size 10, letter-spacing `0.1em`): `★ thanks for splitting fairly ★`
  - **Other viz modes (alternative — keep wired up via Tweak control or remove for v1):**
    - `cards`: large pastel cards per person with avatar + name + percentage + amount.
    - `bar`: stacked horizontal bar (height 56) where each segment's flex equals the person's ratio, label `{pct}%` centered, plus a swatch+name+amount legend below.
    - `donut`: 200px SVG donut with arcs colored per person, total amount in the center, labeled legend.

## Interactions & Behavior

- **Splash → Start:** auto-advance after 2.4s. Optionally tap-to-skip.
- **Start → People:** tap CTA.
- **People:** if `people.length < 2`, the Continue CTA is disabled. From Home/Expense, the people pill in the header navigates back to People.
- **Add person:** disabled until both name and a non-zero income are present. On submit, append to people, persist via `People.save()`, clear inputs, refocus the name field.
- **Remove person:** tap `×` on a row, filter list, persist.
- **Expense amount:** as the user types, every person's `owes` recomputes live as `amount × (income / totalIncome)`. Format with 2 decimals.
- **Animations:**
  - Splash chips: 0.7s overshoot scale-in (cubic-bezier 0.34, 1.56, 0.64, 1), staggered 150ms each.
  - Splash chips bob: 3s ease-in-out infinite, ±6px Y.
  - Splash wordmark: 0.9s overshoot translateY+scale-in, 0.3s delay.
  - Splash dot: 1.6s pulse, scale 1 → 1.4 → 1.
  - Buttons: pressing translates Y +3px and reduces shadow proportionally.

## State Management

Local component state via `useState`. No global store. `People.all()` and `People.save()` from `utils/db.js`. The redesigned People screen reads on mount, writes on every add/remove. The Expense screen reads on focus (`useFocusEffect`).

## Design Tokens

Replace `constants/Theme.js` with the new palette. The prototype defines three palettes (`coral`, `plum`, `sage`) — **`sage` is the chosen direction** for the launch redesign.

### Sage palette (default)

```js
export const palette = {
  bg:      'oklch(0.96 0.022 145)',  // page background
  surface: 'oklch(0.99 0.011 145)',  // cards
  ink:     'oklch(0.22 0.03 145)',   // primary text
  inkSoft: 'oklch(0.46 0.035 145)',  // secondary text
  accent:  'oklch(0.66 0.16 155)',   // CTAs, dot, highlights
  accentInk:'oklch(0.22 0.06 145)',
  line:    'oklch(0.88 0.022 145)',  // dividers, borders
};
```

### Per-person palette

6 hues at fixed L=0.88 / C=0.09 (or 0.95 / 0.04 for "soft", or 0.55 / 0.16 for "deep", or 0.28 / 0.08 for "ink"). Cycle through by index.

```js
const PERSON_HUES = [35, 75, 145, 200, 280, 340];
const personColor = (i) => {
  const h = PERSON_HUES[i % 6];
  return {
    fill: `oklch(0.88 0.09 ${h})`,
    deep: `oklch(0.55 0.16 ${h})`,
    ink:  `oklch(0.28 0.08 ${h})`,
    soft: `oklch(0.95 0.04 ${h})`,
  };
};
```

> **React Native note:** `oklch()` is not natively supported. Convert each token to hex/rgba at build time (e.g. via the `culori` package, or by hardcoding values produced by an `oklch → hex` step) and store them in `constants/Theme.js`.

### Typography

| Role        | Font                  | Sizes used         |
|-------------|-----------------------|--------------------|
| Display     | Bricolage Grotesque   | 92 / 64 / 56 / 46 / 38 / 22 / 19 / 18 |
| UI text     | Geist                 | 17 / 16 / 15 / 14 / 13 |
| Mono labels | Geist Mono            | 13 / 12 / 11 / 10 |

Both are on Google Fonts. In Expo: `expo install @expo-google-fonts/bricolage-grotesque @expo-google-fonts/geist @expo-google-fonts/geist-mono` (or load via `expo-font`).

### Radii

- Pills: 999
- Cards / large surfaces: 28
- Inputs / medium cards: 22 / 18 / 14
- Small chips: 6

### Spacing

Standard 4-step ramp: 4 / 8 / 12 / 14 / 18 / 22 / 28 / 40 / 60.

### Shadows

- Card lower-lip: `inset 0 -2px 0 0 palette.line` (translates to `border-bottom-width` + a subtle tint in RN, or skip).
- Avatar lower-lip: `inset 0 -3px 0 0 personDeep@33`
- Primary button: drop shadow `0 6px 0 0 accentDeep, 0 12px 24px -8px accentDeep@35`

> **React Native note:** Inset shadows aren't supported. Approximate with `borderBottomWidth: 2` on a slightly darker variant, or skip — they're a polish detail.

## Assets

No external image assets are used. Existing assets in `assets/images/` and `assets/icons/` (the succulent splash photo, etc.) can be **removed** — the redesign is fully type- and shape-driven.

Emoji used in the splash chips: 🍺. Optional. RN renders system emoji.

## Files in this handoff

- `prototype/index.html` — entry HTML loading React + the JSX modules
- `prototype/screens.jsx` — all four screen components + split-viz components + shared `Avatar`, `PrimaryButton`, `Chip`, color tokens
- `prototype/app.jsx` — top-level router + Tweaks panel wiring
- `prototype/ios-frame.jsx` — iPhone bezel used to preview the design (not part of the deliverable)
- `prototype/tweaks-panel.jsx` — in-prototype tweak controls (not part of the deliverable)

## Open the prototype locally

```bash
cd design_handoff_ourexpenses_redesign/prototype
python3 -m http.server 8000
# open http://localhost:8000
```

## Suggested implementation order

1. Replace `constants/Theme.js` tokens (convert `oklch` → hex), wire up Bricolage Grotesque + Geist + Geist Mono via `@expo-google-fonts/*`.
2. Build a `PrimaryButton` and `Avatar` in `components/` to match the new visual style.
3. Refactor `screens/Onboarding.js` into the new Splash (animated chips + wordmark).
4. Add the new Start screen as the second route (or merge into Onboarding with a 2-step flow).
5. Refactor `screens/Settings.js` (People): new list card, avatar+pct chip, add form with right-aligned `€` suffix.
6. Refactor `screens/Home.js` (Expense): big amount input with `€` suffix, receipt-style split.
7. Optional: ship the alternate viz modes (cards/bar/donut) behind a settings toggle.

## Things deliberately removed (vs. current app)

- Drawer / hamburger menu — not present in the redesign. Navigation is linear (Splash → Start → People → Expense), with a "people" pill in the Expense header for jumping back.
- "Force Update Repartition" button — no longer needed; computation is reactive.
- Material Design green and gradient purple tokens — replaced by the sage palette.
- Dark splash photo — replaced by the type+chips composition.

## Things intentionally deferred (per design feedback)

- Quick-add expense presets (rent, groceries, etc.) — designed but pulled.
- "Mark as paid" CTA on the Expense screen — designed but pulled.

Both can be re-introduced later; the layouts already accommodate them.
