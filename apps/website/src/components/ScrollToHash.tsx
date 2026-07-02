'use client';

import { useEffect } from 'react';

/**
 * Scrolls to `window.location.hash` on mount — works around a known
 * Next.js App Router behavior where the client router resets scroll
 * position after hydration, silently cancelling the browser's native
 * scroll-to-anchor on a hard/cross-page navigation to a URL with a
 * fragment (e.g. clicking a NavBar link on /for-planners that goes to
 * "/en#how-it-works"). The browser scrolls there correctly for an instant,
 * then Next.js's hydration resets it to the top. Renders nothing.
 */
export function ScrollToHash() {
  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    target?.scrollIntoView();
  }, []);

  return null;
}
