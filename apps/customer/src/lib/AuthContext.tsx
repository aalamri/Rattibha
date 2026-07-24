import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabase';
import type { Database } from './database.types';
import { clearPushToken, registerForPushNotifications } from './pushNotifications';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset derived profile state synchronously during render (rather than in
  // the effect below) the moment session flips to null — avoids a frame
  // where stale profile data is still visible post-sign-out.
  const [prevSession, setPrevSession] = useState(session);
  if (session !== prevSession) {
    setPrevSession(session);
    if (!session) setProfile(null);
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch((error) => {
        // getSession() is documented to resolve with { data, error } rather
        // than reject, but a lower-level failure (e.g. corrupt AsyncStorage
        // read) can still throw — without this, `loading` would never flip
        // to false and RouteGuard would hold the app on a blank screen
        // forever (`if (loading) return null`).
        console.warn('[auth] getSession() failed:', error);
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(async ({ data, error }) => {
        if (data) {
          setProfile(data);
          return;
        }
        // PGRST116 = "0 rows" from .single() — the only case where creating
        // a profile is actually correct (first authenticated load after an
        // email-confirmation signup, where register.tsx couldn't insert one
        // yet). Any other error (network blip, RLS, etc.) means the row's
        // existence is unknown, not confirmed absent — inserting anyway
        // would hit the profiles.id primary key and fail, silently leaving
        // profile stuck at null with no way to recover short of restarting
        // the app, so don't attempt it for those.
        if (error && error.code !== 'PGRST116') {
          console.warn('[auth] profile fetch failed:', error);
          return;
        }
        const meta = session.user.user_metadata as { full_name?: string; phone?: string } | undefined;
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            role: 'customer',
            full_name: meta?.full_name || session.user.email || '—',
            phone: meta?.phone || null,
          })
          .select('*')
          .single();
        if (createError) console.warn('[auth] profile creation failed:', createError);
        setProfile(created ?? null);
      });

    // Register for push notifications and persist the token — best-effort,
    // this file's own error handling already makes failures non-fatal, but
    // catch here too since the permission-request calls aren't wrapped.
    registerForPushNotifications(session.user.id).catch((error) => {
      console.warn('[auth] push notification registration failed:', error);
    });
  }, [session]);

  const signOut = async () => {
    if (session) await clearPushToken(session.user.id);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
