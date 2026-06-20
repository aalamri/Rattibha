'use client';

import { useEffect, useState } from 'react';
import { CaretLeft, CaretRight, Plus } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { CATEGORY_COLORS, type CategoryKey, type CityKey } from '@/data/categories';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { BookingStage } from '@/lib/database.types';

interface CalendarBooking {
  id: string;
  client: string;
  category: CategoryKey;
  city: CityKey;
  eventDate: Date;
}

const WEEKDAY_SEED = new Date(2024, 0, 7); // a Sunday, for locale weekday labels

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const isRTL = useIsRTL();
  const { session } = useAuth();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    if (!session) return;

    supabase
      .from('bookings')
      .select(
        'id, stage, event_date, contracts(offers(requests(category, city, profiles(full_name, avatar_seed))))'
      )
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          stage: BookingStage;
          event_date: string;
          contracts: {
            offers: {
              requests: {
                category: CategoryKey;
                city: CityKey;
                profiles: { full_name: string; avatar_seed: number } | null;
              } | null;
            } | null;
          } | null;
        }>;

        setBookings(
          rows.map((r) => {
            const requests = r.contracts?.offers?.requests;
            return {
              id: r.id,
              client: requests?.profiles?.full_name ?? '—',
              category: requests?.category ?? 'weddings',
              city: requests?.city ?? 'riyadh',
              eventDate: new Date(r.event_date),
            };
          })
        );
      });
  }, [session]);

  const monthLabel = formatDate(viewDate, i18n.language, { month: 'long', year: 'numeric' });
  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'short' }).format(
      new Date(WEEKDAY_SEED.getFullYear(), WEEKDAY_SEED.getMonth(), WEEKDAY_SEED.getDate() + i)
    )
  );

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  const monthBookings = bookings
    .filter((b) => b.eventDate.getFullYear() === viewDate.getFullYear() && b.eventDate.getMonth() === viewDate.getMonth())
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const eventForDay = (day: Date) => monthBookings.find((b) => isSameDay(b.eventDate, day));

  function goToMonth(delta: number) {
    setViewDate((d) => startOfDay(new Date(d.getFullYear(), d.getMonth() + delta, 1)));
  }

  const PrevIcon = isRTL ? CaretRight : CaretLeft;
  const NextIcon = isRTL ? CaretLeft : CaretRight;

  return (
    <DashboardShell title={t('calendar.title')} subtitle={t('calendar.subtitle')}>
      <div className="grid grid-cols-[1fr_300px] gap-5 p-7">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-display text-xl font-semibold text-fg1">{monthLabel}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                aria-label={t('calendar.prevMonth')}
                className="grid h-8 w-8 place-items-center rounded-sm border border-border text-fg2"
              >
                <PrevIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                aria-label={t('calendar.nextMonth')}
                className="grid h-8 w-8 place-items-center rounded-sm border border-border text-fg2"
              >
                <NextIcon size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {weekdayLabels.map((label, i) => (
              <div key={i} className="py-1 text-center text-[11.5px] font-semibold text-fg3">
                {label}
              </div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[74px] rounded-sm" />;
              const ev = eventForDay(day);
              const tones = ev ? CATEGORY_COLORS[ev.category] : null;
              return (
                <div
                  key={i}
                  className="min-h-[74px] rounded-sm border p-1.5"
                  style={{
                    borderColor: tones ? `${tones.color}55` : 'var(--color-border)',
                    background: tones ? tones.tint : 'var(--color-bg-surface)',
                  }}
                >
                  <div className="text-[12.5px] font-semibold" style={{ color: tones ? tones.color : 'var(--color-fg2)' }}>
                    {formatNumber(day.getDate(), i18n.language)}
                  </div>
                  {ev && (
                    <div
                      className="mt-1 overflow-hidden truncate rounded-xs px-1 py-0.5 text-[10.5px] font-semibold text-white"
                      style={{ background: tones?.color }}
                    >
                      {ev.client}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card>
            <div className="mb-3 text-[15px] font-semibold text-fg1">{t('calendar.thisMonth')}</div>
            {monthBookings.length === 0 ? (
              <p className="text-[13px] text-fg3">{t('calendar.empty')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {monthBookings.map((b) => {
                  const tones = CATEGORY_COLORS[b.category];
                  return (
                    <div key={b.id} className="flex items-center gap-2.5">
                      <div
                        className="flex h-[42px] w-[42px] flex-shrink-0 flex-col items-center justify-center rounded-sm"
                        style={{ background: tones.tint }}
                      >
                        <span className="text-[15px] font-bold leading-none" style={{ color: tones.color }}>
                          {formatNumber(b.eventDate.getDate(), i18n.language)}
                        </span>
                        <span className="text-[9px] uppercase" style={{ color: tones.color }}>
                          {formatDate(b.eventDate, i18n.language, { month: 'short' })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-fg1">{b.client}</div>
                        <div className="text-[11.5px] text-fg3">{t(`categories.${b.category}`)} · {t(`cities.${b.city}`)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Button variant="secondary" icon={Plus}>
            {t('calendar.addEvent')}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
