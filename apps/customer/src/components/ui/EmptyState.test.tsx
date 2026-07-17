import { StyleSheet, Text } from 'react-native';
import { Calendar } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  test('always renders the icon and title', async () => {
    const { getByText, root } = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(getByText('No requests yet')).toBeTruthy();
    // Composite/function components (including every Phosphor icon) don't appear as
    // distinct nodes in this TestInstance tree — only their rendered host output does.
    // 'RNSVGSvgView' is Phosphor's universal SVG wrapper regardless of which icon, so its
    // presence is the correct proxy for "an icon rendered here" (confirmed empirically —
    // see the equivalent note in Task 2). Unlike the icon's shape, the `color` prop passed
    // to it does survive onto this host node, so it's directly assertable here.
    const icons = root!.queryAll((node) => node.type === 'RNSVGSvgView');
    expect(icons).toHaveLength(1);
    expect(icons[0].props.color).toBe(lightTheme.brand);
  });

  test('the icon sits in a circle tinted with the theme blush color', async () => {
    const { root } = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    const circle = root!.queryAll((node) => {
      const style = node.props?.style;
      return !!style && typeof style === 'object' && style.width === 64 && style.height === 64;
    })[0];
    expect(StyleSheet.flatten(circle.props.style).backgroundColor).toBe(lightTheme.bgBlush);
  });

  test('renders the subtitle only when provided', async () => {
    const withSubtitle = await renderWithProviders(
      <EmptyState icon={Calendar} title="No requests yet" subtitle="Post your first request to get started" />
    );
    expect(withSubtitle.getByText('Post your first request to get started')).toBeTruthy();

    const withoutSubtitle = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(withoutSubtitle.queryByText('Post your first request to get started')).toBeNull();
  });

  test('renders children only when provided', async () => {
    const withChildren = await renderWithProviders(
      <EmptyState icon={Calendar} title="No requests yet">
        <Text>Retry</Text>
      </EmptyState>
    );
    expect(withChildren.getByText('Retry')).toBeTruthy();

    const withoutChildren = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(withoutChildren.queryByText('Retry')).toBeNull();
  });
});
