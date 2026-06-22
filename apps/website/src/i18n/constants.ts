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
