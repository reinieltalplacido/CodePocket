import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter that checks both localStorage and sessionStorage
const customStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    
    // Check sessionStorage first (temporary sessions)
    const sessionItem = window.sessionStorage.getItem(key);
    if (sessionItem) return sessionItem;
    
    // Fall back to localStorage (persistent sessions)
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    
    // Determine which storage to use based on the key
    if (key.includes("session-token")) {
      window.sessionStorage.setItem(key, value);
    } else {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    
    // Remove from both storages to be safe
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
  },
});
