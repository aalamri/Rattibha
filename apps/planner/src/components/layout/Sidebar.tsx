'use client';

import { useEffect, useState } from 'react';
import { CrownSimple, RocketLaunch } from 'phosphor-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NAV } from '@/data/planner';
import { useAuth } from '@/lib/AuthContext';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const { session, profile } = useAuth();
  const [badges, setBadges] = useState<Record<string, number>>({});
  const visibleNav = NAV.filter((item) => !item.adminOnly || profile?.is_admin);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .then(({ count }) => setBadges((b) => ({ ...b, browse: count ?? 0 })));

    supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('planner_id', session.user.id)
      .eq('status', 'pending')
      .then(({ count }) => setBadges((b) => ({ ...b, leads: count ?? 0 })));

    // "Awaiting reply" — conversations whose most recent message was sent by
    // the customer, not the planner. There's no read/unread tracking on
    // messages, so this is the most honest proxy for an "unread" badge.
    supabase
      .from('offers')
      .select('request_id')
      .eq('planner_id', session.user.id)
      .then(({ data: offerRows }) => {
        const requestIds = (offerRows ?? []).map((r) => r.request_id as string);
        if (requestIds.length === 0) {
          setBadges((b) => ({ ...b, messages: 0 }));
          return;
        }

        supabase
          .from('messages')
          .select('request_id, sender_id, created_at')
          .in('request_id', requestIds)
          .eq('planner_id', session.user.id)
          .order('created_at', { ascending: false })
          .then(({ data: msgRows }) => {
            const rows = (msgRows ?? []) as Array<{ request_id: string; sender_id: string; created_at: string }>;
            const lastSenderByRequest = new Map<string, string>();
            rows.forEach((m) => {
              if (!lastSenderByRequest.has(m.request_id)) lastSenderByRequest.set(m.request_id, m.sender_id);
            });
            const awaitingReply = [...lastSenderByRequest.values()].filter((senderId) => senderId !== session.user.id).length;
            setBadges((b) => ({ ...b, messages: awaitingReply }));
          });
      });
  }, [session]);

  return (
    <aside className="flex h-full w-[252px] flex-shrink-0 flex-col border-e border-border bg-bg-surface p-4">
      <div className="flex items-center gap-2 px-2 pb-5">
        <span className="font-display text-xl font-semibold text-fg1">{t('common.appName')}</span>
        <Badge tone="gold" icon={CrownSimple}>
          {t('common.pro')}
        </Badge>
      </div>

      <nav aria-label={t('sidebar.navLabel')} className="flex flex-col gap-0.5">
        {visibleNav.map((item) => {
          const active = pathname === item.href;
          const ItemIcon = item.icon;
          const badge = badges[item.key];
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-purple-50 text-brand font-semibold' : 'text-fg2 hover:bg-bg-app'
              }`}
            >
              <ItemIcon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {!!badge && (
                <span
                  className={`grid h-[19px] min-w-[19px] place-items-center rounded-full px-1 text-[11px] font-bold ${
                    active ? 'bg-brand text-white' : 'bg-lavender-100 text-brand'
                  }`}
                >
                  {formatNumber(badge, i18n.language)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="relative overflow-hidden rounded-md bg-[linear-gradient(150deg,#5B2C83,#3A1B52)] p-4">
          <div className="relative">
            <div className="font-display text-base font-semibold text-white">{t('sidebar.boostTitle')}</div>
            <p className="my-1 mb-3 text-xs leading-relaxed text-white/80">{t('sidebar.boostBody')}</p>
            <Button size="sm" variant="gold" icon={RocketLaunch}>
              {t('sidebar.upgrade')}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
