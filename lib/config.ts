export type AppId = "event" | "garage" | "club" | "hub" | "gear" | "parts" | "life" | "show";

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
 */
export function getCurrentApp(): AppId | null {
  const envId = process.env.NEXT_PUBLIC_APP_ID as AppId | undefined;
  if (envId && isValidAppId(envId)) return envId;

  if (typeof window !== "undefined") {
    const entry = APP_DOMAINS[window.location.hostname];
    if (entry) return entry.app;
  }

  return null;
}

function isValidAppId(v: string): v is AppId {
  return ["event","garage","club","hub","gear","parts","life","show"].includes(v);
}
