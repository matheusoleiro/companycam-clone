# CompanyCam Design System

**Version:** 1.0  
**Last Updated:** 2026-10-27  
**Aesthetic:** Professional + Construction-Focused Minimalism

## Design Philosophy

CompanyCam is a tool for documenting construction projects professionally and efficiently. Every design decision serves one purpose: **make documentation fast, clear, and trustworthy**.

- **No fluff.** Every element has a job.
- **Construction-inspired.** Warm, honest, dependable.
- **System-first.** Consistency through tokens, not one-off styling.

---

## Color Palette

### Primary: Stone (Warm Neutrals)
A warm gray foundation inspired by concrete and natural stone—professional yet inviting.

```
stone-50   → Body background (lightest)
stone-100  → Surface, cards
stone-200  → Subtle borders
stone-300-600 → Mid-tone text & dividers
stone-700  → Secondary text
stone-800-900 → Primary text (darkest)
```

### Accent: Construction Orange
A warm, saturated orange signifying action, urgency, and trust. Used for:
- Primary buttons
- Focus states
- Critical interactions

```
accent-light  → Hover states
accent-main   → Default buttons, focus rings
accent-dark   → Active, pressed states
```

### Semantic Colors
- **Success** → oklch(0.70 0.15 150) – Green for confirmations
- **Danger** → oklch(0.65 0.18 25) – Red for destructive actions
- **Warning** → oklch(0.75 0.16 60) – Yellow for cautions
- **Info** → oklch(0.70 0.15 240) – Blue for informational content

---

## Typography

### Display Font: **Syne**
Bold, geometric, modern. Used for:
- Page headings (h1–h3)
- Section titles
- Label callouts
- Navigation labels

**Weight:** 600–800  
**Letter Spacing:** Tight (–0.02em)  
**Sizes:** 26px – 41px

### Body Font: **Geist Mono**
Clean, readable monospace. Used for:
- Body text
- Form inputs
- Labels
- Data displays
- Small text

**Weight:** 400–600  
**Line Height:** 1.5–1.875 (relaxed)
**Sizes:** 12px – 20px

### Size Scale (Modular, 1.125 ratio)
```
xs   → 12px   (captions, hints)
sm   → 14px   (labels, secondary)
base → 16px   (body default)
lg   → 18px   (section headers)
xl   → 20px   (small headings)
2xl  → 23px   (medium headings)
3xl  → 26px   (large headings)
4xl  → 29px   (display headings)
5xl  → 32px   (hero headings)
6xl  → 36px   (page titles)
7xl  → 41px   (maximum, no higher)
```

---

## Spacing System

4px base, scaled to common multiples:

```
1  →  4px   (tightest)
2  →  8px   (tight)
3  → 12px   (default)
4  → 16px   (comfortable)
5  → 20px   (roomy)
6  → 24px   (spacious)
8  → 32px   (very spacious)
10 → 40px   (major sections)
12 → 48px   (page sections)
16 → 64px   (full sections)
```

**Usage Rule:** Vary spacing for rhythm. Card padding: 24px (space-6). Section gap: 32px–48px (space-8 to space-12).

---

## Radius

**Intentional, never decorative:**

```
none → 0px     (no radius)
sm   → 2px     (input fields, small elements)
md   → 4px     (buttons, default cards)
lg   → 8px     (large cards, modals)
xl   → 12px    (hero sections, full-width)
```

**Rule:** Inputs and small interactive elements: `sm`. Cards and containers: `md`. Large sections and modals: `lg`.

---

## Shadows

Functional hierarchy. Elevate cards and interactive elements, never decorative:

