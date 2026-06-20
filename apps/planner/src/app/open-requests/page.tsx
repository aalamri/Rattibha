'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Funnel, MapPin, PaperPlaneRight, Target, Tray, UsersThree, Wallet } from 'phosphor-react';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_KEYS, type CategoryKey, type CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { BudgetRange } from '@/lib/database.types';

type Scope = 'city' | 'all';
type CategoryFilter = 'all' | CategoryKey;

interface BoardRequest {
  id: string;
  name: string;
  initials: string;
  seed: number;
  category: CategoryKey;
  guests: number;
  city: CityKey;
  eventDate: Date;
  budgetKey: BudgetRange;
  postedHoursAgo: number;
  offers: number;
  match: number;
  note: string;
}

function Pillbox({ icon: PillIcon, label }: { icon: typeof Wallet; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xs border border-border bg-bg-app px-2.5 py-1.5 text-xs font-semibold text-fg2">
      <PillIcon size={14} className="text-fg3" />
      {label}
    </span>
  );
}

function postedAgoKey(hoursAgo: number) {
  return hoursAgo >= 24
    ? { key: 'common.daysAgo', count: Math.round(hoursAgo / 24) }
    : { key: 'common.hoursAgo', count: Math.round(hoursAgo) };
}

function RequestCard({ request, locale }: { request: BoardRequest; locale: string }) {
  const { t } = useTranslation();
  const CategoryIcon = CATEGORY_ICONS[request.category];
  const colors = CATEGORY_COLORS[request.category];
  const posted = postedAgoKey(request.postedHoursAgo);
  const eventDate = request.eventDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card pad={18} className="flex flex-col">
      <div className="flex items-start gap-3">
        <div
          className="grid h-[46px] w-[46px] flex-shrink-0 place-items-center rounded-md"
          style={{ background: colors.tint }}
        >
          <CategoryIcon size={23} style={{ color: colors.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-fg1">{t(`categories.${request.category}`)}</span>
            <span className="text-xs text-fg3">
              · {formatNumber(request.guests, locale)} {t('common.guests')}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-fg3">
            <MapPin size={14} />
            {t(`cities.${request.city}`)} · {eventDate}
          </div>
        </div>
        <Badge tone={request.match >= 90 ? 'green' : 'purple'} icon={Target}>
          {formatNumber(request.match, locale)}%
        </Badge>
      </div>

      <p className="my-3.5 flex-1 text-[13px] leading-relaxed text-fg2">&ldquo;{request.note}&rdquo;</p>

      <div className="mb-3.5 flex gap-2">
        <Pillbox icon={Wallet} label={`${t('common.sar')} ${t(`common.budgets.${request.budgetKey}`)}`} />
        <Pillbox icon={UsersThree} label={formatNumber(request.guests, locale)} />
        <Pillbox icon={Clock} label={t(posted.key, { count: posted.count })} />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3.5">
        <div className="flex items-center gap-2">
          <Avatar seed={request.seed} size={28} initials={request.initials} />
          <span className="inline-flex items-center gap-1 text-[12.5px] text-fg2">{request.name}</span>
          <span className="text-[11.5px] text-fg3">
            · {formatNumber(request.offers, locale)} {t('common.offers')}
          </span>
        </div>
        <Link href={`/open-requests/${request.id}/quote`}>
          <Button size="sm" icon={PaperPlaneRight}>
            {t('openRequests.sendQuote')}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function OpenRequestsPage() {
  const { t, i18n } = useTranslation();
  const { session, planner } = useAuth();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [scope, setScope] = useState<Scope>('city');
  const [requests, setRequests] = useState<BoardRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchRequests = () =>
      supabase
        .from('requests')
        .select('id, category, city, event_date, guests, budget, note, created_at, profiles(full_name, avatar_seed), offers(count)')
        .eq('status', 'open')
        .then(({ data }) => {
          const rows = (data ?? []) as unknown as Array<{
            id: string;
            category: CategoryKey;
            city: CityKey;
            event_date: string;
            guests: number;
            budget: BudgetRange;
            note: string | null;
            created_at: string;
            profiles: { full_name: string; avatar_seed: number } | null;
            offers: { count: number }[];
          }>;

          const mapped: BoardRequest[] = rows.map((r) => {
            const plannerCategories = planner?.categories ?? [];
            const cityMatch = planner ? r.city === planner.city : false;
            const categoryMatch = plannerCategories.includes(r.category);
            const match = categoryMatch && cityMatch ? 95 : categoryMatch ? 85 : cityMatch ? 80 : 70;

            return {
              id: r.id,
              name: r.profiles?.full_name ?? '—',
              initials: (r.profiles?.full_name ?? '?').charAt(0),
              seed: r.profiles?.avatar_seed ?? 0,
              category: r.category,
              guests: r.guests,
              city: r.city,
              eventDate: new Date(r.event_date),
              budgetKey: r.budget,
              postedHoursAgo: (Date.now() - new Date(r.created_at).getTime()) / 3_600_000,
              offers: r.offers?.[0]?.count ?? 0,
              match,
              note: r.note ?? '',
            };
          });

          setRequests(mapped);
          setLoading(false);
        });

    fetchRequests();

    // Live-update the board when new requests arrive or offers are added
    const channel = supabase
      .channel('open-requests-board')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests', filter: 'status=eq.open' }, () => fetchRequests())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session, planner]);

  const shown = useMemo(
    () =>
      requests.filter(
        (r) => (category === 'all' || r.category === category) && (scope === 'all' || r.city === planner?.city)
      ),
    [requests, category, scope, planner]
  );

  return (
    <DashboardShell title={t('openRequests.title')} subtitle={t('openRequests.subtitle')}>
      <div className="p-7">
        {/* city scope banner */}
        <div className="mb-4 flex items-center gap-3 rounded-md bg-purple-50 px-4 py-3">
          <MapPin size={19} weight="fill" className="text-brand" />
          <div className="flex-1 text-[13px] text-fg1">
            <Trans
              i18nKey="openRequests.scopeBanner"
              values={{ scope: scope === 'city' && planner ? t(`cities.${planner.city}`) : t('openRequests.scopeAll') }}
              components={{ bold: <b /> }}
            />
            <span className="text-fg3"> · {t('openRequests.scopeNote')}</span>
          </div>
          <div className="flex rounded-full border border-border bg-bg-surface p-0.5">
            {(['city', 'all'] as Scope[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                  scope === key ? 'bg-brand text-white' : 'text-fg2'
                }`}
              >
                {key === 'city' && planner ? t(`cities.${planner.city}`) : t('openRequests.scopeAll')}
              </button>
            ))}
          </div>
        </div>

        {/* category filter + count */}
        <div className="mb-4.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', ...CATEGORY_KEYS] as CategoryFilter[]).map((key) => {
              const active = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`rounded-full border-[1.5px] px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                    active ? 'border-brand bg-purple-50 text-brand' : 'border-border-strong bg-bg-surface text-fg2'
                  }`}
                >
                  {key === 'all' ? t('openRequests.allCategories') : t(`categories.${key}`)}
                </button>
              );
            })}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 text-[13px] text-fg3">
            <Funnel size={16} />
            {formatNumber(shown.length, i18n.language)} {t('openRequests.open')}
          </div>
        </div>

        {/* board */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4.5">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-[46px] w-[46px] flex-shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-sm" />
                  <Skeleton className="h-7 w-14 rounded-sm" />
                  <Skeleton className="h-7 w-16 rounded-sm" />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        ) : !loading && shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface py-16 text-center">
            <Tray size={36} className="text-fg3" />
            <div className="font-display text-lg font-semibold text-fg1">{t('openRequests.emptyTitle')}</div>
            <p className="max-w-sm text-[13px] text-fg3">
              {scope === 'city' ? t('openRequests.emptyBodyCity') : t('openRequests.emptyBodyAll')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4.5">
            {shown.map((request) => (
              <RequestCard key={request.id} request={request} locale={i18n.language} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
