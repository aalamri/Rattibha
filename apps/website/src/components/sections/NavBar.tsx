'use client';

import { Globe, Sparkle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { setAppLanguage, type AppLanguage } from '@/i18n';

const SIGN_IN_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? '#';

const LINKS = [
  { key: 'browsePlanners', href: '#planners' },
  { key: 'howItWorks', href: '#how-it-works' },
  { key: 'forPlanners', href: '#for-planners' },
  { key: 'about', href: '#about' },
] as const;

/** Sticky translucent nav — matches `NavBar` in sections.jsx. */
export function NavBar() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as AppLanguage;

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1180px] items-center gap-7 px-10">
        <Logo size={38} />
        <div className="ms-4.5 flex gap-6.5">
          {LINKS.map(({ key, href }) => (
            <a key={key} href={href} className="cursor-pointer whitespace-nowrap text-[14.5px] font-semibold text-fg2">
              {t(`nav.${key}`)}
            </a>
          ))}
        </div>
        <div className="ms-auto flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setAppLanguage(lang === 'en' ? 'ar' : 'en')}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-border-strong px-3.5 py-1.5 text-sm font-bold text-fg1"
          >
            <Globe size={16} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <a href={SIGN_IN_URL} className="cursor-pointer whitespace-nowrap text-[14.5px] font-bold text-fg1">
            {t('nav.signIn')}
          </a>
          <a href={SIGN_IN_URL}>
            <Button size="sm" icon={Sparkle} className="whitespace-nowrap">
              {t('nav.getStarted')}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
