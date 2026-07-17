import { fireEvent } from '@testing-library/react-native';

import { makePlanner, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { PlannerRow } from './PlannerRow';

describe('PlannerRow', () => {
  test('renders name, city + type, rating, and the from-price line', async () => {
    const planner = makePlanner({ name: 'Layla Events', city: 'riyadh', type: 'Wedding Planner', rating: 4.8, from: 5000 });
    const { getByText } = await renderWithProviders(<PlannerRow planner={planner} onPress={() => {}} />);
    expect(getByText('Layla Events')).toBeTruthy();
    expect(getByText(`${en.cities.riyadh} · Wedding Planner`)).toBeTruthy();
    expect(getByText('4.8')).toBeTruthy();
    expect(getByText(`${en.common.sar} ${(5000).toLocaleString('en-US')}`)).toBeTruthy();
  });

  test('renders the premium Badge only when planner.premium is true', async () => {
    const premium = makePlanner({ premium: true });
    const { getByText } = await renderWithProviders(<PlannerRow planner={premium} onPress={() => {}} />);
    expect(getByText(en.foundation.premium)).toBeTruthy();

    const notPremium = makePlanner({ premium: false });
    const { queryByText } = await renderWithProviders(<PlannerRow planner={notPremium} onPress={() => {}} />);
    expect(queryByText(en.foundation.premium)).toBeNull();
  });

  test('press calls onPress with the planner', async () => {
    const planner = makePlanner();
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<PlannerRow planner={planner} onPress={onPress} />);
    await fireEvent.press(getByText(planner.name));
    expect(onPress).toHaveBeenCalledWith(planner);
  });
});
