import type { CategoryKey, CityKey } from './categories';

export type BudgetKey = 'under10' | '10to20' | '20to35' | 'over35';

export interface OpenRequest {
  id: string;
  name: string;
  initials: string;
  seed: number;
  category: CategoryKey;
  guests: number;
  city: CityKey;
  /** Days from today the event is scheduled. */
  daysFromNow: number;
  budgetKey: BudgetKey;
  /** Hours since the request was posted. */
  postedHoursAgo: number;
  offers: number;
  match: number;
  verified: boolean;
  note: string;
}

/** Mock "Open requests" board — ported from OPEN_REQUESTS in browse.jsx. */
export const OPEN_REQUESTS: OpenRequest[] = [
  {
    id: 'q1', name: 'Noura A.', initials: 'N', seed: 1, category: 'weddings', guests: 150, city: 'riyadh',
    daysFromNow: 14, budgetKey: '10to20', postedHoursAgo: 2, offers: 3, match: 96, verified: true,
    note: 'Elegant garden wedding in soft rose & gold. Looking for full planning, styling, catering and florals.',
  },
  {
    id: 'q2', name: 'Mansour K.', initials: 'M', seed: 2, category: 'corporate', guests: 300, city: 'riyadh',
    daysFromNow: 60, budgetKey: 'over35', postedHoursAgo: 5, offers: 5, match: 88, verified: true,
    note: 'Annual company gala — stage production, AV, catering and awards ceremony for 300.',
  },
  {
    id: 'q3', name: 'Latifa S.', initials: 'L', seed: 4, category: 'engagements', guests: 80, city: 'jeddah',
    daysFromNow: 35, budgetKey: '10to20', postedHoursAgo: 24, offers: 2, match: 79, verified: false,
    note: 'Intimate engagement dinner with romantic styling and a live florals setup.',
  },
  {
    id: 'q4', name: 'Hessa M.', initials: 'H', seed: 3, category: 'galas', guests: 200, city: 'riyadh',
    daysFromNow: 90, budgetKey: '20to35', postedHoursAgo: 24, offers: 4, match: 84, verified: true,
    note: 'Charity gala dinner — elegant ballroom styling, entertainment and full coordination.',
  },
  {
    id: 'q5', name: 'Abeer T.', initials: 'A', seed: 5, category: 'weddings', guests: 250, city: 'jeddah',
    daysFromNow: 33, budgetKey: '20to35', postedHoursAgo: 3, offers: 2, match: 81, verified: true,
    note: 'Red Sea waterfront wedding — modern styling, florals and premium catering.',
  },
  {
    id: 'q6', name: 'Yousef A.', initials: 'Y', seed: 2, category: 'weddings', guests: 180, city: 'makkah',
    daysFromNow: 50, budgetKey: '10to20', postedHoursAgo: 6, offers: 1, match: 90, verified: true,
    note: 'Walimah celebration with traditional hospitality and elegant hall styling.',
  },
  {
    id: 'q7', name: 'Reema S.', initials: 'R', seed: 1, category: 'engagements', guests: 90, city: 'khobar',
    daysFromNow: 12, budgetKey: '10to20', postedHoursAgo: 8, offers: 3, match: 86, verified: false,
    note: 'Seaside engagement with chic coastal décor and a live florals setup.',
  },
  {
    id: 'q8', name: 'Fahad M.', initials: 'F', seed: 3, category: 'birthdays', guests: 40, city: 'dammam',
    daysFromNow: 27, budgetKey: 'under10', postedHoursAgo: 24, offers: 4, match: 77, verified: true,
    note: 'Kids birthday party — fun theme, balloons, cake and an energetic host.',
  },
];

export function eventDateFor(request: OpenRequest): Date {
  const date = new Date();
  date.setDate(date.getDate() + request.daysFromNow);
  return date;
}
