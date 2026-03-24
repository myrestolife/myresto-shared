# Scorecard — Prioritized Fix List

**Repo:** @myresto/shared (myresto-shared-next)
**Date:** 2026-03-24
**Composite Score:** 4.6/10

## How to use this list

Work through items top to bottom. Each item is ordered by impact — fixing items higher on the list will improve the composite score the most. Check off items as you go.

---

## Critical Priority

- [ ] **[Testability]** No test files exist anywhere in the repository. Zero of 8 source modules have tests. — `repo-wide`
  - **Fix:** Set up Vitest with @testing-library/react and jsdom, add a 'test' script to package.json, and write unit tests for all modules starting with pure functions in lib/brand.ts, lib/config.ts, and lib/api.ts.
- [ ] **[Testability]** No test runner or test framework configured. No test-related dependencies or scripts. — `package.json`
  - **Fix:** Add Vitest (or Jest) as a devDependency, create a vitest.config.ts with jsdom environment for React component testing, and add a 'test' script to package.json.
- [ ] **[DevOps Readiness]** No CI/CD pipeline configuration exists (no GitHub Actions, GitLab CI, etc.). — `repo-wide`
  - **Fix:** Add a .github/workflows/ci.yml that runs TypeScript type-checking (tsc --noEmit), linting, and tests on every push and pull request.
- [ ] **[UI/UX]** No ARIA attributes used anywhere. UserButton dropdown invisible to screen readers. — `repo-wide`
  - **Fix:** Add aria-expanded and aria-haspopup on UserButton toggle, role='menu' on dropdown, role='menuitem' on items. Add aria-live='polite' on error messages.

## High Priority

- [ ] **[Testability]** No CI/CD pipeline to enforce type-checking and tests. — `repo-wide`
  - **Fix:** Add a .github/workflows/ci.yml that runs tsc --noEmit, eslint, and tests on every push and pull request, blocking merges on failure.
- [ ] **[Testability]** Supabase singleton (`_supabase`) is module-level mutable variable, hard to mock. — `lib/auth.tsx:18`
  - **Fix:** Accept a SupabaseClient instance via dependency injection (e.g., as a prop to AuthProvider or via a factory function) to allow test doubles.
- [ ] **[Testability]** `getCurrentApp()` reads globals directly, hard to test without global mocking. — `lib/config.ts:26`
  - **Fix:** Refactor getCurrentApp to accept optional parameters (envAppId, hostname) with defaults from process.env/window, enabling pure-function testing.
- [ ] **[DevOps Readiness]** No npm scripts defined — no build, test, lint, or typecheck commands. — `package.json`
  - **Fix:** Add scripts for 'typecheck' (tsc --noEmit), 'lint' (eslint), and 'test' (vitest) to package.json.
- [ ] **[DevOps Readiness]** Test directory empty (only .gitkeep). No test framework installed. — `test/.gitkeep`
  - **Fix:** Install Vitest and add unit tests for core modules like auth, authorization, config, api, and brand.
- [ ] **[DevOps Readiness]** No linter or formatter configured (no ESLint, Prettier). — `repo-wide`
  - **Fix:** Add ESLint with TypeScript and React plugins, and Prettier, with corresponding npm scripts.
- [ ] **[Observability]** No structured logging library. Only 3 bare console.error calls. — `repo-wide`
  - **Fix:** Adopt a structured logging utility (e.g., pino) and export a shared logger with timestamp, level, message, and correlationId fields.
- [ ] **[Observability]** Error tracking minimal — only optional Sentry in ErrorBoundary via dynamic require. — `components/ErrorBoundary.tsx:27`
  - **Fix:** Provide a shared error reporting utility that consuming apps can configure with their Sentry DSN. Instrument API fetch utilities to optionally report errors.
- [ ] **[Observability]** No trace context propagation (X-Request-Id, traceparent) in API utilities. — `lib/api.ts:28`
  - **Fix:** Generate or accept a correlation/request ID in createApiFetch and attach it as an X-Request-Id header on every outgoing request.
- [ ] **[UI/UX]** All form inputs use placeholder-only labeling. No `<label>` or `aria-label`. — `lib/auth.tsx:323`
  - **Fix:** Add visible `<label>` elements associated via htmlFor/id, or at minimum add aria-label attributes to every input field.
- [ ] **[UI/UX]** UserButton dropdown has no keyboard navigation (Escape, arrow keys, focus trap). — `lib/auth.tsx:500-576`
  - **Fix:** Add onKeyDown handler to close on Escape, implement focus trapping, add arrow key navigation, and close on click outside.
- [ ] **[UI/UX]** Mixed styling approaches: inline CSSProperties in auth.tsx vs Tailwind in Footer/ErrorBoundary. — `repo-wide`
  - **Fix:** Standardize on Tailwind CSS for all components. Refactor SignIn, SignUp, and UserButton to use Tailwind classes.
