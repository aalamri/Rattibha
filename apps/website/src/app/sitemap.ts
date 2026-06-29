import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratibha.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // TODO: list both "/" (Arabic) and "/en" with hreflang alternates now that
  // each language is a real, independently crawlable route — see the
  // locale-routing follow-up task for per-locale metadata/sitemap work.
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
