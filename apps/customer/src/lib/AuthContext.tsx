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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(async ({ data }) => {
        if (data) {
          setProfile(data);
          return;
        }
        // First authenticated load with no profile row — this happens when
        // registration required email confirmation, so the profiles insert
        // in register.tsx couldn't run yet (no session at signup time).
        // Create it now from the metadata captured at signUp().
        const meta = session.user.user_metadata as { full_name?: string; phone?: string } | undefined;
        const { data: created } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            role: 'customer',
            full_name: meta?.full_name || session.user.email || '—',
            phone: meta?.phone || null,
          })
          .select('*')
          .single();
        setProfile(created ?? null);
      });

    // Register for push notifications and persist the token.
    registerForPushNotifications(session.user.id);
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
