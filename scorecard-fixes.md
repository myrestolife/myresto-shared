# Scorecard — Prioritized Fix List

**Repo:** @myresto/shared (myresto-shared-next)
**Date:** 2026-03-24
**Composite Score:** 6.6/10

## How to use this list

Work through items top to bottom. Each item is ordered by impact — fixing items higher on the list will improve the composite score the most. Check off items as you go.

---

## Critical Priority

No critical findings detected.

## High Priority

- [ ] **[Observability]** No structured logging library. Only dev-gated console.error calls; zero production logging. — `repo-wide`
  - **Fix:** Adopt a structured logging library (e.g., pino) and export a shared logger utility that emits JSON with timestamp, level, message, and correlationId fields. Consuming apps should be able to configure the logger instance.
- [ ] **[Observability]** Error tracking limited to React ErrorBoundary with optional Sentry. API errors, auth failures, and role/subscription fetch errors have no tracking integration. — `lib/api.ts:62`
  - **Fix:** Provide pluggable error reporting hooks (onError callbacks) in createApiFetch and auth operations. Export a captureException utility that delegates to Sentry/Datadog if available.
- [ ] **[Observability]** No metrics or instrumentation utilities provided for consuming apps. — `repo-wide`
  - **Fix:** Export optional callback hooks (e.g., onRequest, onError, onResponse) in createApiFetch so consuming apps can plug in their metrics collection. Consider OpenTelemetry-compatible instrumentation.
- [ ] **[Testability]** Only 4 of ~12 testable source modules have tests (~33% coverage). Entire React component/hook layer is untested. — `repo-wide`
  - **Fix:** Add component and hook tests using @testing-library/react (already installed) for AuthProvider, ThemeProvider, SignIn, SignUp, UserButton, Footer, ErrorBoundary, and authorization hooks. Target 70%+ file coverage.
- [ ] **[Testability]** No test coverage measurement or thresholds configured. — `vitest.config.ts`
  - **Fix:** Add @vitest/coverage-v8, configure coverage in vitest.config.ts (e.g., thresholds: { lines: 60 }), and add a coverage report step to CI.
- [ ] **[DevOps Readiness]** CI workflow references `.node-version` file that does not exist, causing pipeline failure. — `.github/workflows/ci.yml:17`
  - **Fix:** Create a `.node-version` file at the repo root (e.g., containing `22`) or switch to a hardcoded `node-version: 22` in the workflow.
- [ ] **[DevOps Readiness]** `.env.example` is excluded from version control by the `.env.*` gitignore pattern. — `.gitignore:5`
  - **Fix:** Add a negation rule `!.env.example` to `.gitignore` so the template file is tracked, or rename it to `env.example`.
- [ ] **[DevOps Readiness]** No release or publish workflow — no automated versioning or distribution process. — `repo-wide`
  - **Fix:** Add a GitHub Actions release workflow or npm publish script, and document the release process in the README.
- [ ] **[Maintainability]** CI references missing `.node-version` file (same root cause as DevOps finding). — `.github/workflows/ci.yml:18`
  - **Fix:** Create `.node-version` or hardcode `node-version: 22` in the workflow.
- [ ] **[Security]** No input validation library (Zod, Joi). Only basic client-side password checks in SignUp. — `lib/auth/SignUp.tsx:34-41`
  - **Fix:** Add Zod as a peer/optional dependency and provide shared validation schemas for auth forms and API request payloads.
- [ ] **[Security]** No shared security headers or CORS middleware utilities for consuming apps. — `repo-wide`
  - **Fix:** Provide a shared Next.js middleware helper (e.g., lib/security-headers.ts) that sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.

## Medium Priority

- [ ] **[Observability]** X-Request-Id is generated on API requests but not included in ApiError instances, breaking end-to-end correlation. — `lib/api.ts:64`
  - **Fix:** Add a `requestId` field to the ApiError class and populate it from the X-Request-Id header value.
- [ ] **[Observability]** All console.error calls gated behind `NODE_ENV === 'development'`, silencing production errors in authorization hooks. — `lib/authorization.tsx:65`
  - **Fix:** Remove the development-only guard or replace with a structured logger. Errors should always be reported in production.
- [ ] **[Observability]** ErrorBoundary Sentry integration uses hardcoded module name with no way for consuming apps to configure or replace the error reporting provider. — `components/ErrorBoundary.tsx:27`
  - **Fix:** Accept an optional `onError` callback prop in ErrorBoundary so consuming apps can plug in their own error reporting.
- [ ] **[Testability]** No integration tests exist. All 4 test files are pure unit tests with no provider-to-consumer data flow tests. — `repo-wide`
  - **Fix:** Add integration tests that render AuthProvider wrapping authorization hooks and gate components, verifying the full data flow.
- [ ] **[Testability]** Heavy reliance on mock introspection (mockFetch.mock.calls) in api.test.ts couples tests to fetch implementation details. — `test/api.test.ts:40`
  - **Fix:** Consider using MSW (Mock Service Worker) for more realistic request interception and behavior-based assertions.
- [ ] **[Testability]** No branch protection rules requiring CI to pass before merging. — `.github/workflows/ci.yml`
  - **Fix:** Enable GitHub branch protection rules on the master branch to require the 'check' status to pass.
- [ ] **[DevOps Readiness]** No release documentation in README. — `README.md`
  - **Fix:** Add a 'Contributing / Releasing' section explaining how to version bump and publish changes.
- [ ] **[DevOps Readiness]** CI only triggers on master branch pushes and PRs. — `.github/workflows/ci.yml:5`
  - **Fix:** Consider adding CI triggers for all branches or documenting the branching strategy.
