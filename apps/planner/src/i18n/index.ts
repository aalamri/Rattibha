import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';

/** Persistence key, matches the prototype's `rtb_lang` localStorage key. */
export const LANGUAGE_STORAGE_KEY = 'rtb_lang';

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

export type AppLanguage = keyof typeof resources;

export function isRTLLanguage(lang: string) {
  return lang === 'ar';
}

function detectInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'en' || stored === 'ar') return stored;
  return window.navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: detectInitialLanguage(),
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnEmptyString: false,
    })
    .then(() => {
      // Arabic numerals: i18next's built-in {{value, number}} formatter calls
      // Intl.NumberFormat(lng, ...) with the bare language code, which renders
      // Western digits for 'ar' — only 'ar-SA' produces Arabic-Indic (١٢٣).
      i18n.services.formatter?.add('number', (value, lng, options) =>
        new Intl.NumberFormat(lng === 'ar' ? 'ar-SA' : lng, options).format(value)
      );
    });
}

export function setAppLanguage(lang: AppLanguage) {
  i18n.changeLanguage(lang);
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  syncDocumentDirection(lang);
}

export function syncDocumentDirection(lang: string) {
  if (typeof document === 'undefined') return;
  const rtl = isRTLLanguage(lang);
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

export default i18n;
