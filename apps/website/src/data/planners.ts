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

/** Structural (non-translatable) planner data — index-matched against the
 * `planners` array in src/i18n/locales/{en,ar}.json. Mirrors PLANNERS in
 * ui_kits/website/site.jsx.
 *
 * `slug` and `cityKey` are locale-invariant identifiers used to build public
 * profile URLs (/planners/[cityKey]/[slug]) — kept separate from the
 * localized display `city`/`name` strings in the locale JSON so the same URL
 * works under both "/" (ar) and "/en". `cityKey` is left undefined for
 * planners based outside the six cities with their own city page (e.g.
 * Taif) — their profile page still exists, just without a city index link. */
export interface PlannerStat {
  slug: string;
  rating: number;
  from: number;
  seed: number;
  premium: boolean;
  cityKey?: CityKey;
  categoryKeys: CategoryKey[];
}

export const PLANNER_STATS: PlannerStat[] = [
  { slug: 'lumiere-events', rating: 4.9, from: 18000, seed: 0, premium: true, cityKey: 'riyadh', categoryKeys: ['weddings', 'galas'] },
  { slug: 'coral-coast-events', rating: 4.7, from: 19000, seed: 5, premium: true, cityKey: 'jeddah', categoryKeys: ['galas'] },
  { slug: 'noor-weddings', rating: 4.9, from: 16000, seed: 3, premium: true, cityKey: 'makkah', categoryKeys: ['weddings'] },
  { slug: 'marina-celebrations', rating: 4.8, from: 11000, seed: 1, premium: true, cityKey: 'khobar', categoryKeys: ['engagements'] },
  { slug: 'saffron-events', rating: 4.7, from: 13500, seed: 5, premium: false, cityKey: 'madinah', categoryKeys: ['weddings', 'galas'] },
  { slug: 'rose-valley-events', rating: 4.9, from: 10500, seed: 4, premium: false, categoryKeys: ['weddings'] }, // Taif — no city index page yet
  { slug: 'orbit-corporate', rating: 4.7, from: 25000, seed: 2, premium: true, cityKey: 'riyadh', categoryKeys: ['corporate'] },
  { slug: 'zahra-parties', rating: 4.9, from: 3200, seed: 4, premium: false, cityKey: 'dammam', categoryKeys: ['birthdays'] },
];

export interface CategoryCityCombo {
  category: CategoryKey;
  city: CityKey;
}

/** Every (category, city) pair with at least one real planner match,
 * derived from PLANNER_STATS so it can never drift out of sync with the
 * underlying data. Backs the long-tail "[category] in [city]" landing
 * pages (/categories/[category]/[city]) — see task #24. Combos with zero
 * matching planners are deliberately not generated, to avoid shipping
 * thin/empty pages. */
export const CATEGORY_CITY_COMBOS: CategoryCityCombo[] = (() => {
  const seen = new Set<string>();
  const combos: CategoryCityCombo[] = [];
  for (const stat of PLANNER_STATS) {
    if (!stat.cityKey) continue;
    for (const category of stat.categoryKeys) {
      const key = `${stat.cityKey}-${category}`;
      if (!seen.has(key)) {
        seen.add(key);
        combos.push({ category, city: stat.cityKey });
      }
    }
  }
  return combos;
})();
