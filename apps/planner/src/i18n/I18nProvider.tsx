'use client';

import { I18nextProvider } from 'react-i18next';

import i18n, { ensureI18nInitialized, type AppLanguage } from './index';

export function I18nProvider({ initialLang, children }: { initialLang: AppLanguage; children: React.ReactNode }) {
  // Runs identically during the server's render and the client's hydration
  // render (both receive the same `initialLang`, derived from the same
  // `rtb_lang` cookie) — see ensureI18nInitialized's doc comment.
  ensureI18nInitialized(initialLang);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
