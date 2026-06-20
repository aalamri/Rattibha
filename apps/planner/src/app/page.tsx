'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Star, Target, TrendUp, Tray, Wallet } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import type { CategoryKey, CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { BookingStage, PackageTier, PaymentStatus } from '@/lib/database.types';

interface ActivityItem {
  key: string;
  icon: typeof Wallet;
  tone: 'green' | 'purple';
  label: string;
  time: Date;
}

interface OpenRequestItem {
  id: string;
  name: string;
  initials: string;
  seed: number;
  category: CategoryKey;
  guests: number;
  match: number;
}

interface UpcomingItem {
  id: string;
  client: string;
  initials: string;
  seed: number;
  eventDate: Date;
  packageTier: PackageTier;
  stage: BookingStage;
}

function isSameMonth(date: Date, ref: Date) {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
}

const STAGE_KEY: Record<BookingStage, string> = {
  planning: 'planning',
  design: 'design',
  awaiting_deposit: 'awaitingDeposit',
  final_walkthrough: 'finalWalkthrough',
  completed: 'finalWalkthrough',
};

export default function OverviewPage() {
  const { t, i18n } = useTranslation();
  const { session, planner } = useAuth();

  const [loading, setLoading] = useState(true);
  const [newLeads, setNewLeads] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ label: string; amount: number }[]>([]);
  const [paymentActivity, setPaymentActivity] = useState<ActivityItem[]>([]);
  const [bookingActivity, setBookingActivity] = useState<ActivityItem[]>([]);
  const [openRequests, setOpenRequests] = useState<OpenRequestItem[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .then(({ count }) => setNewLeads(count ?? 0));

    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .neq('stage', 'completed')
      .then(({ count }) => setActiveBookings(count ?? 0));

    supabase
      .from('payments')
      .select('amount, status, paid_at, contracts(offers(requests(profiles(full_name))))')
      .eq('status', 'paid')
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          amount: number;
          status: PaymentStatus;
          paid_at: string | null;
          contracts: { offers: { requests: { profiles: { full_name: string } | null } | null } | null } | null;
        }>;

        const now = new Date();
        const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1));
        setMonthlyRevenue(
          months.map((m) => ({
            label: formatDate(m, i18n.language, { month: 'short' }),
            amount: rows
              .filter((r) => r.paid_at && isSameMonth(new Date(r.paid_at), m))
              .reduce((sum, r) => sum + r.amount, 0),
          }))
        );

        setPaymentActivity(
          rows
            .filter((r) => r.paid_at)
            .map((r) => ({
              key: `payment-${r.paid_at}-${r.amount}`,
              icon: Wallet,
              tone: 'green' as const,
              label: t('overview.activity.paymentReceived', { client: r.contracts?.offers?.requests?.profiles?.full_name ?? '—' }),
              time: new Date(r.paid_at as string),
            }))
        );
      });

    supabase
      .from('bookings')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{ id: string; created_at: string }>;
        setBookingActivity(
          rows.map((r) => ({
            key: `booking-${r.id}`,
            icon: CalendarCheck,
            tone: 'purple' as const,
            label: t('overview.activity.bookingConfirmed'),
            time: new Date(r.created_at),
          }))
        );
      });

    supabase
      .from('requests')
      .select('id, category, guests, city, profiles(full_name, avatar_seed)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          category: CategoryKey;
          guests: number;
          city: CityKey;
          profiles: { full_name: string; avatar_seed: number } | null;
        }>;

        setOpenRequests(
          rows.map((r) => {
            const categoryMatch = (planner?.categories ?? []).includes(r.category);
            const cityMatch = planner ? r.city === planner.city : false;
            const match = categoryMatch && cityMatch ? 95 : categoryMatch ? 85 : cityMatch ? 80 : 70;
            return {
              id: r.id,
              name: r.profiles?.full_name ?? '—',
              initials: (r.profiles?.full_name ?? '?').charAt(0),
              seed: r.profiles?.avatar_seed ?? 0,
              category: r.category,
              guests: r.guests,
              match,
            };
          })
        );
      });

    supabase
      .from('bookings')
      .select('id, stage, event_date, contracts(offers(package, requests(profiles(full_name, avatar_seed))))')
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date', { ascending: true })
      .limit(3)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          stage: BookingStage;
          event_date: string;
          contracts: {
            offers: { package: PackageTier; requests: { profiles: { full_name: string; avatar_seed: number } | null } | null } | null;
          } | null;
        }>;

        setUpcoming(
          rows.map((r) => ({
            id: r.id,
            client: r.contracts?.offers?.requests?.profiles?.full_name ?? '—',
            initials: (r.contracts?.offers?.requests?.profiles?.full_name ?? '?').charAt(0),
            seed: r.contracts?.offers?.requests?.profiles?.avatar_seed ?? 0,
            eventDate: new Date(r.event_date),
            packageTier: r.contracts?.offers?.package ?? 'essentials',
            stage: r.stage,
          }))
        );
        setLoading(false);
      });
  }, [session, planner, i18n.language, t]);

  const activity = useMemo(
    () =>
      [...paymentActivity, ...bookingActivity].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5),
    [paymentActivity, bookingActivity]
  );

  const maxRevenue = Math.max(1, ...monthlyRevenue.map((m) => m.amount));
  const thisMonthLabel = formatDate(new Date(), i18n.language, { month: 'short' });

  const kpis = [
    { label: t('overview.kpis.newLeads'), value: formatNumber(newLeads, i18n.language), icon: Tray, tone: 'purple' as const },
    { label: t('overview.kpis.activeBookings'), value: formatNumber(activeBookings, i18n.language), icon: CalendarCheck, tone: 'lav' as const },
    {
      label: t('overview.kpis.revenue', { month: thisMonthLabel }),
      value: `${t('common.sar')} ${formatNumber(monthlyRevenue[monthlyRevenue.length - 1]?.amount ?? 0, i18n.language)}`,
      icon: TrendUp,
      tone: 'green' as const,
    },
    {
      label: t('overview.kpis.avgRating'),
      value: planner ? formatNumber(planner.rating, i18n.language) : '—',
      icon: Star,
      tone: 'gold' as const,
      sub: planner ? t('overview.kpis.reviewsCount', { count: planner.reviews_count }) : undefined,
    },
  ];

  const KPI_TONES: Record<string, [string, string]> = {
    purple: ['bg-purple-50', 'text-brand'],
    lav: ['bg-lavender-100', 'text-[#6F539C]'],
    green: ['bg-emerald-100', 'text-emerald-600'],
    gold: ['bg-gold-200', 'text-gold-600'],
  };

  if (loading) {
    return (
      <DashboardShell title={t('overview.title')} subtitle={t('overview.subtitle')}>
        <div className="grid grid-cols-4 gap-4 p-7">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i}>
              <Skeleton className="h-20 w-full" />
            </SkeletonCard>
          ))}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={t('overview.title')} subtitle={t('overview.subtitle')}>
      <div className="flex flex-col gap-5 p-7">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => {
            const [bg, fg] = KPI_TONES[k.tone];
            return (
              <Card key={k.label} pad={18}>
                <div className={`grid h-10 w-10 place-items-center rounded-sm ${bg}`}>
                  <k.icon size={20} weight="fill" className={fg} />
                </div>
                <div className="mt-3.5 font-display text-[28px] font-bold text-fg1">{k.value}</div>
                <div className="mt-0.5 text-[13px] text-fg2">{k.label}</div>
                {k.sub && <div className="mt-0.5 text-[11.5px] text-fg3">{k.sub}</div>}
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-5">
          <Card>
            <div className="mb-4.5 flex items-start justify-between">
              <div>
                <div className="text-[15px] font-semibold text-fg1">{t('overview.revenueCard.title')}</div>
                <div className="text-[12.5px] text-fg3">{t('overview.revenueCard.subtitle')}</div>
              </div>
              <Badge tone="gray">{t('common.sar')}</Badge>
            </div>
            <div className="flex h-[180px] items-end gap-3.5 px-1">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-[150px] w-full flex-col justify-end">
                    <div
                      className="relative rounded-t-md"
                      style={{
                        height: `${(m.amount / maxRevenue) * 100}%`,
                        background: i === monthlyRevenue.length - 1 ? 'linear-gradient(180deg,#7B4FB0,#5B2C83)' : 'var(--color-purple-100)',
                      }}
                    />
                  </div>
                  <span className="text-[11.5px] text-fg3">{m.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3.5 text-[15px] font-semibold text-fg1">{t('overview.activity.title')}</div>
            {activity.length === 0 ? (
              <p className="text-[13px] text-fg3">{t('overview.activity.empty')}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {activity.map((a, i) => {
                  const [bg, fg] = KPI_TONES[a.tone === 'green' ? 'green' : 'purple'];
                  return (
                    <div key={a.key} className={`flex gap-2.5 py-2.5 ${i < activity.length - 1 ? 'border-b border-border' : ''}`}>
                      <div className={`grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-sm ${bg}`}>
                        <a.icon size={17} weight="fill" className={fg} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold leading-tight text-fg1">{a.label}</div>
                      </div>
                      <span className="flex-shrink-0 text-[11px] text-fg3">
                        {formatDate(a.time, i18n.language, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card pad={0}>
            <div className="flex items-center justify-between px-5 pb-3 pt-4.5">
              <div className="text-[15px] font-semibold text-fg1">{t('overview.newRequests.title')}</div>
              <Link href="/open-requests" className="text-[13px] font-semibold text-brand">
                {t('overview.newRequests.viewAll')}
              </Link>
            </div>
            {openRequests.length === 0 ? (
              <p className="px-5 pb-4.5 text-[13px] text-fg3">{t('overview.newRequests.empty')}</p>
            ) : (
              openRequests.map((r) => (
                <Link key={r.id} href={`/open-requests/${r.id}/quote`} className="block">
                  <div className="flex items-center gap-3 border-t border-border px-5 py-3">
                    <Avatar seed={r.seed} size={38} initials={r.initials} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-semibold text-fg1">
                        {t(`categories.${r.category}`)} · {formatNumber(r.guests, i18n.language)} {t('common.guests')}
                      </div>
                      <div className="text-xs text-fg3">{r.name}</div>
                    </div>
                    <Badge tone="purple" icon={Target}>
                      {formatNumber(r.match, i18n.language)}%
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </Card>

          <Card pad={0}>
            <div className="flex items-center justify-between px-5 pb-3 pt-4.5">
              <div className="text-[15px] font-semibold text-fg1">{t('overview.upcoming.title')}</div>
              <Link href="/bookings" className="text-[13px] font-semibold text-brand">
                {t('overview.upcoming.viewAll')}
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-5 pb-4.5 text-[13px] text-fg3">{t('overview.upcoming.empty')}</p>
            ) : (
              upcoming.map((u) => (
                <div key={u.id} className="flex items-center gap-3 border-t border-border px-5 py-3">
                  <div className="flex h-[46px] w-[46px] flex-shrink-0 flex-col items-center justify-center rounded-md bg-purple-50">
                    <span className="text-[16px] font-bold leading-none text-brand">{formatNumber(u.eventDate.getDate(), i18n.language)}</span>
                    <span className="text-[10px] uppercase text-brand">{formatDate(u.eventDate, i18n.language, { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-fg1">{u.client}</div>
                    <div className="text-xs text-fg3">{t(`quote.packages.${u.packageTier}`)}</div>
                  </div>
                  <Badge tone="lav">{t(`plannerBookings.stages.${STAGE_KEY[u.stage]}`)}</Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
