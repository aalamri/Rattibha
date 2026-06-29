import { NextResponse, type NextRequest } from 'next/server';

import { LANGUAGE_STORAGE_KEY } from '@/i18n/constants';

/**
 * Locale routing: "/" serves Arabic (the default — rewritten internally to
 * "/ar" so the file-system route under [locale] resolves, but the URL bar
 * stays "/"), "/en" serves English as a real, visible, independently
 * crawlable route. This is what actually makes hreflang/per-locale SEO work
 * — a single URL + cookie toggle can never be indexed as two languages,
 * since Google can't see the cookie.
 *
 * A returning visitor's explicit choice (the `rtb_lang` cookie, set by the
 * language toggle) always wins over the Accept-Language guess used on first
 * visit — `navigator.language` can't be read server-side, so Accept-Language
 * is the standard way to guess a first-time visitor's preference here.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already on the English route, or a non-page request (static assets,
  // robots.txt, sitemap.xml, etc.) — nothing to rewrite or redirect.
  if (pathname.startsWith('/en') || pathname.startsWith('/_next') || /\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const cookieLang = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const prefersEnglish = acceptLanguage.toLowerCase().split(',')[0]?.trim().startsWith('en');
  const wantsEnglish = cookieLang === 'en' || (!cookieLang && prefersEnglish);

  if (wantsEnglish) {
    // Real redirect — the URL bar needs to show /en for it to be a distinct,
    // independently indexable route.
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  // Arabic (default): rewrite invisibly to /ar so [locale] resolves, while
  // the URL bar keeps showing the unprefixed path.
  const url = request.nextUrl.clone();
  url.pathname = `/ar${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
