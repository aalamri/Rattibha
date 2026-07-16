import { StyleSheet } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { getDisplayItalicFont, getTextStyle } from '@/theme/typography';
import { AccentText, Text } from './Text';

describe('Text', () => {
  test('h1 variant matches getTextStyle output', async () => {
    const { getByText } = await renderWithProviders(<Text variant="h1">Heading</Text>);
    const style = StyleSheet.flatten(getByText('Heading').props.style);
    const expected = getTextStyle('h1', false, lightTheme);
    expect(style.fontFamily).toBe(expected.fontFamily);
    expect(style.fontSize).toBe(expected.fontSize);
    expect(style.lineHeight).toBe(expected.lineHeight);
  });

  test('caption variant matches getTextStyle output', async () => {
    const { getByText } = await renderWithProviders(<Text variant="caption">Small print</Text>);
    const style = StyleSheet.flatten(getByText('Small print').props.style);
    const expected = getTextStyle('caption', false, lightTheme);
    expect(style.fontFamily).toBe(expected.fontFamily);
    expect(style.fontSize).toBe(expected.fontSize);
    expect(style.color).toBe(expected.color);
  });

  // Regression guard documented directly in Text.tsx's own comment: a
  // caller-provided lineHeight is tuned for English and is too tight for
  // Arabic, so it must be dropped (not just overridden) in RTL, while it's
  // kept as-is in LTR.
  test('LTR keeps a caller-provided lineHeight override', async () => {
    const { getByText } = await renderWithProviders(
      <Text style={{ lineHeight: 28 }}>Custom line height</Text>
    );
    const style = StyleSheet.flatten(getByText('Custom line height').props.style);
    expect(style.lineHeight).toBe(28);
  });

  test('RTL drops a caller-provided lineHeight override', async () => {
    const { getByText } = await renderWithProviders(
      <Text style={{ lineHeight: 28 }}>تخصيص</Text>,
      { lang: 'ar' }
    );
    const style = StyleSheet.flatten(getByText('تخصيص').props.style);
    const expected = getTextStyle('body', true, lightTheme);
    expect(style.lineHeight).toBe(expected.lineHeight);
    expect(style.lineHeight).not.toBe(28);
  });
});

describe('AccentText', () => {
  test('LTR resolves the italic display font and the brand color', async () => {
    const { getByText } = await renderWithProviders(<AccentText>perfect</AccentText>);
    const style = StyleSheet.flatten(getByText('perfect').props.style);
    expect(style.fontFamily).toBe(getDisplayItalicFont('semibold', false));
    expect(style.color).toBe(lightTheme.brand);
  });

  test('RTL resolves the Arabic display semibold font (no italic variant) and the brand color', async () => {
    const { getByText } = await renderWithProviders(<AccentText>مثالي</AccentText>, { lang: 'ar' });
    const style = StyleSheet.flatten(getByText('مثالي').props.style);
    expect(style.fontFamily).toBe(getDisplayItalicFont('semibold', true));
    expect(style.color).toBe(lightTheme.brand);
  });
});
