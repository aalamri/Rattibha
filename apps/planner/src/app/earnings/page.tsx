'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUp, Bank, Clock } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/lib/AuthContext';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { PaymentStatus, PaymentType } from '@/lib/database.types';

interface PaymentRow {
  id: string;
  client: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  date: Date | null;
}

function isSameMonth(date: Date, ref: Date) {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
}

export default function EarningsPage() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('payments')
      .select('id, type, amount, status, paid_at, created_at, contracts(offers(requests(profiles(full_name))))')
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as Array<{
          id: string;
          type: PaymentType;
          amount: number;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
          contracts: { offers: { requests: { profiles: { full_name: string } | null } | null } | null } | null;
        }>;

        const mapped: PaymentRow[] = rows
          .map((r) => ({
            id: r.id,
            client: r.contracts?.offers?.requests?.profiles?.full_name ?? '—',
            type: r.type,
            amount: r.amount,
            status: r.status,
            date: r.paid_at ? new Date(r.paid_at) : null,
          }))
          .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

        setPayments(mapped);
        setLoading(false);
      });
  }, [session]);

  const now = new Date();
  const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const paid = payments.filter((p) => p.status === 'paid');
  const pending = payments.filter((p) => p.status === 'pending');

  const availableBalance = paid.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthRevenue = paid.filter((p) => p.date && isSameMonth(p.date, now)).reduce((sum, p) => sum + p.amount, 0);
  const lastMonthRevenue = paid.filter((p) => p.date && isSameMonth(p.date, lastMonthRef)).reduce((sum, p) => sum + p.amount, 0);
  const pendingTotal = pending.reduce((sum, p) => sum + p.amount, 0);

  const delta = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : null;

  return (
    <DashboardShell title={t('earnings.title')} subtitle={t('earnings.subtitle')}>
      <div className="flex flex-col gap-4.5 p-7">
        <div className="grid grid-cols-3 gap-4">
          <Card className="relative overflow-hidden border-none" style={{ background: 'linear-gradient(140deg,#5B2C83,#3A1B52)' }}>
            <div className="relative">
              <div className="text-[13px] text-white/80">{t('earnings.availableBalance')}</div>
              <div className="my-1.5 font-display text-[34px] font-bold text-white">
                {t('common.sar')} {formatNumber(availableBalance, i18n.language)}
              </div>
              <Button variant="gold" size="sm" icon={Bank}>
                {t('earnings.withdraw')}
              </Button>
            </div>
          </Card>
          <Card pad={18}>
            <div className="text-[13px] text-fg3">{t('earnings.thisMonth')}</div>
            <div className="my-1.5 font-display text-[30px] font-bold text-fg1">
              {t('common.sar')} {formatNumber(thisMonthRevenue, i18n.language)}
            </div>
            {delta !== null && (
              <Badge tone={delta >= 0 ? 'green' : 'red'} icon={ArrowUp}>
                {t('earnings.vsLastMonth', { sign: delta >= 0 ? '+' : '', pct: delta })}
              </Badge>
            )}
          </Card>
          <Card pad={18}>
            <div className="text-[13px] text-fg3">{t('earnings.pendingPayouts')}</div>
            <div className="my-1.5 font-display text-[30px] font-bold text-fg1">
              {t('common.sar')} {formatNumber(pendingTotal, i18n.language)}
            </div>
            <Badge tone="amber" icon={Clock}>
              {t('earnings.awaiting', { count: pending.length })}
            </Badge>
          </Card>
        </div>

        <Card pad={0}>
          <div className="px-5.5 pb-3 pt-4.5 text-[15px] font-semibold text-fg1">{t('earnings.transactions')}</div>
          {loading ? (
            <div className="flex flex-col gap-3 p-5.5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-5.5">
              <EmptyState icon={Bank} title={t('earnings.emptyTitle')} subtitle={t('earnings.emptySub')} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 border-t border-border px-5.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-fg3">
                <span>{t('earnings.client')}</span>
                <span>{t('earnings.date')}</span>
                <span>{t('earnings.type')}</span>
                <span className="text-end">{t('earnings.amount')}</span>
              </div>
              {payments.map((p) => (
                <div key={p.id} className="grid grid-cols-4 items-center border-t border-border px-5.5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-[34px] w-[34px] place-items-center rounded-xs ${
                        p.status === 'paid' ? 'bg-emerald-100' : 'bg-gold-200'
                      }`}
                    >
                      {p.status === 'paid' ? (
                        <ArrowDownLeft size={16} className="text-emerald-600" />
                      ) : (
                        <Clock size={16} className="text-gold-600" />
                      )}
                    </div>
                    <span className="text-[13.5px] font-semibold text-fg1">{p.client}</span>
                  </div>
                  <span className="text-[13px] text-fg2">
                    {p.date ? formatDate(p.date, i18n.language, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <span className="text-[13px] text-fg2">{t(`earnings.paymentType.${p.type}`)}</span>
                  <span className="text-end text-sm font-bold text-fg1">
                    {t('common.sar')} {formatNumber(p.amount, i18n.language)}
                  </span>
                </div>
              ))}
            </>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
