"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useUser, useAuth, useSupabase } from "./auth";
import { getCurrentApp } from "./config";

// ---------------------------------------------------------------------------
// useIsSuperAdmin
// ---------------------------------------------------------------------------

export function useIsSuperAdmin(): boolean {
  const { user } = useUser();
  return user?.publicMetadata?.role === "super_admin";
}

// ---------------------------------------------------------------------------
// useAppRole
// ---------------------------------------------------------------------------

interface AppRoleResult {
  roles: string[];
  hasRole: (role: string) => boolean;
  loading: boolean;
}

export function useAppRole(appOverride?: string): AppRoleResult {
  const { user, isSignedIn, isLoaded } = useUser();
  const supabase = useSupabase();
  const isSuperAdmin = useIsSuperAdmin();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const appId = appOverride ?? getCurrentApp();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    if (isSuperAdmin) {
      setRoles(["super_admin"]);
      setLoading(false);
      return;
    }
    if (!appId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("app", appId);

      if (!cancelled) {
        if (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("useAppRole: failed to fetch roles", error);
          }
          setRoles([]);
        } else {
          setRoles((data ?? []).map((r: { role: string }) => r.role));
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, user, isSuperAdmin, appId, supabase]);

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

export function useSubscription(): SubscriptionResult {
  const { user, isSignedIn, isLoaded } = useUser();
  const supabase = useSupabase();
  const isSuperAdmin = useIsSuperAdmin();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const appId = getCurrentApp();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    if (isSuperAdmin) {
      setSubscription({ plan: "pro", status: "active" });
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      let query = supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id);

      if (appId) {
        query = query.eq("app", appId);
      }

      const { data, error } = await query.single();

      if (!cancelled) {
        if (error && error.code !== "PGRST116") {
          if (process.env.NODE_ENV === "development") {
            console.error("useSubscription: failed to fetch subscription", error);
          }
        }
        setSubscription(data ?? null);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, user, isSuperAdmin, appId, supabase]);

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

export function RequireAuth({ children, fallback = null }: GateProps) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <GateLoading />;
  return isSignedIn ? <>{children}</> : <>{fallback}</>;
}

export function RequirePro({ children, fallback = null }: GateProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isPro, loading } = useSubscription();
  if (!isLoaded || loading) return <GateLoading />;
  return isSignedIn && isPro ? <>{children}</> : <>{fallback}</>;
}

interface RequireRoleProps extends GateProps {
  role: string;
}

export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { hasRole, loading } = useAppRole();
  if (!isLoaded || loading) return <GateLoading />;
  return isSignedIn && hasRole(role) ? <>{children}</> : <>{fallback}</>;
}
