import { Balloon, Briefcase, Cake, HeartStraight, Wine, type Icon } from 'phosphor-react';

export type CategoryKey = 'weddings' | 'birthdays' | 'engagements' | 'corporate' | 'galas';

export const CATEGORY_KEYS: CategoryKey[] = ['weddings', 'birthdays', 'engagements', 'corporate', 'galas'];

export const CATEGORY_ICONS: Record<CategoryKey, Icon> = {
  weddings: HeartStraight,
  birthdays: Cake,
  engagements: Balloon,
  corporate: Briefcase,
  galas: Wine,
};

/** Tint / accent pairs, matching r.tint / r.color in browse.jsx OPEN_REQUESTS. */
export const CATEGORY_COLORS: Record<CategoryKey, { tint: string; color: string }> = {
  weddings: { tint: '#F2EAF7', color: '#4B0082' },
  engagements: { tint: '#EADFF7', color: '#7B4FB0' },
  corporate: { tint: '#E4D4EF', color: '#3D0069' },
  galas: { tint: '#F2E2A6', color: '#DAA520' },
  birthdays: { tint: '#F6E7C4', color: '#B5881A' },
};

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
  'riyadh', 'jeddah', 'makkah', 'madinah', 'dammam',
  'khobar', 'dhahran', 'taif', 'tabuk', 'abha',
  'al_ahsa', 'buraidah', 'yanbu',
];
