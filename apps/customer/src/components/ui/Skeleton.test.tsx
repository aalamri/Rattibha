import { StyleSheet, Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { Skeleton, SkeletonCard, SkeletonRow } from './Skeleton';

describe('Skeleton', () => {
  test('reflects width/height/radius in style, with the themed background color', async () => {
    const { root } = await renderWithProviders(<Skeleton width={120} height={20} radius={8} />);
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.width).toBe(120);
    expect(style.height).toBe(20);
    expect(style.borderRadius).toBe(8);
    expect(style.backgroundColor).toBe(lightTheme.bgSunken);
  });

  test('defaults width to 100% and height to 14 when not provided', async () => {
    const { root } = await renderWithProviders(<Skeleton />);
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.width).toBe('100%');
    expect(style.height).toBe(14);
  });
});

describe('SkeletonRow', () => {
  test('renders children in a row container with the given gap', async () => {
    const { root } = await renderWithProviders(
      <SkeletonRow gap={16}>
        <Text>One</Text>
        <Text>Two</Text>
      </SkeletonRow>
    );
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.flexDirection).toBe('row');
    expect(style.gap).toBe(16);
  });
});

describe('SkeletonCard', () => {
  test('renders children inside a themed container', async () => {
    const { root, getByText } = await renderWithProviders(
      <SkeletonCard>
        <Text>Loading placeholder</Text>
      </SkeletonCard>
    );
    expect(getByText('Loading placeholder')).toBeTruthy();
    const style = StyleSheet.flatten(root!.props.style);
    expect(style.backgroundColor).toBe(lightTheme.bgSurface);
    expect(style.borderColor).toBe(lightTheme.border);
  });
});
