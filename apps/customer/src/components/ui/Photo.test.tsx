import { StyleSheet, Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import { Photo } from './Photo';

/** Photo's label badge sits in a View with both a `top` and exactly one of left/right (not both). */
function findPositionedWrapper(root: any) {
  return root.queryAll((node: any) => {
    const style = node.props?.style;
    if (!style || typeof style !== 'object') return false;
    const hasTop = 'top' in style;
    const hasLeft = 'left' in style;
    const hasRight = 'right' in style;
    // Exactly one of left or right, not both, plus top
    return hasTop && (hasLeft !== hasRight);
  })[0];
}

describe('Photo', () => {
  test('uri set: renders an Image with that source', async () => {
    const { root } = await renderWithProviders(<Photo uri="https://img.example/1.jpg" />);
    // RN's built-in Image resolves to a host node identified by the string 'Image' in this
    // TestInstance tree (unlike composite/function components, which don't appear as nodes
    // at all — see the equivalent note in Task 2 for why component-reference matching
    // wouldn't work here).
    const images = root!.queryAll((node: any) => node.type === 'Image');
    expect(images).toHaveLength(1);
    expect(images[0].props.source).toEqual({ uri: 'https://img.example/1.jpg' });
  });

  test('uri unset: renders the gradient placeholder with the fallback icon, no Image', async () => {
    const { root } = await renderWithProviders(<Photo />);
    expect(root!.queryAll((node: any) => node.type === 'Image')).toHaveLength(0);
    // ImageIcon (a Phosphor icon, a composite component) never appears as a node itself —
    // only its rendered 'RNSVGSvgView' output does.
    expect(root!.queryAll((node: any) => node.type === 'RNSVGSvgView')).toHaveLength(1);
  });

  test('LTR positions the label badge with a left key, no right key', async () => {
    const { root } = await renderWithProviders(<Photo label="Featured" />);
    const wrapper = findPositionedWrapper(root);
    const style = StyleSheet.flatten(wrapper.props.style);
    expect(style.left).toBe(8);
    expect(style.right).toBeUndefined();
  });

  test('RTL positions the label badge with a right key, no left key', async () => {
    const { root } = await renderWithProviders(<Photo label="Featured" />, { lang: 'ar' });
    const wrapper = findPositionedWrapper(root);
    const style = StyleSheet.flatten(wrapper.props.style);
    expect(style.right).toBe(8);
    expect(style.left).toBeUndefined();
  });

  test('children render through in both the uri and placeholder branches', async () => {
    const withUri = await renderWithProviders(
      <Photo uri="https://img.example/1.jpg">
        <Text>Overlay</Text>
      </Photo>
    );
    expect(withUri.getByText('Overlay')).toBeTruthy();

    const placeholder = await renderWithProviders(
      <Photo>
        <Text>Overlay</Text>
      </Photo>
    );
    expect(placeholder.getByText('Overlay')).toBeTruthy();
  });
});
