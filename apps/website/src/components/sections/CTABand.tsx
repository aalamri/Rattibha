'use client';

import Image from 'next/image';
import { CrownSimple, RocketLaunch } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const PLANNER_SIGNUP_URL = `${process.env.NEXT_PUBLIC_PLANNER_APP_URL ?? ''}/onboarding`;

/** Aubergine "for planners" panel — matches `CTABand` in sections.jsx. */
export function CTABand() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[1180px] px-10 py-[72px]">
      <div className="relative overflow-hidden rounded-[30px] bg-fg1 p-9 sm:p-14">
        <div
          className="absolute inset-0 opacity-10 brightness-0 invert"
          style={{ backgroundImage: 'url(/pattern.svg)', backgroundSize: '60px' }}
        />
        <Image
          src="/glyph-ra-light.png"
          alt=""
          aria-hidden
          width={300}
          height={359}
          className="pointer-events-none absolute -bottom-12 end-[-28px] rotate-[-6deg] opacity-30"
        />
        <div className="relative flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
          <div className="max-w-[560px]">
            <Badge bg="rgba(255,255,255,0.12)" fg="#DAA520" icon={CrownSimple}>
              {t('cta.badge')}
            </Badge>
            <h2 className="mt-4 font-display text-[44px] font-semibold leading-[1.04] text-[#EFE9F3]">{t('cta.title')}</h2>
            <p className="mt-3.5 text-[16.5px] leading-[1.55] text-[rgba(244,232,223,0.75)]">{t('cta.subtitle')}</p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-3">
            <a href={PLANNER_SIGNUP_URL}>
              <Button variant="gold" size="lg" icon={RocketLaunch} className="w-full">
                {t('cta.becomePlanner')}
              </Button>
            </a>
            <Button variant="light" size="lg">
              {t('cta.talkToSales')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
