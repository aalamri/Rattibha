import type { CategoryKey, CityKey } from './planners';

export type RequestStatus = 'open' | 'booked';
export type BudgetKey = 'under10' | '10to20' | '20to35' | 'over35';

export interface CustomerRequest {
  id: string;
  category: CategoryKey;
  guests: number;
  city: CityKey;
  /** Days from today the event is scheduled. */
  daysFromNow: number;
  budgetKey: BudgetKey;
  status: RequestStatus;
  offers: number;
  newOffers: number;
  /** Hours since the request was posted. */
  postedHoursAgo: number;
}

/** Mock "My requests" — ported from RequestsScreen in screens6.jsx, with dates relative to today. */
export const MY_REQUESTS: CustomerRequest[] = [
  { id: 'r1', category: 'weddings', guests: 150, city: 'riyadh', daysFromNow: 30, budgetKey: '10to20', status: 'open', offers: 3, newOffers: 2, postedHoursAgo: 2 },
  { id: 'r2', category: 'corporate', guests: 300, city: 'riyadh', daysFromNow: 60, budgetKey: 'over35', status: 'open', offers: 3, newOffers: 0, postedHoursAgo: 24 },
  { id: 'r3', category: 'birthdays', guests: 40, city: 'jeddah', daysFromNow: 7, budgetKey: 'under10', status: 'booked', offers: 2, newOffers: 0, postedHoursAgo: 120 },
];

export function eventDateFor(request: CustomerRequest): Date {
  const date = new Date();
  date.setDate(date.getDate() + request.daysFromNow);
  return date;
}
