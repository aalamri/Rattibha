import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryPlannersSection } from '@/components/sections/CategoryPlannersSection';
import { Footer } from '@/components/sections/Footer';
import { NavBar } from '@/components/sections/NavBar';
import { CATEGORY_KEYS, type CategoryKey } from '@/data/planners';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { buildAlternates } from '@/lib/seo';

const DICTS: Record<AppLanguage, typeof en> = { en, ar };

// Fixed set of five categories — any other value 404s rather than rendering
// an on-demand page for an arbitrary string (see task #17).
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_KEYS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const page = dict.categoryPages[category as CategoryKey];

  return {
    title: `${page.title} · Ratibha`,
    description: page.intro,
    alternates: buildAlternates(lang, `/categories/${category}`),
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!CATEGORY_KEYS.includes(category as CategoryKey)) {
    notFound();
  }

  return (
    <>
      <NavBar />
      <CategoryPlannersSection category={category as CategoryKey} />
      <Footer />
    </>
  );
}
