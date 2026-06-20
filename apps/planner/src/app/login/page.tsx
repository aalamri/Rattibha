'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeSimple, Globe, Lock } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { setAppLanguage, type AppLanguage } from '@/i18n';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;
  const { session, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('planner@lumiere-events.sa');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/open-requests');
    }
  }, [loading, session, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(t('auth.error'));
      setSubmitting(false);
      return;
    }

    router.replace('/open-requests');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-app px-4">
      <button
        type="button"
        onClick={() => setAppLanguage(lang === 'ar' ? 'en' : 'ar')}
        className="fixed top-5 inline-flex h-[42px] items-center gap-1.5 rounded-sm border border-border bg-bg-surface px-3.5 text-[13.5px] font-bold text-fg1 end-5"
      >
        <Globe size={17} />
        {lang === 'ar' ? 'EN' : 'العربية'}
      </button>

      <Card className="w-full max-w-[400px]">
        <h1 className="font-display text-2xl font-semibold text-fg1">{t('common.appName')}</h1>
        <p className="mt-1 text-[13.5px] text-fg3">{t('auth.subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-fg2">{t('auth.email')}</span>
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

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-fg2">{t('auth.password')}</span>
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

          {error && <p className="text-[12.5px] text-danger">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-1.5 w-full justify-center">
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
