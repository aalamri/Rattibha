import { StyleSheet, Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { AuthHeader } from './AuthHeader';

describe('AuthHeader', () => {
  test('renders at the given height', async () => {
    // AuthHeader's own outermost View has no wrapping host element contributed
    // by ThemeProvider/I18nextProvider, so it IS the render tree's root —
    // root.props.style reads it directly (see Global Constraints).
    const { root } = await renderWithProviders(<AuthHeader height={230} />);
    expect(StyleSheet.flatten(root!.props.style).height).toBe(230);
  });

  test('renders children centered inside the header', async () => {
    const { getByText } = await renderWithProviders(
      <AuthHeader height={230}>
        <Text>Logo</Text>
      </AuthHeader>
    );
    expect(getByText('Logo')).toBeTruthy();
  });

  test('back button renders and fires onBack only when onBack is provided', async () => {
    const { root: withoutBack } = await renderWithProviders(<AuthHeader height={230} />);
    expect(withoutBack!.queryAll((node) => node.props?.accessibilityRole === 'button')).toHaveLength(0);

    const onBack = jest.fn();
    const { getByLabelText } = await renderWithProviders(<AuthHeader height={230} onBack={onBack} />);
    await fireEvent.press(getByLabelText(en.common.back));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('LTR: glyph watermark resolves right, not left; back button resolves left, not right', async () => {
    const onBack = jest.fn();
    const { root } = await renderWithProviders(<AuthHeader height={230} onBack={onBack} />, { lang: 'en' });

    const glyph = root!.queryAll((node) => node.type === 'ViewManagerAdapter_ExpoImage')[0];
    const glyphStyle = StyleSheet.flatten(glyph.props.style);
    expect(glyphStyle.right).toBe(-28);
    expect(glyphStyle.left).toBeUndefined();

    const backButton = root!.queryAll((node) => node.props?.accessibilityRole === 'button')[0];
    const backWrapperStyle = StyleSheet.flatten(backButton.parent!.props.style);
    expect(backWrapperStyle.left).toBe(18);
    expect(backWrapperStyle.right).toBeUndefined();
  });

  test('RTL: glyph watermark resolves left, not right; back button resolves right, not left', async () => {
    const onBack = jest.fn();
    const { root } = await renderWithProviders(<AuthHeader height={230} onBack={onBack} />, { lang: 'ar' });

    const glyph = root!.queryAll((node) => node.type === 'ViewManagerAdapter_ExpoImage')[0];
    const glyphStyle = StyleSheet.flatten(glyph.props.style);
    expect(glyphStyle.left).toBe(-28);
    expect(glyphStyle.right).toBeUndefined();

    const backButton = root!.queryAll((node) => node.props?.accessibilityRole === 'button')[0];
    const backWrapperStyle = StyleSheet.flatten(backButton.parent!.props.style);
    expect(backWrapperStyle.right).toBe(18);
    expect(backWrapperStyle.left).toBeUndefined();
  });
});
