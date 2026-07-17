import { Calendar } from 'phosphor-react-native';
import { Text } from 'react-native';

import { renderWithProviders } from '@/test-utils';
import en from '@/i18n/locales/en.json';
import { PlaceholderScreen } from './PlaceholderScreen';

describe('PlaceholderScreen', () => {
  test('always renders the title and the real common.comingSoon translation', async () => {
    const { getByText } = await renderWithProviders(<PlaceholderScreen icon={Calendar} title="Bookings" />);
    expect(getByText('Bookings')).toBeTruthy();
    expect(getByText(en.common.comingSoon)).toBeTruthy();
  });

  test('renders children when provided', async () => {
    const { getByText } = await renderWithProviders(
      <PlaceholderScreen icon={Calendar} title="Bookings">
        <Text>Retry</Text>
      </PlaceholderScreen>
    );
    expect(getByText('Retry')).toBeTruthy();
  });

  test('omits children when not provided', async () => {
    const { queryByText } = await renderWithProviders(<PlaceholderScreen icon={Calendar} title="Bookings" />);
    expect(queryByText('Retry')).toBeNull();
  });
});
