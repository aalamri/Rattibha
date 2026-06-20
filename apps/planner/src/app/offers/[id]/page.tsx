'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarBlank,
  Check,
  ChatCircle,
  Confetti,
  CurrencyCircleDollar,
  Eye,
  FileText,
  HourglassMedium,
  Info,
  NotePencil,
  Package,
  PaperPlaneRight,
  PenNib,
  Tag,
  ThumbsUp,
  Tray,
  UsersThree,
} from 'phosphor-react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { canTransition } from '@/lib/dealStateMachine';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DetailHeader } from '@/components/ui/DetailHeader';
import { InfoRow } from '@/components/ui/InfoRow';
import { Section } from '@/components/ui/Section';
import type { CategoryKey, CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { DealStatus, PackageTier } from '@/lib/database.types';

const STEPS = [
  { key: 'requestReceived', icon: Tray, who: 'client' },
  { key: 'offerSent', icon: PaperPlaneRight, who: 'you' },
  { key: 'clientAccepted', icon: ThumbsUp, who: 'client' },
  { key: 'countersign', icon: PenNib, who: 'you' },
  { key: 'depositReceived', icon: CurrencyCircleDollar, who: 'client' },
  { key: 'eventDay', icon: Confetti, who: null },
] as const;

const STAGE_FOR_STATUS: Record<DealStatus, number> = {
  request: 1,
  offer_sent: 2,
  accepted: 3,
  countersigned: 4,
  deposit_paid: 5,
  completed: 6,
  reviewed: 6,
  declined: 2,
  cancelled: 2,
};

interface DealData {
  id: string;
  dealStatus: DealStatus;
  package: PackageTier;
  price: number;
  category: CategoryKey;
  city: CityKey;
  guests: number;
  eventDate: Date;
  name: string;
  initials: string;
  seed: number;
  contractRef: string | null;
}

export default function DealPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { session } = useAuth();

  const [deal, setDeal] = useState<DealData | null>(null);
  const [signing, setSigning] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;

    const { data } = await supabase
      .from('offers')
      .select(
        'id, deal_status, package, price, requests(category, city, guests, event_date, profiles(full_name, avatar_seed)), contracts(ref)'
      )
      .eq('id', params.id)
      .single();

    if (!data) return;
    const row = data as unknown as {
      id: string;
      deal_status: DealStatus;
      package: PackageTier;
      price: number;
      requests: {
        category: CategoryKey;
        city: CityKey;
        guests: number;
        event_date: string;
        profiles: { full_name: string; avatar_seed: number } | null;
      } | null;
      contracts: { ref: string }[] | { ref: string } | null;
    };

    const contract = Array.isArray(row.contracts) ? row.contracts[0] : row.contracts;

    setDeal({
      id: row.id,
      dealStatus: row.deal_status,
      package: row.package,
      price: row.price,
      category: row.requests?.category ?? 'weddings',
      city: row.requests?.city ?? 'riyadh',
      guests: row.requests?.guests ?? 0,
      eventDate: row.requests ? new Date(row.requests.event_date) : new Date(),
      name: row.requests?.profiles?.full_name ?? '—',
      initials: (row.requests?.profiles?.full_name ?? '?').charAt(0),
      seed: row.requests?.profiles?.avatar_seed ?? 0,
      contractRef: contract?.ref ?? null,
    });
  }, [session, params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!deal) {
    return <DashboardShell title={t('deal.breadcrumb')}><div className="p-7" /></DashboardShell>;
  }

  const eventDate = deal.eventDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const PRICE = deal.price;
  const DEPOSIT = Math.round(PRICE * 0.2);
  const STAGE = STAGE_FOR_STATUS[deal.dealStatus];
  const canCountersign = canTransition(deal.dealStatus, 'countersigned');

  const stepDetail = (key: typeof STEPS[number]['key']) => {
    switch (key) {
      case 'requestReceived':
        return `${t(`categories.${deal.category}`)} · ${formatNumber(deal.guests, i18n.language)} ${t('common.guests')} · ${eventDate}`;
      case 'offerSent':
        return t('deal.stepDetails.offerSent', { price: formatNumber(PRICE, i18n.language) });
      case 'clientAccepted':
        return t('deal.stepDetails.clientAccepted');
      case 'countersign':
        return t('deal.stepDetails.countersign');
      case 'depositReceived':
        return `${t('common.sar')} ${formatNumber(DEPOSIT, i18n.language)} (${formatNumber(20, i18n.language)}%)`;
      case 'eventDay':
        return eventDate;
    }
  };

  async function handleCountersign() {
    if (!deal) return;
    setSigning(true);

    let contractId: string | null = null;
    const { data: existing } = await supabase.from('contracts').select('id').eq('offer_id', deal.id).maybeSingle();

    if (existing) {
      contractId = existing.id;
      await supabase.from('contracts').update({ signed_by_planner_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      const ref = `RTB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: created } = await supabase
        .from('contracts')
        .insert({
          offer_id: deal.id,
          ref,
          signed_by_customer_at: new Date().toISOString(),
          signed_by_planner_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      contractId = created?.id ?? null;
    }

    await supabase.from('offers').update({ deal_status: 'countersigned' }).eq('id', deal.id);

    if (contractId) {
      const { data: existingPayments } = await supabase.from('payments').select('id').eq('contract_id', contractId);
      if (!existingPayments || existingPayments.length === 0) {
        await supabase.from('payments').insert([
          { contract_id: contractId, type: 'deposit', amount: DEPOSIT },
          { contract_id: contractId, type: 'balance', amount: PRICE - DEPOSIT },
        ]);
      }

      const { data: existingBooking } = await supabase.from('bookings').select('id').eq('contract_id', contractId).maybeSingle();
      if (!existingBooking) {
        await supabase.from('bookings').insert({
          contract_id: contractId,
          stage: 'planning',
          event_date: deal.eventDate.toISOString().slice(0, 10),
          platform_fee: Math.round(PRICE * 0.10 * 100) / 100,
        });
      }
    }

    setSigning(false);
    toast.success(t('toast.countersigned'));
    await load();
  }

  return (
    <DashboardShell title={deal.name} subtitle={t(`categories.${deal.category}`)}>
      <div className="p-7">
        <DetailHeader onBack={() => router.push('/offers')} crumb={t('deal.breadcrumb')}>
          <Button variant="secondary" size="sm" icon={ChatCircle}>
            {t('deal.messageClient')}
          </Button>
          {canCountersign && (
            <Button size="sm" icon={PenNib} disabled={signing} onClick={handleCountersign}>
              {t('deal.countersign')}
            </Button>
          )}
        </DetailHeader>

        <div className="grid grid-cols-[1.6fr_1fr] gap-5">
          <div className="flex flex-col gap-5">
            {/* client + status banner */}
            <Section>
              <div className="flex items-center gap-4">
                <Avatar seed={deal.seed} size={56} initials={deal.initials} />
                <div className="flex-1">
                  <div className="font-display text-[23px] font-semibold text-fg1">{deal.name}</div>
                  <div className="mt-0.5 text-[13px] text-fg3">
                    {t(`categories.${deal.category}`)} · {t(`cities.${deal.city}`)} · {deal.guests} {t('common.guests')}
                  </div>
                </div>
                {canCountersign && (
                  <Badge tone="amber" icon={PenNib}>
                    {t('deal.awaitingSignature')}
                  </Badge>
                )}
              </div>
              {canCountersign && (
                <div className="mt-4 flex items-center gap-2.5 rounded-md bg-warning-bg px-3.5 py-3">
                  <Info size={19} weight="fill" className="text-gold-600" />
                  <span className="text-[12.5px] leading-relaxed text-[#7a5e15]">
                    <Trans
                      i18nKey="deal.acceptedInfo"
                      values={{ name: deal.name.split(' ')[0] }}
                      components={{ bold: <b /> }}
                    />
                  </span>
                </div>
              )}
            </Section>

            {/* shared timeline */}
            <Section title={t('deal.timeline')}>
              {STEPS.map((step, i) => {
                const done = i < STAGE;
                const active = i === STAGE;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full ${
                          done ? 'bg-brand' : active ? 'bg-warning-bg' : 'border-[1.5px] border-border-strong bg-bg-surface'
                        }`}
                      >
                        {done ? (
                          <Check size={16} weight="bold" className="text-white" />
                        ) : (
                          <StepIcon size={16} className={active ? 'text-gold-600' : 'text-fg3'} />
                        )}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`mt-0.5 min-h-[26px] w-0.5 flex-1 ${done ? 'bg-brand' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4.5 pt-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-semibold ${done || active ? 'text-fg1' : 'text-fg2'}`}>
                          {t(`deal.steps.${step.key}`)}
                        </span>
                        {active && <Badge tone="amber">{t('deal.now')}</Badge>}
                        {step.who && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              step.who === 'you' ? 'bg-purple-50 text-brand' : 'bg-purple-50/60 text-fg3'
                            }`}
                          >
                            {t(`deal.who.${step.who}`)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-fg3">{stepDetail(step.key)}</div>
                    </div>
                  </div>
                );
              })}
            </Section>

            {/* contract to countersign */}
            {(deal.contractRef || canCountersign) && (
              <Section
                title={t('deal.serviceAgreement')}
                action={canCountersign ? <Badge tone="amber" icon={HourglassMedium}>{t('deal.actionNeeded')}</Badge> : undefined}
              >
                <div className="flex items-center gap-3.5 pb-3.5 pt-1">
                  <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-md bg-purple-50">
                    <FileText size={22} weight="fill" className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-fg1">{t('deal.agreementName')}</div>
                    {deal.contractRef && <div className="text-xs text-fg3">{deal.contractRef}</div>}
                  </div>
                  <Button size="sm" variant="secondary" icon={Eye}>
                    {t('deal.view')}
                  </Button>
                </div>
                {canCountersign && (
                  <div className="flex items-center gap-3 rounded-md border-[1.5px] border-dashed border-border-strong bg-bg-app px-4 py-3.5">
                    <NotePencil size={24} className="text-fg3" />
                    <span className="flex-1 text-[13px] text-fg2">{t('deal.countersignRequired')}</span>
                    <Button size="sm" icon={PenNib} disabled={signing} onClick={handleCountersign}>
                      {t('deal.signNow')}
                    </Button>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* right rail */}
          <div className="flex flex-col gap-5">
            <Section title={t('deal.dealSummary')}>
              <InfoRow icon={Package} label={t('deal.package')} value={t(`quote.packages.${deal.package}`)} />
              <InfoRow icon={Confetti} label={t('deal.event')} value={t(`categories.${deal.category}`)} />
              <InfoRow icon={CalendarBlank} label={t('quote.date')} value={eventDate} />
              <InfoRow icon={UsersThree} label={t('quote.guests')} value={formatNumber(deal.guests, i18n.language)} last />
            </Section>

            <Section title={t('deal.payment')}>
              <InfoRow icon={Tag} label={t('deal.totalFee')} value={`${t('common.sar')} ${formatNumber(PRICE, i18n.language)}`} />
              <InfoRow
                icon={HourglassMedium}
                label={t('deal.depositOnSigning')}
                value={`${t('common.sar')} ${formatNumber(DEPOSIT, i18n.language)}`}
              />
              <InfoRow
                icon={Tag}
                label={t('deal.platformFee')}
                value={`− ${t('common.sar')} ${formatNumber(Math.round(PRICE * 0.05), i18n.language)}`}
                last
              />
              <div className="flex items-center justify-between pt-3">
                <span className="text-[13.5px] text-fg2">{t('deal.earningsAfterFee')}</span>
                <span className="text-[15px] font-bold text-emerald-600">
                  {t('common.sar')} {formatNumber(Math.round(PRICE * 0.95), i18n.language)}
                </span>
              </div>
            </Section>

            {canCountersign && (
              <Section className="relative overflow-hidden border-none bg-[linear-gradient(150deg,#5B2C83,#3A1B52)]">
                <div className="relative">
                  <div className="mb-1 text-[13px] text-white/85">{t('deal.oneStepAway')}</div>
                  <div className="font-display text-[19px] font-semibold leading-tight text-white">
                    {t('deal.countersignCta')}
                  </div>
                  <p className="my-3.5 text-xs leading-relaxed text-white/75">{t('deal.countersignNote')}</p>
                  <Button variant="gold" icon={PenNib} className="w-full" disabled={signing} onClick={handleCountersign}>
                    {t('deal.countersignNow')}
                  </Button>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
