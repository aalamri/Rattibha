import { canTransition, isTerminal, nextExpected } from './dealStateMachine';
import type { DealStatus } from './database.types';

describe('canTransition', () => {
  test.each<[DealStatus, DealStatus]>([
    ['request', 'offer_sent'],
    ['request', 'cancelled'],
    ['offer_sent', 'accepted'],
    ['offer_sent', 'declined'],
    ['offer_sent', 'cancelled'],
    ['accepted', 'countersigned'],
    ['accepted', 'cancelled'],
    ['countersigned', 'deposit_paid'],
    ['countersigned', 'cancelled'],
    ['deposit_paid', 'completed'],
    ['completed', 'reviewed'],
  ])('allows every mapped transition: %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  test.each<[DealStatus, DealStatus]>([
    ['request', 'completed'],
    ['offer_sent', 'deposit_paid'],
    ['accepted', 'reviewed'],
    ['completed', 'accepted'],
  ])('blocks transitions not in the map: %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  test('cancellation override allows a transition the plain map does not list', () => {
    // TRANSITIONS.deposit_paid is ['completed'] only — no 'cancelled' entry.
    // This only passes because of canTransition's special-case override for
    // cancelling from any non-terminal state. Without that override, this
    // specific case would incorrectly return false.
    expect(canTransition('deposit_paid', 'cancelled')).toBe(true);
  });

  test.each<DealStatus>(['declined', 'cancelled', 'reviewed'])(
    'cancellation override does not apply to terminal state: %s -> cancelled',
    (from) => {
      expect(canTransition(from, 'cancelled')).toBe(false);
    }
  );
});

describe('isTerminal', () => {
  test.each<DealStatus>(['declined', 'cancelled', 'reviewed'])('%s is terminal', (status) => {
    expect(isTerminal(status)).toBe(true);
  });

  test.each<DealStatus>([
    'request',
    'offer_sent',
    'accepted',
    'countersigned',
    'deposit_paid',
    'completed',
  ])('%s is not terminal', (status) => {
    expect(isTerminal(status)).toBe(false);
  });
});

describe('nextExpected', () => {
  test.each<[DealStatus, DealStatus]>([
    ['request', 'offer_sent'],
    ['offer_sent', 'accepted'],
    ['accepted', 'countersigned'],
    ['countersigned', 'deposit_paid'],
    ['deposit_paid', 'completed'],
    ['completed', 'reviewed'],
  ])('%s expects %s next', (status, expected) => {
    expect(nextExpected(status)).toBe(expected);
  });

  test.each<DealStatus>(['reviewed', 'declined', 'cancelled'])(
    '%s has no next expected status',
    (status) => {
      expect(nextExpected(status)).toBeNull();
    }
  );
});
