import type { AppLanguage } from '@/i18n/constants';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratibha.com';

/** Prefixes a locale-agnostic path with "/en" for English, leaves Arabic
 * (the unprefixed default route) untouched — same rule the proxy and
 * NavBar's language toggle use for locale-prefixed routing. */
export function localeHref(lang: AppLanguage, path: string) {
  return lang === 'en' ? `/en${path === '/' ? '' : path}` : path;
}

/** Builds a BreadcrumbList JSON-LD block from an ordered list of
 * {name, path} pairs, where `path` is already locale-prefixed (pass it
 * through `localeHref` first). Used on city/category/profile pages — see
 * task #19. */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
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
