'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, MapPin, ShieldCheck, XCircle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import type { CategoryKey, CityKey } from '@/data/categories';
import { formatDate } from '@/lib/format';
import { supabase } from '@/lib/supabase';

interface PlannerRow {
  userId: string;
  businessName: string;
  city: CityKey;
  categories: CategoryKey[];
  verified: boolean;
  createdAt: Date;
  fullName: string;
  seed: number;
}

type Filter = 'pending' | 'verified' | 'all';

export default function AdminApprovalsPage() {
  const { t, i18n } = useTranslation();
  const [planners, setPlanners] = useState<PlannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  const refetch = useCallback(() => {
    supabase
      .from('planners')
      .select('user_id, business_name, city, categories, verified, created_at, profiles(full_name, avatar_seed)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          user_id: string;
          business_name: string;
          city: CityKey;
          categories: CategoryKey[];
          verified: boolean;
          created_at: string;
          profiles: { full_name: string; avatar_seed: number } | null;
        }>;
        setPlanners(
          rows.map((r) => ({
            userId: r.user_id,
            businessName: r.business_name,
            city: r.city,
            categories: r.categories,
            verified: r.verified,
            createdAt: new Date(r.created_at),
            fullName: r.profiles?.full_name ?? '—',
            seed: r.profiles?.avatar_seed ?? 0,
          }))
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function setVerified(userId: string, verified: boolean) {
    setBusyId(userId);
    await supabase.from('planners').update({ verified }).eq('user_id', userId);
    refetch();
    setBusyId(null);
  }

  const shown = planners.filter((p) => (filter === 'all' ? true : filter === 'verified' ? p.verified : !p.verified));

  return (
    <DashboardShell requireAdmin title={t('admin.approvals.title')} subtitle={t('admin.approvals.subtitle')}>
      <div className="p-7">
        <div className="mb-5 flex gap-2">
          {(['pending', 'verified', 'all'] as Filter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                filter === key ? 'border-brand bg-purple-50 text-brand' : 'border-border-strong text-fg2'
              }`}
            >
              {t(`admin.approvals.filters.${key}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i}>
                <Skeleton className="h-16 w-full" />
              </SkeletonCard>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon={ShieldCheck} title={t('admin.approvals.emptyTitle')} subtitle={t('admin.approvals.emptySub')} />
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map((p) => (
              <Card key={p.userId} pad={16} className="flex items-center gap-3.5">
                <Avatar seed={p.seed} size={44} initials={p.businessName.charAt(0)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14.5px] font-semibold text-fg1">{p.businessName}</span>
                    <Badge tone={p.verified ? 'green' : 'amber'}>
                      {t(p.verified ? 'admin.approvals.verified' : 'admin.approvals.pending')}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[12.5px] text-fg3">
                    <span>{p.fullName}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} />
                      {t(`cities.${p.city}`)}
                    </span>
                    <span>{formatDate(p.createdAt, i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    {p.categories.map((c) => (
                      <Badge key={c} tone="purple">
                        {t(`categories.${c}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
                {p.verified ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={XCircle}
                    disabled={busyId === p.userId}
                    onClick={() => setVerified(p.userId, false)}
                  >
                    {t('admin.approvals.reject')}
                  </Button>
                ) : (
                  <Button size="sm" icon={CheckCircle} disabled={busyId === p.userId} onClick={() => setVerified(p.userId, true)}>
                    {t('admin.approvals.approve')}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
