import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepAccount } from './StepAccount';
import { INITIAL_FORM } from './types';

describe('StepAccount', () => {
  test('renders current form values and fires onChange with the right patch per field', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, businessName: 'Layla Events', fullName: 'Layla', phone: '0500000000', email: 'a@b.com', password: 'secret' };
    const { getByDisplayValue } = await renderWithI18n(<StepAccount form={form} onChange={onChange} />);

    fireEvent.change(getByDisplayValue('Layla Events'), { target: { value: 'New Name' } });
    expect(onChange).toHaveBeenCalledWith({ businessName: 'New Name' });

    fireEvent.change(getByDisplayValue('Layla'), { target: { value: 'Sara' } });
    expect(onChange).toHaveBeenCalledWith({ fullName: 'Sara' });

    fireEvent.change(getByDisplayValue('0500000000'), { target: { value: '0511111111' } });
    expect(onChange).toHaveBeenCalledWith({ phone: '0511111111' });

    fireEvent.change(getByDisplayValue('a@b.com'), { target: { value: 'c@d.com' } });
    expect(onChange).toHaveBeenCalledWith({ email: 'c@d.com' });

    fireEvent.change(getByDisplayValue('secret'), { target: { value: 'newpass' } });
    expect(onChange).toHaveBeenCalledWith({ password: 'newpass' });
  });
});
