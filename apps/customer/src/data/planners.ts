/**
 * Shared planner directory types — real data comes from Supabase via
 * lib/db.ts's toPlanner() mapper, which produces the `Planner` shape below.
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
