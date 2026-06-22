import { Lightbulb, Plus } from 'phosphor-react';
import { Trans, useTranslation } from 'react-i18next';

import { GRADIENTS } from '@/components/ui/Avatar';

import { StepHead } from './StepHead';

/**
 * Illustrative only — there's no Supabase Storage bucket for planner photos
 * yet anywhere in this app (storefronts use seed-based gradients), so this
 * step previews the gallery layout but doesn't persist real uploads.
 */
export function StepPortfolio() {
  const { t } = useTranslation();

  return (
    <div>
      <StepHead title={t('onboarding.portfolio.title')} subtitle={t('onboarding.portfolio.subtitle')} />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[0, 1, 2, 3].map((seed) => (
          <div key={seed} className="h-[110px] rounded-md" style={{ background: GRADIENTS[seed % GRADIENTS.length] }} />
        ))}
        {[0, 1].map((key) => (
          <button
            key={`add-${key}`}
            type="button"
            className="flex h-[110px] flex-col items-center justify-center gap-1.5 rounded-md border-[1.5px] border-dashed border-border-strong bg-purple-50"
          >
            <Plus size={22} className="text-brand" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2.5 rounded-sm bg-gold-200 px-3.5 py-3">
        <Lightbulb size={19} weight="fill" className="text-gold-600" />
        <span className="text-[12.5px] leading-tight text-fg1">
          <Trans i18nKey="onboarding.portfolio.tip" components={{ bold: <b /> }} />
        </span>
      </div>
    </div>
  );
}
