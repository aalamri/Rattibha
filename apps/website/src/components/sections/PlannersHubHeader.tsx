'use client';

import { useTranslation } from 'react-i18next';

/** H1 + intro for the /planners hub page — a real destination for the
 * "Browse all 500+" action in FeaturedGrid, which previously had no href
 * at all. Reuses Categories and CityGrid below it rather than duplicating
 * their listings. */
export function PlannersHubHeader() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[1180px] px-10 pt-14">
      <h1 className="font-display text-[36px] font-semibold text-fg1 sm:text-[42px]">{t('plannersHub.title')}</h1>
      <p className="mt-3 max-w-[640px] text-base leading-[1.6] text-fg2">{t('plannersHub.intro')}</p>
    </div>
  );
}
