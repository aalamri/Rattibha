'use client';

import { useTranslation } from 'react-i18next';

import { PlannerCard } from '@/components/ui/PlannerCard';
import { CATEGORY_CITY_COMBOS, type CityKey, PLANNER_STATS } from '@/data/planners';
import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';

interface PlannerEntry {
  name: string;
  city: string;
  type: string;
  bio: string;
}

/** Public SEO landing page body for /planners/[city] — unique per-city intro
 * copy (from i18n `cityPages.<city>`) followed by the planners actually
 * based there, filtered by the structural `cityKey` in data/planners.ts. */
export function CityPlannersSection({ city }: { city: CityKey }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const planners = t('planners', { returnObjects: true }) as PlannerEntry[];
  const matches = PLANNER_STATS.map((stat, i) => ({ stat, entry: planners[i] })).filter(({ stat }) => stat.cityKey === city);
  const combosForCity = CATEGORY_CITY_COMBOS.filter((combo) => combo.city === city);

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-10">
      <div className="text-[12.5px] font-extrabold uppercase text-gold-500">{t('cityPages.overline')}</div>
      <h1 className="mt-2.5 font-display text-[36px] font-semibold text-fg1 sm:text-[42px]">{t(`cityPages.${city}.title`)}</h1>
      <p className="mt-3 max-w-[720px] text-base leading-[1.6] text-fg2">{t(`cityPages.${city}.intro`)}</p>
      {combosForCity.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-fg3">{t('cityPages.refineByCategory')}</span>
          {combosForCity.map(({ category }) => (
            <a
              key={category}
              href={localeHref(lang, `/categories/${category}/${city}`)}
              className="rounded-full border border-border-strong px-3 py-1 text-[13px] font-semibold text-brand hover:bg-purple-50"
            >
              {t(`categories.${category}`)}
            </a>
          ))}
        </div>
      )}
      <div className="mt-9 grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-4">
        {matches.map(({ stat, entry }) => (
          <PlannerCard
            key={stat.slug}
            name={entry.name}
            city={entry.city}
            type={entry.type}
            {...stat}
            href={localeHref(lang, `/planners/${city}/${stat.slug}`)}
          />
        ))}
      </div>
    </div>
  );
}
