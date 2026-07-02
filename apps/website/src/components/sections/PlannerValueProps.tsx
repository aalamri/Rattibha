'use client';

import { LockKey, Percent, Star, Target } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { SectionHead } from './SectionHead';

const ICONS = [Target, LockKey, Star, Percent] as const;
const TILE_COLORS = ['#5B2C83', '#7E3FAE', '#8B6914', '#5B2C83'];

interface ValueProp {
  title: string;
  description: string;
}

/** Four planner-facing value props on /for-planners — see task #28. */
export function PlannerValueProps() {
  const { t } = useTranslation();
  const items = t('forPlanners.valueProps', { returnObjects: true }) as ValueProp[];

  return (
    <div className="mx-auto max-w-[1180px] px-10 py-[72px]">
      <SectionHead center over={t('forPlanners.valuePropsOverline')} title={t('forPlanners.valuePropsTitle')} />
      <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <div key={i} className="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_24px_-16px_rgba(43,34,51,0.18)]">
              <div className="mb-4 grid h-13 w-13 place-items-center rounded-[16px]" style={{ background: TILE_COLORS[i] }}>
                <Icon size={26} weight="fill" className="text-white" />
              </div>
              <h3 className="font-display text-[18px] font-semibold text-fg1">{item.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-[1.55] text-fg2">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
