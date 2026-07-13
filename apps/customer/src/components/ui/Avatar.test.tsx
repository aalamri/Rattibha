import { StyleSheet, processColor } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { colors } from '@/theme/colors';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  test('renders the given initials', async () => {
    const { getByText } = await renderWithProviders(<Avatar initials="AB" />);
    expect(getByText('AB')).toBeTruthy();
  });

  test('seed selects the matching gradient pair', async () => {
    const { root } = await renderWithProviders(<Avatar initials="GH" seed={3} />);
    expect(root!.props.colors).toEqual([processColor(colors.gold500), processColor(colors.purple500)]);
  });

  test('seed wraps around with modulo when it exceeds the gradient count', async () => {
    // gradients has 6 entries (indices 0-5); seed 8 % 6 === 2 -> [lavender300, purple500].
    const { root } = await renderWithProviders(<Avatar initials="IJ" seed={8} />);
    expect(root!.props.colors).toEqual([processColor(colors.lavender300), processColor(colors.purple500)]);
  });

  test('LTR renders the initials in the Latin bold font', async () => {
    const { getByText } = await renderWithProviders(<Avatar initials="KL" />);
    const fontFamily = StyleSheet.flatten(getByText('KL').props.style).fontFamily;
    expect(fontFamily).toBe('Poppins_700Bold');
  });

  test('RTL renders the initials in the Arabic bold font', async () => {
    const { getByText } = await renderWithProviders(<Avatar initials="MN" />, { lang: 'ar' });
    const fontFamily = StyleSheet.flatten(getByText('MN').props.style).fontFamily;
    expect(fontFamily).toBe('Tajawal_700Bold');
  });
});
