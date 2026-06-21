'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t('auth.errors.weakPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(t('auth.errors.generic'));
      return;
    }

    router.replace('/open-requests');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-app px-4">
      <Card className="w-full max-w-[400px]">
        <h1 className="font-display text-2xl font-semibold text-fg1">{t('auth.resetPasswordPage.title')}</h1>
        <p className="mt-1 text-[13.5px] text-fg3">{t('auth.resetPasswordPage.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-fg2">{t('auth.resetPasswordPage.newPasswordLabel')}</span>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-bg-app px-3.5 py-2.5">
              <Lock size={17} className="text-fg3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[13.5px] text-fg1 outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-fg2">{t('auth.resetPasswordPage.confirmPasswordLabel')}</span>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-bg-app px-3.5 py-2.5">
              <Lock size={17} className="text-fg3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-[13.5px] text-fg1 outline-none"
              />
            </div>
          </label>

          {error && <p className="text-[12.5px] text-danger">{error}</p>}

          <Button type="submit" icon={CheckCircle} disabled={submitting} className="mt-1.5 w-full justify-center">
            {t('auth.resetPasswordPage.resetButton')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
