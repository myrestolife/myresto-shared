import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdminClient } from './supabase';

/** Generic request-like object that has headers (works with NextRequest, Request, etc.). */
export type RequestLike = { headers: { get(name: string): string | null } };

function getAuthHeader(req: RequestLike): string | null {
  return req.headers.get('authorization');
}

/** Verify Supabase JWT and extract user ID and metadata. */
export async function decodeToken(
  req: RequestLike,
): Promise<{ userId: string | null; metadata: Record<string, unknown> }> {
  const authHeader = getAuthHeader(req);
  if (!authHeader?.startsWith('Bearer ')) return { userId: null, metadata: {} };

  const token = authHeader.slice(7);
  try {
    const admin = getAdminClient();
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) return { userId: null, metadata: {} };
    return {
      userId: user.id,
      metadata: (user.app_metadata as Record<string, unknown>) || {},
    };
  } catch {
    return { userId: null, metadata: {} };
  }
}

/** Get just the user ID from the request. */
export async function getUserId(req: RequestLike): Promise<string | null> {
  return (await decodeToken(req)).userId;
}

/** Check if user is super admin. */
export async function isSuperAdmin(req: RequestLike): Promise<boolean> {
  const { metadata } = await decodeToken(req);
  return metadata.role === 'super_admin';
}

// ---------------------------------------------------------------------------
// authorize() — generic app-level authorization check
// ---------------------------------------------------------------------------

export interface AuthorizeOptions {
  app?: string;
  role?: string;
  plan?: string;
}

export interface AuthorizeResult {
  authorized: boolean;
  reason?: string;
}

/**
 * Check if a user is authorized based on app role and/or subscription plan.
 * Super admins bypass all checks.
 */
export async function authorize(
  supabase: SupabaseClient,
  userId: string,
  metadata: Record<string, unknown>,
  options: AuthorizeOptions = {},
): Promise<AuthorizeResult> {
  // Super admin bypasses everything
  if (metadata.role === 'super_admin') return { authorized: true };

  // Check subscription plan
  if (options.plan) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .single();

    if (!sub || sub.plan !== options.plan || (sub.status !== 'active' && sub.status !== 'trialing')) {
      return { authorized: false, reason: 'insufficient_plan' };
    }
  }

  // Check app-level role
  if (options.app && options.role) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('app', options.app);

    if (!roles?.some((r: { role: string }) => r.role === options.role)) {
      return { authorized: false, reason: 'insufficient_role' };
    }
  }

  return { authorized: true };
}
