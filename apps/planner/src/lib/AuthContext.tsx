'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabase';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Planner = Database['public']['Tables']['planners']['Row'];

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  planner: Planner | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  planner: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [planner, setPlanner] = useState<Planner | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset derived profile/planner state synchronously during render (rather
  // than in the effect below) the moment session flips to null — avoids a
  // frame where stale profile/planner data is still visible post-sign-out.
  const [prevSession, setPrevSession] = useState(session);
  if (session !== prevSession) {
    setPrevSession(session);
    if (!session) {
      setProfile(null);
      setPlanner(null);
    }
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
        // than reject, but a lower-level failure can still throw — without
        // this, `loading` would never flip to false and DashboardShell would
        // hold the app on the loading screen forever.
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

    const userId = session.user.id;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(async ({ data, error }) => {
        if (data) {
          setProfile(data);
          return;
        }
        // PGRST116 = "0 rows" from .single() — the only case where creating
        // a profile is actually correct (first authenticated load after an
        // email-confirmation signup, where onboarding couldn't insert one
        // yet). Any other error means the row's existence is unknown, not
        // confirmed absent — inserting anyway would hit the profiles.id
        // primary key and fail, silently leaving profile stuck at null.
        if (error && error.code !== 'PGRST116') {
          console.warn('[auth] profile fetch failed:', error);
          return;
        }
        const meta = session.user.user_metadata as Record<string, unknown> | undefined;
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            role: 'planner',
            full_name: (meta?.full_name as string) || session.user.email || '—',
            phone: (meta?.phone as string) || null,
            city: (meta?.city as Profile['city']) || null,
          })
          .select('*')
          .single();
        if (createError) console.warn('[auth] profile creation failed:', createError);
        setProfile(created ?? null);
      });

    supabase
      .from('planners')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(async ({ data, error }) => {
        if (data) {
          setPlanner(data);
          return;
        }
        if (error && error.code !== 'PGRST116') {
          console.warn('[auth] planner fetch failed:', error);
          return;
        }
        const meta = session.user.user_metadata as Record<string, unknown> | undefined;
        if (!meta?.business_name) {
          // Not a planner signup with pending metadata (or already handled) — leave null.
          setPlanner(null);
          return;
        }
        const { data: created, error: createError } = await supabase
          .from('planners')
          .insert({
            user_id: userId,
            business_name: meta.business_name as string,
            bio: (meta.bio as string) || null,
            city: (meta.city as Planner['city']) || 'riyadh',
            categories: (meta.categories as Planner['categories']) || [],
            years_in_business: (meta.years_in_business as string) || null,
            team_size: (meta.team_size as string) || null,
            budget_tier: (meta.budget_tier as string) || null,
            starting_price: meta.starting_price ? Number(meta.starting_price) : null,
            cr_number: (meta.cr_number as string) || null,
          })
          .select('*')
          .single();
        if (createError) console.warn('[auth] planner creation failed:', createError);
        setPlanner(created ?? null);
      });
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, planner, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
