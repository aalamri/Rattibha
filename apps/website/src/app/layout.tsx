import type { Metadata } from 'next';
import { El_Messiri, Playfair_Display, Poppins, Tajawal } from 'next/font/google';
import { cookies } from 'next/headers';

import { I18nProvider } from '@/i18n/I18nProvider';
import { isRTLLanguage, LANGUAGE_STORAGE_KEY, type AppLanguage } from '@/i18n/constants';

import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rattibha.example.com';

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Rattibha · Plan a celebration worth remembering',
  description:
    "Rattibha connects you with the Gulf's most trusted event planners — for weddings, engagements, birthdays and corporate galas. Compare, message and book with confidence.",
  openGraph: {
    title: 'Rattibha · Plan a celebration worth remembering',
    description:
      "Rattibha connects you with the Gulf's most trusted event planners — for weddings, engagements, birthdays and corporate galas.",
    siteName: 'Rattibha',
    locale: 'en',
    alternateLocale: 'ar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rattibha · Plan a celebration worth remembering',
    description:
      "Rattibha connects you with the Gulf's most trusted event planners — for weddings, engagements, birthdays and corporate galas.",
  },
  icons: {
    icon: '/app-icon.png',
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Reading the language from a cookie (rather than localStorage, which the
  // server can't see) lets this server-rendered <html> tag and the i18n
  // instance both start in the visitor's actual language on the very first
  // response — no post-hydration flash, and crawlers/Arabic-locale visitors
  // get Arabic content immediately instead of only after a client toggle.
  const cookieStore = await cookies();
  const stored = cookieStore.get(LANGUAGE_STORAGE_KEY)?.value;
  const initialLang: AppLanguage = stored === 'ar' ? 'ar' : 'en';
  const dir = isRTLLanguage(initialLang) ? 'rtl' : 'ltr';

  return (
    <html lang={initialLang} dir={dir} className={`${playfair.variable} ${poppins.variable} ${elMessiri.variable} ${tajawal.variable}`}>
      <body className="bg-ivory text-fg1 antialiased">
        <I18nProvider initialLang={initialLang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
