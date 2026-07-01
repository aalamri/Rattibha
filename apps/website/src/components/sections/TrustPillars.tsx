'use client';

import { ListChecks, LockKey, ShieldCheck, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';
import { SectionHead } from './SectionHead';

const PILLARS = [
  { icon: ShieldCheck, tileColor: '#5B2C83', key: 'verified' },
  { icon: ListChecks, tileColor: '#7E3FAE', key: 'quotes' },
  { icon: LockKey, tileColor: '#8B6914', key: 'deposit' },
  { icon: Star, tileColor: '#5B2C83', key: 'reviews' },
] as const;

/** Four trust/credibility pillars — inserted between HowItWorks and Testimonials. */
export function TrustPillars() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;

  return (
    <div className="border-y border-border bg-[#F5F0FA]">
      <div className="mx-auto max-w-[1180px] px-10 py-[72px]">
        <SectionHead center over={t('trust.overline')} title={t('trust.title')} sub={t('trust.subtitle')} />
        <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, tileColor, key }) => (
            <div
              key={key}
              className="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_24px_-16px_rgba(43,34,51,0.18)]"
            >
              <div
                className="mb-4 grid h-13 w-13 place-items-center rounded-[16px]"
                style={{ background: tileColor }}
              >
                <Icon size={26} weight="fill" className="text-white" />
              </div>
              <h3 className="font-display text-[18px] font-semibold text-fg1">{t(`trust.${key}Title`)}</h3>
              <p className="mt-1.5 text-[13.5px] leading-[1.55] text-fg2">{t(`trust.${key}Desc`)}</p>
            </div>
          ))}
        </div>

        {/* Concrete, verifiable proof (not just claims) — registered
            business, real payment provider, and links to the actual
            policy pages, distinct from the emotional pillars above. */}
        <div className="mt-6 flex flex-col flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-border bg-white px-6 py-5 text-center sm:flex-row">
          <span className="text-[13px] font-semibold text-fg2">{t('trust.proofBusiness')}</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="text-[13px] font-semibold text-fg2">{t('trust.proofPayment')}</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <a href={`mailto:${t('trust.proofSupport')}`} className="text-[13px] font-semibold text-brand">
            {t('trust.proofSupport')}
          </a>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <a href={localeHref(lang, '/refund-policy')} className="text-[13px] font-semibold text-brand">
            {t('trust.proofRefundLink')}
          </a>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <a href={localeHref(lang, '/planner-verification')} className="text-[13px] font-semibold text-brand">
            {t('trust.proofVerificationLink')}
          </a>
        </div>
      </div>
    </div>
  );
}
