import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { PlannerProfileSection } from '@/components/sections/PlannerProfileSection';
import { CITY_KEYS, type CityKey, PLANNER_STATS, type PlannerStat } from '@/data/planners';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates, buildBreadcrumbJsonLd, localeHref, SITE_URL } from '@/lib/seo';

interface PlannerEntry {
  name: string;
  city: string;
  type: string;
  bio: string;
  portfolio: { caption: string }[];
  packages: { name: string; description: string }[];
  reviews: { author: string; text: string }[];
}

// LocalBusiness + a nested Service offer, plus the same real per-planner
// reviews shown in the Reviews section (task #25). Still no aggregateRating
// — that would need a genuine review *count* backing the headline `rating`
// shown in the UI (e.g. "4.9"), and 2 sample reviews don't establish that;
// see task #19's Review schema on the homepage for the same reasoning.
function buildProfileJsonLd(entry: PlannerEntry, stat: PlannerStat, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${pageUrl}#business`,
    name: entry.name,
    description: entry.bio,
    url: pageUrl,
    areaServed: { '@type': 'City', name: entry.city },
    address: { '@type': 'PostalAddress', addressLocality: entry.city, addressCountry: 'SA' },
    makesOffer: {
      '@type': 'Offer',
      priceCurrency: 'SAR',
      price: stat.from,
      itemOffered: { '@type': 'Service', name: entry.type },
    },
    review: entry.reviews.map((review, i) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      reviewBody: review.text,
      reviewRating: { '@type': 'Rating', ratingValue: String(stat.reviewRatings[i]), bestRating: '5' },
    })),
  };
}

const DICTS: Record<AppLanguage, typeof en> = { en, ar };

// Fixed set of eight demo planners — any other slug 404s rather than
// rendering an on-demand page for an arbitrary string (see task #17).
export const dynamicParams = false;

export function generateStaticParams() {
  return PLANNER_STATS.map((stat) => ({ city: stat.cityKey ?? 'taif', slug: stat.slug }));
}

function findPlannerIndex(city: string, slug: string) {
  return PLANNER_STATS.findIndex((stat) => stat.slug === slug && (stat.cityKey ?? 'taif') === city);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, city, slug } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const index = findPlannerIndex(city, slug);
  if (index === -1) {
    return {};
  }
  const entry = DICTS[lang].planners[index];

  return {
    title: `${entry.name} · ${entry.city} · Ratibha`,
    description: entry.bio,
    alternates: buildAlternates(lang, `/planners/${city}/${slug}`),
  };
}

export default async function PlannerProfilePage({ params }: { params: Promise<{ locale: string; city: string; slug: string }> }) {
  const { locale, city, slug } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const index = findPlannerIndex(city, slug);
  if (index === -1) {
    notFound();
  }
  const stat = PLANNER_STATS[index];
  const dict = DICTS[lang];
  const entry = dict.planners[index];
  const path = `/planners/${city}/${slug}`;
  const pageUrl = `${SITE_URL}${localeHref(lang, path)}`;

  const breadcrumbItems = [{ name: dict.nav.home, path: localeHref(lang, '/') }];
  if (CITY_KEYS.includes(city as CityKey)) {
    breadcrumbItems.push({ name: dict.cities[city as CityKey], path: localeHref(lang, `/planners/${city}`) });
  }
  breadcrumbItems.push({ name: entry.name, path: localeHref(lang, path) });

  return (
    <>
      <JsonLd data={buildProfileJsonLd(entry, stat, pageUrl)} />
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <NavBar />
      <PlannerProfileSection entry={entry} stat={stat} />
      <Footer />
    </>
  );
}
