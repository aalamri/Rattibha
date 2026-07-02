'use client';

import { useTranslation } from 'react-i18next';

import { PlannerCard } from '@/components/ui/PlannerCard';
import { type CategoryKey, type CityKey, PLANNER_STATS } from '@/data/planners';
import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';

interface PlannerEntry {
  name: string;
  city: string;
  type: string;
  bio: string;
}

/** Public SEO landing page body for /categories/[category]/[city] — the
 * long-tail "[category] in [city]" intent (e.g. "wedding planner in
 * Riyadh") that neither the city page nor the category page covers on its
 * own. Unique per-combo intro copy from i18n `cityCategoryPages`, only
 * generated for combos with a real planner match — see task #24. */
export function CityCategoryPlannersSection({ category, city }: { category: CategoryKey; city: CityKey }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const key = `${city}-${category}`;
  const planners = t('planners', { returnObjects: true }) as PlannerEntry[];
  const matches = PLANNER_STATS.map((stat, i) => ({ stat, entry: planners[i] })).filter(
    ({ stat }) => stat.cityKey === city && stat.categoryKeys.includes(category)
  );

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-10">
      <div className="text-[12.5px] font-extrabold uppercase text-gold-500">{t('categoryPages.overline')}</div>
      <h1 className="mt-2.5 font-display text-[36px] font-semibold text-fg1 sm:text-[42px]">{t(`cityCategoryPages.${key}.title`)}</h1>
      <p className="mt-3 max-w-[720px] text-base leading-[1.6] text-fg2">{t(`cityCategoryPages.${key}.intro`)}</p>
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
