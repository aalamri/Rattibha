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
      setPlanner(null);
      return;
    }

    const userId = session.user.id;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(async ({ data }) => {
        if (data) {
          setProfile(data);
          return;
        }
        // First authenticated load with no profile row — onboarding
        // couldn't create it at signup time because email confirmation was
        // required (no session yet). Create it now from the metadata
        // captured at signUp().
        const meta = session.user.user_metadata as Record<string, unknown> | undefined;
        const { data: created } = await supabase
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
        setProfile(created ?? null);
      });

    supabase
      .from('planners')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(async ({ data }) => {
        if (data) {
          setPlanner(data);
          return;
        }
        const meta = session.user.user_metadata as Record<string, unknown> | undefined;
        if (!meta?.business_name) {
          // Not a planner signup with pending metadata (or already handled) — leave null.
          setPlanner(null);
          return;
        }
        const { data: created } = await supabase
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
