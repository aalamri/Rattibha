'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CalendarCheck, ChatCircle, PaperPlaneTilt, CheckCircle, Star } from 'phosphor-react';
import type { Icon } from 'phosphor-react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { CategoryKey, CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

type NotificationType = 'new_request' | 'new_message' | 'customer_status';

interface NotificationRow {
  id: string;
  type: NotificationType | string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, Icon> = {
  new_request: PaperPlaneTilt,
  new_message: ChatCircle,
  customer_status: CheckCircle,
};

const STATUS_ICON: Record<string, Icon> = {
  accepted: CheckCircle,
  declined: CheckCircle,
  deposit_paid: CalendarCheck,
  reviewed: Star,
};

function timeAgo(iso: string, t: TFunction) {
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (hours < 1) return t('common.hoursAgo', { count: 1 });
  if (hours < 24) return t('common.hoursAgo', { count: Math.round(hours) });
  return t('common.daysAgo', { count: Math.round(hours / 24) });
}

function notificationHref(n: NotificationRow): string | null {
  switch (n.type) {
    case 'new_request':
      return n.payload.request_id ? `/open-requests/${n.payload.request_id}/quote` : '/open-requests';
    case 'new_message':
      return '/messages';
    case 'customer_status':
      return n.payload.offer_id ? `/offers/${n.payload.offer_id}` : '/offers';
    default:
      return null;
  }
}

export function NotificationsPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('notifications')
      .select('id, type, payload, read, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setNotifications((data as unknown as NotificationRow[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`notifications-${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          const row = payload.new as NotificationRow;
          setNotifications((prev) => [row, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    if (!session) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false);
  }

  async function handleSelect(n: NotificationRow) {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) => prev.map((row) => (row.id === n.id ? { ...row, read: true } : row)));
      await supabase.from('notifications').update({ read: true }).eq('id', n.id);
    }
    const href = notificationHref(n);
    if (href) router.push(href);
  }

  function describe(n: NotificationRow): string {
    if (n.type === 'new_request') {
      const category = n.payload.category as CategoryKey | undefined;
      const city = n.payload.city as CityKey | undefined;
      return t('notifications.types.newRequest', {
        category: category ? t(`categories.${category}`) : '',
        city: city ? t(`cities.${city}`) : '',
      });
    }
    if (n.type === 'new_message') {
      return t('notifications.types.newMessage');
    }
    if (n.type === 'customer_status') {
      const dealStatus = n.payload.deal_status as string | undefined;
      return t(`notifications.types.customerStatus.${dealStatus}`, { defaultValue: t('notifications.types.customerStatusFallback') });
    }
    return t('notifications.types.generic');
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('common.notifications')}
        aria-expanded={open}
        className="relative grid h-[42px] w-[42px] place-items-center rounded-md border border-border"
      >
        <Bell size={19} className="text-fg1" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute end-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-bg-surface bg-danger" aria-hidden="true" />
        )}
      </button>

      {open && (
        <>
          <button type="button" aria-label={t('common.close')} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute end-0 top-[calc(100%+10px)] z-50 w-[360px] rounded-md border border-border bg-bg-surface shadow-card">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-fg1">{t('notifications.title')}</span>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs font-bold text-brand">
                  {t('notifications.markAllRead')}
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto border-t border-border">
              {loading ? (
                <div className="px-4 py-8 text-center text-[13px] text-fg3">…</div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Bell size={28} className="text-fg3" />
                  <p className="text-[13px] font-semibold text-fg2">{t('notifications.empty')}</p>
                  <p className="max-w-[220px] text-xs text-fg3">{t('notifications.emptyNote')}</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const ItemIcon =
                    n.type === 'customer_status'
                      ? STATUS_ICON[n.payload.deal_status as string] ?? CheckCircle
                      : TYPE_ICON[n.type] ?? Bell;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleSelect(n)}
                      className={`flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-start last:border-b-0 ${
                        n.read ? 'bg-bg-surface' : 'bg-purple-50'
                      }`}
                    >
                      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-sm border border-border bg-bg-app">
                        <ItemIcon size={17} weight="fill" className="text-brand" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold leading-snug text-fg1">{describe(n)}</div>
                        {n.type === 'new_message' && typeof n.payload.preview === 'string' && (
                          <div className="mt-0.5 truncate text-xs text-fg3">{n.payload.preview}</div>
                        )}
                        <div className="mt-1 text-[11px] text-fg3">{timeAgo(n.created_at, t)}</div>
                      </div>
                      {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
