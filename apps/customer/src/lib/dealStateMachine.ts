import type { DealStatus } from './database.types';

const TRANSITIONS: Partial<Record<DealStatus, DealStatus[]>> = {
  request:      ['offer_sent', 'cancelled'],
  offer_sent:   ['accepted', 'declined', 'cancelled'],
  accepted:     ['countersigned', 'cancelled'],
  countersigned:['deposit_paid', 'cancelled'],
  deposit_paid: ['completed'],
  completed:    ['reviewed'],
};

export function canTransition(from: DealStatus, to: DealStatus): boolean {
  if (to === 'cancelled' && !['declined', 'cancelled', 'reviewed'].includes(from)) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: DealStatus): boolean {
  return ['declined', 'cancelled', 'reviewed'].includes(status);
}

export function nextExpected(status: DealStatus): DealStatus | null {
  const next = TRANSITIONS[status];
  return next?.[0] ?? null;
}
