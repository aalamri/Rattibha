import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { CityCategoryPlannersSection } from '@/components/sections/CityCategoryPlannersSection';
import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { CATEGORY_CITY_COMBOS, type CategoryKey, type CityKey } from '@/data/planners';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates, buildBreadcrumbJsonLd, localeHref } from '@/lib/seo';

const DICTS: Record<AppLanguage, typeof en> = { en, ar };

// Only combos with a real planner match are generated (see
// CATEGORY_CITY_COMBOS) — any other {category, city} pair 404s rather than
// rendering an empty, thin-content page (see task #24).
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_CITY_COMBOS.map(({ category, city }) => ({ category, city }));
}

function comboKey(category: string, city: string) {
  return `${city}-${category}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; city: string }>;
}): Promise<Metadata> {
  const { locale, category, city } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const page = dict.cityCategoryPages[comboKey(category, city) as keyof typeof dict.cityCategoryPages];

  return {
    title: `${page.title} · Ratibha`,
    description: page.intro,
    alternates: buildAlternates(lang, `/categories/${category}/${city}`),
  };
}

export default async function CityCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; city: string }>;
}) {
  const { locale, category, city } = await params;
  const isValidCombo = CATEGORY_CITY_COMBOS.some((combo) => combo.category === category && combo.city === city);
  if (!isValidCombo) {
    notFound();
  }
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: dict.nav.home, path: localeHref(lang, '/') },
    { name: dict.categories[category as CategoryKey], path: localeHref(lang, `/categories/${category}`) },
    { name: dict.cities[city as CityKey], path: localeHref(lang, `/categories/${category}/${city}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <NavBar />
      <CityCategoryPlannersSection category={category as CategoryKey} city={city as CityKey} />
      <Footer />
    </>
  );
}
