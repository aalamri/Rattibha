import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { CTABand } from '@/components/sections/CTABand';
import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { PlannerClosingCta } from '@/components/sections/PlannerClosingCta';
import { PlannerHowItWorks } from '@/components/sections/PlannerHowItWorks';
import { PlannerValueProps } from '@/components/sections/PlannerValueProps';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates, buildBreadcrumbJsonLd, localeHref } from '@/lib/seo';

const DICTS: Record<AppLanguage, typeof en> = { en, ar };
const PATH = '/for-planners';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];

  return {
    title: `${dict.forPlanners.metaTitle} · Ratibha`,
    description: dict.forPlanners.metaDescription,
    alternates: buildAlternates(lang, PATH),
  };
}

/** Dedicated planner-facing landing page (task #28) — decoupled from the
 * customer homepage so each audience gets a focused funnel. CTABand
 * (previously embedded partway down the homepage) now serves as this
 * page's hero/<h1>. */
export default async function ForPlannersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: dict.nav.home, path: localeHref(lang, '/') },
    { name: dict.nav.forPlanners, path: localeHref(lang, PATH) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <NavBar />
      <CTABand />
      <PlannerValueProps />
      <PlannerHowItWorks />
      <PlannerClosingCta />
      <Footer />
    </>
  );
}
