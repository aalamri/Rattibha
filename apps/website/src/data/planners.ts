/** Structural (non-translatable) planner data — index-matched against the
 * `planners` array in src/i18n/locales/{en,ar}.json. Mirrors PLANNERS in
 * ui_kits/website/site.jsx. */
export interface PlannerStat {
  rating: number;
  from: number;
  seed: number;
  premium: boolean;
}

export const PLANNER_STATS: PlannerStat[] = [
  { rating: 4.9, from: 18000, seed: 0, premium: true }, // Lumière Events
  { rating: 4.7, from: 19000, seed: 5, premium: true }, // Coral Coast Events
  { rating: 4.9, from: 16000, seed: 3, premium: true }, // Noor Weddings
  { rating: 4.8, from: 11000, seed: 1, premium: true }, // Marina Celebrations
  { rating: 4.7, from: 13500, seed: 5, premium: false }, // Saffron Events
  { rating: 4.9, from: 10500, seed: 4, premium: false }, // Rose Valley Events
  { rating: 4.7, from: 25000, seed: 2, premium: true }, // Orbit Corporate
  { rating: 4.9, from: 3200, seed: 4, premium: false }, // Zahra Parties
];

export const CITY_KEYS = ['riyadh', 'jeddah', 'makkah', 'madinah', 'dammam', 'khobar'] as const;
export type CityKey = (typeof CITY_KEYS)[number];

export const CITY_PLANNER_COUNTS: Record<CityKey, number> = {
  riyadh: 220,
  jeddah: 160,
  makkah: 90,
  madinah: 70,
  dammam: 60,
  khobar: 50,
};

export type CategoryKey = 'weddings' | 'birthdays' | 'engagements' | 'corporate' | 'galas';
export const CATEGORY_KEYS: CategoryKey[] = ['weddings', 'birthdays', 'engagements', 'corporate', 'galas'];
