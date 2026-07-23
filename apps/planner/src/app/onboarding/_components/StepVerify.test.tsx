import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepVerify } from './StepVerify';
import { INITIAL_FORM } from './types';

describe('StepVerify', () => {
  test('crNumber field renders its value and fires onChange', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, crNumber: '1234567890' };
    const { getByDisplayValue } = await renderWithI18n(<StepVerify form={form} onChange={onChange} />);

    fireEvent.change(getByDisplayValue('1234567890'), { target: { value: '0987654321' } });
    expect(onChange).toHaveBeenCalledWith({ crNumber: '0987654321' });
  });

  test('terms checkbox reflects agreedToTerms and toggles it on click', async () => {
    const onChange = jest.fn();
    const { getByText, container: uncheckedContainer } = await renderWithI18n(
      <StepVerify form={{ ...INITIAL_FORM, agreedToTerms: false }} onChange={onChange} />
    );
    expect(uncheckedContainer.querySelectorAll('svg').length).toBe(2); // IdentificationBadge + UploadSimple icons, no check

    fireEvent.click(getByText('I agree to the Partner Terms & Commission Policy.').closest('label')!.querySelector('button')!);
    expect(onChange).toHaveBeenCalledWith({ agreedToTerms: true });

    const { container: checkedContainer } = await renderWithI18n(
      <StepVerify form={{ ...INITIAL_FORM, agreedToTerms: true }} onChange={() => {}} />
    );
    expect(checkedContainer.querySelectorAll('svg').length).toBe(3); // IdentificationBadge + UploadSimple + Check icons
  });
});
