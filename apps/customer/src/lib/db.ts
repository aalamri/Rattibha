/**
 * DB row shapes for nested Supabase queries and a mapper that converts them
 * to the existing mock `Planner` shape used by all UI components.
 * Keeps component changes to zero while switching from mock to real data.
 */
import type { Planner, PlannerPackage, PlannerService } from '@/data/planners';

// Category label map (listing content — not translated per CLAUDE.md).
const CAT_LABEL: Record<string, string> = {
  weddings: 'Weddings',
  galas: 'Galas',
  corporate: 'Corporate',
  birthdays: 'Birthdays',
  engagements: 'Engagements',
};

// ─── nested row types ────────────────────────────────────────────────────────

export interface DBService {
  id: string;
  name: string;
  description: string | null;
  from_price: number;
  seed: number;
  image_url: string | null;
}

export interface DBReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
}

export interface DBPlannerRow {
  user_id: string;
  business_name: string;
  bio: string | null;
  city: string;
  categories: string[];
  verified: boolean;
  tier: string;
  rating: number;
  reviews_count: number;
  instagram: string | null;
  website: string | null;
  portfolio_urls: string[] | null;
  profiles: { avatar_seed: number } | null;
  planner_services: DBService[];
}

export interface DBOfferRow {
  id: string;
  request_id: string;
  planner_id: string;
  package: string;
  price: number;
  message: string | null;
  status: string;
  deal_status: string;
  created_at: string;
  planners: DBPlannerRow | null;
}

export interface DBRequestRow {
  id: string;
  customer_id: string;
  category: string;
  city: string;
  event_date: string;
  guests: number;
  budget: string;
  note: string | null;
  status: string;
  created_at: string;
  offers: { id: string; status: string; contracts: { bookings: { id: string }[] }[] }[];
}

export interface DBBookingRow {
  id: string;
  contract_id: string;
  stage: string;
  event_date: string;
  contracts: {
    id: string;
    ref: string;
    payments: { type: string; amount: number; status: string }[];
    offers: {
      id: string;
      price: number;
      package: string;
      requests: {
        category: string;
        city: string;
        guests: number;
      } | null;
      planners: {
        business_name: string;
        profiles: { avatar_seed: number } | null;
      } | null;
    } | null;
  } | null;
}

// ─── mapper ──────────────────────────────────────────────────────────────────

export function toPlanner(row: DBPlannerRow): Planner {
  const seed = row.profiles?.avatar_seed ?? 0;

  const services: PlannerService[] = row.planner_services.map((s) => ({
    name: s.name,
    desc: s.description ?? '',
    from: s.from_price,
    seed: s.seed,
    imageUrl: s.image_url,
  }));

  // Packages reuse the same service rows (name, price, description).
  const packages: PlannerPackage[] = row.planner_services.map((s) => ({
    name: s.name,
    note: s.description ?? '',
    price: s.from_price,
  }));

  const minPrice =
    row.planner_services.length > 0
      ? Math.min(...row.planner_services.map((s) => s.from_price))
      : 0;

  const typeLabel = row.categories.map((c) => CAT_LABEL[c] ?? c).join(' & ');

  return {
    id: row.user_id,
    name: row.business_name,
    city: row.city as Planner['city'],
    type: typeLabel,
    rating: row.rating,
    events: row.reviews_count,
    premium: row.tier.toLowerCase() !== 'essentials',
    verified: row.verified,
    from: minPrice,
    seed,
    blurb: row.bio ?? '',
    tags: row.categories,
    services,
    packages,
    portfolioUrls: row.portfolio_urls ?? [],
  };
}

/** Supabase select string for a full planner (includes services + profile seed). */
export const PLANNER_SELECT =
  '*, profiles(avatar_seed), planner_services(id, name, description, from_price, seed, image_url)' as const;
