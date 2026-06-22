import { CurrencyCircleDollar } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { CATEGORY_ICONS, CATEGORY_KEYS } from '@/data/categories';

import { Chip } from './Chip';
import { Field } from './Field';
import { StepHead } from './StepHead';
import { TextInput } from './TextInput';
import type { OnboardingForm } from './types';

interface StepServicesProps {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}

export function StepServices({ form, onChange }: StepServicesProps) {
  const { t } = useTranslation();
  const budgetTierOptions = t('onboarding.services.budgetTierOptions', { returnObjects: true }) as string[];

  function toggleCategory(category: (typeof CATEGORY_KEYS)[number]) {
    onChange({
      categories: form.categories.includes(category)
        ? form.categories.filter((c) => c !== category)
        : [...form.categories, category],
    });
  }

  return (
    <div>
      <StepHead title={t('onboarding.services.title')} subtitle={t('onboarding.services.subtitle')} />
      <Field label={t('onboarding.services.categories')}>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((category) => (
            <Chip
              key={category}
              icon={CATEGORY_ICONS[category]}
              on={form.categories.includes(category)}
              onClick={() => toggleCategory(category)}
            >
              {t(`categories.${category}`)}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t('onboarding.services.budgetTier')}>
        <div className="flex flex-wrap gap-2">
          {budgetTierOptions.map((tier) => (
            <Chip key={tier} on={form.budgetTier === tier} onClick={() => onChange({ budgetTier: tier })}>
              {tier}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t('onboarding.services.startingPrice')} hint={t('onboarding.services.startingPriceHint')}>
        <TextInput
          icon={CurrencyCircleDollar}
          type="number"
          min={0}
          value={form.startingPrice}
          onChange={(e) => onChange({ startingPrice: e.target.value })}
        />
      </Field>
    </div>
  );
}
