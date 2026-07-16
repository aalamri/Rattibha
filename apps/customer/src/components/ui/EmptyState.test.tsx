import { Text } from 'react-native';
import { Calendar } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  test('always renders the icon and title', async () => {
    const { getByText, root } = await renderWithProviders(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(getByText('No requests yet')).toBeTruthy();
    // Composite/function components (including every Phosphor icon) don't appear as
    // distinct nodes in this TestInstance tree — only their rendered host output does.
    // 'RNSVGSvgView' is Phosphor's universal SVG wrapper regardless of which icon, so its
    // presence is the correct proxy for "an icon rendered here" (confirmed empirically —
    // see the equivalent note in Task 2).
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
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
