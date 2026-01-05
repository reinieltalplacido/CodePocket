import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if we have a session in sessionStorage (temporary login)
// Otherwise use localStorage (persistent login)
const getStorage = () => {
  if (typeof window === "undefined") return undefined;
  
  // Check if there's a session token in sessionStorage
  const hasSessionStorage = window.sessionStorage.getItem("sb-session-token");
  
  return hasSessionStorage ? window.sessionStorage : window.localStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    storageKey: typeof window !== "undefined" && window.sessionStorage.getItem("sb-session-token") 
      ? "sb-session-token" 
      : "sb-auth-token",
    persistSession: true,
    autoRefreshToken: true,
  },
});
