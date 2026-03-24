/** Single source of truth for valid app IDs. */
export const APP_IDS = ["event", "garage", "club", "hub", "gear", "parts", "life", "show"] as const;

export type AppId = (typeof APP_IDS)[number];

export interface AppInfo { app: AppId; name: string; }

export const APP_DOMAINS: Record<string, AppInfo> = {
  "myrestoevent.com": { app: "event", name: "MyRestoEvent" },
  "www.myrestoevent.com": { app: "event", name: "MyRestoEvent" },
  "beta.myrestoevent.com": { app: "event", name: "MyRestoEvent" },
  "myrestogarage.com": { app: "garage", name: "MyRestoGarage" },
  "www.myrestogarage.com": { app: "garage", name: "MyRestoGarage" },
  "beta.myrestogarage.com": { app: "garage", name: "MyRestoGarage" },
  "myrestoclub.com": { app: "club", name: "MyRestoClub" },
  "www.myrestoclub.com": { app: "club", name: "MyRestoClub" },
  "beta.myrestoclub.com": { app: "club", name: "MyRestoClub" },
  "myrestohub.com": { app: "hub", name: "MyRestoHub" },
  "myrestolife.com": { app: "life", name: "MyRestoLife" },
};

/**
 * Get current app ID.
 * Resolution order:
 * 1. NEXT_PUBLIC_APP_ID env var (set per-app in Vercel)
 * 2. Hostname match (client-side)
 * 3. null
 *
 * Accepts optional overrides for testability.
 */
export function getCurrentApp(
  envAppId?: string,
  hostname?: string
): AppId | null {
  const id = envAppId ?? process.env.NEXT_PUBLIC_APP_ID;
  if (id && isValidAppId(id)) return id;

  const host = hostname ?? (typeof window !== "undefined" ? window.location.hostname : undefined);
  if (host) {
    const entry = APP_DOMAINS[host];
    if (entry) return entry.app;
  }

  return null;
}

export function isValidAppId(v: string): v is AppId {
  return (APP_IDS as readonly string[]).includes(v);
}
