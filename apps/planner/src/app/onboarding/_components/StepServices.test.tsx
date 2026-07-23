import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepServices } from './StepServices';
import { INITIAL_FORM } from './types';

describe('StepServices', () => {
  test('renders real translated category and budget-tier chip labels', async () => {
    const { getByText } = await renderWithI18n(<StepServices form={INITIAL_FORM} onChange={() => {}} />);
    expect(getByText('Wedding')).toBeInTheDocument();
    expect(getByText('Value')).toBeInTheDocument();
  });

  test('clicking an unselected category chip adds it to form.categories', async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithI18n(<StepServices form={INITIAL_FORM} onChange={onChange} />);
    fireEvent.click(getByText('Wedding'));
    expect(onChange).toHaveBeenCalledWith({ categories: ['weddings'] });
  });

  test('clicking a selected category chip removes it from form.categories', async () => {
    const onChange = jest.fn();
    const formWithWedding = { ...INITIAL_FORM, categories: ['weddings' as const] };
    const { getByText } = await renderWithI18n(<StepServices form={formWithWedding} onChange={onChange} />);
    fireEvent.click(getByText('Wedding'));
    expect(onChange).toHaveBeenCalledWith({ categories: [] });
  });

  test('the selected category chip renders as active', async () => {
    const form = { ...INITIAL_FORM, categories: ['weddings' as const] };
    const { getByText } = await renderWithI18n(<StepServices form={form} onChange={() => {}} />);
    expect(getByText('Wedding').className).toContain('border-brand bg-purple-50 text-brand');
  });

  test('budget-tier chip single-selects like StepBusiness', async () => {
    const onChange = jest.fn();
    const { getByText } = await renderWithI18n(<StepServices form={INITIAL_FORM} onChange={onChange} />);
    fireEvent.click(getByText('Premium'));
    expect(onChange).toHaveBeenCalledWith({ budgetTier: 'Premium' });
  });

  test('startingPrice input passes through value and onChange', async () => {
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, startingPrice: '5000' };
    const { getByDisplayValue } = await renderWithI18n(<StepServices form={form} onChange={onChange} />);
    fireEvent.change(getByDisplayValue('5000'), { target: { value: '6000' } });
    expect(onChange).toHaveBeenCalledWith({ startingPrice: '6000' });
  });
});
