import { render } from '@testing-library/react';

import { Card } from './Card';

describe('Card', () => {
  test('renders children', () => {
    const { getByText } = render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(getByText('Card content')).toBeInTheDocument();
  });

  test('defaults pad to 20px', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );
    expect((container.firstChild as HTMLElement).style.padding).toBe('20px');
  });

  test('pad overrides the default padding', () => {
    const { container } = render(
      <Card pad={8}>
        <p>Content</p>
      </Card>
    );
    expect((container.firstChild as HTMLElement).style.padding).toBe('8px');
  });

  test('merges a caller style object rather than overwriting padding', () => {
    const { container } = render(
      <Card style={{ marginTop: 12 }}>
        <p>Content</p>
      </Card>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.padding).toBe('20px');
    expect(div.style.marginTop).toBe('12px');
  });

  test('passes through arbitrary DOM props', () => {
    const { container } = render(
      <Card data-testid="my-card">
        <p>Content</p>
      </Card>
    );
    expect(container.querySelector('[data-testid="my-card"]')).toBeInTheDocument();
  });
});
