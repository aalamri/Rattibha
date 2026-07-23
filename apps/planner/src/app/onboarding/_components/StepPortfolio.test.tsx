import { fireEvent } from '@testing-library/react';

import { renderWithI18n } from '@/test-utils';
import { StepPortfolio } from './StepPortfolio';
import { INITIAL_FORM, MAX_PORTFOLIO_PHOTOS } from './types';

// jsdom does not implement URL.createObjectURL/revokeObjectURL — StepPortfolio
// calls both whenever form.portfolioFiles is non-empty. Only this one
// component needs this, so the mock is scoped to this file rather than
// added to the global jest.setup.ts.
// StepPortfolio.tsx uses the created URL as each preview's React list key —
// a mock that always returns the same string produces a duplicate-key
// warning as soon as a test renders more than one file, so this generates
// a unique value per call.
let objectUrlCounter = 0;
beforeEach(() => {
  objectUrlCounter = 0;
  URL.createObjectURL = jest.fn(() => `blob:mock-url-${objectUrlCounter++}`);
  URL.revokeObjectURL = jest.fn();
});

describe('StepPortfolio', () => {
  test('empty state: renders the add-photo tile, no previews', async () => {
    const { container, getByText } = await renderWithI18n(<StepPortfolio form={INITIAL_FORM} onChange={() => {}} />);
    expect(getByText('Add photo')).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(getByText('0/8 photos')).toBeInTheDocument();
  });

  test('selecting a file via the hidden input calls onChange with the file appended', async () => {
    const onChange = jest.fn();
    const { container } = await renderWithI18n(<StepPortfolio form={INITIAL_FORM} onChange={onChange} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith({ portfolioFiles: [file] });
  });

  test('non-empty portfolioFiles: renders a preview per file and the correct count', async () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const form = { ...INITIAL_FORM, portfolioFiles: [file] };
    const { container, getByText } = await renderWithI18n(<StepPortfolio form={form} onChange={() => {}} />);

    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(getByText('1/8 photos')).toBeInTheDocument();
  });

  test('removing a photo calls onChange with that file filtered out', async () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const onChange = jest.fn();
    const form = { ...INITIAL_FORM, portfolioFiles: [fileA, fileB] };
    const { getAllByLabelText } = await renderWithI18n(<StepPortfolio form={form} onChange={onChange} />);

    fireEvent.click(getAllByLabelText('Remove photo')[0]);
    expect(onChange).toHaveBeenCalledWith({ portfolioFiles: [fileB] });
  });

  test('the add-more tile disappears once portfolioFiles reaches the max', async () => {
    const files = Array.from({ length: MAX_PORTFOLIO_PHOTOS }, (_, i) => new File(['x'], `${i}.png`, { type: 'image/png' }));
    const form = { ...INITIAL_FORM, portfolioFiles: files };
    const { queryByText } = await renderWithI18n(<StepPortfolio form={form} onChange={() => {}} />);
    expect(queryByText('Add photo')).toBeNull();
  });
});
