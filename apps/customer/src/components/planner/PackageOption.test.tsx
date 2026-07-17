import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import type { PlannerPackage } from '@/data/planners';
import { PackageOption } from './PackageOption';

const pkg: PlannerPackage = { name: 'Gold Package', note: 'Up to 200 guests', price: 15000 };

describe('PackageOption', () => {
  test('renders name, note, and the formatted SAR price', async () => {
    const { getByText } = await renderWithProviders(<PackageOption pkg={pkg} selected={false} onPress={() => {}} />);
    expect(getByText('Gold Package')).toBeTruthy();
    expect(getByText('Up to 200 guests')).toBeTruthy();
    expect(getByText(`SAR ${(15000).toLocaleString('en-US')}`)).toBeTruthy();
  });

  test('selected renders the filled inner dot; unselected does not', async () => {
    const { root: selectedRoot } = await renderWithProviders(<PackageOption pkg={pkg} selected onPress={() => {}} />);
    // The filled inner dot is the sole 11x11 pill View, present only when selected.
    const selectedDot = selectedRoot!.queryAll((node) => {
      const style = node.props?.style;
      return !!style && style.width === 11 && style.height === 11;
    });
    expect(selectedDot).toHaveLength(1);

    const { root: unselectedRoot } = await renderWithProviders(
      <PackageOption pkg={pkg} selected={false} onPress={() => {}} />
    );
    const unselectedDot = unselectedRoot!.queryAll((node) => {
      const style = node.props?.style;
      return !!style && style.width === 11 && style.height === 11;
    });
    expect(unselectedDot).toHaveLength(0);
  });

  test('press calls onPress', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<PackageOption pkg={pkg} selected={false} onPress={onPress} />);
    await fireEvent.press(getByText('Gold Package'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
