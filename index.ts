// API utilities
export { ApiError, createApiFetch, createFileUpload } from "./lib/api";
export type { FetchOptions } from "./lib/api";

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
export { getCurrentApp, isValidAppId, APP_DOMAINS } from "./lib/config";
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

// Components
export { default as Footer } from "./components/Footer";
export { ErrorBoundary } from "./components/ErrorBoundary";
