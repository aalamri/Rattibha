import { StyleSheet, Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { Card } from './Card';

describe('Card', () => {
  test('renders children', async () => {
    const { getByText } = await renderWithProviders(
      <Card>
        <Text>Card content</Text>
      </Card>
    );
    expect(getByText('Card content')).toBeTruthy();
  });

  test('default (not elevated) applies the sm shadow', async () => {
    const { root } = await renderWithProviders(
      <Card>
        <Text>Content</Text>
      </Card>
    );
    const style = StyleSheet.flatten(root!.props.style);
    // shadows.sm has shadowOpacity 0.07; shadows.md has 0.16 — distinct enough to assert directly.
    expect(style.shadowOpacity).toBeCloseTo(0.07);
  });

  test('elevated applies the md shadow', async () => {
    const { root } = await renderWithProviders(
      <Card elevated>
        <Text>Content</Text>
      </Card>
    );
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.shadowOpacity).toBeCloseTo(0.16);
  });

  test('background and border colors come from the active theme', async () => {
    const { root } = await renderWithProviders(
      <Card>
        <Text>Content</Text>
      </Card>
    );
    const style = StyleSheet.flatten(root!.props.style);
    // Default theme mode is 'system'; RN's useColorScheme() resolves to
    // undefined/light under Jest, so the light theme applies.
    expect(style.backgroundColor).toBe(lightTheme.bgSurface);
    expect(style.borderColor).toBe(lightTheme.border);
  });
});
