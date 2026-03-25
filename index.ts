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

// Security headers

// Metrics
export { createMetrics, noopMetrics } from "./lib/metrics";
export type { MetricType, MetricEvent, MetricsOptions, Metrics } from "./lib/metrics";

// Health checks
export { checkHealth, createSupabaseCheck } from "./lib/health";
export type { HealthCheckResult, HealthCheckFn } from "./lib/health";

// Components
export { default as Footer } from "./components/Footer";
export { ErrorBoundary } from "./components/ErrorBoundary";
