import type { Metadata } from 'next';

import { Footer } from '@/components/sections/Footer';
import { LegalPageBody } from '@/components/sections/LegalPageBody';
import { NavBar } from '@/components/sections/NavBar';
import { LEGAL_LAST_UPDATED, PRIVACY_POLICY } from '@/content/legalPages';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import { buildLegalMetadata } from '@/lib/seo';

const PATH = '/privacy';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  return buildLegalMetadata(lang, PATH, PRIVACY_POLICY[lang]);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  return (
    <>
      <NavBar />
      <LegalPageBody content={PRIVACY_POLICY[lang]} lastUpdated={LEGAL_LAST_UPDATED[lang]} />
      <Footer />
    </>
  );
}
