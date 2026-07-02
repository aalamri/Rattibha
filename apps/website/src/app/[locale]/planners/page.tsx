import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { Categories } from '@/components/sections/Categories';
import { CityGrid } from '@/components/sections/CityGrid';
import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { PlannersHubHeader } from '@/components/sections/PlannersHubHeader';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates, buildBreadcrumbJsonLd, localeHref } from '@/lib/seo';

const DICTS: Record<AppLanguage, typeof en> = { en, ar };
const PATH = '/planners';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];

  return {
    title: `${dict.plannersHub.title} · Ratibha`,
    description: dict.plannersHub.intro,
    alternates: buildAlternates(lang, PATH),
  };
}

/** "Browse all planners" hub — the real destination FeaturedGrid's
 * "Browse all 500+" action now links to (it previously had no href at
 * all). Reuses the existing Categories and CityGrid components rather
 * than duplicating their listings — this page is just those two entry
 * points given their own dedicated, indexable URL. */
export default async function PlannersHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: dict.nav.home, path: localeHref(lang, '/') },
    { name: dict.plannersHub.title, path: localeHref(lang, PATH) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <NavBar />
      <PlannersHubHeader />
      <Categories />
      <CityGrid />
      <Footer />
    </>
  );
}
