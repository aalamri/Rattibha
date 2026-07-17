import { act, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { initI18n, type AppLanguage } from '@/i18n';
import type { Planner } from '@/data/planners';
import { ThemeProvider } from '@/theme/ThemeContext';

// ThemeProvider and the i18n singleton both touch AsyncStorage on mount.
// The package's own Jest mock avoids the "NativeModule: AsyncStorage is
// null" crash that happens under Jest without it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

/** Minimal valid Planner fixture — pass overrides for the fields a test cares about. */
export function makePlanner(overrides?: Partial<Planner>): Planner {
  return {
    id: 'planner-1',
    name: 'Layla Events',
    city: 'riyadh',
    type: 'Wedding Planner',
    rating: 4.8,
    events: 42,
    premium: false,
    verified: true,
    from: 5000,
    seed: 3,
    blurb: 'Full-service wedding and event planning across Riyadh.',
    tags: ['weddings'],
    services: [],
    packages: [],
    ...overrides,
  };
}

/**
 * Renders through the app's real ThemeProvider/I18nextProvider — the same
 * wrapping apps/customer/src/app/_layout.tsx uses — so components exercise
 * their actual useTheme()/useIsRTL() hook chain, not a mocked one.
 */
export async function renderWithProviders(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  await initI18n();
  // A still-mounted tree from a prior test re-renders in response to this
  // language change (i18n is a shared singleton) — act() flushes that
  // re-render instead of leaving it to surface as an "not wrapped in act"
  // warning in an unrelated later test.
  await act(async () => {
    await i18n.changeLanguage(lang);
  });
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{ui}</ThemeProvider>
    </I18nextProvider>
  );
}

// i18n is a module-level singleton shared across every test file in the
// run — reset it after each test so a language change in one test/file
// can't leak into the next and produce order-dependent failures.
afterEach(async () => {
  await act(async () => {
    await i18n.changeLanguage('en');
  });
});

export { i18n };
