import { renderWithI18n } from '@/test-utils';
import { BrandRail } from './BrandRail';

describe('BrandRail', () => {
  test('renders the real translated step labels', async () => {
    const { getByText } = await renderWithI18n(<BrandRail step={0} done={false} />);
    expect(getByText('Account')).toBeInTheDocument();
    expect(getByText('Business')).toBeInTheDocument();
    expect(getByText('Services')).toBeInTheDocument();
    expect(getByText('Portfolio')).toBeInTheDocument();
    expect(getByText('Verification')).toBeInTheDocument();
  });

  test('step=2: earlier steps are done, current step is active, later steps are todo', async () => {
    const { getByText } = await renderWithI18n(<BrandRail step={2} done={false} />);
    const account = getByText('Account').className;
    expect(account).not.toContain('font-semibold');
    expect(account).not.toContain('white/60');

    expect(getByText('Services').className).toContain('font-semibold text-white');
    expect(getByText('Portfolio').className).toContain('text-white/60');
  });

  test('done=true: every step renders as done regardless of step', async () => {
    const { getByText } = await renderWithI18n(<BrandRail step={0} done={true} />);
    const verification = getByText('Verification').className;
    expect(verification).not.toContain('font-semibold');
    expect(verification).not.toContain('white/60');
  });
});