- [ ] **[UI/UX]** Style objects duplicated verbatim between SignIn and SignUp components. — `lib/auth.tsx:280-309`
  - **Fix:** Extract shared styles into reusable constants or create shared styled input/button components.
- [ ] **[UI/UX]** Gate components (RequireAuth, RequirePro, RequireRole) return null during loading. — `lib/authorization.tsx:168-189`
  - **Fix:** Render a loading skeleton or spinner instead of null. At minimum, preserve layout space to prevent content shifts.
- [ ] **[Maintainability]** No linter or formatter configured. — `repo-wide`
  - **Fix:** Add ESLint (with typescript-eslint) and Prettier with config files and add lint/format scripts to package.json.
- [ ] **[Maintainability]** No CI pipeline — code quality never enforced automatically. — `repo-wide`
  - **Fix:** Add a GitHub Actions workflow that runs tsc --noEmit, eslint, and tests on push/PR.
- [ ] **[Maintainability]** No tests exist. — `test/.gitkeep`
  - **Fix:** Add Vitest or Jest with React Testing Library and write unit tests for core utilities and hooks.
- [ ] **[Maintainability]** auth.tsx is 578-line monolith mixing provider, hooks, and UI components. — `lib/auth.tsx`
  - **Fix:** Split into auth/provider.tsx, auth/SignIn.tsx, auth/SignUp.tsx, auth/UserButton.tsx, and re-export from auth/index.tsx.
- [ ] **[Maintainability]** Inconsistent styling approach across components. — `repo-wide`
  - **Fix:** Standardize on Tailwind CSS for all components.
- [ ] **[Security]** .gitignore only excludes node_modules — no .env or secrets patterns. — `.gitignore`
  - **Fix:** Add .env*, .env.local, .env.*.local, *.pem, and other secret-bearing file patterns to .gitignore.
- [ ] **[Security]** No dependency vulnerability scanning (Dependabot/Renovate) configured. — `repo-wide`
  - **Fix:** Add a .github/dependabot.yml or renovate.json configuration.
- [ ] **[Security]** No input validation library or patterns used. — `lib/api.ts`
  - **Fix:** Integrate Zod for schema validation at API boundaries and form submissions.
- [ ] **[Reuse]** Inline styles copy-pasted identically between SignIn and SignUp (~30 lines each). — `lib/auth.tsx:280-309, 415-444`
  - **Fix:** Extract shared form styles into a module-level AUTH_FORM_STYLES constant.
- [ ] **[Reuse]** createApiFetch and createFileUpload duplicate auth header, error handling, and response parsing. — `lib/api.ts:27-86`
  - **Fix:** Extract a shared internal helper (handleResponse or baseFetch) for common logic.
- [ ] **[Simplicity]** auth.tsx mixes 4+ distinct responsibilities in 577 lines. — `lib/auth.tsx`
  - **Fix:** Split into focused files: auth-context.tsx, SignIn.tsx, SignUp.tsx, UserButton.tsx, supabase.ts.
- [ ] **[Simplicity]** SignIn component is 143 lines with two render branches and inline styles. — `lib/auth.tsx:235`
  - **Fix:** Extract ForgotPasswordForm and SignInForm sub-components with shared styles.

## Medium Priority

- [ ] **[Security]** Supabase singleton could leak sessions in SSR contexts. — `lib/auth.tsx:18-48`
  - **Fix:** Document client-only usage clearly and consider adding runtime guard or separate server factory.
- [ ] **[Security]** Console.error in authorization hooks may expose internals in production. — `lib/authorization.tsx:65`
  - **Fix:** Gate console.error behind process.env.NODE_ENV === 'development' check.
- [ ] **[Security]** No security headers or CORS utilities provided. — `repo-wide`
  - **Fix:** Provide shared Next.js middleware helpers for CSP, HSTS, X-Frame-Options.
- [ ] **[Security]** Weak password validation (6 chars min only via HTML attribute). — `lib/auth.tsx:470`
  - **Fix:** Add client-side password strength validation with complexity requirements.
- [ ] **[Performance]** Barrel `export *` can hinder tree-shaking. — `index.ts:1-6`
  - **Fix:** Use named re-exports or document subpath imports for consumers.
- [ ] **[Performance]** ErrorBoundary uses `require()` in ESM module. — `components/ErrorBoundary.tsx:28`
  - **Fix:** Replace with dynamic `import('@sentry/nextjs')`.
- [ ] **[Performance]** Inline style objects recreated every render in SignIn/SignUp. — `lib/auth.tsx:280-309`
  - **Fix:** Hoist static style objects to module scope.
- [ ] **[Observability]** No metrics or instrumentation hooks provided. — `repo-wide`
  - **Fix:** Add optional callback hooks or event emitter to createApiFetch for metrics.
- [ ] **[Observability]** Undifferentiated log levels (all console.error). — `lib/authorization.tsx:65`
  - **Fix:** Use console.warn for recoverable conditions, reserve error for unrecoverable failures.
