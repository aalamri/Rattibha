import { fireEvent } from '@testing-library/react-native';

import { makePlanner, renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { FeaturedCard } from './FeaturedCard';

describe('FeaturedCard', () => {
  test('renders name, city + type, and rating', async () => {
    const planner = makePlanner({ name: 'Layla Events', city: 'riyadh', type: 'Wedding Planner', rating: 4.8 });
    const { getByText } = await renderWithProviders(<FeaturedCard planner={planner} onPress={() => {}} />);
    expect(getByText('Layla Events')).toBeTruthy();
    expect(getByText(`${en.cities.riyadh} · Wedding Planner`)).toBeTruthy();
    expect(getByText('4.8')).toBeTruthy();
  });

  test('renders the premium label only when planner.premium is true', async () => {
    const premium = makePlanner({ premium: true });
    const { getByText } = await renderWithProviders(<FeaturedCard planner={premium} onPress={() => {}} />);
    expect(getByText(`★ ${en.foundation.premium}`)).toBeTruthy();

    const notPremium = makePlanner({ premium: false });
    const { queryByText } = await renderWithProviders(<FeaturedCard planner={notPremium} onPress={() => {}} />);
    expect(queryByText(`★ ${en.foundation.premium}`)).toBeNull();
  });

  test('press calls onPress with the planner', async () => {
    const planner = makePlanner();
    const onPress = jest.fn();
    const { getByText } = await renderWithProviders(<FeaturedCard planner={planner} onPress={onPress} />);
    await fireEvent.press(getByText(planner.name));
    expect(onPress).toHaveBeenCalledWith(planner);
  });
});
