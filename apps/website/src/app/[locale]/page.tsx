import { About } from '@/components/sections/About';
import { Categories } from '@/components/sections/Categories';
import { CityGrid } from '@/components/sections/CityGrid';
import { CTABand } from '@/components/sections/CTABand';
import { FAQSection } from '@/components/sections/FAQSection';
import { FeaturedGrid } from '@/components/sections/FeaturedGrid';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { NavBar } from '@/components/sections/NavBar';
import { Testimonials } from '@/components/sections/Testimonials';
import { TrustPillars } from '@/components/sections/TrustPillars';
import { WhatsAppHelp } from '@/components/sections/WhatsAppHelp';
import { JsonLd } from '@/components/JsonLd';
import { SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import { SITE_URL } from '@/lib/seo';

const DICTS: Record<AppLanguage, typeof en> = { en, ar };
const BRAND_NAME: Record<AppLanguage, string> = { en: 'Ratibha', ar: 'رتّبها' };

// Homepage-specific structured data — Review (customer testimonials) and
// FAQPage (the FAQ section below) — kept separate from the site-wide
// Organization/WebSite JSON-LD in [locale]/layout.tsx, since these two only
// describe content that actually appears on this specific page. Ratings are
// fixed at 5 to match the ★★★★★ display in Testimonials.tsx exactly — no
// aggregateRating is claimed here since we don't have a genuine per-review
// rating distribution to back one.
function buildHomeJsonLd(lang: AppLanguage, dict: typeof en) {
  const reviews = dict.testimonials.quotes.map((q) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: q.who },
    reviewBody: q.text,
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
  }));

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dict.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const organizationReviews = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND_NAME[lang],
    review: reviews,
  };

  return [faqPage, organizationReviews];
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const jsonLdBlocks = buildHomeJsonLd(lang, DICTS[lang]);

  return (
    <>
      {jsonLdBlocks.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <NavBar />
      {/* Funnel core, in the order set by task #27: search/CTA, matched
          planners, how it works, real reviews, deposit protection, FAQ,
          then a direct WhatsApp path for anyone still undecided. */}
      <Hero />
      <FeaturedGrid />
      <HowItWorks />
      <Testimonials />
      <TrustPillars />
      <FAQSection />
      <WhatsAppHelp />
      {/* Secondary navigation/context — useful, but not funnel-critical,
          so placed after the primary conversion path above. */}
      <Categories />
      <CityGrid />
      <About />
      <CTABand />
      <Footer />
    </>
  );
}
