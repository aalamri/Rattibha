import type { Metadata } from 'next';

import { Footer } from '@/components/sections/Footer';
import { LegalPageBody } from '@/components/sections/LegalPageBody';
import { NavBar } from '@/components/sections/NavBar';
import { CANCELLATION_POLICY, LEGAL_LAST_UPDATED } from '@/content/legalPages';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import { buildLegalMetadata } from '@/lib/seo';

const PATH = '/cancellation-policy';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  return buildLegalMetadata(lang, PATH, CANCELLATION_POLICY[lang]);
}

export default async function CancellationPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  return (
    <>
      <NavBar />
      <LegalPageBody content={CANCELLATION_POLICY[lang]} lastUpdated={LEGAL_LAST_UPDATED[lang]} />
      <Footer />
    </>
  );
}
