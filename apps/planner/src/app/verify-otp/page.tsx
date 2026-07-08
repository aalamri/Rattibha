'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

const RESEND_SECONDS = 42;

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}

function VerifyOtpForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (secs <= 0) return;
    const timer = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secs]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    setSubmitting(false);

    if (verifyError) {
      setError(t('auth.errors.invalidCode'));
      return;
    }

    router.replace('/reset-password');
  }

  async function handleResend() {
    if (secs > 0 || !email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(t('toast.error'));
      return;
    }
    setSecs(RESEND_SECONDS);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-app px-4">
      <Card className="w-full max-w-[400px]">
        <h1 className="font-display text-2xl font-semibold text-fg1">{t('auth.verifyOtpPage.title')}</h1>
        <p className="mt-1 text-[13.5px] text-fg3">{t('auth.verifyOtpPage.subtitleWithEmail', { email })}</p>

        <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-fg2">{t('auth.verifyOtpPage.codeLabel')}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-sm border border-border bg-bg-app px-3.5 py-2.5 text-center text-[20px] font-semibold tracking-[0.3em] text-fg1 outline-none"
            />
          </label>

          <div className="flex justify-center">
            {secs > 0 ? (
              <span className="text-[12.5px] text-fg3">{t('auth.verifyOtpPage.resendIn', { seconds: String(secs).padStart(2, '0') })}</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-[12.5px] font-bold text-brand">
                {t('auth.verifyOtpPage.resendCode')}
              </button>
            )}
          </div>

          {error && <p className="text-center text-[12.5px] text-danger">{error}</p>}

          <Button type="submit" icon={CheckCircle} disabled={submitting || code.length < 6} className="mt-1.5 w-full justify-center">
            {t('auth.verifyOtpPage.verifyAndContinue')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
