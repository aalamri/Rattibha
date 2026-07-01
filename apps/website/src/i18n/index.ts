import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';

import { formatLocaleNumber, isRTLLanguage, LANGUAGE_STORAGE_KEY, type AppLanguage } from './constants';

export { formatLocaleNumber, isRTLLanguage, LANGUAGE_STORAGE_KEY, type AppLanguage };

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

function addArabicNumberFormatter() {
  // Arabic numerals: i18next's built-in {{value, number}} formatter calls
  // Intl.NumberFormat(lng, ...) with the bare language code, which renders
  // Western digits for 'ar' — only 'ar-SA' produces Arabic-Indic (١٢٣).
  i18n.services.formatter?.add('number', (value, lng, options) =>
    new Intl.NumberFormat(lng === 'ar' ? 'ar-SA' : lng, options).format(value)
  );
}

/**
 * Initializes (or re-targets) i18next to `lang` synchronously, so it can be
 * called directly in a component's render body — by both the server's
 * single render and the client's hydration render — rather than in a
 * `useEffect`. Resources are bundled statically (no async backend), so
 * `t()` calls immediately after this reflect `lang` within the same render
 * pass. This is what keeps server and client output identical: the server
 * derives `lang` from the [locale] route segment and passes it down as
 * `initialLang`, and the client's hydration render receives that same prop
 * straight out of the server-rendered HTML/RSC payload.
 *
 * Caveat: i18next here is a single module-level instance shared by every
 * request this Node process handles. For a marketing site without
 * per-request personalization beyond the language toggle, that's an
 * accepted trade-off (matches the simple singleton pattern already used in
 * apps/planner) — a high-traffic, fully request-isolated setup would want
 * a scoped instance per request instead.
 */
export function ensureI18nInitialized(lang: AppLanguage) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: lang,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnEmptyString: false,
    });
    addArabicNumberFormatter();
  } else if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }
  return i18n;
}

export default i18n;
