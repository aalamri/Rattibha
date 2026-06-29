'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlass, ShieldCheck, ShieldStar } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/lib/AuthContext';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/database.types';

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isAdmin: boolean;
  createdAt: Date;
}

export default function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refetch(query: string) {
    supabase
      .rpc('admin_list_users', { search: query })
      .then(({ data }) => {
        const rows = (data ?? []) as Array<{
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          is_admin: boolean;
          created_at: string;
        }>;
        setUsers(
          rows.map((r) => ({
            id: r.id,
            email: r.email,
            fullName: r.full_name,
            role: r.role,
            isAdmin: r.is_admin,
            createdAt: new Date(r.created_at),
          }))
        );
        setLoading(false);
      });
  }

  useEffect(() => {
    refetch('');
  }, []);

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    setBusyId(userId);
    await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
    setLoading(true);
    refetch(search);
    setBusyId(null);
  }

  return (
    <DashboardShell requireAdmin title={t('admin.users.title')} subtitle={t('admin.users.subtitle')}>
      <div className="p-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            refetch(search);
          }}
          className="mb-5 flex max-w-md items-center gap-2 rounded-md border border-border bg-bg-surface px-3.5 py-2.5"
        >
          <MagnifyingGlass size={17} className="text-fg3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.users.searchPlaceholder')}
            className="w-full bg-transparent text-[13.5px] text-fg1 outline-none"
          />
        </form>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i}>
                <Skeleton className="h-12 w-full" />
              </SkeletonCard>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={ShieldStar} title={t('admin.users.emptyTitle')} subtitle={t('admin.users.emptySub')} />
        ) : (
          <div className="flex flex-col gap-2.5">
            {users.map((u) => (
              <Card key={u.id} pad={14} className="flex items-center gap-3.5">
                <Avatar seed={0} size={38} initials={u.fullName.charAt(0)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-fg1">{u.fullName}</span>
                    <Badge tone="gray">{t(`admin.users.roles.${u.role}`)}</Badge>
                    {u.isAdmin && (
                      <Badge tone="gold" icon={ShieldCheck}>
                        {t('admin.users.admin')}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[12px] text-fg3">
                    <span>{u.email}</span>
                    <span>{formatDate(u.createdAt, i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <Button
                  variant={u.isAdmin ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={busyId === u.id || u.id === session?.user.id}
                  onClick={() => toggleAdmin(u.id, !u.isAdmin)}
                >
                  {t(u.isAdmin ? 'admin.users.removeAdmin' : 'admin.users.makeAdmin')}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
