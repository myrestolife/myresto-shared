"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useUser, useAuth, useSupabase } from "./auth";
import { getCurrentApp } from "./config";
import { logger } from "./logger";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// useIsSuperAdmin
// ---------------------------------------------------------------------------

/** Returns true if the current user has super_admin role in publicMetadata. */
export function useIsSuperAdmin(): boolean {
  const { user } = useUser();
  return user?.publicMetadata?.role === "super_admin";
}

// ---------------------------------------------------------------------------
// Shared async-query hook
// ---------------------------------------------------------------------------

interface UseAuthQueryOptions<T> {
  /** Called when user is super admin — return a default value. */
  superAdminDefault: T;
  /** Called when user is not signed in — return a default value. */
  unauthDefault: T;
  /** Run the actual Supabase query. Return the data or throw. */
  query: (supabase: SupabaseClient, userId: string) => Promise<T>;
  /** Label for error logging. */
  label: string;
  /** Extra dependencies for the useEffect. */
  deps?: unknown[];
}

function useAuthQuery<T>(options: UseAuthQueryOptions<T>): { data: T; loading: boolean } {
  const { user, isSignedIn, isLoaded } = useUser();
  const supabase = useSupabase();
  const isSuperAdmin = useIsSuperAdmin();
  const [data, setData] = useState<T>(options.unauthDefault);
  const [loading, setLoading] = useState(true);
  const depsRef = useRef(options.deps);
  depsRef.current = options.deps;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setData(options.unauthDefault);
      setLoading(false);
      return;
    }
    if (isSuperAdmin) {
      setData(options.superAdminDefault);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const result = await options.query(supabase, user.id);
        if (!cancelled) setData(result);
      } catch (err) {
        logger.error(`${options.label}: query failed`, { error: err });
        if (!cancelled) setData(options.unauthDefault);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user, isSuperAdmin, supabase, ...(options.deps ?? [])]);

  return { data, loading };
}

// ---------------------------------------------------------------------------
// useAppRole
// ---------------------------------------------------------------------------

interface AppRoleResult {
  roles: string[];
  hasRole: (role: string) => boolean;
  loading: boolean;
}

/** Fetch the current user's roles for the given app (or current app). Super admins bypass. */
export function useAppRole(appOverride?: string): AppRoleResult {
  const isSuperAdmin = useIsSuperAdmin();
  const appId = appOverride ?? getCurrentApp();

  const { data: roles, loading } = useAuthQuery<string[]>({
    superAdminDefault: ["super_admin"],
    unauthDefault: [],
    label: "useAppRole",
    deps: [appId],
    query: async (supabase, userId) => {
      if (!appId) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("app", appId);
      if (error) throw error;
      return (data ?? []).map((r: { role: string }) => r.role);
    },
  });

  const hasRole = useCallback(
    (role: string) => isSuperAdmin || roles.includes(role),
    [isSuperAdmin, roles]
  );

  return { roles, hasRole, loading };
}

// ---------------------------------------------------------------------------
// useSubscription
// ---------------------------------------------------------------------------

interface SubscriptionData {
  plan: string | null;
  status: string | null;
  [key: string]: unknown;
}

interface SubscriptionResult {
  plan: string | null;
  isPro: boolean;
  isActive: boolean;
  subscription: SubscriptionData | null;
  loading: boolean;
}

/** Fetch the current user's subscription for the current app. Super admins get pro status. */
export function useSubscription(): SubscriptionResult {
  const isSuperAdmin = useIsSuperAdmin();
  const appId = getCurrentApp();

  const { data: subscription, loading } = useAuthQuery<SubscriptionData | null>({
    superAdminDefault: { plan: "pro", status: "active" },
    unauthDefault: null,
    label: "useSubscription",
    deps: [appId],
    query: async (supabase, userId) => {
      let query = supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", userId);

      if (appId) {
        query = query.eq("app", appId);
      }

      const { data, error } = await query.single();
      if (error && error.code !== "PGRST116") throw error;
      return data ?? null;
    },
  });

  const plan = isSuperAdmin ? "pro" : (subscription?.plan ?? null);
  const isActive = isSuperAdmin || subscription?.status === "active";
  const isPro = isSuperAdmin || (isActive && plan === "pro");

  return { plan, isPro, isActive, subscription, loading };
}

// ---------------------------------------------------------------------------
// Loading spinner for gate components
// ---------------------------------------------------------------------------

function GateLoading() {
  return (
    <div className="flex items-center justify-center p-4" role="status" aria-label="Loading">
      <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gate components
// ---------------------------------------------------------------------------

interface GateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when the user is signed in. Shows loading spinner while resolving. Client-side only. */
export function RequireAuth({ children, fallback = null }: GateProps) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <GateLoading />;
  return isSignedIn ? <>{children}</> : <>{fallback}</>;
}

/** Renders children only when the user has an active Pro subscription. Client-side only. */
export function RequirePro({ children, fallback = null }: GateProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPro, loading } = useSubscription();
  if (!isLoaded || loading) return <GateLoading />;
  return isSignedIn && isPro ? <>{children}</> : <>{fallback}</>;
}

interface RequireRoleProps extends GateProps {
  role: string;
}

/** Renders children only when the user has the specified role. Client-side only. */
export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { hasRole, loading } = useAppRole();
  if (!isLoaded || loading) return <GateLoading />;
  return isSignedIn && hasRole(role) ? <>{children}</> : <>{fallback}</>;
}
