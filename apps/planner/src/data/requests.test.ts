import { eventDateFor, type OpenRequest } from './requests';

const baseRequest: OpenRequest = {
  id: 'q1',
  name: 'Test',
  initials: 'T',
  seed: 1,
  category: 'weddings',
  guests: 100,
  city: 'riyadh',
  daysFromNow: 0,
  budgetKey: 'under10',
  postedHoursAgo: 0,
  offers: 0,
  match: 0,
  verified: false,
  note: '',
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-07-18T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('eventDateFor', () => {
  test('returns a date daysFromNow days after the pinned now', () => {
    const result = eventDateFor({ ...baseRequest, daysFromNow: 14 });
    const expected = new Date('2026-07-18T12:00:00Z');
    expected.setDate(expected.getDate() + 14);
    expect(result.getFullYear()).toBe(expected.getFullYear());
    expect(result.getMonth()).toBe(expected.getMonth());
    expect(result.getDate()).toBe(expected.getDate());
  });

  test('daysFromNow: 0 returns a date matching the pinned now exactly', () => {
    const result = eventDateFor({ ...baseRequest, daysFromNow: 0 });
    const now = new Date('2026-07-18T12:00:00Z');
    expect(result.getFullYear()).toBe(now.getFullYear());
    expect(result.getMonth()).toBe(now.getMonth());
    expect(result.getDate()).toBe(now.getDate());
  });
});
