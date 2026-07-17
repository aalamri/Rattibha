import { render } from '@testing-library/react';

import { Section } from './Section';

describe('Section', () => {
  test('renders children inside a Card', () => {
    const { getByText } = render(
      <Section>
        <p>Body</p>
      </Section>
    );
    expect(getByText('Body')).toBeInTheDocument();
  });

  test('renders the title when provided', () => {
    const { getByText } = render(
      <Section title="My Title">
        <p>Body</p>
      </Section>
    );
    expect(getByText('My Title')).toBeInTheDocument();
  });

  test('renders the action when provided', () => {
    const { getByText } = render(
      <Section action={<button>Action</button>}>
        <p>Body</p>
      </Section>
    );
    expect(getByText('Action')).toBeInTheDocument();
  });

  test('omits the header row entirely when neither title nor action is provided', () => {
    const { container } = render(
      <Section>
        <p>Body</p>
      </Section>
    );
    expect(container.querySelector('.justify-between')).toBeNull();
  });
});
