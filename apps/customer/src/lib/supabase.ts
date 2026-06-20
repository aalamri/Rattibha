import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// AsyncStorage touches `window`/localStorage, which doesn't exist during
// Expo Router's web SSR pass — no-op there and defer to AsyncStorage in the browser/native.
const ssrSafeStorage = {
  getItem: (key: string) => (typeof window === 'undefined' ? Promise.resolve(null) : AsyncStorage.getItem(key)),
  setItem: (key: string, value: string) => (typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.setItem(key, value)),
  removeItem: (key: string) => (typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.removeItem(key)),
};

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
