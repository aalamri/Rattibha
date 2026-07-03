import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import type { Database } from './database.types';

// EXPO_PUBLIC_SUPABASE_URL commonly points at a local Supabase stack via
// 127.0.0.1/localhost — correct when testing in a browser or simulator on
// the same machine, but on a real physical device "127.0.0.1" means the
// device itself, which has nothing listening there (every request just
// fails, and that failure can look unrelated to networking — e.g. a
// signup error gets misread as a password problem). Metro's own dev host
// (Constants.expoConfig?.hostUri, e.g. "192.168.1.23:8081") is already the
// LAN address of whichever machine is running the dev server, so reuse it
// to rewrite a loopback Supabase URL onto that same host automatically —
// no manual IP editing as the network changes, and no effect on a real
// (non-loopback) Supabase URL.
function resolveSupabaseUrl(configuredUrl: string): string {
  const isLoopback = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(configuredUrl);
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (__DEV__ && isLoopback && devHost) {
    return configuredUrl.replace(/127\.0\.0\.1|localhost/, devHost);
  }
  return configuredUrl;
}

const url = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL!);
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
