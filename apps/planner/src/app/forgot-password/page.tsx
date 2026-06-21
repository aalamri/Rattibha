'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnvelopeSimple, PaperPlaneRight } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setSubmitting(false);

    if (resetError) {
      setError(t('auth.errors.generic'));
      return;
    }

    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-app px-4">
      <Card className="w-full max-w-[400px]">
        <h1 className="font-display text-2xl font-semibold text-fg1">{t('auth.forgotPasswordPage.title')}</h1>
        <p className="mt-1 text-[13.5px] text-fg3">{t('auth.forgotPasswordPage.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-fg2">{t('auth.forgotPasswordPage.emailLabel')}</span>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-bg-app px-3.5 py-2.5">
              <EnvelopeSimple size={17} className="text-fg3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-[13.5px] text-fg1 outline-none"
              />
            </div>
          </label>

          {error && <p className="text-[12.5px] text-danger">{error}</p>}

          <Button type="submit" icon={PaperPlaneRight} disabled={submitting} className="mt-1.5 w-full justify-center">
            {t('auth.forgotPasswordPage.sendCode')}
          </Button>
        </form>

        <p className="mt-5 text-center text-[12.5px] text-fg3">
          {t('auth.forgotPasswordPage.rememberedIt')}
          <Link href="/login" className="font-bold text-brand">
            {t('auth.forgotPasswordPage.backToSignIn')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
