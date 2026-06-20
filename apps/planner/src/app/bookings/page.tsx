'use client';

import { useEffect, useState } from 'react';
import { CalendarBlank, MapPin, UsersThree, Wallet } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

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
import type { BookingStage, PaymentStatus, PaymentType } from '@/lib/database.types';

type BookingStatus = 'confirmed' | 'pending';

const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  confirmed: 'green',
  pending: 'amber',
};

const STAGE_KEY: Record<BookingStage, string> = {
  planning: 'planning',
  design: 'design',
  awaiting_deposit: 'awaitingDeposit',
  final_walkthrough: 'finalWalkthrough',
  completed: 'finalWalkthrough',
};

interface BookingRow {
  id: string;
  client: string;
  initials: string;
  seed: number;
  category: CategoryKey;
  city: CityKey;
  eventDate: Date;
  guests: number;
  value: number;
  paid: number;
  status: BookingStatus;
  stage: BookingStage;
}

export default function PlannerBookingsPage() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const PAGE_SIZE = 10;
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shown = bookings.slice(0, visibleCount);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('bookings')
      .select(
        'id, stage, event_date, contracts(payments(type, amount, status), offers(price, requests(category, city, guests, profiles(full_name, avatar_seed))))'
      )
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          stage: BookingStage;
          event_date: string;
          contracts: {
            payments: { type: PaymentType; amount: number; status: PaymentStatus }[];
            offers: {
              price: number;
              requests: {
                category: CategoryKey;
                city: CityKey;
                guests: number;
                profiles: { full_name: string; avatar_seed: number } | null;
              } | null;
            } | null;
          } | null;
        }>;

        const mapped: BookingRow[] =
          rows.map((r) => {
            const payments = r.contracts?.payments ?? [];
            const paid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
            const requests = r.contracts?.offers?.requests;
            return {
              id: r.id,
              client: requests?.profiles?.full_name ?? '—',
              initials: (requests?.profiles?.full_name ?? '?').charAt(0),
              seed: requests?.profiles?.avatar_seed ?? 0,
              category: requests?.category ?? 'weddings',
              city: requests?.city ?? 'riyadh',
              eventDate: new Date(r.event_date),
              guests: requests?.guests ?? 0,
              value: r.contracts?.offers?.price ?? 0,
              paid,
              status: (paid > 0 ? 'confirmed' : 'pending') as BookingStatus,
              stage: r.stage,
            };
          });
        setBookings(mapped);
        setLoading(false);
      });
  }, [session]);

  return (
    <DashboardShell title={t('plannerBookings.title')} subtitle={t('plannerBookings.subtitle')}>
      <div className="p-7">
      {loading ? (
        <div className="grid grid-cols-2 gap-4.5">
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
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-5 w-18 rounded-full" />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-20 rounded-full" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarBlank}
          title={t('plannerBookings.emptyTitle')}
          subtitle={t('plannerBookings.emptySub')}
        />
      ) : (
      <div className="grid grid-cols-2 gap-4.5">
        {shown.map((booking) => {
          const eventDate = formatDate(booking.eventDate, i18n.language, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          const progress = booking.value > 0 ? Math.round((booking.paid / booking.value) * 100) : 0;

          return (
            <Card key={booking.id} pad={18} className="flex flex-col">
              <div className="flex items-start gap-3">
                <Avatar seed={booking.seed} size={46} initials={booking.initials} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[15px] font-semibold text-fg1">{booking.client}</div>
                      <div className="mt-0.5 text-xs text-fg3">{t(`categories.${booking.category}`)}</div>
                    </div>
                    <Badge tone={STATUS_TONE[booking.status]}>{t(`plannerBookings.status.${booking.status}`)}</Badge>
                  </div>
                </div>
              </div>

              <div className="my-3.5 flex flex-wrap gap-1.5">
                <Badge tone="gray" icon={CalendarBlank}>
                  {eventDate}
                </Badge>
                <Badge tone="gray" icon={MapPin}>
                  {t(`cities.${booking.city}`)}
                </Badge>
                <Badge tone="gray" icon={UsersThree}>
                  {formatNumber(booking.guests, i18n.language)}
                </Badge>
                <Badge tone="lav">{t(`plannerBookings.stages.${STAGE_KEY[booking.stage]}`)}</Badge>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
                <div className="flex items-center gap-2 text-[12.5px] text-fg2">
                  <Wallet size={15} className="text-fg3" />
                  <span>
                    {t('plannerBookings.value')}: <b className="text-fg1">{t('common.sar')} {formatNumber(booking.value, i18n.language)}</b>
                  </span>
                </div>
                <div className="text-[12.5px] text-fg3">
                  {t('plannerBookings.paid')}: {t('common.sar')} {formatNumber(booking.paid, i18n.language)} ({formatNumber(progress, i18n.language)}%)
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}
      {bookings.length > visibleCount && (
        <div className="mt-4.5 flex justify-center">
          <Button variant="secondary" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            {t('plannerBookings.loadMore')}
          </Button>
        </div>
      )}
      </div>
    </DashboardShell>
  );
}
