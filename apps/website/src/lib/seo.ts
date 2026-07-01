import type { AppLanguage } from '@/i18n/constants';

/** Prefixes a locale-agnostic path with "/en" for English, leaves Arabic
 * (the unprefixed default route) untouched — same rule the proxy and
 * NavBar's language toggle use for locale-prefixed routing. */
export function localeHref(lang: AppLanguage, path: string) {
  return lang === 'en' ? `/en${path === '/' ? '' : path}` : path;
}

/** Builds the `alternates` block for `generateMetadata` on any page, given
 * its locale-agnostic path (e.g. "/planners/riyadh") — mirrors the
 * canonical/hreflang pattern established for the homepage in
 * [locale]/layout.tsx, generalized to non-root pages. */
export function buildAlternates(lang: AppLanguage, path: string) {
  const arPath = path;
  const enPath = `/en${path === '/' ? '' : path}`;
  return {
    canonical: lang === 'en' ? enPath : arPath,
    languages: { ar: arPath, en: enPath, 'x-default': arPath },
  };
}
