import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { PlannerProfileSection } from '@/components/sections/PlannerProfileSection';
import { PLANNER_STATS } from '@/data/planners';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates } from '@/lib/seo';

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
  const entry = DICTS[lang].planners[index];

  return (
    <>
      <NavBar />
      <PlannerProfileSection entry={entry} stat={stat} />
      <Footer />
    </>
  );
}
