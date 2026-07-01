'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Globe, List, Sparkle, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { type AppLanguage } from '@/i18n';
import { LANGUAGE_STORAGE_KEY } from '@/i18n/constants';

const SIGN_IN_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_URL ?? '#';

const LINKS = [
  { key: 'browsePlanners', href: '#planners' },
  { key: 'howItWorks', href: '#how-it-works' },
  { key: 'forPlanners', href: '#for-planners' },
  { key: 'about', href: '#about' },
] as const;

/**
 * Sticky translucent nav — matches `NavBar` in sections.jsx. The full link
 * row + secondary actions only fit from `lg` up (Hero's own grid stacks at
 * the same breakpoint); below that, everything collapses into a hamburger
 * menu, keeping just the logo and primary "Get quotes" CTA visible.
 */
export function NavBar() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const lang = i18n.language as AppLanguage;
  const [open, setOpen] = useState(false);

  // Arabic is the unprefixed default route, English is "/en" — switching
  // languages means navigating to the other real route (not just flipping
  // i18next state), since the URL is what makes each language
  // independently crawlable/indexable. A hard navigation (rather than
  // client-side router.push) keeps this foolproof: the new route's layout
  // re-runs server-side with the correct <html lang/dir> from scratch.
  function switchLanguage() {
    const withoutLocalePrefix = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
    const targetHref = lang === 'en' ? withoutLocalePrefix : `/en${withoutLocalePrefix === '/' ? '' : withoutLocalePrefix}`;
    const nextLang: AppLanguage = lang === 'en' ? 'ar' : 'en';
    document.cookie = `${LANGUAGE_STORAGE_KEY}=${nextLang}; path=/; max-age=31536000; samesite=lax`;
    window.location.href = targetHref;
  }

  const langToggle = (
    <button
      type="button"
      onClick={switchLanguage}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-border-strong px-3.5 py-1.5 text-sm font-bold text-fg1"
    >
      <Globe size={16} />
      {lang === 'en' ? 'العربية' : 'English'}
    </button>
  );

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1180px] items-center gap-7 px-5 sm:px-10">
        <Logo size={38} />
        <div className="ms-4.5 hidden gap-6.5 lg:flex">
          {LINKS.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              onClick={() => setOpen(false)}
              className="cursor-pointer whitespace-nowrap text-[14.5px] font-semibold text-fg2"
            >
              {t(`nav.${key}`)}
            </a>
          ))}
        </div>
        <div className="ms-auto hidden items-center gap-3.5 lg:flex">
          {langToggle}
          <a href={SIGN_IN_URL} className="cursor-pointer whitespace-nowrap text-[14.5px] font-bold text-fg1">
            {t('nav.signIn')}
          </a>
          <a href={SIGN_IN_URL}>
            <Button size="sm" icon={Sparkle} className="whitespace-nowrap">
              {t('nav.getQuotes')}
            </Button>
          </a>
        </div>

        <div className="ms-auto flex items-center gap-2.5 lg:hidden">
          <a href={SIGN_IN_URL}>
            <Button size="sm" icon={Sparkle} className="whitespace-nowrap">
              {t('nav.getQuotes')}
            </Button>
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md border border-border text-fg1"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-5 py-5 lg:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                className="cursor-pointer text-[15px] font-semibold text-fg2"
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3.5 border-t border-border pt-5">
            {langToggle}
            <a href={SIGN_IN_URL} className="cursor-pointer whitespace-nowrap text-[14.5px] font-bold text-fg1">
              {t('nav.signIn')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
