/**
 * Mock planner directory data — ported from PLANNERS/CATEGORIES in ui_kits/app/ui.jsx.
 * Planner names, types and blurbs are listing content and are not translated (see CLAUDE.md).
 */

export type CityKey =
  | 'riyadh'
  | 'jeddah'
  | 'makkah'
  | 'madinah'
  | 'dammam'
  | 'khobar'
  | 'dhahran'
  | 'taif'
  | 'tabuk'
  | 'abha'
  | 'al_ahsa'
  | 'buraidah'
  | 'yanbu';

export const CITY_KEYS: CityKey[] = [
  'riyadh',
  'jeddah',
  'makkah',
  'madinah',
  'dammam',
  'khobar',
  'dhahran',
  'taif',
  'tabuk',
  'abha',
  'al_ahsa',
  'buraidah',
  'yanbu',
];

export type CategoryKey = 'weddings' | 'birthdays' | 'engagements' | 'corporate' | 'galas';

export const CATEGORY_KEYS: CategoryKey[] = ['weddings', 'birthdays', 'engagements', 'corporate', 'galas'];

export interface PlannerService {
  name: string;
  desc: string;
  from: number;
  seed: number;
  imageUrl?: string | null;
}

export interface PlannerPackage {
  name: string;
  note: string;
  price: number;
}

export interface Planner {
  id: string;
  name: string;
  city: CityKey;
  type: string;
  rating: number;
  events: number;
  premium: boolean;
  verified: boolean;
  from: number;
  seed: number;
  blurb: string;
  tags: string[];
  services: PlannerService[];
  packages: PlannerPackage[];
  portfolioUrls?: string[];
}

