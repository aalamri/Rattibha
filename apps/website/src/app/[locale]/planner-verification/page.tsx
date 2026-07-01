import type { Metadata } from 'next';

import { Footer } from '@/components/sections/Footer';
import { LegalPageBody } from '@/components/sections/LegalPageBody';
import { NavBar } from '@/components/sections/NavBar';
import { LEGAL_LAST_UPDATED, PLANNER_VERIFICATION } from '@/content/legalPages';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import { buildLegalMetadata } from '@/lib/seo';

const PATH = '/planner-verification';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  return buildLegalMetadata(lang, PATH, PLANNER_VERIFICATION[lang]);
}

export default async function PlannerVerificationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  return (
    <>
      <NavBar />
      <LegalPageBody content={PLANNER_VERIFICATION[lang]} lastUpdated={LEGAL_LAST_UPDATED[lang]} />
      <Footer />
    </>
  );
}
