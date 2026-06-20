import type { Metadata } from 'next';
import { El_Messiri, Playfair_Display, Poppins, Tajawal } from 'next/font/google';
import { Toaster } from 'sonner';

import { I18nProvider } from '@/i18n/I18nProvider';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/theme/ThemeContext';

import './globals.css';

/**
 * Runs before paint to apply the persisted theme (or system preference)
 * without a flash of the wrong scheme — React hasn't hydrated yet at this
 * point, so this has to be a plain inline script, not a component.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem('rtb_theme') || 'system';
    var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const elMessiri = El_Messiri({
  variable: '--font-el-messiri',
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
});

const tajawal = Tajawal({
  variable: '--font-tajawal',
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Rattibha — Planner Dashboard',
  description: 'Manage leads, offers, bookings and your storefront on Rattibha.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${playfair.variable} ${poppins.variable} ${elMessiri.variable} ${tajawal.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg-app text-fg1 antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: 'var(--font-poppins), sans-serif',
                  fontSize: '13.5px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-fg1)',
                },
              }}
            />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
