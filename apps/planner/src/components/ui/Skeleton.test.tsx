import { render } from '@testing-library/react';

import { Skeleton, SkeletonCard } from './Skeleton';

describe('Skeleton', () => {
  test('reflects width/height in style, with the animate-pulse class', () => {
    const { container } = render(<Skeleton width="120px" height="20px" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('120px');
    expect(div.style.height).toBe('20px');
    expect(div.className).toContain('animate-pulse');
  });
});

describe('SkeletonCard', () => {
  test('renders children inside its container', () => {
    const { getByText } = render(
      <SkeletonCard>
        <p>Loading placeholder</p>
      </SkeletonCard>
    );
    expect(getByText('Loading placeholder')).toBeInTheDocument();
  });
});
