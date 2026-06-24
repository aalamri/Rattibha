import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratibha.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // The language toggle is client-side (matches apps/planner and
  // apps/customer's pattern) rather than per-locale routes, so there isn't
  // a distinct Arabic URL to declare as an hreflang alternate — only one
  // crawlable entry exists.
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
