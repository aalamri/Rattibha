'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarBlank,
  ChatCircle,
  MapPin,
  PaperPlaneRight,
  UsersThree,
  Wallet,
} from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DetailHeader } from '@/components/ui/DetailHeader';
import { InfoRow } from '@/components/ui/InfoRow';
import { Section } from '@/components/ui/Section';
import { CATEGORY_ICONS, type CategoryKey, type CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { BudgetRange, PackageTier } from '@/lib/database.types';

const PACKAGES = ['essentials', 'signature', 'luxury'] as const;
type PackageKey = (typeof PACKAGES)[number];

const PRICE_MIN = 6000;
const PRICE_MAX = 40000;

interface RequestDetail {
  id: string;
  category: CategoryKey;
  city: CityKey;
  eventDate: Date;
  guests: number;
  budgetKey: BudgetRange;
  note: string;
  name: string;
  initials: string;
  seed: number;
  createdAt: Date;
  offers: number;
}

export default function SubmitQuotePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { session } = useAuth();

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [pkg, setPkg] = useState<PackageKey>('signature');
  const [price, setPrice] = useState(18000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;

    supabase
      .from('requests')
      .select('id, category, city, event_date, guests, budget, note, created_at, profiles(full_name, avatar_seed), offers(count)')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const row = data as unknown as {
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
        };

        setRequest({
          id: row.id,
          category: row.category,
          city: row.city,
          eventDate: new Date(row.event_date),
          guests: row.guests,
          budgetKey: row.budget,
          note: row.note ?? '',
          name: row.profiles?.full_name ?? '—',
          initials: (row.profiles?.full_name ?? '?').charAt(0),
          seed: row.profiles?.avatar_seed ?? 0,
          createdAt: new Date(row.created_at),
          offers: row.offers?.[0]?.count ?? 0,
        });
      });
  }, [session, params.id]);

  if (!request) {
    return <DashboardShell title={t('openRequests.sendQuote')}><div className="p-7" /></DashboardShell>;
  }

  const fee = Math.round(price * 0.05);
  const earnings = price - fee;
  const CategoryIcon = CATEGORY_ICONS[request.category];

  const eventDateLabel = request.eventDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const hoursAgo = (Date.now() - request.createdAt.getTime()) / 3_600_000;
  const posted =
    hoursAgo >= 24
      ? t('common.daysAgo', { count: Math.round(hoursAgo / 24) })
      : t('common.hoursAgo', { count: Math.round(hoursAgo) });

  const firstName = request.name.split(' ')[0];

  async function handleSubmit() {
    if (!session || !request) return;
    setSubmitting(true);

    const message = t('quote.messagePreview', {
      name: firstName,
      category: t(`categories.${request.category}`).toLowerCase(),
      package: t(`quote.packages.${pkg}`),
    });

    await supabase.from('offers').insert({
      request_id: request.id,
      planner_id: session.user.id,
      package: pkg as PackageTier,
      price,
      message,
    });

    toast.success(t('toast.quoteSent'));
    router.push('/offers');
  }

  return (
    <DashboardShell title={t('openRequests.sendQuote')}>
    <div className="p-7">
      <DetailHeader onBack={() => router.push('/open-requests')} crumb={t('quote.breadcrumb')}>
        <Button variant="secondary" size="sm" icon={ChatCircle}>
          {t('quote.askQuestion')}
        </Button>
      </DetailHeader>

      <div className="grid grid-cols-[1fr_1.1fr] gap-5">
        {/* the request */}
        <Section title={t('quote.clientRequest')}>
          <div className="mb-3.5 flex items-center gap-3">
            <Avatar seed={request.seed} size={48} initials={request.initials} />
            <div>
              <div className="inline-flex items-center gap-1.5 text-[15px] font-bold text-fg1">{request.name}</div>
              <div className="text-[12.5px] text-fg3">
                {t('quote.posted')} {posted} · {formatNumber(request.offers, i18n.language)} {t('quote.offersSoFar')}
              </div>
            </div>
          </div>
          <p className="mb-4 text-[13.5px] leading-relaxed text-fg2">&ldquo;{request.note}&rdquo;</p>
          <InfoRow icon={CategoryIcon} label={t('quote.eventType')} value={t(`categories.${request.category}`)} />
          <InfoRow icon={CalendarBlank} label={t('quote.date')} value={eventDateLabel} />
          <InfoRow icon={UsersThree} label={t('quote.guests')} value={formatNumber(request.guests, i18n.language)} />
          <InfoRow icon={MapPin} label={t('quote.city')} value={t(`cities.${request.city}`)} last />
          <div className="flex items-center gap-3 pt-3">
            <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-sm bg-gold-200">
              <Wallet size={17} className="text-gold-600" />
            </div>
            <span className="flex-1 text-[13.5px] text-fg2">{t('quote.clientBudget')}</span>
            <span className="text-[15px] font-bold text-fg1">
              {t('common.sar')} {t(`common.budgets.${request.budgetKey}`)}
            </span>
          </div>
        </Section>

        {/* your proposal */}
        <div className="flex flex-col gap-5">
          <Section title={t('quote.yourProposal')}>
            <div className="mb-2.5 text-[12.5px] font-semibold text-fg2">{t('quote.package')}</div>
            <div className="mb-4.5 flex gap-2">
              {PACKAGES.map((p) => {
                const active = pkg === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPkg(p)}
                    className={`flex-1 rounded-md border-[1.5px] px-1.5 py-2.5 text-center text-[13px] font-semibold transition-colors ${
                      active ? 'border-brand bg-purple-50 text-brand' : 'border-border-strong bg-bg-surface text-fg1'
                    }`}
                  >
                    {t(`quote.packages.${p}`)}
                  </button>
                );
              })}
            </div>

            <div className="mb-2.5 text-[12.5px] font-semibold text-fg2">
              {t('quote.yourQuote')} · {t('common.sar')} {formatNumber(price, i18n.language)}
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              aria-label={t('quote.yourQuote')}
              aria-valuetext={`${t('common.sar')} ${formatNumber(price, i18n.language)}`}
              className="mb-1.5 w-full accent-brand"
            />
            <div className="mb-4.5 flex justify-between text-[11px] text-fg3">
              <span>
                {t('common.sar')} {formatNumber(PRICE_MIN, i18n.language)}
              </span>
              <span>
                {t('common.sar')} {formatNumber(PRICE_MAX, i18n.language)}
              </span>
            </div>

            <div className="mb-2.5 text-[12.5px] font-semibold text-fg2">{t('quote.messageToClient')}</div>
            <div className="min-h-[76px] rounded-md border-[1.5px] border-border-strong bg-bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-fg2">
              {t('quote.messagePreview', {
                name: firstName,
                category: t(`categories.${request.category}`).toLowerCase(),
                package: t(`quote.packages.${pkg}`),
              })}
            </div>
          </Section>

          {/* payout preview */}
          <Card pad={18} className="relative overflow-hidden border-none bg-[linear-gradient(150deg,#5B2C83,#3A1B52)]">
            <div className="relative">
              <div className="flex justify-between py-0.5 text-[13px] text-white/85">
                <span>{t('quote.yourQuote')}</span>
                <span>
                  {t('common.sar')} {formatNumber(price, i18n.language)}
                </span>
              </div>
              <div className="flex justify-between py-0.5 text-[13px] text-white/70">
                <span>{t('quote.platformFee')}</span>
                <span>
                  − {t('common.sar')} {formatNumber(fee, i18n.language)}
                </span>
              </div>
              <div className="my-2 h-px bg-white/20" />
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-white">{t('quote.youEarn')}</span>
                <span className="font-display text-2xl font-bold text-gold-500">
                  {t('common.sar')} {formatNumber(earnings, i18n.language)}
                </span>
              </div>
            </div>
          </Card>

          <Button icon={PaperPlaneRight} disabled={submitting} className="w-full" onClick={handleSubmit}>
            {t('quote.sendProposal')}
          </Button>
        </div>
      </div>
    </div>
    </DashboardShell>
  );
}
