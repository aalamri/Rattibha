import { render } from '@testing-library/react';

import { StepHead } from './StepHead';

describe('StepHead', () => {
  test('renders title and subtitle', () => {
    const { getByText } = render(<StepHead title="Create your account" subtitle="Let's get started" />);
    expect(getByText('Create your account')).toBeInTheDocument();
    expect(getByText("Let's get started")).toBeInTheDocument();
  });
});
