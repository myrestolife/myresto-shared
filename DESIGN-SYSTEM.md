# MyResto Design System

> **Canonical reference for all MyResto apps:** Garage, Event, Club, Life.
> This document is the source of truth for tokens, typography, spacing, interactive states, and component patterns.
> All agents and developers should reference this doc when building any MyResto page.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Interactive States](#5-interactive-states)
6. [Components](#6-components)
7. [Touch Targets](#7-touch-targets)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Dark / Light Mode](#9-dark--light-mode)
10. [Shared Components](#10-shared-components)

---

## 1. Brand Identity

### Naming Pattern
Every app follows the **"MyResto + Noun"** convention:

| App | Full Name | Accent Color | Personality |
|-----|-----------|--------------|-------------|
| Garage | MyRestoGarage | Blue `#3B82F6` | Builds & Mods |
| Event | MyRestoEvent | Emerald `#10B981` | Shows & Meetups |
| Club | MyRestoClub | Orange `#E67E22` | Community |
| Life | MyRestoLife | Coral/Orange `#E67E22` | Lifestyle & Content |

### Design Philosophy
- **Dark-first**: All apps ship with a dark theme by default. Light mode is additive.
- **Accent-driven**: Each app's personality is expressed through its accent color. The base chrome (backgrounds, borders, text hierarchy) is shared.
- **Motion with purpose**: Transitions communicate state — not decoration. Keep them fast and consistent.

---

## 2. Color System

### Token Naming Convention
All CSS custom properties use kebab-case prefixed by category.
**Standardize on `--color-accent` — NOT `--color-primary`** (Life app must migrate).

```
--color-<role>
--bg-<role>
--text-<role>
--border-<role>
```

### Shared Base Tokens (Garage, Event, Club)
These tokens are identical across Garage, Event, and Club. They live in each app's `globals.css` under `:root` or `[data-theme="dark"]`.

```css
/* Backgrounds */
--bg-primary:   #0a0f1a;   /* Page background — deepest layer */
--bg-surface:   #0d1825;   /* Card / panel surface */
--bg-elevated:  #0c1220;   /* Modals, dropdowns — floats above surface */

/* Borders */
--border:       #152535;   /* Default border */
--border-hover: #1a3a5a;   /* Hover / active border */

/* Text */
--text-primary: #e0eaf0;   /* Body copy, headings */
--text-muted:   #4a6a8a;   /* Secondary labels, placeholder text */
--text-subtle:  #2a4a6a;   /* Tertiary, disabled labels */
```

> **Life exception:** Life uses `--bg-primary: #0f0f0f` (true black) and must align token names to this convention.

### Per-App Accent Tokens

Each app defines these in its own `globals.css`:

```css
/* ── Garage ── */
--color-accent:           #3B82F6;  /* Tailwind blue-500 */
--color-accent-hover:     #2563EB;  /* blue-600 */
--color-secondary:        #E67E22;  /* orange accent */
--color-btn-primary-text: #ffffff;

/* ── Event ── */
--color-accent:           #10B981;  /* Tailwind emerald-500 */
--color-accent-hover:     #059669;  /* emerald-600 */
--color-btn-primary-text: #000000;  /* dark text on light green */

/* ── Club ── */
--color-accent:           #E67E22;  /* orange */
--color-accent-hover:     #CA6B1B;  /* darker orange */
--color-btn-primary-text: #ffffff;

/* ── Life ── */
--color-accent:           #E67E22;  /* coral/orange — RENAME from --color-primary */
--color-accent-hover:     #CA6B1B;
--color-btn-primary-text: #ffffff;
--bg-primary:             #0f0f0f;  /* Life uses true black */
```

### Tailwind CSS Variable Mapping

In `tailwind.config.js`, map tokens to utilities:

```js
theme: {
  extend: {
    colors: {
      'bg-primary':   'var(--bg-primary)',
      'bg-surface':   'var(--bg-surface)',
      'bg-elevated':  'var(--bg-elevated)',
      'border-base':  'var(--border)',
      'border-hover': 'var(--border-hover)',
      'text-primary': 'var(--text-primary)',
      'text-muted':   'var(--text-muted)',
      'text-subtle':  'var(--text-subtle)',
      'accent':       'var(--color-accent)',
      'accent-hover': 'var(--color-accent-hover)',
    },
  },
}
```

---

## 3. Typography

### Font Families

| App | Primary Font | Secondary Font | Load Source |
|-----|-------------|----------------|-------------|
| Garage | Space Grotesk | — | Google Fonts |
| Event | Space Grotesk | — | Google Fonts |
| Club | Space Grotesk | — | Google Fonts |
| Life | Space Grotesk | Inter | Google Fonts |

**Space Grotesk** is the MyResto system font. Use it for all headings and UI text.
**Inter** is supplementary — Life uses it for body copy where higher readability density is needed.

```css
/* globals.css — all apps */
--font-primary: 'Space Grotesk', sans-serif;

/* Life only */
--font-body: 'Inter', sans-serif;
```

### Type Scale

| Token | Size | Tailwind | Usage |
|-------|------|---------|-------|
| `--text-xs` | 12px | `text-xs` | Labels, badges, captions |
| `--text-sm` | 14px | `text-sm` | Secondary body, table text |
| `--text-base` | 16px | `text-base` | Primary body copy |
| `--text-lg` | 18px | `text-lg` | Lead paragraphs, card intros |
| `--text-xl` | 20px | `text-xl` | h4, section labels |
| `--text-2xl` | 24px | `text-2xl` | h3, card titles |
| `--text-3xl` | 30px | `text-3xl` | h2, section headings |
| `--text-4xl` | 36px | `text-4xl` | h1, page heroes |
| `--text-5xl` | 48px | `text-5xl` | Hero statements |

### Heading Hierarchy

```html
<!-- h1: Page title / hero -->
<h1 class="text-4xl font-bold text-text-primary leading-tight tracking-tight">
  MyRestoGarage
</h1>

<!-- h2: Section heading -->
<h2 class="text-3xl font-semibold text-text-primary leading-snug">
  Browse Builds
</h2>

<!-- h3: Card title / subsection -->
<h3 class="text-2xl font-semibold text-text-primary">
  1969 Camaro
</h3>

<!-- h4: Label / group heading -->
<h4 class="text-xl font-medium text-text-muted uppercase tracking-wide">
  Engine Details
</h4>
```

### Body Text

```html
<!-- Primary body -->
<p class="text-base text-text-primary leading-relaxed">…</p>

<!-- Secondary / supporting -->
<p class="text-sm text-text-muted leading-relaxed">…</p>

<!-- Caption / metadata -->
<span class="text-xs text-text-subtle">Posted 3 days ago</span>
```

---

## 4. Spacing & Layout

### Content Width

```css
--content-width: 1280px;   /* max-w-screen-xl */
--content-padding: 25px;   /* px-[25px] or px-6 (≈24px) */
```

```html
<!-- Page wrapper -->
<div class="max-w-screen-xl mx-auto px-[25px]">…</div>
```

### Section Padding

| Context | CSS | Tailwind |
|---------|-----|---------|
| Section vertical | `padding-block: 64px` | `py-16` |
| Section vertical (compact) | `padding-block: 40px` | `py-10` |
| Section vertical (mobile) | `padding-block: 32px` | `py-8` |
| Card padding | `padding: 24px` | `p-6` |
| Card padding (compact) | `padding: 16px` | `p-4` |

### Grid Gaps

| Gap | Tailwind | Use Case |
|-----|---------|---------|
| 8px | `gap-2` | Tight icon + label |
| 12px | `gap-3` | Form field groups |
| 16px | `gap-4` | Card grid (mobile) |
| 24px | `gap-6` | Card grid (desktop) |
| 32px | `gap-8` | Section-level separation |

### Common Grid Patterns

```html
<!-- Card grid: 1 col → 2 col → 3 col -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">…</div>

<!-- Card grid: 1 col → 2 col → 4 col -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">…</div>

<!-- Two-column layout with sidebar -->
<div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">…</div>
```

---

## 5. Interactive States

> **This is the core section.** All interactive elements MUST implement these patterns consistently. No ad-hoc transitions.

### Transition Timing Standards

| Duration | Variable | Use Case |
|----------|---------|---------|
| 150ms | `duration-150` | Micro-interactions (button press, scale) |
| 200ms | `duration-200` | Color changes (border, background) |
| 300ms | `duration-300` | Layout shifts (image zoom, panel expand) |

**Easing:** Always use `ease-out` for enter states, `ease-in` for exit states. Default Tailwind `transition-*` uses `ease-in-out` — acceptable for simple cases.

---

### 5.1 Links

```css
/* Token */
--link-color: var(--text-primary);
--link-hover-color: var(--color-accent);
```

```html
<!-- Standard link -->
<a class="text-text-primary no-underline
          hover:text-accent hover:underline underline-offset-4
          active:text-accent-hover
          transition-colors duration-150">
  View Build
</a>

<!-- Muted link (nav, metadata) -->
<a class="text-text-muted no-underline
          hover:text-text-primary hover:underline underline-offset-4
          transition-colors duration-150">
  See all events
</a>
```

---

### 5.2 Primary Button

```css
/* Token */
--btn-primary-bg: var(--color-accent);
--btn-primary-bg-hover: var(--color-accent-hover);
--btn-primary-text: var(--color-btn-primary-text);
```

```html
<button class="
  inline-flex items-center justify-center gap-2
  px-6 py-3
  bg-accent text-[var(--color-btn-primary-text)]
  rounded-xl font-semibold text-sm
  min-h-[44px]
  hover:bg-accent-hover
  active:scale-[0.98] active:bg-accent-hover
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  transition-all duration-150
">
  Save Changes
</button>
```

**Notes:**
- `rounded-xl` = 12px radius — use consistently for primary actions
- `font-semibold` — always semibold for primary CTAs
- `min-h-[44px]` — Apple HIG minimum touch target
- Focus ring uses `focus-visible` (not `focus`) to avoid showing ring on mouse click

---

### 5.3 Ghost / Secondary Button

```html
<button class="
  inline-flex items-center justify-center gap-2
  px-6 py-3
  bg-transparent text-text-muted
  border border-border rounded-xl font-medium text-sm
  min-h-[44px]
  hover:border-border-hover hover:text-text-primary hover:bg-bg-surface
  active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  transition-all duration-200
">
  Cancel
</button>
```

---

### 5.4 Danger Button

```html
<button class="
  inline-flex items-center justify-center gap-2
  px-6 py-3
  bg-red-600 text-white
  rounded-xl font-semibold text-sm
  min-h-[44px]
  hover:bg-red-700
  active:scale-[0.98] active:bg-red-700
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  transition-all duration-150
">
  Delete Build
</button>
```

---

### 5.5 Clickable Cards

Use Tailwind's `group` pattern so child images react to the parent hover.

```html
<!-- Clickable card with image -->
<a href="/builds/123" class="
  group block
  bg-bg-surface border border-border rounded-xl overflow-hidden
  hover:border-border-hover hover:shadow-md
  active:scale-[0.99]
  transition-[shadow,border-color] duration-200
  cursor-pointer
">
  <!-- Image -->
  <div class="overflow-hidden aspect-video">
    <img
      src="…"
      alt="…"
      class="w-full h-full object-cover
             group-hover:scale-105
             transition-transform duration-300"
    />
  </div>

  <!-- Content -->
  <div class="p-4">
    <h3 class="text-lg font-semibold text-text-primary">1969 Camaro</h3>
    <p class="text-sm text-text-muted mt-1">LS3 swap, full restoration</p>
  </div>
</a>

<!-- Static card (non-clickable) -->
<div class="bg-bg-surface border border-border rounded-xl p-6">
  …
</div>
```

**Notes:**
- `overflow-hidden` on the card AND the image wrapper to contain `scale-105`
- Use `aspect-video` (16:9) as default image ratio for event/build cards
- `transition-[shadow,border-color]` — only animate what changes, not everything

---

### 5.6 Images (standalone / gallery)

```html
<div class="overflow-hidden rounded-xl">
  <img
    src="…"
    alt="…"
    class="w-full h-full object-cover
           hover:scale-105
           transition-transform duration-300
           cursor-pointer"
  />
</div>
```

---

### 5.7 Inputs & Selects

```css
/* Token */
--input-bg: var(--bg-surface);
--input-border: var(--border);
--input-border-focus: var(--color-accent);
```

```html
<!-- Text input -->
<input
  type="text"
  class="
    w-full px-4 py-3
    bg-bg-surface text-text-primary
    border border-border rounded-lg
    placeholder:text-text-subtle
    min-h-[44px]
    focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-150
  "
  placeholder="Search builds…"
/>

<!-- Select -->
<select class="
  w-full px-4 py-3
  bg-bg-surface text-text-primary
  border border-border rounded-lg
  min-h-[44px]
  focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-150
  cursor-pointer
">
  <option>All Makes</option>
</select>

<!-- Textarea -->
<textarea class="
  w-full px-4 py-3
  bg-bg-surface text-text-primary
  border border-border rounded-lg
  placeholder:text-text-subtle
  focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-150
  resize-y min-h-[120px]
"></textarea>
```

---

### 5.8 Interactive State Summary

| Element | Default | Hover | Active | Focus | Disabled | Transition |
|---------|---------|-------|--------|-------|----------|-----------|
| Link | `text-primary` | `text-accent + underline` | `text-accent-hover` | — | — | `colors 150ms` |
| Primary Button | `bg-accent` | `bg-accent-hover` | `scale(0.98)` | `ring-2 ring-accent/30` | `opacity-50` | `all 150ms` |
| Ghost Button | `border-border` | `border-hover + bg-surface` | `scale(0.98)` | `ring-2 ring-accent/30` | `opacity-50` | `all 200ms` |
| Danger Button | `bg-red-600` | `bg-red-700` | `scale(0.98)` | `ring-2 ring-red-500/30` | `opacity-50` | `all 150ms` |
| Clickable Card | `border-border` | `border-hover + shadow-md` | `scale(0.99)` | — | — | `shadow,border-color 200ms` |
| Card Image | — | `scale(1.05)` | — | — | — | `transform 300ms` |
| Input/Select | `border-border` | — | — | `border-accent + ring-2` | `opacity-50` | `colors 150ms` |

---

## 6. Components

### 6.1 Button Variants at a Glance

```html
<!-- Primary -->
<button class="px-6 py-3 bg-accent text-[var(--color-btn-primary-text)] rounded-xl font-semibold text-sm min-h-[44px] hover:bg-accent-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
  Primary
</button>

<!-- Secondary / Ghost -->
<button class="px-6 py-3 bg-transparent border border-border text-text-muted rounded-xl font-medium text-sm min-h-[44px] hover:border-border-hover hover:text-text-primary hover:bg-bg-surface active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
  Secondary
</button>

<!-- Danger -->
<button class="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm min-h-[44px] hover:bg-red-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
  Delete
</button>

<!-- Icon button -->
<button class="p-3 bg-transparent border border-border rounded-lg text-text-muted min-h-[44px] min-w-[44px] hover:border-border-hover hover:text-text-primary hover:bg-bg-surface active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent/30 transition-all duration-150" aria-label="Edit">
  <PencilIcon class="w-4 h-4" />
</button>
```

### 6.2 Card Variants

```html
<!-- Static card -->
<div class="bg-bg-surface border border-border rounded-xl p-6">
  <h3 class="text-lg font-semibold text-text-primary">Card Title</h3>
  <p class="text-sm text-text-muted mt-2">Supporting text.</p>
</div>

<!-- Clickable card (see §5.5 for full pattern) -->
<a href="…" class="group block bg-bg-surface border border-border rounded-xl overflow-hidden hover:border-border-hover hover:shadow-md active:scale-[0.99] transition-[shadow,border-color] duration-200">
  …
</a>

<!-- Elevated card (modal-like, tooltip) -->
<div class="bg-bg-elevated border border-border rounded-xl shadow-xl p-6">
  …
</div>
```

### 6.3 Badge / Pill

```html
<!-- Accent badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
  New
</span>

<!-- Neutral badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-border text-text-muted">
  Draft
</span>

<!-- Success badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
  Live
</span>

<!-- Danger badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
  Error
</span>
```

### 6.4 Nav Tabs

```html
<!-- Tab bar (horizontal) -->
<nav class="flex gap-1 border-b border-border">
  <!-- Active tab -->
  <a href="#" class="px-4 py-3 text-sm font-medium text-accent border-b-2 border-accent -mb-px transition-colors duration-150">
    Builds
  </a>
  <!-- Inactive tab -->
  <a href="#" class="px-4 py-3 text-sm font-medium text-text-muted border-b-2 border-transparent -mb-px hover:text-text-primary hover:border-border-hover transition-colors duration-150">
    Events
  </a>
</nav>
```

### 6.5 Form Label + Field Group

```html
<div class="flex flex-col gap-1.5">
  <label class="text-sm font-medium text-text-primary">
    Vehicle Year
  </label>
  <input
    type="number"
    class="w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg min-h-[44px] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors duration-150"
    placeholder="1969"
  />
  <p class="text-xs text-text-muted">Enter the model year of your vehicle.</p>
</div>
```

### 6.6 Divider

```html
<!-- Horizontal rule -->
<hr class="border-border" />

<!-- Section divider with label -->
<div class="flex items-center gap-4">
  <hr class="flex-1 border-border" />
  <span class="text-xs text-text-subtle uppercase tracking-wide">or</span>
  <hr class="flex-1 border-border" />
</div>
```

### 6.7 Empty State

```html
<div class="flex flex-col items-center justify-center py-16 text-center gap-4">
  <div class="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center">
    <SearchIcon class="w-8 h-8 text-text-subtle" />
  </div>
  <div>
    <h3 class="text-lg font-semibold text-text-primary">No builds found</h3>
    <p class="text-sm text-text-muted mt-1">Try adjusting your filters or add your first build.</p>
  </div>
  <button class="px-6 py-3 bg-accent text-[var(--color-btn-primary-text)] rounded-xl font-semibold text-sm min-h-[44px] hover:bg-accent-hover active:scale-[0.98] transition-all duration-150">
    Add Build
  </button>
</div>
```

---

## 7. Touch Targets

All interactive elements must meet minimum touch target sizes per [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/buttons) and [Google Material](https://m3.material.io/foundations/accessible-design/accessibility-basics).

| Element Type | Minimum Size | Tailwind |
|-------------|-------------|---------|
| All interactive elements | 44×44px | `min-h-[44px] min-w-[44px]` |
| Primary CTAs (buttons) | 48×48px | `min-h-[48px]` |
| Icon-only buttons | 44×44px | `p-3` with `w-4 h-4` icon |
| Nav links | 44px height | `py-3` |
| Form inputs | 44px height | `py-3` or `min-h-[44px]` |
| Checkboxes / radios | 20×20px visual, 44×44px tap area | Wrap in `<label class="p-3 -m-3">` |

**Key rule:** If a user needs to tap it on mobile, it needs 44px in both dimensions. Padding is your friend — use negative margin to avoid layout disruption when expanding tap areas.

---

## 8. Responsive Breakpoints

MyResto uses Tailwind's default breakpoints (mobile-first):

| Breakpoint | Width | Prefix | Design Intent |
|-----------|-------|--------|---------------|
| Default | < 640px | _(none)_ | Single column, stacked |
| sm | ≥ 640px | `sm:` | Two-column grids start |
| md | ≥ 768px | `md:` | Tablet landscape |
| lg | ≥ 1024px | `lg:` | Desktop, sidebar layouts |
| xl | ≥ 1280px | `xl:` | Content max-width |

### Mobile-First Checklist
- Always design the mobile layout first (no prefix)
- Expand layout at `sm:` and `lg:` — these are the most common jump points
- Use `xl:` only for max-width constraints, not layout changes
- Test at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (desktop)

### Common Responsive Patterns

```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">…</div>

<!-- Show on mobile only -->
<div class="block lg:hidden">…</div>

<!-- Text size scaling -->
<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">

<!-- Padding scaling -->
<section class="py-8 lg:py-16 px-[25px]">
```

---

## 9. Dark / Light Mode

### Current State
All MyResto apps are **dark-mode only** by default. Light mode is not yet implemented.

### Strategy for Future Light Mode
Use a `data-theme` attribute on `<html>` to switch token values:

```css
/* Default (dark) — all apps */
:root,
[data-theme="dark"] {
  --bg-primary:   #0a0f1a;
  --bg-surface:   #0d1825;
  --bg-elevated:  #0c1220;
  --border:       #152535;
  --border-hover: #1a3a5a;
  --text-primary: #e0eaf0;
  --text-muted:   #4a6a8a;
  --text-subtle:  #2a4a6a;
}

/* Light mode (future) */
[data-theme="light"] {
  --bg-primary:   #ffffff;
  --bg-surface:   #f8fafc;
  --bg-elevated:  #f1f5f9;
  --border:       #e2e8f0;
  --border-hover: #cbd5e1;
  --text-primary: #0f172a;
  --text-muted:   #64748b;
  --text-subtle:  #94a3b8;
  /* Accent tokens don't change — they're inherently legible on both */
}
```

### Theme Switching (JavaScript)
```js
// Toggle
document.documentElement.dataset.theme =
  document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';

// Persist
localStorage.setItem('theme', document.documentElement.dataset.theme);

// Restore on load (in <head> to avoid flash)
const saved = localStorage.getItem('theme') ?? 'dark';
document.documentElement.dataset.theme = saved;
```

### Rule
- **Never hardcode** `#0a0f1a` or `#e0eaf0` directly in component Tailwind classes.
- Always use the CSS variable token or its mapped Tailwind utility (`bg-bg-primary`, `text-text-primary`).
- This keeps light mode as a CSS-only swap with no component changes.

---

## 10. Shared Components

### What Lives in `myresto-shared`

These components are shared across all apps via the `myresto-shared` npm package.

| Component | Notes |
|-----------|-------|
| `<Navbar />` | App-aware via `app` prop (`garage` | `event` | `club` | `life`). Accent color injected. |
| `<Footer />` | Shared layout, links vary per app |
| `<LoadingSpinner />` | Uses `--color-accent` for spinner color |
| `<ErrorBoundary />` | Generic error UI |
| `<Avatar />` | User profile image with fallback initials |
| `<Badge />` | Variant-based (see §6.3) |
| `<Modal />` | Uses `bg-elevated`, handles focus trap + keyboard |
| `<Toast />` / `<Notification />` | Success, error, warning, info variants |

### What Lives Per-App

These are app-specific and should NOT be in `myresto-shared`:

| Component | Reason |
|-----------|--------|
| `<EventCard />` | Event-specific data shape |
| `<BuildCard />` | Garage-specific |
| `<ClubCard />` | Club-specific |
| `<PageHero />` | Layout varies too much per app |
| All page-level components | Route-specific |

### Contribution Rule
> A component graduates to `myresto-shared` when **2+ apps need it** and it can accept `app` or `variant` props without embedding app-specific logic.

### Navbar App Prop Convention

```tsx
// myresto-shared usage
<Navbar app="garage" />   // Renders with blue accent
<Navbar app="event" />    // Renders with emerald accent
<Navbar app="club" />     // Renders with orange accent
<Navbar app="life" />     // Renders with coral accent
```

The Navbar reads the CSS custom properties from the consuming app's `globals.css` — it does not hardcode colors internally.

---

## Appendix: Quick-Copy Token Reference

```css
/* ── Backgrounds ── */
bg-bg-primary        → var(--bg-primary)
bg-bg-surface        → var(--bg-surface)
bg-bg-elevated       → var(--bg-elevated)

/* ── Borders ── */
border-border        → var(--border)
border-border-hover  → var(--border-hover)

/* ── Text ── */
text-text-primary    → var(--text-primary)
text-text-muted      → var(--text-muted)
text-text-subtle     → var(--text-subtle)

/* ── Accent ── */
bg-accent            → var(--color-accent)
bg-accent-hover      → var(--color-accent-hover)
text-accent          → var(--color-accent)
border-accent        → var(--color-accent)
ring-accent/30       → var(--color-accent) at 30% opacity
```

---

## Appendix: Life App Migration Note

Life currently uses non-standard token names. When migrating:

| Old (Life) | New (standard) |
|-----------|---------------|
| `--color-primary` | `--color-accent` |
| `--color-primary-hover` | `--color-accent-hover` |
| `--bg-primary: #0f0f0f` | Keep — Life's bg is intentionally blacker |

All other shared tokens (`--bg-surface`, `--border`, `--text-*`) should align to the values above. Audit `life/app/globals.css` and update accordingly.

---

*Last updated: 2026-03-28 | Maintained by the MyResto engineering team*
*For questions or proposed changes, open a Linear story tagged `design-system`.*
