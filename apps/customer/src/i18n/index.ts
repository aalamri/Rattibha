import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

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

async function detectInitialLanguage(): Promise<AppLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {
    // ignore storage errors, fall through to device locale
  }
  const deviceLang = Localization.getLocales()[0]?.languageCode;
  return deviceLang === 'ar' ? 'ar' : 'en';
}

/**
 * Syncs RN's layout direction with the given language. Changing I18nManager's
 * RTL setting only takes full effect after the app is reloaded — our screens
 * use `useIsRTL()` for instant, logical RTL styling regardless.
 */
export function syncTextDirection(lang: string) {
  const shouldBeRTL = isRTLLanguage(lang);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
}

let initPromise: Promise<typeof i18n> | null = null;

/** Idempotent i18next setup; safe to call from the root layout. */
export function initI18n() {
  if (!initPromise) {
    initPromise = (async () => {
      const lng = await detectInitialLanguage();
      await i18n.use(initReactI18next).init({
        resources,
        lng,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        returnEmptyString: false,
      });
      // Arabic numerals: i18next's built-in {{value, number}} formatter calls
      // Intl.NumberFormat(lng, ...) with the bare language code, which renders
      // Western digits for 'ar' — only 'ar-SA' produces Arabic-Indic (١٢٣).
      i18n.services.formatter?.add('number', (value, lng, options) =>
        new Intl.NumberFormat(lng === 'ar' ? 'ar-SA' : lng, options).format(value)
      );
      syncTextDirection(lng);
      return i18n;
    })();
  }
  return initPromise;
}

export async function setAppLanguage(lang: AppLanguage) {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
  syncTextDirection(lang);
}

export default i18n;
