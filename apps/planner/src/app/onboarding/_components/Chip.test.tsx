import { fireEvent, render } from '@testing-library/react';
import { Star } from 'phosphor-react';

import { Chip } from './Chip';

describe('Chip', () => {
  test('renders the children text', () => {
    const { getByText } = render(
      <Chip on={false} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(getByText('Riyadh')).toBeInTheDocument();
  });

  test('on=true applies the active classes', () => {
    const { getByText } = render(
      <Chip on={true} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(getByText('Riyadh').className).toContain('border-brand bg-purple-50 text-brand');
  });

  test('on=false applies the inactive classes', () => {
    const { getByText } = render(
      <Chip on={false} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(getByText('Riyadh').className).toContain('border-border-strong bg-bg-surface text-fg1');
  });

  test('renders the icon only when provided', () => {
    const { container: withIcon } = render(
      <Chip on={false} onClick={() => {}} icon={Star}>
        Riyadh
      </Chip>
    );
    expect(withIcon.querySelectorAll('svg')).toHaveLength(1);

    const { container: withoutIcon } = render(
      <Chip on={false} onClick={() => {}}>
        Riyadh
      </Chip>
    );
    expect(withoutIcon.querySelectorAll('svg')).toHaveLength(0);
  });

  test('onClick fires on click', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <Chip on={false} onClick={onClick}>
        Riyadh
      </Chip>
    );
    fireEvent.click(getByText('Riyadh'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
