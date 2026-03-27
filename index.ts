// API utilities
export { ApiError, createApiFetch, createFileUpload } from "./lib/api";
export type { FetchOptions, FetchHooks } from "./lib/api";

// Logger
export { createLogger, logger } from "./lib/logger";
export type { LogLevel, LogEntry, LoggerOptions, Logger } from "./lib/logger";

// Auth
export {
  AuthProvider,
  useAuth,
  useUser,
  useSupabase,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  forgotPassword,
  getSupabase,
  resetSupabase,
  toClerkUser,
  getErrorMessage,
  SignIn,
  SignUp,
  UserButton,
} from "./lib/auth";
export type { PublicMetadata, ClerkCompatibleUser, AuthContextValue } from "./lib/auth";

// Server-side Auth
export {
  getAdminClient,
  resetAdminClient,
  decodeToken,
  getUserId,
  isSuperAdmin,
  authorize,
} from "./lib/server-auth";
export type { AuthorizeOptions, AuthorizeResult } from "./lib/server-auth";

// Authorization
export {
  useIsSuperAdmin,
  useAppRole,
  useSubscription,
  RequireAuth,
  RequirePro,
  RequireRole,
} from "./lib/authorization";

// Brand
export { createBrand } from "./lib/brand";
export type { BrandConfig, Brand } from "./lib/brand";

// Config
export { getCurrentApp, isValidAppId, APP_DOMAINS, APP_IDS } from "./lib/config";
export type { AppId, AppInfo } from "./lib/config";

// Theme
export {
  ThemeProvider,
  useTheme,
  initTheme,
  getTheme,
  setStoredTheme,
  setTheme,
} from "./lib/theme";

// Validation
export { validateEmail, validatePassword, validateRequired, validate } from "./lib/validation";
export type { ValidationResult } from "./lib/validation";

// Auth callback
export { handleAuthCallback } from "./lib/auth-callback";
export type { AuthCallbackOptions } from "./lib/auth-callback";

// Security headers

// Metrics
export { createMetrics, noopMetrics } from "./lib/metrics";
export type { MetricType, MetricEvent, MetricsOptions, Metrics } from "./lib/metrics";

// Health checks
export { checkHealth, createSupabaseCheck } from "./lib/health";
export type { HealthCheckResult, HealthCheckFn } from "./lib/health";

// Time formatting
export { timeAgo } from "./lib/timeAgo";

// Middleware
export { createSupabaseMiddleware } from "./lib/middleware";
export type { MiddlewareConfig } from "./lib/middleware";

// R2 Storage
export { createR2Client } from "./lib/r2";
export type { R2Config } from "./lib/r2";

// Rate Limiting
export { createRateLimiter } from "./lib/ratelimit";
export type { RateLimitTier, RateLimitConfig, RateLimitResult, RateLimitOptions } from "./lib/ratelimit";

// Components
export { default as Footer } from "./components/Footer";
export { ErrorBoundary } from "./components/ErrorBoundary";
export { ToastProvider, useToast } from "./components/Toast";
export { default as Spinner } from "./components/Spinner";
export { default as EmptyState } from "./components/EmptyState";
export { default as NavbarShell } from "./components/NavbarShell";
export { default as AuthPageLayout } from "./components/AuthPageLayout";
export { default as Navbar } from "./components/Navbar";
export type { NavTab, NavbarProps } from "./components/Navbar";
