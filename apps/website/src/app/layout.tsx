// Intentionally minimal — <html>/<body> live in [locale]/layout.tsx instead,
// since the lang/dir attributes depend on the locale route segment, which
// isn't available at this level. This is the standard Next.js App Router
// i18n pattern (see vercel/next.js's app-dir-i18n-routing example).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
