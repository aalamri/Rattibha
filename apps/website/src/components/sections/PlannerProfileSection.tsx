'use client';

import { MapPin, Star } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { CITY_KEYS, type PlannerStat } from '@/data/planners';
import { formatLocaleNumber, type AppLanguage } from '@/i18n';
import { useIsRTL } from '@/i18n/useIsRTL';
import { localeHref } from '@/lib/seo';

const SIGN_IN_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? '#';

interface PlannerPackage {
  name: string;
  description: string;
}

interface PlannerReview {
  author: string;
  text: string;
}

interface PlannerEntry {
  name: string;
  city: string;
  type: string;
  bio: string;
  portfolio: { caption: string }[];
  packages: PlannerPackage[];
  reviews: PlannerReview[];
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

      <div className="mt-10">
        <h2 className="font-display text-[22px] font-semibold text-fg1">{t('plannerProfile.portfolioHeading')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {entry.portfolio.map((item, i) => (
            <div key={i}>
              <Photo seed={stat.portfolioSeeds[i]} className="h-[160px] rounded-2xl" />
              <p className="mt-2 text-[13px] text-fg3">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-[22px] font-semibold text-fg1">{t('plannerProfile.packagesHeading')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entry.packages.map((pkg, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-5 shadow-[0_8px_24px_-16px_rgba(43,34,51,0.18)]">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[17px] font-semibold text-fg1">{pkg.name}</h3>
                <span className="whitespace-nowrap text-[15px] font-bold text-brand">
                  {formatLocaleNumber(stat.packagePrices[i], lang)} SAR
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-fg2">{pkg.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-[22px] font-semibold text-fg1">{t('plannerProfile.reviewsHeading')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entry.reviews.map((review, i) => (
            <div key={i} className="rounded-2xl border border-border bg-cream p-5">
              <div className="text-[14px] tracking-[2px] text-gold-500">{'★'.repeat(Math.round(stat.reviewRatings[i]))}</div>
              <p className="my-3 text-[15px] leading-[1.55] text-fg1">&quot;{review.text}&quot;</p>
              <div className="flex items-center gap-2.5">
                <Avatar seed={stat.seed} size={32} initials={review.author.charAt(0)} />
                <span className="text-[13.5px] font-bold text-fg1">{review.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
