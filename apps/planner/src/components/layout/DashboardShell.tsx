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
}

export function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [loading, session, router]);

  if (loading || !session) {
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
