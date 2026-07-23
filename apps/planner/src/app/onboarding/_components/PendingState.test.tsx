import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { PendingState } from './PendingState';

describe('PendingState', () => {
  test('renders businessName interpolated into the real translated subtitle', async () => {
    const { container } = await renderWithI18n(<PendingState businessName="Layla Events" onGoLive={() => {}} />);
    expect(container.textContent).toContain('Layla Events');
    expect(container.textContent).toContain('Our team reviews most applications within');
  });

  test('renders the checklist with the right item states', async () => {
    const { getByText } = await renderWithI18n(<PendingState businessName="Layla Events" onGoLive={() => {}} />);
    expect(getByText('Account created')).toBeInTheDocument();
    expect(getByText('Business details')).toBeInTheDocument();
    expect(getByText('Documents under review')).toBeInTheDocument();
    expect(getByText('Go live on Ratibha')).toBeInTheDocument();
  });

  test('the "in review" badge renders only on the active checklist item', async () => {
    const { getByText, queryAllByText } = await renderWithI18n(
      <PendingState businessName="Layla Events" onGoLive={() => {}} />
    );
    expect(getByText('In review')).toBeInTheDocument();
    expect(queryAllByText('In review')).toHaveLength(1);
  });

  test('the primary button fires onGoLive on click', async () => {
    const onGoLive = jest.fn();
    const { getByText } = await renderWithI18n(<PendingState businessName="Layla Events" onGoLive={onGoLive} />);
    fireEvent.click(getByText('Preview my dashboard'));
    expect(onGoLive).toHaveBeenCalledTimes(1);
  });
});
