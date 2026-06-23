'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Globe, PaperPlaneRight } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { setAppLanguage, type AppLanguage } from '@/i18n';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

import { BrandRail } from './_components/BrandRail';
import { PendingState } from './_components/PendingState';
import { StepAccount } from './_components/StepAccount';
import { StepBusiness } from './_components/StepBusiness';
import { StepPortfolio } from './_components/StepPortfolio';
import { StepServices } from './_components/StepServices';
import { StepVerify } from './_components/StepVerify';
import { INITIAL_FORM, type OnboardingForm } from './_components/types';

const STEP_COUNT = 5;

export default function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const router = useRouter();
  const { session, planner, loading } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && session && planner) {
      router.replace('/open-requests');
    }
  }, [loading, session, planner, router]);

  function patchForm(patch: Partial<OnboardingForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function validateStep(): string | null {
    switch (step) {
      case 0:
        if (!form.businessName || !form.fullName || !form.phone || !form.email) return t('onboarding.errors.required');
        if (form.password.length < 6) return t('auth.errors.weakPassword');
        return null;
      case 1:
        if (!form.teamSize || !form.yearsInBusiness) return t('onboarding.errors.required');
        return null;
      case 2:
        if (form.categories.length === 0) return t('onboarding.errors.selectCategory');
        if (!form.budgetTier || !form.startingPrice) return t('onboarding.errors.required');
        return null;
      case 4:
        if (!form.crNumber) return t('onboarding.errors.required');
        if (!form.agreedToTerms) return t('onboarding.errors.agreeRequired');
        return null;
      default:
        return null;
    }
  }

  function goNext() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: 'planner' } },
    });

    const userId = signUpData.session?.user.id;
    if (signUpError || !userId) {
      setError(t('onboarding.errors.submitFailed'));
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role: 'planner',
      full_name: form.fullName,
      phone: form.phone,
      language: lang,
      city: form.city,
    });

    // Uploaded now rather than as each photo is picked, since Storage's RLS
    // needs auth.uid() — there's no session until signUp above succeeds.
    const portfolioUrls: string[] = [];
    for (const [i, file] of form.portfolioFiles.entries()) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${i}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('planner-portfolios').upload(path, file);
      if (!uploadError) {
        portfolioUrls.push(supabase.storage.from('planner-portfolios').getPublicUrl(path).data.publicUrl);
      }
    }

    const { error: plannerError } = await supabase.from('planners').insert({
      user_id: userId,
      business_name: form.businessName,
      bio: form.bio || null,
      city: form.city,
      categories: form.categories,
      years_in_business: form.yearsInBusiness,
      team_size: form.teamSize,
      budget_tier: form.budgetTier,
      starting_price: Number(form.startingPrice),
      cr_number: form.crNumber,
      portfolio_urls: portfolioUrls,
    });

    setSubmitting(false);

    if (profileError || plannerError) {
      setError(t('onboarding.errors.submitFailed'));
      return;
    }

    setDone(true);
  }

  const isLast = step === STEP_COUNT - 1;
  const progress = ((step + 1) / STEP_COUNT) * 100;

  return (
    <div className="flex min-h-screen bg-bg-app">
      <button
        type="button"
        onClick={() => setAppLanguage(lang === 'ar' ? 'en' : 'ar')}
        className="fixed top-5 z-10 inline-flex h-[42px] items-center gap-1.5 rounded-sm border border-border bg-bg-surface px-3.5 text-[13.5px] font-bold text-fg1 end-5"
      >
        <Globe size={17} />
        {lang === 'ar' ? 'EN' : 'العربية'}
      </button>

      <BrandRail step={step} done={done} />

      <div className="flex min-w-0 flex-1 flex-col bg-bg-surface">
        {done ? (
          <PendingState businessName={form.businessName} onGoLive={() => router.replace('/open-requests')} />
        ) : (
          <>
            <div className="h-1 bg-border">
              <div
                className="h-full bg-[linear-gradient(90deg,#5B2C83,#B6A1D4)] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-9 sm:px-14">
              <div className="mx-auto max-w-[520px]">
                <div className="mb-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-brand">
                  {t('onboarding.stepOf', { current: step + 1, total: STEP_COUNT })}
                </div>
                {step === 0 && <StepAccount form={form} onChange={patchForm} />}
                {step === 1 && <StepBusiness form={form} onChange={patchForm} />}
                {step === 2 && <StepServices form={form} onChange={patchForm} />}
                {step === 3 && <StepPortfolio form={form} onChange={patchForm} />}
                {step === 4 && <StepVerify form={form} onChange={patchForm} />}
                {error && <p className="mt-3 text-[12.5px] text-danger">{error}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-bg-surface px-7 py-4 sm:px-14">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg1 disabled:opacity-40"
              >
                <ArrowLeft size={17} />
                {t('onboarding.back')}
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: STEP_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-5.5 bg-brand' : i < step ? 'w-1.5 bg-lavender-300' : 'w-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>

              <Button
                icon={isLast ? PaperPlaneRight : undefined}
                iconRight={isLast ? undefined : ArrowRight}
                disabled={submitting}
                onClick={isLast ? handleSubmit : goNext}
              >
                {isLast ? (submitting ? t('onboarding.submitting') : t('onboarding.submit')) : t('onboarding.continue')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
