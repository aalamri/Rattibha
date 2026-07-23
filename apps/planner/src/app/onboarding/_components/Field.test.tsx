import { render } from '@testing-library/react';

import { Field } from './Field';

describe('Field', () => {
  test('renders label and children', () => {
    const { getByText } = render(
      <Field label="Email">
        <input />
      </Field>
    );
    expect(getByText('Email')).toBeInTheDocument();
  });

  test('renders hint when provided', () => {
    const { getByText } = render(
      <Field label="Email" hint="We'll never share this">
        <input />
      </Field>
    );
    expect(getByText("We'll never share this")).toBeInTheDocument();
  });

  test('omits hint when not provided', () => {
    const { queryByText } = render(
      <Field label="Email">
        <input />
      </Field>
    );
    expect(queryByText("We'll never share this")).toBeNull();
  });
});
