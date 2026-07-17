import { renderWithProviders } from '@/test-utils';
import type { PlannerService } from '@/data/planners';
import { ServiceCard } from './ServiceCard';

const service: PlannerService = {
  name: 'Bridal Suite Styling',
  desc: 'Full styling and decor for the bridal suite, flowers included.',
  from: 2500,
  seed: 5,
};

describe('ServiceCard', () => {
  test('renders name, desc, and the formatted from-price', async () => {
    const { getByText } = await renderWithProviders(<ServiceCard service={service} />);
    expect(getByText('Bridal Suite Styling')).toBeTruthy();
    expect(getByText(service.desc)).toBeTruthy();
    expect(getByText(`from SAR ${(2500).toLocaleString('en-US')}`)).toBeTruthy();
  });

  test('name and desc carry their truncation props', async () => {
    const { getByText } = await renderWithProviders(<ServiceCard service={service} />);
    expect(getByText('Bridal Suite Styling').props.numberOfLines).toBe(1);
    expect(getByText(service.desc).props.numberOfLines).toBe(2);
  });
});
