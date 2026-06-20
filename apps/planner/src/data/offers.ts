import type { CategoryKey, CityKey } from './categories';

export type OfferStatus = 'pending' | 'viewed' | 'accepted' | 'declined';

export interface MyOffer {
  id: string;
  name: string;
  initials: string;
  seed: number;
  category: CategoryKey;
  daysFromNow: number;
  city: CityKey;
  guests: number;
  quote: number;
  offerStatus: OfferStatus;
  sentHoursAgo: number;
  note: string;
}

/** Mock "My Offers" — ported from LEADS in dash.jsx. */
export const MY_OFFERS: MyOffer[] = [
  {
    id: 'l1', name: 'Noura Al-Qahtani', initials: 'N', seed: 1, category: 'weddings', daysFromNow: 14,
    city: 'riyadh', guests: 220, quote: 22000, offerStatus: 'pending', sentHoursAgo: 0.25,
    note: 'Looking for an elegant garden wedding in soft rose & gold. Full planning + décor.',
  },
  {
    id: 'l2', name: 'Faisal Group', initials: 'F', seed: 2, category: 'corporate', daysFromNow: 60,
    city: 'riyadh', guests: 400, quote: 46000, offerStatus: 'viewed', sentHoursAgo: 1,
    note: 'Annual celebration & awards night for 400 staff. Stage, AV and catering.',
  },
  {
    id: 'l3', name: 'Sara Hassan', initials: 'S', seed: 4, category: 'engagements', daysFromNow: 35,
    city: 'jeddah', guests: 120, quote: 13500, offerStatus: 'accepted', sentHoursAgo: 2,
    note: 'Intimate engagement, modern romantic styling.',
  },
  {
    id: 'l4', name: 'Mona Khalid', initials: 'M', seed: 5, category: 'birthdays', daysFromNow: 27,
    city: 'riyadh', guests: 60, quote: 6800, offerStatus: 'declined', sentHoursAgo: 4,
    note: "Daughter's 7th birthday — princess theme, balloons & cake.",
  },
];
