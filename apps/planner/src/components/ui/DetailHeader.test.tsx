import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { DetailHeader } from './DetailHeader';

const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe('DetailHeader', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  test('renders the crumb and action children', async () => {
    const { getByText } = await renderWithI18n(
      <DetailHeader crumb="Overview">
        <button>Action</button>
      </DetailHeader>
    );
    expect(getByText('Overview')).toBeInTheDocument();
    expect(getByText('Action')).toBeInTheDocument();
  });

  test('clicking back calls router.back() when onBack is not provided', async () => {
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" />);
    fireEvent.click(container.querySelector('button')!);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('clicking back calls the provided onBack instead of router.back()', async () => {
    const onBack = jest.fn();
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" onBack={onBack} />);
    fireEvent.click(container.querySelector('button')!);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('LTR: back-arrow icon has no rotate-180 class', async () => {
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" />, { lang: 'en' });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('class')).not.toContain('rotate-180');
  });

  test('RTL: back-arrow icon gets the rotate-180 class', async () => {
    const { container } = await renderWithI18n(<DetailHeader crumb="Overview" />, { lang: 'ar' });
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('class')).toContain('rotate-180');
  });
});
