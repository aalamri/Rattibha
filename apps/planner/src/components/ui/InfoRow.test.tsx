import { render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { InfoRow } from './InfoRow';

describe('InfoRow', () => {
  test('renders icon, label, and value', () => {
    const { getByText, container } = render(<InfoRow icon={Calendar} label="Date" value="July 17" />);
    expect(getByText('Date')).toBeInTheDocument();
    expect(getByText('July 17')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  test('renders the bottom border by default', () => {
    const { container } = render(<InfoRow icon={Calendar} label="Date" value="July 17" />);
    expect((container.firstChild as HTMLElement).className).toContain('border-b border-border');
  });

  test('last omits the bottom border', () => {
    const { container } = render(<InfoRow icon={Calendar} label="Date" value="July 17" last />);
    expect((container.firstChild as HTMLElement).className).not.toContain('border-b');
  });
});
