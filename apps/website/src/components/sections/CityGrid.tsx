'use client';

import { MapPin } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { CITY_KEYS, CITY_PLANNER_COUNTS } from '@/data/planners';
import { SectionHead } from './SectionHead';

/** Browse-by-city grid — not in the original prototype; added per the
 * "Marketing landing page" task's city-grid requirement, following the
 * same card pattern as `Categories`. */
export function CityGrid() {
  const { t, i18n } = useTranslation();

  return (
    <div className="mx-auto max-w-[1180px] px-10 py-14">
      <SectionHead over={t('cities.overline')} title={t('cities.title')} sub={t('cities.subtitle')} />
      <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CITY_KEYS.map((key) => (
          <div
            key={key}
            className="cursor-pointer rounded-[18px] border border-border bg-white p-5 text-center shadow-[0_8px_22px_-16px_rgba(43,34,51,0.2)] transition-all"
          >
            <div className="mx-auto mb-3 grid h-13 w-13 place-items-center rounded-2xl bg-purple-50">
              <MapPin size={24} className="text-brand" />
            </div>
            <div className="text-[15px] font-bold text-fg1">{t(`cities.${key}`)}</div>
            <div className="mt-0.5 text-[12.5px] text-fg3">
              {t('cities.plannersCount', { count: CITY_PLANNER_COUNTS[key].toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US') })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