- [ ] **[Maintainability]** Prettier installed but not enforced in CI — inconsistent formatting can slip through PRs. — `package.json`
  - **Fix:** Add a `"format:check": "prettier --check ."` script and include it as a CI step.
- [ ] **[Maintainability]** No `.editorconfig` at the repository root. — `repo-wide`
  - **Fix:** Add an `.editorconfig` file specifying indent style, size, charset, and end-of-line settings.
- [ ] **[Maintainability]** Several exported hooks and gate components lack JSDoc comments. — `lib/auth/provider.tsx:87-99`
  - **Fix:** Add brief JSDoc descriptions to all public exports (useAuth, useUser, useSupabase, useTheme, RequireAuth, RequirePro, RequireRole).
- [ ] **[Security]** Authorization gate components are client-side only — no server-side enforcement. — `lib/authorization.tsx:184-206`
  - **Fix:** Document clearly that gates are UI-level only. Consider providing server-side middleware or route-handler wrappers.
- [ ] **[Security]** No security-focused ESLint plugin configured. — `eslint.config.js`
  - **Fix:** Add eslint-plugin-security to catch common security anti-patterns at lint time.
- [ ] **[Security]** No npm audit step in CI pipeline. — `.github/workflows/ci.yml`
  - **Fix:** Add `npm audit --audit-level=high` step to fail builds on high-severity vulnerabilities.
- [ ] **[Performance]** useSubscription uses `.select('*')` but only needs plan and status fields. — `lib/authorization.tsx:133`
  - **Fix:** Change to `.select('plan, status')` to reduce payload size.
- [ ] **[Performance]** No caching or deduplication for Supabase queries in useAppRole and useSubscription. — `lib/authorization.tsx:55-74`
  - **Fix:** Add in-memory cache with TTL or use React context to share fetched data across components.
- [ ] **[Performance]** Barrel index.ts re-exports all modules which may hinder tree-shaking. — `index.ts`
  - **Fix:** Document that consumers should use deep imports (e.g., `@myresto/shared/lib/api`) for optimal tree-shaking.
- [ ] **[Simplicity]** useAppRole and useSubscription share ~30 lines of duplicated async-fetch pattern. — `lib/authorization.tsx:35-77`
  - **Fix:** Extract a shared useAsyncQuery hook that encapsulates the cancelled-flag, loading state, and error-handling boilerplate.
- [ ] **[Simplicity]** SSR no-op stub manually replicates SupabaseClient interface with `as unknown as SupabaseClient`. — `lib/auth/supabase.ts:23-34`
  - **Fix:** Use a Proxy-based stub to reduce maintenance burden as the Supabase SDK evolves.
- [ ] **[Reuse]** Duplicated async-fetch pattern between useAppRole and useSubscription. — `lib/authorization.tsx:26-161`
  - **Fix:** Extract a generic useAuthenticatedQuery hook.
- [ ] **[Reuse]** Redirect URL construction duplicated in 3 auth files. — `lib/auth/SignIn.tsx:117, SignUp.tsx:50, provider.tsx:140`
  - **Fix:** Extract a `getRedirectUrl(path)` helper in lib/auth/helpers.ts.
- [ ] **[Reuse]** AppId values listed twice — type union and runtime array. — `lib/config.ts:1,45`
  - **Fix:** Define `const APP_IDS = [...] as const` and derive `AppId` as `typeof APP_IDS[number]`.

## Suggestions

- [ ] **[Performance]** ThemeProvider context value object not memoized — new object created on every render. — `lib/theme.tsx:92`
  - **Fix:** Wrap the ThemeContext.Provider value in useMemo with [theme, setTheme, toggleTheme] as dependencies.
- [ ] **[Security]** resetSupabase() is available to all consumers, not just tests. — `lib/auth/supabase.ts:46-48`
  - **Fix:** Guard behind NODE_ENV === 'test' check, or remove from the main barrel export.
- [ ] **[Testability]** No shared setup file despite @testing-library/jest-dom installed. — `vitest.config.ts`
  - **Fix:** Create test/setup.ts importing '@testing-library/jest-dom/vitest' and reference it in vitest.config.ts via setupFiles.
- [ ] **[Testability]** Only one test file uses factory functions for test data. — `repo-wide`
  - **Fix:** Extract shared test factories for common domain objects into test/factories.ts.
- [ ] **[Maintainability]** scorecard-fixes.md is a temporary audit artifact committed to the repo. — `scorecard-fixes.md`
  - **Fix:** Move to project wiki or issue tracker, or add to .gitignore.
- [ ] **[DevOps Readiness]** No devcontainer configuration for consistent development environments. — `repo-wide`
  - **Fix:** Consider adding a .devcontainer configuration for the team.
- [ ] **[Reuse]** Form state boilerplate (error, loading, setError, setLoading, try/catch) repeated in SignIn and SignUp. — `lib/auth/SignIn.tsx, SignUp.tsx`
  - **Fix:** Consider a useFormSubmit(asyncFn) hook returning { submit, loading, error }.
- [ ] **[Reuse]** Additional Tailwind layout patterns could be added to styles.ts. — `lib/auth/styles.ts`
  - **Fix:** Add constants for repeated patterns like AUTH_DIVIDER and AUTH_FOOTER_LINK_ROW.
- [ ] **[Observability]** No health check or dependency verification utilities exported. — `repo-wide`
  - **Fix:** Export a checkSupabaseConnection() utility that consuming apps can call from their /health endpoints.
