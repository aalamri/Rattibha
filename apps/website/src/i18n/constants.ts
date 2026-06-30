/**
 * Pure constants with zero i18next/react-i18next imports, safe to import
 * from Server Components (layout.tsx, middleware.ts). `index.ts` re-exports
 * these for client code, but Server Components must import from here
 * directly — importing `index.ts` pulls in `react-i18next`, which calls
 * `React.createContext` at module scope and crashes the RSC bundle (Server
 * Components can't use Context).
 */
export const LANGUAGE_STORAGE_KEY = 'rtb_lang';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isRTLLanguage(lang: string) {
  return lang === 'ar';
}

/**
 * `Intl.NumberFormat`/`toLocaleString` render Western digits for the bare
 * 'ar' tag — only the region-qualified 'ar-SA' produces Arabic-Indic
 * numerals (١٢٣). Centralizes the locale-tag mapping so every on-page
 * number (ratings, prices, counts) renders consistently instead of some
 * being Arabic-Indic and others silently staying Western.
 */
export function formatLocaleNumber(value: number, lang: string, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', options);
}
