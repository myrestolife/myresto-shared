import type { Session } from "@supabase/supabase-js";

export interface PublicMetadata {
  role?: string;
  plan?: string;
  [key: string]: unknown;
}

export interface ClerkCompatibleUser {
  id: string;
  primaryEmailAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  username: string | null;
  publicMetadata: PublicMetadata;
}

export interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  session: Session | null;
  user: ClerkCompatibleUser | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
}
