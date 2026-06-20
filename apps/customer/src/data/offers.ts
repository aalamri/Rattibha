import { PLANNERS, type CityKey, type Planner } from './planners';

export interface Offer {
  planner: Planner;
  price: number;
  hoursAgo: number;
  /** Planner's pitch message — listing content, not translated (see CLAUDE.md). */
  pitch: string;
  shortlisted?: boolean;
}

/** Mock quote pitches — ported from `pitches` in screens6.jsx ProposalsScreen. */
const PITCHES: Array<{ price: number; hoursAgo: number; pitch: string }> = [
  { price: 18000, hoursAgo: 2, pitch: 'We’d love to craft your celebration — full planning included.' },
  { price: 21500, hoursAgo: 4, pitch: 'Premium production team with in-house florals and lighting.' },
  { price: 15200, hoursAgo: 6, pitch: 'Intimate, romantic styling tailored to your budget.' },
  { price: 13800, hoursAgo: 8, pitch: 'Creative, colourful styling with great value packages.' },
];

/** Planners in the same city as the request respond with competing quotes. */
export function getOffersForCity(city: CityKey): Offer[] {
  const cityPlanners = PLANNERS.filter((p) => p.city === city);
  return cityPlanners.map((planner, i) => ({
    planner,
    ...PITCHES[i % PITCHES.length],
    shortlisted: i === 0,
  }));
}