export const PLANNERS: Planner[] = [
  {
    id: 'lumiere',
    name: 'Lumière Events',
    city: 'riyadh',
    type: 'Weddings & Galas',
    rating: 4.9,
    events: 240,
    premium: true,
    verified: true,
    from: 18000,
    seed: 0,
    blurb:
      'Award-winning luxury wedding & gala studio crafting unforgettable celebrations across the Kingdom.',
    tags: ['Weddings', 'Galas', 'Luxury'],
    services: [
      { name: 'Full Wedding Planning', from: 18000, seed: 0, desc: 'End-to-end planning, styling & coordination.' },
      { name: 'Luxury Gala Production', from: 42000, seed: 5, desc: 'Stage, lighting, AV & show production.' },
      { name: 'Engagement & Milkah', from: 12000, seed: 3, desc: 'Intimate styling, florals & catering.' },
    ],
    packages: [
      { name: 'Signature Wedding', price: 18000, note: 'Full planning · 150–300 guests' },
      { name: 'Royal Gala', price: 42000, note: 'End-to-end production · 500+ guests' },
    ],
  },
  {
    id: 'farah',
    name: 'Farah Celebrations',
    city: 'jeddah',
    type: 'Engagements',
    rating: 4.8,
    events: 168,
    premium: false,
    verified: true,
    from: 9500,
    seed: 3,
    blurb: 'Joyful, intimate engagement and milkah celebrations with a modern romantic touch.',
    tags: ['Engagements', 'Intimate'],
    services: [
      { name: 'Milkah Styling', from: 9500, seed: 3, desc: 'Romantic styling & coordination.' },
      { name: 'Grand Engagement', from: 16000, seed: 1, desc: 'Full décor, florals & catering.' },
    ],
    packages: [
      { name: 'Milkah Essentials', price: 9500, note: 'Styling + coordination' },
      { name: 'Grand Engagement', price: 16000, note: 'Full décor & catering' },
    ],
  },
  {
    id: 'orbit',
    name: 'Orbit Corporate',
    city: 'riyadh',
    type: 'Corporate',
    rating: 4.7,
    events: 95,
    premium: true,
    verified: true,
    from: 25000,
    seed: 2,
    blurb: 'Polished annual celebrations, product launches and award nights for leading companies.',
    tags: ['Corporate', 'Launches'],
    services: [
      { name: 'Annual Celebration', from: 25000, seed: 2, desc: 'Venue, AV, catering & hosting.' },
      { name: 'Product Launch', from: 38000, seed: 5, desc: 'Stage, branding & full production.' },
      { name: 'Awards Night', from: 30000, seed: 0, desc: 'Ceremony production & entertainment.' },
    ],
    packages: [
      { name: 'Annual Celebration', price: 25000, note: 'Venue, AV & catering' },
      { name: 'Launch Production', price: 38000, note: 'Stage, lighting & show' },
    ],
  },
  {
    id: 'zahra',
    name: 'Zahra Parties',
    city: 'dammam',
    type: 'Birthdays',
    rating: 4.9,
    events: 312,
    premium: false,
    verified: true,
    from: 3200,
    seed: 4,
    blurb: 'Playful, colorful kids & adult birthday parties — balloons, cakes and big smiles.',
    tags: ['Birthdays', 'Kids'],
    services: [
      { name: 'Birthday Bash', from: 3200, seed: 4, desc: 'Décor, cake, balloons & host.' },
      { name: 'Themed Party', from: 6800, seed: 1, desc: 'Custom theme & entertainment.' },
    ],
    packages: [
      { name: 'Birthday Bash', price: 3200, note: 'Décor, cake & host' },
      { name: 'Themed Party', price: 6800, note: 'Custom theme & entertainment' },
    ],
  },
  {
    id: 'najd',
    name: 'Najd Royal',
    city: 'riyadh',
    type: 'Weddings',
    rating: 4.8,
    events: 186,
    premium: true,
    verified: true,
    from: 22000,
    seed: 2,
    blurb: 'Heritage-inspired royal weddings with majlis styling and grand hospitality.',
    tags: ['Weddings', 'Heritage'],
    services: [
      { name: 'Royal Wedding', from: 22000, seed: 0, desc: 'Full planning, majlis styling & catering.' },
      { name: 'Heritage Majlis', from: 14000, seed: 2, desc: 'Traditional décor & hospitality.' },
    ],
    packages: [
      { name: 'Royal Wedding', price: 22000, note: 'Full planning · 200–400 guests' },
      { name: 'Heritage Majlis', price: 14000, note: 'Styling & hospitality' },
    ],
  },
  {
    id: 'noor',
    name: 'Noor Weddings',
    city: 'makkah',
    type: 'Weddings',
    rating: 4.9,
    events: 142,
    premium: true,
    verified: true,
    from: 16000,
    seed: 3,
    blurb: 'Elegant, faith-respectful weddings and walimah celebrations in the holy city.',
    tags: ['Weddings', 'Walimah'],
    services: [
      { name: 'Walimah Package', from: 16000, seed: 3, desc: 'Full planning, styling & catering.' },
      { name: 'Intimate Nikah', from: 8000, seed: 1, desc: 'Ceremony styling & coordination.' },
    ],
    packages: [
      { name: 'Walimah Package', price: 16000, note: 'Full planning · 150–300 guests' },
      { name: 'Intimate Nikah', price: 8000, note: 'Styling & coordination' },
    ],
  },
  {
    id: 'saffron',
    name: 'Saffron Events',
    city: 'madinah',
    type: 'Weddings & Galas',
    rating: 4.7,
    events: 98,
    premium: false,
    verified: true,
    from: 13500,
    seed: 5,
    blurb: 'Warm, refined celebrations and community galas across Madinah.',
    tags: ['Weddings', 'Galas'],
    services: [
      { name: 'Garden Wedding', from: 13500, seed: 5, desc: 'Outdoor styling, florals & catering.' },
      { name: 'Community Gala', from: 20000, seed: 0, desc: 'Hall production & hosting.' },
    ],
    packages: [
      { name: 'Garden Wedding', price: 13500, note: 'Full planning · up to 250 guests' },
      { name: 'Community Gala', price: 20000, note: 'Production & hosting' },
    ],
  },
  {
    id: 'marina',
    name: 'Marina Celebrations',
    city: 'khobar',
    type: 'Engagements & Galas',
    rating: 4.8,
    events: 124,
    premium: true,
    verified: true,
    from: 11000,
    seed: 1,
    blurb: 'Seaside engagements and modern galas with a chic coastal aesthetic.',
    tags: ['Engagements', 'Galas', 'Coastal'],
    services: [
      { name: 'Seaside Engagement', from: 11000, seed: 1, desc: 'Waterfront styling & florals.' },
      { name: 'Coastal Gala', from: 24000, seed: 5, desc: 'Full production & catering.' },
    ],
    packages: [
      { name: 'Seaside Engagement', price: 11000, note: 'Styling & coordination' },
      { name: 'Coastal Gala', price: 24000, note: 'Production & catering' },
    ],
  },
  {
    id: 'rosevalley',
    name: 'Rose Valley Events',
    city: 'taif',
    type: 'Weddings',
    rating: 4.9,
    events: 76,
    premium: false,
    verified: true,
    from: 10500,
    seed: 4,
    blurb: 'Romantic rose-garden weddings celebrating the spirit of Taif.',
    tags: ['Weddings', 'Florals'],
    services: [
      { name: 'Rose Garden Wedding', from: 10500, seed: 4, desc: 'Florals, styling & coordination.' },
      { name: 'Blossom Engagement', from: 7000, seed: 3, desc: 'Intimate florals & décor.' },
    ],
    packages: [
      { name: 'Rose Garden Wedding', price: 10500, note: 'Full planning · up to 200 guests' },
      { name: 'Blossom Engagement', price: 7000, note: 'Florals & styling' },
    ],
  },
  {
    id: 'aseer',
    name: 'Aseer Occasions',
    city: 'abha',
    type: 'Corporate & Weddings',
    rating: 4.6,
    events: 64,
    premium: false,
    verified: true,
    from: 9000,
    seed: 2,
    blurb: 'Highland celebrations and corporate events with authentic Aseer character.',
    tags: ['Corporate', 'Weddings'],
    services: [
      { name: 'Highland Wedding', from: 12000, seed: 2, desc: 'Styling, catering & coordination.' },
      { name: 'Corporate Retreat', from: 9000, seed: 0, desc: 'Venue, AV & hosting.' },
    ],
    packages: [
      { name: 'Highland Wedding', price: 12000, note: 'Full planning · up to 250 guests' },
      { name: 'Corporate Retreat', price: 9000, note: 'Venue & hosting' },
    ],
  },
  {
    id: 'coral',
    name: 'Coral Coast Events',
    city: 'jeddah',
    type: 'Galas',
    rating: 4.7,
    events: 110,
    premium: true,
    verified: true,
    from: 19000,
    seed: 5,
    blurb: 'Glamorous Red Sea galas, launches and award nights on the Jeddah waterfront.',
    tags: ['Galas', 'Launches'],
    services: [
      { name: 'Red Sea Gala', from: 19000, seed: 5, desc: 'Waterfront production & catering.' },
      { name: 'Launch Night', from: 28000, seed: 2, desc: 'Stage, branding & show.' },
    ],
    packages: [
      { name: 'Red Sea Gala', price: 19000, note: 'Production & catering' },
      { name: 'Launch Night', price: 28000, note: 'Stage & show' },
    ],
  },
  {
    id: 'jewel',
    name: 'Jewel Birthdays',
    city: 'dammam',
    type: 'Birthdays',
    rating: 4.8,
    events: 203,
    premium: false,
    verified: true,
    from: 2800,
    seed: 3,
    blurb: 'Bright, joyful birthday parties for kids and adults across the Eastern Province.',
    tags: ['Birthdays', 'Kids'],
    services: [
      { name: 'Kids Party', from: 2800, seed: 3, desc: 'Décor, cake, games & host.' },
      { name: 'Milestone Birthday', from: 5500, seed: 1, desc: 'Themed styling & entertainment.' },
    ],
    packages: [
      { name: 'Kids Party', price: 2800, note: 'Décor, cake & host' },
      { name: 'Milestone Birthday', price: 5500, note: 'Themed styling' },
    ],
  },
];

export const REVIEWS = [
  { who: 'Noura A.', seed: 1, rating: 5, text: 'Absolutely flawless. Every detail of our wedding was perfect.' },
  { who: 'Khalid M.', seed: 2, rating: 5, text: 'Professional team, beautiful styling, stress-free day.' },
  { who: 'Sara H.', seed: 3, rating: 4, text: 'Gorgeous décor and great communication throughout.' },
];
