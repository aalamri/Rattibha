import { EnvelopeSimple, Lock, Phone, Storefront, User } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Field } from './Field';
import { StepHead } from './StepHead';
import { TextInput } from './TextInput';
import type { OnboardingForm } from './types';

interface StepAccountProps {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}

export function StepAccount({ form, onChange }: StepAccountProps) {
  const { t } = useTranslation();

  return (
    <div>
      <StepHead title={t('onboarding.account.title')} subtitle={t('onboarding.account.subtitle')} />
      <Field label={t('onboarding.account.businessName')}>
        <TextInput
          icon={Storefront}
          value={form.businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label={t('onboarding.account.fullName')}>
          <TextInput icon={User} value={form.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
        </Field>
        <Field label={t('onboarding.account.phone')}>
          <TextInput
            icon={Phone}
            type="tel"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
      </div>
      <Field label={t('onboarding.account.email')}>
        <TextInput
          icon={EnvelopeSimple}
          type="email"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </Field>
      <Field label={t('onboarding.account.password')} hint={t('onboarding.account.passwordHint')}>
        <TextInput
          icon={Lock}
          type="password"
          value={form.password}
          onChange={(e) => onChange({ password: e.target.value })}
        />
      </Field>
    </div>
  );
}
