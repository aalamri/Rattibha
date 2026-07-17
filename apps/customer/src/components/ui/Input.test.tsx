import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { Eye } from 'phosphor-react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import { lightTheme } from '@/theme/colors';
import { Input } from './Input';

describe('Input', () => {
  test('renders the label when provided', async () => {
    const { getByText } = await renderWithProviders(<Input label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  test('omits the label row when not provided', async () => {
    const { queryByText } = await renderWithProviders(<Input placeholder="Email" />);
    expect(queryByText('Email')).toBeNull();
  });

  test('typing fires onChangeText with the typed value', async () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = await renderWithProviders(<Input label="Email" onChangeText={onChangeText} />);
    await fireEvent.changeText(getByLabelText('Email'), 'a@b.com');
    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
  });

  test('focus and blur toggle the focused border color', async () => {
    const { getByLabelText } = await renderWithProviders(<Input label="Email" />);
    const field = getByLabelText('Email');
    const unfocused = StyleSheet.flatten(field.parent!.props.style);
    expect(unfocused.borderColor).toBe(lightTheme.borderStrong);

    await fireEvent(field, 'focus');
    const focused = StyleSheet.flatten(field.parent!.props.style);
    expect(focused.borderColor).toBe(lightTheme.brand);
  });

  test('an error overrides the border color and renders the error message', async () => {
    const { getByLabelText, getByText } = await renderWithProviders(
      <Input label="Email" error="Required" />
    );
    const style = StyleSheet.flatten(getByLabelText('Email').parent!.props.style);
    expect(style.borderColor).toBe(lightTheme.danger);
    expect(getByText('Required')).toBeTruthy();
  });

  test('pressing the trailing icon calls onTrailingIconPress once', async () => {
    const onTrailingIconPress = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Input label="Password" trailingIcon={Eye} onTrailingIconPress={onTrailingIconPress} />
    );
    await fireEvent.press(getByRole('button'));
    expect(onTrailingIconPress).toHaveBeenCalledTimes(1);
  });

  test('LTR: row is flexDirection row, textAlign left', async () => {
    const { getByLabelText } = await renderWithProviders(<Input label="Email" />);
    const field = getByLabelText('Email');
    expect(StyleSheet.flatten(field.parent!.props.style).flexDirection).toBe('row');
    expect(field.props.textAlign).toBe('left');
  });

  test('RTL: row is flexDirection row-reverse, textAlign right', async () => {
    const { getByLabelText } = await renderWithProviders(<Input label="Email" />, { lang: 'ar' });
    const field = getByLabelText('Email');
    expect(StyleSheet.flatten(field.parent!.props.style).flexDirection).toBe('row-reverse');
    expect(field.props.textAlign).toBe('right');
  });

  test('the trailing-icon button accessibilityLabel uses the real translated string per locale', async () => {
    const enResult = await renderWithProviders(
      <Input label="Password" trailingIcon={Eye} onTrailingIconPress={() => {}} />
    );
    expect(enResult.getByLabelText(en.common.togglePasswordVisibility)).toBeTruthy();

    const arResult = await renderWithProviders(
      <Input label="كلمة المرور" trailingIcon={Eye} onTrailingIconPress={() => {}} />,
      { lang: 'ar' }
    );
    expect(arResult.getByLabelText(ar.common.togglePasswordVisibility)).toBeTruthy();
  });
});
