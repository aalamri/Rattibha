'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/AuthContext';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Redirects non-admins away — see /admin and /admin/users. */
  requireAdmin?: boolean;
}

export function DashboardShell({ title, subtitle, children, requireAdmin }: DashboardShellProps) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
      return;
    }
    if (!loading && session && requireAdmin && profile && !profile.is_admin) {
      router.replace('/');
    }
  }, [loading, session, profile, requireAdmin, router]);

  if (loading || !session || (requireAdmin && (!profile || !profile.is_admin))) {
    return (
      <div role="status" aria-live="polite" className="grid h-screen place-items-center bg-bg-app text-fg3">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
