import { Check, IdentificationBadge, UploadSimple } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Field } from './Field';
import { StepHead } from './StepHead';
import { TextInput } from './TextInput';
import type { OnboardingForm } from './types';

interface StepVerifyProps {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}

export function StepVerify({ form, onChange }: StepVerifyProps) {
  const { t } = useTranslation();

  return (
    <div>
      <StepHead title={t('onboarding.verify.title')} subtitle={t('onboarding.verify.subtitle')} />
      <Field label={t('onboarding.verify.crNumber')}>
        <TextInput icon={IdentificationBadge} value={form.crNumber} onChange={(e) => onChange({ crNumber: e.target.value })} />
      </Field>
      <Field label={t('onboarding.verify.documents')} hint={t('onboarding.verify.documentsHint')}>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-sm border-[1.5px] border-dashed border-border-strong bg-purple-50 px-3.5 py-3 text-start"
        >
          <UploadSimple size={18} className="text-brand" />
          <span className="text-[13px] font-semibold text-brand">{t('onboarding.verify.documents')}</span>
        </button>
      </Field>
      <label className="mt-1.5 flex cursor-pointer items-start gap-2.5">
        <button
          type="button"
          onClick={() => onChange({ agreedToTerms: !form.agreedToTerms })}
          className={`mt-0.5 grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-xs ${
            form.agreedToTerms ? 'bg-brand' : 'border-[1.5px] border-border-strong bg-bg-surface'
          }`}
        >
          {form.agreedToTerms && <Check size={13} weight="bold" className="text-white" />}
        </button>
        <span className="text-[12.5px] leading-relaxed text-fg2">{t('onboarding.verify.agreeTerms')}</span>
      </label>
    </div>
  );
}
