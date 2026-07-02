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
  /** Gradient seeds for the portfolio gallery — index-matched against
   * locale JSON's `planners[i].portfolio[]` captions (see task #25). */
  portfolioSeeds: number[];
  /** Prices for each service package — index-matched against locale
   * JSON's `planners[i].packages[]` name/description. */
  packagePrices: number[];
  /** Star rating for each review — index-matched against locale JSON's
   * `planners[i].reviews[]` author/text. Kept separate from the profile's
   * headline `rating` (which represents a broader review base than the 2
   * samples shown), consistent with task #19's decision not to claim an
   * aggregateRating from a handful of sample reviews. */
  reviewRatings: number[];
}

export const PLANNER_STATS: PlannerStat[] = [
  { slug: 'lumiere-events', rating: 4.9, from: 18000, seed: 0, premium: true, cityKey: 'riyadh', categoryKeys: ['weddings', 'galas'], portfolioSeeds: [1, 3, 5], packagePrices: [18000, 32000], reviewRatings: [5, 5] },
  { slug: 'coral-coast-events', rating: 4.7, from: 19000, seed: 5, premium: true, cityKey: 'jeddah', categoryKeys: ['galas'], portfolioSeeds: [2, 4, 0], packagePrices: [19000, 35000], reviewRatings: [5, 4] },
  { slug: 'noor-weddings', rating: 4.9, from: 16000, seed: 3, premium: true, cityKey: 'makkah', categoryKeys: ['weddings'], portfolioSeeds: [1, 2, 4], packagePrices: [16000, 26000], reviewRatings: [5, 5] },
  { slug: 'marina-celebrations', rating: 4.8, from: 11000, seed: 1, premium: true, cityKey: 'khobar', categoryKeys: ['engagements'], portfolioSeeds: [3, 5, 2], packagePrices: [11000, 17500], reviewRatings: [5, 4] },
  { slug: 'saffron-events', rating: 4.7, from: 13500, seed: 5, premium: false, cityKey: 'madinah', categoryKeys: ['weddings', 'galas'], portfolioSeeds: [0, 4, 1], packagePrices: [13500, 24000], reviewRatings: [5, 5] },
  { slug: 'rose-valley-events', rating: 4.9, from: 10500, seed: 4, premium: false, categoryKeys: ['weddings'], portfolioSeeds: [2, 0, 3], packagePrices: [10500, 17000], reviewRatings: [5, 5] }, // Taif — no city index page yet
  { slug: 'orbit-corporate', rating: 4.7, from: 25000, seed: 2, premium: true, cityKey: 'riyadh', categoryKeys: ['corporate'], portfolioSeeds: [4, 1, 5], packagePrices: [25000, 42000], reviewRatings: [5, 5] },
  { slug: 'zahra-parties', rating: 4.9, from: 3200, seed: 4, premium: false, cityKey: 'dammam', categoryKeys: ['birthdays'], portfolioSeeds: [3, 0, 2], packagePrices: [3200, 6500], reviewRatings: [5, 5] },
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
