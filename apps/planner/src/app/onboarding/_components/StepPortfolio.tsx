import { useEffect, useMemo, useRef } from 'react';
import { Lightbulb, Plus, X } from 'phosphor-react';
import { Trans, useTranslation } from 'react-i18next';

import { StepHead } from './StepHead';
import { MAX_PORTFOLIO_PHOTOS, type OnboardingForm } from './types';

interface StepPortfolioProps {
  form: OnboardingForm;
  onChange: (patch: Partial<OnboardingForm>) => void;
}

/**
 * Real upload — files are kept in memory (not uploaded yet) until the final
 * submit step, since Supabase Storage's RLS requires an authenticated
 * `auth.uid()`, and that account isn't created until handleSubmit calls
 * supabase.auth.signUp(). See onboarding/page.tsx's handleSubmit.
 */
export function StepPortfolio({ form, onChange }: StepPortfolioProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => form.portfolioFiles.map((file) => URL.createObjectURL(file)), [form.portfolioFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    const room = MAX_PORTFOLIO_PHOTOS - form.portfolioFiles.length;
    if (room <= 0) return;
    onChange({ portfolioFiles: [...form.portfolioFiles, ...incoming.slice(0, room)] });
  }

  function removeFile(index: number) {
    onChange({ portfolioFiles: form.portfolioFiles.filter((_, i) => i !== index) });
  }

  const canAddMore = form.portfolioFiles.length < MAX_PORTFOLIO_PHOTOS;

  return (
    <div>
      <StepHead title={t('onboarding.portfolio.title')} subtitle={t('onboarding.portfolio.subtitle')} />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div className="mb-2 grid grid-cols-3 gap-3">
        {previews.map((url, i) => (
          <div key={url} className="group relative h-[110px] overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote/optimizable image */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeFile(i)}
              aria-label={t('onboarding.portfolio.remove')}
              className="absolute end-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-fg1/70 text-white"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-[110px] flex-col items-center justify-center gap-1.5 rounded-md border-[1.5px] border-dashed border-border-strong bg-purple-50"
          >
            <Plus size={22} className="text-brand" />
            <span className="text-[11px] font-semibold text-brand">{t('onboarding.portfolio.addPhoto')}</span>
          </button>
        )}
      </div>

      <div className="mb-4 text-[12px] text-fg3">
        {t('onboarding.portfolio.count', { current: form.portfolioFiles.length, max: MAX_PORTFOLIO_PHOTOS })}
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
