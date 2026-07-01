'use client';

import { useTranslation } from 'react-i18next';

import { PlannerCard } from '@/components/ui/PlannerCard';
import { CITY_KEYS, PLANNER_STATS } from '@/data/planners';
import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';
import { SectionHead } from './SectionHead';

/** Four-column planner grid — matches `FeaturedGrid` in sections.jsx. */
export function FeaturedGrid() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const planners = t('planners', { returnObjects: true }) as { name: string; city: string; type: string }[];

  return (
    <div id="planners" className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1180px] px-10 py-16">
        <SectionHead over={t('featured.overline')} title={t('featured.title')} sub={t('featured.subtitle')} action={t('featured.browseAll')} />
        <div className="mt-8 grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-4">
          {planners.map((p, i) => {
            const stat = PLANNER_STATS[i];
            const cityKey = stat.cityKey ?? CITY_KEYS[0];
            return (
              <PlannerCard
                key={i}
                name={p.name}
                city={p.city}
                type={p.type}
                {...stat}
                href={localeHref(lang, `/planners/${cityKey}/${stat.slug}`)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