```
xs → 0 1px 2px 0 rgba(0, 0, 0, 0.05)
sm → 0 1px 3px 0 rgba(0, 0, 0, 0.1)
md → 0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg → 0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl → 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

**Usage:** Inputs: xs or none. Elevated cards: sm. Floating UI (popovers, menus): md–lg. Modal backdrops: xl.

---

## Components

### Button Variants

#### Primary
Used for main call-to-action (upload, save, create folder).
- **BG:** Accent orange
- **Text:** White
- **Hover:** Darker orange
- **Shadow:** Small elevation

#### Secondary
Used for alternative actions (cancel, edit, secondary options).
- **BG:** Stone-100 surface
- **Border:** Stone-200
- **Text:** Stone-900
- **Hover:** Stone-200 background

#### Ghost
Used for navigation, tertiary actions, links.
- **BG:** Transparent
- **Text:** Accent orange
- **Hover:** Stone-100 background
- **Border:** None

#### Danger
Used for destructive actions (delete, remove).
- **BG:** Danger red
- **Text:** White
- **Hover:** Reduced opacity

#### Success
Used for confirmatory actions (publish, complete).
- **BG:** Success green
- **Text:** White
- **Hover:** Reduced opacity

### Sizes
- **sm:** 32px height, 12px font (compact UI)
- **md:** 40px height, 14px font (default)
- **lg:** 48px height, 16px font (hero actions)

### Input Fields
- **Border:** Stone-200
- **Focus:** Accent orange border + ring
- **Error:** Danger red border
- **Disabled:** 60% opacity, cursor not-allowed
- **Placeholder:** Stone-500 (muted gray)

---

## Motion & Polish

**Principle:** Motion enhances, never distracts. Every interaction should feel intentional.

### Timing
```
fast   → 100ms  (micro interactions, input focus)
base   → 150ms  (default transitions, button presses)
slow   → 250ms  (modals, page transitions)
slower → 400ms  (staggered reveals)
```

### Easing
- **Ease Out:** Default (cubic-bezier(0, 0, 0.2, 1)) – things feel snappy
- **Ease Out Quart:** For stronger feel (cubic-bezier(0.25, 1, 0.5, 1))

### Transition Rules
1. **Never use `transition: all`** – specify properties explicitly
2. **Button press:** `scale(0.96)` with transform transition for tactile feedback
3. **Input focus:** Border + ring transition (fast, 100ms)
4. **Avoid layout animations** – use transforms instead of width/height changes
5. **Respect `prefers-reduced-motion`** – all animations disabled automatically
6. **Hit areas:** Minimum 40px (ideally 44px for touch targets)

### Specific Transitions
- **Buttons:** `transform, background-color, border-color, color, opacity, box-shadow`
- **Inputs:** `border-color, box-shadow, background-color`
- **Links:** `color, text-decoration`

### Polish Details
- **Font smoothing:** `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing: grayscale`
- **Tabular numbers:** `font-variant-numeric: tabular-nums` for counters and dynamic numbers
- **Text wrapping:** `text-wrap: balance` on headings, `text-wrap: pretty` on body text
- **Image outlines:** Subtle 1px outline (rgba dark/light) with -1px offset to define edges
- **Smooth scrolling:** `scroll-behavior: smooth` on html element

---

## Dark Mode

Automatic via `prefers-color-scheme: dark`. Stone palette inverts:

- Background → stone-900
- Surface → stone-800
- Border → stone-700
- Text → stone-100

---

## Accessibility

- **Contrast:** Body text 4.5:1 (WCAG AA)
- **Focus:** 2px outline on accent color
- **Inputs:** Labels always visible, error messaging clear
- **Motion:** All animations respect reduced-motion
- **Size:** Touch targets ≥44px height (buttons, inputs)

---

## Layout

### Page Structure
```
[Header]
[Sidebar (desktop) / Mobile nav]
[Main Content]
  ├─ Page Title (h1, Syne, 36px)
  ├─ Section 1
  │  └─ Cards, inputs, lists
  ├─ Section 2
  └─ ...
[Footer / Tab bar (mobile)]
```

### Responsive Breakpoints
- **Mobile:** < 640px (single column, full-width)
- **Tablet:** 640px – 1024px (2-column, sidebar collapses)
- **Desktop:** > 1024px (sidebar always visible)

### Grid for Photo Display
Default: `repeat(auto-fit, minmax(280px, 1fr))`  
Desktop: 4–5 columns (140px photos)  
Tablet: 3 columns  
Mobile: 2–3 columns

---

## Data Tables

- **Header:** Syne, 600 weight, stone-700 background
- **Rows:** Alternate stone-50/white backgrounds (light mode)
- **Hover:** Slight background tint
- **Borders:** Stone-200, subtle

---

## Forms

- **Label:** Syne, 12px, medium weight, above input
- **Input Height:** 40px (md size)
- **Spacing:** 16px (space-4) between fields
- **Error:** Red text below input, clear message
- **Validation:** Show inline on blur, not beforehand

---

## Empty States

- **Illustration:** Minimal, construction-themed (optional)
- **Heading:** Syne, 20px, stone-900
- **Message:** Body text, stone-600, max 60 characters
- **CTA:** Primary button below

---

## Anti-Patterns (NEVER DO)

- ❌ Purple gradients
- ❌ Glassmorphism
- ❌ Gradient text
- ❌ More than 3 fonts
- ❌ Shadows > lg without purpose
- ❌ Random rounded corners (use token values)
- ❌ Icons without labels (accessibility)
- ❌ Animations on hover for small elements (focus on big moments)
- ❌ Numbered section markers ("01 · Process") as default scaffolding

---

## Implementation Checklist

- [ ] All colors use CSS variables (`--color-*`)
- [ ] All typography uses `--font-display` or `--font-body`
- [ ] All spacing uses `--space-*` variables
- [ ] All radius uses `--radius-*` variables
- [ ] All shadows use `--shadow-*` variables
- [ ] Focus states include outline on `:focus-visible`
- [ ] Dark mode tested (prefers-color-scheme)
- [ ] Reduced motion tested (animations disabled)
- [ ] Mobile layout tested (< 640px, 640–1024px, > 1024px)
- [ ] Touch targets ≥ 44px
- [ ] Contrast ≥ 4.5:1 (body text)
- [ ] No hardcoded colors (use variables)
