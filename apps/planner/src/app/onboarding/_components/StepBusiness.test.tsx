import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepBusiness } from './StepBusiness';
import { INITIAL_FORM } from './types';

describe('StepBusiness', () => {
  test('renders real translated chip labels for city, team size, and years', async () => {
    const { getByText } = await renderWithI18n(<StepBusiness form={INITIAL_FORM} onChange={() => {}} />);
    expect(getByText('Riyadh')).toBeInTheDocument();
    expect(getByText('Just me')).toBeInTheDocument();
    expect(getByText('<1 yr')).toBeInTheDocument();
  });

  test('the chip matching the current form value renders as active', async () => {
    const form = { ...INITIAL_FORM, city: 'jeddah' as const };
    const { getByText } = await renderWithI18n(<StepBusiness form={form} onChange={() => {}} />);
    expect(getByText('Jeddah').className).toContain('border-brand bg-purple-50 text-brand');
    expect(getByText('Riyadh').className).not.toContain('border-brand bg-purple-50 text-brand');
  });

  test('clicking a city/team-size/years chip fires the right single-value onChange patch', async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithI18n(<StepBusiness form={INITIAL_FORM} onChange={onChange} />);

    fireEvent.click(getByText('Jeddah'));
    expect(onChange).toHaveBeenCalledWith({ city: 'jeddah' });

    fireEvent.click(getByText('2–5 people'));
    expect(onChange).toHaveBeenCalledWith({ teamSize: '2–5 people' });

    fireEvent.click(getByText('1–3 yrs'));
    expect(onChange).toHaveBeenCalledWith({ yearsInBusiness: '1–3 yrs' });
  });

  test('bio textarea passes through value and onChange', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, bio: 'We plan weddings.' };
    const { getByDisplayValue } = await renderWithI18n(<StepBusiness form={form} onChange={onChange} />);

    fireEvent.change(getByDisplayValue('We plan weddings.'), { target: { value: 'Updated bio' } });
    expect(onChange).toHaveBeenCalledWith({ bio: 'Updated bio' });
  });
});
