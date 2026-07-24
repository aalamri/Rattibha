'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowCounterClockwise,
  ArrowRight,
  CalendarBlank,
  ChatCircle,
  CheckCircle,
  Clock,
  Confetti,
  Eye,
  MapPin,
  PaperPlaneTilt,
  XCircle,
} from 'phosphor-react';
import { Trans, useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import type { CategoryKey, CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { OfferStatus } from '@/lib/database.types';

const TABS: (OfferStatus | 'all')[] = ['all', 'pending', 'viewed', 'accepted', 'declined'];

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'amber',
  viewed: 'purple',
  accepted: 'green',
  declined: 'gray',
  withdrawn: 'gray',
};

const STATUS_ICON: Record<string, typeof Clock> = {
  pending: Clock,
  viewed: Eye,
  accepted: CheckCircle,
  declined: XCircle,
  withdrawn: XCircle,
};

// Defined outside the component so the render body never calls the impure
// Date.now() directly — matches the pattern in NotificationsPanel.tsx.
function hoursSince(date: Date) {
  return (Date.now() - date.getTime()) / 3_600_000;
}

interface OfferRow {
  id: string;
  status: OfferStatus;
  quote: number;
  sentAt: Date;
  category: CategoryKey;
  city: CityKey;
  eventDate: Date;
  note: string;
  name: string;
  initials: string;
  seed: number;
}

export default function MyOffersPage() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const PAGE_SIZE = 10;
  const [filter, setFilter] = useState<OfferStatus | 'all'>('all');
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    if (!session) return;

    supabase
      .from('offers')
      .select('id, status, price, created_at, requests(category, city, event_date, note, profiles(full_name, avatar_seed))')
      .eq('planner_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          status: OfferStatus;
          price: number;
          created_at: string;
          requests: {
            category: CategoryKey;
            city: CityKey;
            event_date: string;
            note: string | null;
            profiles: { full_name: string; avatar_seed: number } | null;
          } | null;
        }>;

        setOffers(
          rows.map((r) => ({
            id: r.id,
            status: r.status,
            quote: r.price,
            sentAt: new Date(r.created_at),
            category: r.requests?.category ?? 'weddings',
            city: r.requests?.city ?? 'riyadh',
            eventDate: r.requests ? new Date(r.requests.event_date) : new Date(),
            note: r.requests?.note ?? '',
            name: r.requests?.profiles?.full_name ?? '—',
            initials: (r.requests?.profiles?.full_name ?? '?').charAt(0),
            seed: r.requests?.profiles?.avatar_seed ?? 0,
          }))
        );
        setLoading(false);
      });
  }, [session]);

  const filtered = useMemo(() => offers.filter((o) => filter === 'all' || o.status === filter), [offers, filter]);
  const shown = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return (
    <DashboardShell title={t('myOffers.title')} subtitle={t('myOffers.subtitle')}>
      <div className="flex flex-col gap-4.5 p-7">
        {/* intro */}
        <div className="flex items-center gap-3 rounded-md bg-purple-50 px-4 py-3">
          <PaperPlaneTilt size={19} weight="fill" className="text-brand" />
          <span className="flex-1 text-[13px] text-fg1">
            <Trans i18nKey="myOffers.intro" components={{ bold: <b /> }} />
          </span>
        </div>

        {/* filter tabs */}
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const active = filter === tab;
            const count = tab === 'all' ? offers.length : offers.filter((o) => o.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`rounded-full border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                  active ? 'border-brand bg-brand text-white' : 'border-border bg-bg-surface text-fg2'
                }`}
              >
                {t(`myOffers.tabs.${tab}`)} <span className="opacity-70">· {count}</span>
              </button>
            );
          })}
        </div>

        {/* offer cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-[46px] w-[46px] flex-shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={PaperPlaneTilt}
            title={t('myOffers.emptyTitle')}
            subtitle={t('myOffers.emptySub')}
          />
        ) : (
        <div className="grid grid-cols-2 gap-4">
          {shown.map((offer) => {
            const StatusIcon = STATUS_ICON[offer.status];
            const eventDate = formatDate(offer.eventDate, i18n.language, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const sentHoursAgo = hoursSince(offer.sentAt);
            const sent =
              sentHoursAgo >= 24
                ? t('common.daysAgo', { count: Math.round(sentHoursAgo / 24) })
                : t('common.hoursAgo', { count: Math.round(sentHoursAgo) });

            return (
              <Card key={offer.id} pad={18} className="flex flex-col">
                <Link href={offer.status === 'accepted' ? `/offers/${offer.id}` : '#'} className="flex gap-3">
                  <Avatar seed={offer.seed} size={46} initials={offer.initials} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[15px] font-semibold text-fg1">{offer.name}</div>
                        <div className="mt-0.5 text-xs text-fg3">{t('myOffers.sent', { time: sent })}</div>
                      </div>
                      <Badge tone={STATUS_TONE[offer.status]} icon={StatusIcon}>
                        {t(`myOffers.status.${offer.status}`)}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <div className="my-3.5 flex flex-wrap gap-1.5">
                  <Badge tone="lav" icon={Confetti}>
                    {t(`categories.${offer.category}`)}
                  </Badge>
                  <Badge tone="gray" icon={CalendarBlank}>
                    {eventDate}
                  </Badge>
                  <Badge tone="gray" icon={MapPin}>
                    {t(`cities.${offer.city}`)}
                  </Badge>
                </div>

                <p className="mb-3.5 text-[13px] leading-relaxed text-fg2">&ldquo;{offer.note}&rdquo;</p>

                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <div className="text-[11.5px] text-fg3">{t('myOffers.yourQuote')}</div>
                    <div className="text-[15px] font-bold text-brand">
                      {t('common.sar')} {formatNumber(offer.quote, i18n.language)}
                    </div>
                  </div>
                  {offer.status === 'accepted' ? (
                    <Link href={`/offers/${offer.id}`}>
                      <Button icon={ArrowRight}>{t('myOffers.trackDeal')}</Button>
                    </Link>
                  ) : offer.status === 'declined' ? (
                    <Button variant="secondary" icon={ArrowCounterClockwise}>
                      {t('myOffers.reQuote')}
                    </Button>
                  ) : (
                    <Button variant="secondary" icon={ChatCircle}>
                      {t('myOffers.message')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        )}
        {filtered.length > visibleCount && (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
              {t('myOffers.loadMore')}
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
