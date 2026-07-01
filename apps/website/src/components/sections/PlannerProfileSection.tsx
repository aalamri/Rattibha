'use client';

import { MapPin, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { CITY_KEYS, type PlannerStat } from '@/data/planners';
import { formatLocaleNumber, type AppLanguage } from '@/i18n';
import { useIsRTL } from '@/i18n/useIsRTL';
import { localeHref } from '@/lib/seo';

const SIGN_IN_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? '#';

interface PlannerEntry {
  name: string;
  city: string;
  type: string;
  bio: string;
}

/** Public profile page body for /planners/[city]/[slug] — real per-planner
 * content (bio, specialty, city, starting price) rather than just the
 * FeaturedGrid card, giving each planner an independently indexable,
 * non-thin page. */
export function PlannerProfileSection({ entry, stat }: { entry: PlannerEntry; stat: PlannerStat }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const isRTL = useIsRTL();
  const hasCityPage = stat.cityKey && CITY_KEYS.includes(stat.cityKey);

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-10">
      {hasCityPage && (
        <a href={localeHref(lang, `/planners/${stat.cityKey}`)} className="text-[13.5px] font-semibold text-brand">
          {isRTL ? '→' : '←'} {t('cityPages.backLink')}
        </a>
      )}
      <div className="mt-4 overflow-hidden rounded-[24px] border border-border bg-white shadow-card">
        <Photo seed={stat.seed} label={stat.premium ? t('featured.premium') : undefined} className="h-[260px] sm:h-[320px]" />
        <div className="p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-[30px] font-semibold text-fg1 sm:text-[36px]">{entry.name}</h1>
            <Badge bg="#F2E2A6" fg="#7a5a14" icon={Star}>
              {formatLocaleNumber(stat.rating, lang, { minimumFractionDigits: 1 })}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-[13px] font-semibold text-brand">
              {entry.type}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13.5px] text-fg3">
              <MapPin size={15} />
              {entry.city}
            </span>
          </div>
          <p className="mt-5 max-w-[600px] text-[15.5px] leading-[1.65] text-fg2">{entry.bio}</p>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <span className="text-[13.5px] text-fg3">
              {t('plannerProfile.startingFrom')}{' '}
              <b className="text-[18px] text-fg1">
                {formatLocaleNumber(stat.from, lang)} SAR
              </b>
            </span>
            <a href={SIGN_IN_URL}>
              <Button size="lg">{t('plannerProfile.contactCta')}</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
