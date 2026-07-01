'use client';

import { ListChecks, LockKey, ShieldCheck, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { SectionHead } from './SectionHead';

const PILLARS = [
  { icon: ShieldCheck, tileColor: '#5B2C83', key: 'verified' },
  { icon: ListChecks, tileColor: '#7E3FAE', key: 'quotes' },
  { icon: LockKey, tileColor: '#8B6914', key: 'deposit' },
  { icon: Star, tileColor: '#5B2C83', key: 'reviews' },
] as const;

/** Four trust/credibility pillars — inserted between HowItWorks and Testimonials. */
export function TrustPillars() {
  const { t } = useTranslation();

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
      </div>
    </div>
  );
}
