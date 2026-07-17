import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  test('renders the check icon only when checked', async () => {
    const { root: checkedRoot } = await renderWithProviders(<Checkbox checked onChange={() => {}} />);
    expect(checkedRoot!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);

    const { root: uncheckedRoot } = await renderWithProviders(<Checkbox checked={false} onChange={() => {}} />);
    expect(uncheckedRoot!.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(0);
  });

  test('pressing calls onChange with the toggled value', async () => {
    const onChangeFromUnchecked = jest.fn();
    const { getByRole: getByRoleUnchecked } = await renderWithProviders(
      <Checkbox checked={false} onChange={onChangeFromUnchecked} />
    );
    await fireEvent.press(getByRoleUnchecked('checkbox'));
    expect(onChangeFromUnchecked).toHaveBeenCalledWith(true);

    const onChangeFromChecked = jest.fn();
    const { getByRole: getByRoleChecked } = await renderWithProviders(<Checkbox checked onChange={onChangeFromChecked} />);
    await fireEvent.press(getByRoleChecked('checkbox'));
    expect(onChangeFromChecked).toHaveBeenCalledWith(false);
  });

  test('accessibilityState.checked reflects the checked prop', async () => {
    const { getByRole: getByRoleChecked } = await renderWithProviders(<Checkbox checked onChange={() => {}} />);
    expect(getByRoleChecked('checkbox').props.accessibilityState.checked).toBe(true);

    const { getByRole: getByRoleUnchecked } = await renderWithProviders(<Checkbox checked={false} onChange={() => {}} />);
    expect(getByRoleUnchecked('checkbox').props.accessibilityState.checked).toBe(false);
  });
});
