'use client';

import { Confetti, ListChecks, Sparkle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { SectionHead } from './SectionHead';

const STEPS = [
  { icon: ListChecks, tileColor: '#4B0082', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: Sparkle, tileColor: '#7E3FAE', titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: Confetti, tileColor: '#B5881A', titleKey: 'step3Title', descKey: 'step3Desc' },
] as const;

/** Three numbered steps — matches `HowItWorks` in sections.jsx. */
export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <div id="how-it-works" className="mx-auto max-w-[1180px] px-10 py-[72px]">
      <SectionHead center over={t('howItWorks.overline')} title={t('howItWorks.title')} sub={t('howItWorks.subtitle')} />
      <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={i} className="relative p-1">
            <div className="relative mb-4.5 grid h-15 w-15 place-items-center rounded-[18px]" style={{ background: step.tileColor }}>
              <step.icon size={28} className="text-white" />
              <span className="absolute -top-2 end-[-8px] grid h-6.5 w-6.5 place-items-center rounded-full bg-gold-500 text-[13px] font-extrabold text-fg1">
                {i + 1}
              </span>
            </div>
            <h3 className="font-display text-[25px] font-semibold text-fg1">{t(`howItWorks.${step.titleKey}`)}</h3>
            <p className="mt-2 text-[15px] leading-[1.55] text-fg2">{t(`howItWorks.${step.descKey}`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