- [ ] **[Observability]** API errors are plain Error with no structured metadata. — `lib/api.ts:46`
  - **Fix:** Create custom ApiError class with status, url, and response body fields.
- [ ] **[UI/UX]** No responsive breakpoints beyond basic centering. — `lib/auth.tsx:280`
  - **Fix:** Use Tailwind responsive utilities (sm:, md:, lg:) for forms and components.
- [ ] **[UI/UX]** Minimal form validation UX — only on submit. — `lib/auth.tsx:349-350`
  - **Fix:** Add real-time validation with inline feedback and visual input states.
- [ ] **[UI/UX]** No internationalization support — all strings hardcoded in English. — `repo-wide`
  - **Fix:** Extract user-facing strings into a translation system or accept as props.
- [ ] **[UI/UX]** UserButton dropdown doesn't close on outside click. — `lib/auth.tsx:504`
  - **Fix:** Add click-outside handler with useEffect document event listener.
- [ ] **[Maintainability]** theme.tsx naming conflict (setTheme). — `lib/theme.tsx:117-123`
  - **Fix:** Rename standalone export to setStoredTheme or setThemeDirectly.
- [ ] **[Maintainability]** ErrorBoundary uses require() in ESM module. — `components/ErrorBoundary.tsx:28`
  - **Fix:** Use dynamic import() instead.
- [ ] **[Maintainability]** Most public APIs lack JSDoc documentation. — `repo-wide`
  - **Fix:** Add JSDoc to all exported functions, hooks, and components.
- [ ] **[Maintainability]** Duplicated style objects in SignIn/SignUp. — `lib/auth.tsx:280-444`
  - **Fix:** Extract shared style constants into common module.
- [ ] **[Reuse]** Theme resolution logic repeated 4x, DOM write 7x. — `lib/theme.tsx:39-114`
  - **Fix:** Extract resolveTheme() and applyTheme() helpers.
- [ ] **[Reuse]** useAppRole/useSubscription share identical fetch pattern. — `lib/authorization.tsx:35-150`
  - **Fix:** Extract generic useAuthenticatedQuery hook.
- [ ] **[Reuse]** Error extraction pattern repeated 3x in form handlers. — `lib/auth.tsx:251, 274, 409`
  - **Fix:** Extract getErrorMessage(err, fallback) utility.
- [ ] **[Simplicity]** SignUp is 97 lines with duplicated styles. — `lib/auth.tsx:384`
  - **Fix:** Extract shared style constants to eliminate duplication.
- [ ] **[Simplicity]** UserButton is 90 lines with extensive inline styles. — `lib/auth.tsx:487`
  - **Fix:** Extract into own component file with CSS classes.
- [ ] **[Simplicity]** SSR stub in getSupabase() is fragile hand-crafted mock. — `lib/auth.tsx:29-40`
  - **Fix:** Return null during SSR and handle null case in consumers.
- [ ] **[Testability]** Pure functions with no tests (low-hanging fruit). — `repo-wide`
  - **Fix:** Write unit tests for createBrand, createApiFetch, getCurrentApp, isValidAppId, toClerkUser.
- [ ] **[Testability]** theme.tsx uses localStorage/DOM directly. — `lib/theme.tsx`
  - **Fix:** Ensure jsdom test environment is configured or abstract behind injectable interfaces.
- [ ] **[DevOps Readiness]** No .env.example template. — `repo-wide`
  - **Fix:** Create .env.example listing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_ID.
- [ ] **[DevOps Readiness]** No publishing/release documentation. — `README.md`
  - **Fix:** Add a 'Publishing' section documenting versioning and release process.

## Suggestions

- [ ] **[Performance]** useAppRole/useSubscription fetch on every mount without caching. — `lib/authorization.tsx:26-83`
  - **Fix:** Consider SWR/React Query or lifting fetched data into AuthProvider context.
- [ ] **[Performance]** `new Date().getFullYear()` called every Footer render. — `components/Footer.tsx:51`
  - **Fix:** Extract to module-level constant.
- [ ] **[UI/UX]** Error messages use hardcoded red color (#ef4444) without theme support. — `lib/auth.tsx:324`
  - **Fix:** Use var(--color-error) for theme-consistent error styling.
- [ ] **[UI/UX]** Disabled button has no visual styling change. — `lib/auth.tsx:325`
  - **Fix:** Add opacity reduction or muted background when disabled.
- [ ] **[Reuse]** Legacy theme compat exports duplicate provider logic. — `lib/theme.tsx:100-123`
  - **Fix:** Audit consuming apps; deprecate and remove if unused.
- [ ] **[Simplicity]** Inline styles throughout auth.tsx inconsistent with Tailwind elsewhere. — `lib/auth.tsx`
  - **Fix:** Adopt consistent styling approach (Tailwind CSS).
