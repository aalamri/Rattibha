import { render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  test('always renders the icon and title', () => {
    const { getByText, container } = render(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(getByText('No requests yet')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  test('renders the subtitle only when provided', () => {
    const { queryByText, rerender } = render(
      <EmptyState icon={Calendar} title="No requests yet" subtitle="Post your first request" />
    );
    expect(queryByText('Post your first request')).toBeInTheDocument();

    rerender(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(queryByText('Post your first request')).toBeNull();
  });

  test('renders children only when provided', () => {
    const { getByText, queryByText, rerender } = render(
      <EmptyState icon={Calendar} title="No requests yet">
        <button>Retry</button>
      </EmptyState>
    );
    expect(getByText('Retry')).toBeInTheDocument();

    rerender(<EmptyState icon={Calendar} title="No requests yet" />);
    expect(queryByText('Retry')).toBeNull();
  });
});
