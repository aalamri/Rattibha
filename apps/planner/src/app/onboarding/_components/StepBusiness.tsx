import { MapPin } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { CITY_KEYS } from '@/data/categories';

import { Chip } from './Chip';
import { Field } from './Field';
import { StepHead } from './StepHead';
import type { OnboardingForm } from './types';

interface StepBusinessProps {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}

export function StepBusiness({ form, onChange }: StepBusinessProps) {
  const { t } = useTranslation();
  const teamSizeOptions = t('onboarding.business.teamSizeOptions', { returnObjects: true }) as string[];
  const yearsOptions = t('onboarding.business.yearsOptions', { returnObjects: true }) as string[];

  return (
    <div>
      <StepHead title={t('onboarding.business.title')} subtitle={t('onboarding.business.subtitle')} />
      <Field label={t('onboarding.business.city')}>
        <div className="flex flex-wrap gap-2">
          {CITY_KEYS.slice(0, 6).map((city) => (
            <Chip key={city} icon={MapPin} on={form.city === city} onClick={() => onChange({ city })}>
              {t(`cities.${city}`)}
            </Chip>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label={t('onboarding.business.teamSize')}>
          <div className="flex flex-wrap gap-2">
            {teamSizeOptions.map((option) => (
              <Chip key={option} on={form.teamSize === option} onClick={() => onChange({ teamSize: option })}>
                {option}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label={t('onboarding.business.yearsInBusiness')}>
          <div className="flex flex-wrap gap-2">
            {yearsOptions.map((option) => (
              <Chip key={option} on={form.yearsInBusiness === option} onClick={() => onChange({ yearsInBusiness: option })}>
                {option}
              </Chip>
            ))}
          </div>
        </Field>
      </div>
      <Field label={t('onboarding.business.bio')} hint={t('onboarding.business.bioHint')}>
        <textarea
          value={form.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder={t('onboarding.business.bioPlaceholder')}
          rows={3}
          className="w-full resize-none rounded-sm border border-border bg-bg-app px-3.5 py-2.5 text-[13.5px] leading-relaxed text-fg1 outline-none placeholder:text-fg3"
        />
      </Field>
    </div>
  );
}
