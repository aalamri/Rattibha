import type { MetadataRoute } from 'next';

import { CATEGORY_CITY_COMBOS, CATEGORY_KEYS, CITY_KEYS, PLANNER_STATS } from '@/data/planners';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratibha.com';

// "/" (Arabic, default) and "/en" are both real, independently crawlable
// routes now (see locale-prefixed routing) — list both, and cross-reference
// them via `alternates.languages` so the sitemap itself carries the same
// hreflang relationship already declared in each page's <head> (see
// [locale]/layout.tsx's generateMetadata). City, category and planner
// profile pages (task #17) get the same ar/en pair treatment.
function entry(path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap[number] {
  const arUrl = `${SITE_URL}${path}`;
  const enUrl = `${SITE_URL}/en${path}`;
  return {
    url: arUrl,
    lastModified,
    changeFrequency: 'weekly',
    priority,
    alternates: { languages: { ar: arUrl, en: enUrl, 'x-default': arUrl } },
  };
}

// English variant of the same path, sharing the same alternates so both
// directions of the hreflang pair are listed (matches the existing "/" +
// "/en" pattern below).
function entryEn(path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap[number] {
  const arUrl = `${SITE_URL}${path}`;
  const enUrl = `${SITE_URL}/en${path}`;
  return {
    url: enUrl,
    lastModified,
    changeFrequency: 'weekly',
    priority,
    alternates: { languages: { ar: arUrl, en: enUrl, 'x-default': arUrl } },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ar: SITE_URL,
    en: `${SITE_URL}/en`,
    'x-default': SITE_URL,
  };
  const lastModified = new Date();

  const cityPaths = CITY_KEYS.map((city) => `/planners/${city}`);
  const categoryPaths = CATEGORY_KEYS.map((category) => `/categories/${category}`);
  const plannerPaths = PLANNER_STATS.map((stat) => `/planners/${stat.cityKey ?? 'taif'}/${stat.slug}`);
  const cityCategoryPaths = CATEGORY_CITY_COMBOS.map(({ category, city }) => `/categories/${category}/${city}`);
  const legalPaths = ['/privacy', '/terms', '/refund-policy', '/cancellation-policy', '/dispute-resolution', '/planner-verification'];
  const plannerRecruitmentPaths = ['/for-planners'];
  const plannersHubPaths = ['/planners'];

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
    ...cityPaths.flatMap((path) => [entry(path, lastModified, 0.8), entryEn(path, lastModified, 0.8)]),
    ...categoryPaths.flatMap((path) => [entry(path, lastModified, 0.8), entryEn(path, lastModified, 0.8)]),
    ...plannerPaths.flatMap((path) => [entry(path, lastModified, 0.6), entryEn(path, lastModified, 0.6)]),
    ...cityCategoryPaths.flatMap((path) => [entry(path, lastModified, 0.7), entryEn(path, lastModified, 0.7)]),
    ...legalPaths.flatMap((path) => [entry(path, lastModified, 0.3), entryEn(path, lastModified, 0.3)]),
    ...plannerRecruitmentPaths.flatMap((path) => [entry(path, lastModified, 0.7), entryEn(path, lastModified, 0.7)]),
    ...plannersHubPaths.flatMap((path) => [entry(path, lastModified, 0.8), entryEn(path, lastModified, 0.8)]),
  ];
}
