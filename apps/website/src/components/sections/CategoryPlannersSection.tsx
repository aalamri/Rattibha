'use client';

import { useTranslation } from 'react-i18next';

import { PlannerCard } from '@/components/ui/PlannerCard';
import { type CategoryKey, CITY_KEYS, PLANNER_STATS } from '@/data/planners';
import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';

interface PlannerEntry {
  name: string;
  city: string;
  type: string;
  bio: string;
}

/** Public SEO landing page body for /categories/[category] — unique
 * per-category intro copy (from i18n `categoryPages.<category>`) followed by
 * planners tagged with that category in data/planners.ts. */
export function CategoryPlannersSection({ category }: { category: CategoryKey }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const planners = t('planners', { returnObjects: true }) as PlannerEntry[];
  const matches = PLANNER_STATS.map((stat, i) => ({ stat, entry: planners[i] })).filter(({ stat }) =>
    stat.categoryKeys.includes(category)
  );

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-10">
      <div className="text-[12.5px] font-extrabold uppercase text-gold-500">{t('categoryPages.overline')}</div>
      <h1 className="mt-2.5 font-display text-[36px] font-semibold text-fg1 sm:text-[42px]">{t(`categoryPages.${category}.title`)}</h1>
      <p className="mt-3 max-w-[720px] text-base leading-[1.6] text-fg2">{t(`categoryPages.${category}.intro`)}</p>
      <div className="mt-9 grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-4">
        {matches.map(({ stat, entry }) => {
          const cityKey = stat.cityKey ?? CITY_KEYS[0];
          return (
            <PlannerCard
              key={stat.slug}
              name={entry.name}
              city={entry.city}
              type={entry.type}
              {...stat}
              href={localeHref(lang, `/planners/${cityKey}/${stat.slug}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
