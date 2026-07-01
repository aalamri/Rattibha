'use client';

import { Balloon, Briefcase, Cake, HeartStraight, type Icon, Wine } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { CATEGORY_KEYS, type CategoryKey } from '@/data/planners';
import { type AppLanguage } from '@/i18n';
import { localeHref } from '@/lib/seo';

const CATEGORY_ICONS: Record<CategoryKey, Icon> = {
  weddings: HeartStraight,
  birthdays: Cake,
  engagements: Balloon,
  corporate: Briefcase,
  galas: Wine,
};

const CATEGORY_TONES: Record<CategoryKey, { color: string; tint: string }> = {
  weddings: { color: '#4B0082', tint: '#F2EAF7' },
  birthdays: { color: '#B5881A', tint: '#F6E7C4' },
  engagements: { color: '#7B4FB0', tint: '#EADFF7' },
  corporate: { color: '#3D0069', tint: '#E4D4EF' },
  galas: { color: '#DAA520', tint: '#F2E2A6' },
};

/** Five category cards — matches `Categories` in sections.jsx. Each card
 * links to that category's public SEO landing page (/categories/[key]) —
 * see task #17. */
export function Categories() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;

  return (
    <div className="mx-auto max-w-[1180px] px-10 pb-10 pt-2">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORY_KEYS.map((key) => {
          const IconComp = CATEGORY_ICONS[key];
          const tones = CATEGORY_TONES[key];
          return (
            <a
              key={key}
              href={localeHref(lang, `/categories/${key}`)}
              className="cursor-pointer rounded-[18px] border border-border bg-white p-5 text-center shadow-[0_8px_22px_-16px_rgba(43,34,51,0.2)] transition-all"
            >
              <div className="mx-auto mb-3 grid h-13 w-13 place-items-center rounded-2xl" style={{ background: tones.tint }}>
                <IconComp size={26} style={{ color: tones.color }} />
              </div>
              <div className="text-[15px] font-bold text-fg1">{t(`categories.${key}`)}</div>
              <div className="mt-0.5 text-[12.5px] text-fg3">{t(`categories.${key}Count`)}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
