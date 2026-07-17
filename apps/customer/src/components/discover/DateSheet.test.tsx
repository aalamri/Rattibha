import { StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils';
import { DateSheet } from './DateSheet';

// DateSheet computes "today" from the real system clock — pin it for every
// test in this file so disabled/enabled-day assertions are deterministic
// regardless of the date this suite actually runs on.
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-07-17T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DateSheet', () => {
  const value = new Date('2026-07-17T12:00:00Z');

  test('visible=false renders nothing', async () => {
    const { toJSON } = await renderWithProviders(
      <DateSheet visible={false} value={value} onSelect={() => {}} onClose={() => {}} />
    );
    expect(toJSON()).toBeNull();
  });

  test("visible=true renders the calendar for value's month", async () => {
    const { queryByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={() => {}} onClose={() => {}} />
    );
    expect(queryByText('July 2026')).toBeTruthy();
    expect(queryByText('17')).toBeTruthy();
  });

  test('a date before today is disabled: pressing it does not call onSelect', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={onSelect} onClose={() => {}} />
    );
    // "Today" is pinned to July 17, 2026 — July 10 is in the past.
    await fireEvent.press(getByText('10'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('pressing an enabled date calls onSelect with that date, then onClose', async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const { getByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={onSelect} onClose={onClose} />
    );
    await fireEvent.press(getByText('25'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const selected: Date = onSelect.mock.calls[0][0];
    expect(selected.getFullYear()).toBe(2026);
    expect(selected.getMonth()).toBe(6); // July, 0-indexed
    expect(selected.getDate()).toBe(25);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('next/prev month buttons navigate the visible month', async () => {
    const { root, queryByText } = await renderWithProviders(
      <DateSheet visible={true} value={value} onSelect={() => {}} onClose={() => {}} />
    );
    // The two round month-nav buttons are the only Pressables with hitSlop=8
    // sized 34x34 in the tree; JSX/query order is [prev, next] regardless of
    // language (only visual flexDirection flips, not DOM order).
    const navButtons = root!.queryAll((node: any) => {
      if (node.props?.hitSlop !== 8) return false;
      const style = node.props?.style;
      if (!style) return false;
      const flat = StyleSheet.flatten(style);
      return flat.width === 34 && flat.height === 34;
    });
    expect(navButtons).toHaveLength(2);

    await fireEvent.press(navButtons[1]); // next
    expect(queryByText('August 2026')).toBeTruthy();

    await fireEvent.press(navButtons[0]); // prev
    await fireEvent.press(navButtons[0]); // prev again
    expect(queryByText('June 2026')).toBeTruthy();
  });

  test('RTL constructs every Intl.DateTimeFormat call with the exact ar-SA-u-ca-gregory locale tag', async () => {
    const spy = jest.spyOn(globalThis.Intl, 'DateTimeFormat');
    try {
      await renderWithProviders(<DateSheet visible={true} value={value} onSelect={() => {}} onClose={() => {}} />, {
        lang: 'ar',
      });
      expect(spy.mock.calls.length).toBeGreaterThan(0);
      const locales = new Set(spy.mock.calls.map((call) => call[0]));
      expect(locales).toEqual(new Set(['ar-SA-u-ca-gregory']));
    } finally {
      spy.mockRestore();
    }
  });
});
