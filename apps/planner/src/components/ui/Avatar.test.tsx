import { render } from '@testing-library/react';

import { Avatar, GRADIENTS } from './Avatar';

describe('Avatar', () => {
  test('renders the given initials', () => {
    const { getByText } = render(<Avatar initials="AB" />);
    expect(getByText('AB')).toBeInTheDocument();
  });

  test('seed selects the matching gradient', () => {
    const { container } = render(<Avatar initials="GH" seed={3} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toBe(GRADIENTS[3]);
  });

  test('seed wraps around with modulo when it exceeds the gradient count', () => {
    // GRADIENTS has 6 entries (indices 0-5); seed 8 % 6 === 2.
    const { container } = render(<Avatar initials="IJ" seed={8} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toBe(GRADIENTS[2]);
  });

  test('size controls width, height, and proportional font size', () => {
    const { container } = render(<Avatar initials="KL" size={60} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('60px');
    expect(div.style.height).toBe('60px');
    expect(div.style.fontSize).toBe('22.8px');
  });

  test('ring adds the ring classes; omitting it does not', () => {
    const { container: withRing } = render(<Avatar initials="MN" ring />);
    expect((withRing.firstChild as HTMLElement).className).toContain('ring-2 ring-bg-surface');

    const { container: withoutRing } = render(<Avatar initials="OP" />);
    expect((withoutRing.firstChild as HTMLElement).className).not.toContain('ring-2');
  });
});
