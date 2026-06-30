import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { El_Messiri, Playfair_Display, Poppins, Tajawal } from 'next/font/google';
import { notFound } from 'next/navigation';

import { I18nProvider } from '@/i18n/I18nProvider';
import { isRTLLanguage, SUPPORTED_LANGUAGES, type AppLanguage } from '@/i18n/constants';
// Server Components must not import from i18n/index.ts — it pulls in
// react-i18next, which calls React.createContext at module scope and
// crashes the RSC bundle. The locale JSON files are plain data, safe here.
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';

import '../globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratibha.com';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const elMessiri = El_Messiri({
  variable: '--font-el-messiri',
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
});

const tajawal = Tajawal({
  variable: '--font-tajawal',
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
});

// Locale-prefixed routing: "/" is Arabic (default, unprefixed — see proxy.ts's
// rewrite), "/en" is English (a real prefixed route). Both are independently
// crawlable/indexable, which a single URL + cookie toggle never could be —
// see task #4. generateStaticParams pre-renders both at build time.
export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((locale) => ({ locale }));
}

const DICTS: Record<AppLanguage, typeof en> = { en, ar };
const OG_LOCALE: Record<AppLanguage, string> = { en: 'en_US', ar: 'ar_SA' };

// Real per-locale metadata — each language gets its own genuinely-written
// title/description (from the locale JSON's `meta` namespace, not a
// machine translation of the other), used for the page title, OG, and
// Twitter card alike. hreflang/canonical are a separate follow-up task.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang: AppLanguage = SUPPORTED_LANGUAGES.includes(locale as AppLanguage) ? (locale as AppLanguage) : 'ar';
  const dict = DICTS[lang];
  const otherLang: AppLanguage = lang === 'ar' ? 'en' : 'ar';

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: 'Rattibha',
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[otherLang],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
    },
    icons: {
      icon: '/app-icon.png',
    },
  };
}

// Without this, mobile browsers fall back to a ~980px desktop-style layout
// viewport and scale the whole page down to fit — every `sm:`/`md:` Tailwind
// breakpoint becomes unreachable on a real phone since the browser never
// thinks it's narrower than ~980px.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!SUPPORTED_LANGUAGES.includes(locale as AppLanguage)) {
    notFound();
  }
  const initialLang = locale as AppLanguage;
  const dir = isRTLLanguage(initialLang) ? 'rtl' : 'ltr';

  return (
    <html lang={initialLang} dir={dir} className={`${playfair.variable} ${poppins.variable} ${elMessiri.variable} ${tajawal.variable}`}>
      <body className="bg-ivory text-fg1 antialiased">
        <I18nProvider initialLang={initialLang}>{children}</I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
