import { createClient } from '@supabase/supabase-js';

// Platform-safe storage for Supabase auth
// - Web runtime: localStorage
// - Native: AsyncStorage (required dynamically)
// - SSR (web server render): in-memory no-op to avoid `window` access
type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

let authStorage: StorageAdapter;

if (typeof window === 'undefined') {
  // SSR: use in-memory storage to avoid referencing window
  const memory = new Map<string, string>();
  authStorage = {
    getItem: async (key) => (memory.has(key) ? memory.get(key)! : null),
    setItem: async (key, value) => { memory.set(key, value); },
    removeItem: async (key) => { memory.delete(key); },
  };
} else if (typeof document !== 'undefined') {
  // Web runtime: localStorage
  authStorage = {
    getItem: async (key) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
    setItem: async (key, value) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); },
    removeItem: async (key) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); },
  };
} else {
  // Native (fallback): AsyncStorage
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  authStorage = AsyncStorage;
}

const SUPABASE_URL = 'https://pwijqiglukpfipgmbovr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWpxaWdsdWtwZmlwZ21ib3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDY5NDcsImV4cCI6MjA3NTMyMjk0N30.XLkDsCd1hVPPVvOwXw74uzlxE-ShHya6gi2aBJpsUao';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: authStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});