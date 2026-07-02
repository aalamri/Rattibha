'use client';

import { RocketLaunch } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';

const PLANNER_SIGNUP_URL = `${process.env.NEXT_PUBLIC_PLANNER_APP_URL ?? ''}/onboarding`;

/** Closing CTA for /for-planners — deliberately fresh copy rather than
 * repeating CTABand's headline/subtitle, since CTABand already opens this
 * same page as its hero (see task #28). */
export function PlannerClosingCta() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-10 py-[72px] text-center">
      <h2 className="font-display text-[28px] font-semibold text-fg1">{t('forPlanners.closingTitle')}</h2>
      <p className="max-w-[480px] text-[15px] leading-[1.6] text-fg2">{t('forPlanners.closingSubtitle')}</p>
      <a href={PLANNER_SIGNUP_URL}>
        <Button size="lg" icon={RocketLaunch}>
          {t('cta.becomePlanner')}
        </Button>
      </a>
    </div>
  );
}
