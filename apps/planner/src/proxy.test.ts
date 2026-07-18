/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { proxy } from './proxy';

describe('proxy', () => {
  test('no rtb_lang cookie, Arabic Accept-Language: sets rtb_lang=ar', () => {
    const request = new NextRequest('https://example.com/', {
      headers: { 'accept-language': 'ar-SA,ar;q=0.9' },
    });
    const response = proxy(request);
    const cookie = response.cookies.get('rtb_lang');
    expect(cookie?.value).toBe('ar');
    expect(cookie?.maxAge).toBe(31536000);
    expect(cookie?.sameSite).toBe('lax');
  });

  test('no rtb_lang cookie, non-Arabic Accept-Language: passthrough, no cookie set', () => {
    const request = new NextRequest('https://example.com/', {
      headers: { 'accept-language': 'en-US,en;q=0.9' },
    });
    const response = proxy(request);
    expect(response.cookies.get('rtb_lang')).toBeUndefined();
  });

  test('rtb_lang cookie already present: passthrough regardless of Accept-Language', () => {
    const request = new NextRequest('https://example.com/', {
      headers: { cookie: 'rtb_lang=en', 'accept-language': 'ar-SA' },
    });
    const response = proxy(request);
    expect(response.cookies.get('rtb_lang')).toBeUndefined();
  });
});
