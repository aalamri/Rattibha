import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { ensureI18nInitialized, type AppLanguage } from '@/i18n';

/**
 * Renders through the app's real I18nextProvider — the same wrapping
 * apps/planner/src/app/layout.tsx uses — so components exercise their
 * actual useIsRTL()/useTranslation() hook chain. Only components that read
 * i18n directly need this; most of components/ui/ doesn't and uses a bare
 * render() instead.
 */
export async function renderWithI18n(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  ensureI18nInitialized(lang);
  await i18n.changeLanguage(lang);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

// i18n is a module-level singleton shared across every test file in the
// run — reset it after each test so a language change in one test/file
// can't leak into the next and produce order-dependent failures.
afterEach(async () => {
  await i18n.changeLanguage('en');
});

export { i18n };
