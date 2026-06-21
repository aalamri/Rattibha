'use client';

import { useCallback, useEffect, useState } from 'react';
import { CaretLeft, CaretRight, Plus, Prohibit, X } from 'phosphor-react';
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

interface BlockedDate {
  id: string;
  date: Date;
  label: string | null;
}

const WEEKDAY_SEED = new Date(2024, 0, 7); // a Sunday, for locale weekday labels
const BLOCKED_TONE = { tint: 'var(--color-bg-app)', color: 'var(--color-fg3)' };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const isRTL = useIsRTL();
  const { session } = useAuth();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(() => toDateInputValue(new Date()));
  const [modalLabel, setModalLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBlockedDates = useCallback(() => {
    if (!session) return;
    supabase
      .from('planner_blocked_dates')
      .select('id, date, label')
      .then(({ data }) => {
        const rows = (data ?? []) as Array<{ id: string; date: string; label: string | null }>;
        setBlockedDates(rows.map((r) => ({ id: r.id, date: new Date(r.date), label: r.label })));
      });
  }, [session]);

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

    loadBlockedDates();
  }, [session, loadBlockedDates]);

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

  const inMonth = (date: Date) => date.getFullYear() === viewDate.getFullYear() && date.getMonth() === viewDate.getMonth();
  const monthBookings = bookings.filter((b) => inMonth(b.eventDate)).sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  const monthBlocked = blockedDates.filter((b) => inMonth(b.date)).sort((a, b) => a.date.getTime() - b.date.getTime());

  const bookingForDay = (day: Date) => monthBookings.find((b) => isSameDay(b.eventDate, day));
  const blockedForDay = (day: Date) => monthBlocked.find((b) => isSameDay(b.date, day));

  function goToMonth(delta: number) {
    setViewDate((d) => startOfDay(new Date(d.getFullYear(), d.getMonth() + delta, 1)));
  }

  async function handleSaveBlockedDate() {
    if (!session || !modalDate) return;
    setSaving(true);
    const { error } = await supabase
      .from('planner_blocked_dates')
      .insert({ planner_id: session.user.id, date: modalDate, label: modalLabel.trim() || null });
    setSaving(false);
    if (!error) {
      setModalOpen(false);
      setModalLabel('');
      loadBlockedDates();
    }
  }

  async function handleRemoveBlockedDate(id: string) {
    await supabase.from('planner_blocked_dates').delete().eq('id', id);
    loadBlockedDates();
  }

  const PrevIcon = isRTL ? CaretRight : CaretLeft;
  const NextIcon = isRTL ? CaretLeft : CaretRight;

  const agendaItems = [
    ...monthBookings.map((b) => ({ kind: 'booking' as const, id: b.id, date: b.eventDate, booking: b })),
    ...monthBlocked.map((b) => ({ kind: 'blocked' as const, id: b.id, date: b.date, blocked: b })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

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
              const booking = bookingForDay(day);
              const blocked = !booking ? blockedForDay(day) : undefined;
              const tones = booking ? CATEGORY_COLORS[booking.category] : blocked ? BLOCKED_TONE : null;
              return (
                <div
                  key={i}
                  className="min-h-[74px] rounded-sm border p-1.5"
                  style={{
                    borderColor: booking ? `${tones?.color}55` : 'var(--color-border)',
                    background: tones ? tones.tint : 'var(--color-bg-surface)',
                  }}
                >
                  <div className="text-[12.5px] font-semibold" style={{ color: tones ? tones.color : 'var(--color-fg2)' }}>
                    {formatNumber(day.getDate(), i18n.language)}
                  </div>
                  {booking && (
                    <div
                      className="mt-1 overflow-hidden truncate rounded-xs px-1 py-0.5 text-[10.5px] font-semibold text-white"
                      style={{ background: tones?.color }}
                    >
                      {booking.client}
                    </div>
                  )}
                  {blocked && (
                    <div className="mt-1 flex items-center gap-1 overflow-hidden truncate rounded-xs bg-bg-sunken px-1 py-0.5 text-[10.5px] font-semibold text-fg2">
                      <Prohibit size={10} />
                      <span className="truncate">{blocked.label || t('calendar.blocked')}</span>
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
            {agendaItems.length === 0 ? (
              <p className="text-[13px] text-fg3">{t('calendar.empty')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {agendaItems.map((item) => {
                  const tones = item.kind === 'booking' ? CATEGORY_COLORS[item.booking.category] : BLOCKED_TONE;
                  return (
                    <div key={`${item.kind}-${item.id}`} className="flex items-center gap-2.5">
                      <div
                        className="flex h-[42px] w-[42px] flex-shrink-0 flex-col items-center justify-center rounded-sm"
                        style={{ background: tones.tint }}
                      >
                        <span className="text-[15px] font-bold leading-none" style={{ color: tones.color }}>
                          {formatNumber(item.date.getDate(), i18n.language)}
                        </span>
                        <span className="text-[9px] uppercase" style={{ color: tones.color }}>
                          {formatDate(item.date, i18n.language, { month: 'short' })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        {item.kind === 'booking' ? (
                          <>
                            <div className="truncate text-[13px] font-semibold text-fg1">{item.booking.client}</div>
                            <div className="text-[11.5px] text-fg3">
                              {t(`categories.${item.booking.category}`)} · {t(`cities.${item.booking.city}`)}
                            </div>
                          </>
                        ) : (
                          <div className="truncate text-[13px] font-semibold text-fg2">{item.blocked.label || t('calendar.blocked')}</div>
                        )}
                      </div>
                      {item.kind === 'blocked' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDate(item.id)}
                          aria-label={t('calendar.removeBlocked')}
                          className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-fg3 hover:bg-bg-app hover:text-fg1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => {
              setModalDate(toDateInputValue(new Date()));
              setModalLabel('');
              setModalOpen(true);
            }}
          >
            {t('calendar.addEvent')}
          </Button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-plum-900/40 p-4">
          <Card className="w-full max-w-[400px]">
            <div className="mb-1 text-[17px] font-semibold text-fg1">{t('calendar.blockDateModal.title')}</div>
            <p className="mb-4 text-[13px] text-fg3">{t('calendar.blockDateModal.subtitle')}</p>

            <label className="mb-1 block text-[12.5px] font-semibold text-fg2" htmlFor="blocked-date-input">
              {t('calendar.blockDateModal.date')}
            </label>
            <input
              id="blocked-date-input"
              type="date"
              value={modalDate}
              onChange={(e) => setModalDate(e.target.value)}
              className="mb-3.5 w-full rounded-sm border border-border bg-bg-app px-3 py-2.5 text-[13.5px] text-fg1 outline-none focus:border-border-strong"
            />

            <label className="mb-1 block text-[12.5px] font-semibold text-fg2" htmlFor="blocked-date-label">
              {t('calendar.blockDateModal.label')}
            </label>
            <input
              id="blocked-date-label"
              type="text"
              dir="auto"
              value={modalLabel}
              onChange={(e) => setModalLabel(e.target.value)}
              placeholder={t('calendar.blockDateModal.labelPlaceholder')}
              className="mb-5 w-full rounded-sm border border-border bg-bg-app px-3 py-2.5 text-[13.5px] text-fg1 outline-none placeholder:text-fg3 focus:border-border-strong"
            />

            <div className="flex justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                {t('calendar.blockDateModal.cancel')}
              </Button>
              <Button onClick={handleSaveBlockedDate} disabled={saving || !modalDate}>
                {t('calendar.blockDateModal.save')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
