'use client';

import { CircleHalfTilt, Globe, MagnifyingGlass, SignOut } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { setAppLanguage, type AppLanguage } from '@/i18n';
import { useAuth } from '@/lib/AuthContext';
import { useThemeMode } from '@/theme/ThemeContext';

import { NotificationsPanel } from './NotificationsPanel';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

const NEXT_MODE = { system: 'light', light: 'dark', dark: 'system' } as const;

export function Topbar({ title, subtitle }: TopbarProps) {
  const { t, i18n } = useTranslation();
  const { profile, planner, signOut } = useAuth();
  const { mode, setMode } = useThemeMode();
  const lang = i18n.language as AppLanguage;

  return (
    <header className="flex h-[72px] flex-shrink-0 items-center gap-4 border-b border-border bg-bg-surface px-7">
      <div className="flex-1">
        <h1 className="font-display text-2xl font-semibold leading-tight text-fg1">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-fg3">{subtitle}</p>}
      </div>

      <div className="flex w-[200px] items-center gap-2 rounded-sm border border-border bg-bg-app px-3.5 py-2.5">
        <MagnifyingGlass size={17} className="text-fg3" />
        <span className="text-[13.5px] text-fg3">{t('common.searchPlaceholder')}</span>
      </div>

      <button
        type="button"
        onClick={() => setAppLanguage(lang === 'ar' ? 'en' : 'ar')}
        aria-label={t('common.toggleLanguage')}
        className="inline-flex h-[42px] items-center gap-1.5 rounded-sm border border-border px-3.5 text-[13.5px] font-bold text-fg1"
      >
        <Globe size={17} aria-hidden="true" />
        {lang === 'ar' ? 'EN' : 'العربية'}
      </button>

      <button
        type="button"
        onClick={() => setMode(NEXT_MODE[mode])}
        title={t(`common.appearance.${mode}`)}
        aria-label={t('common.toggleAppearance')}
        className="grid h-[42px] w-[42px] place-items-center rounded-md border border-border text-fg3 hover:text-fg1"
      >
        <CircleHalfTilt size={19} aria-hidden="true" />
      </button>

      <NotificationsPanel />

      <div className="flex items-center gap-2.5 ps-1.5">
        <Avatar seed={profile?.avatar_seed ?? 0} size={40} initials={(planner?.business_name ?? '?').charAt(0)} />
        <div className="leading-tight">
          <div className="text-[13.5px] font-semibold text-fg1">{planner?.business_name ?? '…'}</div>
          <div className="text-[11.5px] text-fg3">{planner ? t(`cities.${planner.city}`) : ''}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        title={t('auth.signOut')}
        aria-label={t('auth.signOut')}
        className="grid h-[42px] w-[42px] place-items-center rounded-md border border-border text-fg3 hover:text-fg1"
      >
        <SignOut size={19} aria-hidden="true" />
      </button>
    </header>
  );
}
