import { StyleSheet } from 'react-native';
import { Star } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import { Badge, Stars } from './Badge';

describe('Badge', () => {
  test('renders the children text', async () => {
    const { getByText } = await renderWithProviders(<Badge>Featured</Badge>);
    expect(getByText('Featured')).toBeTruthy();
  });

  test('renders an icon (as an SVG) when provided', async () => {
    const { root } = await renderWithProviders(<Badge icon={Star}>Top rated</Badge>);
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('omits the icon when not provided', async () => {
    const { root } = await renderWithProviders(<Badge>No icon</Badge>);
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(0);
  });

  test('LTR container flexDirection is row', async () => {
    const { getByText } = await renderWithProviders(<Badge>Row</Badge>);
    const containerStyle = StyleSheet.flatten(getByText('Row').parent!.props.style);
    expect(containerStyle.flexDirection).toBe('row');
  });

  test('RTL container flexDirection is row-reverse', async () => {
    const { getByText } = await renderWithProviders(<Badge>Row</Badge>, { lang: 'ar' });
    const containerStyle = StyleSheet.flatten(getByText('Row').parent!.props.style);
    expect(containerStyle.flexDirection).toBe('row-reverse');
  });
});

describe('Stars', () => {
  test('renders the rating wrapped in a Badge with a star icon', async () => {
    const { getByText, root } = await renderWithProviders(<Stars rating={4.8} />);
    expect(getByText('4.8')).toBeTruthy();
    expect(root!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('coerces a numeric rating to its string form', async () => {
    const { getByText } = await renderWithProviders(<Stars rating={5} />);
    expect(getByText('5')).toBeTruthy();
  });
});
