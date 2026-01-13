import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter that checks both localStorage and sessionStorage
// This allows the app to work with sessions regardless of which storage was used during login
const customStorageAdapter = {
  getItem: (key: string) => {
    // Check localStorage first, then sessionStorage
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    // Default to localStorage for general operations
    // The login page will use a custom client with specific storage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    // Remove from both storages to ensure clean logout
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: customStorageAdapter,
  },
});
