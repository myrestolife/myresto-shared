# @myresto/shared

Shared utilities and components for the MyResto Next.js ecosystem. Targets **Next.js 15 App Router** with React 19 and Supabase Auth.

## Installation

Add as a local dependency in your app's `package.json`:

```json
{
  "dependencies": {
    "@myresto/shared": "file:../myresto-shared-next"
  }
}
```

Then run `npm install`.

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_ID=event   # one of: event, garage, club, hub, gear, parts, life, show
```

## Usage

### Auth

Wrap your app in `AuthProvider` (typically in `layout.tsx`):

```tsx
import { AuthProvider } from "@myresto/shared/lib/auth";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

Use auth hooks and components:

```tsx
import { useAuth, useUser, SignedIn, SignedOut, UserButton, SignInButton } from "@myresto/shared/lib/auth";

function Header() {
  return (
    <nav>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </nav>
  );
}
```

### Theme

Wrap your app in `ThemeProvider`:

```tsx
import { ThemeProvider } from "@myresto/shared/lib/theme";

<ThemeProvider>
  {children}
</ThemeProvider>
```

Use the hook:

```tsx
import { useTheme } from "@myresto/shared/lib/theme";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === "dark" ? "Light" : "Dark"}</button>;
}
```

### Authorization

```tsx
import { RequireAuth, RequirePro, RequireRole, useSubscription } from "@myresto/shared/lib/authorization";

// Gate content behind auth
<RequireAuth fallback={<p>Please sign in</p>}>
  <Dashboard />
</RequireAuth>

// Gate behind Pro subscription
<RequirePro fallback={<UpgradePrompt />}>
  <ProFeature />
</RequirePro>

// Gate behind a role
<RequireRole role="admin" fallback={<p>Access denied</p>}>
  <AdminPanel />
</RequireRole>
```

### Brand

```ts
import { createBrand } from "@myresto/shared/lib/brand";

export const brand = createBrand({
  name: "Event",
  iconPaths: {
    dark: "/icons/logo-white.png",
    light: "/icons/logo-black.png",
  },
});

// brand.full => "MyRestoEvent"
// brand.icon.dark => "/icons/logo-white.png"
```

### API Helpers

```ts
import { createApiFetch, createFileUpload } from "@myresto/shared/lib/api";

const apiFetch = createApiFetch("/api");
const upload = createFileUpload("/api");

const data = await apiFetch<{ events: Event[] }>("/events");
const result = await upload("/upload/image", file, token);
```

### Components

```tsx
import Footer from "@myresto/shared/components/Footer";
import { ErrorBoundary } from "@myresto/shared/components/ErrorBoundary";

<ErrorBoundary>
  <App />
</ErrorBoundary>

<Footer appName="MyRestoEvent" />
```

## Exports Reference

| Module | Exports |
|--------|---------|
| `lib/auth` | `AuthProvider`, `useAuth`, `useUser`, `useSupabase`, `UserButton`, `SignIn`, `SignUp`, `SignedIn`, `SignedOut`, `SignInButton`, `SignOutButton`, `forgotPassword` |
| `lib/authorization` | `useIsSuperAdmin`, `useAppRole`, `useSubscription`, `RequireAuth`, `RequirePro`, `RequireRole` |
| `lib/theme` | `ThemeProvider`, `useTheme`, `initTheme`, `getTheme`, `setTheme` |
| `lib/brand` | `createBrand`, `BrandConfig`, `Brand` |
| `lib/config` | `getCurrentApp`, `APP_DOMAINS`, `AppId`, `AppInfo` |
| `lib/api` | `createApiFetch`, `createFileUpload`, `FetchOptions` |
| `components/Footer` | `Footer` (default) |
| `components/ErrorBoundary` | `ErrorBoundary` |
