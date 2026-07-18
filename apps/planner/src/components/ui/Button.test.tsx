import { fireEvent, render } from '@testing-library/react';
import { Calendar } from 'phosphor-react';

import { Button } from './Button';

describe('Button', () => {
  test('renders the children text', () => {
    const { getByText } = render(<Button>Save</Button>);
    expect(getByText('Save')).toBeInTheDocument();
  });

  test('defaults to primary variant and md size classes', () => {
    const { getByText } = render(<Button>Save</Button>);
    const className = getByText('Save').className;
    expect(className).toContain('bg-brand text-white shadow-brand hover:bg-brand-hover active:bg-brand-press');
    expect(className).toContain('gap-2 px-[17px] py-2.5 text-[14.5px]');
  });

  test('a non-default variant/size applies the corresponding classes', () => {
    const { getByText } = render(
      <Button variant="danger" size="lg">
        Delete
      </Button>
    );
    const className = getByText('Delete').className;
    expect(className).toContain('border-transparent bg-danger-bg text-danger hover:brightness-95');
    expect(className).toContain('gap-2 px-[22px] py-[13px] text-[15px]');
  });

  test('icon renders before children, iconRight renders after; neither renders when omitted', () => {
    const { container: withIcon } = render(<Button icon={Calendar}>Save</Button>);
    expect(withIcon.querySelectorAll('svg')).toHaveLength(1);

    const { container: withIconRight } = render(<Button iconRight={Calendar}>Save</Button>);
    expect(withIconRight.querySelectorAll('svg')).toHaveLength(1);

    const { container: withNeither } = render(<Button>Save</Button>);
    expect(withNeither.querySelectorAll('svg')).toHaveLength(0);
  });

  test('onClick fires on click', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(getByText('Save'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled passes through natively and blocks the click', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <Button onClick={onClick} disabled>
        Save
      </Button>
    );
    const button = getByText('Save') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
