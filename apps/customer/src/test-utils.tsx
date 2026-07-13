import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n, { initI18n, type AppLanguage } from '@/i18n';
import { ThemeProvider } from '@/theme/ThemeContext';

// ThemeProvider and the i18n singleton both touch AsyncStorage on mount.
// The package's own Jest mock avoids the "NativeModule: AsyncStorage is
// null" crash that happens under Jest without it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

/**
 * Renders through the app's real ThemeProvider/I18nextProvider — the same
 * wrapping apps/customer/src/app/_layout.tsx uses — so components exercise
 * their actual useTheme()/useIsRTL() hook chain, not a mocked one.
 */
export async function renderWithProviders(ui: ReactElement, { lang = 'en' as AppLanguage } = {}) {
  await initI18n();
  await i18n.changeLanguage(lang);
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
  await i18n.changeLanguage('en');
});

export { i18n };
