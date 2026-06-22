import { NextResponse, type NextRequest } from 'next/server';

import { LANGUAGE_STORAGE_KEY } from '@/i18n/constants';

/**
 * First-visit language detection. `navigator.language` can't be read
 * server-side, so without this, every first-time visitor would see English
 * regardless of their browser's actual language — the `Accept-Language`
 * request header is the correct, standard way to detect this on the server
 * (and is more accurate than `navigator.language`, since it's weighted
 * preferences rather than a single value). Once set, the cookie — not this
 * header — becomes the source of truth, so an explicit toggle always wins.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(LANGUAGE_STORAGE_KEY)) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const prefersArabic = acceptLanguage.toLowerCase().split(',')[0]?.trim().startsWith('ar');

  if (!prefersArabic) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(LANGUAGE_STORAGE_KEY, 'ar', { path: '/', maxAge: 31536000, sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: '/',
};
