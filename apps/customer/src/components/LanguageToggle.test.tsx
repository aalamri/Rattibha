import { fireEvent, waitFor } from '@testing-library/react-native';

import { i18n, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import { LanguageToggle } from './LanguageToggle';

describe('LanguageToggle', () => {
  test('LTR (en): renders the ع label and pressing switches the real i18n language to ar', async () => {
    const { getByText } = await renderWithProviders(<LanguageToggle />, { lang: 'en' });
    expect(getByText('ع')).toBeTruthy();
    await fireEvent.press(getByText('ع'));
    await waitFor(() => expect(i18n.language).toBe('ar'));
  });

  test('RTL (ar): renders the EN label and pressing switches the real i18n language to en', async () => {
    const { getByText } = await renderWithProviders(<LanguageToggle />, { lang: 'ar' });
    expect(getByText('EN')).toBeTruthy();
    await fireEvent.press(getByText('EN'));
    await waitFor(() => expect(i18n.language).toBe('en'));
  });

  test('accessibilityLabel resolves the real common.toggleLanguage translation per locale', async () => {
    const enResult = await renderWithProviders(<LanguageToggle />, { lang: 'en' });
    expect(enResult.getByLabelText(en.common.toggleLanguage)).toBeTruthy();

    const arResult = await renderWithProviders(<LanguageToggle />, { lang: 'ar' });
    expect(arResult.getByLabelText(ar.common.toggleLanguage)).toBeTruthy();
  });
});
