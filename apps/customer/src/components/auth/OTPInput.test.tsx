import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { lightTheme } from '@/theme/colors';
import { OTPInput } from './OTPInput';

/** OTPInput's 6 visual digit boxes are the only Views sized 46x56 in the tree. */
function findBoxes(root: any) {
  return root.queryAll((node: any) => {
    const style = node.props?.style;
    if (!style) return false;
    const flat = StyleSheet.flatten(style);
    return flat.width === 46 && flat.height === 56;
  });
}

describe('OTPInput', () => {
  test('renders length boxes, each showing the corresponding digit from value', async () => {
    const { root, getByText, queryByText } = await renderWithProviders(<OTPInput value="12" onChange={() => {}} />);
    expect(findBoxes(root).length).toBe(6);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    // Empty boxes render no digit text — '3' through '6' were never typed.
    expect(queryByText('3')).toBeNull();
  });

  test('a custom length renders that many boxes', async () => {
    const { root } = await renderWithProviders(<OTPInput value="" onChange={() => {}} length={4} />);
    expect(findBoxes(root).length).toBe(4);
  });

  test('typing into the hidden input calls onChange with digits only, truncated to length', async () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = await renderWithProviders(<OTPInput value="12" onChange={onChange} />);
    const hiddenInput = getByDisplayValue('12');
    await fireEvent.changeText(hiddenInput, '123abc456789');
    expect(onChange).toHaveBeenCalledWith('123456');
  });

  test('the active box is highlighted with the brand border only while focused', async () => {
    const { root, getByDisplayValue } = await renderWithProviders(<OTPInput value="12" onChange={() => {}} />);
    // value.length === 2, length === 6 (default) -> activeIndex === 2.
    const activeBox = findBoxes(root)[2];
    expect(StyleSheet.flatten(activeBox.props.style).borderColor).toBe(lightTheme.borderStrong);

    const hiddenInput = getByDisplayValue('12');
    await fireEvent(hiddenInput, 'focus');
    expect(StyleSheet.flatten(findBoxes(root)[2].props.style).borderColor).toBe(lightTheme.brand);

    await fireEvent(hiddenInput, 'blur');
    expect(StyleSheet.flatten(findBoxes(root)[2].props.style).borderColor).toBe(lightTheme.borderStrong);
  });
});
