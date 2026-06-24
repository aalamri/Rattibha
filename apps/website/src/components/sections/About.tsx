'use client';

import { Confetti, Star, UsersThree } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { SectionHead } from './SectionHead';

const STATS = [
  { icon: UsersThree, valueKey: 'stat1Value', labelKey: 'stat1Label' },
  { icon: Confetti, valueKey: 'stat2Value', labelKey: 'stat2Label' },
  { icon: Star, valueKey: 'stat3Value', labelKey: 'stat3Label' },
] as const;

/** Brief "who we are" section with trust stats, linked from the navbar's About item. */
export function About() {
  const { t } = useTranslation();

  return (
    <div id="about" className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1180px] px-10 py-[72px]">
        <SectionHead center over={t('about.overline')} title={t('about.title')} sub={t('about.subtitle')} />
        <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.labelKey} className="flex flex-col items-center gap-2 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-purple-50">
                <stat.icon size={22} weight="fill" className="text-brand" />
              </div>
              <div className="font-display text-[32px] font-semibold text-fg1">{t(`about.${stat.valueKey}`)}</div>
              <div className="text-[14px] text-fg2">{t(`about.${stat.labelKey}`)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
