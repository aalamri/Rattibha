import { toPlanner, type DBPlannerRow } from './db';

function makeRow(overrides: Partial<DBPlannerRow> = {}): DBPlannerRow {
  return {
    user_id: 'planner-1',
    business_name: 'Lumière Events',
    bio: 'Award-winning studio crafting unforgettable celebrations.',
    city: 'riyadh',
    categories: ['weddings', 'galas'],
    verified: true,
    tier: 'standard',
    rating: 4.8,
    reviews_count: 120,
    instagram: '@lumiere',
    website: 'https://lumiere.example',
    portfolio_urls: ['https://img.example/1', 'https://img.example/2'],
    profiles: { avatar_seed: 7 },
    planner_services: [
      { id: 's1', name: 'Full Wedding Planning', description: 'End-to-end planning.', from_price: 18000, seed: 0, image_url: null },
      { id: 's2', name: 'Luxury Gala Production', description: null, from_price: 42000, seed: 1, image_url: 'https://img.example/s2' },
    ],
    ...overrides,
  };
}

test('maps direct fields through unchanged', () => {
  const planner = toPlanner(makeRow());
  expect(planner.id).toBe('planner-1');
  expect(planner.name).toBe('Lumière Events');
  expect(planner.city).toBe('riyadh');
  expect(planner.rating).toBe(4.8);
  expect(planner.events).toBe(120);
  expect(planner.verified).toBe(true);
  expect(planner.blurb).toBe('Award-winning studio crafting unforgettable celebrations.');
  expect(planner.tags).toEqual(['weddings', 'galas']);
});

describe('premium', () => {
  test.each(['Premium', 'premium', 'PREMIUM'])('tier %s is premium', (tier) => {
    expect(toPlanner(makeRow({ tier })).premium).toBe(true);
  });

  test('tier standard is not premium', () => {
    expect(toPlanner(makeRow({ tier: 'standard' })).premium).toBe(false);
  });

  test('tier essentials is not premium (regression guard for the historical bug documented in db.ts)', () => {
    // db.ts's comment above `premium:` documents that comparing tier against
    // 'essentials' used to always evaluate true, since tier is never that
    // value — every planner was incorrectly marked premium. This locks in
    // the fix.
    expect(toPlanner(makeRow({ tier: 'essentials' })).premium).toBe(false);
  });
});

describe('from (minimum price)', () => {
  test('is the lowest from_price across services', () => {
    expect(toPlanner(makeRow()).from).toBe(18000);
  });

  test('is 0 when there are no services', () => {
    expect(toPlanner(makeRow({ planner_services: [] })).from).toBe(0);
  });
});

describe('null defaults', () => {
  test('profiles: null defaults seed to 0', () => {
    expect(toPlanner(makeRow({ profiles: null })).seed).toBe(0);
  });

  test('bio: null defaults blurb to empty string', () => {
    expect(toPlanner(makeRow({ bio: null })).blurb).toBe('');
  });

  test('portfolio_urls: null defaults portfolioUrls to an empty array', () => {
    expect(toPlanner(makeRow({ portfolio_urls: null })).portfolioUrls).toEqual([]);
  });
});

describe('type (category label)', () => {
  test('joins multiple mapped categories with " & "', () => {
    expect(toPlanner(makeRow({ categories: ['weddings', 'galas'] })).type).toBe('Weddings & Galas');
  });

  test('passes an unmapped category through unchanged rather than dropping it', () => {
    expect(toPlanner(makeRow({ categories: ['weddings', 'unmapped_category'] })).type).toBe(
      'Weddings & unmapped_category'
    );
  });
});

test('services and packages reshape planner_services with the documented field renames', () => {
  const planner = toPlanner(makeRow());

  expect(planner.services[0]).toEqual({
    name: 'Full Wedding Planning',
    desc: 'End-to-end planning.',
    from: 18000,
    seed: 0,
    imageUrl: null,
  });

  expect(planner.packages[0]).toEqual({
    name: 'Full Wedding Planning',
    note: 'End-to-end planning.',
    price: 18000,
  });
});
