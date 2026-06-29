import { NextResponse, type NextRequest } from 'next/server';

import { LANGUAGE_STORAGE_KEY } from '@/i18n/constants';

/**
 * First-visit language detection. Arabic is the site's default — a visitor
 * only gets English if their browser explicitly prefers it (via the
 * `Accept-Language` header, the standard server-side signal for this, since
 * `navigator.language` can't be read server-side). Once set, the cookie —
 * not this header — becomes the source of truth, so an explicit toggle
 * always wins.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(LANGUAGE_STORAGE_KEY)) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const prefersEnglish = acceptLanguage.toLowerCase().split(',')[0]?.trim().startsWith('en');

  if (!prefersEnglish) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(LANGUAGE_STORAGE_KEY, 'en', { path: '/', maxAge: 31536000, sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: '/',
};
