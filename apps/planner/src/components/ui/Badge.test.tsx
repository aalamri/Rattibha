import { render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { Badge } from './Badge';

describe('Badge', () => {
  test('renders the children text', () => {
    const { getByText } = render(<Badge>Featured</Badge>);
    expect(getByText('Featured')).toBeInTheDocument();
  });

  test('renders the icon as an svg when provided', () => {
    const { container } = render(<Badge icon={Calendar}>Top rated</Badge>);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  test('omits the icon when not provided', () => {
    const { container } = render(<Badge>No icon</Badge>);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  test('defaults to the purple, non-solid tone', () => {
    const { getByText } = render(<Badge>Default</Badge>);
    // TONE_CLASSES/SOLID_TONE_CLASSES are module-private in Badge.tsx (not
    // exported), so this class string is copied from source rather than
    // imported — keep in sync with Badge.tsx if its class maps change.
    expect(getByText('Default').className).toContain('bg-purple-50 text-brand');
  });

  test('solid switches to the solid tone classes', () => {
    const { getByText } = render(
      <Badge tone="green" solid>
        Solid
      </Badge>
    );
    expect(getByText('Solid').className).toContain('bg-emerald-500 text-white');
  });
});
