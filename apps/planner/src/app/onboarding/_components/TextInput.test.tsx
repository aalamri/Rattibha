import { fireEvent, render } from '@testing-library/react';
import { Envelope } from 'phosphor-react';

import { TextInput } from './TextInput';

describe('TextInput', () => {
  test('renders the icon only when provided', () => {
    const { container: withIcon } = render(<TextInput icon={Envelope} />);
    expect(withIcon.querySelectorAll('svg')).toHaveLength(1);

    const { container: withoutIcon } = render(<TextInput />);
    expect(withoutIcon.querySelectorAll('svg')).toHaveLength(0);
  });

  test('native input attributes pass through', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInput value="hello" onChange={onChange} placeholder="Type here" type="email" />
    );
    const input = getByPlaceholderText('Type here') as HTMLInputElement;
    expect(input.value).toBe('hello');
    expect(input.type).toBe('email');

    fireEvent.change(input, { target: { value: 'world' } });
    expect(onChange).toHaveBeenCalled();
  });
});
