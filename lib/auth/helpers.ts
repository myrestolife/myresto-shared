import type { User } from "@supabase/supabase-js";
import type { ClerkCompatibleUser } from "./types";

/** Convert a Supabase User into a Clerk-compatible user shape. */
export function toClerkUser(user: User): ClerkCompatibleUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const firstName = (meta.first_name ?? meta.name ?? null) as string | null;
  const lastName = (meta.last_name ?? null) as string | null;
  return {
    id: user.id,
    primaryEmailAddress: user.email ?? null,
    firstName,
    lastName,
    fullName: firstName && lastName ? `${firstName} ${lastName}` : firstName ?? lastName ?? null,
    imageUrl: (meta.avatar_url ?? meta.picture ?? null) as string | null,
    username: (meta.preferred_username ?? null) as string | null,
    publicMetadata: {
      role: appMeta.role as string | undefined,
      plan: appMeta.plan as string | undefined,
      ...appMeta,
    },
  };
}

/** Extract a human-readable error message from an unknown error value. */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}
