import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { Button } from './Button';

describe('Button', () => {
  test('renders the label text', async () => {
    const { getByText } = await renderWithProviders(<Button>Continue</Button>);
    expect(getByText('Continue')).toBeTruthy();
  });

  test('fires onPress when not disabled or loading', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<Button onPress={onPress}>Continue</Button>);
    await fireEvent.press(getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('disabled: does not fire onPress and reports accessibilityState.disabled', async () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = await renderWithProviders(
      <Button onPress={onPress} disabled>Continue</Button>
    );
    await fireEvent.press(getByText('Continue'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByRole('button').props.accessibilityState.disabled).toBe(true);
  });

  test('loading: renders an ActivityIndicator instead of the label, and reports accessibilityState.busy', async () => {
    const { root, queryByText, getByRole } = await renderWithProviders(<Button loading>Continue</Button>);
    expect(queryByText('Continue')).toBeNull();
    // RN's built-in ActivityIndicator resolves to a host node identified by the string
    // 'ActivityIndicator' in this TestInstance tree (see the equivalent note in Task 2/6
    // for why component-reference matching doesn't work here).
    expect(root!.queryAll((node: any) => node.type === 'ActivityIndicator')).toHaveLength(1);
    expect(getByRole('button').props.accessibilityState.busy).toBe(true);
  });

  test('LTR: inner row is flexDirection row, label uses the Latin bold font', async () => {
    const { getByText } = await renderWithProviders(<Button>Continue</Button>);
    const label = getByText('Continue');
    const rowStyle = StyleSheet.flatten(label.parent!.props.style);
    expect(rowStyle.flexDirection).toBe('row');
    expect(StyleSheet.flatten(label.props.style).fontFamily).toBe('Poppins_700Bold');
  });

  test('RTL: inner row is flexDirection row-reverse, label uses the Arabic bold font', async () => {
    const { getByText } = await renderWithProviders(<Button>متابعة</Button>, { lang: 'ar' });
    const label = getByText('متابعة');
    const rowStyle = StyleSheet.flatten(label.parent!.props.style);
    expect(rowStyle.flexDirection).toBe('row-reverse');
    expect(StyleSheet.flatten(label.props.style).fontFamily).toBe('Tajawal_700Bold');
  });
});
