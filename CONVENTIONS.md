# CONVENTIONS.md — MyResto Suite Standards

Cross-app conventions to prevent drift between Garage, Event, Club, and Life.
Reference this before creating new routes, layouts, or shared patterns.

---

## 1. URL Patterns

### Auth Routes

| Route | URL | Notes |
|-------|-----|-------|
| Sign in | `/sign-in` | Supports `?redirect=/path` for post-auth redirect |
| Sign up | `/sign-up` | |
| Forgot password | `/forgot-password` | |
| Auth callback | `/auth/callback` | OAuth return (API route, not a page) |
| Email confirm | `/auth/confirm` | Email verification (API route, not a page) |

**Rules:**
- Page routes use kebab-case: `/sign-in`, not `/auth/login` or `/signin`
- API/callback routes stay under `/auth/` (they're not user-facing)
- Always support `?redirect=` param on sign-in and sign-up
- Always support `?reason=` param for contextual messages (e.g., `?reason=register`)

### Dashboard Routes

| Route | URL |
|-------|-----|
| Dashboard home | `/dashboard` |
| Add item | `/dashboard/add` |
| Edit item | `/dashboard/edit/[id]` |
| Settings | `/settings` |
| Favorites | `/favorites` |

### Public Routes

| Pattern | URL | Example |
|---------|-----|---------|
| User profile | `/@[username]` | `/@kevnord` |
| Item detail | `/@[username]/[slug]` | `/@kevnord/1964-pontiac-tempest-custom` |
| Browse/explore | `/explore` | Not `/browse` — "Explore" is the standard term |

**Rules:**
- User-facing URLs use `@` prefix for profiles (social convention)
- Slugs are kebab-case, auto-generated from title
- Never expose UUIDs in user-facing URLs — use slugs with ID fallback redirect

---

## 2. Auth Layout

### Standard: Split-Screen (Garage Pattern)

Auth pages use a **standalone layout** — no Navbar, no Footer.

**Desktop (md+):**
```
┌─────────────────────────────────────────────────────┐
│  LEFT 55%              │  RIGHT 45%                 │
│  Gradient panel        │  Form (centered)           │
│  Brand copy            │  Wordmark + Close (X)      │
│  © year AppName        │  Google OAuth               │
│                        │  ── or ──                   │
│                        │  Email/Password form        │
│                        │  © year AppName (mobile)    │
└─────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌────────────────────────┐
│ MyRestoApp        [X]  │  ← Wordmark + close button
│                        │
│    Form (centered)     │
│                        │
│  © year AppName        │
└────────────────────────┘
```

**Rules:**
- Auth pages live in a `(auth)` route group with their own layout
- The layout must NOT include the public Navbar or Footer
- Close button (X) → navigates to `/` (home)
- Wordmark → links to `/` (home)
- Left panel uses app gradient (not an image) — each app uses its own accent
- Google OAuth always appears first, email form below divider

---

## 3. Navbar

### Props (via myresto-shared `<Navbar>`)

```tsx
<Navbar
  brand={brand}                    // from createBrand()
  tabs={[
    { href: '/explore', label: 'Explore' },
    { href: '/dashboard', label: 'My [App]', exact: true, authRequired: true },
  ]}
  cta={{ href: '/dashboard/add', label: '+ Add [Item]' }}
  signInHref="/sign-in"            // ← NOT /auth/login
/>
```

**Rules:**
- `signInHref` is always `/sign-in`
- Browse/discover tab is always labeled "Explore" at `/explore`
- Auth-gated tabs use `authRequired: true`
- CTA button only shows for authenticated users

---

## 4. Footer

### Standard: 4-Column Grid

```
| Brand + tagline | Suite links | Company links | Connect links |
| © year AppName  |             |               |               |
```

**Columns:**
1. **Brand** — App name + 1-line tagline + description
2. **Suite** — Links to sibling MyResto apps (current app listed first)
3. **Company** — About, Terms, Privacy
4. **Connect** — Social links (Instagram, Facebook, etc.)

**Rules:**
- Footer lives in `components/layout/Footer.tsx` (per-app, not shared)
- Mobile: 2-column grid (`grid-cols-2 md:grid-cols-4`)
- Show git hash in footer when `NEXT_PUBLIC_GIT_HASH` env var is set
- Copyright line includes current year (dynamic)

---

## 5. Page Layout

### Public Layout (`app/(public)/layout.tsx`)

```tsx
<div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
  <Navbar />
  <main className="flex-1">{children}</main>
  <Footer />
</div>
```

### Content Width

- Max content: `max-w-[1280px] mx-auto px-[25px]`
- Article/journal content: `max-w-3xl mx-auto` (768px — for readability)
- Auth forms: `max-w-sm` (384px)
- Settings forms: `max-w-lg` (512px)

---

## 6. Redirect Patterns

### Post-Auth Redirect

```
/sign-in?redirect=/dashboard/edit/123
```

After successful auth, redirect to the `redirect` param. Default: `/dashboard`.

### Auth Guard (Middleware)

```ts
// middleware.ts
if (!user && protectedPaths.includes(pathname)) {
  redirect(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
}
if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
  redirect('/dashboard');
}
```

---

## 7. Naming Conventions

### Files & Components

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` (Next.js app router) | `app/(public)/explore/page.tsx` |
| Layouts | `layout.tsx` | `app/(auth)/layout.tsx` |
| Components | PascalCase | `FeaturedVehicleCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utils/lib | camelCase | `formatLabel.ts` |
| API routes | `route.ts` | `app/api/vehicles/route.ts` |

### CSS Custom Properties

All apps must use `--color-accent` (not `--color-primary`). See `DESIGN-SYSTEM.md` for the full token spec.

### Terminology

| Use | Don't use |
|-----|-----------|
| Explore | Browse |
| Sign in | Login, Log in |
| Sign up | Register, Create account (in URLs) |
| Dashboard | Admin, Panel |

---

## 8. Shared Package (`myresto-shared`)

### What belongs in shared:
- Navbar, Footer shell (if genericized)
- Auth components (SignIn, SignUp, UserButton)
- Brand config (`createBrand`)
- Theme provider
- Common utilities (validation, formatting, r2, ratelimit)
- Shared types

### What stays per-app:
- `globals.css` (app-specific tokens/accent colors)
- Page components
- App-specific API routes
- App-specific business logic
- Footer (per-app, uses 4-column layout but with app-specific links)

### Dependency format:
```json
"@myresto/shared": "github:myrestolife/myresto-shared"
```
Not `file:../myresto-shared` — Turbopack can't resolve `file:` paths outside project root.

---

## 9. Environment Variables

### Required across all apps:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key |
| `NEXT_PUBLIC_GIT_HASH` | Git commit hash (auto-set in next.config) |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry project name |

### Auto-set in `next.config.ts`:
```ts
import { execSync } from "child_process";
let gitHash = process.env.NEXT_PUBLIC_GIT_HASH ?? '';
if (!gitHash) {
  try { gitHash = execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { /* ignore */ }
}
// Add to env: { NEXT_PUBLIC_GIT_HASH: gitHash }
```

---

## 10. Deployment

### Branch Strategy

| Branch | Purpose | Auto-deploy |
|--------|---------|-------------|
| `main` | Production | Yes (Vercel) |
| `dev` | Integration/preview | Dev server only |
| `feat/*` | Feature work | No deploy |

**Rules:**
- Feature branches merge to `dev` for testing
- `dev` merges to `main` for production deploy
- Never push directly to `main` during active development
- Dev server always runs the `dev` branch

---

*Last updated: March 2026*
*When in doubt, check this doc. When this doc is wrong, update it.*
