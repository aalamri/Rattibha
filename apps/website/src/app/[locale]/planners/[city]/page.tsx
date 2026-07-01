import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CityPlannersSection } from '@/components/sections/CityPlannersSection';
import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { CITY_KEYS, type CityKey } from '@/data/planners';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates } from '@/lib/seo';

const DICTS: Record<AppLanguage, typeof en> = { en, ar };

// Fixed set of six cities — any other value 404s rather than rendering an
// on-demand page for an arbitrary string (see task #17).
export const dynamicParams = false;

export function generateStaticParams() {
  return CITY_KEYS.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const { locale, city } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const page = dict.cityPages[city as CityKey];

  return {
    title: `${page.title} · Ratibha`,
    description: page.intro,
    alternates: buildAlternates(lang, `/planners/${city}`),
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  if (!CITY_KEYS.includes(city as CityKey)) {
    notFound();
  }

  return (
    <>
      <NavBar />
      <CityPlannersSection city={city as CityKey} />
      <Footer />
    </>
  );
}
