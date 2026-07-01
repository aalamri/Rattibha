import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratibha.com';

// "/" (Arabic, default) and "/en" are both real, independently crawlable
// routes now (see locale-prefixed routing) — list both, and cross-reference
// them via `alternates.languages` so the sitemap itself carries the same
// hreflang relationship already declared in each page's <head> (see
// [locale]/layout.tsx's generateMetadata).
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ar: SITE_URL,
    en: `${SITE_URL}/en`,
    'x-default': SITE_URL,
  };
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages },
    },
  ];
}
